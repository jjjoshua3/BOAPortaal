-- IAM, tickets en audit voor boaportaal.nl, servicedesk en systeem.
-- Eenmalig in de Supabase SQL Editor. Daarna: service-role alleen als Netlify-env, nooit in de browser.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function public.boa_naar_pv(raw text)
returns text
language plpgsql
immutable
as $$
declare
  t text := trim(regexp_replace(coalesce(raw, ''), '\s+', ' ', 'g'));
  parts text[];
  i int;
  start_achternaam int;
  achternaam text;
  init text := '';
  woord text;
  particles text[] := array['de','van','der','den','ten','ter','het','t'];
begin
  if t = '' then
    return 'ONBEKEND, .';
  end if;
  if position(',' in t) > 0 then
    achternaam := upper(trim(split_part(t, ',', 1)));
    woord := trim(split_part(t, ',', 2));
    if woord ~ '^[A-Za-z](\.[A-Za-z])*\.?$' then
      if right(woord, 1) <> '.' then
        woord := woord || '.';
      end if;
      return achternaam || ', ' || upper(woord);
    end if;
    t := trim(woord || ' ' || achternaam);
  end if;
  parts := regexp_split_to_array(t, '\s+');
  start_achternaam := array_length(parts, 1);
  while start_achternaam > 1 and lower(parts[start_achternaam - 1]) = any (particles) loop
    start_achternaam := start_achternaam - 1;
  end loop;
  achternaam := upper(array_to_string(parts[start_achternaam:array_length(parts, 1)], ' '));
  for i in 1..(start_achternaam - 1) loop
    woord := parts[i];
    if woord ~ '^[A-Za-z]\.?$' or woord ~ '^[A-Za-z](\.[A-Za-z])+\.?$' then
      init := init || upper(replace(woord, '.', '')) || '.';
    else
      init := init || upper(left(woord, 1)) || '.';
    end if;
  end loop;
  if init = '' then
    init := '.';
  end if;
  return achternaam || ', ' || init;
end;
$$;

create or replace function public.boa_nieuwe_client_id()
returns text
language plpgsql
as $$
declare
  kandidaat text;
  poging int := 0;
begin
  loop
    poging := poging + 1;
    kandidaat := 'BP-'
      || lpad((floor(random() * 10000))::int::text, 4, '0')
      || '-'
      || chr(65 + floor(random() * 26)::int)
      || chr(65 + floor(random() * 26)::int);
    exit when not exists (select 1 from public.boa_identiteit where client_id = kandidaat)
      and not exists (select 1 from public.boa_medewerker where client_id = kandidaat);
    if poging > 30 then
      raise exception 'Client-ID kon niet worden uitgegeven';
    end if;
  end loop;
  return kandidaat;
end;
$$;

create table if not exists public.boa_identiteit (
  user_id uuid primary key references auth.users (id) on delete cascade,
  client_id text not null unique,
  pv_naam text not null,
  organisatie text not null default '',
  locked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.boa_medewerker (
  user_id uuid primary key references auth.users (id) on delete cascade,
  client_id text not null unique,
  pv_naam text not null,
  rol text not null check (rol in ('support', 'beheerder')),
  actief boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.boa_ticket (
  id uuid primary key default gen_random_uuid(),
  nummer text not null unique,
  indiener_id uuid references auth.users (id) on delete set null,
  client_id text not null default '',
  pv_naam text not null,
  organisatie text not null default '',
  categorie text not null,
  prioriteit text not null default 'P3' check (prioriteit in ('P1', 'P2', 'P3', 'P4')),
  status text not null default 'Nieuw',
  onderwerp text not null,
  omschrijving text not null,
  lijn text not null default 'support' check (lijn in ('support', 'beheer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.boa_ticket_log (
  id bigint generated always as identity primary key,
  ticket_id uuid not null references public.boa_ticket (id) on delete cascade,
  moment timestamptz not null default now(),
  actor text not null,
  tekst text not null
);

create table if not exists public.boa_audit (
  id bigint generated always as identity primary key,
  moment timestamptz not null default now(),
  beheerder_id text not null,
  beheerder_naam text not null,
  doel_client_id text not null default '',
  doel_pv_naam text not null default '',
  ticketnummer text not null default '',
  reden text not null,
  soort text not null,
  niveau text not null default 'INFO' check (niveau in ('INFO', 'HIGH', 'CRITICAL'))
);

create table if not exists private.boa_reset_verzoek (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id text not null,
  aangevraagd_door uuid not null,
  verwerkt boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.boa_identiteit enable row level security;
alter table public.boa_medewerker enable row level security;
alter table public.boa_ticket enable row level security;
alter table public.boa_ticket_log enable row level security;
alter table public.boa_audit enable row level security;

drop policy if exists boa_identiteit_self on public.boa_identiteit;
create policy boa_identiteit_self on public.boa_identiteit
  for select to authenticated
  using (auth.uid() = user_id);

revoke all on public.boa_medewerker from anon, authenticated;
revoke all on public.boa_ticket from anon, authenticated;
revoke all on public.boa_ticket_log from anon, authenticated;
revoke all on public.boa_audit from anon, authenticated;

create or replace function public.boa_actor()
returns table (user_id uuid, client_id text, pv_naam text, rol text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;
  return query
    select m.user_id, m.client_id, m.pv_naam, m.rol
    from public.boa_medewerker m
    where m.user_id = auth.uid() and m.actief;
end;
$$;

create or replace function public.boa_mijn_identiteit()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rij public.boa_identiteit%rowtype;
  meta text;
begin
  if uid is null then
    raise exception 'niet aangemeld';
  end if;
  select * into rij from public.boa_identiteit where user_id = uid;
  if not found then
    meta := coalesce(auth.jwt() -> 'user_metadata' ->> 'naam', '');
    insert into public.boa_identiteit (user_id, client_id, pv_naam)
    values (uid, public.boa_nieuwe_client_id(), public.boa_naar_pv(meta))
    returning * into rij;
  end if;
  return jsonb_build_object(
    'client_id', rij.client_id,
    'pv_naam', rij.pv_naam,
    'organisatie', rij.organisatie,
    'locked', rij.locked
  );
end;
$$;

create or replace function public.boa_zet_pv_naam(p_naam text, p_organisatie text default null)
returns jsonb
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
  perform public.boa_mijn_identiteit();
  update public.boa_identiteit
    set pv_naam = public.boa_naar_pv(p_naam),
        organisatie = coalesce(p_organisatie, organisatie)
    where user_id = uid;
  return public.boa_mijn_identiteit();
end;
$$;

create or replace function public.boa_ticket_nummer()
returns text
language plpgsql
as $$
declare
  kandidaat text;
  poging int := 0;
begin
  loop
    poging := poging + 1;
    kandidaat := 'M' || to_char(now() at time zone 'Europe/Amsterdam', 'YYMM')
      || '-' || lpad((floor(random() * 10000))::int::text, 4, '0');
    exit when not exists (select 1 from public.boa_ticket where nummer = kandidaat);
    if poging > 20 then
      raise exception 'ticketnummer mislukt';
    end if;
  end loop;
  return kandidaat;
end;
$$;

create or replace function public.boa_ticket_indienen(
  p_categorie text,
  p_onderwerp text,
  p_omschrijving text,
  p_prioriteit text default 'P3',
  p_client_id text default '',
  p_pv_naam text default '',
  p_organisatie text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  ident jsonb;
  cid text;
  naam text;
  org text;
  prio text;
  num text;
  tid uuid;
begin
  if length(trim(coalesce(p_onderwerp, ''))) < 3 or length(trim(coalesce(p_omschrijving, ''))) < 5 then
    raise exception 'Onderwerp en omschrijving zijn verplicht.';
  end if;
  if p_categorie not in (
    'Wachtwoord vergeten / Reset werkt niet',
    'Account is vergrendeld (Locked)',
    'Nieuw werk-/schooldomein aanvragen',
    'Foutieve feitcode / Wetswijziging doorgeven',
    'Overige technische storing'
  ) then
    raise exception 'Onbekende categorie.';
  end if;
  prio := case when p_prioriteit in ('P1','P2','P3','P4') then p_prioriteit else 'P3' end;
  if uid is not null then
    ident := public.boa_mijn_identiteit();
    cid := ident ->> 'client_id';
    naam := ident ->> 'pv_naam';
    org := coalesce(nullif(trim(p_organisatie), ''), ident ->> 'organisatie', '');
  else
    cid := upper(trim(coalesce(p_client_id, '')));
    naam := public.boa_naar_pv(p_pv_naam);
    org := trim(coalesce(p_organisatie, ''));
    if naam = 'ONBEKEND, .' or length(org) < 2 then
      raise exception 'PV-naam en organisatie zijn verplicht.';
    end if;
  end if;
  num := public.boa_ticket_nummer();
  insert into public.boa_ticket (nummer, indiener_id, client_id, pv_naam, organisatie, categorie, prioriteit, status, onderwerp, omschrijving, lijn)
  values (num, uid, cid, naam, org, p_categorie, prio, 'Nieuw', trim(p_onderwerp), trim(p_omschrijving), 'support')
  returning id into tid;
  insert into public.boa_ticket_log (ticket_id, actor, tekst)
  values (tid, naam || ' ' || cid, 'Ticket aangemaakt. Categorie: ' || p_categorie || '.');
  return jsonb_build_object('nummer', num, 'status', 'Nieuw');
end;
$$;

create or replace function public.boa_mijn_tickets()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'niet aangemeld';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'nummer', t.nummer,
      'client_id', t.client_id,
      'pv_naam', t.pv_naam,
      'categorie', t.categorie,
      'prioriteit', t.prioriteit,
      'status', t.status,
      'onderwerp', t.onderwerp,
      'omschrijving', t.omschrijving,
      'lijn', t.lijn,
      'created_at', t.created_at
    ) order by t.created_at desc)
    from public.boa_ticket t
    where t.indiener_id = uid
  ), '[]'::jsonb);
end;
$$;

create or replace function public.boa_ticket_detail(p_nummer text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  t public.boa_ticket%rowtype;
  actor record;
  logs jsonb;
begin
  if uid is null then
    raise exception 'niet aangemeld';
  end if;
  select * into t from public.boa_ticket where nummer = upper(trim(p_nummer));
  if not found then
    raise exception 'Ticket niet gevonden.';
  end if;
  select * into actor from public.boa_actor();
  if actor.user_id is null and t.indiener_id is distinct from uid then
    raise exception 'Geen toegang tot dit ticket.';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'moment', l.moment, 'actor', l.actor, 'tekst', l.tekst
  ) order by l.moment), '[]'::jsonb) into logs
  from public.boa_ticket_log l where l.ticket_id = t.id;
  return jsonb_build_object(
    'nummer', t.nummer,
    'client_id', t.client_id,
    'pv_naam', t.pv_naam,
    'organisatie', t.organisatie,
    'categorie', t.categorie,
    'prioriteit', t.prioriteit,
    'status', t.status,
    'onderwerp', t.onderwerp,
    'omschrijving', t.omschrijving,
    'lijn', t.lijn,
    'created_at', t.created_at,
    'log', logs
  );
end;
$$;

create or replace function public.boa_ticket_reageren(p_nummer text, p_tekst text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  t public.boa_ticket%rowtype;
  actor record;
  wie text;
begin
  if length(trim(coalesce(p_tekst, ''))) < 2 then
    raise exception 'Reactie is leeg.';
  end if;
  select * into t from public.boa_ticket where nummer = upper(trim(p_nummer));
  if not found then
    raise exception 'Ticket niet gevonden.';
  end if;
  select * into actor from public.boa_actor();
  if actor.user_id is null and t.indiener_id is distinct from uid then
    raise exception 'Geen toegang.';
  end if;
  if actor.user_id is not null then
    wie := actor.rol || ' ' || actor.client_id;
  else
    wie := t.pv_naam || ' ' || t.client_id;
  end if;
  insert into public.boa_ticket_log (ticket_id, actor, tekst) values (t.id, wie, trim(p_tekst));
  if actor.user_id is null then
    update public.boa_ticket set status = 'In behandeling (Support)', updated_at = now()
      where id = t.id and status = 'Wacht op Indiener';
  end if;
  return public.boa_ticket_detail(t.nummer);
end;
$$;

create or replace function public.boa_wachtrij(p_lijn text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor record;
begin
  select * into actor from public.boa_actor();
  if actor.user_id is null then
    raise exception 'Alleen voor behandelaars.';
  end if;
  if p_lijn = 'beheer' and actor.rol <> 'beheerder' and actor.rol <> 'support' then
    raise exception 'Geen toegang.';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'nummer', t.nummer,
      'client_id', t.client_id,
      'pv_naam', t.pv_naam,
      'categorie', t.categorie,
      'prioriteit', t.prioriteit,
      'status', t.status,
      'onderwerp', t.onderwerp,
      'lijn', t.lijn,
      'created_at', t.created_at
    ) order by t.created_at desc)
    from public.boa_ticket t
    where (p_lijn = 'alle')
       or (p_lijn = 'support' and t.lijn = 'support' and t.status not in ('Opgelost / Gesloten'))
       or (p_lijn = 'beheer' and t.lijn = 'beheer' and t.status not in ('Opgelost / Gesloten'))
       or (p_lijn = 'gesloten' and t.status = 'Opgelost / Gesloten')
  ), '[]'::jsonb);
end;
$$;

create or replace function public.boa_ticket_status(p_nummer text, p_status text, p_notitie text default '')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor record;
  t public.boa_ticket%rowtype;
  toegestaan text[] := array[
    'Nieuw',
    'In behandeling (Support)',
    'Doorgezet naar Beheer',
    'Wacht op Indiener',
    'Opgelost / Gesloten'
  ];
begin
  select * into actor from public.boa_actor();
  if actor.user_id is null then
    raise exception 'Alleen voor behandelaars.';
  end if;
  if not (p_status = any (toegestaan)) then
    raise exception 'Ongeldige status.';
  end if;
  select * into t from public.boa_ticket where nummer = upper(trim(p_nummer));
  if not found then
    raise exception 'Ticket niet gevonden.';
  end if;
  if p_status = 'Doorgezet naar Beheer' then
    if length(trim(coalesce(p_notitie, ''))) < 8 then
      raise exception 'Overdrachtsnotitie is verplicht.';
    end if;
    if actor.rol <> 'support' and actor.rol <> 'beheerder' then
      raise exception 'Geen toegang.';
    end if;
    update public.boa_ticket
      set status = p_status, lijn = 'beheer', updated_at = now()
      where id = t.id;
    insert into public.boa_ticket_log (ticket_id, actor, tekst)
    values (
      t.id,
      actor.rol || ' ' || actor.client_id,
      to_char(now() at time zone 'Europe/Amsterdam', 'DD-MM-YYYY HH24:MI')
        || ' | Ticket doorgezet van [Support ' || actor.client_id || '] naar [Beheer] - Reden: ' || trim(p_notitie)
    );
  else
    if t.lijn = 'beheer' and actor.rol <> 'beheerder' and p_status <> 'Wacht op Indiener' then
      raise exception 'Dit ticket ligt bij beheer.';
    end if;
    update public.boa_ticket set status = p_status, updated_at = now() where id = t.id;
    insert into public.boa_ticket_log (ticket_id, actor, tekst)
    values (
      t.id,
      actor.rol || ' ' || actor.client_id,
      'Status van ' || t.status || ' naar ' || p_status
        || case when length(trim(coalesce(p_notitie, ''))) > 0 then '. ' || trim(p_notitie) else '' end
    );
  end if;
  return public.boa_ticket_detail(t.nummer);
end;
$$;

create or replace function public.boa_audit_schrijf(
  p_soort text,
  p_niveau text,
  p_reden text,
  p_doel_client text,
  p_doel_naam text,
  p_ticket text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor record;
begin
  select * into actor from public.boa_actor();
  if actor.user_id is null then
    raise exception 'Alleen voor behandelaars.';
  end if;
  insert into public.boa_audit (beheerder_id, beheerder_naam, doel_client_id, doel_pv_naam, ticketnummer, reden, soort, niveau)
  values (actor.client_id, actor.pv_naam, coalesce(p_doel_client, ''), coalesce(p_doel_naam, ''), coalesce(p_ticket, ''), p_reden, p_soort, p_niveau);
end;
$$;

create or replace function public.boa_zoek_account(p_sleutel text, p_reden text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor record;
  sleutel text := upper(trim(coalesce(p_sleutel, '')));
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
  if sleutel !~ '^BP-[0-9]{4}-[A-Z]{2}$' and sleutel !~ '^M[0-9]{4}-[0-9]{4}$' then
    raise exception 'Alleen een Client-ID of ticketnummer.';
  end if;
  if sleutel ~ '^M' then
    select i.user_id, i.client_id, i.pv_naam, i.organisatie, i.locked, t.nummer as ticket
      into rij
    from public.boa_ticket t
    left join public.boa_identiteit i on i.client_id = t.client_id
    where t.nummer = sleutel
    limit 1;
    if not found then
      raise exception 'Geen dossier bij dit ticket.';
    end if;
  else
    select i.user_id, i.client_id, i.pv_naam, i.organisatie, i.locked, ''::text as ticket
      into rij
    from public.boa_identiteit i
    where i.client_id = sleutel;
    if not found then
      raise exception 'Geen dossier bij deze Client-ID.';
    end if;
  end if;
  perform public.boa_audit_schrijf('INZAGE', 'INFO', trim(p_reden), coalesce(rij.client_id, ''), coalesce(rij.pv_naam, ''), case when sleutel ~ '^M' then sleutel else '' end);
  select coalesce(jsonb_object_agg(v.kind, v.aantal), '{}'::jsonb) into kluis
  from (
    select kind, count(*) as aantal
    from public.boa_vault
    where user_id = rij.user_id
    group by kind
  ) v;
  return jsonb_build_object(
    'client_id', coalesce(rij.client_id, ''),
    'pv_naam', coalesce(rij.pv_naam, ''),
    'organisatie', coalesce(rij.organisatie, ''),
    'locked', coalesce(rij.locked, false),
    'reden', trim(p_reden),
    'beheerder', actor.client_id,
    'beheerder_naam', actor.pv_naam,
    'moment', to_char(now() at time zone 'Europe/Amsterdam', 'DD-MM-YYYY HH24:MI'),
    'kluis', coalesce(kluis, '{}'::jsonb),
    'laatste_sync', (
      select max(updated_at) from public.boa_vault where user_id = rij.user_id
    )
  );
end;
$$;

create or replace function public.boa_nood_email(p_email text, p_reden text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  actor record;
  uid uuid;
begin
  select * into actor from public.boa_actor();
  if actor.rol is distinct from 'beheerder' then
    raise exception 'Nood-opvraag is alleen voor de hoofdbeheerder.';
  end if;
  if position('@' in coalesce(p_email, '')) < 2 then
    raise exception 'Geen geldig adres.';
  end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email));
  if uid is null then
    perform public.boa_audit_schrijf('BREAK_GLASS', 'HIGH', trim(p_reden) || ' | geen treffer', '', '', '');
    raise exception 'Geen dossier.';
  end if;
  if not exists (select 1 from public.boa_identiteit where user_id = uid) then
    insert into public.boa_identiteit (user_id, client_id, pv_naam)
    values (uid, public.boa_nieuwe_client_id(), 'ONBEKEND, .');
  end if;
  perform public.boa_audit_schrijf(
    'BREAK_GLASS', 'HIGH', trim(p_reden),
    (select client_id from public.boa_identiteit where user_id = uid),
    (select pv_naam from public.boa_identiteit where user_id = uid),
    ''
  );
  return public.boa_zoek_account((select client_id from public.boa_identiteit where user_id = uid), trim(p_reden));
end;
$$;

create or replace function public.boa_reset_aanvragen(p_client_id text, p_reden text)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  actor record;
  uid uuid;
  vid uuid;
begin
  select * into actor from public.boa_actor();
  if actor.user_id is null then
    raise exception 'Alleen voor behandelaars.';
  end if;
  select user_id into uid from public.boa_identiteit where client_id = upper(trim(p_client_id));
  if uid is null then
    raise exception 'Onbekende Client-ID.';
  end if;
  insert into private.boa_reset_verzoek (user_id, client_id, aangevraagd_door)
  values (uid, upper(trim(p_client_id)), actor.user_id)
  returning id into vid;
  perform public.boa_audit_schrijf('RESET', 'INFO', coalesce(nullif(trim(p_reden), ''), 'Automatische wachtwoord-reset'), upper(trim(p_client_id)), (select pv_naam from public.boa_identiteit where user_id = uid), '');
  return jsonb_build_object('verzoek', vid, 'verzonden', false);
end;
$$;

create or replace function public.boa_account_locked(p_client_id text, p_locked boolean, p_reden text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor record;
begin
  select * into actor from public.boa_actor();
  if actor.rol is distinct from 'beheerder' then
    raise exception 'Ontgrendelen en vergrendelen is alleen voor de hoofdbeheerder.';
  end if;
  if length(trim(coalesce(p_reden, ''))) < 12 then
    raise exception 'Reden is verplicht (minimaal 12 tekens).';
  end if;
  update public.boa_identiteit set locked = p_locked where client_id = upper(trim(p_client_id));
  if not found then
    raise exception 'Onbekende Client-ID.';
  end if;
  perform public.boa_audit_schrijf(
    'CRITICAL_AUTH_CHANGE', 'CRITICAL', trim(p_reden),
    upper(trim(p_client_id)),
    (select pv_naam from public.boa_identiteit where client_id = upper(trim(p_client_id))),
    ''
  );
  return public.boa_zoek_account(upper(trim(p_client_id)), trim(p_reden));
end;
$$;

create or replace function public.boa_audit_lijst()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor record;
begin
  select * into actor from public.boa_actor();
  if actor.user_id is null then
    raise exception 'Alleen voor behandelaars.';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'moment', a.moment,
      'beheerder_id', a.beheerder_id,
      'beheerder_naam', a.beheerder_naam,
      'doel_client_id', a.doel_client_id,
      'doel_pv_naam', a.doel_pv_naam,
      'ticketnummer', a.ticketnummer,
      'reden', a.reden,
      'soort', a.soort,
      'niveau', a.niveau
    ) order by a.moment desc)
    from public.boa_audit a
  ), '[]'::jsonb);
end;
$$;

create or replace function public.boa_ik()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor record;
  ident jsonb;
begin
  if auth.uid() is null then
    return jsonb_build_object('aangemeld', false);
  end if;
  ident := public.boa_mijn_identiteit();
  select * into actor from public.boa_actor();
  return ident || jsonb_build_object(
    'aangemeld', true,
    'rol', coalesce(actor.rol, 'indiener'),
    'medewerker', actor.user_id is not null
  );
end;
$$;

revoke all on function public.boa_nieuwe_client_id() from public, anon, authenticated;
revoke all on function public.boa_ticket_nummer() from public, anon, authenticated;
revoke all on function public.boa_audit_schrijf(text, text, text, text, text, text) from public, anon, authenticated;

grant execute on function public.boa_naar_pv(text) to anon, authenticated;
grant execute on function public.boa_mijn_identiteit() to authenticated;
grant execute on function public.boa_zet_pv_naam(text, text) to authenticated;
grant execute on function public.boa_ticket_indienen(text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.boa_mijn_tickets() to authenticated;
grant execute on function public.boa_ticket_detail(text) to authenticated;
grant execute on function public.boa_ticket_reageren(text, text) to authenticated;
grant execute on function public.boa_wachtrij(text) to authenticated;
grant execute on function public.boa_ticket_status(text, text, text) to authenticated;
grant execute on function public.boa_zoek_account(text, text) to authenticated;
grant execute on function public.boa_nood_email(text, text) to authenticated;
grant execute on function public.boa_reset_aanvragen(text, text) to authenticated;
grant execute on function public.boa_account_locked(text, boolean, text) to authenticated;
grant execute on function public.boa_audit_lijst() to authenticated;
grant execute on function public.boa_ik() to authenticated;

create or replace function public.boa_reset_open(p_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  uid uuid;
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'alleen het systeem';
  end if;
  select user_id into uid from private.boa_reset_verzoek where id = p_id and not verwerkt;
  if uid is null then
    raise exception 'geen openstaand verzoek';
  end if;
  return uid;
end;
$$;

create or replace function public.boa_reset_klaar(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'alleen het systeem';
  end if;
  update private.boa_reset_verzoek set verwerkt = true where id = p_id;
end;
$$;

revoke all on function public.boa_reset_open(uuid) from public, anon, authenticated;
revoke all on function public.boa_reset_klaar(uuid) from public, anon, authenticated;
grant execute on function public.boa_reset_open(uuid) to service_role;
grant execute on function public.boa_reset_klaar(uuid) to service_role;

