import { z } from 'zod'
import { CORE_FIELDS, coreFieldState, customValuesSchema, type CoreKey, type FormDefinition } from './forms.ts'
import type { RequestKind } from './payload.ts'
import { needsDistribution, validateDistribution } from './rules.ts'

/**
 * The request forms' validation, shared by the site and the submit-request function.
 * The site passes localized messages; the server passes CODE_MESSAGES, because it answers
 * with field paths and never with prose. The client is never trusted: the server re-runs these.
 *
 * Each builder takes an optional form definition (forms.ts, dalga2-sozlesme §8). Without one it is
 * the built-in form. With one, free core fields follow their hidden/required flags (a hidden
 * field's value is dropped, never validated) and `custom` holds the visible custom answers.
 */

export interface FormMessages {
  required: string
  email: string
  positiveInt: string
  nonNegativeInt: string
  childAge: string
  childSeatAges: string
  checkOutAfterCheckIn: string
  distributionSum: (count: number) => string
  tooManyChildren: (max: number) => string
  tooLong: (max: number) => string
}

/** Server-side messages: each message is its own code. */
export const CODE_MESSAGES: FormMessages = {
  required: 'required',
  email: 'email',
  positiveInt: 'positiveInt',
  nonNegativeInt: 'nonNegativeInt',
  childAge: 'childAge',
  childSeatAges: 'childSeatAges',
  checkOutAfterCheckIn: 'checkOutAfterCheckIn',
  distributionSum: () => 'distributionSum',
  tooManyChildren: () => 'tooManyChildren',
  tooLong: () => 'too_long',
}

/** The lodging form shows one age field per child up to this many. */
export const MAX_CHILDREN = 10

/**
 * Character caps per field. Without them the 32 KB body cap was the only bound, so one field
 * could carry pages of text into the database and the business mail.
 */
export const TEXT_LIMITS = { name: 120, email: 254, phone: 40, short: 200, long: 2000 } as const

/** More child seats than this in one transfer is a message to Dragoman, not a form entry. */
export const MAX_CHILD_SEATS = 20

/** An event has a handful of options; the record is checked against the real ones afterwards. */
export const MAX_DISTRIBUTION_KEYS = 50
/** Same cap as the envelope's eventId. */
const MAX_OPTION_ID = 100

const requiredText = (m: FormMessages, max: number = TEXT_LIMITS.short) =>
  z.string().trim().min(1, m.required).max(max, m.tooLong(max))
const optionalText = (m: FormMessages, max: number = TEXT_LIMITS.short) =>
  z.string().trim().max(max, m.tooLong(max)).optional()
const email = (m: FormMessages) =>
  z.string().trim().max(TEXT_LIMITS.email, m.tooLong(TEXT_LIMITS.email)).pipe(z.email(m.email))
const positiveInt = (m: FormMessages) =>
  z.number({ error: m.positiveInt }).int(m.positiveInt).min(1, m.positiveInt)
const nonNegativeInt = (m: FormMessages) =>
  z.number({ error: m.nonNegativeInt }).int(m.nonNegativeInt).min(0, m.nonNegativeInt)
const childAge = (m: FormMessages) =>
  z.number({ error: m.childAge }).int(m.childAge).min(0, m.childAge).max(17, m.childAge)

const contactFields = (m: FormMessages) => ({
  fullName: requiredText(m, TEXT_LIMITS.name),
  email: email(m),
  phone: optionalText(m, TEXT_LIMITS.phone),
})

/** Answers to a definition's custom fields, keyed by their `c_` key. */
export type CustomValues = Record<string, string | number | boolean | undefined>

/** Character cap of each free text field, the same as its built-in schema. */
const FREE_TEXT_LIMITS: Partial<Record<CoreKey, number>> = {
  phone: TEXT_LIMITS.phone,
  subject: TEXT_LIMITS.short,
  message: TEXT_LIMITS.long,
  note: TEXT_LIMITS.long,
  preferences: TEXT_LIMITS.long,
}

/** A hidden field takes no input: whatever arrives is replaced by its empty value. */
const dropped = <T>(empty: T) => z.unknown().optional().transform((): T => empty)

type Shape = Record<string, z.ZodType>

/**
 * The kind's built-in shape adjusted to `definition`: hidden free fields dropped, free text fields
 * required or optional as the definition says, plus `custom`. Fixed fields never change. The type
 * stays the built-in one, so a site form's values are typed the same under any definition.
 */
function definedShape<S extends Shape>(kind: RequestKind, shape: S, m: FormMessages, definition?: FormDefinition): S & { custom: z.ZodOptional<z.ZodType<CustomValues, CustomValues>> } {
  // No definition: exactly the built-in shape, without even a `custom` key.
  if (!definition) return shape as S & { custom: z.ZodOptional<z.ZodType<CustomValues, CustomValues>> }
  const next: Shape = { ...shape }
  for (const spec of CORE_FIELDS[kind]) {
    if (spec.mode !== 'free') continue
    const state = coreFieldState(kind, spec.key, definition)
    const limit = FREE_TEXT_LIMITS[spec.key]
    if (spec.key === 'childSeat') {
      // A checkbox is always answered, so only hiding changes it; its ages go with it.
      if (state.hidden) Object.assign(next, { childSeat: dropped(false), childSeatAges: dropped<number[]>([]) })
    } else if (state.hidden) next[spec.key] = dropped(undefined)
    else if (limit !== undefined) next[spec.key] = state.required ? requiredText(m, limit) : optionalText(m, limit)
  }
  const custom = customValuesSchema(definition, m)
  // Absent answers are fine until one of them is required.
  const answersRequired = definition.fields.some((field) => field.kind === 'custom' && !field.hidden && field.required)
  next.custom = answersRequired ? custom : custom.optional()
  return next as S & { custom: z.ZodOptional<z.ZodType<CustomValues, CustomValues>> }
}

export function eventRequestSchema(m: FormMessages, options: readonly { id: string }[], definition?: FormDefinition) {
  return z
    .object(definedShape('event', {
      ...contactFields(m),
      preferredDate: requiredText(m),
      partySize: positiveInt(m),
      message: optionalText(m, TEXT_LIMITS.long),
      // A blank count arrives as NaN; the localized message is shown next to that option.
      distribution: z
        .record(z.string().max(MAX_OPTION_ID, m.tooLong(MAX_OPTION_ID)), nonNegativeInt(m))
        .refine((counts) => Object.keys(counts).length <= MAX_DISTRIBUTION_KEYS, m.nonNegativeInt)
        .optional(),
    }, m, definition))
    .superRefine((value, ctx) => {
      if (!needsDistribution(options) || !Number.isInteger(value.partySize) || value.partySize < 1) return
      const problems = validateDistribution(options, value.partySize, value.distribution ?? {})
      for (const problem of problems) {
        const message = problem.code === 'sum_mismatch' ? m.distributionSum(value.partySize) : m.nonNegativeInt
        ctx.addIssue({ code: 'custom', path: ['distribution'], message })
      }
    })
}

export function transportSchema(m: FormMessages, definition?: FormDefinition) {
  return z
    .object(definedShape('transport', {
      ...contactFields(m),
      tripType: z.enum(['oneWay', 'roundTrip']),
      from: requiredText(m),
      to: requiredText(m),
      dateTime: requiredText(m),
      returnDateTime: optionalText(m),
      partySize: positiveInt(m),
      childSeat: z.boolean(),
      // Hidden inputs are unregistered, so the array may be absent entirely.
      childSeatAges: z.array(childAge(m)).max(MAX_CHILD_SEATS, m.childSeatAges).default([]),
      note: optionalText(m, TEXT_LIMITS.long),
    }, m, definition))
    .superRefine((value, ctx) => {
      if (value.tripType === 'roundTrip' && !value.returnDateTime) {
        ctx.addIssue({ code: 'custom', path: ['returnDateTime'], message: m.required })
      }
      if (value.childSeat && value.childSeatAges.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['childSeatAges'], message: m.childSeatAges })
      }
    })
}

export function lodgingSchema(m: FormMessages, definition?: FormDefinition) {
  return z
    .object(definedShape('lodging', {
      ...contactFields(m),
      checkIn: requiredText(m),
      checkOut: requiredText(m),
      adults: positiveInt(m),
      children: nonNegativeInt(m).max(MAX_CHILDREN, m.tooManyChildren(MAX_CHILDREN)),
      childAges: z.array(childAge(m)).max(MAX_CHILDREN, m.tooManyChildren(MAX_CHILDREN)).default([]),
      rooms: positiveInt(m),
      preferences: optionalText(m, TEXT_LIMITS.long),
    }, m, definition))
    .superRefine((value, ctx) => {
      if (value.checkIn && value.checkOut && value.checkOut <= value.checkIn) {
        ctx.addIssue({ code: 'custom', path: ['checkOut'], message: m.checkOutAfterCheckIn })
      }
      // Over the cap the children field already says so; the age-count message would be misleading.
      if (Number.isInteger(value.children) && value.children <= MAX_CHILDREN && value.childAges.length !== value.children) {
        ctx.addIssue({ code: 'custom', path: ['childAges'], message: m.childAge })
      }
    })
}

export function contactSchema(m: FormMessages, definition?: FormDefinition) {
  return z.object(definedShape('contact', { ...contactFields(m), subject: optionalText(m), message: requiredText(m, TEXT_LIMITS.long) }, m, definition))
}

export type EventRequestValues = z.infer<ReturnType<typeof eventRequestSchema>>
export type TransportValues = z.infer<ReturnType<typeof transportSchema>>
export type LodgingValues = z.infer<ReturnType<typeof lodgingSchema>>
export type ContactValues = z.infer<ReturnType<typeof contactSchema>>
