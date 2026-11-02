import { z } from 'zod'

/**
 * The contract between the site's forms and the submit-request Edge Function (Stage B).
 * Shared with the function as a byte-for-byte copy (scripts/sync-shared.mjs), so this file
 * imports nothing but zod.
 */

export const REQUEST_KINDS = ['event', 'transport', 'lodging', 'contact'] as const
export const SITE_LOCALES = ['tr', 'en', 'fr', 'de'] as const

export type RequestKind = (typeof REQUEST_KINDS)[number]
export type SiteLocale = (typeof SITE_LOCALES)[number]

/** Largest request body the function accepts, in bytes. */
export const MAX_BODY_BYTES = 32 * 1024

/**
 * The envelope; `values` is checked afterwards against the kind's own schema. `website` is the
 * honeypot: people never see it, so any value means a bot.
 */
export const submitEnvelopeSchema = z.object({
  kind: z.enum(REQUEST_KINDS),
  locale: z.enum(SITE_LOCALES),
  idempotencyKey: z.uuid(),
  values: z.record(z.string(), z.unknown()),
  eventId: z.string().min(1).max(100).optional(),
  website: z.string().max(500).optional(),
  pagePath: z.string().max(300).optional(),
})

export type SubmitEnvelope = z.infer<typeof submitEnvelopeSchema>

export type SubmitErrorCode = 'invalid' | 'unknown_event' | 'event_closed' | 'rate_limited' | 'server'

export type SubmitResponse =
  | { ok: true; reference: string }
  | { ok: false; error: SubmitErrorCode; fields?: string[] }

/** HTTP status the function answers each error with. */
export const SUBMIT_ERROR_STATUS: Readonly<Record<SubmitErrorCode, number>> = {
  invalid: 400,
  unknown_event: 404,
  event_closed: 409,
  rate_limited: 429,
  server: 500,
}
