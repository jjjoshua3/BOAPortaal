-- Inlogaudit, 30-dagen dossier en filterbaar overzicht.
-- Draai dit één keer in de Supabase SQL Editor.

alter table public.boa_audit add column if not exists bron text not null default 'systeem';

create table if not exists public.boa_inlog (
  id bigint generated always as identity primary key,
  moment timestamptz not null default now(),
  user_id uuid,
  client_id text not null default '',
  pv_naam text not null default '',
  bron text not null check (bron in ('portaal', 'systeem', 'servicedesk')),
  resultaat text not null check (resultaat in ('geslaagd', 'mislukt')),
  ip text not null default ''
);

create index if not exists boa_inlog_moment on public.boa_inlog (moment desc);
create index if not exists boa_inlog_client on public.boa_inlog (client_id);

alter table public.boa_inlog enable row level security;
revoke all on public.boa_inlog from anon, authenticated;

create or replace function public.boa_inlog_vastleggen(
  p_user uuid,
  p_email text,
  p_bron text,
  p_resultaat text,
  p_ip text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := p_user;
  cid text := '';
  naam text := '';
  bron text := lower(trim(coalesce(p_bron, '')));
  uitkomst text := lower(trim(coalesce(p_resultaat, '')));
  adres text := left(regexp_replace(coalesce(p_ip, ''), '[^0-9a-fA-F:.]', '', 'g'), 64);
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'alleen het systeem';
  end if;
  if bron not in ('portaal', 'systeem', 'servicedesk') then
    raise exception 'onbekende bron';
  end if;
  if uitkomst not in ('geslaagd', 'mislukt') then
    raise exception 'onbekende uitkomst';
  end if;
  if uid is null and length(trim(coalesce(p_email, ''))) > 3 then
    select id into uid from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  end if;
  if uid is not null then
    select i.client_id, i.pv_naam into cid, naam
    from public.boa_identiteit i
    where i.user_id = uid;
  end if;
  if uid is null and uitkomst = 'mislukt' then
    insert into public.boa_inlog (user_id, client_id, pv_naam, bron, resultaat, ip)
    values (null, '', '', bron, uitkomst, adres);
    return;
  end if;
  if uid is null then
    return;
  end if;
  insert into public.boa_inlog (user_id, client_id, pv_naam, bron, resultaat, ip)
  values (uid, coalesce(cid, ''), coalesce(naam, ''), bron, uitkomst, adres);
end;
$$;

revoke all on function public.boa_inlog_vastleggen(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.boa_inlog_vastleggen(uuid, text, text, text, text) to service_role;

create or replace function public.boa_dossier_30(p_client_id text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  actor record;
  doel text := upper(trim(coalesce(p_client_id, '')));
  mag_ip boolean;
begin
  select * into actor from public.boa_actor();
  if actor.user_id is null then
    raise exception 'Alleen voor behandelaars.';
  end if;
  mag_ip := actor.rol = 'beheerder';
  return jsonb_build_object(
    'ip_zichtbaar', mag_ip,
    'inlog', coalesce((
      select jsonb_agg(jsonb_build_object(
        'moment', l.moment,
        'bron', l.bron,
        'resultaat', l.resultaat,
        'ip', case when mag_ip then l.ip else '' end
      ) order by l.moment desc)
      from public.boa_inlog l
      where l.id in (
        select l2.id
        from public.boa_inlog l2
        join public.boa_identiteit i on i.user_id = l2.user_id
        where i.client_id = doel
          and l2.moment > now() - interval '30 days'
      )
    ), '[]'::jsonb),
    'handelingen', coalesce((
      select jsonb_agg(jsonb_build_object(
        'moment', a.moment,
        'bron', a.bron,
        'soort', a.soort,
        'niveau', a.niveau,
        'reden', a.reden,
        'beheerder', a.beheerder_naam || ' ' || a.beheerder_id,
        'ticket', a.ticketnummer,
        'rol_in_regel', case when a.beheerder_id = doel then 'uitgevoerd' else 'betreft dossier' end
      ) order by a.moment desc)
      from public.boa_audit a
      where a.moment > now() - interval '30 days'
        and (a.doel_client_id = doel or a.beheerder_id = doel)
    ), '[]'::jsonb)
  );
end;
$$;

grant execute on function public.boa_dossier_30(text) to authenticated;

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
