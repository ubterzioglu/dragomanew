import { createHmac, randomUUID } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import type { RequestKind, SiteLocale, SubmitResponse } from '../../src/shared/requests/payload'
import { handleSubmit } from '../../../supabase/functions/submit-request/handler.ts'
import { createIpHasher } from '../../../supabase/functions/submit-request/ipHash.ts'
import { mailerFromEnv } from '../../../supabase/functions/submit-request/mailer.ts'
import type {
  DeliveryResult,
  Deps,
  EventRecord,
  MailMessage,
  Mailer,
  NewNotification,
  NewRequest,
  RateLimit,
  RequestStore,
  SubmitConfig,
} from '../../../supabase/functions/submit-request/types.ts'

const ORIGIN = 'https://notyetbro.club'
const KEY = 'sb_publishable_test'
const NOW = new Date('2026-11-01T10:00:00Z')
const BUSINESS = 'info@dragoman.example'
const PANEL = 'https://notyetbro.club/panel/'

const EVENTS: Readonly<Record<string, EventRecord>> = {
  'discover-dive': {
    id: 'discover-dive',
    category: 'diving',
    title: { tr: 'Keşif dalışı', en: 'Discover dive', fr: 'Baptême de plongée', de: 'Schnuppertauchen' },
    priceDisplay: 'numeric',
    status: 'published',
    options: [
      { id: 'shore', name: { tr: 'Kıyıdan', en: 'From the shore' }, price: 60, currency: 'EUR', basis: 'person' },
      { id: 'boat', name: { tr: 'Tekneden', en: 'From the boat' }, price: 45, currency: 'EUR', basis: 'person' },
      { id: 'night', name: { tr: 'Gece', en: 'Night' }, price: 80, currency: 'EUR', basis: 'person' },
    ],
  },
  kayak: {
    id: 'kayak',
    category: 'seaKayak',
    title: { tr: 'Kano turu', en: 'Kayak tour' },
    priceDisplay: 'numeric',
    status: 'published',
    options: [{ id: 'day', name: { tr: 'Günlük' }, price: 35, currency: 'EUR', basis: 'person' }],
  },
  'old-tour': { id: 'old-tour', category: 'outdoor', title: { tr: 'Eski' }, priceDisplay: 'on_request', status: 'archived', options: [] },
  'draft-tour': { id: 'draft-tour', category: 'outdoor', title: { tr: 'Taslak' }, priceDisplay: 'on_request', status: 'draft', options: [] },
}

type StoredNotification = NewNotification & { id: number; result?: DeliveryResult }

/** In-memory store that behaves like the database: unique idempotency key, sequential reference. */
function fakeStore(overrides: Partial<RequestStore> = {}) {
  const requests: Array<NewRequest & { id: string; reference: string }> = []
  const throttle: Array<{ ipHash: string; limit: RateLimit }> = []
  const notifications: StoredNotification[] = []
  const store: RequestStore = {
    // Like public.throttle_submission: count and insert in one step, nothing recorded once full.
    throttleSubmission: async (ipHash, limit) => {
      if (throttle.filter((t) => t.ipHash === ipHash).length >= limit.max) return false
      throttle.push({ ipHash, limit })
      return true
    },
    findEvent: async (id) => EVENTS[id] ?? null,
    saveRequest: async (row) => {
      const existing = requests.find((r) => r.idempotencyKey === row.idempotencyKey)
      if (existing) return { id: existing.id, reference: existing.reference, created: false }
      const saved = { ...row, id: `req-${requests.length + 1}`, reference: `DRG-${String(123 + requests.length).padStart(6, '0')}` }
      requests.push(saved)
      return { id: saved.id, reference: saved.reference, created: true }
    },
    queueNotifications: async (rows) =>
      rows.map((row) => {
        const id = notifications.length + 1
        notifications.push({ ...row, id })
        return id
      }),
    markNotification: async (id, result) => {
      const index = notifications.findIndex((n) => n.id === id)
      const current = notifications[index]
      if (current) notifications[index] = { ...current, result }
    },
    hasNotifications: async (requestId) => notifications.some((n) => n.requestId === requestId),
    ...overrides,
  }
  return { store, requests, throttle, notifications }
}

function fakeMailer(send?: Mailer['send']) {
  const sent: MailMessage[] = []
  const mailer: Mailer = {
    send: vi.fn(
      send ??
        (async (message: MailMessage) => {
          sent.push(message)
        }),
    ),
  }
  return { mailer, sent }
}

const CONFIG: SubmitConfig = {
  allowedOrigins: [ORIGIN, 'http://localhost:5173'],
  publishableKeys: [KEY],
  businessEmail: BUSINESS,
  panelUrl: PANEL,
  rateLimit: { max: 5, windowSeconds: 600 },
  mailTimeoutMs: 50,
}

function setup(options: { store?: Partial<RequestStore>; send?: Mailer['send']; config?: Partial<SubmitConfig> } = {}) {
  const db = fakeStore(options.store)
  const mail = fakeMailer(options.send)
  const reportError = vi.fn()
  const deps: Deps = {
    store: db.store,
    mailer: mail.mailer,
    clock: () => NOW,
    config: { ...CONFIG, ...options.config },
    hashIp: async (ip) => `hash:${ip}`,
    reportError,
  }
  return { ...db, ...mail, deps, reportError }
}

interface PostInit {
  origin?: string | null
  key?: string | null
  /** The address the edge proxy appended: the right-most X-Forwarded-For entry; null sends none. */
  ip?: string | null
  /** Whatever the caller itself put in X-Forwarded-For before the proxy appended `ip`. */
  forgedPrefix?: string
  raw?: string
  method?: string
  headers?: Record<string, string>
}

function post(body: unknown, init: PostInit = {}): Request {
  const headers = new Headers({ 'content-type': 'application/json', ...init.headers })
  if (init.origin !== null) headers.set('origin', init.origin ?? ORIGIN)
  if (init.key !== null) headers.set('apikey', init.key ?? KEY)
  const ip = init.ip === undefined ? '203.0.113.7' : init.ip
  if (ip !== null) headers.set('x-forwarded-for', init.forgedPrefix ? `${init.forgedPrefix}, ${ip}` : ip)
  const method = init.method ?? 'POST'
  const hasBody = method !== 'GET' && method !== 'OPTIONS'
  return new Request('http://localhost/functions/v1/submit-request', {
    method,
    headers,
    body: hasBody ? (init.raw ?? JSON.stringify(body)) : undefined,
  })
}

const person = { fullName: 'Ayşe Yılmaz', email: 'ayse@example.com', phone: '+90 555 000 00 00' }

const VALUES: Readonly<Record<RequestKind, Record<string, unknown>>> = {
  event: { ...person, preferredDate: '2026-11-20', partySize: 4, message: 'İlk dalışımız', distribution: { shore: 2, boat: 2, night: 0 } },
  transport: {
    ...person,
    tripType: 'roundTrip',
    from: 'Dalaman',
    to: 'Kaş',
    dateTime: '2026-11-20T10:00',
    returnDateTime: '2026-11-27T10:00',
    partySize: 3,
    childSeat: true,
    childSeatAges: [4],
    note: '',
  },
  lodging: { ...person, checkIn: '2026-11-20', checkOut: '2026-11-25', adults: 2, children: 1, childAges: [6], rooms: 1, preferences: 'Deniz manzarası' },
  contact: { ...person, subject: 'Soru', message: 'Merhaba, bir sorum var.' },
}

function envelope(kind: RequestKind, extra: Record<string, unknown> = {}) {
  return {
    kind,
    locale: 'tr' as SiteLocale,
    idempotencyKey: randomUUID(),
    values: VALUES[kind],
    ...(kind === 'event' ? { eventId: 'discover-dive' } : {}),
    ...extra,
  }
}

const body = async (response: Response): Promise<SubmitResponse> => (await response.json()) as SubmitResponse

describe('handleSubmit: CORS, method, key and body', () => {
  it('answers a preflight from an allowed origin', async () => {
    const { deps } = setup()
    const response = await handleSubmit(post(null, { method: 'OPTIONS', key: null }), deps)
    expect(response.status).toBe(204)
    expect(response.headers.get('access-control-allow-origin')).toBe(ORIGIN)
    expect(response.headers.get('access-control-allow-headers')).toMatch(/apikey/)
    expect(response.headers.get('access-control-allow-headers')).toMatch(/content-type/)
    expect(response.headers.get('access-control-allow-methods')).toMatch(/POST/)
    expect(response.headers.get('vary')).toMatch(/Origin/)
  })

  it('refuses a preflight and a post from any other origin, storing nothing', async () => {
    const { deps, throttle, requests } = setup()
    const preflight = await handleSubmit(post(null, { method: 'OPTIONS', origin: 'https://evil.example' }), deps)
    expect(preflight.status).toBe(403)
    expect(preflight.headers.get('access-control-allow-origin')).toBeNull()

    const submit = await handleSubmit(post(envelope('contact'), { origin: 'https://evil.example' }), deps)
    expect(submit.status).toBe(403)
    const missing = await handleSubmit(post(envelope('contact'), { origin: null }), deps)
    expect(missing.status).toBe(403)
    expect(throttle).toHaveLength(0)
    expect(requests).toHaveLength(0)
  })

  it('accepts POST only', async () => {
    const { deps } = setup()
    const response = await handleSubmit(post(null, { method: 'GET' }), deps)
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST, OPTIONS')
    expect(response.headers.get('access-control-allow-origin')).toBe(ORIGIN)
  })

  it('needs a publishable key on apikey or as a bearer token', async () => {
    const { deps } = setup()
    expect((await handleSubmit(post(envelope('contact'), { key: null }), deps)).status).toBe(401)
    expect((await handleSubmit(post(envelope('contact'), { key: 'sb_publishable_other' }), deps)).status).toBe(401)
    const bearer = post(envelope('contact'), { key: null, headers: { authorization: `Bearer ${KEY}` } })
    expect((await handleSubmit(bearer, deps)).status).toBe(200)
  })

  it('refuses bodies over 32 KB, by header and by actual size', async () => {
    const { deps, requests } = setup()
    const declared = await handleSubmit(post(envelope('contact'), { headers: { 'content-length': String(40 * 1024) } }), deps)
    expect(declared.status).toBe(413)
    const big = { ...envelope('contact'), pagePath: 'x'.repeat(33 * 1024) }
    const actual = await handleSubmit(post(big), deps)
    expect(actual.status).toBe(413)
    expect(await body(actual)).toEqual({ ok: false, error: 'invalid' })
    expect(requests).toHaveLength(0)
  })

  it('answers bad JSON with 400 invalid', async () => {
    const { deps } = setup()
    const response = await handleSubmit(post(null, { raw: '{"kind":' }), deps)
    expect(response.status).toBe(400)
    expect(await body(response)).toEqual({ ok: false, error: 'invalid' })
  })
})

describe('handleSubmit: bots and rate limit', () => {
  it('pretends success when the honeypot is filled, and stores nothing', async () => {
    const { deps, throttle, requests, notifications, mailer } = setup()
    const response = await handleSubmit(post(envelope('contact', { website: 'https://spam.example' })), deps)
    expect(response.status).toBe(200)
    const result = await body(response)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.reference).toMatch(/^DRG-\d{6}$/)
    expect(throttle).toHaveLength(0)
    expect(requests).toHaveLength(0)
    expect(notifications).toHaveLength(0)
    expect(mailer.send).not.toHaveBeenCalled()
  })

  it('allows five submissions per IP hash in ten minutes, then answers 429', async () => {
    const { deps, requests, throttle } = setup()
    for (let i = 0; i < 5; i += 1) {
      expect((await handleSubmit(post(envelope('contact')), deps)).status).toBe(200)
    }
    const sixth = await handleSubmit(post(envelope('contact')), deps)
    expect(sixth.status).toBe(429)
    expect(await body(sixth)).toEqual({ ok: false, error: 'rate_limited' })
    expect(requests).toHaveLength(5)
    expect(throttle.every((t) => t.ipHash === 'hash:203.0.113.7')).toBe(true)

    // Another address is counted on its own.
    expect((await handleSubmit(post(envelope('contact'), { ip: '198.51.100.9' }), deps)).status).toBe(200)
  })

  it('ignores a forged leading X-Forwarded-For entry, so rotating it does not reset the limit', async () => {
    const { deps, requests } = setup()
    for (let i = 0; i < 5; i += 1) {
      const response = await handleSubmit(post(envelope('contact'), { forgedPrefix: `198.18.0.${i}` }), deps)
      expect(response.status).toBe(200)
    }
    const sixth = await handleSubmit(post(envelope('contact'), { forgedPrefix: '198.18.0.99' }), deps)
    expect(sixth.status).toBe(429)
    expect(requests).toHaveLength(5)
  })

  it('prefers cf-connecting-ip, which the edge sets and the caller cannot', async () => {
    const { deps, throttle } = setup()
    await handleSubmit(post(envelope('contact'), { forgedPrefix: '198.18.0.1', headers: { 'cf-connecting-ip': '192.0.2.44' } }), deps)
    expect(throttle.map((t) => t.ipHash)).toEqual(['hash:192.0.2.44'])
  })

  it('puts requests without any address into one shared bucket, which is throttled too', async () => {
    const { deps, requests, throttle } = setup()
    for (let i = 0; i < 5; i += 1) {
      expect((await handleSubmit(post(envelope('contact'), { ip: null }), deps)).status).toBe(200)
    }
    expect((await handleSubmit(post(envelope('contact'), { ip: null }), deps)).status).toBe(429)
    expect(requests).toHaveLength(5)
    expect(new Set(throttle.map((t) => t.ipHash))).toEqual(new Set(['hash:unknown']))
  })

  it('ignores X-Real-IP, which nothing guarantees a proxy overwrote', async () => {
    const { deps, throttle } = setup()
    await handleSubmit(post(envelope('contact'), { ip: null, headers: { 'x-real-ip': '198.18.0.7' } }), deps)
    expect(throttle.map((t) => t.ipHash)).toEqual(['hash:unknown'])
  })

  it('makes one atomic throttle call per request with the contract limit (5 per 600 s)', async () => {
    const throttleSubmission = vi.fn(async () => true)
    const { deps } = setup({ store: { throttleSubmission } })
    await handleSubmit(post(envelope('contact')), deps)
    expect(throttleSubmission).toHaveBeenCalledTimes(1)
    expect(throttleSubmission).toHaveBeenCalledWith('hash:203.0.113.7', { max: 5, windowSeconds: 600 })
  })

  it('answers 429 and stores nothing when the throttle says no', async () => {
    const { deps, requests, mailer } = setup({ store: { throttleSubmission: async () => false } })
    const response = await handleSubmit(post(envelope('contact')), deps)
    expect(response.status).toBe(429)
    expect(await body(response)).toEqual({ ok: false, error: 'rate_limited' })
    expect(requests).toHaveLength(0)
    expect(mailer.send).not.toHaveBeenCalled()
  })

  it('answers 500, not a pass, when the throttle call fails', async () => {
    const { deps, requests, reportError } = setup({ store: { throttleSubmission: async () => Promise.reject(new Error('rpc down')) } })
    const response = await handleSubmit(post(envelope('contact')), deps)
    expect(response.status).toBe(500)
    expect(requests).toHaveLength(0)
    expect(reportError).toHaveBeenCalled()
  })

  it('holds the limit for a parallel burst from one address', async () => {
    const { deps, requests } = setup()
    const responses = await Promise.all(Array.from({ length: 10 }, () => handleSubmit(post(envelope('contact')), deps)))
    expect(requests.length).toBeLessThanOrEqual(5)
    expect(responses.filter((r) => r.status === 429).length).toBeGreaterThanOrEqual(5)
  })

  it('hashes the IP with HMAC-SHA256 and the salt', async () => {
    const pepper = 'pepper-'.repeat(5)
    const hash = createIpHasher(pepper)
    const expected = createHmac('sha256', pepper).update('203.0.113.7').digest('hex')
    expect(await hash('203.0.113.7')).toBe(expected)
    expect(await createIpHasher('other-'.repeat(6))('203.0.113.7')).not.toBe(expected)
  })
})

describe('handleSubmit: validation', () => {
  it('answers 400 with the envelope field paths', async () => {
    const { deps, requests } = setup()
    const response = await handleSubmit(post({ ...envelope('contact'), idempotencyKey: 'nope', locale: 'it' }), deps)
    expect(response.status).toBe(400)
    const result = await body(response)
    expect(result).toEqual({ ok: false, error: 'invalid', fields: expect.arrayContaining(['idempotencyKey', 'locale']) })
    expect(requests).toHaveLength(0)
  })

  it('answers 400 with the value field paths, prefixed with values.', async () => {
    const { deps } = setup()
    const values = { ...VALUES.lodging, email: 'not-an-email', adults: 0, checkOut: '2026-11-19' }
    const response = await handleSubmit(post(envelope('lodging', { values })), deps)
    expect(response.status).toBe(400)
    const result = await body(response)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fields).toEqual(expect.arrayContaining(['values.email', 'values.adults', 'values.checkOut']))
  })

  it('caps the length of every text field', async () => {
    const { deps, requests } = setup()
    const cases: ReadonlyArray<readonly [RequestKind, string, number]> = [
      ['contact', 'fullName', 121],
      ['contact', 'email', 255],
      ['contact', 'phone', 41],
      ['contact', 'message', 2001],
      ['contact', 'subject', 201],
      ['transport', 'from', 201],
      ['transport', 'note', 2001],
      ['lodging', 'preferences', 2001],
      ['event', 'preferredDate', 201],
    ]
    for (const [index, [kind, field, length]] of cases.entries()) {
      const value = field === 'email' ? `${'a'.repeat(length - 12)}@example.com` : 'x'.repeat(length)
      // One address per case, so the rate limit does not answer before validation does.
      const request = post(envelope(kind, { values: { ...VALUES[kind], [field]: value } }), { ip: `198.51.100.${index}` })
      const response = await handleSubmit(request, deps)
      expect(response.status, `${kind}.${field}`).toBe(400)
      const result = await body(response)
      if (!result.ok) expect(result.fields).toContain(`values.${field}`)
    }
    expect(requests).toHaveLength(0)
  })

  it('caps the number of child seat ages', async () => {
    const { deps } = setup()
    const values = { ...VALUES.transport, partySize: 30, childSeatAges: Array.from({ length: 21 }, () => 5) }
    const response = await handleSubmit(post(envelope('transport', { values })), deps)
    expect(response.status).toBe(400)
  })

  it('needs an event id for an event request', async () => {
    const { deps } = setup()
    const response = await handleSubmit(post(envelope('event', { eventId: undefined })), deps)
    expect(response.status).toBe(400)
    expect(await body(response)).toEqual({ ok: false, error: 'invalid', fields: ['eventId'] })
  })

  it('answers 404 for an unknown event and 409 for an archived or unpublished one', async () => {
    const { deps, requests } = setup()
    const unknown = await handleSubmit(post(envelope('event', { eventId: 'nope' })), deps)
    expect(unknown.status).toBe(404)
    expect(await body(unknown)).toEqual({ ok: false, error: 'unknown_event' })

    for (const eventId of ['old-tour', 'draft-tour']) {
      const closed = await handleSubmit(post(envelope('event', { eventId, values: { ...VALUES.event, distribution: undefined } })), deps)
      expect(closed.status).toBe(409)
      expect(await body(closed)).toEqual({ ok: false, error: 'event_closed' })
    }
    expect(requests).toHaveLength(0)
  })

  it('checks the distribution against the database options', async () => {
    const { deps } = setup()
    const unknownOption = { ...VALUES.event, distribution: { shore: 2, boat: 1, wreck: 1 } }
    const wrongSum = { ...VALUES.event, distribution: { shore: 1, boat: 1, night: 0 } }
    const missing = { ...VALUES.event, distribution: undefined }
    for (const values of [unknownOption, wrongSum, missing]) {
      const response = await handleSubmit(post(envelope('event', { values })), deps)
      expect(response.status).toBe(400)
      expect(await body(response)).toEqual({ ok: false, error: 'invalid', fields: ['values.distribution'] })
    }
  })
})

describe('handleSubmit: storing', () => {
  it('recomputes the price on the server and keeps an event snapshot in the request locale', async () => {
    const { deps, requests } = setup()
    const values = { ...VALUES.event, priceSummary: { kind: 'total', total: 1 }, total: 1 }
    const response = await handleSubmit(post(envelope('event', { locale: 'en', values })), deps)
    expect(response.status).toBe(200)
    expect(await body(response)).toEqual({ ok: true, reference: 'DRG-000123' })

    const saved = requests[0]
    expect(saved?.priceSummary).toEqual({
      kind: 'total',
      currency: 'EUR',
      total: 210,
      lines: [
        { optionId: 'shore', quantity: 2, unitPrice: 60, subtotal: 120 },
        { optionId: 'boat', quantity: 2, unitPrice: 45, subtotal: 90 },
      ],
    })
    expect(saved?.eventSnapshot).toEqual({
      id: 'discover-dive',
      category: 'diving',
      title: 'Discover dive',
      priceDisplay: 'numeric',
      options: [
        { id: 'shore', name: 'From the shore', price: 60, currency: 'EUR', basis: 'person', quantity: 2 },
        { id: 'boat', name: 'From the boat', price: 45, currency: 'EUR', basis: 'person', quantity: 2 },
      ],
    })
    expect(saved).toMatchObject({ kind: 'event', locale: 'en', eventId: 'discover-dive', fullName: 'Ayşe Yılmaz', email: 'ayse@example.com' })
    // Fields outside the schema, such as a forged price, are not kept.
    expect(saved?.payload).not.toHaveProperty('priceSummary')
    expect(saved?.payload).not.toHaveProperty('total')
  })

  it('puts the whole party on the only option of a single-option event', async () => {
    const { deps, requests } = setup()
    const values = { ...VALUES.event, partySize: 3, distribution: undefined }
    expect((await handleSubmit(post(envelope('event', { eventId: 'kayak', values })), deps)).status).toBe(200)
    expect(requests[0]?.priceSummary).toMatchObject({ kind: 'total', total: 105 })
    expect(requests[0]?.eventSnapshot?.title).toBe('Kano turu')
  })

  it('stores the other kinds without event data', async () => {
    const { deps, requests } = setup()
    for (const kind of ['transport', 'lodging', 'contact'] as const) {
      expect((await handleSubmit(post(envelope(kind, { eventId: 'discover-dive' })), deps)).status).toBe(200)
    }
    expect(requests.map((r) => r.kind)).toEqual(['transport', 'lodging', 'contact'])
    for (const saved of requests) {
      expect(saved).toMatchObject({ eventId: null, eventSnapshot: null, priceSummary: null, phone: '+90 555 000 00 00' })
    }
  })

  it('stores a blank phone as null', async () => {
    const { deps, requests } = setup()
    await handleSubmit(post(envelope('contact', { values: { ...VALUES.contact, phone: '  ' } })), deps)
    expect(requests[0]?.phone).toBeNull()
  })

  it('returns the same reference for a replayed idempotency key, and mails only once', async () => {
    const { deps, requests, notifications, mailer } = setup()
    const first = envelope('contact')
    const a = await body(await handleSubmit(post(first), deps))
    const b = await body(await handleSubmit(post(first), deps))
    expect(a).toEqual(b)
    expect(requests).toHaveLength(1)
    expect(notifications).toHaveLength(2)
    expect(mailer.send).toHaveBeenCalledTimes(2)
  })

  it('heals a replay whose first attempt lost the outbox write: queues both rows and sends', async () => {
    const { deps, requests, notifications, mailer } = setup()
    const first = envelope('contact')
    // First attempt: the request is stored, then the outbox write dies.
    const broken: Deps = { ...deps, store: { ...deps.store, queueNotifications: async () => Promise.reject(new Error('outbox down')) } }
    const a = await body(await handleSubmit(post(first), broken))
    expect(requests).toHaveLength(1)
    expect(notifications).toHaveLength(0)
    expect(mailer.send).not.toHaveBeenCalled()

    // The site retries with the same key: same reference, and this time staff hear about it.
    const b = await body(await handleSubmit(post(first), deps))
    expect(b).toEqual(a)
    expect(requests).toHaveLength(1)
    expect(notifications.map((n) => n.kind)).toEqual(['customer_receipt', 'business_new_request'])
    expect(notifications.every((n) => n.result?.status === 'sent')).toBe(true)
    expect(mailer.send).toHaveBeenCalledTimes(2)
  })

  it('still answers a replay with 200 and sends nothing when the outbox cannot be checked', async () => {
    const { deps, mailer, reportError } = setup()
    const first = envelope('contact')
    const a = await body(await handleSubmit(post(first), deps))
    const unreadable: Deps = { ...deps, store: { ...deps.store, hasNotifications: async () => Promise.reject(new Error('count failed')) } }
    const b = await body(await handleSubmit(post(first), unreadable))
    expect(b).toEqual(a)
    expect(mailer.send).toHaveBeenCalledTimes(2)
    expect(reportError).toHaveBeenCalled()
  })

  it('answers 500 when the database fails', async () => {
    const failure = new Error('db down')
    const { deps, reportError } = setup({ store: { saveRequest: async () => Promise.reject(failure) } })
    const response = await handleSubmit(post(envelope('contact')), deps)
    expect(response.status).toBe(500)
    expect(await body(response)).toEqual({ ok: false, error: 'server' })
    expect(reportError).toHaveBeenCalledWith(expect.any(String), failure)
  })
})

describe('handleSubmit: e-mail', () => {
  it('writes both mails to the outbox and records them as sent', async () => {
    const { deps, notifications, sent } = setup()
    await handleSubmit(post(envelope('event', { locale: 'fr' })), deps)
    expect(notifications.map(({ kind, recipient, locale, requestId }) => ({ kind, recipient, locale, requestId }))).toEqual([
      { kind: 'customer_receipt', recipient: 'ayse@example.com', locale: 'fr', requestId: 'req-1' },
      { kind: 'business_new_request', recipient: BUSINESS, locale: 'tr', requestId: 'req-1' },
    ])
    expect(notifications.every((n) => n.result?.status === 'sent')).toBe(true)

    const customer = sent.find((m) => m.to === 'ayse@example.com')
    expect(customer?.subject).toBe('Nous avons bien reçu votre demande — DRG-000123')
    expect(customer?.text).toMatch(/pas une réservation confirmée/)
    expect(customer?.text).toMatch(/Total estimé/)
    expect(customer?.text).toMatch(/210/)
    expect(customer?.html).toMatch(/Baptême de plongée/)
    // Chosen options with their counts, from the snapshot (no French name: Turkish fallback).
    expect(customer?.text).toContain('2 × Kıyıdan, 2 × Tekneden')
    expect(customer?.text).toContain('2026-11-20')
    expect(customer?.text).not.toContain('Ayşe')

    const business = sent.find((m) => m.to === BUSINESS)
    expect(business?.subject).toMatch(/^Yeni talep — DRG-000123/)
    expect(business?.text).toMatch(/Etkinlik talebi/)
    expect(business?.text).toContain(PANEL)
    expect(business?.text).toContain('ayse@example.com')
    expect(business?.html).toContain(`href="${PANEL}"`)
  })

  it.each([
    ['tr', 'Talebiniz alındı — DRG-000123', /kesin rezervasyon değildir/],
    ['en', 'We have received your request — DRG-000123', /not a confirmed booking/],
    ['fr', 'Nous avons bien reçu votre demande — DRG-000123', /pas une réservation confirmée/],
    ['de', 'Wir haben Ihre Anfrage erhalten — DRG-000123', /keine bestätigte Buchung/],
  ] as const)('sends the customer receipt in the request locale (%s)', async (locale, subject, notice) => {
    const { deps, sent } = setup()
    await handleSubmit(post(envelope('transport', { locale })), deps)
    const customer = sent.find((m) => m.to === 'ayse@example.com')
    expect(customer?.subject).toBe(subject)
    expect(customer?.text).toMatch(notice)
    expect(customer?.html).toMatch(notice)
    expect(customer?.html).toContain(`lang="${locale}"`)
  })

  it('still answers 200 when a mail fails, and marks it failed in the outbox', async () => {
    const send = async (message: MailMessage) => {
      if (message.to === 'ayse@example.com') throw new Error('550 mailbox unavailable')
    }
    const { deps, notifications } = setup({ send })
    const response = await handleSubmit(post(envelope('contact')), deps)
    expect(response.status).toBe(200)
    expect(notifications.find((n) => n.kind === 'customer_receipt')?.result).toEqual({ status: 'failed', error: '550 mailbox unavailable' })
    expect(notifications.find((n) => n.kind === 'business_new_request')?.result).toEqual({ status: 'sent', at: NOW })
  })

  it('gives up on a mail that hangs past the timeout and records a timeout in the outbox', async () => {
    const { deps, notifications } = setup({ send: () => new Promise<void>(() => undefined) })
    const response = await handleSubmit(post(envelope('contact')), deps)
    expect(response.status).toBe(200)
    expect(notifications).toHaveLength(2)
    for (const notification of notifications) {
      expect(notification.result).toEqual({ status: 'failed', error: expect.stringMatching(/timeout/) })
    }
  })

  it('keeps the request when the outbox cannot be written', async () => {
    const { deps, requests, reportError, mailer } = setup({ store: { queueNotifications: async () => Promise.reject(new Error('outbox down')) } })
    const response = await handleSubmit(post(envelope('contact')), deps)
    expect(response.status).toBe(200)
    expect(requests).toHaveLength(1)
    expect(mailer.send).not.toHaveBeenCalled()
    expect(reportError).toHaveBeenCalled()
  })

  it('skips the business mail when no business address is configured', async () => {
    const { deps, notifications } = setup({ config: { businessEmail: null } })
    await handleSubmit(post(envelope('contact')), deps)
    expect(notifications.map((n) => n.kind)).toEqual(['customer_receipt'])
  })

  it('escapes everything the visitor typed in the HTML part', async () => {
    const { deps, sent } = setup()
    const values = { ...VALUES.contact, fullName: '<script>alert(1)</script>', message: 'a & b "c" <img src=x>' }
    await handleSubmit(post(envelope('contact', { values })), deps)
    expect(sent).toHaveLength(2)
    for (const message of sent) {
      expect(message.html).not.toContain('<script>')
      expect(message.html).not.toContain('<img')
    }
    const business = sent.find((m) => m.to === BUSINESS)
    expect(business?.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(business?.html).toContain('a &amp; b &quot;c&quot; &lt;img src=x&gt;')
  })

  it.each([
    ['contact', { fullName: 'PHISH name', subject: 'PHISH subject', message: 'PHISH http://evil.example' }],
    ['event', { fullName: 'PHISH name', message: 'PHISH message', preferredDate: 'PHISH http://evil.example' }],
    ['transport', { from: 'PHISH from', to: 'PHISH to', note: 'PHISH note', dateTime: 'PHISH when' }],
    ['lodging', { preferences: 'PHISH prefs', checkIn: 'PHISH in', checkOut: 'PHISH out' }],
  ] as const)('never echoes free text into the customer receipt (%s)', async (kind, overrides) => {
    const { deps, sent } = setup()
    const response = await handleSubmit(post(envelope(kind, { values: { ...VALUES[kind], ...overrides } })), deps)
    expect(response.status).toBe(200)
    const customer = sent.find((m) => m.to === 'ayse@example.com')
    expect(customer).toBeDefined()
    expect(`${customer?.subject}${customer?.text}${customer?.html}`).not.toMatch(/PHISH|evil\.example/)
    // The business still sees everything the visitor wrote.
    expect(sent.find((m) => m.to === BUSINESS)?.text).toMatch(/PHISH/)
  })

  it('keeps the structured summary in the customer receipt', async () => {
    const { deps, sent } = setup()
    await handleSubmit(post(envelope('transport', { locale: 'en' })), deps)
    const customer = sent.find((m) => m.to === 'ayse@example.com')
    expect(customer?.text).toContain('2026-11-20T10:00')
    expect(customer?.text).toContain('2026-11-27T10:00')
    expect(customer?.text).toMatch(/Number of people: 3/)
    expect(customer?.text).toMatch(/Round trip/)
  })

  it('sets Reply-To on the business mail to the visitor, and not on the receipt', async () => {
    const { deps, sent } = setup()
    await handleSubmit(post(envelope('contact')), deps)
    expect(sent.find((m) => m.to === BUSINESS)?.replyTo).toBe('ayse@example.com')
    expect(sent.find((m) => m.to === 'ayse@example.com')?.replyTo).toBeUndefined()
  })

  it('keeps e-mail addresses out of the outbox error and the log', async () => {
    const send = async (message: MailMessage) => {
      if (message.to === 'ayse@example.com') throw new Error('550 5.1.1 <ayse@example.com>: Recipient address rejected')
    }
    const { deps, notifications, reportError } = setup({ send })
    expect((await handleSubmit(post(envelope('contact')), deps)).status).toBe(200)
    const failed = notifications.find((n) => n.kind === 'customer_receipt')?.result
    expect(failed).toEqual({ status: 'failed', error: '550 5.1.1 <[email]>: Recipient address rejected' })
    expect(JSON.stringify(reportError.mock.calls)).not.toContain('ayse@example.com')
  })

  it('never carries health data into the request or the mails', async () => {
    const { deps, sent, requests } = setup()
    const values = { ...VALUES.event, health: { asthma: true }, medicalNotes: 'epilepsy' }
    await handleSubmit(post(envelope('event', { values })), deps)
    expect(requests[0]?.payload).not.toHaveProperty('health')
    expect(requests[0]?.payload).not.toHaveProperty('medicalNotes')
    for (const message of sent) {
      expect(`${message.text}${message.html}`).not.toMatch(/asthma|epilepsy|medical|health|sağlık/i)
    }
  })
})

describe('submit-request: SMTP not configured', () => {
  it('keeps storing requests and ends both outbox rows as failed with smtp_not_configured', async () => {
    const report = vi.fn()
    const build = vi.fn()
    // An empty environment: no SMTP_HOST, no MAIL_FROM.
    const mailer = mailerFromEnv(() => undefined, build, report)
    expect(build).not.toHaveBeenCalled()

    const { deps, requests, notifications } = setup()
    const response = await handleSubmit(post(envelope('contact')), { ...deps, mailer })
    expect(response.status).toBe(200)
    expect(await body(response)).toEqual({ ok: true, reference: 'DRG-000123' })
    expect(requests).toHaveLength(1)
    expect(notifications.map((n) => n.kind)).toEqual(['customer_receipt', 'business_new_request'])
    expect(notifications.map((n) => n.result)).toEqual([
      { status: 'failed', error: 'smtp_not_configured' },
      { status: 'failed', error: 'smtp_not_configured' },
    ])
  })
})
