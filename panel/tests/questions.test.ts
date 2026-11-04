import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ALL_QUESTIONS, answeredCount, isAnswered, QUESTION_GROUPS } from '../src/lib/questions/catalog'
import type { AnswerEntry } from '../src/data/questions'

/** Records the query chain the data layer builds and answers with `result`. */
const calls: Array<[string, unknown[]]> = []
let result: { data: unknown; error: unknown } = { data: null, error: null }
const chain = new Proxy(
  {},
  {
    get: (_target, method: string) => {
      if (method === 'then') return (resolve: (value: unknown) => void) => resolve(result)
      return (...args: unknown[]) => {
        calls.push([method, args])
        return chain
      }
    },
  },
)
vi.mock('../src/lib/supabase', () => ({ db: () => chain }))

const { addEntry, editEntry, listEntries } = await import('../src/data/questions')
const { mergeEntries } = await import('../src/lib/questions/entries')

beforeEach(() => {
  calls.length = 0
  result = { data: null, error: null }
})

describe('the question catalog', () => {
  it('gives every question a unique id the database accepts (public.client_answer_entries)', () => {
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
  const row = {
    id: 'e1',
    question_id: 'fiyatlar',
    body: '60 EUR',
    author_id: 's1',
    created_at: '2026-11-04T10:00:00.123456+00:00',
    edited_at: null,
  }

  it('adds an entry under the question and returns the stored row', async () => {
    result = { data: row, error: null }
    await expect(addEntry('fiyatlar', '60 EUR')).resolves.toEqual(row)
    expect(calls).toContainEqual(['from', ['client_answer_entries']])
    expect(calls).toContainEqual(['insert', [{ question_id: 'fiyatlar', body: '60 EUR' }]])
    expect(calls.map(([method]) => method)).toContain('single')
  })

  it('changes only the text of one entry', async () => {
    result = { data: { ...row, body: '65 EUR' }, error: null }
    await expect(editEntry('e1', '65 EUR')).resolves.toMatchObject({ body: '65 EUR' })
    expect(calls).toContainEqual(['update', [{ body: '65 EUR' }]])
    expect(calls).toContainEqual(['eq', ['id', 'e1']])
  })

  it('passes a database refusal on', async () => {
    result = { data: null, error: { code: '42501', message: 'denied' } }
    await expect(addEntry('fiyatlar', 'x')).rejects.toMatchObject({ code: '42501' })
  })

  it('lists entries oldest first, empty when there are none', async () => {
    await expect(listEntries()).resolves.toEqual([])
    expect(calls).toContainEqual(['select', ['id, question_id, body, author_id, created_at, edited_at']])
    expect(calls).toContainEqual(['order', ['created_at', { ascending: true }]])
  })
})

describe('merging entries saved on the screen', () => {
  const entry = (id: string, questionId: string, body: string): AnswerEntry => ({
    id,
    question_id: questionId,
    body,
    author_id: 's1',
    created_at: '2026-11-04T10:00:00+00:00',
    edited_at: null,
  })

  it('groups by question, keeps an edit in place and puts new entries last', () => {
    const loaded = [entry('a', 'fiyatlar', 'ilk'), entry('b', 'logo', 'logo yanıtı'), entry('c', 'fiyatlar', 'ikinci')]
    const savedHere = new Map([
      ['d', entry('d', 'fiyatlar', 'yeni')],
      ['a', { ...entry('a', 'fiyatlar', 'ilk (düzeltildi)'), edited_at: '2026-11-04T11:00:00+00:00' }],
    ])
    const merged = mergeEntries(loaded, savedHere)
    expect(merged.get('fiyatlar')?.map((item) => item.body)).toEqual(['ilk (düzeltildi)', 'ikinci', 'yeni'])
    expect(merged.get('logo')?.map((item) => item.id)).toEqual(['b'])
  })

  it('does not repeat an entry that a reload already brought back', () => {
    const saved = entry('d', 'fiyatlar', 'yeni')
    const merged = mergeEntries([entry('a', 'fiyatlar', 'ilk'), saved], new Map([['d', saved]]))
    expect(merged.get('fiyatlar')?.map((item) => item.id)).toEqual(['a', 'd'])
  })

  it('leaves the loaded list untouched', () => {
    const loaded = [entry('a', 'fiyatlar', 'ilk')]
    mergeEntries(loaded, new Map([['a', entry('a', 'fiyatlar', 'değişti')]]))
    expect(loaded[0]?.body).toBe('ilk')
  })
})
