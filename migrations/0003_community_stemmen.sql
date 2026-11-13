-- Voeg parent_id en stemmen toe aan de community.
-- Eenmalig uitvoeren in de Supabase SQL Editor als de tabel al bestaat.

alter table public.boa_community
  add column if not exists parent_id uuid references public.boa_community (id) on delete cascade;

create table if not exists public.boa_community_stemmen (
  bericht_id uuid not null references public.boa_community (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  waarde smallint not null check (waarde in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (bericht_id, user_id)
);

alter table public.boa_community_stemmen enable row level security;

drop policy if exists boa_community_stemmen_select on public.boa_community_stemmen;
create policy boa_community_stemmen_select on public.boa_community_stemmen
  for select to authenticated
  using (true);

drop policy if exists boa_community_stemmen_insert on public.boa_community_stemmen;
create policy boa_community_stemmen_insert on public.boa_community_stemmen
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists boa_community_stemmen_update on public.boa_community_stemmen;
create policy boa_community_stemmen_update on public.boa_community_stemmen
  for update to authenticated
  using (auth.uid() = user_id);

drop policy if exists boa_community_stemmen_delete on public.boa_community_stemmen;
create policy boa_community_stemmen_delete on public.boa_community_stemmen
  for delete to authenticated
  using (auth.uid() = user_id);
