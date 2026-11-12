-- Overleg en correcties. De tekst staat alleen als AES-GCM-cijfertekst in iv/tag/cipher.
create table if not exists boa_seal (
  id int primary key,
  key text not null
);

create table if not exists boa_overleg (
  id text primary key,
  user_id text not null,
  iv text not null,
  tag text not null,
  cipher text not null,
  created_at timestamptz not null default now()
);

create index if not exists boa_overleg_created on boa_overleg (created_at desc);
