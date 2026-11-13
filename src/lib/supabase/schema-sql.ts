export const SCHEMA_SQL = `
-- BOA Portaal. Eenmalig uitvoeren in de Supabase SQL Editor.
-- De browser versleutelt eerst met AES-GCM. Deze functies wikkelen die cijfertekst nog eens met pgcrypto.
create extension if not exists pgcrypto;

create schema if not exists private;

create table if not exists private.vault_key (
  id int primary key default 1 check (id = 1),
  key text not null
);

insert into private.vault_key (id, key)
values (1, encode(gen_random_bytes(32), 'hex'))
on conflict (id) do nothing;

revoke all on schema private from public, anon, authenticated;
revoke all on table private.vault_key from public, anon, authenticated;

create table if not exists public.boa_vault (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('notitie', 'favoriet', 'sjabloon', 'audit')),
  iv text not null,
  salt text not null,
  sealed bytea not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.boa_vault enable row level security;

drop policy if exists boa_vault_select on public.boa_vault;
create policy boa_vault_select on public.boa_vault
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists boa_vault_delete on public.boa_vault;
create policy boa_vault_delete on public.boa_vault
  for delete to authenticated
  using (auth.uid() = user_id);

create or replace function public.vault_put(
  p_id uuid,
  p_kind text,
  p_iv text,
  p_salt text,
  p_client_cipher text
) returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_key text;
begin
  if auth.uid() is null then
    raise exception 'niet aangemeld';
  end if;
  if p_kind not in ('notitie', 'favoriet', 'sjabloon', 'audit') then
    raise exception 'ongeldig soort';
  end if;
  select key into v_key from private.vault_key where id = 1;
  insert into public.boa_vault as v (id, user_id, kind, iv, salt, sealed)
  values (p_id, auth.uid(), p_kind, p_iv, p_salt, pgp_sym_encrypt(p_client_cipher, v_key))
  on conflict (id) do update
    set kind = excluded.kind,
        iv = excluded.iv,
        salt = excluded.salt,
        sealed = excluded.sealed,
        updated_at = now()
    where v.user_id = auth.uid();
end;
$$;

create or replace function public.vault_list()
returns table (id uuid, kind text, iv text, salt text, client_cipher text, updated_at timestamptz)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_key text;
begin
  if auth.uid() is null then
    raise exception 'niet aangemeld';
  end if;
  select key into v_key from private.vault_key where id = 1;
  return query
    select v.id, v.kind, v.iv, v.salt,
           convert_from(pgp_sym_decrypt(v.sealed, v_key), 'utf8'),
           v.updated_at
    from public.boa_vault v
    where v.user_id = auth.uid()
    order by v.updated_at desc;
end;
$$;

create or replace function public.vault_delete(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'niet aangemeld';
  end if;
  delete from public.boa_vault where id = p_id and user_id = auth.uid();
end;
$$;

revoke all on function public.vault_put(uuid, text, text, text, text) from public;
revoke all on function public.vault_list() from public;
revoke all on function public.vault_delete(uuid) from public;
grant execute on function public.vault_put(uuid, text, text, text, text) to authenticated;
grant execute on function public.vault_list() to authenticated;
grant execute on function public.vault_delete(uuid) to authenticated;

create or replace function public.delete_own_account()
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
  delete from public.boa_vault where user_id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

create table if not exists public.boa_community (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  soort text not null check (soort in ('overleg', 'correctie')),
  domein text not null,
  titel text not null,
  tekst text not null,
  weergave text not null,
  organisatie text not null,
  created_at timestamptz not null default now()
);

alter table public.boa_community enable row level security;

drop policy if exists boa_community_select on public.boa_community;
create policy boa_community_select on public.boa_community
  for select to authenticated
  using (true);

drop policy if exists boa_community_insert on public.boa_community;
create policy boa_community_insert on public.boa_community
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists boa_community_delete on public.boa_community;
create policy boa_community_delete on public.boa_community
  for delete to authenticated
  using (auth.uid() = user_id);

create or replace function public.reject_free_email()
returns trigger
language plpgsql
as $$
declare
  domain text := lower(split_part(new.email, '@', 2));
  blocked text[] := array[
    'gmail.com','googlemail.com','hotmail.com','hotmail.nl','outlook.com','outlook.nl',
    'live.nl','live.com','msn.com','icloud.com','me.com','mac.com','yahoo.com','yahoo.nl',
    'ziggo.nl','kpnmail.nl','planet.nl','hetnet.nl','protonmail.com','proton.me','pm.me',
    'gmx.com','gmx.nl','mailinator.com','guerrillamail.com','10minutemail.com','yopmail.com',
    'tempmail.com','trashmail.com'
  ];
begin
  if lower(new.email) = 'joshua.bosma@kpnmail.nl' then
    return new;
  end if;
  if domain = any (blocked) then
    raise exception 'Gratis of particuliere e-maildomeinen zijn niet toegestaan voor BOA Portaal.';
  end if;
  return new;
end;
$$;

drop trigger if exists boa_reject_free_email on auth.users;
create trigger boa_reject_free_email
  before insert or update of email on auth.users
  for each row execute function public.reject_free_email();
`.trim();
