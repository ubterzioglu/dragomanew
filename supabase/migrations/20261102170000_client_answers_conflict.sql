-- Open-question answers, follow-up to 20261102160000_client_answers.sql:
--   * save_client_answer refuses to overwrite an answer someone else saved since the caller loaded
--     it (SQLSTATE DRG01), so two people editing the same question no longer lose text silently;
--   * the stamp moves only when the answer itself changes (a staff row deleted later sets
--     updated_by to null without re-stamping the time).

-- clock_timestamp, not now(): two saves in one transaction must still get different stamps,
-- because the stamp is what the conflict check compares.
create or replace function private.stamp_client_answer()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := clock_timestamp();
  new.updated_by := private.current_staff_id();
  return new;
end;
$$;

drop trigger client_answers_stamp on public.client_answers;

create trigger client_answers_stamp_insert
  before insert on public.client_answers
  for each row execute function private.stamp_client_answer();

create trigger client_answers_stamp_update
  before update on public.client_answers
  for each row
  when (old.answer is distinct from new.answer)
  execute function private.stamp_client_answer();

drop function public.save_client_answer(text, text);

/**
 * Save one answer and return the stored row. p_expected_updated_at is the updated_at the caller
 * loaded (null: "there was no answer yet"); when the stored row no longer matches, nothing is
 * written and DRG01 is raised. Security invoker, so the grants and policies still decide.
 */
create function public.save_client_answer(
  p_question_id text,
  p_answer text,
  p_expected_updated_at timestamptz default null
)
returns public.client_answers
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_row public.client_answers;
begin
  if p_expected_updated_at is null then
    insert into public.client_answers (question_id, answer)
    values (p_question_id, p_answer)
    on conflict (question_id) do nothing
    returning * into v_row;
  else
    update public.client_answers
    set answer = p_answer
    where question_id = p_question_id and updated_at = p_expected_updated_at
    returning * into v_row;
  end if;

  if v_row.question_id is null then
    raise exception 'client answer % changed since it was loaded', p_question_id using errcode = 'DRG01';
  end if;
  return v_row;
end;
$$;

revoke all on function public.save_client_answer(text, text, timestamptz) from public, anon;
grant execute on function public.save_client_answer(text, text, timestamptz) to authenticated;
