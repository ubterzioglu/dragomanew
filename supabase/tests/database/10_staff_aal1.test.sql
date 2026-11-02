-- Staff need no TOTP since 2026-11-02 (20261102120000_staff_aal1.sql): private.has_aal2() keeps its
-- name and grants but is true for any signed-in session, aal1 or aal2.
begin;
create extension if not exists pgtap with schema extensions;

select plan(7);

select set_config('request.jwt.claims', '{"role": "authenticated", "aal": "aal1"}', true);
select ok(private.has_aal2(), 'an aal1 session (Google or e-mail + password) counts as signed in');

select set_config('request.jwt.claims', '{"role": "authenticated", "aal": "aal2"}', true);
select ok(private.has_aal2(), 'an aal2 session still counts');

select set_config('request.jwt.claims', '{"role": "anon"}', true);
select ok(not private.has_aal2(), 'an anon token has no session');

select set_config('request.jwt.claims', '{"role": "authenticated", "aal": "AAL1"}', true);
select ok(not private.has_aal2(), 'an unknown level is refused');

select is(
  obj_description('private.has_aal2()'::regprocedure, 'pg_proc') like 'True for any signed-in session%', true,
  'the function comment says why the old name stays'
);
select ok(has_function_privilege('authenticated', 'private.has_aal2()', 'execute'), 'authenticated may still call has_aal2');
select ok(not has_function_privilege('anon', 'private.has_aal2()', 'execute'), 'anon still may not call has_aal2');

select * from finish();
rollback;
