-- Staff access no longer needs a TOTP (aal2) session (owner decision, 2026-11-02): an active
-- staff member signed in with Google OAuth or e-mail + password (aal1) has full access per role.
-- The security of the Google account is left to Google; non-staff sign-ups are still refused by
-- private.before_user_created, and every policy still needs an active staff row + permission.
--
-- private.has_aal2() keeps its name and grants so private.can, private.is_staff,
-- public.my_permissions, every policy and the request RPCs pick the new rule up unchanged. It now
-- only says "the request carries a signed-in user's session" (anon tokens have no aal claim).

create or replace function private.has_aal2()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt()) ->> 'aal', '') in ('aal1', 'aal2')
$$;

comment on function private.has_aal2() is
  'True for any signed-in session (aal1 or aal2). Kept under its old name so callers need no change; staff no longer need TOTP (2026-11-02).';

revoke all on function private.has_aal2() from public, anon;
grant execute on function private.has_aal2() to authenticated;
