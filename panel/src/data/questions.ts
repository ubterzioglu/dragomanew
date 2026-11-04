import { db } from '../lib/supabase'

/** One saved answer (public.client_answer_entries); author and times are written by the database. */
export interface AnswerEntry {
  id: string
  question_id: string
  body: string
  /** Null when the author's staff row was deleted. */
  author_id: string | null
  created_at: string
  edited_at: string | null
}

const COLUMNS = 'id, question_id, body, author_id, created_at, edited_at'

/** Same limit as the table's check. */
export const ANSWER_MAX = 20000

/** Every entry, oldest first. */
export async function listEntries(): Promise<AnswerEntry[]> {
  const { data, error } = await db()
    .from('client_answer_entries')
    .select(COLUMNS)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
  if (error) throw error
  return (data ?? []) as AnswerEntry[]
}

/** Adds one answer under a question and returns the stored row. */
export async function addEntry(questionId: string, body: string): Promise<AnswerEntry> {
  const { data, error } = await db()
    .from('client_answer_entries')
    .insert({ question_id: questionId, body })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data as AnswerEntry
}

/** Changes the text of one of the caller's own entries; the database refuses anyone else's. */
export async function editEntry(id: string, body: string): Promise<AnswerEntry> {
  const { data, error } = await db()
    .from('client_answer_entries')
    .update({ body })
    .eq('id', id)
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data as AnswerEntry
}
