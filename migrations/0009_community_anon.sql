-- Anonieme communityposts. Eenmalig uitvoeren in de Supabase SQL Editor.
-- Per nieuw anoniem bericht een eigen code. Reacties van dezelfde auteur
-- op dat bericht houden die code. De code is opvraagbaar door systeembeheer.

alter table public.boa_community
  add column if not exists anoniem boolean not null default false,
  add column if not exists anon_code text;

create index if not exists boa_community_anon_code
  on public.boa_community (anon_code)
  where anon_code is not null;

create or replace function public.boa_anon_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  tekens text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  i int;
begin
  loop
    code := 'AN-';
    for i in 1..6 loop
      code := code || substr(tekens, 1 + floor(random() * length(tekens))::int, 1);
    end loop;
    exit when not exists (select 1 from public.boa_community where anon_code = code);
  end loop;
  return code;
end;
$$;

create or replace function public.boa_community_plaats(
  p_parent uuid,
  p_soort text,
  p_domein text,
  p_titel text,
  p_tekst text,
  p_anoniem boolean
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  parent public.boa_community%rowtype;
  root public.boa_community%rowtype;
  ident public.boa_identiteit%rowtype;
  anoniem boolean := coalesce(p_anoniem, false);
  code text;
  naam text;
  org text;
  soort text;
  nieuw uuid;
begin
  if uid is null then
    raise exception 'niet aangemeld';
  end if;
  if p_titel is null or length(trim(p_titel)) < 3 or length(trim(p_titel)) > 120
     or p_tekst is null or length(trim(p_tekst)) < 5 or length(trim(p_tekst)) > 1200 then
    raise exception 'Titel en tekst kloppen niet.';
  end if;
  if p_domein not in ('algemeen', 'I', 'II', 'III', 'IV', 'V', 'VI') then
    raise exception 'Kies een domein.';
  end if;
  if p_soort not in ('overleg', 'correctie') then
    raise exception 'Soort klopt niet.';
  end if;

  if p_parent is not null then
    select * into parent from public.boa_community where id = p_parent;
    if not found then
      raise exception 'Het bericht bestaat niet meer.';
    end if;
    root := parent;
    while root.parent_id is not null loop
      select * into root from public.boa_community where id = root.parent_id;
      if not found then
        raise exception 'Het bericht bestaat niet meer.';
      end if;
    end loop;
    if root.anoniem and root.user_id = uid then
      anoniem := true;
      code := root.anon_code;
    else
      anoniem := false;
      code := null;
    end if;
    soort := 'correctie';
  else
    soort := p_soort;
    if anoniem then
      code := public.boa_anon_code();
    end if;
  end if;

  if anoniem then
    naam := 'Anoniem';
    org := coalesce(code, 'Anoniem');
  else
    select * into ident from public.boa_identiteit where user_id = uid;
    naam := coalesce(nullif(ident.pv_naam, ''), 'collega');
    org := coalesce(nullif(ident.client_id, ''), '');
  end if;

  insert into public.boa_community (
    user_id, parent_id, soort, domein, titel, tekst, weergave, organisatie, anoniem, anon_code
  ) values (
    uid, p_parent, soort, p_domein, trim(p_titel), trim(p_tekst), naam, org, anoniem, code
  )
  returning id into nieuw;
  return nieuw;
end;
$$;

create or replace function public.boa_community_wis(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'niet aangemeld';
  end if;
  delete from public.boa_community where id = p_id and user_id = uid;
end;
$$;

create or replace view public.boa_community_zicht
with (security_invoker = false, security_barrier = true) as
select
  id,
  parent_id,
  soort,
  domein,
  titel,
  tekst,
  case when anoniem then 'Anoniem' else weergave end as weergave,
  case when anoniem then coalesce(anon_code, 'Anoniem') else organisatie end as organisatie,
  anoniem,
  case when anoniem then anon_code else null end as anon_code,
  created_at,
  (user_id = auth.uid()) as eigen
from public.boa_community;

create or replace function public.boa_anon_opzoek(p_code text, p_reden text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor record;
  code text := upper(trim(coalesce(p_code, '')));
  rij record;
  kluis jsonb;
begin
  select * into actor from public.boa_actor();
  if actor.user_id is null then
    raise exception 'Alleen voor systeembeheer.';
  end if;
  if length(trim(coalesce(p_reden, ''))) < 12 then
    raise exception 'Wettelijke/operationele reden is verplicht (minimaal 12 tekens).';
  end if;
  if code !~ '^AN-[A-Z2-9]{6}$' then
    raise exception 'Alleen een anonieme code, zoals AN-7K3Q9P.';
  end if;
  select c.user_id, c.titel, c.created_at, c.anon_code
    into rij
  from public.boa_community c
  where c.anon_code = code and c.parent_id is null
  limit 1;
  if not found then
    raise exception 'Geen anoniem bericht bij deze code.';
  end if;
  perform public.boa_audit_schrijf(
    'ANONIEM', 'INFO', trim(p_reden),
    coalesce((select client_id from public.boa_identiteit where user_id = rij.user_id), ''),
    coalesce((select pv_naam from public.boa_identiteit where user_id = rij.user_id), ''),
    code
  );
  select coalesce(jsonb_object_agg(v.kind, v.aantal), '{}'::jsonb) into kluis
  from (
    select kind, count(*) as aantal
    from public.boa_vault
    where user_id = rij.user_id
    group by kind
  ) v;
  return jsonb_build_object(
    'client_id', coalesce((select client_id from public.boa_identiteit where user_id = rij.user_id), ''),
    'pv_naam', coalesce((select pv_naam from public.boa_identiteit where user_id = rij.user_id), ''),
    'organisatie', coalesce((select organisatie from public.boa_identiteit where user_id = rij.user_id), ''),
    'locked', coalesce((select locked from public.boa_identiteit where user_id = rij.user_id), false),
    'reden', trim(p_reden),
    'beheerder', actor.client_id,
    'beheerder_naam', actor.pv_naam,
    'moment', to_char(now() at time zone 'Europe/Amsterdam', 'DD-MM-YYYY HH24:MI'),
    'kluis', coalesce(kluis, '{}'::jsonb),
    'laatste_sync', (select max(updated_at) from public.boa_vault where user_id = rij.user_id),
    'anon_code', code,
    'bericht', rij.titel,
    'geplaatst', to_char(rij.created_at at time zone 'Europe/Amsterdam', 'DD-MM-YYYY HH24:MI')
  );
end;
$$;

revoke all on function public.boa_anon_code() from public, anon, authenticated;
revoke all on function public.boa_community_plaats(uuid, text, text, text, text, boolean) from public, anon, authenticated;
revoke all on function public.boa_community_wis(uuid) from public, anon, authenticated;
revoke all on function public.boa_anon_opzoek(text, text) from public, anon, authenticated;

grant execute on function public.boa_community_plaats(uuid, text, text, text, text, boolean) to authenticated;
grant execute on function public.boa_community_wis(uuid) to authenticated;
grant execute on function public.boa_anon_opzoek(text, text) to authenticated;

revoke select, insert, update, delete on public.boa_community from anon, authenticated;
grant select on public.boa_community_zicht to authenticated;
