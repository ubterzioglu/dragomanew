-- Structure, grants and data rules that do not depend on who is signed in.
begin;
create extension if not exists pgtap with schema extensions;

select plan(41);

-- Tables, RLS, enums ----------------------------------------------------------------------------

select tables_are(
  'public',
  array['staff_members', 'events', 'event_options', 'requests', 'request_activity', 'notifications', 'submission_throttle', 'app_settings',
        'content_entries', 'media_assets', 'content_releases', 'site_deploys', 'form_versions', 'form_definitions', 'translation_runs',
        'client_answers', 'revision_requests', 'revision_comments', 'revision_status_changes', 'revision_attachments',
        'revision_notifications'],
  'public holds exactly the Dalga 1 and Dalga 2 tables plus the open-question answers'
);

select is_empty(
  $$ select c.relname from pg_class as c join pg_namespace as n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity $$,
  'RLS is on for every public table'
);

select enum_has_labels('public', 'request_kind', array['event', 'transport', 'lodging', 'contact'], 'request_kind values');
select enum_has_labels('public', 'request_status', array['pending', 'in_progress'], 'request_status values');
select enum_has_labels('public', 'site_locale', array['tr', 'en', 'fr', 'de'], 'site_locale values');
select enum_has_labels('public', 'staff_role', array['main_admin', 'reservations', 'accounting', 'content'], 'staff_role values');

-- Grants ----------------------------------------------------------------------------------------

select is_empty(
  $$ select c.relname from pg_class as c join pg_namespace as n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind in ('r', 'v', 'm')
       and (has_table_privilege('anon', c.oid, 'select, insert, update, delete, truncate, references, trigger')
            or has_any_column_privilege('anon', c.oid, 'select, insert, update, references')) $$,
  'anon has no privilege on any public table or view'
);

select is_empty(
  $$ select c.relname from pg_class as c join pg_namespace as n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'S'
       and (has_sequence_privilege('anon', c.oid, 'usage, select, update')
            or has_sequence_privilege('authenticated', c.oid, 'usage, select, update')) $$,
  'anon and authenticated have no privilege on any public sequence'
);

select is_empty(
  $$ select c.relname from pg_class as c join pg_namespace as n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r'
       and ((has_table_privilege('authenticated', c.oid, 'delete') and c.relname <> 'content_entries')
            or has_table_privilege('authenticated', c.oid, 'truncate')
            or (c.relname not in ('staff_members', 'app_settings', 'content_entries', 'media_assets', 'form_definitions', 'client_answers',
                                  'revision_requests', 'revision_comments', 'revision_attachments')
                and (has_table_privilege('authenticated', c.oid, 'insert, update')
                     or has_any_column_privilege('authenticated', c.oid, 'insert, update')))) $$,
  'authenticated cannot write requests, activity, the outbox, the throttle or content'
);

select ok(
  not has_table_privilege('authenticated', 'public.notifications', 'select')
  and not has_table_privilege('authenticated', 'public.submission_throttle', 'select'),
  'the outbox and the throttle are for service_role only'
);

select ok(
  not has_column_privilege('authenticated', 'public.staff_members', 'email', 'select')
  and not has_column_privilege('authenticated', 'public.staff_members', 'extra_permissions', 'select'),
  'staff e-mail and extra permissions are not readable from the table'
);

select ok(
  not has_column_privilege('authenticated', 'public.staff_members', 'user_id', 'insert')
  and not has_column_privilege('authenticated', 'public.staff_members', 'user_id', 'update')
  and not has_column_privilege('authenticated', 'public.staff_members', 'email', 'update'),
  'clients can never bind user_id or change a staff e-mail'
);

-- Functions -------------------------------------------------------------------------------------

select is_empty(
  $$ select p.proname from pg_proc as p join pg_namespace as n on n.oid = p.pronamespace
     where n.nspname in ('public', 'private') and p.prosecdef
       and not coalesce(p.proconfig, '{}') @> array['search_path=""'] $$,
  'every security definer function pins search_path to empty'
);

select results_eq(
  $$ select format('%s.%s', n.nspname, p.proname) collate "default" from pg_proc as p join pg_namespace as n on n.oid = p.pronamespace
     where n.nspname in ('public', 'private') and p.prosecdef order by 1 $$,
  array[
    'private.before_user_created', 'private.can', 'private.current_staff_id',
    'public.claim_request', 'public.finish_password_change', 'public.hand_over_request', 'public.link_staff_account',
    'public.list_staff_members', 'public.my_password_change_required', 'public.my_permissions', 'public.reassign_request', 'public.request_site_deploy',
    'public.set_revision_status', 'public.staff_auth_user_id', 'public.throttle_submission'
  ],
  'security definer is used only for the RPCs and the private helpers that need it'
);

select is_empty(
  $$ select p.proname from pg_proc as p join pg_namespace as n on n.oid = p.pronamespace
     where n.nspname in ('public', 'private') and has_function_privilege('anon', p.oid, 'execute') $$,
  'anon cannot execute any public or private function'
);

select is_empty(
  $$ select p.proname from pg_proc as p join pg_namespace as n on n.oid = p.pronamespace,
       aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) as acl
     where n.nspname in ('public', 'private') and acl.grantee = 0 and acl.privilege_type = 'EXECUTE' $$,
  'no public or private function is executable by PUBLIC'
);

select ok(
  has_function_privilege('authenticated', 'public.claim_request(uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.hand_over_request(uuid, uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.reassign_request(uuid, uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.link_staff_account()', 'execute')
  and has_function_privilege('authenticated', 'public.list_staff_members()', 'execute'),
  'authenticated can call the RPCs (each body checks active staff, a signed-in session and permission)'
);

select is_empty(
  $$ select policyname::text from pg_policies
     where schemaname = 'public'
       and (coalesce(qual, '') ilike '%user_metadata%' or coalesce(with_check, '') ilike '%user_metadata%')
     union all
     select p.proname::text from pg_proc as p join pg_namespace as n on n.oid = p.pronamespace
     where n.nspname in ('public', 'private') and p.prosrc ilike '%user_metadata%' $$,
  'no policy or function reads user_metadata'
);

select ok(not has_schema_privilege('anon', 'private', 'usage'), 'anon cannot use the private schema');

select ok(
  has_function_privilege('supabase_auth_admin', 'private.before_user_created(jsonb)', 'execute')
  and not has_function_privilege('authenticated', 'private.before_user_created(jsonb)', 'execute'),
  'only Auth runs the before_user_created hook'
);

select has_index(
  'public', 'submission_throttle', 'submission_throttle_ip_hash_created_at_idx', array['ip_hash', 'created_at'],
  'the throttle is indexed by ip_hash and created_at'
);

-- Reference numbers, idempotency, the created trigger ---------------------------------------------

select is(private.format_request_reference(123), 'DRG-000123', 'references are zero-padded to six digits');
select is(private.format_request_reference(1234567), 'DRG-1234567', 'references grow past six digits instead of truncating');

insert into public.events (id, category, title, price_display, health_form, status)
values ('pgtap-event', 'diving', '{"tr": "Test etkinliği"}', 'numeric', 'diving', 'published');

insert into public.requests (kind, locale, full_name, email, payload, event_id, idempotency_key)
values ('event', 'tr', 'Ada Deniz', 'ada@example.test', '{}', 'pgtap-event', '30000000-0000-4000-8000-000000000001'),
       ('contact', 'en', 'Can Yıldız', 'can@example.test', '{}', null, '30000000-0000-4000-8000-000000000002');

select matches(
  (select reference from public.requests where idempotency_key = '30000000-0000-4000-8000-000000000001'),
  '^DRG-[0-9]{6}$',
  'a new request gets a DRG-000000 reference by default'
);

select is(
  (select substr(reference, 5)::bigint from public.requests where idempotency_key = '30000000-0000-4000-8000-000000000002')
  - (select substr(reference, 5)::bigint from public.requests where idempotency_key = '30000000-0000-4000-8000-000000000001'),
  1::bigint,
  'references come from one sequence'
);

select throws_ok(
  $$ insert into public.requests (reference, kind, locale, full_name, email, payload, idempotency_key)
     values ('REF-1', 'contact', 'tr', 'X', 'x@example.test', '{}', gen_random_uuid()) $$,
  '23514', null,
  'a reference in another format is rejected'
);

select throws_ok(
  $$ insert into public.requests (kind, locale, full_name, email, payload, idempotency_key)
     values ('contact', 'tr', 'Tekrar', 'tekrar@example.test', '{}', '30000000-0000-4000-8000-000000000002') $$,
  '23505', null,
  'an idempotency key is accepted only once'
);

select results_eq(
  $$ select a.action, a.actor_id from public.request_activity as a
     join public.requests as r on r.id = a.request_id
     where r.idempotency_key = '30000000-0000-4000-8000-000000000001' $$,
  $$ values ('created'::text, null::uuid) $$,
  'inserting a request writes a created activity row'
);

select throws_ok(
  $$ insert into public.requests (kind, status, locale, full_name, email, payload, idempotency_key)
     values ('contact', 'in_progress', 'tr', 'X', 'x@example.test', '{}', gen_random_uuid()) $$,
  '23514', null,
  'an in-progress request needs an assignee'
);

select throws_ok(
  $$ insert into public.requests (kind, locale, full_name, email, payload, idempotency_key)
     values ('event', 'tr', 'X', 'x@example.test', '{}', gen_random_uuid()) $$,
  '23514', null,
  'an event request needs an event'
);

-- Settings and staff data rules -------------------------------------------------------------------

select results_eq(
  $$ select key, value from public.app_settings order by key $$,
  $$ values ('digest_enabled'::text, 'true'::jsonb), ('digest_interval_minutes'::text, '120'::jsonb) $$,
  'app_settings is seeded with the digest defaults'
);

select throws_ok(
  $$ update public.app_settings set value = '1' where key = 'digest_interval_minutes' $$,
  '23514', null,
  'the digest interval has a lower bound'
);

select throws_ok(
  $$ update public.app_settings set value = '"often"' where key = 'digest_interval_minutes' $$,
  '23514', null,
  'the digest interval must be a number'
);

insert into public.staff_members (email, full_name, role) values ('  Mixed.Case@Dragoman.TEST ', 'Karışık', 'content');

select ok(
  exists (select 1 from public.staff_members where email = 'mixed.case@dragoman.test'),
  'staff e-mail is stored trimmed and lower-case'
);

select throws_ok(
  $$ insert into public.staff_members (email, full_name, role, extra_permissions)
     values ('perm@dragoman.test', 'İzin', 'content', array['everything']) $$,
  '23514', null,
  'unknown extra permissions are rejected'
);

select ok((select count(*) from public.events where id <> 'pgtap-event') > 0, 'seed.sql loaded the site''s events');

-- service_role (the submit-request function) has what it needs ----------------------------------------

set local role service_role;

select lives_ok(
  $$ select e.id, o.price from public.events as e left join public.event_options as o on o.event_id = e.id $$,
  'service_role reads events and options'
);
select lives_ok(
  $$ insert into public.requests (kind, locale, full_name, email, payload, event_id, idempotency_key)
     values ('event', 'fr', 'Service', 'service@example.test', '{"count": 2}', 'pgtap-event', gen_random_uuid())
     on conflict (idempotency_key) do nothing $$,
  'service_role inserts a request (reference default and created trigger included)'
);
select lives_ok(
  $$ with queued as (
       insert into public.notifications (request_id, kind, recipient, locale)
       select id, 'customer_receipt', email, locale from public.requests where email = 'service@example.test'
       returning id
     )
     update public.notifications as n set status = 'failed', attempts = n.attempts + 1, last_error = 'timeout'
     from queued where n.id = queued.id $$,
  'service_role writes the outbox'
);
select lives_ok(
  $$ insert into public.submission_throttle (ip_hash) values ('service-hash');
     select count(*) from public.submission_throttle where ip_hash = 'service-hash' and created_at > now() - interval '10 minutes';
     delete from public.submission_throttle where created_at < now() - interval '1 day' $$,
  'service_role records, counts and prunes the throttle'
);
select lives_ok(
  $$ update public.app_settings set value = 'false' where key = 'digest_enabled' $$,
  'service_role can change settings'
);

reset role;

select * from finish();
rollback;
