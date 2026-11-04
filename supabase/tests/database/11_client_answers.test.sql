-- Answers to the open questions (20261104120000_client_answer_entries.sql): every active staff member
-- reads all entries and adds new ones, only the author changes an entry's text, nobody deletes;
-- outsiders, former staff and anon get nothing.
begin;
create extension if not exists pgtap with schema extensions;

select plan(22);

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
  ('acct',     '10000000-0000-4000-8000-000000000003', 'acct@dragoman.test'),
  ('stranger', '10000000-0000-4000-8000-000000000006', 'stranger@example.test'),
  ('former',   '10000000-0000-4000-8000-000000000007', 'former@dragoman.test');

insert into auth.users (id, email, aud, role, email_confirmed_at)
select user_id, email, 'authenticated', 'authenticated', now() from tests.people;

insert into public.staff_members (id, email, full_name, role, active, user_id) values
  ('20000000-0000-4000-8000-000000000001', 'admin@dragoman.test',  'Ana Yönetici', 'main_admin', true,  '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000003', 'acct@dragoman.test',   'Muhasebe',     'accounting', true,  '10000000-0000-4000-8000-000000000003'),
  ('20000000-0000-4000-8000-000000000007', 'former@dragoman.test', 'Eski',         'content',    false, '10000000-0000-4000-8000-000000000007');

create table tests.ids (name text primary key, id uuid not null);
grant select, insert on tests.ids to authenticated;

-- Staff add and read ---------------------------------------------------------------------------------

select tests.sign_in('acct');
with added as (
  insert into public.client_answer_entries (question_id, body) values ('fiyatlar', 'Dalış 60 EUR') returning id
)
insert into tests.ids select 'acct-first', id from added;
select is(
  (select author_id from public.client_answer_entries where id = (select id from tests.ids where name = 'acct-first')),
  '20000000-0000-4000-8000-000000000003'::uuid,
  'any active staff member (accounting) adds an entry, stamped with their staff id'
);

select tests.sign_in('admin');
insert into public.client_answer_entries (question_id, body) values ('fiyatlar', 'Çocuklara %50 indirim');
select is(
  (select count(*)::int from public.client_answer_entries where question_id = 'fiyatlar'),
  2,
  'a second save adds a second entry instead of replacing the first'
);
select is(
  array(select body from public.client_answer_entries where question_id = 'fiyatlar' order by created_at),
  array['Dalış 60 EUR', 'Çocuklara %50 indirim'],
  'entries keep the order they were saved in'
);
select is(
  (select edited_at from public.client_answer_entries where id = (select id from tests.ids where name = 'acct-first')),
  null,
  'a new entry is not marked as edited'
);

-- Only the author changes the text ---------------------------------------------------------------

update public.client_answer_entries set body = 'admin yazdı' where id = (select id from tests.ids where name = 'acct-first');
select tests.sign_in('acct');
select is(
  (select body from public.client_answer_entries where id = (select id from tests.ids where name = 'acct-first')),
  'Dalış 60 EUR',
  'another staff member cannot change someone else''s entry'
);

update public.client_answer_entries set body = 'Dalış 65 EUR' where id = (select id from tests.ids where name = 'acct-first');
select is(
  (select body from public.client_answer_entries where id = (select id from tests.ids where name = 'acct-first')),
  'Dalış 65 EUR',
  'the author changes their own entry'
);
select isnt(
  (select edited_at from public.client_answer_entries where id = (select id from tests.ids where name = 'acct-first')),
  null,
  'a changed entry is stamped as edited'
);

select throws_ok(
  format($$ update public.client_answer_entries set body = '  ' where id = %L $$, (select id from tests.ids where name = 'acct-first')),
  '23514', null, 'an entry cannot be emptied'
);
select throws_ok(
  $$ update public.client_answer_entries set author_id = null $$,
  '42501', null, 'staff cannot write the author'
);
select throws_ok(
  $$ update public.client_answer_entries set question_id = 'baska' $$,
  '42501', null, 'staff cannot move an entry to another question'
);
select throws_ok(
  $$ insert into public.client_answer_entries (question_id, body, author_id) values ('x', 'y', null) $$,
  '42501', null, 'staff cannot choose the author on insert'
);
select throws_ok(
  $$ insert into public.client_answer_entries (question_id, body, created_at) values ('x', 'y', '2020-01-01') $$,
  '42501', null, 'staff cannot back-date an entry'
);
select throws_ok(
  $$ delete from public.client_answer_entries $$,
  '42501', null, 'entries are not deleted'
);
select throws_ok(
  $$ insert into public.client_answer_entries (question_id, body) values ('Bad Id!', 'x') $$,
  '23514', null, 'question ids must be short kebab-case'
);
select throws_ok(
  $$ insert into public.client_answer_entries (question_id, body) values ('bos', E' \n ') $$,
  '23514', null, 'an empty entry is refused'
);
select throws_ok(
  format($$ insert into public.client_answer_entries (question_id, body) values ('uzun', %L) $$, repeat('a', 20001)),
  '23514', null, 'entries have a size limit'
);

-- Everyone else ------------------------------------------------------------------------------------

select tests.sign_in('former');
select is((select count(*)::int from public.client_answer_entries), 0, 'former staff see no entries');
select throws_ok(
  $$ insert into public.client_answer_entries (question_id, body) values ('yeni-soru', 'x') $$,
  '42501', null, 'former staff cannot add an entry'
);

select tests.sign_in('stranger');
select is((select count(*)::int from public.client_answer_entries), 0, 'a non-staff account sees no entries');

reset role;
reset request.jwt.claims;
select ok(not has_table_privilege('anon', 'public.client_answer_entries', 'select'), 'anon may not read entries');
select ok(not has_table_privilege('anon', 'public.client_answer_entries', 'insert'), 'anon may not add entries');
select hasnt_table('public', 'client_answers', 'the single-answer table is gone');

select * from finish();
rollback;
