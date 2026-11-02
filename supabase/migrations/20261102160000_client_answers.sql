-- Answers to the open questions for Dragoman (panel /sorular). The questions themselves live in
-- the panel code (panel/src/lib/questions/catalog.ts); this table keeps one answer per question id.
-- Every active staff member may read and write an answer: the questions are asked of the business,
-- and whoever knows the answer types it in. Who saved last and when is stamped by the database.

create table public.client_answers (
  question_id text primary key
    constraint client_answers_question_id_format check (question_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(question_id) <= 64),
  answer text not null default ''
    constraint client_answers_answer_size check (length(answer) <= 20000),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.staff_members (id) on delete set null
);

comment on table public.client_answers is
  'Dragoman''s answers to the panel''s open questions (/sorular); question ids come from the panel catalog.';

/** The saver and the time come from the session, never from the client. */
create function private.stamp_client_answer()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := private.current_staff_id();
  return new;
end;
$$;

revoke all on function private.stamp_client_answer() from public, anon, authenticated;

create trigger client_answers_stamp
  before insert or update on public.client_answers
  for each row execute function private.stamp_client_answer();

alter table public.client_answers enable row level security;

revoke all on table public.client_answers from public, anon, authenticated;
grant all on table public.client_answers to service_role;

-- No delete: an answer is cleared by saving an empty text.
grant select on table public.client_answers to authenticated;
grant insert (question_id, answer) on table public.client_answers to authenticated;
grant update (answer) on table public.client_answers to authenticated;

create policy client_answers_select_staff on public.client_answers
  for select to authenticated
  using ((select private.is_staff()));

create policy client_answers_insert_staff on public.client_answers
  for insert to authenticated
  with check ((select private.is_staff()));

create policy client_answers_update_staff on public.client_answers
  for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

/**
 * Insert or replace one answer and return the stored row. Security invoker, so the grants and
 * policies above decide; a plain PostgREST upsert would also try to update question_id.
 */
create function public.save_client_answer(p_question_id text, p_answer text)
returns public.client_answers
language sql
security invoker
set search_path = ''
as $$
  insert into public.client_answers (question_id, answer)
  values (p_question_id, p_answer)
  on conflict (question_id) do update set answer = excluded.answer
  returning *
$$;

revoke all on function public.save_client_answer(text, text) from public, anon;
grant execute on function public.save_client_answer(text, text) to authenticated;
