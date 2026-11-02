import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ALL_QUESTIONS, answeredCount, isAnswered, QUESTION_GROUPS } from '../src/lib/questions/catalog'

const rpc = vi.fn()
const select = vi.fn()
const maybeSingle = vi.fn()
const eq = vi.fn(() => ({ maybeSingle }))
vi.mock('../src/lib/supabase', () => ({
  db: () => ({ rpc, from: () => ({ select: (columns: string) => Object.assign(select(columns) ?? {}, { eq }) }) }),
}))

const { ANSWER_CHANGED, getAnswer, listAnswers, saveAnswer } = await import('../src/data/questions')
const { friendlyError } = await import('../src/lib/errors')

beforeEach(() => {
  rpc.mockReset()
  select.mockReset()
  maybeSingle.mockReset()
  eq.mockClear()
})

describe('the question catalog', () => {
  it('gives every question a unique id the database accepts (public.client_answers)', () => {
    const ids = ALL_QUESTIONS.map((question) => question.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(id, id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(id.length, id).toBeLessThanOrEqual(64)
    }
  })

  it('has no empty group, title or question text', () => {
    for (const group of QUESTION_GROUPS) {
      expect(group.title).not.toBe('')
      expect(group.note).not.toBe('')
      expect(group.questions.length).toBeGreaterThan(0)
      for (const question of group.questions) {
        expect(question.title, question.id).not.toBe('')
        expect(question.text, question.id).not.toBe('')
      }
    }
  })

  it('matches the count announced in the release notes', () => {
    expect(ALL_QUESTIONS).toHaveLength(27)
  })
})

describe('answered', () => {
  it('counts only answers with visible text', () => {
    expect(isAnswered(undefined)).toBe(false)
    expect(isAnswered('  \n ')).toBe(false)
    expect(isAnswered('Evet')).toBe(true)

    const [first, second, third] = ALL_QUESTIONS
    const answers = new Map([
      [first!.id, 'Dalış ve kayak'],
      [second!.id, '   '],
      ['eski-soru', 'kataloğda olmayan yanıt sayılmaz'],
    ])
    expect(answeredCount([first!, second!, third!], answers)).toBe(1)
  })
})

describe('the data layer', () => {
  it('saves through save_client_answer with the loaded stamp and returns the stored row', async () => {
    const row = { question_id: 'fiyatlar', answer: '60 EUR', updated_at: '2026-11-02T10:00:00.123456+00:00', updated_by: 's1' }
    rpc.mockResolvedValue({ data: row, error: null })
    await expect(saveAnswer('fiyatlar', '60 EUR', '2026-11-02T09:00:00+00:00')).resolves.toEqual(row)
    expect(rpc).toHaveBeenCalledWith('save_client_answer', {
      p_question_id: 'fiyatlar',
      p_answer: '60 EUR',
      p_expected_updated_at: '2026-11-02T09:00:00+00:00',
    })
  })

  it('sends null as the stamp for a first answer', async () => {
    rpc.mockResolvedValue({ data: {}, error: null })
    await saveAnswer('fiyatlar', 'x', null)
    expect(rpc.mock.calls[0]?.[1]).toMatchObject({ p_expected_updated_at: null })
  })

  it('passes a database refusal on, and a stale save reads as "someone else saved"', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: ANSWER_CHANGED, message: 'changed' } })
    const refusal = await saveAnswer('fiyatlar', 'x', null).catch((error: unknown) => error)
    expect(refusal).toMatchObject({ code: 'DRG01' })
    expect(friendlyError(refusal)).toContain('başka biri')
  })

  it('reads one current answer, null when there is none', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null })
    await expect(getAnswer('fiyatlar')).resolves.toBeNull()
    expect(eq).toHaveBeenCalledWith('question_id', 'fiyatlar')
  })

  it('lists answers, empty when there are none', async () => {
    select.mockReturnValue(Promise.resolve({ data: null, error: null }))
    await expect(listAnswers()).resolves.toEqual([])
    expect(select).toHaveBeenCalledWith('question_id, answer, updated_at, updated_by')
  })
})
