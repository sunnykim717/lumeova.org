alter table public.memberships add column if not exists deleted_at timestamptz;

-- The hosted Data API denies direct writes to these tables. Keep privileged
-- code in an unexposed schema and check the caller's existing admin role.
create schema if not exists lumeova_private;
revoke all on schema lumeova_private from public, anon, authenticated;
grant usage on schema lumeova_private to authenticated;

create or replace function lumeova_private.register_regular_member(
  p_name text, p_phone text, p_email text, p_address text, p_birth_date date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_name text := nullif(btrim(p_name), '');
  v_phone text := nullif(btrim(p_phone), '');
  v_phone_digits text := nullif(regexp_replace(v_phone, '[^0-9]', '', 'g'), '');
  v_email text := nullif(lower(btrim(p_email)), '');
  v_address text := nullif(btrim(p_address), '');
  v_supporter public.supporters%rowtype;
  v_match_count integer := 0;
  v_membership uuid;
begin
  if v_actor is null or not public.admin_can_write() then
    raise exception 'administrator_required' using errcode = '42501';
  end if;

  if v_name is null or length(v_name) > 100 or length(v_address) > 300
     or (v_phone is null and v_email is null)
     or (v_phone is not null and (v_phone !~ '^[0-9-]{9,15}$' or coalesce(length(v_phone_digits), 0) < 9))
     or (v_email is not null and (length(v_email) > 254 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'))
     or p_birth_date > current_date then
    raise exception 'invalid_member_details' using errcode = '22023';
  end if;

  -- Serialize repeated registrations sharing either contact detail.
  if v_phone_digits is not null then
    perform pg_advisory_xact_lock(61407, hashtext(v_phone_digits));
  end if;
  if v_email is not null then
    perform pg_advisory_xact_lock(61408, hashtext(v_email));
  end if;

  for v_supporter in
    select s.* from public.supporters s
    where regexp_replace(s.phone, '[^0-9]', '', 'g') = v_phone_digits
       or lower(btrim(s.email)) = v_email
    order by s.id
    for update
  loop
    v_match_count := v_match_count + 1;
    if v_match_count > 1 or lower(btrim(v_supporter.name)) <> lower(v_name)
       or (v_phone_digits is not null and nullif(btrim(v_supporter.phone), '') is not null
           and regexp_replace(v_supporter.phone, '[^0-9]', '', 'g') <> v_phone_digits)
       or (v_email is not null and nullif(btrim(v_supporter.email), '') is not null
           and lower(btrim(v_supporter.email)) <> v_email) then
      raise exception 'supporter_contact_conflict' using errcode = '23505';
    end if;
  end loop;

  if v_match_count = 0 then
    insert into public.supporters (name, phone, email, address, birth_date)
    values (v_name, v_phone, v_email, v_address, p_birth_date)
    returning * into v_supporter;
  elsif exists (select 1 from public.memberships where supporter_id = v_supporter.id) then
    raise exception 'membership_already_exists' using errcode = '23505';
  end if;

  insert into public.memberships (supporter_id, membership_type, status, approved_at, approved_by)
  values (v_supporter.id, 'regular', 'approved', now(), v_actor)
  returning id into v_membership;

  insert into public.audit_logs (admin_id, action, target_type, target_id, metadata)
  values (v_actor, 'membership_regular_registered', 'membership', v_membership,
    jsonb_build_object('previous_membership_type', null, 'new_membership_type', 'regular'));

  return v_membership;
end;
$$;

create or replace function lumeova_private.promote_general_member(p_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_membership uuid;
begin
  if v_actor is null or not public.admin_can_write() then
    raise exception 'administrator_required' using errcode = '42501';
  end if;

  update public.memberships
  set membership_type = 'regular'
  where id = p_id and membership_type = 'general' and deleted_at is null
  returning id into v_membership;

  if v_membership is null then
    raise exception 'membership_not_general' using errcode = '22023';
  end if;

  insert into public.audit_logs (admin_id, action, target_type, target_id, metadata)
  values (v_actor, 'membership_promoted_to_regular', 'membership', v_membership,
    jsonb_build_object('previous_membership_type', 'general', 'new_membership_type', 'regular'));

  return v_membership;
end;
$$;

create or replace function public.admin_register_regular_member(
  p_name text, p_phone text, p_email text, p_address text, p_birth_date date
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select lumeova_private.register_regular_member(p_name, p_phone, p_email, p_address, p_birth_date);
$$;

create or replace function public.admin_promote_general_member(p_id uuid)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select lumeova_private.promote_general_member(p_id);
$$;

revoke all on function lumeova_private.register_regular_member(text, text, text, text, date) from public, anon, authenticated;
revoke all on function lumeova_private.promote_general_member(uuid) from public, anon, authenticated;
revoke all on function public.admin_register_regular_member(text, text, text, text, date) from public, anon, authenticated;
revoke all on function public.admin_promote_general_member(uuid) from public, anon, authenticated;

grant execute on function lumeova_private.register_regular_member(text, text, text, text, date) to authenticated;
grant execute on function lumeova_private.promote_general_member(uuid) to authenticated;
grant execute on function public.admin_register_regular_member(text, text, text, text, date) to authenticated;
grant execute on function public.admin_promote_general_member(uuid) to authenticated;

-- Read only the fields used by the two administrator screens.
create or replace function lumeova_private.read_members(p_status public.membership_status)
returns table (
  id uuid, membership_type public.membership_type, status public.membership_status,
  created_at timestamptz, name text, phone text, email text
)
language sql
stable
security definer
set search_path = ''
as $$
  select m.id, m.membership_type, m.status, m.created_at, s.name, s.phone, s.email
  from public.memberships m
  join public.supporters s on s.id = m.supporter_id
  where (select public.is_admin())
    and m.deleted_at is null
    and (p_status is null or m.status = p_status)
  order by m.created_at desc, m.id;
$$;

create or replace function public.admin_read_members(p_status public.membership_status)
returns table (
  id uuid, membership_type public.membership_type, status public.membership_status,
  created_at timestamptz, name text, phone text, email text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from lumeova_private.read_members(p_status);
$$;

create or replace function lumeova_private.read_member_management_history()
returns table (
  id uuid, action text, target_type text, created_at timestamptz,
  actor text, previous_membership_type text
)
language sql
stable
security definer
set search_path = ''
as $$
  select l.id, l.action, l.target_type, l.created_at,
    coalesce(nullif(btrim(a.display_name), ''), l.admin_id::text),
    l.metadata->>'previous_membership_type'
  from public.audit_logs l
  left join public.admin_users a on a.id = l.admin_id
  where (select public.current_admin_role()) in ('super_admin', 'manager')
  order by l.created_at desc, l.id
  limit 200;
$$;

create or replace function public.admin_read_member_management_history()
returns table (
  id uuid, action text, target_type text, created_at timestamptz,
  actor text, previous_membership_type text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from lumeova_private.read_member_management_history();
$$;

revoke all on function lumeova_private.read_members(public.membership_status) from public, anon, authenticated;
revoke all on function public.admin_read_members(public.membership_status) from public, anon, authenticated;
revoke all on function lumeova_private.read_member_management_history() from public, anon, authenticated;
revoke all on function public.admin_read_member_management_history() from public, anon, authenticated;

grant execute on function lumeova_private.read_members(public.membership_status) to authenticated;
grant execute on function public.admin_read_members(public.membership_status) to authenticated;
grant execute on function lumeova_private.read_member_management_history() to authenticated;
grant execute on function public.admin_read_member_management_history() to authenticated;
