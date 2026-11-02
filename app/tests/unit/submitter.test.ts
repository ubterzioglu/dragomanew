import { afterEach, describe, expect, it, vi } from 'vitest'
import { submitEnvelopeSchema, type SubmitEnvelope } from '../../src/shared/requests/payload'
import {
  attemptContext,
  createSupabaseSubmitter,
  demoSubmitter,
  newIdempotencyKey,
  selectSubmitter,
  submitAttempt,
  type FormKind,
  type SubmitContext,
} from '../../src/features/forms/submission'

const BASE_URL = 'http://127.0.0.1:54321'
const PUBLISHABLE_KEY = 'sb_publishable_test-key'
const ENDPOINT = `${BASE_URL}/functions/v1/submit-request`
const IDEMPOTENCY_KEY = '3f6c1b52-8d4e-4a8f-9c3b-2e7d5a1f0b64'
const CONTEXT: SubmitContext = { locale: 'en', idempotencyKey: IDEMPOTENCY_KEY }
const VALUES = { fullName: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello' }

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

/** A fetch stand-in that answers with the given responses in turn (an Error is thrown, like a dropped connection). */
function fakeFetch(...answers: Array<Response | Error>) {
  const queue = [...answers]
  return vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => {
    const next = queue.shift()
    if (!next) throw new Error('fakeFetch: no answer left')
    if (next instanceof Error) throw next
    return next
  })
}

type FakeFetch = ReturnType<typeof fakeFetch>

function sentEnvelope(fetchImpl: FakeFetch, call = 0): SubmitEnvelope {
  const init = fetchImpl.mock.calls[call]?.[1]
  return submitEnvelopeSchema.parse(JSON.parse(String(init?.body)))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createSupabaseSubmitter', () => {
  it('posts the envelope to the submit-request function with the publishable key', async () => {
    const fetchImpl = fakeFetch(json(200, { ok: true, reference: 'DRG-000123' }))
    const submitter = createSupabaseSubmitter(`${BASE_URL}/`, PUBLISHABLE_KEY, fetchImpl)

    await submitter.submit('contact', VALUES, CONTEXT)

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0] ?? []
    expect(url).toBe(ENDPOINT)
    expect(init?.method).toBe('POST')
    expect(init?.credentials).toBe('omit')
    expect(new Headers(init?.headers).get('apikey')).toBe(PUBLISHABLE_KEY)
    expect(new Headers(init?.headers).get('content-type')).toBe('application/json')
    expect(sentEnvelope(fetchImpl)).toEqual({ kind: 'contact', locale: 'en', idempotencyKey: IDEMPOTENCY_KEY, values: VALUES })
  })

  it.each([
    ['event-request', 'event'],
    ['transport', 'transport'],
    ['lodging', 'lodging'],
    ['contact', 'contact'],
  ] as const)('sends the %s form as kind "%s"', async (formKind, requestKind) => {
    const fetchImpl = fakeFetch(json(200, { ok: true, reference: 'DRG-000001' }))
    await createSupabaseSubmitter(BASE_URL, PUBLISHABLE_KEY, fetchImpl).submit(formKind, VALUES, CONTEXT)
    expect(sentEnvelope(fetchImpl).kind).toBe(requestKind)
  })

  it('passes the event, the page and the honeypot along, and leaves out the empty ones', async () => {
    const fetchImpl = fakeFetch(json(200, { ok: true, reference: 'DRG-000002' }), json(200, { ok: true, reference: 'DRG-000003' }))
    const submitter = createSupabaseSubmitter(BASE_URL, PUBLISHABLE_KEY, fetchImpl)

    await submitter.submit('event-request', VALUES, { ...CONTEXT, eventId: 'klasik-dalis', pagePath: '/en/diving/klasik/', website: 'spam.example' })
    await submitter.submit('contact', VALUES, { ...CONTEXT, eventId: '', pagePath: '', website: '' })

    expect(sentEnvelope(fetchImpl, 0)).toMatchObject({ eventId: 'klasik-dalis', pagePath: '/en/diving/klasik/', website: 'spam.example' })
    const second = sentEnvelope(fetchImpl, 1)
    expect(second).not.toHaveProperty('eventId')
    expect(second).not.toHaveProperty('pagePath')
    expect(second).not.toHaveProperty('website')
  })

  it('cuts an overlong page path to what the function accepts', async () => {
    const fetchImpl = fakeFetch(json(200, { ok: true, reference: 'DRG-000004' }))
    await createSupabaseSubmitter(BASE_URL, PUBLISHABLE_KEY, fetchImpl).submit('contact', VALUES, { ...CONTEXT, pagePath: `/${'a'.repeat(400)}` })
    expect(sentEnvelope(fetchImpl).pagePath).toHaveLength(300)
  })

  it('returns the reference of a stored request', async () => {
    const fetchImpl = fakeFetch(json(200, { ok: true, reference: 'DRG-000123' }))
    const result = await createSupabaseSubmitter(BASE_URL, PUBLISHABLE_KEY, fetchImpl).submit('lodging', VALUES, CONTEXT)
    expect(result).toEqual({ kind: 'sent', reference: 'DRG-000123' })
  })

  it.each([
    [400, 'invalid', 'invalid'],
    [429, 'rate_limited', 'rate_limited'],
    [409, 'event_closed', 'event_closed'],
    [404, 'unknown_event', 'event_closed'],
    [500, 'server', 'unavailable'],
  ] as const)('maps HTTP %i with error "%s" to the reason "%s"', async (status, error, reason) => {
    const fetchImpl = fakeFetch(json(status, { ok: false, error, fields: ['values.email'] }))
    const result = await createSupabaseSubmitter(BASE_URL, PUBLISHABLE_KEY, fetchImpl).submit('event-request', VALUES, CONTEXT)
    expect(result).toEqual({ kind: 'error', reason })
  })

  it.each([
    [429, 'rate_limited'],
    [413, 'invalid'],
    // The gateway's own 404 (function not deployed) must not tell visitors the event is closed.
    [404, 'unavailable'],
    [401, 'unavailable'],
    [502, 'unavailable'],
    [503, 'unavailable'],
  ] as const)('falls back on the status when HTTP %i carries no error code of the function: "%s"', async (status, reason) => {
    const fetchImpl = fakeFetch(new Response('<html>Bad gateway</html>', { status, headers: { 'content-type': 'text/html' } }))
    const result = await createSupabaseSubmitter(BASE_URL, PUBLISHABLE_KEY, fetchImpl).submit('contact', VALUES, CONTEXT)
    expect(result).toEqual({ kind: 'error', reason })
  })

  it.each([
    ['no reference', { ok: true }],
    ['an empty reference', { ok: true, reference: '' }],
    ['a reference that is not text', { ok: true, reference: 123 }],
    ['an unknown error code', { ok: false, error: 'teapot' }],
    ['no JSON object at all', ['DRG-000123']],
  ])('treats a 200 answer with %s as unavailable', async (_label, body) => {
    const fetchImpl = fakeFetch(json(200, body))
    const result = await createSupabaseSubmitter(BASE_URL, PUBLISHABLE_KEY, fetchImpl).submit('contact', VALUES, CONTEXT)
    expect(result).toEqual({ kind: 'error', reason: 'unavailable' })
  })

  it('reports a dropped connection or timeout as a network error', async () => {
    const fetchImpl = fakeFetch(new TypeError('Failed to fetch'), new DOMException('The operation timed out.', 'TimeoutError'))
    const submitter = createSupabaseSubmitter(BASE_URL, PUBLISHABLE_KEY, fetchImpl)
    expect(await submitter.submit('contact', VALUES, CONTEXT)).toEqual({ kind: 'error', reason: 'network' })
    expect(await submitter.submit('contact', VALUES, CONTEXT)).toEqual({ kind: 'error', reason: 'network' })
  })

  it('keeps the health form a sample: nothing is sent', async () => {
    const fetchImpl = fakeFetch()
    const result = await createSupabaseSubmitter(BASE_URL, PUBLISHABLE_KEY, fetchImpl).submit('health', { answers: {} }, CONTEXT)
    expect(result).toEqual({ kind: 'demo' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('refuses values that are not a plain object without calling the function', async () => {
    const fetchImpl = fakeFetch()
    const result = await createSupabaseSubmitter(BASE_URL, PUBLISHABLE_KEY, fetchImpl).submit('contact', ['not', 'a', 'record'], CONTEXT)
    expect(result).toEqual({ kind: 'error', reason: 'invalid' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})

describe('selectSubmitter', () => {
  it.each([
    ['no URL', undefined, PUBLISHABLE_KEY],
    ['no key', BASE_URL, undefined],
    ['a blank URL', '  ', PUBLISHABLE_KEY],
    ['a blank key', BASE_URL, ' '],
  ])('stays on the sample submitter with %s', (_label, url, key) => {
    expect(selectSubmitter(url, key)).toBe(demoSubmitter)
  })

  it('uses the function once both the URL and the publishable key are set', async () => {
    const fetchImpl = fakeFetch(json(200, { ok: true, reference: 'DRG-000005' }))
    const submitter = selectSubmitter(` ${BASE_URL} `, ` ${PUBLISHABLE_KEY} `, fetchImpl)
    expect(submitter).not.toBe(demoSubmitter)
    expect(await submitter.submit('contact', VALUES, CONTEXT)).toEqual({ kind: 'sent', reference: 'DRG-000005' })
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(ENDPOINT)
    expect(new Headers(fetchImpl.mock.calls[0]?.[1]?.headers).get('apikey')).toBe(PUBLISHABLE_KEY)
  })

  it('answers every form with the sample result', async () => {
    for (const kind of ['event-request', 'transport', 'lodging', 'contact', 'health'] satisfies FormKind[]) {
      expect(await demoSubmitter.submit(kind, VALUES, CONTEXT)).toEqual({ kind: 'demo' })
    }
  })
})

describe('attemptContext (what useFormSubmission reads on submit)', () => {
  const PAGE = { pathname: '/en/diving/klasik/' }

  it('passes the locale, the event, the page and the honeypot’s value', () => {
    expect(attemptContext({ locale: 'de', eventId: 'klasik-dalis', honeypot: { value: 'spam.example' }, location: PAGE })).toEqual({
      locale: 'de',
      eventId: 'klasik-dalis',
      website: 'spam.example',
      pagePath: '/en/diving/klasik/',
    })
  })

  it('leaves out the honeypot a person never fills, and one not mounted yet', () => {
    expect(attemptContext({ locale: 'tr', honeypot: { value: '' }, location: PAGE })).not.toHaveProperty('website')
    expect(attemptContext({ locale: 'tr', honeypot: null, location: PAGE })).not.toHaveProperty('website')
  })

  it('leaves out the event on forms that ask about none', () => {
    expect(attemptContext({ locale: 'fr', honeypot: null, location: PAGE })).toEqual({ locale: 'fr', pagePath: PAGE.pathname })
    expect(attemptContext({ locale: 'fr', eventId: '', honeypot: null, location: PAGE })).not.toHaveProperty('eventId')
  })

  it('builds an envelope the function accepts', async () => {
    const fetchImpl = fakeFetch(json(200, { ok: true, reference: 'DRG-000006' }))
    const context = attemptContext({ locale: 'en', eventId: 'klasik-dalis', honeypot: { value: '' }, location: PAGE })
    await createSupabaseSubmitter(BASE_URL, PUBLISHABLE_KEY, fetchImpl).submit('event-request', VALUES, { ...context, idempotencyKey: IDEMPOTENCY_KEY })
    expect(sentEnvelope(fetchImpl)).toEqual({
      kind: 'event',
      locale: 'en',
      idempotencyKey: IDEMPOTENCY_KEY,
      eventId: 'klasik-dalis',
      pagePath: PAGE.pathname,
      values: VALUES,
    })
  })
})

describe('idempotency key', () => {
  const ATTEMPT = { locale: 'tr' } as const

  it('keeps one key across retries and renews it once the request is stored', async () => {
    const fetchImpl = fakeFetch(
      new TypeError('Failed to fetch'),
      json(503, { ok: false, error: 'server' }),
      json(200, { ok: true, reference: 'DRG-000010' }),
      json(200, { ok: true, reference: 'DRG-000011' }),
    )
    const submitter = createSupabaseSubmitter(BASE_URL, PUBLISHABLE_KEY, fetchImpl)

    const first = await submitAttempt(submitter, 'transport', VALUES, ATTEMPT, null)
    expect(first.result).toEqual({ kind: 'error', reason: 'network' })
    const key = sentEnvelope(fetchImpl, 0).idempotencyKey
    expect(first.nextKey).toBe(key)

    const second = await submitAttempt(submitter, 'transport', VALUES, ATTEMPT, first.nextKey)
    expect(second.result).toEqual({ kind: 'error', reason: 'unavailable' })
    expect(sentEnvelope(fetchImpl, 1).idempotencyKey).toBe(key)

    const third = await submitAttempt(submitter, 'transport', VALUES, ATTEMPT, second.nextKey)
    expect(third.result).toEqual({ kind: 'sent', reference: 'DRG-000010' })
    expect(sentEnvelope(fetchImpl, 2).idempotencyKey).toBe(key)
    expect(third.nextKey).toBeNull()

    // The next request from the same form is a new one.
    await submitAttempt(submitter, 'transport', VALUES, ATTEMPT, third.nextKey)
    expect(sentEnvelope(fetchImpl, 3).idempotencyKey).not.toBe(key)
  })

  it('keeps the key after a sample result too, so nothing changes for Stage A builds', async () => {
    const attempt = await submitAttempt(demoSubmitter, 'contact', VALUES, ATTEMPT, IDEMPOTENCY_KEY)
    expect(attempt).toEqual({ result: { kind: 'demo' }, nextKey: IDEMPOTENCY_KEY })
  })

  it('makes UUIDs the function accepts, also where crypto.randomUUID is missing', () => {
    const uuid = (value: string) => submitEnvelopeSchema.shape.idempotencyKey.safeParse(value).success
    expect(uuid(newIdempotencyKey())).toBe(true)
    expect(newIdempotencyKey()).not.toBe(newIdempotencyKey())

    // Plain-HTTP pages are not a secure context, so browsers leave randomUUID out there.
    const { getRandomValues } = globalThis.crypto
    vi.stubGlobal('crypto', { getRandomValues: getRandomValues.bind(globalThis.crypto) })
    const fallback = newIdempotencyKey()
    expect(uuid(fallback)).toBe(true)
    expect(fallback).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })
})
