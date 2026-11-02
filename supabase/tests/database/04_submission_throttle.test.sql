-- throttle_submission: the submit-request function's rate limit (5 per 10 minutes per IP hash).
begin;
create extension if not exists pgtap with schema extensions;

select plan(34);

-- Shape and grants ------------------------------------------------------------------------------

select function_returns(
  'public', 'throttle_submission', array['text', 'integer', 'integer'], 'boolean',
  'throttle_submission(text, integer, integer) returns boolean'
);
select is_definer(
  'public', 'throttle_submission', array['text', 'integer', 'integer'],
  'throttle_submission is security definer, so service_role needs no table access for it'
);
select ok(
  (select p.proconfig @> array['search_path=""'] from pg_proc as p where p.oid = 'public.throttle_submission(text, integer, integer)'::regprocedure),
  'throttle_submission pins search_path to empty'
);
select ok(
  not has_function_privilege('anon', 'public.throttle_submission(text, integer, integer)', 'execute')
  and not has_function_privilege('authenticated', 'public.throttle_submission(text, integer, integer)', 'execute')
  and has_function_privilege('service_role', 'public.throttle_submission(text, integer, integer)', 'execute'),
  'only service_role may execute throttle_submission'
);
select has_index(
  'public', 'submission_throttle', 'submission_throttle_created_at_idx', array['created_at'],
  'the throttle is indexed by created_at for the daily prune'
);

-- Fixtures (rolled back) ------------------------------------------------------------------------

insert into public.submission_throttle (ip_hash, created_at) values
  -- Older than a day: the first call deletes these.
  ('hash-stale', now() - interval '25 hours'),
  ('hash-stale', now() - interval '2 days'),
  -- Younger than a day but outside a 10-minute window: kept, not counted.
  ('hash-day', now() - interval '23 hours'),
  ('hash-old', now() - interval '11 minutes'),
  ('hash-old', now() - interval '11 minutes'),
  ('hash-old', now() - interval '11 minutes'),
  ('hash-old', now() - interval '11 minutes'),
  ('hash-old', now() - interval '11 minutes'),
  -- Inside the window: these already use up the limit.
  ('hash-recent', now() - interval '9 minutes'),
  ('hash-recent', now() - interval '8 minutes'),
  ('hash-recent', now() - interval '7 minutes'),
  ('hash-recent', now() - interval '6 minutes'),
  ('hash-recent', now() - interval '5 minutes');

select is_empty(
  $$ select 1 from pg_locks where locktype = 'advisory' and pid = pg_backend_pid() $$,
  'no advisory lock is held before the first call'
);

-- service_role: five per window, then refused -----------------------------------------------------

set local role service_role;

select is(public.throttle_submission('hash-a', 5, 600), true, 'submission 1 of 5 passes');
select is(public.throttle_submission('hash-a', 5, 600), true, 'submission 2 of 5 passes');
select is(public.throttle_submission('hash-a', 5, 600), true, 'submission 3 of 5 passes');
select is(public.throttle_submission('hash-a', 5, 600), true, 'submission 4 of 5 passes');
select is(public.throttle_submission('hash-a', 5, 600), true, 'submission 5 of 5 passes');
select is(public.throttle_submission('hash-a', 5, 600), false, 'submission 6 inside the window is refused');
select is(public.throttle_submission('hash-a', 5, 600), false, 'and stays refused');

select isnt_empty(
  $$ select 1 from pg_locks
     where locktype = 'advisory' and pid = pg_backend_pid() and granted and objsubid = 1
       and classid = ((hashtextextended('submission_throttle:hash-a', 0) >> 32) & 4294967295)::oid
       and objid = (hashtextextended('submission_throttle:hash-a', 0) & 4294967295)::oid $$,
  'a call holds the per-hash lock until commit, so parallel requests from one address are counted one at a time'
);

select is(public.throttle_submission('hash-b', 5, 600), true, 'another hash has its own limit');
select is(public.throttle_submission('hash-old', 5, 600), true, 'rows older than the window are not counted');
select is(public.throttle_submission('hash-recent', 5, 600), false, 'rows inside the window from earlier requests count');
select is(public.throttle_submission('hash-recent', 6, 600), true, 'the limit comes from p_max');

reset role;

select is(
  (select count(*) from public.submission_throttle where ip_hash = 'hash-a'),
  5::bigint,
  'a refused submission records nothing'
);
select is_empty(
  $$ select 1 from public.submission_throttle where ip_hash = 'hash-stale' $$,
  'rows older than a day are pruned'
);
select is(
  (select count(*) from public.submission_throttle where ip_hash in ('hash-day', 'hash-old')),
  7::bigint,
  'rows younger than a day are kept'
);

-- Arguments ---------------------------------------------------------------------------------------

set local role service_role;

select throws_ok($$ select public.throttle_submission('', 5, 600) $$, '22023', null, 'an empty hash is rejected');
select throws_ok($$ select public.throttle_submission(null, 5, 600) $$, '22023', null, 'a null hash is rejected');
select throws_ok($$ select public.throttle_submission(repeat('x', 129), 5, 600) $$, '22023', null, 'a hash over 128 characters is rejected');
select throws_ok($$ select public.throttle_submission('hash-c', 0, 600) $$, '22023', null, 'p_max below 1 is rejected');
select throws_ok($$ select public.throttle_submission('hash-c', 101, 600) $$, '22023', null, 'p_max above 100 is rejected');
select throws_ok($$ select public.throttle_submission('hash-c', null, 600) $$, '22023', null, 'a null p_max is rejected');
select throws_ok($$ select public.throttle_submission('hash-c', 5, 0) $$, '22023', null, 'a window below 1 second is rejected');
select throws_ok($$ select public.throttle_submission('hash-c', 5, 86401) $$, '22023', null, 'a window over a day is rejected');
select throws_ok($$ select public.throttle_submission('hash-c', 5, null) $$, '22023', null, 'a null window is rejected');
select lives_ok(
  $$ select public.throttle_submission(repeat('x', 128), 1, 1), public.throttle_submission('hash-c', 100, 86400) $$,
  'the limits themselves are accepted'
);

-- Nobody but service_role ----------------------------------------------------------------------------

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);
select throws_ok($$ select public.throttle_submission('hash-d', 5, 600) $$, '42501', null, 'anon cannot call throttle_submission');

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"role": "authenticated", "aal": "aal2"}', true);
select throws_ok($$ select public.throttle_submission('hash-d', 5, 600) $$, '42501', null, 'authenticated cannot call throttle_submission');

reset role;
select is_empty(
  $$ select 1 from public.submission_throttle where ip_hash = 'hash-d' $$,
  'the refused callers recorded nothing'
);

select * from finish();
rollback;
