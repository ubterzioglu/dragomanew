import { describe, expect, it } from 'vitest'
import { allQuestions, createHealthForms, healthAnswersSchema, needsReview } from '../../src/features/health/healthForms'
import { getUi } from '../../src/i18n/ui'

describe('health form definitions (guide §6, E07/E08)', () => {
  const forms = createHealthForms()

  it('keeps diving and outdoor as two separate records with their own ids and versions', () => {
    expect(forms.diving.id).not.toBe(forms.outdoor.id)
    expect(forms.diving.version).toBe(1)
    expect(forms.outdoor.version).toBe(1)
  })

  it('starts both forms with the same 35 source items (SF01–SF35)', () => {
    const codes = allQuestions(forms.diving).map((question) => question.code)
    expect(codes).toHaveLength(35)
    expect(codes[0]).toBe('SF01')
    expect(codes[34]).toBe('SF35')
    expect(allQuestions(forms.outdoor).map((question) => question.code)).toEqual(codes)
  })

  it('keeps SF04–SF06 linked to SF03', () => {
    const subs = allQuestions(forms.diving).filter((question) => question.parent === 'SF03')
    expect(subs.map((question) => question.code)).toEqual(['SF04', 'SF05', 'SF06'])
  })

  it('changing one form never changes the other', () => {
    const fresh = createHealthForms()
    const firstOutdoor = fresh.outdoor.groups[0]?.questions[0]
    expect(Object.isFrozen(fresh.outdoor)).toBe(true)
    expect(firstOutdoor && fresh.diving.groups[0]?.questions[0]).not.toBe(firstOutdoor)
  })
})

describe('healthAnswersSchema', () => {
  const ui = getUi('tr')
  const form = createHealthForms().diving
  const codes = allQuestions(form).map((question) => question.code)
  const allNo = Object.fromEntries(codes.map((code) => [code, 'no' as const]))
  const schema = healthAnswersSchema(ui, form)

  it('treats an unanswered question as unanswered, never as "No"', () => {
    const { SF07: _missing, ...partial } = allNo
    const result = schema.safeParse({ participantName: 'Örnek Katılımcı', answers: partial })
    expect(result.success).toBe(false)
    expect(result.error?.issues.some((issue) => issue.path.join('.') === 'answers.SF07')).toBe(true)
  })

  it('reports an unchecked radio group (null) with the localized message', () => {
    const result = schema.safeParse({ participantName: 'Örnek Katılımcı', answers: { ...allNo, SF12: null } })
    expect(result.error?.issues.find((issue) => issue.path.join('.') === 'answers.SF12')?.message).toBe(ui.health.unanswered)
  })

  it('accepts a complete form', () => {
    expect(schema.safeParse({ participantName: 'Örnek Katılımcı', answers: allNo }).success).toBe(true)
  })

  it('flags review when any answer is Yes, and does not decide anything else', () => {
    expect(needsReview(allNo)).toBe(false)
    expect(needsReview({ ...allNo, SF26: 'yes' })).toBe(true)
  })
})
