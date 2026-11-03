-- Temporary passwords (20261103120000_staff_temp_password.sql): the flag, who may lift it, the
-- service-only Auth lookup and the extra columns on the users page.
begin;
create extension if not exists pgtap with schema extensions;

select plan(20);

create schema tests;
create table tests.people (name text primary key, user_id uuid not null, email text not null);
grant usage on schema tests to anon, authenticated;
grant select on tests.people to anon, authenticated;

create function tests.sign_in(p_name text)
returns void
language plpgsql
as $$
declare
  v_person tests.people;
begin
  select * into strict v_person from tests.people where name = p_name;
  perform set_config('role', 'authenticated', true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_person.user_id, 'email', v_person.email, 'role', 'authenticated', 'aal', 'aal1')::text,
    true
  );
end;
$$;

insert into tests.people (name, user_id, email) values
  ('admin',    '10000000-0000-4000-8000-000000000001', 'admin@dragoman.test'),
  ('newbie',   '10000000-0000-4000-8000-000000000002', 'newbie@dragoman.test'),
  ('acct',     '10000000-0000-4000-8000-000000000003', 'acct@dragoman.test'),
  ('stranger', '10000000-0000-4000-8000-000000000006', 'stranger@example.test'),
  -- Bound to the 'taken' row, but the Auth address was changed to the unbound 'spare' row's address.
  ('owner',    '10000000-0000-4000-8000-000000000008', 'spare@dragoman.test');

insert into auth.users (id, email, aud, role, email_confirmed_at)
select user_id, email, 'authenticated', 'authenticated', now() from tests.people;

-- newbie has an Auth account (opened by hand) but has not signed in yet, so the row is unbound.
insert into public.staff_members (id, email, full_name, role, active, user_id, password_change_required) values
  ('20000000-0000-4000-8000-000000000001', 'admin@dragoman.test',  'Ana Yönetici', 'main_admin', true, '10000000-0000-4000-8000-000000000001', false),
  ('20000000-0000-4000-8000-000000000002', 'newbie@dragoman.test', 'Yeni',         'main_admin', true, null,                                   true),
  ('20000000-0000-4000-8000-000000000003', 'acct@dragoman.test',   'Muhasebe',     'accounting', true, '10000000-0000-4000-8000-000000000003', true),
  ('20000000-0000-4000-8000-000000000004', 'nobody@dragoman.test', 'Hesapsız',     'content',    true, null,                                   false),
  ('20000000-0000-4000-8000-000000000005', 'gone@dragoman.test',   'Eski',         'content',    false, null,                                  false),
  ('20000000-0000-4000-8000-000000000008', 'taken@dragoman.test',  'Bağlı',        'content',    true, '10000000-0000-4000-8000-000000000008', false),
  ('20000000-0000-4000-8000-000000000009', 'spare@dragoman.test',  'Boşta',        'content',    true, null,                                   false);

-- Columns and grants ---------------------------------------------------------------------------------

select has_column('public', 'staff_members', 'password_change_required', 'the flag column exists');
select col_not_null('public', 'staff_members', 'password_change_required', 'the flag is never null');
select ok(
  not has_column_privilege('authenticated', 'public.staff_members', 'password_change_required', 'select'),
  'staff cannot read anyone''s flag from the table (only their own, through my_password_change_required)'
);
select ok(
  not has_column_privilege('authenticated', 'public.staff_members', 'password_change_required', 'update')
  and not has_column_privilege('authenticated', 'public.staff_members', 'temp_password_issued_by', 'update')
  and not has_column_privilege('authenticated', 'public.staff_members', 'temp_password_issued_at', 'insert'),
  'clients cannot set the flag or the issue stamp directly'
);

-- staff_auth_user_id: service role only ---------------------------------------------------------------

select ok(not has_function_privilege('authenticated', 'public.staff_auth_user_id(uuid)', 'execute'), 'authenticated cannot look up Auth ids');
select ok(not has_function_privilege('anon', 'public.staff_auth_user_id(uuid)', 'execute'), 'anon cannot look up Auth ids');
select ok(has_function_privilege('service_role', 'public.staff_auth_user_id(uuid)', 'execute'), 'the service role can');

select is(public.staff_auth_user_id('20000000-0000-4000-8000-000000000001'), '10000000-0000-4000-8000-000000000001'::uuid, 'a bound row gives its user_id');
select is(public.staff_auth_user_id('20000000-0000-4000-8000-000000000002'), '10000000-0000-4000-8000-000000000002'::uuid, 'an unbound row finds the Auth user with its address');
select is(public.staff_auth_user_id('20000000-0000-4000-8000-000000000004'), null, 'no Auth user yet gives null');
select is(public.staff_auth_user_id('20000000-0000-4000-8000-000000000005'), null, 'an inactive row gives null');
select is(
  public.staff_auth_user_id('20000000-0000-4000-8000-000000000009'),
  null,
  'an Auth user with the address but bound to another row is never handed out'
);

-- my_password_change_required --------------------------------------------------------------------------

select tests.sign_in('newbie');
select is(public.my_password_change_required(), true, 'an unbound newcomer with a temporary password sees their flag');
reset role;
select tests.sign_in('admin');
select is(public.my_password_change_required(), false, 'staff without a temporary password see false');
reset role;
select tests.sign_in('stranger');
select is(public.my_password_change_required(), false, 'a non-staff account sees false');
reset role;

-- finish_password_change ------------------------------------------------------------------------------

select tests.sign_in('acct');
select lives_ok('select public.finish_password_change()', 'active staff lift their own flag');
reset role;
select is(
  (select array_agg(password_change_required order by email) from public.staff_members where email in ('acct@dragoman.test', 'newbie@dragoman.test')),
  array[false, true],
  'only the caller''s flag is lifted'
);

select tests.sign_in('stranger');
select throws_ok('select public.finish_password_change()', '42501', null, 'a non-staff account is refused');
reset role;

-- list_staff_members carries the new columns -----------------------------------------------------------

select tests.sign_in('admin');
select is(
  (select password_change_required from public.list_staff_members() where email = 'newbie@dragoman.test'),
  true,
  'the users page sees the waiting flag'
);
reset role;

select tests.sign_in('acct');
select throws_ok('select * from public.list_staff_members()', '42501', null, 'list_staff_members still needs staff.manage');
reset role;

select * from finish();
rollback;
