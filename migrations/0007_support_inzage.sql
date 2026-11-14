-- Support mag ook op e-mailadres zoeken. Draai dit één keer na 0006.

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
  if actor.rol is distinct from 'beheerder' and actor.rol is distinct from 'support' then
    raise exception 'Nood-opvraag is voor support en de hoofdbeheerder.';
  end if;
  if length(trim(coalesce(p_reden, ''))) < 12 then
    raise exception 'Reden is verplicht (minimaal 12 tekens).';
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

grant execute on function public.boa_nood_email(text, text) to authenticated;
