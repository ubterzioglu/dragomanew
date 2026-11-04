-- Open-question answers become a thread (panel /sorular): every "Kaydet" adds one entry under the
-- question instead of replacing a single answer, so several people can add to a question over time.
-- Replaces public.client_answers (20261102160000, 20261102170000); its answers move over as the
-- first entry of each question, keeping who saved them and when.
--
--   client_answer_entries   staff: select; insert (question_id, body); update own body   author_id, edited_at

create table public.client_answer_entries (
  id uuid primary key default gen_random_uuid(),
  question_id text not null
    constraint client_answer_entries_question_id_format check (question_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(question_id) <= 64),
  body text not null
    -- At least one visible character (btrim alone would let a body of only line breaks through).
    constraint client_answer_entries_body_size check (body ~ '\S' and length(body) <= 20000),
  -- Null: the author's staff row was deleted.
  author_id uuid references public.staff_members (id) on delete set null,
  -- clock_timestamp, not now(): entries are listed in this order, also within one transaction.
  created_at timestamptz not null default clock_timestamp(),
  -- Set when the author changes the text.
  edited_at timestamptz
);

comment on table public.client_answer_entries is
  'Dragoman''s answers to the panel''s open questions (/sorular), several per question; question ids come from the panel catalog.';

create index client_answer_entries_question_id_created_at_idx on public.client_answer_entries (question_id, created_at);

-- The rename takes the old table's strongest lock: it waits for saves already under way and holds off
-- new ones until the table is dropped, so none is lost. (LOCK TABLE is refused here: db push runs a
-- migration as one implicit transaction, not as a transaction block.)
alter table public.client_answers rename to client_answers_moving;

-- Before the stamp trigger exists, so the moved answers keep their saver and time.
insert into public.client_answer_entries (question_id, body, author_id, created_at)
select question_id, regexp_replace(answer, '^\s+|\s+$', '', 'g'), updated_by, updated_at
from public.client_answers_moving
where answer ~ '\S';

/** The author is the signed-in staff member; an edit of the text is stamped. */
create function private.stamp_client_answer_entry()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.author_id := private.current_staff_id();
    new.created_at := clock_timestamp();
    new.edited_at := null;
  elsif new.body is distinct from old.body then
    new.edited_at := clock_timestamp();
  end if;
  return new;
end;
$$;

revoke all on function private.stamp_client_answer_entry() from public, anon, authenticated;

create trigger client_answer_entries_stamp
  before insert or update on public.client_answer_entries
  for each row execute function private.stamp_client_answer_entry();

alter table public.client_answer_entries enable row level security;

revoke all on table public.client_answer_entries from public, anon, authenticated;
grant all on table public.client_answer_entries to service_role;

-- No delete: a wrong entry is corrected by its author.
grant select on table public.client_answer_entries to authenticated;
grant insert (question_id, body) on table public.client_answer_entries to authenticated;
grant update (body) on table public.client_answer_entries to authenticated;

create policy client_answer_entries_select_staff on public.client_answer_entries
  for select to authenticated
  using ((select private.is_staff()));

create policy client_answer_entries_insert_staff on public.client_answer_entries
  for insert to authenticated
  with check ((select private.is_staff()));

create policy client_answer_entries_update_author on public.client_answer_entries
  for update to authenticated
  using ((select private.is_staff()) and author_id = (select private.current_staff_id()))
  with check ((select private.is_staff()) and author_id = (select private.current_staff_id()));

-- The single-answer table and its save function are gone; the function returns the table's row type,
-- so it goes first.
drop function public.save_client_answer(text, text, timestamptz);
drop table public.client_answers_moving;
drop function private.stamp_client_answer();
