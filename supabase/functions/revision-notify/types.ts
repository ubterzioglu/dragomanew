import type { StaffVerifier } from '../_shared/auth/staff.ts'
import type { Mailer } from '../_shared/mail/types.ts'

/** What handleRevisionNotify needs from the outside world; everything is injected so vitest can run it. */

export const REVISION_EVENTS = ['created', 'commented', 'done'] as const
export type RevisionEvent = (typeof REVISION_EVENTS)[number]

/** The row a mail is about, as the database has it (never as the panel describes it). */
export interface RevisionEventRecord {
  event: RevisionEvent
  /** revision_requests.id (created), revision_comments.id (commented) or revision_status_changes.id (done). */
  sourceId: string
  requestId: string
  number: number
  description: string
  urgency: number
  /** The comment's text; null for created and done. */
  comment: string | null
  /** Staff id of whoever did it: only they may announce it, and they get no mail about it. */
  actorId: string
  actorName: string
}

export interface Recipient {
  staffId: string
  email: string
  name: string
}

/** A revision_notifications row this call created (status pending) and now has to finish. */
export interface ClaimedNotification {
  id: string
  recipient: Recipient
}

export type NotificationOutcome =
  | { status: 'sent'; at: Date }
  | { status: 'failed'; error: string }
  | { status: 'smtp_not_configured' }

export interface RateLimit {
  max: number
  windowSeconds: number
}

export interface RevisionNotifyStore {
  /** public.throttle_submission(key, …): records one call; false once `key` used up the window. */
  throttle(key: string, limit: RateLimit): Promise<boolean>
  /** The event's row with its request and the actor's name; null when there is no such row. */
  findEvent(event: RevisionEvent, id: string): Promise<RevisionEventRecord | null>
  /** public.revision_recipients(): active staff with revisions.use, without `exclude`. */
  recipients(exclude: string): Promise<Recipient[]>
  /** One pending row per recipient; only the rows that did not exist yet come back. */
  claim(event: RevisionEventRecord, recipients: readonly Recipient[]): Promise<ClaimedNotification[]>
  /** The final status of one claimed row. */
  finish(id: string, outcome: NotificationOutcome): Promise<void>
}

export interface RevisionNotifyDeps {
  store: RevisionNotifyStore
  auth: StaffVerifier
  /** null while SMTP is not configured: every row ends smtp_not_configured. */
  mailer: Mailer | null
  /** PANEL_URL, the panel's root (https://…/panel/); null leaves the link out of the mail. */
  panelUrl: string | null
  allowedOrigins: readonly string[]
  mailTimeoutMs: number
  clock: () => Date
  reportError?: (context: string, error: unknown) => void
}
