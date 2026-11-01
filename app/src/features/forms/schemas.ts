import { z } from 'zod'
import { formatTemplate, type UiStrings } from '../../i18n/ui'
import { needsDistribution, validateDistribution } from '../../lib/options'

/**
 * Validation for the Stage A sample forms, with messages in the page language.
 * Stage B re-runs the same rules on the server; the client is never trusted.
 */

const requiredText = (ui: UiStrings) => z.string().trim().min(1, ui.forms.errors.required)
const optionalText = z.string().trim().optional()
const email = (ui: UiStrings) => z.string().trim().pipe(z.email(ui.forms.errors.email))
const positiveInt = (ui: UiStrings) =>
  z.number({ error: ui.forms.errors.positiveInt }).int(ui.forms.errors.positiveInt).min(1, ui.forms.errors.positiveInt)
const nonNegativeInt = (ui: UiStrings) =>
  z.number({ error: ui.forms.errors.nonNegativeInt }).int(ui.forms.errors.nonNegativeInt).min(0, ui.forms.errors.nonNegativeInt)
const childAge = (ui: UiStrings) =>
  z.number({ error: ui.forms.errors.childAge }).int(ui.forms.errors.childAge).min(0, ui.forms.errors.childAge).max(17, ui.forms.errors.childAge)

/** The lodging form shows one age field per child up to this many. */
export const MAX_CHILDREN = 10

const contactFields = (ui: UiStrings) => ({
  fullName: requiredText(ui),
  email: email(ui),
  phone: optionalText,
})

export function eventRequestSchema(ui: UiStrings, options: readonly { id: string }[]) {
  return z
    .object({
      ...contactFields(ui),
      preferredDate: requiredText(ui),
      partySize: positiveInt(ui),
      message: optionalText,
      // A blank count arrives as NaN; the localized message is shown next to that option.
      distribution: z.record(z.string(), nonNegativeInt(ui)).optional(),
    })
    .superRefine((value, ctx) => {
      if (!needsDistribution(options) || !Number.isInteger(value.partySize) || value.partySize < 1) return
      const problems = validateDistribution(options, value.partySize, value.distribution ?? {})
      for (const problem of problems) {
        const message =
          problem.code === 'sum_mismatch'
            ? formatTemplate(ui.forms.errors.distributionSum, { count: value.partySize })
            : ui.forms.errors.nonNegativeInt
        ctx.addIssue({ code: 'custom', path: ['distribution'], message })
      }
    })
}

export function transportSchema(ui: UiStrings) {
  return z
    .object({
      ...contactFields(ui),
      tripType: z.enum(['oneWay', 'roundTrip']),
      from: requiredText(ui),
      to: requiredText(ui),
      dateTime: requiredText(ui),
      returnDateTime: optionalText,
      partySize: positiveInt(ui),
      childSeat: z.boolean(),
      // Hidden inputs are unregistered, so the array may be absent entirely.
      childSeatAges: z.array(childAge(ui)).default([]),
      note: optionalText,
    })
    .superRefine((value, ctx) => {
      if (value.tripType === 'roundTrip' && !value.returnDateTime) {
        ctx.addIssue({ code: 'custom', path: ['returnDateTime'], message: ui.forms.errors.required })
      }
      if (value.childSeat && value.childSeatAges.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['childSeatAges'], message: ui.forms.errors.childSeatAges })
      }
    })
}

export function lodgingSchema(ui: UiStrings) {
  return z
    .object({
      ...contactFields(ui),
      checkIn: requiredText(ui),
      checkOut: requiredText(ui),
      adults: positiveInt(ui),
      children: nonNegativeInt(ui).max(MAX_CHILDREN, formatTemplate(ui.forms.errors.tooManyChildren, { max: MAX_CHILDREN })),
      childAges: z.array(childAge(ui)).default([]),
      rooms: positiveInt(ui),
      preferences: optionalText,
    })
    .superRefine((value, ctx) => {
      if (value.checkIn && value.checkOut && value.checkOut <= value.checkIn) {
        ctx.addIssue({ code: 'custom', path: ['checkOut'], message: ui.forms.errors.checkOutAfterCheckIn })
      }
      // Over the cap the children field already says so; the age-count message would be misleading.
      if (Number.isInteger(value.children) && value.children <= MAX_CHILDREN && value.childAges.length !== value.children) {
        ctx.addIssue({ code: 'custom', path: ['childAges'], message: ui.forms.errors.childAge })
      }
    })
}

export function contactSchema(ui: UiStrings) {
  return z.object({ ...contactFields(ui), subject: optionalText, message: requiredText(ui) })
}

export type EventRequestValues = z.infer<ReturnType<typeof eventRequestSchema>>
export type TransportValues = z.infer<ReturnType<typeof transportSchema>>
export type LodgingValues = z.infer<ReturnType<typeof lodgingSchema>>
export type ContactValues = z.infer<ReturnType<typeof contactSchema>>
