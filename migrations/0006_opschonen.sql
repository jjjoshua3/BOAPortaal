-- Houdt de database klein. Draai dit één keer na 0005.

create table if not exists private.boa_onderhoud (
  id int primary key,
  laatst timestamptz not null default 'epoch'
);

insert into private.boa_onderhoud (id, laatst) values (1, 'epoch')
on conflict (id) do nothing;

create or replace function public.boa_opschonen()
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  laatst timestamptz;
begin
  select o.laatst into laatst from private.boa_onderhoud o where o.id = 1 for update;
  if laatst > now() - interval '6 hours' then
    return;
  end if;
  update private.boa_onderhoud set laatst = now() where id = 1;

  delete from public.boa_inlog
  where moment < now() - interval '30 days'
     or (client_id = '' and moment < now() - interval '7 days');

  delete from public.boa_audit
  where (niveau = 'INFO' and moment < now() - interval '90 days')
     or (niveau = 'HIGH' and moment < now() - interval '180 days')
     or (niveau = 'CRITICAL' and moment < now() - interval '365 days');

  delete from public.boa_ticket_log l
  using public.boa_ticket t
  where l.ticket_id = t.id
    and t.status = 'Opgelost / Gesloten'
    and t.updated_at < now() - interval '90 days';

  delete from public.boa_ticket
  where status = 'Opgelost / Gesloten'
    and updated_at < now() - interval '90 days';

  delete from private.boa_reset_verzoek
  where verwerkt and created_at < now() - interval '14 days';
end;
$$;

revoke all on function public.boa_opschonen() from public, anon, authenticated;

create or replace function public.boa_wachtrij(p_lijn text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  actor record;
begin
  perform public.boa_opschonen();
  select * into actor from public.boa_actor();
  if actor.user_id is null then
    raise exception 'Alleen voor behandelaars.';
  end if;
  return jsonb_build_object(
    'support', (select count(*) from public.boa_ticket t where t.lijn = 'support' and t.status <> 'Opgelost / Gesloten'),
    'beheer', (select count(*) from public.boa_ticket t where t.lijn = 'beheer' and t.status <> 'Opgelost / Gesloten'),
    'gesloten', (select count(*) from public.boa_ticket t where t.status = 'Opgelost / Gesloten'),
    'items', coalesce((
      select jsonb_agg(x) from (
        select jsonb_build_object(
          'nummer', t.nummer,
          'client_id', t.client_id,
          'pv_naam', t.pv_naam,
          'categorie', t.categorie,
          'prioriteit', t.prioriteit,
          'status', t.status,
          'onderwerp', t.onderwerp,
          'lijn', t.lijn,
          'created_at', t.created_at
        ) as x
        from public.boa_ticket t
        where (p_lijn = 'support' and t.lijn = 'support' and t.status <> 'Opgelost / Gesloten')
           or (p_lijn = 'beheer' and t.lijn = 'beheer' and t.status <> 'Opgelost / Gesloten')
           or (p_lijn = 'gesloten' and t.status = 'Opgelost / Gesloten')
        order by case t.prioriteit when 'P1' then 1 when 'P2' then 2 when 'P3' then 3 else 4 end, t.created_at desc
        limit case when p_lijn = 'gesloten' then 40 else 200 end
      ) s
    ), '[]'::jsonb)
  );
end;
$$;

grant execute on function public.boa_wachtrij(text) to authenticated;

create or replace function public.boa_overzicht(
  p_bron text default '',
  p_soort text default '',
  p_niveau text default '',
  p_dagen int default 30,
  p_q text default ''
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  actor record;
  mag_ip boolean;
  dagen int := least(greatest(coalesce(p_dagen, 30), 1), 90);
  bron text := lower(trim(coalesce(p_bron, '')));
  soort text := upper(trim(coalesce(p_soort, '')));
  niveau text := upper(trim(coalesce(p_niveau, '')));
  q text := upper(trim(coalesce(p_q, '')));
begin
  perform public.boa_opschonen();
  select * into actor from public.boa_actor();
  if actor.user_id is null then
    raise exception 'Alleen voor behandelaars.';
  end if;
  mag_ip := actor.rol = 'beheerder';
  return jsonb_build_object(
    'ip_zichtbaar', mag_ip,
    'inlog', coalesce((
      select jsonb_agg(x) from (
        select jsonb_build_object(
          'moment', l.moment,
          'bron', l.bron,
          'resultaat', l.resultaat,
          'client_id', l.client_id,
          'pv_naam', l.pv_naam,
          'ip', case when mag_ip then l.ip else '' end
        ) as x
        from public.boa_inlog l
        where l.moment > now() - make_interval(days => dagen)
          and soort = ''
          and niveau = ''
          and (bron = '' or l.bron = bron)
          and (q = '' or l.client_id ilike '%' || q || '%' or l.pv_naam ilike '%' || q || '%')
        order by l.moment desc
        limit 400
      ) s
    ), '[]'::jsonb),
    'register', coalesce((
      select jsonb_agg(x) from (
        select jsonb_build_object(
          'moment', a.moment,
          'bron', a.bron,
          'beheerder_id', a.beheerder_id,
          'beheerder_naam', a.beheerder_naam,
          'doel_client_id', a.doel_client_id,
          'doel_pv_naam', a.doel_pv_naam,
          'ticketnummer', a.ticketnummer,
          'reden', a.reden,
          'soort', a.soort,
          'niveau', a.niveau
        ) as x
        from public.boa_audit a
        where a.moment > now() - make_interval(days => dagen)
          and (bron = '' or a.bron = bron)
          and (soort = '' or a.soort = soort)
          and (niveau = '' or a.niveau = niveau)
          and (
            q = ''
            or a.doel_client_id ilike '%' || q || '%'
            or a.beheerder_id ilike '%' || q || '%'
            or a.ticketnummer ilike '%' || q || '%'
          )
        order by a.moment desc
        limit 400
      ) s
    ), '[]'::jsonb)
  );
end;
$$;

grant execute on function public.boa_overzicht(text, text, text, int, text) to authenticated;
