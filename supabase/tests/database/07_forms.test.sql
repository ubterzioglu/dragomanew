-- Editable forms: seeded version 1, immutable versions, each request keeps its version, who edits drafts.
begin;
create extension if not exists pgtap with schema extensions;

select plan(17);

create schema tests;
create table tests.people (name text primary key, user_id uuid not null, email text not null);
grant usage on schema tests to authenticated;
grant select on tests.people to authenticated;

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
  ('admin',  '10000000-0000-4000-8000-000000000001', 'admin@dragoman.test'),
  ('resv',   '10000000-0000-4000-8000-000000000002', 'resv@dragoman.test'),
  ('editor', '10000000-0000-4000-8000-000000000004', 'editor@dragoman.test');

insert into auth.users (id, email, aud, role, email_confirmed_at)
select user_id, email, 'authenticated', 'authenticated', now() from tests.people;

insert into public.staff_members (id, email, full_name, role, user_id) values
  ('20000000-0000-4000-8000-000000000001', 'admin@dragoman.test',  'Ana Yönetici', 'main_admin',   '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002', 'resv@dragoman.test',   'Rezervasyon',  'reservations', '10000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000004', 'editor@dragoman.test', 'İçerik',       'content',      '10000000-0000-4000-8000-000000000004');

-- Seed --------------------------------------------------------------------------------------------

select results_eq(
  $$ select f.kind::text, f.published_version, f.draft = v.definition, f.draft_revision
     from public.form_definitions as f join public.form_versions as v on v.kind = f.kind and v.version = 1
     order by f.kind $$,
  $$ values ('event'::text, 1, true, 1), ('transport', 1, true, 1), ('lodging', 1, true, 1), ('contact', 1, true, 1) $$,
  'each form starts at version 1 with the built-in definition as its draft'
);
select ok(
  (select bool_and(jsonb_typeof(definition -> 'fields') = 'array' and (definition ->> 'format')::int = 1) from public.form_versions),
  'seeded versions are format 1 definitions'
);

-- Immutable versions ---------------------------------------------------------------------------------

select throws_ok(
  $$ update public.form_versions set definition = '{}' where kind = 'contact' $$,
  '55000', null, 'a published version cannot change'
);
select throws_ok(
  $$ delete from public.form_versions where kind = 'contact' $$,
  '55000', null, 'a published version cannot be deleted'
);

-- Requests keep their version -----------------------------------------------------------------------

set local role service_role;
select lives_ok(
  $$ insert into public.requests (kind, locale, full_name, email, payload, idempotency_key, form_version)
     values ('contact', 'tr', 'Ada', 'ada@example.test', '{"custom": {}}', '30000000-0000-4000-8000-000000000001', 1) $$,
  'a request stores the form version it was sent with'
);
select lives_ok(
  $$ insert into public.requests (kind, locale, full_name, email, payload, idempotency_key)
     values ('contact', 'tr', 'Can', 'can@example.test', '{}', '30000000-0000-4000-8000-000000000002') $$,
  'the version is optional (fixture builds and older clients)'
);
select throws_ok(
  $$ insert into public.requests (kind, locale, full_name, email, payload, idempotency_key, form_version)
     values ('contact', 'tr', 'X', 'x@example.test', '{}', gen_random_uuid(), 9) $$,
  '23503', null, 'an unknown version is refused'
);
select throws_ok(
  $$ insert into public.requests (kind, locale, full_name, email, payload, idempotency_key, form_version)
     values ('lodging', 'tr', 'X', 'x@example.test', '{}', gen_random_uuid(), 2) $$,
  '23503', null, 'the version belongs to the request kind'
);

-- Drafts: forms.manage only -------------------------------------------------------------------------

reset role;
select tests.sign_in('admin');
update public.form_definitions set draft = draft || '{"fields": []}' where kind = 'contact';
select throws_ok(
  $$ update public.form_definitions set published_version = 1 where kind = 'contact' $$,
  '42501', null, 'staff cannot move the published version'
);
select throws_ok(
  $$ update public.form_definitions set draft_revision = 1 where kind = 'contact' $$,
  '42501', null, 'staff cannot set the draft revision'
);
reset role;
select results_eq(
  $$ select draft_revision, updated_by, draft -> 'fields' from public.form_definitions where kind = 'contact' $$,
  $$ values (2, '20000000-0000-4000-8000-000000000001'::uuid, '[]'::jsonb) $$,
  'forms.manage saves a draft; the revision bumps and the editor is recorded'
);

select tests.sign_in('resv');
select is((select count(*) from public.form_versions), 4::bigint, 'requests.read reads versions (to show a request''s labels)');
select is_empty('select 1 from public.form_definitions', 'requests.read does not see drafts');
update public.form_definitions set draft = '{}' where kind = 'event';

reset role;
select tests.sign_in('editor');
select is_empty('select 1 from public.form_versions', 'the content role does not see form versions');

reset role;
select is((select draft_revision from public.form_definitions where kind = 'event'), 1, 'without forms.manage a draft update changes nothing');

-- A new version leaves requests on the old one --------------------------------------------------------

set local role service_role;
select is(
  public.apply_content_release('20000000-0000-4000-8000-000000000001', 1,
    '[{"op": "publish_form", "kind": "contact", "draftRevision": 2}]',
    '{"releaseId": 2}', repeat('a', 64), 'publish_form', null),
  2::bigint,
  'publishing the contact form'
);
select results_eq(
  $$ select form_version from public.requests where idempotency_key = '30000000-0000-4000-8000-000000000001' $$,
  $$ values (1) $$,
  'a request keeps its version after a new one is published'
);
reset role;

select * from finish();
rollback;
