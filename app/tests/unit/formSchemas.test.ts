import { describe, expect, it } from 'vitest'
import {
  contactSchema,
  eventRequestSchema,
  lodgingSchema,
  MAX_CHILDREN,
  transportSchema,
} from '../../src/features/forms/schemas'
import { formatTemplate, getUi } from '../../src/i18n/ui'

const ui = getUi('tr')
const errors = ui.forms.errors
const messages = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((issue) => issue.message) ?? []

const contactBase = { fullName: 'Ayşe Örnek', email: 'ayse@example.com' }

describe('eventRequestSchema (first short request, V6 §6)', () => {
  const twoOptions = [{ id: 'yemekli' }, { id: 'yemeksiz' }]
  const schema = eventRequestSchema(ui, twoOptions)
  const valid = { ...contactBase, preferredDate: '2026-12-05', partySize: 4, distribution: { yemekli: 2, yemeksiz: 2 } }

  it('accepts a complete request with phone and message optional', () => {
    expect(schema.safeParse(valid).success).toBe(true)
  })

  it('requires name, email, preferred date and party size', () => {
    const result = schema.safeParse({ fullName: ' ', email: 'x', preferredDate: '', partySize: Number.NaN })
    expect(messages(result)).toEqual(expect.arrayContaining([errors.required, errors.email, errors.positiveInt]))
  })

  it('rejects a distribution that does not add up to the party size', () => {
    const result = schema.safeParse({ ...valid, distribution: { yemekli: 2, yemeksiz: 1 } })
    expect(messages(result)).toContain('Seçeneklerdeki kişi sayılarının toplamı 4 olmalı.')
  })

  it('reports a blank per-option count on that option, in the page language', () => {
    const result = schema.safeParse({ ...valid, distribution: { yemekli: 4, yemeksiz: Number.NaN } })
    expect(result.success).toBe(false)
    const issue = result.error?.issues.find((i) => i.path.join('.') === 'distribution.yemeksiz')
    expect(issue?.message).toBe(errors.nonNegativeInt)
  })

  it('does not ask for a distribution when the event has a single option', () => {
    const single = eventRequestSchema(ui, [{ id: 'tek' }])
    expect(single.safeParse({ ...contactBase, preferredDate: '2026-12-05', partySize: 3 }).success).toBe(true)
  })
})

describe('transportSchema', () => {
  const schema = transportSchema(ui)
  const valid = {
    ...contactBase,
    tripType: 'oneWay',
    from: 'Dalaman Havalimanı',
    to: 'Kaş',
    dateTime: '2026-12-05T14:00',
    partySize: 2,
    childSeat: false,
    childSeatAges: [],
  }

  it('accepts a one-way transfer', () => {
    expect(schema.safeParse(valid).success).toBe(true)
  })

  it('accepts a request whose hidden child-seat fields were unregistered', () => {
    const { childSeatAges: _omitted, ...withoutAges } = valid
    expect(schema.safeParse(withoutAges).success).toBe(true)
  })

  it('requires the return date and time for a return trip', () => {
    expect(messages(schema.safeParse({ ...valid, tripType: 'roundTrip' }))).toContain(errors.required)
    expect(schema.safeParse({ ...valid, tripType: 'roundTrip', returnDateTime: '2026-12-12T10:00' }).success).toBe(true)
  })

  it('asks for at least one child age when a child seat is requested', () => {
    expect(messages(schema.safeParse({ ...valid, childSeat: true, childSeatAges: [] }))).toContain(errors.childSeatAges)
    expect(schema.safeParse({ ...valid, childSeat: true, childSeatAges: [3, 6] }).success).toBe(true)
    expect(messages(schema.safeParse({ ...valid, childSeat: true, childSeatAges: [19] }))).toContain(errors.childAge)
  })
})

describe('lodgingSchema', () => {
  const schema = lodgingSchema(ui)
  const valid = { ...contactBase, checkIn: '2026-12-05', checkOut: '2026-12-08', adults: 2, children: 0, childAges: [], rooms: 1 }

  it('accepts a stay without children', () => {
    expect(schema.safeParse(valid).success).toBe(true)
    const { childAges: _omitted, ...withoutAges } = valid
    expect(schema.safeParse(withoutAges).success).toBe(true)
  })

  it('requires check-out after check-in', () => {
    expect(messages(schema.safeParse({ ...valid, checkOut: '2026-12-05' }))).toContain(errors.checkOutAfterCheckIn)
  })

  it('asks the age of every child', () => {
    expect(schema.safeParse({ ...valid, children: 2, childAges: [4] }).success).toBe(false)
    expect(schema.safeParse({ ...valid, children: 2, childAges: [4, 9] }).success).toBe(true)
  })

  it('caps the children count at the number of age fields shown, with a message', () => {
    const ages = Array.from({ length: MAX_CHILDREN }, () => 5)
    expect(schema.safeParse({ ...valid, children: MAX_CHILDREN, childAges: ages }).success).toBe(true)
    const tooMany = schema.safeParse({ ...valid, children: MAX_CHILDREN + 2, childAges: ages })
    expect(messages(tooMany)).toContain(formatTemplate(errors.tooManyChildren, { max: MAX_CHILDREN }))
    expect(messages(tooMany)).not.toContain(errors.childAge)
  })

  it('needs a positive whole number of rooms', () => {
    expect(messages(schema.safeParse({ ...valid, rooms: 0 }))).toContain(errors.positiveInt)
  })
})

describe('contactSchema', () => {
  it('requires a message', () => {
    expect(contactSchema(ui).safeParse({ ...contactBase, message: '' }).success).toBe(false)
    expect(contactSchema(ui).safeParse({ ...contactBase, message: 'Merhaba' }).success).toBe(true)
  })
})
