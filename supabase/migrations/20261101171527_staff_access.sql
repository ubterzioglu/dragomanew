-- Staff, bookable content and the access helpers every policy relies on.
--
-- Rules (Dalga 1 contract): anon reaches nothing; a signed-in user reaches data only with an
-- active staff_members row, an AAL2 (TOTP) session and the permission for that data. Every
-- check reads staff_members on each query, so deactivating someone cuts access at once.
-- Authorization never reads user_metadata (users can edit it themselves).

create type public.request_kind as enum ('event', 'transport', 'lodging', 'contact');
create type public.request_status as enum ('pending', 'in_progress');
create type public.site_locale as enum ('tr', 'en', 'fr', 'de');
create type public.staff_role as enum ('main_admin', 'reservations', 'accounting', 'content');

-- Helpers live outside the API schemas, so PostgREST never exposes them as RPCs.
create schema private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;
alter default privileges in schema private revoke execute on functions from public;

/** Shared updated_at stamp for tables people edit. */
create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- staff_members
-- ---------------------------------------------------------------------------------------------

create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  email text not null unique
    constraint staff_members_email_lower check (email = lower(btrim(email)) and email like '_%@_%'),
  full_name text not null
    constraint staff_members_full_name_present check (btrim(full_name) <> ''),
  role public.staff_role not null,
  extra_permissions text[] not null default '{}'
    constraint staff_members_known_permissions check (
      extra_permissions <@ array['requests.read', 'requests.work', 'requests.reassign', 'staff.manage', 'settings.manage']::text[]
    ),
  active boolean not null default true,
  user_id uuid unique references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.staff_members is
  'Panel staff. Sign-in is allowed only for active rows; user_id is bound on first sign-in by link_staff_account().';

/** Addresses are compared lower-case everywhere, so store them that way whatever the panel sends. */
create function private.normalize_staff_email()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.email := lower(btrim(new.email));
  return new;
end;
$$;

/**
 * Keeps at least one active main_admin, so nobody can lock the business out of staff and settings
 * management by demoting or deactivating the last one. The transaction lock makes two admins who
 * demote each other at once run one after the other; without it each would still see the other as
 * active and both would commit. The check after the lock takes a fresh snapshot (read committed).
 */
create function private.keep_a_main_admin()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role = 'main_admin' and old.active
     and (new.role <> 'main_admin' or not new.active) then
    perform pg_advisory_xact_lock(hashtext('public.staff_members:main_admin'));

    if not exists (
      select 1
      from public.staff_members as s
      where s.role = 'main_admin' and s.active and s.id <> old.id
    ) then
      raise exception 'the last active main_admin cannot be demoted or deactivated'
        using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create trigger staff_members_normalize_email
  before insert or update of email on public.staff_members
  for each row execute function private.normalize_staff_email();

create trigger staff_members_keep_a_main_admin
  before update of role, active on public.staff_members
  for each row execute function private.keep_a_main_admin();

create trigger staff_members_touch_updated_at
  before update on public.staff_members
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------------------------
-- Access helpers
-- ---------------------------------------------------------------------------------------------

/**
 * The role matrix plus per-person extras. Pure, so it can judge any staff row (for example a
 * hand-over target), not only the caller.
 */
create function private.role_can(p_role public.staff_role, p_extra text[], p_permission text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    p_permission = any (coalesce(p_extra, '{}'::text[]))
    or case p_role
      when 'main_admin' then p_permission in ('requests.read', 'requests.work', 'requests.reassign', 'staff.manage', 'settings.manage')
      when 'reservations' then p_permission in ('requests.read', 'requests.work')
      when 'accounting' then p_permission = 'requests.read'
      else false
    end,
    false
  )
$$;

/**
 * The caller's address as Auth stored it, and only once it is confirmed (Google-verified, or a
 * clicked link). The JWT claim alone is not enough: with confirmations off, anyone could sign up
 * with a staff address by password and get a session at once. Never reads user_metadata.
 * Not security definer: only the security definer helpers below call it.
 */
create function private.confirmed_email()
returns text
language sql
stable
set search_path = ''
as $$
  select lower(u.email)
  from auth.users as u
  where u.id = (select auth.uid())
    and u.email_confirmed_at is not null
$$;

/**
 * The caller's active staff row. Matches the bound user_id; until link_staff_account() binds it,
 * falls back to the confirmed address, but only for an account bound to no row at all, so a
 * deactivated member cannot come back through another unbound row's address.
 * Security definer so policies on staff_members can call it without recursing into themselves.
 */
create function private.current_staff_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.id
  from public.staff_members as s
  where s.active
    and (
      s.user_id = (select auth.uid())
      or (
        s.user_id is null
        and s.email = (select private.confirmed_email())
        and not exists (
          select 1 from public.staff_members as o where o.user_id = (select auth.uid())
        )
      )
    )
  order by s.user_id is null
  limit 1
$$;

/** True when the session passed TOTP (aal2); a password or OAuth sign-in alone is aal1. */
create function private.has_aal2()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2'
$$;

/** Active staff + AAL2 + permission, in one call so no policy can forget a part. */
create function private.can(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select private.has_aal2() and private.role_can(s.role, s.extra_permissions, p_permission)
      from public.staff_members as s
      where s.id = private.current_staff_id()
    ),
    false
  )
$$;

/** Active staff with AAL2, whatever their role (for data every staff member may read). */
create function private.is_staff()
returns boolean
language sql
stable
set search_path = ''
as $$
  select private.has_aal2() and private.current_staff_id() is not null
$$;

revoke all on function private.touch_updated_at() from public, anon, authenticated;
revoke all on function private.normalize_staff_email() from public, anon, authenticated;
revoke all on function private.keep_a_main_admin() from public, anon, authenticated;
revoke all on function private.role_can(public.staff_role, text[], text) from public, anon, authenticated;
revoke all on function private.confirmed_email() from public, anon, authenticated;
revoke all on function private.current_staff_id() from public, anon;
revoke all on function private.has_aal2() from public, anon;
revoke all on function private.can(text) from public, anon;
revoke all on function private.is_staff() from public, anon;
grant execute on function private.current_staff_id() to authenticated, service_role;
grant execute on function private.has_aal2() to authenticated;
grant execute on function private.can(text) to authenticated;
grant execute on function private.is_staff() to authenticated;

-- Every staff member may see the directory columns (needed for the hand-over list); e-mail and
-- extra permissions are for staff.manage only, through list_staff_members(). user_id is only
-- ever written by link_staff_account().
alter table public.staff_members enable row level security;
revoke all on table public.staff_members from public, anon, authenticated;
grant select (id, full_name, role, active) on table public.staff_members to authenticated;
grant insert (email, full_name, role, extra_permissions, active) on table public.staff_members to authenticated;
grant update (full_name, role, extra_permissions, active) on table public.staff_members to authenticated;
grant all on table public.staff_members to service_role;

create policy staff_members_select_staff on public.staff_members
  for select to authenticated
  using ((select private.is_staff()));

create policy staff_members_insert_manager on public.staff_members
  for insert to authenticated
  with check ((select private.can('staff.manage')));

create policy staff_members_update_manager on public.staff_members
  for update to authenticated
  using ((select private.can('staff.manage')))
  with check ((select private.can('staff.manage')));

/** Full staff rows for the users page; the table itself hides e-mail from other staff. */
create function public.list_staff_members()
returns table (
  id uuid,
  email text,
  full_name text,
  role public.staff_role,
  extra_permissions text[],
  active boolean,
  linked boolean,
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
           s.user_id is not null, s.created_at, s.updated_at
    from public.staff_members as s
    order by s.active desc, s.full_name;
end;
$$;

revoke all on function public.list_staff_members() from public, anon;
grant execute on function public.list_staff_members() to authenticated;

-- ---------------------------------------------------------------------------------------------
-- events, event_options (generated from the site's content by app/scripts/generate-supabase-seed.mjs)
-- ---------------------------------------------------------------------------------------------

create table public.events (
  id text primary key
    constraint events_id_slug check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category text not null
    constraint events_category_known check (category in ('diving', 'seaKayak', 'outdoor')),
  title jsonb not null
    constraint events_title_localized check (jsonb_typeof(title) = 'object' and title ? 'tr'),
  price_display text not null
    constraint events_price_display_known check (price_display in ('numeric', 'on_request')),
  health_form text
    constraint events_health_form_known check (health_form in ('diving', 'outdoor')),
  status text not null default 'draft'
    constraint events_status_known check (status in ('draft', 'published', 'archived')),
  updated_at timestamptz not null default now()
);

create table public.event_options (
  event_id text not null references public.events (id) on delete cascade,
  id text not null
    constraint event_options_id_slug check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name jsonb not null
    constraint event_options_name_localized check (jsonb_typeof(name) = 'object' and name ? 'tr'),
  -- null = price not known; never treated as zero.
  price numeric(10, 2)
    constraint event_options_price_non_negative check (price >= 0),
  currency text not null
    constraint event_options_currency_known check (currency in ('EUR', 'TRY')),
  basis text not null
    constraint event_options_basis_known check (basis in ('person', 'group', 'package')),
  sort integer not null default 0,
  primary key (event_id, id)
);

create trigger events_touch_updated_at
  before update on public.events
  for each row execute function private.touch_updated_at();

alter table public.events enable row level security;
alter table public.event_options enable row level security;
revoke all on table public.events, public.event_options from public, anon, authenticated;
grant select on table public.events, public.event_options to authenticated;
grant all on table public.events, public.event_options to service_role;

create policy events_select_staff on public.events
  for select to authenticated
  using ((select private.is_staff()));

create policy event_options_select_staff on public.event_options
  for select to authenticated
  using ((select private.is_staff()));

-- ---------------------------------------------------------------------------------------------
-- Auth hook: only active staff may get an account (configured in supabase/config.toml)
-- ---------------------------------------------------------------------------------------------

/**
 * before_user_created hook. Returning {} lets Auth create the user; an error object rejects the
 * sign-up, so a stranger signing in with Google never even gets an auth.users row.
 */
create function private.before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(event -> 'user' ->> 'email'));
begin
  if v_email <> '' and exists (
    select 1
    from public.staff_members as s
    where s.email = v_email and s.active
  ) then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Bu e-posta adresi Dragoman personeli olarak kayıtlı değil.'
    )
  );
end;
$$;

revoke all on function private.before_user_created(jsonb) from public, anon, authenticated, service_role;
grant usage on schema private to supabase_auth_admin;
grant execute on function private.before_user_created(jsonb) to supabase_auth_admin;
