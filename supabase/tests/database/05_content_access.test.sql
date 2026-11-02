-- Dalga 2 access: my_permissions, content tables, grants and the service_role-only release RPC.
begin;
create extension if not exists pgtap with schema extensions;

select plan(62);

-- Fixtures (rolled back) ----------------------------------------------------------------------

create schema tests;
create table tests.people (name text primary key, user_id uuid not null, email text not null);
grant usage on schema tests to anon, authenticated;
grant select on tests.people to anon, authenticated;

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
  ('admin',     '10000000-0000-4000-8000-000000000001', 'admin@dragoman.test'),
  ('resv',      '10000000-0000-4000-8000-000000000002', 'resv@dragoman.test'),
  ('acct',      '10000000-0000-4000-8000-000000000003', 'acct@dragoman.test'),
  ('editor',    '10000000-0000-4000-8000-000000000004', 'editor@dragoman.test'),
  ('publisher', '10000000-0000-4000-8000-000000000005', 'publisher@dragoman.test'),
  ('stranger',  '10000000-0000-4000-8000-000000000006', 'stranger@example.test'),
  ('former',    '10000000-0000-4000-8000-000000000007', 'former@dragoman.test');

insert into auth.users (id, email, aud, role, email_confirmed_at)
select user_id, email, 'authenticated', 'authenticated', now() from tests.people;

insert into public.staff_members (id, email, full_name, role, extra_permissions, active, user_id) values
  ('20000000-0000-4000-8000-000000000001', 'admin@dragoman.test',     'Ana Yönetici', 'main_admin',   '{}',                  true,  '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002', 'resv@dragoman.test',      'Rezervasyon',  'reservations', '{}',                  true,  '10000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000003', 'acct@dragoman.test',      'Muhasebe',     'accounting',   '{}',                  true,  '10000000-0000-4000-8000-000000000003'),
  ('20000000-0000-4000-8000-000000000004', 'editor@dragoman.test',    'İçerik',       'content',      '{}',                  true,  '10000000-0000-4000-8000-000000000004'),
  ('20000000-0000-4000-8000-000000000005', 'publisher@dragoman.test', 'Yayıncı',      'content',      '{content.publish}',   true,  '10000000-0000-4000-8000-000000000005'),
  ('20000000-0000-4000-8000-000000000007', 'former@dragoman.test',    'Eski İçerik',  'content',      '{}',                  false, '10000000-0000-4000-8000-000000000007');

-- my_permissions ------------------------------------------------------------------------------------

select tests.sign_in('admin');
select is(
  public.my_permissions(),
  array['content.edit', 'content.publish', 'content.translate', 'forms.manage', 'requests.read', 'requests.reassign',
        'requests.work', 'settings.manage', 'site.deploy', 'staff.manage'],
  'main_admin has every permission'
);
reset role;
select tests.sign_in('editor');
select is(public.my_permissions(), array['content.edit', 'content.translate'], 'content edits and translates, but does not publish');
reset role;
select tests.sign_in('publisher');
select is(
  public.my_permissions(), array['content.edit', 'content.publish', 'content.translate'],
  'content.publish can be granted per person through extra_permissions'
);
reset role;
select tests.sign_in('resv');
select is(public.my_permissions(), array['requests.read', 'requests.work'], 'reservations keeps its request permissions only');
reset role;
select tests.sign_in('acct');
select is(public.my_permissions(), array['requests.read'], 'accounting reads requests only');
reset role;
select tests.sign_in('editor', 'aal1');
select is(public.my_permissions(), '{}'::text[], 'without AAL2 my_permissions is empty');
reset role;
select tests.sign_in('stranger');
select is(public.my_permissions(), '{}'::text[], 'a stranger has no permissions');
reset role;
select tests.sign_in('former');
select is(public.my_permissions(), '{}'::text[], 'inactive staff have no permissions');
reset role;

select throws_ok(
  $$ insert into public.staff_members (email, full_name, role, extra_permissions)
     values ('x@dragoman.test', 'X', 'content', array['content.everything']) $$,
  '23514', null, 'unknown extra permissions are still rejected'
);
select lives_ok(
  $$ insert into public.staff_members (email, full_name, role, extra_permissions)
     values ('y@dragoman.test', 'Y', 'reservations', array['forms.manage', 'site.deploy', 'content.translate']) $$,
  'the Dalga 2 permissions are known extras'
);

-- anon ----------------------------------------------------------------------------------------------

set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

select throws_ok('select 1 from public.content_entries', '42501', null, 'anon cannot read content_entries');
select throws_ok('select 1 from public.content_entry_list', '42501', null, 'anon cannot read content_entry_list');
select throws_ok('select 1 from public.media_assets', '42501', null, 'anon cannot read media_assets');
select throws_ok('select 1 from public.content_releases', '42501', null, 'anon cannot read content_releases');
select throws_ok('select 1 from public.site_deploys', '42501', null, 'anon cannot read site_deploys');
select throws_ok('select 1 from public.form_definitions', '42501', null, 'anon cannot read form_definitions');
select throws_ok('select 1 from public.form_versions', '42501', null, 'anon cannot read form_versions');
select throws_ok('select 1 from public.translation_runs', '42501', null, 'anon cannot read translation_runs');
select throws_ok('select public.my_permissions()', '42501', null, 'anon cannot call my_permissions');
select throws_ok('select public.request_site_deploy()', '42501', null, 'anon cannot call request_site_deploy');

-- Strangers, AAL1, reservations and accounting see no content ---------------------------------------

reset role;
select tests.sign_in('stranger');
select is_empty('select 1 from public.content_entries', 'a stranger sees no content');
select is_empty('select 1 from public.media_assets', 'a stranger sees no media');
reset role;
select tests.sign_in('editor', 'aal1');
select is_empty('select 1 from public.content_entries', 'content staff without AAL2 see no content');
select is_empty('select 1 from public.content_entry_list', 'content staff without AAL2 see an empty list');
reset role;
select tests.sign_in('resv');
select is_empty('select 1 from public.content_entries', 'reservations sees no content');
select is_empty('select 1 from public.form_definitions', 'reservations sees no form drafts');
select is((select count(*) from public.form_versions), 4::bigint, 'reservations reads published form versions (requests.read)');
reset role;
select tests.sign_in('acct');
select is_empty('select 1 from public.media_assets', 'accounting sees no media');
select is_empty('select 1 from public.site_deploys', 'accounting sees no deploys');

-- content: drafts yes, published copies and status no ------------------------------------------------

reset role;
select tests.sign_in('editor');

select ok((select count(*) from public.content_entries) > 0, 'content reads entries');
select results_eq(
  $$ select status, has_changes from public.content_entry_list where type = 'home' $$,
  $$ values ('published'::public.content_status, false) $$,
  'the list shows status and unpublished changes'
);
select ok((select count(*) from public.media_assets) > 0, 'content reads media');
select lives_ok('select id, action, snapshot_sha256 from public.content_releases', 'content reads release rows');
select throws_ok('select snapshot from public.content_releases', '42501', null, 'the snapshot column is not readable by staff');
select lives_ok('select * from public.site_deploys', 'content reads the deploy queue');
select lives_ok('select * from public.translation_runs', 'content.translate reads translation runs');
select is_empty('select 1 from public.form_definitions', 'content does not see form drafts');
select is_empty('select 1 from public.form_versions', 'content does not see form versions');

select lives_ok(
  $$ insert into public.content_entries (type, key, draft)
     values ('team_member', 'pgtap-member',
             '{"id": "pgtap-member", "order": 99, "name": "Deneme", "role": {"tr": "Rehber"}}') $$,
  'content creates a draft entry'
);
update public.content_entries set draft = draft || '{"name": "Deneme 2"}' where key = 'pgtap-member';
select results_eq(
  $$ select draft_revision, created_by, updated_by from public.content_entries where key = 'pgtap-member' $$,
  $$ values (2, '20000000-0000-4000-8000-000000000004'::uuid, '20000000-0000-4000-8000-000000000004'::uuid) $$,
  'saving the draft bumps draft_revision and records the editor'
);
select throws_ok(
  $$ update public.content_entries set published = draft where key = 'pgtap-member' $$,
  '42501', null, 'content cannot write published'
);
select throws_ok(
  $$ update public.content_entries set status = 'published' where key = 'pgtap-member' $$,
  '42501', null, 'content cannot write status'
);
select throws_ok(
  $$ update public.content_entries set slug_history = '[]' where type = 'event' $$,
  '42501', null, 'content cannot write slug_history'
);
select throws_ok(
  $$ update public.content_entries set draft_revision = 1 where key = 'pgtap-member' $$,
  '42501', null, 'content cannot set draft_revision'
);
select throws_ok(
  $$ insert into public.content_entries (type, key, draft, published, status)
     values ('team_member', 'pgtap-sneak', '{"id": "pgtap-sneak"}', '{"id": "pgtap-sneak"}', 'published') $$,
  '42501', null, 'content cannot insert a published entry'
);
select throws_ok(
  $$ insert into public.content_entries (type, key, draft) values ('team_member', 'pgtap-other', '{"id": "different"}') $$,
  '23514', null, 'the document id must be the entry key'
);

delete from public.content_entries where type = 'home';
delete from public.content_entries where key = 'pgtap-member';
reset role;
select ok(exists (select 1 from public.content_entries where type = 'home'), 'a published entry cannot be deleted');
select ok(
  not exists (select 1 from public.content_entries where key = 'pgtap-member'),
  'a never-published draft can be deleted'
);

select tests.sign_in('editor');
select throws_ok(
  $$ insert into public.media_assets (id, storage, width, height, alt, topic)
     values ('pgtap-repo', 'repo', 100, 100, '{"tr": "x"}', 'test') $$,
  '42501', null, 'content cannot add repo media'
);
select lives_ok(
  $$ insert into public.media_assets (id, object_path, sha256, width, height, bytes, alt, topic, rights)
     values ('pgtap-photo', 'pgtap-photo/' || repeat('ab', 32) || '.jpg', repeat('ab', 32), 2000, 1500, 400000,
             '{"tr": "Deniz"}', 'test', 'confirmed') $$,
  'content uploads a media row'
);
update public.media_assets set alt = '{"tr": "Mavi deniz"}' where id = 'pgtap-photo';
select results_eq(
  $$ select revision, rights_confirmed_by from public.media_assets where id = 'pgtap-photo' $$,
  $$ values (2, '20000000-0000-4000-8000-000000000004'::uuid) $$,
  'media edits bump revision and the rights confirmation records who confirmed'
);
select lives_ok(
  $$ update public.media_assets set alt = alt || '{"en": "Sea"}' where storage = 'repo' and id = (select min(id) from public.media_assets where storage = 'repo') $$,
  'content edits a repo image''s alt text'
);
select throws_ok(
  $$ update public.media_assets set bytes = 10 where storage = 'repo' $$,
  '22023', null, 'a repo image''s files cannot change'
);
select throws_ok('delete from public.media_assets', '42501', null, 'media cannot be deleted');
select throws_ok('select public.request_site_deploy()', '42501', null, 'content cannot force a deploy');
update public.form_definitions set draft = '{"format": 1, "fields": []}';
reset role;
select is((select max(draft_revision) from public.form_definitions), 1, 'content cannot edit forms (the update matches no row)');

-- main_admin ------------------------------------------------------------------------------------------

reset role;
select tests.sign_in('admin');
select is((select count(*) from public.form_definitions), 4::bigint, 'forms.manage reads the four form drafts');
select lives_ok('select public.request_site_deploy()', 'site.deploy queues a deploy');
select throws_ok(
  $$ insert into public.form_versions (kind, version, definition) values ('contact', 9, '{}') $$,
  '42501', null, 'form versions are written only by apply_content_release'
);

-- Grants: the release RPC is service_role only; no write grant on published state ---------------------

reset role;
select ok(
  not has_function_privilege('authenticated', 'public.apply_content_release(uuid, bigint, jsonb, jsonb, text, text, text)', 'execute')
  and not has_function_privilege('authenticated', 'private.apply_content_release(uuid, bigint, jsonb, jsonb, text, text, text)', 'execute')
  and has_function_privilege('service_role', 'public.apply_content_release(uuid, bigint, jsonb, jsonb, text, text, text)', 'execute'),
  'apply_content_release is for service_role only'
);
select tests.sign_in('admin');
select throws_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 1, '[]', '{}', repeat('a', 64), 'publish', null) $$,
  '42501', null, 'even main_admin cannot call apply_content_release directly'
);
reset role;
select is_empty(
  $$ select c.column_name::text from information_schema.columns as c
     where c.table_schema = 'public' and c.table_name = 'content_entries'
       and c.column_name in ('published', 'published_revision', 'status', 'slug_history', 'published_at', 'published_by', 'draft_revision', 'key', 'type')
       and has_column_privilege('authenticated', 'public.content_entries', c.column_name, 'update') $$,
  'no update grant on published state, revisions, type or key'
);

select * from finish();
rollback;
