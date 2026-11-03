-- Revision requests (20261103150000_revisions.sql): revisions.use (main_admin by role, anyone else
-- through extra_permissions) sees every request; only main_admin sets Devam Ediyor / Tamamlandı and
-- everyone with the permission reopens a done request; a comment belongs to its author; screenshots
-- sit in a private bucket and attach to one's own request or comment; mails go to active holders of
-- the permission. Staff without it, former staff and anon get nothing.
begin;
create extension if not exists pgtap with schema extensions;

select plan(102);

create schema tests;
create table tests.people (name text primary key, user_id uuid not null, email text not null);
-- Ids handed from one signed-in person to the next.
create table tests.ids (name text primary key, id uuid not null);
grant usage on schema tests to anon, authenticated, service_role;
grant select on tests.people to anon, authenticated;
grant select, insert on tests.ids to authenticated, service_role;

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

create function tests.id(p_name text)
returns uuid
language sql
stable
as $$ select id from tests.ids where name = p_name $$;

/** <request id>/<the given file name>, the bucket path of one screenshot. */
create function tests.path(p_request text, p_file text)
returns text
language sql
stable
as $$ select tests.id(p_request)::text || '/' || p_file $$;

insert into tests.people (name, user_id, email) values
  ('admin',   '10000000-0000-4000-8000-000000000001', 'admin@dragoman.test'),
  ('client',  '10000000-0000-4000-8000-000000000002', 'client@dragoman.test'),
  ('client2', '10000000-0000-4000-8000-000000000003', 'client2@dragoman.test'),
  ('plain',   '10000000-0000-4000-8000-000000000004', 'plain@dragoman.test'),
  ('former',  '10000000-0000-4000-8000-000000000005', 'former@dragoman.test');

insert into auth.users (id, email, aud, role, email_confirmed_at)
select user_id, email, 'authenticated', 'authenticated', now() from tests.people;

insert into public.staff_members (id, email, full_name, role, extra_permissions, active, user_id) values
  ('20000000-0000-4000-8000-000000000001', 'admin@dragoman.test',   'Ana Yönetici', 'main_admin',   '{}',              true,  '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002', 'client@dragoman.test',  'Ayşe',         'content',      '{revisions.use}', true,  '10000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000003', 'client2@dragoman.test', 'Mehmet',       'accounting',   '{revisions.use}', true,  '10000000-0000-4000-8000-000000000003'),
  ('20000000-0000-4000-8000-000000000004', 'plain@dragoman.test',   'Rezervasyon',  'reservations', '{}',              true,  '10000000-0000-4000-8000-000000000004'),
  ('20000000-0000-4000-8000-000000000005', 'former@dragoman.test',  'Eski',         'content',      '{revisions.use}', false, '10000000-0000-4000-8000-000000000005');

-- The permission ---------------------------------------------------------------------------------

select ok(
  private.role_can('main_admin', '{}', 'revisions.use')
  and not private.role_can('content', '{}', 'revisions.use')
  and not private.role_can('reservations', '{}', 'revisions.use')
  and not private.role_can('accounting', '{}', 'revisions.use')
  and private.role_can('accounting', '{revisions.use}', 'revisions.use'),
  'revisions.use: main_admin through the role, every other role only through extra_permissions'
);

select tests.sign_in('admin');
select ok('revisions.use' = any (public.my_permissions()), 'my_permissions lists revisions.use for main_admin');
select tests.sign_in('client');
select is(public.my_permissions(), array['content.edit', 'content.translate', 'revisions.use'], 'and for a content editor who got it as an extra permission');
select tests.sign_in('plain');
select ok(not ('revisions.use' = any (public.my_permissions())), 'staff without the extra permission do not have it');
select tests.sign_in('former');
select is(public.my_permissions(), '{}'::text[], 'a deactivated member has no permissions, extra or not');

-- Requests -------------------------------------------------------------------------------------

select tests.sign_in('client');
select lives_ok(
  $$ with r as (insert into public.revision_requests (description, urgency) values ('Ana sayfadaki logo büyüsün', 7) returning id)
     insert into tests.ids select 'req1', id from r $$,
  'a permitted non-admin opens a request'
);
select results_eq(
  $$ select requester_id, status, urgency::int, completed_at is null from public.revision_requests where id = tests.id('req1') $$,
  $$ values ('20000000-0000-4000-8000-000000000002'::uuid, 'open'::text, 7, true) $$,
  'the requester is stamped from the session and the request starts Açık'
);
select throws_ok(
  $$ insert into public.revision_requests (description, urgency, requester_id) values ('x', 5, '20000000-0000-4000-8000-000000000001') $$,
  '42501', null, 'the requester cannot be chosen'
);
select throws_ok(
  $$ insert into public.revision_requests (description, urgency, status) values ('x', 5, 'done') $$,
  '42501', null, 'a request cannot start in another status'
);
select throws_ok(
  $$ insert into public.revision_requests (description, urgency) values ('x', 11) $$,
  '23514', null, 'urgency is 1 to 10'
);
select throws_ok(
  $$ insert into public.revision_requests (description, urgency) values ('   ', 5) $$,
  '23514', null, 'the description is required'
);
select throws_ok($$ update public.revision_requests set urgency = 1 $$, '42501', null, 'requests are not edited directly');
select throws_ok($$ delete from public.revision_requests $$, '42501', null, 'requests are never deleted');

select tests.sign_in('admin');
select lives_ok(
  $$ with r as (insert into public.revision_requests (description, urgency) values ('Panelde yazım hatası', 3) returning id)
     insert into tests.ids select 'req2', id from r $$,
  'main_admin opens requests too'
);
select ok(
  (select number from public.revision_requests where id = tests.id('req2')) > (select number from public.revision_requests where id = tests.id('req1')),
  'requests are numbered in order'
);

select tests.sign_in('client2');
select is((select count(*)::int from public.revision_requests), 2, 'another permitted member sees every request, not only their own');

select tests.sign_in('plain');
select is((select count(*)::int from public.revision_requests), 0, 'staff without revisions.use see no requests');
select throws_ok(
  $$ insert into public.revision_requests (description, urgency) values ('x', 5) $$,
  '42501', null, 'and cannot open one'
);

select tests.sign_in('former');
select is((select count(*)::int from public.revision_requests), 0, 'a deactivated member sees no requests');
select throws_ok(
  $$ insert into public.revision_requests (description, urgency) values ('x', 5) $$,
  '42501', null, 'and cannot open one'
);

-- Status ---------------------------------------------------------------------------------------

select tests.sign_in('client');
select throws_ok($$ select public.set_revision_status(tests.id('req1'), 'in_progress') $$, '42501', null, 'only main_admin sets Devam Ediyor');
select throws_ok($$ select public.set_revision_status(tests.id('req1'), 'done') $$, '42501', null, 'only main_admin sets Tamamlandı');

select tests.sign_in('admin');
select lives_ok($$ select public.set_revision_status(tests.id('req1'), 'in_progress') $$, 'main_admin sets Devam Ediyor');
select throws_ok($$ select public.set_revision_status(tests.id('req1'), 'in_progress') $$, '55000', null, 'setting the current status again is refused');

select tests.sign_in('client');
select throws_ok($$ select public.set_revision_status(tests.id('req1'), 'open') $$, '55000', null, 'a non-admin reopens only a done request');

select tests.sign_in('admin');
select lives_ok(
  $$ insert into tests.ids select 'done1', public.set_revision_status(tests.id('req1'), 'done') $$,
  'main_admin sets Tamamlandı'
);
select ok(
  (select status = 'done' and completed_at is not null from public.revision_requests where id = tests.id('req1')),
  'completion is stamped'
);

select tests.sign_in('client2');
select throws_ok($$ select public.set_revision_status(tests.id('req1'), 'in_progress') $$, '42501', null, 'a non-admin cannot move a done request on to Devam Ediyor');
select lives_ok(
  $$ with c as (insert into public.revision_comments (request_id, body) values (tests.id('req1'), 'Logo hâlâ küçük') returning id)
     insert into tests.ids select 'c2', id from c $$,
  'any permitted member comments on any request, a done one too'
);
select lives_ok($$ select public.set_revision_status(tests.id('req1'), 'open') $$, 'anyone with revisions.use reopens a done request');
select results_eq(
  $$ select r.status, r.completed_at is null, (select count(*)::int from public.revision_comments as c where c.request_id = r.id)
     from public.revision_requests as r where r.id = tests.id('req1') $$,
  $$ values ('open'::text, true, 1) $$,
  'reopening keeps the same record and its thread'
);
select is((select count(*)::int from public.revision_requests), 2, 'reopening creates no new request');
select results_eq(
  $$ select id, from_status, to_status, changed_by from public.revision_status_changes
     where request_id = tests.id('req1') and to_status = 'done' $$,
  $$ select tests.id('done1'), 'in_progress'::text, 'done'::text, '20000000-0000-4000-8000-000000000001'::uuid $$,
  'set_revision_status returns the id of its change row'
);
select results_eq(
  $$ select from_status, to_status, changed_by from public.revision_status_changes where request_id = tests.id('req1') order by created_at $$,
  $$ values ('open'::text, 'in_progress'::text, '20000000-0000-4000-8000-000000000001'::uuid),
            ('in_progress', 'done', '20000000-0000-4000-8000-000000000001'),
            ('done', 'open', '20000000-0000-4000-8000-000000000003') $$,
  'every change is on record with who made it'
);
select throws_ok($$ select public.set_revision_status(tests.id('req1'), 'closed') $$, '22023', null, 'unknown statuses are refused');
select throws_ok(
  $$ select public.set_revision_status('30000000-0000-4000-8000-00000000ffff', 'open') $$,
  'P0002', null, 'an unknown request is reported as such'
);
select throws_ok(
  $$ insert into public.revision_status_changes (request_id, from_status, to_status, changed_by)
     values (tests.id('req1'), 'open', 'done', '20000000-0000-4000-8000-000000000003') $$,
  '42501', null, 'the status history is written only by set_revision_status'
);

select tests.sign_in('plain');
select throws_ok($$ select public.set_revision_status(tests.id('req1'), 'open') $$, '42501', null, 'staff without revisions.use change no status');
select is((select count(*)::int from public.revision_status_changes), 0, 'and see no status history');
select tests.sign_in('former');
select throws_ok($$ select public.set_revision_status(tests.id('req1'), 'open') $$, '42501', null, 'neither do former staff');
select is((select count(*)::int from public.revision_status_changes), 0, 'nor do they see the history');

-- Comments -------------------------------------------------------------------------------------

select tests.sign_in('client');
select lives_ok(
  $$ with c as (insert into public.revision_comments (request_id, body) values (tests.id('req1'), 'Sağ üstteki logo') returning id)
     insert into tests.ids select 'c1', id from c $$,
  'the requester comments'
);
select is((select author_id from public.revision_comments where id = tests.id('c1')), '20000000-0000-4000-8000-000000000002'::uuid, 'the author is stamped from the session');
select throws_ok(
  $$ insert into public.revision_comments (request_id, body, author_id) values (tests.id('req1'), 'x', '20000000-0000-4000-8000-000000000001') $$,
  '42501', null, 'the author cannot be chosen'
);
select throws_ok(
  $$ insert into public.revision_comments (request_id, body) values (tests.id('req1'), ' ') $$,
  '23514', null, 'an empty comment is refused'
);

update public.revision_comments set body = 'Değiştirdim' where id = tests.id('c2');
select is((select body from public.revision_comments where id = tests.id('c2')), 'Logo hâlâ küçük', 'nobody edits someone else''s comment');

select lives_ok($$ update public.revision_comments set body = 'Sağ üstteki logo, iki kat' where id = tests.id('c1') $$, 'the author edits their own comment');
select results_eq(
  $$ select body, edited_at is not null from public.revision_comments where id = tests.id('c1') $$,
  $$ values ('Sağ üstteki logo, iki kat'::text, true) $$,
  'the edit is stamped'
);
select throws_ok(
  $$ update public.revision_comments set author_id = '20000000-0000-4000-8000-000000000001' where id = tests.id('c1') $$,
  '42501', null, 'the author cannot be changed'
);
select throws_ok(
  $$ update public.revision_comments set request_id = tests.id('req2') where id = tests.id('c1') $$,
  '42501', null, 'a comment cannot move to another request'
);
select throws_ok($$ delete from public.revision_comments $$, '42501', null, 'comments are never deleted');

select tests.sign_in('admin');
update public.revision_comments set body = 'Yönetici yazdı' where id = tests.id('c1');
select is((select body from public.revision_comments where id = tests.id('c1')), 'Sağ üstteki logo, iki kat', 'main_admin does not edit others'' comments either');

select tests.sign_in('client2');
select is((select count(*)::int from public.revision_comments where request_id = tests.id('req1')), 2, 'every permitted member reads the whole thread, others'' comments included');

select tests.sign_in('plain');
select is((select count(*)::int from public.revision_comments), 0, 'staff without revisions.use see no comments');
select throws_ok(
  $$ insert into public.revision_comments (request_id, body) values (tests.id('req1'), 'x') $$,
  '42501', null, 'and cannot comment'
);

-- Screenshots ----------------------------------------------------------------------------------

reset role;
select results_eq(
  $$ select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'revision-screenshots' $$,
  $$ values (false, 5242880::bigint, array['image/png', 'image/jpeg', 'image/webp']) $$,
  'revision-screenshots is private, 5 MiB, PNG / JPEG / WebP only'
);
select is_empty(
  $$ select policyname from pg_policies
     where schemaname = 'storage' and tablename = 'objects' and cmd not in ('INSERT', 'SELECT') $$,
  'no policy anywhere lets the API replace or delete stored files'
);

select tests.sign_in('client');
select lives_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('revision-screenshots', tests.path('req1', '40000000-0000-4000-8000-000000000001.png'), '10000000-0000-4000-8000-000000000002') $$,
  'the requester uploads into the request''s folder'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name)
     values ('revision-screenshots', '40000000-0000-4000-8000-00000000dead/40000000-0000-4000-8000-000000000002.png') $$,
  '42501', null, 'the folder must be an existing request'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('revision-screenshots', tests.path('req1', 'ekran.gif')) $$,
  '42501', null, 'the file name is a uuid ending in .png, .jpg or .webp'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name)
     values ('revision-screenshots', tests.path('req1', 'alt/40000000-0000-4000-8000-000000000002.png')) $$,
  '42501', null, 'no nested folders'
);
select lives_ok(
  $$ insert into public.revision_attachments (request_id, object_path)
     values (tests.id('req1'), tests.path('req1', '40000000-0000-4000-8000-000000000001.png')) $$,
  'the requester attaches the screenshot to their request'
);
select is(
  (select uploaded_by from public.revision_attachments where object_path = tests.path('req1', '40000000-0000-4000-8000-000000000001.png')),
  '20000000-0000-4000-8000-000000000002'::uuid,
  'the uploader is stamped from the session'
);
select throws_ok(
  $$ insert into public.revision_attachments (request_id, object_path)
     values (tests.id('req1'), tests.path('req1', '40000000-0000-4000-8000-00000000beef.png')) $$,
  '42501', null, 'a row needs its file uploaded first'
);

-- client opens a second request (req3) and keeps an unattached file in req1's folder.
with r as (insert into public.revision_requests (description, urgency) values ('Footer bağlantısı kırık', 2) returning id)
insert into tests.ids select 'req3', id from r;
insert into storage.objects (bucket_id, name, owner_id)
values ('revision-screenshots', tests.path('req1', '40000000-0000-4000-8000-000000000005.jpg'), '10000000-0000-4000-8000-000000000002');
select throws_ok(
  $$ insert into public.revision_attachments (request_id, object_path)
     values (tests.id('req3'), tests.path('req1', '40000000-0000-4000-8000-000000000005.jpg')) $$,
  '23514', null, 'a file must sit in its own request''s folder'
);
-- Deletes are also refused by storage's own protect_delete trigger; renaming is up to the policies.
update storage.objects set name = tests.path('req1', '40000000-0000-4000-8000-00000000000f.png') where bucket_id = 'revision-screenshots';
select is(
  (select count(*)::int from storage.objects where bucket_id = 'revision-screenshots' and name like '%-00000000000f.png'),
  0,
  'a member cannot rename or overwrite a stored file'
);

select tests.sign_in('client2');
insert into storage.objects (bucket_id, name, owner_id) values
  ('revision-screenshots', tests.path('req1', '40000000-0000-4000-8000-000000000003.png'), '10000000-0000-4000-8000-000000000003'),
  ('revision-screenshots', tests.path('req1', '40000000-0000-4000-8000-000000000004.webp'), '10000000-0000-4000-8000-000000000003');
select lives_ok(
  $$ insert into public.revision_attachments (request_id, comment_id, object_path)
     values (tests.id('req1'), tests.id('c2'), tests.path('req1', '40000000-0000-4000-8000-000000000003.png')) $$,
  'a comment''s author uploads into the request''s folder and attaches the file to the comment'
);
select throws_ok(
  $$ insert into public.revision_attachments (request_id, object_path)
     values (tests.id('req1'), tests.path('req1', '40000000-0000-4000-8000-000000000004.webp')) $$,
  '42501', null, 'only the requester attaches to the request itself'
);
select throws_ok(
  $$ insert into public.revision_attachments (request_id, comment_id, object_path)
     values (tests.id('req1'), tests.id('c1'), tests.path('req1', '40000000-0000-4000-8000-000000000004.webp')) $$,
  '42501', null, 'nobody attaches to someone else''s comment'
);
select throws_ok(
  $$ insert into public.revision_attachments (request_id, comment_id, object_path)
     values (tests.id('req1'), tests.id('c2'), tests.path('req1', '40000000-0000-4000-8000-000000000005.jpg')) $$,
  '42501', null, 'nobody claims a file someone else uploaded'
);
select throws_ok(
  $$ insert into public.revision_attachments (request_id, comment_id, object_path)
     values (tests.id('req3'), tests.id('c2'), tests.path('req1', '40000000-0000-4000-8000-000000000004.webp')) $$,
  '42501', null, 'a comment of one request cannot carry a screenshot of another'
);
select throws_ok($$ update public.revision_attachments set comment_id = null $$, '42501', null, 'attachments are not changed');
select throws_ok($$ delete from public.revision_attachments $$, '42501', null, 'or deleted');

select tests.sign_in('admin');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('revision-screenshots', tests.path('req1', '40000000-0000-4000-8000-000000000006.png'), '10000000-0000-4000-8000-000000000001') $$,
  '42501', null, 'uploading into a request needs having opened it or commented on it'
);

select tests.sign_in('client');
select results_eq(
  $$ select (select count(*)::int from public.revision_attachments), (select count(*)::int from storage.objects where bucket_id = 'revision-screenshots') $$,
  $$ values (2, 4) $$,
  'permitted members see every attachment row and file'
);

select tests.sign_in('plain');
select is_empty($$ select 1 from public.revision_attachments $$, 'staff without revisions.use see no attachment rows');
select is_empty($$ select 1 from storage.objects where bucket_id = 'revision-screenshots' $$, 'nor the files');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('revision-screenshots', tests.path('req1', '40000000-0000-4000-8000-000000000009.png')) $$,
  '42501', null, 'nor upload'
);

-- At most 10 per request or comment: nine more on req1 (as the database itself), then the 11th.
reset role;
reset request.jwt.claims;
insert into storage.objects (bucket_id, name)
select 'revision-screenshots', tests.path('req1', format('40000000-0000-4000-8000-0000000001%s.png', lpad(n::text, 2, '0')))
from generate_series(1, 10) as n;
insert into public.revision_attachments (request_id, object_path, uploaded_by)
select tests.id('req1'), tests.path('req1', format('40000000-0000-4000-8000-0000000001%s.png', lpad(n::text, 2, '0'))),
       '20000000-0000-4000-8000-000000000002'
from generate_series(1, 9) as n;
select throws_ok(
  $$ insert into public.revision_attachments (request_id, object_path, uploaded_by)
     values (tests.id('req1'), tests.path('req1', '40000000-0000-4000-8000-000000000110.png'), '20000000-0000-4000-8000-000000000002') $$,
  '54000', null, 'a request carries at most 10 screenshots'
);

-- Notifications --------------------------------------------------------------------------------

set local role service_role;
select results_eq(
  $$ select staff_id, email from public.revision_recipients(null) $$,
  $$ values ('20000000-0000-4000-8000-000000000001'::uuid, 'admin@dragoman.test'::text),
            ('20000000-0000-4000-8000-000000000002', 'client@dragoman.test'),
            ('20000000-0000-4000-8000-000000000003', 'client2@dragoman.test') $$,
  'mails go to active staff with revisions.use: main_admin and the extra-permission holders'
);
select results_eq(
  $$ select staff_id from public.revision_recipients('20000000-0000-4000-8000-000000000002') $$,
  $$ values ('20000000-0000-4000-8000-000000000001'::uuid), ('20000000-0000-4000-8000-000000000003') $$,
  'the person who did the action is left out'
);
select lives_ok(
  $$ insert into public.revision_notifications (request_id, event, source_id, actor_id, recipient_id, recipient, status)
     values (tests.id('req1'), 'created', tests.id('req1'), '20000000-0000-4000-8000-000000000002',
             '20000000-0000-4000-8000-000000000001', 'admin@dragoman.test', 'smtp_not_configured') $$,
  'service_role records a notification outcome'
);
select throws_ok(
  $$ insert into public.revision_notifications (request_id, event, source_id, actor_id, recipient_id, recipient)
     values (tests.id('req1'), 'created', tests.id('req1'), '20000000-0000-4000-8000-000000000002',
             '20000000-0000-4000-8000-000000000001', 'admin@dragoman.test') $$,
  '23505', null, 'one notification per event and recipient, however often it is asked for'
);
select throws_ok(
  $$ insert into public.revision_notifications (request_id, event, source_id, actor_id, recipient_id, recipient, status)
     values (tests.id('req1'), 'done', tests.id('done1'), '20000000-0000-4000-8000-000000000001',
             '20000000-0000-4000-8000-000000000002', 'client@dragoman.test', 'delivered') $$,
  '23514', null, 'an outcome is pending, sent, failed or smtp_not_configured'
);
reset role;

select tests.sign_in('client');
select throws_ok($$ select * from public.revision_notifications $$, '42501', null, 'staff cannot read the notification log');
select throws_ok($$ select * from public.revision_recipients(null) $$, '42501', null, 'staff cannot list the recipients'' addresses');

-- Deactivation ---------------------------------------------------------------------------------

reset role;
update public.staff_members set active = false where id = '20000000-0000-4000-8000-000000000003';

select tests.sign_in('client2');
select is((select count(*)::int from public.revision_requests), 0, 'deactivating a member cuts their access at once');
select results_eq(
  $$ select (select count(*)::int from public.revision_comments), (select count(*)::int from public.revision_attachments),
            (select count(*)::int from storage.objects where bucket_id = 'revision-screenshots') $$,
  $$ values (0, 0, 0) $$,
  'no comments, attachment rows or files either'
);
select throws_ok(
  $$ insert into public.revision_comments (request_id, body) values (tests.id('req1'), 'x') $$,
  '42501', null, 'and they can no longer comment'
);
update public.revision_comments set body = 'Sonradan değiştirdim' where id = tests.id('c2');
reset role;
select is((select body from public.revision_comments where id = tests.id('c2')), 'Logo hâlâ küçük', 'nor edit their own earlier comment');

set local role service_role;
select ok(
  not exists (select 1 from public.revision_recipients(null) where staff_id = '20000000-0000-4000-8000-000000000003'),
  'a deactivated member gets no further mails'
);
select ok(
  exists (select 1 from public.revision_comments where author_id = '20000000-0000-4000-8000-000000000003'),
  'their earlier comments stay'
);
reset role;

-- Anon and grants ------------------------------------------------------------------------------

set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);
select throws_ok($$ select * from public.revision_requests $$, '42501', null, 'anon reads no requests');
select throws_ok(
  $$ select public.set_revision_status('30000000-0000-4000-8000-00000000ffff', 'open') $$,
  '42501', null, 'anon cannot call set_revision_status'
);
select is_empty($$ select 1 from storage.objects where bucket_id = 'revision-screenshots' $$, 'anon reads no screenshots');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name)
     values ('revision-screenshots', '30000000-0000-4000-8000-00000000ffff/40000000-0000-4000-8000-000000000001.png') $$,
  '42501', null, 'anon uploads nothing'
);
reset role;

select is_empty(
  $$ select c.relname from pg_class as c join pg_namespace as n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relname like 'revision\_%' and c.relkind = 'r'
       and (has_table_privilege('anon', c.oid, 'select, insert, update, delete, truncate, references, trigger')
            or has_any_column_privilege('anon', c.oid, 'select, insert, update, references')) $$,
  'anon has no privilege on any revision table'
);
select is_empty(
  $$ select c.relname from pg_class as c join pg_namespace as n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relname like 'revision\_%' and c.relkind = 'r' and not c.relrowsecurity $$,
  'RLS is on for every revision table'
);
select results_eq(
  $$ select c.relname::text collate "default",
            has_table_privilege('authenticated', c.oid, 'select'),
            has_table_privilege('authenticated', c.oid, 'insert'),
            has_table_privilege('authenticated', c.oid, 'update'),
            has_table_privilege('authenticated', c.oid, 'delete, truncate')
     from pg_class as c join pg_namespace as n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relname like 'revision\_%' and c.relkind = 'r'
     order by 1 $$,
  $$ values ('revision_attachments'::text, true, false, false, false),
            ('revision_comments', true, false, false, false),
            ('revision_notifications', false, false, false, false),
            ('revision_requests', true, false, false, false),
            ('revision_status_changes', true, false, false, false) $$,
  'authenticated reads four tables, never the notification log, and has no table-wide write'
);
select ok(
  has_column_privilege('authenticated', 'public.revision_requests', 'description', 'insert')
  and has_column_privilege('authenticated', 'public.revision_requests', 'urgency', 'insert')
  and not has_column_privilege('authenticated', 'public.revision_requests', 'requester_id', 'insert')
  and not has_column_privilege('authenticated', 'public.revision_requests', 'status', 'insert')
  and not has_any_column_privilege('authenticated', 'public.revision_requests', 'update')
  and has_column_privilege('authenticated', 'public.revision_comments', 'body', 'update')
  and not has_column_privilege('authenticated', 'public.revision_comments', 'author_id', 'insert')
  and not has_column_privilege('authenticated', 'public.revision_comments', 'author_id', 'update')
  and not has_any_column_privilege('authenticated', 'public.revision_status_changes', 'insert, update')
  and has_column_privilege('authenticated', 'public.revision_attachments', 'object_path', 'insert')
  and not has_column_privilege('authenticated', 'public.revision_attachments', 'uploaded_by', 'insert')
  and not has_any_column_privilege('authenticated', 'public.revision_attachments', 'update')
  and not has_any_column_privilege('authenticated', 'public.revision_notifications', 'select, insert, update'),
  'authenticated writes only the columns a person may choose'
);
select ok(
  not has_sequence_privilege('anon', 'public.revision_requests_number_seq', 'usage, select, update')
  and not has_sequence_privilege('authenticated', 'public.revision_requests_number_seq', 'usage, select, update'),
  'the request number sequence is not exposed'
);
select ok(
  has_function_privilege('authenticated', 'public.set_revision_status(uuid, text)', 'execute')
  and not has_function_privilege('anon', 'public.set_revision_status(uuid, text)', 'execute')
  and has_function_privilege('service_role', 'public.revision_recipients(uuid)', 'execute')
  and not has_function_privilege('authenticated', 'public.revision_recipients(uuid)', 'execute')
  and not has_function_privilege('anon', 'public.revision_recipients(uuid)', 'execute'),
  'set_revision_status is for signed-in staff (its body checks revisions.use), revision_recipients for service_role only'
);

select * from finish();
rollback;
