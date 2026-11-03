import { afterEach, describe, expect, it, vi } from 'vitest'
import type { StaffVerifier } from '../../../supabase/functions/_shared/auth/staff.ts'
import type { MailMessage, Mailer } from '../../../supabase/functions/_shared/mail/types.ts'
import { handleRevisionNotify, NOTIFY_LIMIT } from '../../../supabase/functions/revision-notify/handler.ts'
import { revisionLink, revisionMail } from '../../../supabase/functions/revision-notify/mail.ts'
import type {
  ClaimedNotification,
  NotificationOutcome,
  RateLimit,
  Recipient,
  RevisionEventRecord,
  RevisionNotifyDeps,
  RevisionNotifyStore,
} from '../../../supabase/functions/revision-notify/types.ts'
import { ORIGIN, staffRequest } from './edgeStaff'

const URL = 'http://localhost/functions/v1/revision-notify'
const NOW = new Date('2026-11-03T12:00:00.000Z')
const PANEL_URL = 'http://127.0.0.1:5175/panel/'

const ADMIN = '20000000-0000-4000-8000-000000000001'
const CLIENT = '20000000-0000-4000-8000-000000000002'
const CLIENT2 = '20000000-0000-4000-8000-000000000003'
const REQUEST_ID = '30000000-0000-4000-8000-000000000001'
const COMMENT_ID = '30000000-0000-4000-8000-000000000002'
const CHANGE_ID = '30000000-0000-4000-8000-000000000003'

/** token → what getClaims, my_permissions() and the active staff row would answer. */
const TOKENS: Readonly<Record<string, { sub: string; permissions: string[]; staffId: string | null }>> = {
  admin: { sub: 'user-admin', permissions: ['content.edit', 'revisions.use', 'staff.manage'], staffId: ADMIN },
  client: { sub: 'user-client', permissions: ['content.edit', 'content.translate', 'revisions.use'], staffId: CLIENT },
  /** Staff, but revisions.use was never given. */
  content: { sub: 'user-content', permissions: ['content.edit', 'content.translate'], staffId: '20000000-0000-4000-8000-000000000009' },
  /** Deactivated: my_permissions() is empty and no active row is found. */
  inactive: { sub: 'user-inactive', permissions: [], staffId: null },
  /** The permission claimed, but no active staff row bound to the user. */
  orphan: { sub: 'user-orphan', permissions: ['revisions.use'], staffId: null },
}

const verifier: StaffVerifier = {
  claims: async (token) => (TOKENS[token] ? { sub: TOKENS[token].sub } : null),
  permissions: async (token) => TOKENS[token]?.permissions ?? [],
  staffId: async (userId) => Object.values(TOKENS).find((entry) => entry.sub === userId)?.staffId ?? null,
}

const PEOPLE: Readonly<Record<string, Recipient>> = {
  [ADMIN]: { staffId: ADMIN, email: 'ubt@example.test', name: 'Ana Yönetici' },
  [CLIENT]: { staffId: CLIENT, email: 'ayse@example.test', name: 'Ayşe' },
  [CLIENT2]: { staffId: CLIENT2, email: 'mehmet@example.test', name: 'Mehmet' },
}

const record = (overrides: Partial<RevisionEventRecord> = {}): RevisionEventRecord => ({
  event: 'created',
  sourceId: REQUEST_ID,
  requestId: REQUEST_ID,
  number: 12,
  description: 'Ana sayfadaki logo büyüsün.\nMobilde de.',
  urgency: 7,
  comment: null,
  actorId: CLIENT,
  actorName: 'Ayşe',
  ...overrides,
})

interface Setup {
  event?: RevisionEventRecord | null
  mailer?: Mailer | null
  /** Staff ids with revisions.use (active); the store leaves out the excluded one like the SQL does. */
  holders?: readonly string[]
  timeoutMs?: number
}

function setup(options: Setup = {}) {
  const found = options.event === undefined ? record() : options.event
  const holders = options.holders ?? [ADMIN, CLIENT, CLIENT2]
  const claimedKeys = new Set<string>()
  const finished: { id: string; outcome: NotificationOutcome }[] = []
  const store = {
    throttle: vi.fn(async (_key: string, _limit: RateLimit) => true),
    findEvent: vi.fn(async () => found),
    recipients: vi.fn(async (exclude: string) => holders.filter((id) => id !== exclude).map((id) => PEOPLE[id] as Recipient)),
    claim: vi.fn(async (event: RevisionEventRecord, recipients: readonly Recipient[]) =>
      recipients.flatMap((recipient): ClaimedNotification[] => {
        const key = `${event.event}:${event.sourceId}:${recipient.staffId}`
        if (claimedKeys.has(key)) return []
        claimedKeys.add(key)
        return [{ id: `row-${recipient.staffId}`, recipient }]
      }),
    ),
    finish: vi.fn(async (id: string, outcome: NotificationOutcome) => {
      finished.push({ id, outcome })
    }),
  } satisfies RevisionNotifyStore
  const sent: MailMessage[] = []
  const defaultMailer: Mailer = {
    send: vi.fn(async (message: MailMessage) => {
      sent.push(message)
    }),
  }
  const reportError = vi.fn()
  const deps: RevisionNotifyDeps = {
    store,
    auth: verifier,
    mailer: options.mailer === undefined ? defaultMailer : options.mailer,
    panelUrl: PANEL_URL,
    allowedOrigins: [ORIGIN],
    mailTimeoutMs: options.timeoutMs ?? 8_000,
    clock: () => NOW,
    reportError,
  }
  return { deps, store, sent, finished, reportError }
}

const send = async (deps: RevisionNotifyDeps, body: unknown, options: Parameters<typeof staffRequest>[2] = {}) => {
  const response = await handleRevisionNotify(staffRequest(URL, body, { token: 'client', ...options }), deps)
  return { status: response.status, body: (await response.json().catch(() => null)) as Record<string, unknown> | null }
}

const CREATED = { event: 'created', id: REQUEST_ID }

describe('revision-notify: who may call', () => {
  it('401 without a session; 403 without revisions.use, for former staff, without a staff row, from a foreign origin', async () => {
    const { deps, store } = setup()
    expect(await send(deps, CREATED, { token: null })).toMatchObject({ status: 401, body: { ok: false, error: 'unauthorized' } })
    expect(await send(deps, CREATED, { token: 'expired' })).toMatchObject({ status: 401 })
    expect(await send(deps, CREATED, { token: 'content' })).toMatchObject({ status: 403, body: { error: 'forbidden' } })
    expect((await send(deps, CREATED, { token: 'inactive' })).status).toBe(403)
    expect((await send(deps, CREATED, { token: 'orphan' })).status).toBe(403)
    expect((await send(deps, CREATED, { origin: 'https://evil.example' })).status).toBe(403)
    expect(store.findEvent).not.toHaveBeenCalled()
  })

  it('answers the CORS preflight and refuses other methods', async () => {
    const { deps } = setup()
    const preflight = await handleRevisionNotify(staffRequest(URL, null, { method: 'OPTIONS' }), deps)
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('access-control-allow-origin')).toBe(ORIGIN)
    expect((await handleRevisionNotify(staffRequest(URL, null, { method: 'GET' }), deps)).status).toBe(405)
  })

  it('400 for a body that is not { event, id: uuid }, 413 for a huge one', async () => {
    const { deps, store } = setup()
    expect((await send(deps, {})).status).toBe(400)
    expect((await send(deps, { event: 'deleted', id: REQUEST_ID })).status).toBe(400)
    expect((await send(deps, { event: 'created', id: 'not-a-uuid' })).status).toBe(400)
    expect((await send(deps, 'not json')).status).toBe(400)
    expect((await send(deps, { ...CREATED, padding: 'x'.repeat(5000) })).status).toBe(413)
    expect(store.findEvent).not.toHaveBeenCalled()
  })

  it('404 when the request, comment or status change does not exist', async () => {
    const { deps, store } = setup({ event: null })
    expect(await send(deps, { event: 'done', id: CHANGE_ID })).toMatchObject({ status: 404, body: { error: 'not_found' } })
    expect(store.findEvent).toHaveBeenCalledWith('done', CHANGE_ID)
  })

  it('429 once a person used up the window, before anything is looked up or claimed', async () => {
    const { deps, store, sent } = setup()
    store.throttle.mockResolvedValueOnce(false)
    expect(await send(deps, CREATED)).toMatchObject({ status: 429, body: { ok: false, error: 'rate_limited' } })
    expect(store.throttle).toHaveBeenCalledWith(`revision-notify:${CLIENT}`, NOTIFY_LIMIT)
    expect(NOTIFY_LIMIT).toEqual({ max: 20, windowSeconds: 600 })
    expect(store.findEvent).not.toHaveBeenCalled()
    expect(store.claim).not.toHaveBeenCalled()
    expect(sent).toHaveLength(0)
    // Nothing was claimed, so the same event can still be announced later.
    expect(await send(deps, CREATED)).toMatchObject({ status: 200, body: { sent: 2 } })
  })

  it('403 when the caller did not do the action: nobody mails the team about someone else', async () => {
    const { deps, store, sent } = setup({ event: record({ event: 'done', sourceId: CHANGE_ID, actorId: ADMIN, actorName: 'Ana Yönetici' }) })
    expect(await send(deps, { event: 'done', id: CHANGE_ID }, { token: 'client' })).toMatchObject({ status: 403 })
    expect(store.recipients).not.toHaveBeenCalled()
    expect(sent).toHaveLength(0)
  })
})

describe('revision-notify: recipients and outcomes', () => {
  afterEach(() => vi.useRealTimers())

  it('mails every other active holder of revisions.use, never the actor, and records each as sent', async () => {
    const { deps, store, sent, finished } = setup()
    const reply = await send(deps, CREATED)
    expect(reply).toMatchObject({ status: 200, body: { ok: true, recipients: 2, sent: 2, failed: 0, notConfigured: 0, skipped: 0 } })
    expect(store.recipients).toHaveBeenCalledWith(CLIENT)
    expect(sent.map((message) => message.to).sort()).toEqual(['mehmet@example.test', 'ubt@example.test'])
    expect(finished).toEqual([
      { id: `row-${ADMIN}`, outcome: { status: 'sent', at: NOW } },
      { id: `row-${CLIENT2}`, outcome: { status: 'sent', at: NOW } },
    ])
  })

  it('without SMTP records every recipient as smtp_not_configured and claims no delivery', async () => {
    const { deps, finished } = setup({ mailer: null })
    const reply = await send(deps, CREATED)
    expect(reply).toMatchObject({ status: 200, body: { recipients: 2, sent: 0, failed: 0, notConfigured: 2 } })
    expect(finished.map((row) => row.outcome)).toEqual([{ status: 'smtp_not_configured' }, { status: 'smtp_not_configured' }])
  })

  it('a failing mail is recorded as failed without the address; the others still go out', async () => {
    const send550 = vi.fn(async (message: MailMessage) => {
      if (message.to === 'ubt@example.test') throw new Error('550 <ubt@example.test>: Recipient address rejected')
    })
    const { deps, finished, reportError } = setup({ mailer: { send: send550 } })
    const reply = await send(deps, CREATED)
    expect(reply).toMatchObject({ status: 200, body: { ok: true, recipients: 2, sent: 1, failed: 1 } })
    const failed = finished.find((row) => row.id === `row-${ADMIN}`)?.outcome
    expect(failed).toEqual({ status: 'failed', error: '550 <[email]>: Recipient address rejected' })
    expect(JSON.stringify(reportError.mock.calls)).not.toContain('ubt@example.test')
    expect(finished.find((row) => row.id === `row-${CLIENT2}`)?.outcome).toEqual({ status: 'sent', at: NOW })
  })

  it('a mail server that never answers counts as failed (timeout); mails go out one after another', async () => {
    vi.useFakeTimers()
    const hanging: Mailer = { send: vi.fn(() => new Promise<void>(() => undefined)) }
    const { deps, finished } = setup({ mailer: hanging, timeoutMs: 8_000 })
    const pending = send(deps, CREATED)
    await vi.advanceTimersByTimeAsync(8_000)
    // One SMTP login at a time: the second mail starts only after the first gave up.
    expect(hanging.send).toHaveBeenCalledTimes(2)
    expect(finished).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(8_000)
    expect((await pending).body).toMatchObject({ sent: 0, failed: 2 })
    expect(finished.every((row) => row.outcome.status === 'failed' && row.outcome.error.startsWith('timeout'))).toBe(true)
  })

  it('a repeated call for the same event sends nothing again', async () => {
    const { deps, sent } = setup()
    await send(deps, CREATED)
    const again = await send(deps, CREATED)
    expect(again).toMatchObject({ status: 200, body: { recipients: 2, sent: 0, skipped: 2 } })
    expect(sent).toHaveLength(2)
  })

  it('with nobody else holding the permission, nothing is claimed or sent', async () => {
    const { deps, store } = setup({ holders: [CLIENT] })
    expect(await send(deps, CREATED)).toMatchObject({ status: 200, body: { recipients: 0, sent: 0 } })
    expect(store.claim).not.toHaveBeenCalled()
  })

  it('a row that cannot be finished is reported, the answer still comes', async () => {
    const { deps, store, reportError } = setup()
    store.finish.mockRejectedValueOnce(new Error('db down'))
    expect(await send(deps, CREATED)).toMatchObject({ status: 200, body: { sent: 2 } })
    expect(reportError).toHaveBeenCalledWith('revision-notify: notification row', expect.any(Error))
  })

  it('500 server when the store fails before anything is sent', async () => {
    const { deps, store, reportError, sent } = setup()
    store.recipients.mockRejectedValueOnce(new Error('db down'))
    expect(await send(deps, CREATED)).toMatchObject({ status: 500, body: { ok: false, error: 'server' } })
    expect(reportError).toHaveBeenCalledWith('revision-notify', expect.any(Error))
    expect(sent).toHaveLength(0)
  })

  it('main_admin announces their own Tamamlandı to the team', async () => {
    const { deps, store, sent } = setup({ event: record({ event: 'done', sourceId: CHANGE_ID, actorId: ADMIN, actorName: 'Ana Yönetici' }) })
    expect(await send(deps, { event: 'done', id: CHANGE_ID }, { token: 'admin' })).toMatchObject({ status: 200, body: { sent: 2 } })
    expect(store.recipients).toHaveBeenCalledWith(ADMIN)
    expect(sent.map((message) => message.to).sort()).toEqual(['ayse@example.test', 'mehmet@example.test'])
  })
})

describe('revision-notify: the mail', () => {
  const ayse = PEOPLE[CLIENT] as Recipient
  const link = revisionLink(PANEL_URL, REQUEST_ID)

  it('links to the request in the panel, with or without a trailing slash on PANEL_URL', () => {
    expect(link).toBe(`http://127.0.0.1:5175/panel/revizyonlar/${REQUEST_ID}`)
    expect(revisionLink('https://notyetbro.club/panel', REQUEST_ID)).toBe(`https://notyetbro.club/panel/revizyonlar/${REQUEST_ID}`)
    expect(revisionLink(null, REQUEST_ID)).toBeNull()
    expect(revisionLink('not a url', REQUEST_ID)).toBeNull()
  })

  it('a new request: Turkish plain text with the number, urgency, description and link', () => {
    const mail = revisionMail(record(), ayse, link)
    expect(mail.to).toBe('ayse@example.test')
    expect(mail.subject).toBe('Yeni revizyon isteği #12: Ana sayfadaki logo büyüsün. Mobilde de.')
    expect(mail.text).toContain('Merhaba Ayşe,')
    expect(mail.text).toContain('Ayşe yeni bir revizyon isteği açtı (aciliyet 7/10):')
    expect(mail.text).toContain('Ana sayfadaki logo büyüsün.\nMobilde de.')
    expect(mail.text).toContain(`İsteği panelde açın: ${link}`)
    expect(mail.text).not.toMatch(/<[a-z]/i)
  })

  it('a comment quotes the comment; Tamamlandı says how to reopen', () => {
    const comment = revisionMail(record({ event: 'commented', sourceId: COMMENT_ID, comment: 'Logo hâlâ küçük', actorName: 'Mehmet' }), ayse, link)
    expect(comment.subject).toBe('Revizyon #12 için yeni yorum')
    expect(comment.text).toContain('Mehmet, #12 numaralı revizyon isteğine yorum yazdı:\n\nLogo hâlâ küçük')
    const done = revisionMail(record({ event: 'done', sourceId: CHANGE_ID, actorName: 'Ana Yönetici' }), ayse, link)
    expect(done.subject).toBe('Revizyon #12 tamamlandı')
    expect(done.text).toContain('Tamamlandı olarak işaretledi')
    expect(done.text).toContain('Yeniden aç')
  })

  it('escapes what people typed in the HTML part and keeps the subject on one line', () => {
    const mail = revisionMail(record({ description: '<script>alert(1)</script>\r\nBcc: x@y.test' }), ayse, null)
    expect(mail.html).not.toContain('<script>')
    expect(mail.html).toContain('&lt;script&gt;')
    expect(mail.subject).not.toMatch(/[\r\n]/)
    expect(mail.text).not.toContain('İsteği panelde açın')
  })

  it('shortens a very long description', () => {
    const mail = revisionMail(record({ description: 'a'.repeat(5000) }), ayse, link)
    expect(mail.text.length).toBeLessThan(1500)
    expect(mail.subject.length).toBeLessThan(100)
  })
})
