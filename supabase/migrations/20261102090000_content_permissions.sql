-- Dalga 2 permissions: content, forms and site deploys join the role matrix (dalga2-sozlesme §5).
--
--   permission          main_admin  content  reservations / accounting
--   content.edit            x          x            -
--   content.translate       x          x            -
--   content.publish         x          -            -     (per person through extra_permissions)
--   forms.manage            x          -            -
--   site.deploy             x          -            -
--
-- The Dalga 1 request permissions are unchanged. The panel mirrors this table in
-- panel/src/lib/permissions.ts and asks the database through my_permissions().

alter table public.staff_members drop constraint staff_members_known_permissions;
alter table public.staff_members add constraint staff_members_known_permissions check (
  extra_permissions <@ array[
    'requests.read', 'requests.work', 'requests.reassign', 'staff.manage', 'settings.manage',
    'content.edit', 'content.translate', 'content.publish', 'forms.manage', 'site.deploy'
  ]::text[]
);

/**
 * The role matrix plus per-person extras. Pure, so it can judge any staff row (for example a
 * hand-over target), not only the caller.
 */
create or replace function private.role_can(p_role public.staff_role, p_extra text[], p_permission text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    p_permission = any (coalesce(p_extra, '{}'::text[]))
    or case p_role
      when 'main_admin' then p_permission in (
        'requests.read', 'requests.work', 'requests.reassign', 'staff.manage', 'settings.manage',
        'content.edit', 'content.translate', 'content.publish', 'forms.manage', 'site.deploy'
      )
      when 'reservations' then p_permission in ('requests.read', 'requests.work')
      when 'accounting' then p_permission = 'requests.read'
      when 'content' then p_permission in ('content.edit', 'content.translate')
      else false
    end,
    false
  )
$$;

revoke all on function private.role_can(public.staff_role, text[], text) from public, anon, authenticated;

/**
 * The caller's permissions, sorted; empty without an active staff row or without AAL2. The panel
 * shows menu items by this list; every policy and RPC still checks for itself. Security definer
 * because extra_permissions is not readable from the table.
 */
create function public.my_permissions()
returns text[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select array_agg(p.permission order by p.permission)
      from public.staff_members as s
      cross join unnest(array[
        'requests.read', 'requests.work', 'requests.reassign', 'staff.manage', 'settings.manage',
        'content.edit', 'content.translate', 'content.publish', 'forms.manage', 'site.deploy'
      ]::text[]) as p(permission)
      where s.id = private.current_staff_id()
        and private.has_aal2()
        and private.role_can(s.role, s.extra_permissions, p.permission)
    ),
    '{}'::text[]
  )
$$;

revoke all on function public.my_permissions() from public, anon;
grant execute on function public.my_permissions() to authenticated;
