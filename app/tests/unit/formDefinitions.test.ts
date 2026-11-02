import { describe, expect, it } from 'vitest'
import {
  CORE_FIELDS,
  coreFieldState,
  customValuesSchema,
  DEFAULT_FORM_DEFINITIONS,
  validateDefinition,
  type CustomFormField,
  type FormDefinition,
} from '../../src/shared/requests/forms'
import { REQUEST_KINDS, submitEnvelopeSchema } from '../../src/shared/requests/payload'
import { CODE_MESSAGES, contactSchema, eventRequestSchema, lodgingSchema, transportSchema } from '../../src/shared/requests/schemas'

/** Editable form definitions (dalga2-sozlesme §8, §11 A). */
const SUB_FIELDS = ['returnDateTime', 'childSeatAges', 'childAges']
const TODAY = {
  event: eventRequestSchema(CODE_MESSAGES, []),
  transport: transportSchema(CODE_MESSAGES),
  lodging: lodgingSchema(CODE_MESSAGES),
  contact: contactSchema(CODE_MESSAGES),
}

const label = (tr: string) => ({ tr })
const custom = (patch: Partial<CustomFormField> = {}): CustomFormField => ({ kind: 'custom', key: 'c_extra', type: 'text', required: false, label: label('Ek'), ...patch })
const withFields = (kind: keyof typeof DEFAULT_FORM_DEFINITIONS, extra: FormDefinition['fields']): FormDefinition => ({
  format: 1,
  fields: [...DEFAULT_FORM_DEFINITIONS[kind].fields, ...extra],
})
const codes = (issues: ReturnType<typeof validateDefinition>) => issues.map((issue) => issue.code)

describe('DEFAULT_FORM_DEFINITIONS', () => {
  it.each(REQUEST_KINDS)('%s reproduces today\'s fields and passes validateDefinition', (kind) => {
    const definition = DEFAULT_FORM_DEFINITIONS[kind]
    expect(validateDefinition(kind, definition)).toEqual([])
    const keys = definition.fields.map((field) => field.key)
    const today = Object.keys(TODAY[kind].shape).filter((key) => !SUB_FIELDS.includes(key))
    expect(keys.toSorted()).toEqual(today.toSorted())
    expect(definition.fields.every((field) => field.kind === 'core' && field.hidden === undefined && field.required === undefined)).toBe(true)
  })

  it('keeps today\'s display order', () => {
    expect(DEFAULT_FORM_DEFINITIONS.event.fields.map((field) => field.key)).toEqual(['fullName', 'email', 'preferredDate', 'partySize', 'distribution', 'phone', 'message'])
    expect(DEFAULT_FORM_DEFINITIONS.contact.fields.map((field) => field.key)).toEqual(['fullName', 'email', 'phone', 'subject', 'message'])
  })

  it('marks the §8 fixed and free fields', () => {
    const free = Object.fromEntries(REQUEST_KINDS.map((kind) => [kind, CORE_FIELDS[kind].filter((spec) => spec.mode === 'free').map((spec) => spec.key)]))
    expect(free).toEqual({ event: ['phone', 'message'], transport: ['childSeat', 'phone', 'note'], lodging: ['phone', 'preferences'], contact: ['phone', 'subject'] })
  })
})

describe('validateDefinition catches invalid definitions', () => {
  const event = DEFAULT_FORM_DEFINITIONS.event

  it.each([
    ['schema', 'event', { format: 1, fields: [{ kind: 'custom', key: 'c_x', type: 'text', required: true, label: { tr: '' } }] }],
    ['schema', 'event', { format: 2, fields: event.fields }],
    ['missing_core', 'event', { format: 1, fields: event.fields.filter((field) => field.key !== 'phone') }],
    ['duplicate_key', 'event', withFields('event', [{ kind: 'core', key: 'phone' }])],
    ['duplicate_key', 'event', withFields('event', [custom(), custom()])],
    ['unknown_core', 'contact', withFields('contact', [{ kind: 'core', key: 'rooms' }])],
    ['fixed_changed', 'event', { format: 1, fields: event.fields.map((field) => (field.key === 'email' ? { ...field, hidden: true } : field)) }],
    ['fixed_changed', 'lodging', { format: 1, fields: DEFAULT_FORM_DEFINITIONS.lodging.fields.map((field) => (field.key === 'rooms' ? { ...field, required: false } : field)) }],
    ['too_many_custom', 'event', withFields('event', Array.from({ length: 11 }, (_, i) => custom({ key: `c_f${i}` })))],
    ['bad_options', 'event', withFields('event', [custom({ type: 'select', options: [{ value: 'a', label: label('A') }] })])],
    ['bad_options', 'event', withFields('event', [custom({ type: 'select', options: [{ value: 'a', label: label('A') }, { value: 'a', label: label('B') }] })])],
    ['bad_options', 'event', withFields('event', [custom({ options: [{ value: 'a', label: label('A') }, { value: 'b', label: label('B') }] })])],
    ['bad_range', 'event', withFields('event', [custom({ type: 'number', min: 5, max: 1 })])],
    ['bad_range', 'event', withFields('event', [custom({ type: 'text', max: 10 })])],
  ] as const)('%s (%s)', (code, kind, definition) => {
    expect(codes(validateDefinition(kind, definition))).toContain(code)
  })

  it('lets free fields be hidden or required and fixed ones be relabelled and moved', () => {
    const fields = event.fields.map((field) => (field.key === 'phone' ? { ...field, required: true } : field.key === 'message' ? { ...field, hidden: true } : field.key === 'email' ? { ...field, label: label('E-posta adresi') } : field))
    expect(validateDefinition('event', { format: 1, fields: fields.toReversed() })).toEqual([])
    expect(validateDefinition('event', withFields('event', Array.from({ length: 10 }, (_, i) => custom({ key: `c_f${i}` }))))).toEqual([])
  })

  it('keeps published custom keys and their types', () => {
    const published = withFields('event', [custom({ key: 'c_diet' })])
    expect(validateDefinition('event', withFields('event', [custom({ key: 'c_diet', hidden: true })]), published)).toEqual([])
    expect(codes(validateDefinition('event', DEFAULT_FORM_DEFINITIONS.event, published))).toEqual(['published_key_removed'])
    expect(codes(validateDefinition('event', withFields('event', [custom({ key: 'c_diet', type: 'textarea' })]), published))).toEqual(['published_type_changed'])
  })
})

describe('coreFieldState', () => {
  it('applies hidden/required to free fields only', () => {
    expect(coreFieldState('contact', 'phone')).toEqual({ hidden: false, required: false })
    const definition: FormDefinition = { format: 1, fields: DEFAULT_FORM_DEFINITIONS.contact.fields.map((field) => (field.key === 'phone' ? { ...field, required: true } : field.key === 'subject' ? { ...field, hidden: true, required: true } : field)) }
    expect(coreFieldState('contact', 'phone', definition)).toEqual({ hidden: false, required: true })
    expect(coreFieldState('contact', 'subject', definition)).toEqual({ hidden: true, required: false })
    expect(coreFieldState('contact', 'email', definition)).toEqual({ hidden: false, required: true })
  })
})

describe('customValuesSchema', () => {
  const definition = withFields('event', [
    custom({ key: 'c_note', required: true }),
    custom({ key: 'c_long', type: 'textarea' }),
    custom({ key: 'c_count', type: 'number', min: 1, max: 5 }),
    custom({ key: 'c_diet', type: 'select', required: true, options: [{ value: 'vegan', label: label('Vegan') }, { value: 'none', label: label('Yok') }] }),
    custom({ key: 'c_terms', type: 'checkbox', required: true }),
    custom({ key: 'c_day', type: 'date' }),
    custom({ key: 'c_hidden', hidden: true }),
  ])
  const schema = customValuesSchema(definition, CODE_MESSAGES)
  const valid = { c_note: 'Merhaba', c_diet: 'vegan', c_terms: true }

  it('accepts valid answers and drops hidden ones', () => {
    expect(schema.parse({ ...valid, c_count: 3, c_day: '2027-05-01', c_hidden: 'x' })).toEqual({ ...valid, c_count: 3, c_day: '2027-05-01' })
  })

  it.each([
    ['c_note', { ...valid, c_note: '  ' }],
    ['c_long', { ...valid, c_long: 'x'.repeat(2001) }],
    ['c_note', { ...valid, c_note: 'x'.repeat(201) }],
    ['c_count', { ...valid, c_count: 6 }],
    ['c_count', { ...valid, c_count: 2.5 }],
    ['c_diet', { ...valid, c_diet: 'meat' }],
    ['c_terms', { ...valid, c_terms: false }],
    ['c_day', { ...valid, c_day: '01.05.2027' }],
  ])('refuses a bad %s', (key, values) => {
    const result = schema.safeParse(values)
    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.path[0])).toContain(key)
  })
})

describe('submit envelope', () => {
  it('takes an optional non-negative integer formVersion', () => {
    const base = { kind: 'contact', locale: 'tr', idempotencyKey: '7f1d2c7a-9a43-4d2b-8a59-0c1f3f6f2b11', values: {} }
    expect(submitEnvelopeSchema.safeParse(base).success).toBe(true)
    expect(submitEnvelopeSchema.safeParse({ ...base, formVersion: 3 }).success).toBe(true)
    expect(submitEnvelopeSchema.safeParse({ ...base, formVersion: -1 }).success).toBe(false)
    expect(submitEnvelopeSchema.safeParse({ ...base, formVersion: 1.5 }).success).toBe(false)
  })
})
