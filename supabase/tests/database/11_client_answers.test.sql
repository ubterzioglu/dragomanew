-- Answers to the open questions (20261102160000_client_answers.sql): every active staff member reads
-- and writes through save_client_answer, which refuses stale saves (DRG01); outsiders, former staff and anon get nothing.
begin;
create extension if not exists pgtap with schema extensions;

select plan(20);

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

-- Staff write and read ------------------------------------------------------------------------------

create table tests.seen (stamp timestamptz);
grant select, insert, delete on tests.seen to authenticated;

select tests.sign_in('acct');
select is(
  (select answer from public.save_client_answer('fiyatlar', 'Dalış 60 EUR')),
  'Dalış 60 EUR',
  'any active staff member (accounting) saves a new answer'
);
select is(
  (select updated_by from public.client_answers where question_id = 'fiyatlar'),
  '20000000-0000-4000-8000-000000000003'::uuid,
  'the saver is stamped from the session'
);
insert into tests.seen select updated_at from public.client_answers where question_id = 'fiyatlar';

select throws_ok(
  $$ select public.save_client_answer('fiyatlar', 'ikinci ilk yanıt') $$,
  'DRG01', null, 'a "no answer yet" save does not overwrite an existing answer'
);

select tests.sign_in('admin');
select is(
  (select answer from public.save_client_answer('fiyatlar', 'Dalış 65 EUR', (select stamp from tests.seen))),
  'Dalış 65 EUR',
  'saving with the loaded stamp replaces the answer'
);
select is(
  (select updated_by from public.client_answers where question_id = 'fiyatlar'),
  '20000000-0000-4000-8000-000000000001'::uuid,
  'the stamp follows the last saver'
);

select tests.sign_in('acct');
select throws_ok(
  $$ select public.save_client_answer('fiyatlar', 'eski sayfadan', (select stamp from tests.seen)) $$,
  'DRG01', null, 'a save from a stale page is refused'
);
select is(
  (select answer from public.client_answers where question_id = 'fiyatlar'),
  'Dalış 65 EUR',
  'the refused save left the newer answer alone'
);
select is((select count(*)::int from public.client_answers where question_id = 'fiyatlar'), 1, 'one row per question');

select tests.sign_in('admin');
select throws_ok(
  $$ update public.client_answers set updated_by = null $$,
  '42501', null, 'staff cannot write the stamp columns directly'
);
select throws_ok(
  $$ insert into public.client_answers (question_id, answer, updated_by) values ('x', 'y', null) $$,
  '42501', null, 'staff cannot choose the stamp on insert'
);
select throws_ok(
  $$ update public.client_answers set question_id = 'baska' $$,
  '42501', null, 'staff cannot move an answer to another question'
);
select throws_ok(
  $$ delete from public.client_answers $$,
  '42501', null, 'answers are not deleted, only cleared'
);
select throws_ok(
  $$ select public.save_client_answer('Bad Id!', 'x') $$,
  '23514', null, 'question ids must be short kebab-case'
);
select throws_ok(
  format($$ select public.save_client_answer('uzun', %L) $$, repeat('a', 20001)),
  '23514', null, 'answers have a size limit'
);

-- Everyone else ------------------------------------------------------------------------------------

select tests.sign_in('former');
select is((select count(*)::int from public.client_answers), 0, 'former staff see no answers');
select throws_ok(
  $$ select public.save_client_answer('yeni-soru', 'x') $$,
  '42501', null, 'former staff cannot save'
);

select tests.sign_in('stranger');
select is((select count(*)::int from public.client_answers), 0, 'a non-staff account sees no answers');

reset role;
reset request.jwt.claims;
select is(
  (select updated_at from public.client_answers where question_id = 'fiyatlar') <> (select stamp from tests.seen),
  true,
  'sanity: the stored stamp moved past the first save'
);
select ok(not has_function_privilege('anon', 'public.save_client_answer(text, text, timestamptz)', 'execute'), 'anon may not call save_client_answer');
select ok(not has_table_privilege('anon', 'public.client_answers', 'select'), 'anon may not read answers');

select * from finish();
rollback;
