import { describe, expect, it } from 'vitest'
import { formMessages } from '../../src/features/forms/schemas'
import type { Locale } from '../../src/i18n/locales'
import { getUi } from '../../src/i18n/ui'
import { optionCounts } from '../../src/shared/requests/rules.ts'
import {
  CODE_MESSAGES,
  contactSchema,
  eventRequestSchema,
  lodgingSchema,
  MAX_CHILDREN,
  MAX_DISTRIBUTION_KEYS,
  TEXT_LIMITS,
} from '../../src/shared/requests/schemas.ts'

const options = [{ id: 'shore' }, { id: 'boat' }]

describe('optionCounts', () => {
  it('uses the distribution when several options are offered', () => {
    expect(optionCounts(options, 4, { shore: 3, boat: 1 })).toEqual({ shore: 3, boat: 1 })
    expect(optionCounts(options, 4, undefined)).toEqual({})
  })

  it('puts the whole party on the only option, ignoring any distribution sent', () => {
    expect(optionCounts([{ id: 'day' }], 3, { day: 1, other: 2 })).toEqual({ day: 3 })
  })

  it('counts nothing when the event has no options', () => {
    expect(optionCounts([], 3, undefined)).toEqual({})
  })
})

describe('CODE_MESSAGES', () => {
  it('makes each server-side message its own code', () => {
    const result = eventRequestSchema(CODE_MESSAGES, options).safeParse({
      fullName: ' ',
      email: 'x',
      preferredDate: '2026-11-20',
      partySize: 4,
      distribution: { shore: 1, boat: 1 },
    })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((issue) => [issue.path.join('.'), issue.message])
    expect(messages).toEqual(
      expect.arrayContaining([
        ['fullName', 'required'],
        ['email', 'email'],
      ]),
    )
  })

  it('reports the distribution and child cap with fixed codes', () => {
    const distribution = eventRequestSchema(CODE_MESSAGES, options).safeParse({
      fullName: 'A',
      email: 'a@example.com',
      preferredDate: '2026-11-20',
      partySize: 4,
      distribution: { shore: 1, boat: 1 },
    })
    expect(distribution.error?.issues.map((issue) => issue.message)).toEqual(['distributionSum'])

    const lodging = lodgingSchema(CODE_MESSAGES).safeParse({
      fullName: 'A',
      email: 'a@example.com',
      checkIn: '2026-11-20',
      checkOut: '2026-11-22',
      adults: 2,
      children: MAX_CHILDREN + 1,
      childAges: [],
      rooms: 1,
    })
    expect(lodging.error?.issues.map((issue) => [issue.path.join('.'), issue.message])).toEqual([['children', 'tooManyChildren']])
  })

  it('reports an over-long field with the too_long code', () => {
    const result = contactSchema(CODE_MESSAGES).safeParse({
      fullName: 'x'.repeat(TEXT_LIMITS.name + 1),
      email: 'a@example.com',
      message: 'Merhaba',
    })
    expect(result.error?.issues.map((issue) => [issue.path.join('.'), issue.message])).toEqual([['fullName', 'too_long']])
  })
})

describe('length and size caps', () => {
  const contact = { fullName: 'A', email: 'a@example.com', message: 'Merhaba' }

  it.each([
    ['fullName', 120],
    ['phone', 40],
    ['subject', 200],
    ['message', 2000],
  ] as const)('accepts %s up to %i characters and refuses one more', (field, max) => {
    const schema = contactSchema(CODE_MESSAGES)
    expect(schema.safeParse({ ...contact, [field]: 'x'.repeat(max) }).success).toBe(true)
    expect(schema.safeParse({ ...contact, [field]: 'x'.repeat(max + 1) }).success).toBe(false)
  })

  it('caps the e-mail address at 254 characters', () => {
    const schema = contactSchema(CODE_MESSAGES)
    const address = (length: number) => `${'a'.repeat(length - '@example.com'.length)}@example.com`
    expect(schema.safeParse({ ...contact, email: address(254) }).success).toBe(true)
    expect(schema.safeParse({ ...contact, email: address(255) }).error?.issues[0]?.message).toBe('too_long')
  })

  it('bounds the child ages list even when the child count is already wrong', () => {
    const result = lodgingSchema(CODE_MESSAGES).safeParse({
      fullName: 'A',
      email: 'a@example.com',
      checkIn: '2026-11-20',
      checkOut: '2026-11-22',
      adults: 2,
      children: MAX_CHILDREN + 1,
      childAges: Array.from({ length: 500 }, () => 5),
      rooms: 1,
    })
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain('childAges')
  })

  it('bounds the distribution record: number of options and option id length', () => {
    const schema = eventRequestSchema(CODE_MESSAGES, [])
    const base = { fullName: 'A', email: 'a@example.com', preferredDate: '2026-11-20', partySize: 1 }
    const many = Object.fromEntries(Array.from({ length: MAX_DISTRIBUTION_KEYS + 1 }, (_, i) => [`o${i}`, 0]))
    expect(schema.safeParse({ ...base, distribution: many }).error?.issues[0]?.path).toEqual(['distribution'])
    expect(schema.safeParse({ ...base, distribution: { ['k'.repeat(101)]: 1 } }).success).toBe(false)
    expect(schema.safeParse({ ...base, distribution: { shore: 1 } }).success).toBe(true)
  })
})

describe('formMessages', () => {
  it.each(['tr', 'en', 'fr', 'de'] as const satisfies readonly Locale[])('gives a localized too-long message with the limit (%s)', (locale) => {
    const message = formMessages(getUi(locale)).tooLong(120)
    expect(message).toContain('120')
    expect(message).not.toMatch(/\{max\}/)
  })
})
