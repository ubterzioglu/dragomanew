import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import type { RequestKind, SiteLocale, SubmitEnvelope, SubmitErrorCode } from '../../shared/requests/payload'

// The result and fieldset components moved to FormParts; HealthFormPage still imports them from here.
export { DemoFormFields, DemoResult, ResultMessage, type ResultTone } from './FormParts'

export type FormKind = 'event-request' | 'transport' | 'lodging' | 'contact' | 'health'

/** Why a submission failed, in the terms the visitor is told (FormResult). */
export type SubmitErrorReason = 'invalid' | 'rate_limited' | 'event_closed' | 'unavailable' | 'network'

/** `demo` is the Stage A sample result; `sent` carries the stored request's reference. */
export type SubmitResult = { kind: 'demo' } | { kind: 'sent'; reference: string } | { kind: 'error'; reason: SubmitErrorReason }

/** Sent along with the values but kept out of them, so the field schemas only see what the visitor fills in. */
export interface SubmitContext {
  locale: SiteLocale
  /** Same for every retry of one submission, so a request stored before the connection dropped is not stored twice. */
  idempotencyKey: string
  /** The honeypot's value (HoneypotField); always empty for people. */
  website?: string
  eventId?: string
  pagePath?: string
  /** The published form version the visitor filled in; absent for the built-in form. */
  formVersion?: number
}

export interface FormSubmitter {
  submit(kind: FormKind, values: unknown, context: SubmitContext): Promise<SubmitResult>
}

const DEMO: SubmitResult = { kind: 'demo' }

/**
 * Stage A: no network request, no storage (not even localStorage), no analytics.
 * The form only shows a clearly labelled sample result (guide §5).
 */
export const demoSubmitter: FormSubmitter = {
  submit: async () => DEMO,
}

/** The health form has no request kind: it stays a sample, so its answers never leave the browser. */
const REQUEST_KIND: Readonly<Record<FormKind, RequestKind | null>> = {
  'event-request': 'event',
  transport: 'transport',
  lodging: 'lodging',
  contact: 'contact',
  health: null,
}

const REASON_BY_CODE: Readonly<Record<SubmitErrorCode, SubmitErrorReason>> = {
  invalid: 'invalid',
  // To a visitor an event that is gone and one that is closed mean the same: it takes no requests.
  unknown_event: 'event_closed',
  event_closed: 'event_closed',
  rate_limited: 'rate_limited',
  server: 'unavailable',
}

/** submitEnvelopeSchema's limit for pagePath. */
const MAX_PAGE_PATH = 300
const MAX_REFERENCE = 64
/** The function sends both e-mails before it answers, each with its own timeout. */
const SUBMIT_TIMEOUT_MS = 20_000

type Fetch = (input: string, init: RequestInit) => Promise<Response>

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const failure = (reason: SubmitErrorReason): SubmitResult => ({ kind: 'error', reason })

/** Older browsers lack AbortSignal.timeout; they then wait for the browser's own timeout instead of failing every time. */
function timeoutSignal(): AbortSignal | undefined {
  return typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(SUBMIT_TIMEOUT_MS) : undefined
}

function buildEnvelope(kind: RequestKind, values: Record<string, unknown>, context: SubmitContext): SubmitEnvelope {
  const { locale, idempotencyKey, website, eventId, pagePath, formVersion } = context
  return {
    kind,
    locale,
    idempotencyKey,
    values,
    ...(eventId ? { eventId } : {}),
    ...(website ? { website } : {}),
    ...(pagePath ? { pagePath: pagePath.slice(0, MAX_PAGE_PATH) } : {}),
    ...(formVersion !== undefined ? { formVersion } : {}),
  }
}

function errorCodeOf(body: unknown): SubmitErrorCode | null {
  if (!isRecord(body) || body.ok !== false || typeof body.error !== 'string') return null
  return Object.hasOwn(REASON_BY_CODE, body.error) ? (body.error as SubmitErrorCode) : null
}

function referenceOf(body: unknown): string | null {
  if (!isRecord(body) || body.ok !== true || typeof body.reference !== 'string') return null
  return body.reference.length > 0 && body.reference.length <= MAX_REFERENCE ? body.reference : null
}

/**
 * The function's own error code wins. Without one (gateway pages, a function not deployed) only
 * unambiguous statuses count: a bare 404 must not tell a visitor that the event is closed.
 */
function reasonForStatus(status: number): SubmitErrorReason {
  if (status === 429) return 'rate_limited'
  if (status === 413) return 'invalid'
  return 'unavailable'
}

async function readResult(response: Response): Promise<SubmitResult> {
  const body: unknown = await response.json().catch(() => null)
  const reference = response.ok ? referenceOf(body) : null
  if (reference) return { kind: 'sent', reference }
  const code = errorCodeOf(body)
  if (code) return failure(REASON_BY_CODE[code])
  // A 2xx without a reference may still have been stored; a retry with the same key is safe.
  return failure(response.ok ? 'unavailable' : reasonForStatus(response.status))
}

/**
 * Stage B: posts to the submit-request Edge Function with plain fetch (no supabase-js on the
 * visitor site) and never throws, so every outcome reaches the visitor as a SubmitResult.
 */
export function createSupabaseSubmitter(url: string, key: string, fetchImpl: Fetch = (input, init) => fetch(input, init)): FormSubmitter {
  const endpoint = `${url.trim().replace(/\/+$/, '')}/functions/v1/submit-request`
  const headers = { apikey: key.trim(), 'content-type': 'application/json' }
  return {
    async submit(kind, values, context) {
      const requestKind = REQUEST_KIND[kind]
      if (!requestKind) return DEMO
      if (!isRecord(values)) return failure('invalid')
      let response: Response
      try {
        response = await fetchImpl(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(buildEnvelope(requestKind, values, context)),
          credentials: 'omit',
          signal: timeoutSignal(),
        })
      } catch {
        return failure('network')
      }
      return readResult(response)
    },
  }
}

/** The real submitter once both settings are there; otherwise the sample one, so Stage A builds behave as before. */
export function selectSubmitter(url: string | undefined, key: string | undefined, fetchImpl?: Fetch): FormSubmitter {
  const base = url?.trim()
  const apiKey = key?.trim()
  return base && apiKey ? createSupabaseSubmitter(base, apiKey, fetchImpl) : demoSubmitter
}

/** Chosen at build time from VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (the publishable key is public by design). */
export const siteSubmitter: FormSubmitter = selectSubmitter(
  import.meta.env.VITE_SUPABASE_URL as string | undefined,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined,
)

/** A random v4 UUID; plain-HTTP pages are no secure context and have no crypto.randomUUID, only getRandomValues. */
export function newIdempotencyKey(): string {
  const { crypto } = globalThis
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('')
  const variant = ((Number.parseInt(hex.charAt(16), 16) & 0x3) | 0x8).toString(16)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

export type AttemptContext = Omit<SubmitContext, 'idempotencyKey'>

interface ContextSource {
  locale: SiteLocale
  eventId?: string
  formVersion?: number
  /** The HoneypotField input; null until it mounts. */
  honeypot: { readonly value: string } | null
  location: { readonly pathname: string }
}

/** What a submission sends besides the values, read from the page on submit (useFormSubmission). */
export function attemptContext({ locale, eventId, formVersion, honeypot, location }: ContextSource): AttemptContext {
  const website = honeypot?.value
  return {
    locale,
    ...(eventId ? { eventId } : {}),
    ...(website ? { website } : {}),
    ...(formVersion !== undefined ? { formVersion } : {}),
    pagePath: location.pathname,
  }
}

/**
 * One submission attempt with the form's idempotency key (`key`, null for a fresh one).
 * `nextKey` is what the next attempt uses: the same key after an error, so a retry cannot store
 * the request twice, and null after `sent`, so the form's next request is a new one.
 */
export async function submitAttempt(
  submitter: FormSubmitter,
  kind: FormKind,
  values: unknown,
  context: AttemptContext,
  key: string | null,
): Promise<{ result: SubmitResult; nextKey: string | null }> {
  const idempotencyKey = key ?? newIdempotencyKey()
  const result = await submitter.submit(kind, values, { ...context, idempotencyKey })
  return { result, nextKey: result.kind === 'sent' ? null : idempotencyKey }
}

const subscribeNever = () => () => {}

/** false in the prerendered HTML and during hydration, true once the client has taken over. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )
}

interface SubmissionOptions {
  /** The event an event-request form asks about. */
  eventId?: string
  /** The published form version (useFormDefinition); absent for the built-in form. */
  formVersion?: number
  submitter?: FormSubmitter
  /** Puts the form's fields back to their defaults (react-hook-form's reset) once a request is stored. */
  onSent?: () => void
}

/**
 * `sent` holds the form after a stored request until the visitor edits a field: the key is
 * renewed by then, so the same values sent again would be stored again under a new reference.
 */
type SubmitPhase = 'idle' | 'sending' | 'sent'

/**
 * Submit state shared by all forms. The button stays disabled until
 * hydration: a prerendered form submitted without JS would do a native GET and
 * put names, e-mails and health answers into the URL. `ready` keeps the fields
 * disabled until then (DemoFormFields), because react-hook-form writes its default
 * values back as it hydrates and would silently drop anything typed or picked earlier.
 * After `sent` the form starts over: `onSent` empties the fields, the honeypot is cleared,
 * and the button stays disabled until `edited` runs (the form's onChange). Sample and error
 * results leave everything as typed, so an unedited retry sends the same request under the same
 * key. An edit after an error renews the key: the server may have stored the first attempt and
 * would otherwise answer its old reference for the changed values.
 */
export function useFormSubmission(kind: FormKind, { eventId, formVersion, submitter = siteSubmitter, onSent }: SubmissionOptions = {}) {
  const hydrated = useHydrated()
  const locale = useLocale()
  const [phase, setPhase] = useState<SubmitPhase>('idle')
  // The same phase for the guard in submit: a second click can arrive before React re-renders the disabled button.
  const phaseRef = useRef<SubmitPhase>('idle')
  const [result, setResult] = useState<SubmitResult | null>(null)
  // Used as the result's key so every submission remounts it and moves focus again.
  const [submissions, setSubmissions] = useState(0)
  // The honeypot stays outside react-hook-form and is read here, on submit.
  const honeypotRef = useRef<HTMLInputElement>(null)
  // One key per form instance, kept across retries and renewed after `sent` (submitAttempt) or an edit.
  const keyRef = useRef<string | null>(null)
  // Set by `edited`, cleared when an attempt starts: an edit while one is in flight also counts.
  const editedRef = useRef(false)

  const enter = (next: SubmitPhase) => {
    phaseRef.current = next
    setPhase(next)
  }

  const startOver = useEffectEvent(() => {
    if (honeypotRef.current) honeypotRef.current.value = ''
    onSent?.()
  })
  // An effect, not part of submit: react-hook-form marks the form submitted only once submit
  // returns, and a reset before that would leave it validating every keystroke of the next request.
  // Until it runs, the `sent` phase keeps a second click from sending the old values again.
  useEffect(() => {
    if (result?.kind === 'sent') startOver()
  }, [result])

  const submit = async (values: unknown): Promise<void> => {
    if (phaseRef.current !== 'idle' || !hydrated) return
    enter('sending')
    let next: SubmitPhase = 'idle'
    try {
      const context = attemptContext({ locale, eventId, formVersion, honeypot: honeypotRef.current, location: window.location })
      // Edited values are a new request: a fresh key, so a stored earlier attempt is not answered for them.
      const key = editedRef.current ? null : keyRef.current
      editedRef.current = false
      const attempt = await submitAttempt(submitter, kind, values, context, key)
      keyRef.current = editedRef.current ? null : attempt.nextKey
      next = attempt.result.kind === 'sent' ? 'sent' : 'idle'
      setResult(attempt.result)
      setSubmissions((n) => n + 1)
    } finally {
      enter(next)
    }
  }
  /** Any edit makes the form's contents a new request; the success message stays, with its reference. */
  const edited = () => {
    editedRef.current = true
    if (phaseRef.current === 'sent') enter('idle')
  }
  return {
    ready: hydrated,
    sending: phase === 'sending',
    canSubmit: hydrated && phase === 'idle',
    result,
    submissions,
    submit,
    edited,
    honeypotRef,
    reset: () => setResult(null),
  }
}

/** The health form's submission: it stays a sample in Stage B, whatever the build is configured with. */
export function useDemoSubmission(kind: FormKind) {
  return useFormSubmission(kind, { submitter: demoSubmitter })
}

