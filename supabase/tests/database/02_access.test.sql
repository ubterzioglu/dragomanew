-- Who sees what: anon, strangers, staff with a plain (aal1) sign-in, inactive staff and each role.
-- Since 2026-11-02 an aal1 session (Google or e-mail + password) of active staff is enough.
begin;
create extension if not exists pgtap with schema extensions;

select plan(75);

-- Fixtures (rolled back) ----------------------------------------------------------------------

create schema tests;
create table tests.people (name text primary key, user_id uuid not null, email text not null);
grant usage on schema tests to anon, authenticated;
grant select on tests.people to anon, authenticated;

/** Act as a signed-in user: role authenticated plus the JWT claims Auth would issue. */
create function tests.sign_in(p_name text, p_aal text default 'aal1')
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
    json_build_object('sub', v_person.user_id, 'email', v_person.email, 'role', 'authenticated', 'aal', p_aal)::text,
    true
  );
end;
$$;

insert into tests.people (name, user_id, email) values
  ('admin',    '10000000-0000-4000-8000-000000000001', 'admin@dragoman.test'),
  ('resv',     '10000000-0000-4000-8000-000000000002', 'resv@dragoman.test'),
  ('acct',     '10000000-0000-4000-8000-000000000003', 'acct@dragoman.test'),
  ('editor',   '10000000-0000-4000-8000-000000000004', 'editor@dragoman.test'),
  ('former',   '10000000-0000-4000-8000-000000000005', 'former@dragoman.test'),
  ('stranger', '10000000-0000-4000-8000-000000000006', 'stranger@example.test'),
  ('newbie',   '10000000-0000-4000-8000-000000000007', 'newbie@dragoman.test'),
  -- Signed up with a staff address but never confirmed it (password sign-up, confirmations off).
  ('unconfirmed', '10000000-0000-4000-8000-000000000009', 'pending@dragoman.test'),
  ('retired',  '10000000-0000-4000-8000-00000000000a', 'retired@dragoman.test'),
  -- Bound to the 'taken' row, then changed the account address to the unbound 'spare' row's.
  ('owner',    '10000000-0000-4000-8000-00000000000b', 'spare@dragoman.test'),
  -- A second account that now holds the bound row's old address.
  ('impostor', '10000000-0000-4000-8000-00000000000c', 'taken@dragoman.test'),
  -- Bound to a deactivated row, then changed the account address to the unbound 'vacant' row's.
  ('exstaff',  '10000000-0000-4000-8000-00000000000d', 'vacant@dragoman.test');

insert into auth.users (id, email, aud, role, email_confirmed_at)
select user_id, email, 'authenticated', 'authenticated', case when name = 'unconfirmed' then null else now() end
from tests.people;

insert into public.staff_members (id, email, full_name, role, active, user_id) values
  ('20000000-0000-4000-8000-000000000001', 'admin@dragoman.test',  'Ana Yönetici', 'main_admin',   true,  '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002', 'resv@dragoman.test',   'Rezervasyon',  'reservations', true,  '10000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000003', 'acct@dragoman.test',   'Muhasebe',     'accounting',   true,  '10000000-0000-4000-8000-000000000003'),
  ('20000000-0000-4000-8000-000000000004', 'editor@dragoman.test', 'İçerik',       'content',      true,  '10000000-0000-4000-8000-000000000004'),
  ('20000000-0000-4000-8000-000000000005', 'former@dragoman.test', 'Eski Çalışan', 'reservations', false, '10000000-0000-4000-8000-000000000005'),
  ('20000000-0000-4000-8000-000000000007', 'newbie@dragoman.test', 'Yeni Gelen',   'reservations', true,  null),
  ('20000000-0000-4000-8000-000000000009', 'pending@dragoman.test', 'Onaysız',     'reservations', true,  null),
  ('20000000-0000-4000-8000-00000000000a', 'retired@dragoman.test', 'Emekli',      'reservations', false, null),
  ('20000000-0000-4000-8000-00000000000b', 'taken@dragoman.test',  'Sahibi',       'reservations', true,  '10000000-0000-4000-8000-00000000000b'),
  ('20000000-0000-4000-8000-00000000000c', 'spare@dragoman.test',  'Boşta',        'reservations', true,  null),
  ('20000000-0000-4000-8000-00000000000d', 'exstaff@dragoman.test', 'Ayrılan',     'reservations', false, '10000000-0000-4000-8000-00000000000d'),
  ('20000000-0000-4000-8000-00000000000e', 'vacant@dragoman.test', 'Açık Kadro',   'reservations', true,  null);

insert into public.events (id, category, title, price_display, health_form, status)
values ('pgtap-event', 'diving', '{"tr": "Test etkinliği"}', 'numeric', 'diving', 'published');

insert into public.requests (kind, locale, full_name, email, payload, event_id, idempotency_key) values
  ('event',   'tr', 'Ada Deniz',  'ada@example.test', '{}', 'pgtap-event', '30000000-0000-4000-8000-000000000001'),
  ('contact', 'en', 'Can Yıldız', 'can@example.test', '{}', null,          '30000000-0000-4000-8000-000000000002');

insert into public.notifications (request_id, kind, recipient, locale)
select id, 'customer_receipt', email, locale from public.requests where idempotency_key = '30000000-0000-4000-8000-000000000001';
insert into public.submission_throttle (ip_hash) values ('pgtap-hash');

-- anon ---------------------------------------------------------------------------------------------

set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

select throws_ok('select 1 from public.requests', '42501', null, 'anon cannot read requests');
select throws_ok('select 1 from public.request_activity', '42501', null, 'anon cannot read request_activity');
select throws_ok('select 1 from public.notifications', '42501', null, 'anon cannot read notifications');
select throws_ok('select 1 from public.submission_throttle', '42501', null, 'anon cannot read submission_throttle');
select throws_ok('select 1 from public.staff_members', '42501', null, 'anon cannot read staff_members');
select throws_ok('select 1 from public.events', '42501', null, 'anon cannot read events');
select throws_ok('select 1 from public.event_options', '42501', null, 'anon cannot read event_options');
select throws_ok('select 1 from public.app_settings', '42501', null, 'anon cannot read app_settings');
select throws_ok($$ select public.claim_request(gen_random_uuid()) $$, '42501', null, 'anon cannot call claim_request');
select throws_ok('select public.link_staff_account()', '42501', null, 'anon cannot call link_staff_account');
select throws_ok('select * from public.list_staff_members()', '42501', null, 'anon cannot call list_staff_members');

-- A signed-in stranger (no staff row), whatever the level ------------------------------------------------

reset role;
select tests.sign_in('stranger', 'aal2');

select is_empty('select 1 from public.requests', 'a stranger sees no requests');
select is_empty('select 1 from public.request_activity', 'a stranger sees no activity');
select is_empty('select 1 from public.events', 'a stranger sees no events');
select is_empty('select 1 from public.event_options', 'a stranger sees no event options');
select is_empty('select 1 from public.app_settings', 'a stranger sees no settings');
select is_empty('select 1 from public.staff_members', 'a stranger sees no staff');
select throws_ok('select 1 from public.notifications', '42501', null, 'authenticated cannot read the outbox');
select throws_ok('select 1 from public.submission_throttle', '42501', null, 'authenticated cannot read the throttle');
select is(public.link_staff_account(), null::uuid, 'link_staff_account binds nothing for a stranger');

-- Staff with a plain sign-in (aal1: Google or e-mail + password, no TOTP) ---------------------------

reset role;
select tests.sign_in('resv', 'aal1');

select is((select count(*) from public.requests), 2::bigint, 'reservations staff with an aal1 session read requests');
select isnt_empty('select 1 from public.request_activity', 'staff with an aal1 session read request activity');
select ok((select count(*) from public.events) > 0, 'staff with an aal1 session read events');
select is((select count(*) from public.app_settings), 2::bigint, 'staff with an aal1 session read settings');
select isnt_empty('select 1 from public.staff_members', 'staff with an aal1 session see the directory');

-- A token without any assurance level is no sign-in Auth issues; it gets nothing.
reset role;
select tests.sign_in('resv', null);
select is_empty('select 1 from public.requests', 'a token without an aal claim sees no requests');

-- Inactive staff ------------------------------------------------------------------------------------

reset role;
select tests.sign_in('former');

select is_empty('select 1 from public.requests', 'inactive staff see no requests');
select is_empty('select 1 from public.staff_members', 'inactive staff see no staff');

-- accounting: reads requests, writes nothing -----------------------------------------------------------

reset role;
select tests.sign_in('acct');

select is((select count(*) from public.requests), 2::bigint, 'accounting reads requests');
select is((select count(*) from public.request_activity), 2::bigint, 'accounting reads request activity');
select results_eq(
  $$ select full_name, role, active from public.staff_members where id = '20000000-0000-4000-8000-000000000001' $$,
  $$ values ('Ana Yönetici'::text, 'main_admin'::public.staff_role, true) $$,
  'every staff member sees the directory columns'
);
select throws_ok('select email from public.staff_members', '42501', null, 'staff e-mail is not readable from the table');
select ok((select count(*) from public.events) > 0, 'staff read events');
select is((select count(*) from public.app_settings), 2::bigint, 'staff read settings');
select throws_ok(
  $$ update public.requests set status = 'in_progress' $$,
  '42501', null, 'requests are never updated directly'
);
select throws_ok(
  $$ insert into public.requests (kind, locale, full_name, email, payload, idempotency_key)
     values ('contact', 'tr', 'X', 'x@example.test', '{}', gen_random_uuid()) $$,
  '42501', null, 'staff cannot insert requests'
);
select throws_ok('delete from public.requests', '42501', null, 'staff cannot delete requests');

update public.app_settings set value = 'false' where key = 'digest_enabled';
select throws_ok(
  $$ insert into public.staff_members (email, full_name, role) values ('x@dragoman.test', 'X', 'main_admin') $$,
  '42501', null, 'without staff.manage nobody can add staff'
);
update public.staff_members set role = 'main_admin' where id = '20000000-0000-4000-8000-000000000003';

reset role;
select is(
  (select value from public.app_settings where key = 'digest_enabled'), 'true'::jsonb,
  'without settings.manage an update changes nothing'
);
select is(
  (select role from public.staff_members where id = '20000000-0000-4000-8000-000000000003'), 'accounting'::public.staff_role,
  'without staff.manage nobody can promote themselves'
);

-- content: events yes, requests no ---------------------------------------------------------------------

select tests.sign_in('editor');

select is_empty('select 1 from public.requests', 'the content role sees no requests');
select ok((select count(*) from public.events) > 0, 'the content role reads events');

-- main_admin: staff and settings management -------------------------------------------------------------

reset role;
select tests.sign_in('resv');
select throws_ok('select * from public.list_staff_members()', '42501', null, 'list_staff_members needs staff.manage');

reset role;
select tests.sign_in('admin');

select is((select count(*) from public.list_staff_members()), 12::bigint, 'main_admin lists every staff row with e-mail');

update public.app_settings set value = '60' where key = 'digest_interval_minutes';

select lives_ok(
  $$ insert into public.staff_members (email, full_name, role) values ('New.Person@Dragoman.test', 'Yeni Kişi', 'reservations') $$,
  'main_admin adds staff'
);
select lives_ok(
  $$ update public.staff_members set role = 'accounting', active = false where id = '20000000-0000-4000-8000-000000000004' $$,
  'main_admin changes a role and deactivates staff'
);
select throws_ok(
  $$ update public.staff_members set user_id = '10000000-0000-4000-8000-000000000006' where id = '20000000-0000-4000-8000-000000000007' $$,
  '42501', null, 'not even main_admin can bind user_id directly'
);
select throws_ok(
  $$ update public.staff_members set email = 'other@dragoman.test' where id = '20000000-0000-4000-8000-000000000002' $$,
  '42501', null, 'staff e-mail cannot be changed from the panel'
);
select throws_ok(
  $$ update public.staff_members set active = false where id = '20000000-0000-4000-8000-000000000001' $$,
  '23514', null, 'the last active main_admin cannot be deactivated'
);
select throws_ok(
  $$ delete from public.staff_members where id = '20000000-0000-4000-8000-000000000002' $$,
  '42501', null, 'staff rows are deactivated, never deleted from the panel'
);

reset role;
select results_eq(
  $$ select value, updated_by from public.app_settings where key = 'digest_interval_minutes' $$,
  $$ values ('60'::jsonb, '20000000-0000-4000-8000-000000000001'::uuid) $$,
  'main_admin updates settings and the change records who made it'
);
select results_eq(
  $$ select role, active from public.staff_members where email = 'new.person@dragoman.test'
     union all
     select role, active from public.staff_members where id = '20000000-0000-4000-8000-000000000004' $$,
  $$ values ('reservations'::public.staff_role, true), ('accounting'::public.staff_role, false) $$,
  'staff changes by main_admin are stored'
);

-- First sign-in: e-mail fallback until link_staff_account binds the account -------------------------------

select tests.sign_in('newbie');

select is((select count(*) from public.requests), 2::bigint, 'unbound staff are recognised by their JWT e-mail');
select is(public.link_staff_account(), '20000000-0000-4000-8000-000000000007'::uuid, 'link_staff_account returns the staff id');

reset role;
select is(
  (select user_id from public.staff_members where id = '20000000-0000-4000-8000-000000000007'),
  '10000000-0000-4000-8000-000000000007'::uuid,
  'link_staff_account binds user_id on first sign-in'
);

-- link_staff_account and the e-mail fallback never bind or recognise the wrong account ------------------

select tests.sign_in('newbie');
select is(
  public.link_staff_account(), '20000000-0000-4000-8000-000000000007'::uuid,
  'a second link_staff_account call returns the same staff id'
);

reset role;
select tests.sign_in('unconfirmed');
select is(private.current_staff_id(), null::uuid, 'an unconfirmed e-mail gets no staff id, whatever the JWT claims');
select is_empty('select 1 from public.requests', 'an unconfirmed e-mail is not recognised as staff');
select is_empty('select 1 from public.staff_members', 'an unconfirmed e-mail sees no staff');
select is_empty('select 1 from public.events', 'an unconfirmed e-mail sees no events');
select is(public.link_staff_account(), null::uuid, 'link_staff_account does not bind an unconfirmed e-mail');

reset role;
select tests.sign_in('retired');
select is(public.link_staff_account(), null::uuid, 'link_staff_account does not bind an inactive staff row');
select is_empty('select 1 from public.requests', 'an inactive unbound row grants nothing');

reset role;
select tests.sign_in('owner');
select is(
  public.link_staff_account(), '20000000-0000-4000-8000-00000000000b'::uuid,
  'an account that is already linked keeps its row and binds no second one'
);

reset role;
select tests.sign_in('impostor');
select is(public.link_staff_account(), null::uuid, 'a row bound to another account is never rebound');
select is_empty('select 1 from public.requests', 'the address of a bound row grants nothing to another account');

reset role;
select tests.sign_in('exstaff');
select is_empty('select 1 from public.requests', 'a deactivated account gets no access through another row''s address');
select is(public.link_staff_account(), null::uuid, 'a deactivated account is not moved to another row');

reset role;
select tests.sign_in('stranger', 'aal1');
select is(public.link_staff_account(), null::uuid, 'link_staff_account binds nothing for a stranger with an aal1 session either');

reset role;
select results_eq(
  $$ select id, user_id from public.staff_members
     where id in ('20000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-00000000000a',
                  '20000000-0000-4000-8000-00000000000b', '20000000-0000-4000-8000-00000000000c',
                  '20000000-0000-4000-8000-00000000000e')
     order by id $$,
  $$ values ('20000000-0000-4000-8000-000000000009'::uuid, null::uuid),
            ('20000000-0000-4000-8000-00000000000a', null),
            ('20000000-0000-4000-8000-00000000000b', '10000000-0000-4000-8000-00000000000b'),
            ('20000000-0000-4000-8000-00000000000c', null),
            ('20000000-0000-4000-8000-00000000000e', null) $$,
  'the refused calls changed no binding'
);

-- Once the address is confirmed (a clicked magic link or OTP), the same account is recognised.
update auth.users set email_confirmed_at = now() where id = '10000000-0000-4000-8000-000000000009';
select tests.sign_in('unconfirmed');
select is(
  private.current_staff_id(), '20000000-0000-4000-8000-000000000009'::uuid,
  'confirming the address is what lets the e-mail fallback match'
);
reset role;

-- Deactivation cuts access at once ------------------------------------------------------------------

select tests.sign_in('resv');
select is((select count(*) from public.requests), 2::bigint, 'active reservations staff read requests');

reset role;
update public.staff_members set active = false where id = '20000000-0000-4000-8000-000000000002';
select tests.sign_in('resv');
select is_empty('select 1 from public.requests', 'a deactivated staff member loses access on the next query');

-- Two main_admins demoting each other at once must not both pass the last-admin check ----------------

reset role;
insert into public.staff_members (id, email, full_name, role)
values ('20000000-0000-4000-8000-00000000000f', 'deputy@dragoman.test', 'Yardımcı', 'main_admin');
select is_empty(
  $$ select 1 from pg_locks where locktype = 'advisory' and pid = pg_backend_pid() $$,
  'no advisory lock is held before a main_admin changes'
);
update public.staff_members set role = 'reservations' where id = '20000000-0000-4000-8000-00000000000f';
select isnt_empty(
  $$ select 1 from pg_locks where locktype = 'advisory' and pid = pg_backend_pid() and granted $$,
  'demoting a main_admin holds the main_admin lock until commit, so concurrent demotions run one at a time'
);

select * from finish();
rollback;
