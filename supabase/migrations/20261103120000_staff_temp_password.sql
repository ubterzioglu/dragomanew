-- Temporary passwords issued from the panel (Kullanıcılar → Geçici şifre ver).
--
-- The staff-account Edge Function (service role) creates or updates the person's Auth account with a
-- one-time password and flags the staff row. The panel then keeps that person on the Şifre screen until
-- they set their own password and call finish_password_change(). The flag is a guide for the person,
-- not a security boundary: whoever holds the temporary password could also just keep using it, which
-- is why it is shown once and passed on by phone or in person.

alter table public.staff_members
  add column password_change_required boolean not null default false,
  add column temp_password_issued_at timestamptz,
  add column temp_password_issued_by uuid references public.staff_members (id) on delete set null;

comment on column public.staff_members.password_change_required is
  'True after a temporary password was issued; cleared by the person through finish_password_change().';
comment on column public.staff_members.temp_password_issued_at is
  'When the last temporary password was issued (staff-account Edge Function).';
comment on column public.staff_members.temp_password_issued_by is
  'Who issued the last temporary password.';

/**
 * The caller's own flag, for the panel's "Şifre first" guide. Through this function only, so staff
 * do not see who else still holds an unchanged temporary password. False for anyone without an
 * active staff row.
 */
create function public.my_password_change_required()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select s.password_change_required from public.staff_members as s where s.id = private.current_staff_id()),
    false
  )
$$;

revoke all on function public.my_password_change_required() from public, anon;
grant execute on function public.my_password_change_required() to authenticated;

/** The signed-in person has set their own password: lift the "set your password first" gate. */
create function public.finish_password_change()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_staff uuid := private.current_staff_id();
begin
  if v_staff is null then
    raise exception 'active staff only' using errcode = '42501';
  end if;

  update public.staff_members as s
     set password_change_required = false
   where s.id = v_staff and s.password_change_required;
end;
$$;

revoke all on function public.finish_password_change() from public, anon;
grant execute on function public.finish_password_change() to authenticated;

/**
 * The Auth account behind an active staff row, for the staff-account function: the bound user_id,
 * or before the first sign-in an Auth user with the same address (for example one opened by hand in
 * the dashboard) that no staff row is bound to yet, the same rule as link_staff_account(). Null
 * when there is none or the row is inactive. Service role only.
 */
create function public.staff_auth_user_id(p_staff_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    s.user_id,
    (
      select u.id
      from auth.users as u
      where lower(u.email) = s.email
        and not exists (select 1 from public.staff_members as o where o.user_id = u.id)
      order by u.created_at
      limit 1
    )
  )
  from public.staff_members as s
  where s.id = p_staff_id and s.active
$$;

revoke all on function public.staff_auth_user_id(uuid) from public, anon, authenticated;
grant execute on function public.staff_auth_user_id(uuid) to service_role;

-- The users page shows whether a temporary password is still waiting to be replaced, and since when.
drop function public.list_staff_members();

create function public.list_staff_members()
returns table (
  id uuid,
  email text,
  full_name text,
  role public.staff_role,
  extra_permissions text[],
  active boolean,
  linked boolean,
  password_change_required boolean,
  temp_password_issued_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.can('staff.manage') then
    raise exception 'staff.manage required' using errcode = '42501';
  end if;

  return query
    select s.id, s.email, s.full_name, s.role, s.extra_permissions, s.active,
           s.user_id is not null, s.password_change_required, s.temp_password_issued_at,
           s.created_at, s.updated_at
    from public.staff_members as s
    order by s.active desc, s.full_name;
end;
$$;

revoke all on function public.list_staff_members() from public, anon;
grant execute on function public.list_staff_members() to authenticated;
