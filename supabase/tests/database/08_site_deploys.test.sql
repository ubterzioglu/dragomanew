-- The deploy queue: debounce, max wait, coalescing, the min gap, stale sending rows, the Vault
-- secrets the dispatcher needs and the staff "deploy now" RPC. now() is fixed inside the test
-- transaction, so times are shifted by editing the rows.
begin;
create extension if not exists pgtap with schema extensions;

select plan(26);

create schema tests;
create table tests.people (name text primary key, user_id uuid not null, email text not null);
grant usage on schema tests to authenticated;
grant select on tests.people to authenticated;

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
  ('admin',  '10000000-0000-4000-8000-000000000001', 'admin@dragoman.test'),
  ('editor', '10000000-0000-4000-8000-000000000004', 'editor@dragoman.test');

insert into auth.users (id, email, aud, role, email_confirmed_at)
select user_id, email, 'authenticated', 'authenticated', now() from tests.people;

insert into public.staff_members (id, email, full_name, role, user_id) values
  ('20000000-0000-4000-8000-000000000001', 'admin@dragoman.test',  'Ana Yönetici', 'main_admin', '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000004', 'editor@dragoman.test', 'İçerik',       'content',    '10000000-0000-4000-8000-000000000004');

-- The cron job ------------------------------------------------------------------------------------

select results_eq(
  $$ select schedule, command from cron.job where jobname = 'dragoman-site-deploy' $$,
  $$ values ('* * * * *'::text, 'select private.dispatch_site_deploy()'::text) $$,
  'pg_cron runs the dispatcher every minute'
);
select ok(
  not has_function_privilege('authenticated', 'private.dispatch_site_deploy()', 'execute')
  and not has_function_privilege('authenticated', 'private.queue_site_deploy(bigint)', 'execute'),
  'staff cannot run the queue functions directly'
);

-- Debounce, coalescing, max wait ------------------------------------------------------------------

select is(private.queue_site_deploy(1), now() + interval '60 seconds', 'a first request waits the 60 s debounce');
update public.site_deploys set first_requested_at = now() - interval '100 seconds', not_before = now() - interval '40 seconds';
select is(private.queue_site_deploy(1), now() + interval '60 seconds', 'a later request pushes the deploy out by the debounce again');
select is((select count(*) from public.site_deploys), 1::bigint, 'requests coalesce into one queued row');
update public.site_deploys set first_requested_at = now() - interval '280 seconds';
select is(private.queue_site_deploy(1), now() + interval '20 seconds', 'the debounce never passes first request + 5 min max wait');
select is((select release_id from public.site_deploys), 1::bigint, 'the queued row points at the latest release');

insert into public.app_settings (key, value) values ('deploy_debounce_seconds', '120'), ('deploy_max_wait_seconds', '900');
delete from public.site_deploys;
select is(private.queue_site_deploy(1), now() + interval '120 seconds', 'the debounce comes from app_settings');
select throws_ok(
  $$ update public.app_settings set value = '10' where key = 'deploy_debounce_seconds' $$,
  '23514', null, 'the debounce stays within 30-900 s'
);
select throws_ok(
  $$ insert into public.app_settings (key, value) values ('deepl_usage', '{"count": 1}') $$,
  '23514', null, 'deepl_usage needs count, limit and checkedAt'
);
delete from public.app_settings where key like 'deploy_%';

select throws_ok(
  $$ insert into public.site_deploys (status) values ('queued') $$,
  '23505', null, 'there is never a second queued row'
);

-- Dispatch: due rows only, min gap, not configured ---------------------------------------------------

delete from public.site_deploys;
select private.queue_site_deploy(1);
select is(private.dispatch_site_deploy(), null::bigint, 'a row inside its debounce is not sent');

update public.site_deploys set not_before = now() - interval '1 second';
insert into public.site_deploys (status, triggered_at) values ('triggered', now() - interval '60 seconds');
select is(private.dispatch_site_deploy(), null::bigint, 'nothing is sent within 3 min of the last trigger');
select is((select count(*) from public.site_deploys where status = 'queued'), 1::bigint, 'the row waits out the min gap');

update public.site_deploys set triggered_at = now() - interval '1 hour' where status = 'triggered';
select ok(private.dispatch_site_deploy() is not null, 'a due row is dispatched after the min gap');
select results_eq(
  $$ select status, last_error, attempts from public.site_deploys where status <> 'triggered' $$,
  $$ values ('skipped'::public.site_deploy_status, 'not_configured'::text, 0) $$,
  'without the Vault secrets the row is skipped as not_configured'
);

-- With the Vault secrets: sending, attempts + 1, one pg_net request ------------------------------------

select vault.create_secret('http://127.0.0.1:9/functions/v1/site-deploy', 'site_deploy_url');
select vault.create_secret('pgtap-dispatch-secret', 'deploy_dispatch_secret');
delete from public.site_deploys where status <> 'triggered';
select private.queue_site_deploy(1);
update public.site_deploys set not_before = now() - interval '1 second' where status = 'queued';
select ok(private.dispatch_site_deploy() is not null, 'the dispatcher sends a due row');
select results_eq(
  $$ select status, attempts, sending_at = now() from public.site_deploys where status <> 'triggered' $$,
  $$ values ('sending'::public.site_deploy_status, 1, true) $$,
  'a sent row is sending with one attempt'
);
select results_eq(
  $$ select method::text, url, headers ->> 'x-dispatch-secret', (convert_from(body, 'utf8')::jsonb) ? 'deployId'
     from net.http_request_queue order by id desc limit 1 $$,
  $$ values ('POST'::text, 'http://127.0.0.1:9/functions/v1/site-deploy'::text, 'pgtap-dispatch-secret'::text, true) $$,
  'pg_net posts {deployId, releaseId} with the dispatch secret header'
);

select private.queue_site_deploy(1);
update public.site_deploys set not_before = now() - interval '1 second' where status = 'queued';
select is(private.dispatch_site_deploy(), null::bigint, 'nothing else is sent while a row is sending');

-- Stale sending rows -----------------------------------------------------------------------------------

update public.site_deploys set sending_at = now() - interval '6 minutes' where status = 'sending';
update public.site_deploys set triggered_at = now() where status = 'triggered';
select is(private.dispatch_site_deploy(), null::bigint, 'within the min gap nothing is sent');
select results_eq(
  $$ select status, last_error from public.site_deploys where status in ('failed', 'sending') $$,
  $$ values ('failed'::public.site_deploy_status, 'stale_sending'::text) $$,
  'a stale sending row fails when a queued row already covers it'
);

delete from public.site_deploys where status in ('failed', 'queued');
insert into public.site_deploys (status, sending_at, attempts) values ('sending', now() - interval '6 minutes', 1);
select private.dispatch_site_deploy();
select results_eq(
  $$ select status, last_error, not_before = now() from public.site_deploys where status not in ('triggered') $$,
  $$ values ('queued'::public.site_deploy_status, 'stale_sending'::text, true) $$,
  'a sending row older than 5 min goes back to the queue'
);

-- Staff: deploy now -----------------------------------------------------------------------------------

delete from public.site_deploys where status = 'queued';
select tests.sign_in('editor');
select throws_ok('select public.request_site_deploy()', '42501', null, 'deploy now needs site.deploy');
reset role;
select tests.sign_in('admin');
select lives_ok('select public.request_site_deploy()', 'main_admin queues a deploy now');
reset role;
select results_eq(
  $$ select not_before = now(), release_id from public.site_deploys where status = 'queued' $$,
  $$ values (true, 1::bigint) $$,
  'deploy now is due at once, for the latest release'
);

select * from finish();
rollback;
