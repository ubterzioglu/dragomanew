import { z } from 'zod'
import type { StaffVerifier } from '../_shared/auth/staff.ts'
import { bearerToken, corsFor, failure, jsonResponse, readJsonBody } from '../_shared/http/http.ts'
import { redactEmails } from '../submit-request/redact.ts'
import { revisionLink, revisionMail } from './mail.ts'
import {
  REVISION_EVENTS,
  type ClaimedNotification,
  type NotificationOutcome,
  type RateLimit,
  type RevisionEventRecord,
  type RevisionNotifyDeps,
} from './types.ts'

/**
 * revision-notify: the panel calls it after a revision action was saved (a new request, a new
 * comment, Tamamlandı). Body `{ "event": "created" | "commented" | "done", "id": <uuid> }`, the id
 * being the request, the comment or the status change. Only the person who did the action may
 * announce it. Every other active staff member with revisions.use gets one mail per event
 * (revision_notifications keeps the row and its outcome: sent, failed, smtp_not_configured). The
 * action is already stored; nothing here can undo or block it. Mails go out one after another
 * (one SMTP login at a time), and a person may ask at most NOTIFY_LIMIT times per window, so a
 * comment loop cannot flood the business's mail account (submit-request sends through it too).
 */

export const REVISIONS_PERMISSION = 'revisions.use'
export const NOTIFY_LIMIT: RateLimit = { max: 20, windowSeconds: 10 * 60 }
const MAX_BODY_BYTES = 4096

const bodySchema = z.object({ event: z.enum(REVISION_EVENTS), id: z.uuid() })

type Caller = { ok: true; staffId: string } | { ok: false; status: 401 | 403; error: 'unauthorized' | 'forbidden' }

/**
 * The steps of authorizeStaff (_shared/auth/staff.ts) for revisions.use, which its Permission union
 * does not list: a valid session token, the permission in my_permissions(), an active staff row.
 */
async function authorize(request: Request, verifier: StaffVerifier): Promise<Caller> {
  const token = bearerToken(request)
  const claims = token ? await verifier.claims(token) : null
  if (!token || !claims) return { ok: false, status: 401, error: 'unauthorized' }
  const permissions = await verifier.permissions(token)
  if (!permissions.includes(REVISIONS_PERMISSION)) return { ok: false, status: 403, error: 'forbidden' }
  const staffId = await verifier.staffId(claims.sub)
  return staffId ? { ok: true, staffId } : { ok: false, status: 403, error: 'forbidden' }
}

export async function handleRevisionNotify(request: Request, deps: RevisionNotifyDeps): Promise<Response> {
  const cors = corsFor(request.headers.get('origin'), deps.allowedOrigins)
  if (cors === false) return jsonResponse(403, failure('forbidden'))
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (request.method !== 'POST') return jsonResponse(405, failure('bad_request'), { ...cors, allow: 'POST, OPTIONS' })
  const reply = (status: number, body: unknown) => jsonResponse(status, body, cors)

  try {
    const caller = await authorize(request, deps.auth)
    if (!caller.ok) return reply(caller.status, failure(caller.error))

    const raw = await readJsonBody(request, MAX_BODY_BYTES)
    if (!raw.ok) return reply(raw.reason === 'too_large' ? 413 : 400, failure('bad_request'))
    const body = bodySchema.safeParse(raw.value)
    if (!body.success) return reply(400, failure('bad_request'))
    // Before anything is claimed, so a refused call can still be repeated later for the same event.
    if (!(await deps.store.throttle(`revision-notify:${caller.staffId}`, NOTIFY_LIMIT))) return reply(429, failure('rate_limited'))

    const event = await deps.store.findEvent(body.data.event, body.data.id)
    if (!event) return reply(404, failure('not_found'))
    // Nobody mails the team about someone else's action.
    if (event.actorId !== caller.staffId) return reply(403, failure('forbidden'))

    const recipients = await deps.store.recipients(event.actorId)
    const claimed = recipients.length > 0 ? await deps.store.claim(event, recipients) : []
    const outcomes: NotificationOutcome['status'][] = []
    for (const row of claimed) outcomes.push(await deliver(row, event, deps))
    const counted = (status: NotificationOutcome['status']) => outcomes.filter((outcome) => outcome === status).length
    return reply(200, {
      ok: true,
      recipients: recipients.length,
      sent: counted('sent'),
      failed: counted('failed'),
      notConfigured: counted('smtp_not_configured'),
      // Recipients an earlier call for the same event already handled.
      skipped: recipients.length - claimed.length,
    })
  } catch (error) {
    deps.reportError?.('revision-notify', error)
    return reply(500, failure('server'))
  }
}

/** Sends one mail and records its outcome; a failed record is reported, never thrown. */
async function deliver(row: ClaimedNotification, event: RevisionEventRecord, deps: RevisionNotifyDeps): Promise<NotificationOutcome['status']> {
  const outcome = await send(row, event, deps)
  if (outcome.status === 'failed') deps.reportError?.(`revision-notify: ${event.event} mail not sent`, new Error(outcome.error))
  await deps.store.finish(row.id, outcome).catch((error: unknown) => deps.reportError?.('revision-notify: notification row', error))
  return outcome.status
}

async function send(row: ClaimedNotification, event: RevisionEventRecord, deps: RevisionNotifyDeps): Promise<NotificationOutcome> {
  if (!deps.mailer) return { status: 'smtp_not_configured' }
  try {
    const message = revisionMail(event, row.recipient, revisionLink(deps.panelUrl, event.requestId))
    await withTimeout(deps.mailer.send(message), deps.mailTimeoutMs)
    return { status: 'sent', at: deps.clock() }
  } catch (error) {
    // SMTP errors quote the recipient; the row and the log keep the reason, not the address.
    return { status: 'failed', error: redactEmails(error instanceof Error ? error.message : String(error)).slice(0, 500) }
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timeout: no answer from SMTP within ${ms} ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}
