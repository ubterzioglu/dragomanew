-- The media-originals bucket: private, 10 MiB, JPEG only; content.edit uploads and reads masters
-- at <id>/<sha256>.jpg; nobody updates or deletes them through the API.
begin;
create extension if not exists pgtap with schema extensions;

select plan(14);

create schema tests;
create table tests.people (name text primary key, user_id uuid not null, email text not null);
grant usage on schema tests to anon, authenticated;
grant select on tests.people to anon, authenticated;

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
  ('resv',   '10000000-0000-4000-8000-000000000002', 'resv@dragoman.test'),
  ('editor', '10000000-0000-4000-8000-000000000004', 'editor@dragoman.test');

insert into auth.users (id, email, aud, role, email_confirmed_at)
select user_id, email, 'authenticated', 'authenticated', now() from tests.people;

insert into public.staff_members (id, email, full_name, role, user_id) values
  ('20000000-0000-4000-8000-000000000001', 'admin@dragoman.test',  'Ana Yönetici', 'main_admin',   '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002', 'resv@dragoman.test',   'Rezervasyon',  'reservations', '10000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000004', 'editor@dragoman.test', 'İçerik',       'content',      '10000000-0000-4000-8000-000000000004');

-- The bucket ----------------------------------------------------------------------------------------

select results_eq(
  $$ select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'media-originals' $$,
  $$ values (false, 10485760::bigint, array['image/jpeg']) $$,
  'media-originals is private, 10 MiB, JPEG only'
);
select is_empty(
  $$ select policyname from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname like 'media_originals%' and cmd not in ('INSERT', 'SELECT') $$,
  'there is no update or delete policy for the masters'
);

-- Uploads ---------------------------------------------------------------------------------------------

select tests.sign_in('editor');
select lives_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('media-originals', 'pgtap-photo/' || repeat('ab', 32) || '.jpg', '10000000-0000-4000-8000-000000000004') $$,
  'content.edit uploads a master at <id>/<sha256>.jpg'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('media-originals', 'pgtap-photo/original.jpg') $$,
  '42501', null, 'any other path is refused'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('media-originals', 'Pgtap/' || repeat('ab', 32) || '.jpg') $$,
  '42501', null, 'the id part must be a lowercase slug'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('media-originals', 'a/b/' || repeat('ab', 32) || '.jpg') $$,
  '42501', null, 'no nested folders'
);
select is((select count(*) from storage.objects where bucket_id = 'media-originals'), 1::bigint, 'content.edit reads the masters');

update storage.objects set name = 'pgtap-photo/' || repeat('cd', 32) || '.jpg' where bucket_id = 'media-originals';
reset role;
select is(
  (select name from storage.objects where bucket_id = 'media-originals'),
  'pgtap-photo/' || repeat('ab', 32) || '.jpg',
  'a master cannot be renamed or replaced'
);

select tests.sign_in('editor', 'aal1');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('media-originals', 'pgtap-other/' || repeat('ab', 32) || '.jpg') $$,
  '42501', null, 'uploading needs AAL2'
);
select is_empty($$ select 1 from storage.objects where bucket_id = 'media-originals' $$, 'reading masters needs AAL2');

reset role;
select tests.sign_in('resv');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('media-originals', 'pgtap-other/' || repeat('ab', 32) || '.jpg') $$,
  '42501', null, 'reservations cannot upload'
);
select is_empty($$ select 1 from storage.objects where bucket_id = 'media-originals' $$, 'reservations cannot read masters');

reset role;
select tests.sign_in('admin');
select lives_ok(
  $$ insert into storage.objects (bucket_id, name) values ('media-originals', 'pgtap-admin/' || repeat('ef', 32) || '.jpg') $$,
  'main_admin uploads too'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);
select is_empty($$ select 1 from storage.objects where bucket_id = 'media-originals' $$, 'anon reads no masters');

reset role;
select * from finish();
rollback;
