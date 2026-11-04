import { describe, expect, it } from 'vitest'
import { FunctionError } from '../src/data/forms/forms'
import {
  addCustomField,
  canHide,
  canRequire,
  customAnswers,
  customKeyFor,
  hasUnpublishedChanges,
  isRequired,
  metaForSave,
  moveField,
  remapMeta,
  removeCustomField,
  setHidden,
  setRequired,
  setText,
} from '../src/lib/forms/editor'
import { functionErrorMessage, functionIssues } from '../src/lib/forms/messages'
import { DEFAULT_FORM_DEFINITIONS, validateDefinition, type FormDefinition, type FormField } from '../src/shared/requests/forms'

const contact = DEFAULT_FORM_DEFINITIONS.contact
const keys = (definition: FormDefinition) => definition.fields.map((field) => field.key)
const field = (definition: FormDefinition, key: string): FormField => {
  const found = definition.fields.find((candidate) => candidate.key === key)
  if (!found) throw new Error(`no ${key}`)
  return found
}

describe('form editor: fields', () => {
  it('moves fields up and down and stops at the edges', () => {
    expect(keys(moveField(contact, 'phone', -1))).toEqual(['fullName', 'phone', 'email', 'subject', 'message'])
    expect(keys(moveField(contact, 'message', 1))).toEqual(keys(contact))
    expect(keys(moveField(contact, 'fullName', -1))).toEqual(keys(contact))
  })

  it('hides and requires free fields only, keeping the definition valid', () => {
    expect(canHide('contact', field(contact, 'email'))).toBe(false)
    expect(canHide('contact', field(contact, 'subject'))).toBe(true)
    expect(setHidden('contact', contact, 'email', true)).toBe(contact)

    const edited = setRequired('contact', setHidden('contact', contact, 'subject', true), 'phone', true)
    expect(field(edited, 'subject').hidden).toBe(true)
    expect(isRequired('contact', field(edited, 'phone'))).toBe(true)
    expect(validateDefinition('contact', edited)).toEqual([])

    // Back to the built-in state leaves no flags behind.
    const restored = setRequired('contact', setHidden('contact', edited, 'subject', false), 'phone', false)
    expect(restored).toEqual(contact)
  })

  it('offers no required toggle for the child seat checkbox or fixed fields', () => {
    const transport = DEFAULT_FORM_DEFINITIONS.transport
    expect(canRequire('transport', field(transport, 'childSeat'))).toBe(false)
    expect(canRequire('transport', field(transport, 'note'))).toBe(true)
    expect(canRequire('transport', field(transport, 'from'))).toBe(false)
    expect(isRequired('transport', field(transport, 'from'))).toBe(true)
  })

  it('sets labels per language, and an empty Turkish label brings back the built-in one', () => {
    const labelled = setText(setText(contact, 'message', 'label', 'tr', 'Sorunuz'), 'message', 'label', 'en', 'Your question')
    expect(field(labelled, 'message').label).toEqual({ tr: 'Sorunuz', en: 'Your question' })
    expect(validateDefinition('contact', labelled)).toEqual([])
    const cleared = setText(labelled, 'message', 'label', 'tr', '')
    expect(field(cleared, 'message')).toEqual({ kind: 'core', key: 'message' })
    expect(field(setText(labelled, 'message', 'label', 'en', ''), 'message').label).toEqual({ tr: 'Sorunuz' })
  })
})

describe('form editor: custom fields', () => {
  it('derives unique c_ keys from the Turkish label', () => {
    expect(customKeyFor('Doğum yılı', [])).toBe('c_dogum_yili')
    expect(customKeyFor('Doğum yılı', ['c_dogum_yili'])).toBe('c_dogum_yili_2')
    expect(customKeyFor('!!!', [])).toBe('c_alan')
  })

  it('adds valid fields up to ten, with slug option values', () => {
    const withSelect = addCustomField(contact, { type: 'select', label: 'Bütçe', required: true, options: ['Düşük', 'Yüksek', 'Yüksek'] })
    expect(withSelect).not.toBeNull()
    const added = withSelect?.fields.at(-1)
    expect(added).toMatchObject({ kind: 'custom', key: 'c_butce', type: 'select', required: true, label: { tr: 'Bütçe' } })
    expect(added?.kind === 'custom' ? added.options?.map((option) => option.value) : []).toEqual(['dusuk', 'yuksek', 'yuksek-2'])
    expect(validateDefinition('contact', withSelect)).toEqual([])

    let full: FormDefinition | null = contact
    for (let n = 0; n < 10; n += 1) full = full && addCustomField(full, { type: 'text', label: `Soru ${n}`, required: false })
    expect(full && validateDefinition('contact', full)).toEqual([])
    expect(full && addCustomField(full, { type: 'text', label: 'Bir tane daha', required: false })).toBeNull()
  })

  it('removes only fields never published; a published one stays to be hidden', () => {
    const draft = addCustomField(contact, { type: 'number', label: 'Yaş', required: false, min: 0, max: 99 })
    if (!draft) throw new Error('not added')
    expect(keys(removeCustomField(draft, 'c_yas', contact))).toEqual(keys(contact))
    expect(removeCustomField(draft, 'c_yas', draft)).toBe(draft)
    expect(field(setHidden('contact', draft, 'c_yas', true), 'c_yas').hidden).toBe(true)
  })

  it('counts an unpublished draft as changed', () => {
    expect(hasUnpublishedChanges(contact, null)).toBe(true)
    expect(hasUnpublishedChanges(contact, structuredClone(contact))).toBe(false)
    expect(hasUnpublishedChanges(moveField(contact, 'phone', -1), contact)).toBe(true)
  })
})

describe('form editor: translation marks', () => {
  const labelled = setText(setText(contact, 'phone', 'label', 'tr', 'Cep'), 'phone', 'label', 'en', 'Mobile')
  const deepl = { '/fields/2/label': { en: { hash: 'h', origin: 'deepl' as const, at: '2026-11-01' } } }

  it('moves marks with their field', () => {
    const moved = moveField(labelled, 'phone', -1)
    expect(remapMeta(deepl, labelled, moved)).toEqual({ '/fields/1/label': deepl['/fields/2/label'] })
  })

  it('marks only what a person changed as manual, also after a move', () => {
    const moved = moveField(labelled, 'phone', -1)
    expect(metaForSave(labelled, deepl, moved, 'now')).toEqual({ '/fields/1/label': deepl['/fields/2/label'] })

    const fixed = setText(moved, 'phone', 'label', 'en', 'Mobile phone')
    expect(metaForSave(labelled, deepl, fixed, 'now')['/fields/1/label']?.en).toMatchObject({ origin: 'manual', at: 'now' })
  })
})

describe('request detail: custom answers', () => {
  const definition: FormDefinition = {
    format: 1,
    fields: [
      ...contact.fields,
      { kind: 'custom', key: 'c_budget', type: 'select', required: true, label: { tr: 'Bütçe' }, options: [{ value: 'high', label: { tr: 'Yüksek' } }, { value: 'low', label: { tr: 'Düşük' } }] },
      { kind: 'custom', key: 'c_news', type: 'checkbox', required: false, label: { tr: 'Bülten' } },
    ],
  }

  it("uses the version's Turkish labels and option names", () => {
    const payload = { message: 'x', custom: { c_news: true, c_budget: 'high', c_gone: 'eski' } }
    expect(customAnswers(payload, definition)).toEqual([
      { key: 'c_budget', label: 'Bütçe', value: 'Yüksek' },
      { key: 'c_news', label: 'Bülten', value: 'Evet' },
      { key: 'c_gone', label: 'c_gone', value: 'eski' },
    ])
  })

  it('lists nothing without custom answers', () => {
    expect(customAnswers({ message: 'x' }, definition)).toEqual([])
    expect(customAnswers(null, null)).toEqual([])
  })
})

describe('function errors', () => {
  it('turns refusals into Turkish messages', () => {
    expect(functionErrorMessage(new FunctionError('stale_draft'))).toBe('Bu kayıt başka biri tarafından değiştirildi, yeniden yükleyin.')
    expect(functionErrorMessage(new FunctionError('quota_insufficient', { needed: 900, remaining: 100 }))).toContain('Gereken: 900 karakter, kalan: 100')
    expect(functionErrorMessage(new FunctionError('something_new'))).toBe('Sunucuda bir hata oluştu. Lütfen tekrar deneyin.')
    expect(functionErrorMessage(new Error('Bu kayıt başka biri tarafından değiştirildi, yeniden yükleyin.'))).toMatch(/^Bu kayıt/)
  })

  it('lists the issues of an invalid publish', () => {
    expect(functionIssues(new FunctionError('invalid', { issues: [{ code: 'schema', message: 'fields.7.label.tr: required' }] }))).toEqual(['fields.7.label.tr: required'])
    expect(functionIssues(new FunctionError('conflict'))).toEqual([])
  })
})
