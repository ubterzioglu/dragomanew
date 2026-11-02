import { describe, expect, it } from 'vitest'
import { DEFAULT_FORM_DEFINITIONS, type FormDefinition, type FormField } from '../../src/shared/requests/forms'
import type { RequestKind } from '../../src/shared/requests/payload'
import { CODE_MESSAGES, contactSchema, eventRequestSchema, lodgingSchema, transportSchema } from '../../src/shared/requests/schemas'

/** The shared builders under a form definition (dalga2-sozlesme §8): the site and submit-request run these. */

const patched = (kind: RequestKind, patch: Partial<Record<string, Partial<FormField>>>, extra: FormField[] = []): FormDefinition => ({
  format: 1,
  fields: [...DEFAULT_FORM_DEFINITIONS[kind].fields.map((field) => ({ ...field, ...patch[field.key] }) as FormField), ...extra],
})
const paths = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.error?.issues.map((issue) => issue.path.join('.')) ?? []

const person = { fullName: 'Ayşe Yılmaz', email: 'ayse@example.com' }
const transport = { ...person, tripType: 'oneWay', from: 'Dalaman', to: 'Kaş', dateTime: '2026-11-20T10:00', partySize: 2, childSeat: true, childSeatAges: [4] }
const lodging = { ...person, checkIn: '2026-11-20', checkOut: '2026-11-25', adults: 2, children: 0, childAges: [], rooms: 1 }

describe('schemas under a form definition', () => {
  it('give the built-in result for the default definitions', () => {
    const contact = { ...person, subject: 'Soru', message: 'Merhaba' }
    expect(contactSchema(CODE_MESSAGES, DEFAULT_FORM_DEFINITIONS.contact).parse(contact)).toEqual(contactSchema(CODE_MESSAGES).parse(contact))
    expect(transportSchema(CODE_MESSAGES, DEFAULT_FORM_DEFINITIONS.transport).parse(transport)).toEqual(transportSchema(CODE_MESSAGES).parse(transport))
  })

  it('drop a hidden child seat together with its ages', () => {
    const schema = transportSchema(CODE_MESSAGES, patched('transport', { childSeat: { hidden: true } }))
    expect(schema.parse({ ...transport, childSeatAges: ['bad'] })).toMatchObject({ childSeat: false, childSeatAges: [] })
  })

  it('make a free text field required or hide it', () => {
    const event = eventRequestSchema(CODE_MESSAGES, [], patched('event', { message: { required: true }, phone: { hidden: true } }))
    const values = { ...person, preferredDate: '2026-11-20', partySize: 2, phone: '+90 555' }
    expect(paths(event.safeParse(values))).toEqual(['message'])
    // Undefined, so the stored JSON has no phone at all.
    expect(event.parse({ ...values, message: 'Merhaba' }).phone).toBeUndefined()

    const hidden = lodgingSchema(CODE_MESSAGES, patched('lodging', { preferences: { hidden: true } }))
    expect(hidden.parse({ ...lodging, preferences: 'x'.repeat(9000) }).preferences).toBeUndefined()
  })

  it('check each custom type and treat a required checkbox as ticked', () => {
    const extra: FormField[] = [
      { kind: 'custom', key: 'c_count', type: 'number', required: true, label: { tr: 'Sayı' }, min: 1, max: 5 },
      { kind: 'custom', key: 'c_day', type: 'date', required: false, label: { tr: 'Gün' } },
      { kind: 'custom', key: 'c_ok', type: 'checkbox', required: true, label: { tr: 'Onay' } },
      { kind: 'custom', key: 'c_old', type: 'text', required: true, hidden: true, label: { tr: 'Eski' } },
    ]
    const schema = lodgingSchema(CODE_MESSAGES, patched('lodging', {}, extra))
    expect(paths(schema.safeParse({ ...lodging, custom: { c_count: 9, c_day: '20.11.2026', c_ok: false } }))).toEqual(['custom.c_count', 'custom.c_day', 'custom.c_ok'])
    expect(paths(schema.safeParse(lodging))).toEqual(['custom'])
    expect(schema.parse({ ...lodging, custom: { c_count: 3, c_ok: true, c_old: 'kept?' } }).custom).toEqual({ c_count: 3, c_ok: true })
  })
})
