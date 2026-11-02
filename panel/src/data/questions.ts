import { db } from '../lib/supabase'

/** One saved answer (public.client_answers); the stamp columns are written by the database. */
export interface ClientAnswer {
  question_id: string
  answer: string
  updated_at: string
  updated_by: string | null
}

const COLUMNS = 'question_id, answer, updated_at, updated_by'

/** SQLSTATE of save_client_answer when someone else saved the question since it was loaded. */
export const ANSWER_CHANGED = 'DRG01'

export async function listAnswers(): Promise<ClientAnswer[]> {
  const { data, error } = await db().from('client_answers').select(COLUMNS)
  if (error) throw error
  return (data ?? []) as ClientAnswer[]
}

/** The current row for one question, or null when nobody has answered it yet. */
export async function getAnswer(questionId: string): Promise<ClientAnswer | null> {
  const { data, error } = await db().from('client_answers').select(COLUMNS).eq('question_id', questionId).maybeSingle()
  if (error) throw error
  return (data ?? null) as ClientAnswer | null
}

/**
 * Save through `save_client_answer` and return the stored row. `expectedUpdatedAt` is the stamp of
 * the row the user started from (null: no answer yet); a newer save by someone else raises DRG01.
 */
export async function saveAnswer(
  questionId: string,
  answer: string,
  expectedUpdatedAt: string | null,
): Promise<ClientAnswer> {
  const { data, error } = await db().rpc('save_client_answer', {
    p_question_id: questionId,
    p_answer: answer,
    p_expected_updated_at: expectedUpdatedAt,
  })
  if (error) throw error
  return data as ClientAnswer
}
