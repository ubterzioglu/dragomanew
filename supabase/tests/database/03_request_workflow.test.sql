-- claim / hand over / reassign: allowed for the right role, refused for everyone else.
-- Also the before_user_created auth hook.
begin;
create extension if not exists pgtap with schema extensions;

select plan(38);

-- Fixtures (rolled back) ----------------------------------------------------------------------

create schema tests;
create table tests.people (name text primary key, user_id uuid not null, email text not null);
grant usage on schema tests to authenticated;
grant select on tests.people to authenticated;

/** Act as a signed-in user: role authenticated plus the JWT claims Auth would issue. */
create function tests.sign_in(p_name text, p_aal text default 'aal2')
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
  ('resv2',    '10000000-0000-4000-8000-000000000008', 'resv2@dragoman.test');

insert into auth.users (id, email, aud, role)
select user_id, email, 'authenticated', 'authenticated' from tests.people;

insert into public.staff_members (id, email, full_name, role, active, user_id) values
  ('20000000-0000-4000-8000-000000000001', 'admin@dragoman.test',  'Ana Yönetici',  'main_admin',   true,  '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002', 'resv@dragoman.test',   'Rezervasyon',   'reservations', true,  '10000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000003', 'acct@dragoman.test',   'Muhasebe',      'accounting',   true,  '10000000-0000-4000-8000-000000000003'),
  ('20000000-0000-4000-8000-000000000004', 'editor@dragoman.test', 'İçerik',        'content',      true,  '10000000-0000-4000-8000-000000000004'),
  ('20000000-0000-4000-8000-000000000005', 'former@dragoman.test', 'Eski Çalışan',  'reservations', false, '10000000-0000-4000-8000-000000000005'),
  ('20000000-0000-4000-8000-000000000008', 'resv2@dragoman.test',  'Rezervasyon 2', 'reservations', true,  '10000000-0000-4000-8000-000000000008');

insert into public.requests (id, kind, locale, full_name, email, payload, idempotency_key) values
  ('40000000-0000-4000-8000-000000000001', 'contact', 'tr', 'Ada Deniz',  'ada@example.test', '{}', gen_random_uuid()),
  ('40000000-0000-4000-8000-000000000002', 'contact', 'de', 'Can Yıldız', 'can@example.test', '{}', gen_random_uuid());

-- claim_request -------------------------------------------------------------------------------

select tests.sign_in('stranger');
select throws_ok($$ select public.claim_request('40000000-0000-4000-8000-000000000001') $$, '42501', null, 'a stranger cannot claim');
reset role;
select tests.sign_in('acct');
select throws_ok($$ select public.claim_request('40000000-0000-4000-8000-000000000001') $$, '42501', null, 'accounting cannot claim');
reset role;
select tests.sign_in('editor');
select throws_ok($$ select public.claim_request('40000000-0000-4000-8000-000000000001') $$, '42501', null, 'the content role cannot claim');
reset role;
select tests.sign_in('resv', 'aal1');
select throws_ok($$ select public.claim_request('40000000-0000-4000-8000-000000000001') $$, '42501', null, 'claiming needs AAL2');

reset role;
select tests.sign_in('resv');
select lives_ok($$ select public.claim_request('40000000-0000-4000-8000-000000000001') $$, 'reservations claims a pending request');

reset role;
select results_eq(
  $$ select status, assignee_id, claimed_at is not null from public.requests where id = '40000000-0000-4000-8000-000000000001' $$,
  $$ values ('in_progress'::public.request_status, '20000000-0000-4000-8000-000000000002'::uuid, true) $$,
  'a claimed request is in progress with the claimer as assignee'
);
select results_eq(
  $$ select actor_id, from_staff, to_staff from public.request_activity
     where request_id = '40000000-0000-4000-8000-000000000001' and action = 'claimed' $$,
  $$ values ('20000000-0000-4000-8000-000000000002'::uuid, null::uuid, '20000000-0000-4000-8000-000000000002'::uuid) $$,
  'claiming writes a claimed activity row'
);

select tests.sign_in('admin');
select throws_ok($$ select public.claim_request('40000000-0000-4000-8000-000000000001') $$, '55000', null, 'a request can be claimed only once');
select throws_ok($$ select public.claim_request(gen_random_uuid()) $$, 'P0002', null, 'claiming an unknown request fails');

-- hand_over_request ---------------------------------------------------------------------------

select throws_ok(
  $$ select public.hand_over_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000008') $$,
  '42501', null, 'not even main_admin can hand over a request assigned to someone else'
);
reset role;
select tests.sign_in('acct');
select throws_ok(
  $$ select public.hand_over_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000008') $$,
  '42501', null, 'accounting cannot hand over'
);
reset role;
select tests.sign_in('resv', 'aal1');
select throws_ok(
  $$ select public.hand_over_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000008') $$,
  '42501', null, 'handing over needs AAL2'
);

reset role;
select tests.sign_in('resv');
select throws_ok(
  $$ select public.hand_over_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003') $$,
  '22023', null, 'a request cannot go to someone who cannot work requests'
);
select throws_ok(
  $$ select public.hand_over_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000005') $$,
  '22023', null, 'a request cannot go to inactive staff'
);
select throws_ok(
  $$ select public.hand_over_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002') $$,
  '22023', null, 'handing over to yourself is refused'
);
select throws_ok(
  $$ select public.hand_over_request('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000008') $$,
  '42501', null, 'a pending request has no assignee to hand it over'
);
select lives_ok(
  $$ select public.hand_over_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000008') $$,
  'the assignee hands the request over'
);
select throws_ok(
  $$ select public.hand_over_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001') $$,
  '42501', null, 'after handing over, the former assignee has no say'
);

reset role;
select results_eq(
  $$ select status, assignee_id from public.requests where id = '40000000-0000-4000-8000-000000000001' $$,
  $$ values ('in_progress'::public.request_status, '20000000-0000-4000-8000-000000000008'::uuid) $$,
  'the new assignee holds the request'
);
select results_eq(
  $$ select actor_id, from_staff, to_staff from public.request_activity
     where request_id = '40000000-0000-4000-8000-000000000001' and action = 'handed_over' $$,
  $$ values ('20000000-0000-4000-8000-000000000002'::uuid, '20000000-0000-4000-8000-000000000002'::uuid,
             '20000000-0000-4000-8000-000000000008'::uuid) $$,
  'handing over writes a handed_over activity row'
);

-- reassign_request ----------------------------------------------------------------------------

select tests.sign_in('resv2');
select throws_ok(
  $$ select public.reassign_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002') $$,
  '42501', null, 'reservations cannot reassign, even their own request'
);
reset role;
select tests.sign_in('acct');
select throws_ok(
  $$ select public.reassign_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002') $$,
  '42501', null, 'accounting cannot reassign'
);
reset role;
select tests.sign_in('admin', 'aal1');
select throws_ok(
  $$ select public.reassign_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002') $$,
  '42501', null, 'reassigning needs AAL2'
);

reset role;
select tests.sign_in('admin');
select lives_ok(
  $$ select public.reassign_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002') $$,
  'main_admin reassigns a request'
);
select throws_ok(
  $$ select public.reassign_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002') $$,
  '22023', null, 'reassigning to the current assignee is refused'
);
select throws_ok(
  $$ select public.reassign_request('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003') $$,
  '22023', null, 'reassigning to someone who cannot work requests is refused'
);
select throws_ok(
  $$ select public.reassign_request(gen_random_uuid(), '20000000-0000-4000-8000-000000000002') $$,
  'P0002', null, 'reassigning an unknown request fails'
);
select lives_ok(
  $$ select public.reassign_request('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000008') $$,
  'main_admin assigns a pending request'
);

reset role;
select is(
  (select assignee_id from public.requests where id = '40000000-0000-4000-8000-000000000001'),
  '20000000-0000-4000-8000-000000000002'::uuid,
  'the reassigned request has the new assignee'
);
select results_eq(
  $$ select actor_id, from_staff, to_staff from public.request_activity
     where request_id = '40000000-0000-4000-8000-000000000001' and action = 'reassigned' $$,
  $$ values ('20000000-0000-4000-8000-000000000001'::uuid, '20000000-0000-4000-8000-000000000008'::uuid,
             '20000000-0000-4000-8000-000000000002'::uuid) $$,
  'reassigning writes a reassigned activity row'
);
select results_eq(
  $$ select status, assignee_id, claimed_at is not null from public.requests where id = '40000000-0000-4000-8000-000000000002' $$,
  $$ values ('in_progress'::public.request_status, '20000000-0000-4000-8000-000000000008'::uuid, true) $$,
  'an assigned pending request starts'
);
select results_eq(
  $$ select from_staff, to_staff from public.request_activity
     where request_id = '40000000-0000-4000-8000-000000000002' and action = 'reassigned' $$,
  $$ values (null::uuid, '20000000-0000-4000-8000-000000000008'::uuid) $$,
  'assigning a pending request records that nobody held it before'
);
select results_eq(
  $$ select action from public.request_activity where request_id = '40000000-0000-4000-8000-000000000001' order by id $$,
  array['created', 'claimed', 'handed_over', 'reassigned'],
  'the activity log tells the whole story in order'
);

-- before_user_created hook ------------------------------------------------------------------------

select is(
  private.before_user_created('{"user": {"email": "resv@dragoman.test"}}'),
  '{}'::jsonb,
  'the hook lets active staff sign up'
);
select is(
  private.before_user_created('{"user": {"email": " Resv@Dragoman.TEST "}}'),
  '{}'::jsonb,
  'the hook compares e-mail case-insensitively'
);
select is(
  private.before_user_created('{"user": {"email": "stranger@example.test"}}') -> 'error' ->> 'http_code',
  '403',
  'the hook rejects addresses without a staff row'
);
select ok(
  private.before_user_created('{"user": {"email": "former@dragoman.test"}}') ? 'error',
  'the hook rejects inactive staff'
);
select ok(
  private.before_user_created('{"user": {"phone": "905551112233"}}') ? 'error',
  'the hook rejects sign-ups without an e-mail'
);

select * from finish();
rollback;
