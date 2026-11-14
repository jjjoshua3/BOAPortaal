-- Mailaudit, adresboek en tweestaps voor mail.boaportaal.nl.
-- Eén keer draaien in de Supabase SQL Editor.

alter table public.boa_inlog drop constraint if exists boa_inlog_bron_check;
alter table public.boa_inlog
  add constraint boa_inlog_bron_check
  check (bron in ('portaal', 'systeem', 'servicedesk', 'mail'));

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
  local text := lower(split_part(trim(coalesce(p_email, '')), '@', 1));
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'alleen het systeem';
  end if;
  if bron not in ('portaal', 'systeem', 'servicedesk', 'mail') then
    raise exception 'onbekende bron';
  end if;
  if uitkomst not in ('geslaagd', 'mislukt') then
    raise exception 'onbekende uitkomst';
  end if;
  if uid is null and length(trim(coalesce(p_email, ''))) > 3 and bron <> 'mail' then
    select id into uid from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  end if;
  if bron = 'mail' then
    if local ~ '^bp-[0-9]{4}-[a-z]{2}$' then
      cid := upper(local);
      select i.user_id, i.pv_naam into uid, naam
      from public.boa_identiteit i
      where i.client_id = cid;
    else
      cid := local;
    end if;
    insert into public.boa_inlog (user_id, client_id, pv_naam, bron, resultaat, ip)
    values (uid, coalesce(cid, ''), coalesce(naam, ''), bron, uitkomst, adres);
    return;
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

create or replace function public.boa_mail_gebeurtenis(
  p_local text,
  p_soort text,
  p_reden text,
  p_resultaat text,
  p_ip text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  local text := lower(trim(coalesce(p_local, '')));
  soort text := upper(trim(coalesce(p_soort, '')));
  cid text := case when local ~ '^bp-[0-9]{4}-[a-z]{2}$' then upper(local) else local end;
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'alleen het systeem';
  end if;
  if local !~ '^[a-z0-9][a-z0-9._-]{0,62}$' then
    raise exception 'onbekende postbus';
  end if;
  if soort = 'MAIL_LOGIN' then
    perform public.boa_inlog_vastleggen(
      null,
      local || '@boaportaal.nl',
      'mail',
      case when lower(coalesce(p_resultaat, '')) = 'geslaagd' then 'geslaagd' else 'mislukt' end,
      coalesce(p_ip, '')
    );
    return;
  end if;
  if soort not in ('MAIL_VERZONDEN', 'MAIL_CLAIM', 'MAIL_UNCLAIM') then
    raise exception 'onbekende soort';
  end if;
  insert into public.boa_audit (
    beheerder_id, beheerder_naam, doel_client_id, doel_pv_naam, ticketnummer, reden, soort, niveau, bron
  )
  values (
    cid,
    local,
    '',
    '',
    '',
    left(coalesce(p_reden, ''), 240),
    soort,
    'INFO',
    'mail'
  );
end;
$$;

revoke all on function public.boa_mail_gebeurtenis(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.boa_mail_gebeurtenis(text, text, text, text, text) to service_role;

create table if not exists public.boa_mail_adres (
  local text primary key,
  voornaam text not null default '',
  achternaam text not null default '',
  zoek_naam boolean not null default false,
  bijgewerkt timestamptz not null default now()
);

create table if not exists public.boa_mail_totp (
  local text primary key,
  geheim text not null,
  bevestigd boolean not null default false,
  bijgewerkt timestamptz not null default now()
);

alter table public.boa_mail_adres enable row level security;
alter table public.boa_mail_totp enable row level security;
revoke all on public.boa_mail_adres from anon, authenticated;
revoke all on public.boa_mail_totp from anon, authenticated;
