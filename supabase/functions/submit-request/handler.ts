import {
  MAX_BODY_BYTES,
  SUBMIT_ERROR_STATUS,
  submitEnvelopeSchema,
  type SiteLocale,
  type SubmitEnvelope,
  type SubmitErrorCode,
  type SubmitResponse,
} from '../_shared/requests/payload.ts'
import { DEFAULT_FORM_DEFINITIONS, type FormDefinition } from '../_shared/requests/forms.ts'
import { optionCounts, requestSummary, validateDistribution, type RequestSummary } from '../_shared/requests/rules.ts'
import {
  CODE_MESSAGES,
  contactSchema,
  eventRequestSchema,
  lodgingSchema,
  transportSchema,
  type ContactValues,
  type EventRequestValues,
  type LodgingValues,
  type TransportValues,
} from '../_shared/requests/schemas.ts'
import { businessNotice, customerReceipt, type MailContent, type MailRequest } from '../_shared/mail/templates.ts'
import { clientIp, corsHeaders, failure, hasPublishableKey, jsonResponse, readLimitedText } from './http.ts'
import { redactEmails } from './redact.ts'
import type {
  DeliveryResult,
  Deps,
  EventRecord,
  EventSnapshot,
  LocalizedText,
  MailMessage,
  NewNotification,
  SavedRequest,
} from './types.ts'

/**
 * The submit-request flow (contract "Edge Function submit-request"): CORS, method, key,
 * size, JSON, honeypot, rate limit, validation, event checks with a server-side price,
 * an idempotent insert, then the outbox and an immediate send. Pure apart from `deps`.
 */
export async function handleSubmit(request: Request, deps: Deps): Promise<Response> {
  const cors = corsHeaders(request.headers.get('origin'), deps.config.allowedOrigins)
  if (!cors) return jsonResponse(403, failure('invalid'))
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

  const reply = (status: number, body: SubmitResponse) => jsonResponse(status, body, cors)
  if (request.method !== 'POST') return jsonResponse(405, failure('invalid'), { ...cors, allow: 'POST, OPTIONS' })
  // The key is public; it only keeps casual scripts off the endpoint (verify_jwt is off).
  if (!hasPublishableKey(request, deps.config.publishableKeys)) return reply(401, failure('server'))

  const raw = await readLimitedText(request, MAX_BODY_BYTES)
  if (raw === null) return reply(413, failure('invalid'))
  const parsed = parseJson(raw)
  if (!parsed.ok) return reply(400, failure('invalid'))
  // A bot that filled the hidden field gets a believable answer and leaves no trace.
  if (filledHoneypot(parsed.value)) return reply(200, { ok: true, reference: fakeReference() })

  try {
    const [status, body] = await accept(parsed.value, request, deps)
    return reply(status, body)
  } catch (error) {
    deps.reportError?.('submit-request', error)
    return reply(500, failure('server'))
  }
}

type Outcome = readonly [status: number, body: SubmitResponse]

const reject = (error: SubmitErrorCode, fields?: string[]): Outcome => [SUBMIT_ERROR_STATUS[error], failure(error, fields)]

type KindValues =
  | { kind: 'event'; values: EventRequestValues }
  | { kind: 'transport'; values: TransportValues }
  | { kind: 'lodging'; values: LodgingValues }
  | { kind: 'contact'; values: ContactValues }

interface PricedEvent {
  eventId: string
  snapshot: EventSnapshot
  summary: RequestSummary
}

async function accept(input: unknown, request: Request, deps: Deps): Promise<Outcome> {
  const { store, config } = deps
  const ipHash = await deps.hashIp(clientIp(request))
  // One atomic call: the database counts and records under a per-hash lock, so a parallel
  // burst cannot all read a count below the limit.
  if (!(await store.throttleSubmission(ipHash, config.rateLimit))) return reject('rate_limited')

  const envelope = submitEnvelopeSchema.safeParse(input)
  if (!envelope.success) return reject('invalid', issuePaths(envelope.error.issues, ''))
  const form = await resolveForm(envelope.data, deps)
  if (!form) return reject('invalid', ['formVersion'])
  const parsed = parseValues(envelope.data, form.definition)
  if ('fields' in parsed) return reject('invalid', parsed.fields)

  let priced: PricedEvent | null = null
  if (parsed.kind === 'event') {
    const result = await priceEvent(envelope.data.eventId, parsed.values, envelope.data.locale, deps)
    if (!('eventId' in result)) return result
    priced = result
  }

  const { fullName, email, phone } = parsed.values
  const saved = await store.saveRequest({
    kind: parsed.kind,
    locale: envelope.data.locale,
    fullName,
    email,
    phone: phone || null,
    payload: parsed.values,
    eventId: priced?.eventId ?? null,
    eventSnapshot: priced?.snapshot ?? null,
    priceSummary: priced?.summary ?? null,
    idempotencyKey: envelope.data.idempotencyKey,
    formVersion: form.version,
  })
  // A replayed key normally had its mails already and only gets the same reference back. But the
  // insert and the outbox are two writes: when the first attempt died between them, nobody was
  // told about a stored request, so a replay with an empty outbox is treated like a new one.
  if (saved.created || (await outboxMissing(saved.id, deps))) {
    const mail: MailRequest = {
      reference: saved.reference,
      locale: envelope.data.locale,
      event: priced?.snapshot ?? null,
      summary: priced?.summary ?? null,
      form: form.definition,
      ...parsed,
    }
    await notify(saved, mail, deps).catch((error: unknown) => deps.reportError?.('submit-request: mail', error))
  }
  return [200, { ok: true, reference: saved.reference }]
}

/** When the outbox cannot be read, assume the mails went out: a duplicate is worse than a late one. */
async function outboxMissing(requestId: string, deps: Deps): Promise<boolean> {
  try {
    return !(await deps.store.hasNotifications(requestId))
  } catch (error) {
    deps.reportError?.('submit-request: outbox check', error)
    return false
  }
}

interface ResolvedForm {
  /** null: the built-in form, stored as no version. */
  version: number | null
  definition: FormDefinition
}

/**
 * Step 6 of the contract (dalga2-sozlesme §8): a given version must exist, else the request is
 * refused on `formVersion`. Without one the built-in form applies: release builds always send their
 * version, so a request without one comes from a page that renders the built-in form, and checking it
 * against a newer published version would refuse every visitor until the rebuilt site is live.
 */
async function resolveForm(envelope: SubmitEnvelope, deps: Deps): Promise<ResolvedForm | null> {
  if (envelope.formVersion === undefined) return { version: null, definition: DEFAULT_FORM_DEFINITIONS[envelope.kind] }
  return deps.store.findFormVersion ? deps.store.findFormVersion(envelope.kind, envelope.formVersion) : null
}

function parseValues(envelope: SubmitEnvelope, definition: FormDefinition): KindValues | { fields: string[] } {
  const m = CODE_MESSAGES
  const values = envelope.values
  switch (envelope.kind) {
    case 'event': {
      // Options are not known yet; the distribution is checked against the database below.
      const result = eventRequestSchema(m, [], definition).safeParse(values)
      return result.success ? { kind: 'event', values: result.data } : { fields: issuePaths(result.error.issues, 'values') }
    }
    case 'transport': {
      const result = transportSchema(m, definition).safeParse(values)
      return result.success ? { kind: 'transport', values: result.data } : { fields: issuePaths(result.error.issues, 'values') }
    }
    case 'lodging': {
      const result = lodgingSchema(m, definition).safeParse(values)
      return result.success ? { kind: 'lodging', values: result.data } : { fields: issuePaths(result.error.issues, 'values') }
    }
    case 'contact': {
      const result = contactSchema(m, definition).safeParse(values)
      return result.success ? { kind: 'contact', values: result.data } : { fields: issuePaths(result.error.issues, 'values') }
    }
  }
}

/** The event must exist and be published; prices come from the database, never the client. */
async function priceEvent(
  eventId: string | undefined,
  values: EventRequestValues,
  locale: SiteLocale,
  deps: Deps,
): Promise<PricedEvent | Outcome> {
  if (!eventId) return reject('invalid', ['eventId'])
  const event = await deps.store.findEvent(eventId)
  if (!event) return reject('unknown_event')
  if (event.status !== 'published') return reject('event_closed')
  if (validateDistribution(event.options, values.partySize, values.distribution ?? {}).length > 0) {
    return reject('invalid', ['values.distribution'])
  }
  const counts = optionCounts(event.options, values.partySize, values.distribution)
  return { eventId: event.id, snapshot: snapshotOf(event, counts, locale), summary: requestSummary(event, counts) }
}

const pickText = (text: LocalizedText, locale: SiteLocale, fallback: string): string =>
  text[locale] || text.tr || Object.values(text).find((value) => Boolean(value)) || fallback

function snapshotOf(event: EventRecord, counts: Readonly<Record<string, number>>, locale: SiteLocale): EventSnapshot {
  const options = event.options
    .filter((option) => (counts[option.id] ?? 0) > 0)
    .map((option) => ({
      id: option.id,
      name: pickText(option.name, locale, option.id),
      price: option.price,
      currency: option.currency,
      basis: option.basis,
      quantity: counts[option.id] ?? 0,
    }))
  return {
    id: event.id,
    category: event.category,
    title: pickText(event.title, locale, event.id),
    priceDisplay: event.priceDisplay,
    options,
  }
}

interface Outgoing {
  row: NewNotification
  content: MailContent
  /** Only the business mail gets one, so staff can answer the visitor straight from the inbox. */
  replyTo?: string
}

/** Outbox first, so a mail that fails is still on record; then send each with a timeout. */
async function notify(saved: SavedRequest, mail: MailRequest, deps: Deps): Promise<void> {
  const { businessEmail, panelUrl } = deps.config
  const outgoing: Outgoing[] = [
    {
      row: { requestId: saved.id, kind: 'customer_receipt', recipient: mail.values.email, locale: mail.locale },
      content: customerReceipt(mail),
    },
    ...(businessEmail
      ? [
          {
            row: { requestId: saved.id, kind: 'business_new_request', recipient: businessEmail, locale: 'tr' },
            content: businessNotice(mail, panelUrl),
            replyTo: mail.values.email,
          } satisfies Outgoing,
        ]
      : []),
  ]
  const ids = await deps.store.queueNotifications(outgoing.map((item) => item.row))

  await Promise.all(
    outgoing.map(async ({ row, content, replyTo }, index) => {
      const id = ids[index]
      if (id === undefined) return
      const result = await deliver({ to: row.recipient, ...content, ...(replyTo ? { replyTo } : {}) }, deps)
      if (result.status === 'failed') deps.reportError?.(`submit-request: ${row.kind} not sent`, result.error)
      await deps.store.markNotification(id, result).catch((error: unknown) => deps.reportError?.('submit-request: outbox', error))
    }),
  )
}

async function deliver(message: MailMessage, deps: Deps): Promise<DeliveryResult> {
  try {
    await withTimeout(deps.mailer.send(message), deps.config.mailTimeoutMs)
    return { status: 'sent', at: deps.clock() }
  } catch (error) {
    // SMTP errors quote the recipient; last_error and the log keep the reason, not the address.
    return { status: 'failed', error: redactEmails(error instanceof Error ? error.message : String(error)).slice(0, 500) }
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, rejectTimeout) => {
    // "timeout" is the word last_error keeps, so a lost race reads the same as an SMTP timeout.
    timer = setTimeout(() => rejectTimeout(new Error(`timeout: no answer from SMTP within ${ms} ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

function parseJson(raw: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(raw) as unknown }
  } catch {
    return { ok: false }
  }
}

function filledHoneypot(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || !('website' in value)) return false
  return typeof value.website === 'string' && value.website.trim() !== ''
}

/** Same shape as a real reference, so a bot cannot tell it was caught. */
function fakeReference(): string {
  const [random = 0] = crypto.getRandomValues(new Uint32Array(1))
  return `DRG-${String(random % 1_000_000).padStart(6, '0')}`
}

/** Dot paths of the failing fields, without repeats; a root-level problem is reported as its prefix. */
function issuePaths(issues: ReadonlyArray<{ path: readonly PropertyKey[] }>, prefix: string): string[] {
  const paths = issues.map((issue) => [prefix, ...issue.path.map(String)].filter((part) => part !== '').join('.') || 'body')
  return [...new Set(paths)]
}
