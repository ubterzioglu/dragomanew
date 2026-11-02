import type { RequestKind, SiteLocale } from '../_shared/requests/payload.ts'
import type { Currency, PriceBasis, RequestSummary } from '../_shared/requests/rules.ts'
import type { Mailer } from '../_shared/mail/types.ts'

export type { MailMessage, Mailer } from '../_shared/mail/types.ts'

/**
 * What handleSubmit needs from the outside world. Everything here is injected, so the
 * handler stays pure and the site's vitest suite can run it in Node.
 */

export type LocalizedText = Readonly<Partial<Record<SiteLocale, string>>>
export type EventStatus = 'draft' | 'published' | 'archived'

export interface EventOptionRecord {
  id: string
  name: LocalizedText
  price: number | null
  currency: Currency
  basis: PriceBasis
}

/** An event row with its options in display order; health form details are never loaded. */
export interface EventRecord {
  id: string
  category: string
  title: LocalizedText
  priceDisplay: 'numeric' | 'on_request'
  status: EventStatus
  options: readonly EventOptionRecord[]
}

export interface SnapshotOption {
  id: string
  name: string
  price: number | null
  currency: Currency
  basis: PriceBasis
  quantity: number
}

/** The event as the visitor saw it, so later price or name edits do not rewrite the request. */
export interface EventSnapshot {
  id: string
  category: string
  title: string
  priceDisplay: 'numeric' | 'on_request'
  options: SnapshotOption[]
}

export interface NewRequest {
  kind: RequestKind
  locale: SiteLocale
  fullName: string
  email: string
  phone: string | null
  payload: Record<string, unknown>
  eventId: string | null
  eventSnapshot: EventSnapshot | null
  priceSummary: RequestSummary | null
  idempotencyKey: string
}

/** `created` is false when the idempotency key was already used: a replay, not a new request. */
export interface SavedRequest {
  id: string
  reference: string
  created: boolean
}

export type NotificationKind = 'customer_receipt' | 'business_new_request'

export interface NewNotification {
  requestId: string
  kind: NotificationKind
  recipient: string
  locale: SiteLocale
}

export type DeliveryResult = { status: 'sent'; at: Date } | { status: 'failed'; error: string }

export interface RateLimit {
  max: number
  windowSeconds: number
}

export interface RequestStore {
  /**
   * One atomic check-and-record for this IP hash (public.throttle_submission): true when the
   * submission may go ahead and was counted, false when the hash is already at the limit.
   */
  throttleSubmission(ipHash: string, limit: RateLimit): Promise<boolean>
  findEvent(id: string): Promise<EventRecord | null>
  /** Inserts the request; on an idempotency-key conflict returns the existing one instead. */
  saveRequest(request: NewRequest): Promise<SavedRequest>
  /** Writes outbox rows as `pending` and returns their ids in the same order. */
  queueNotifications(rows: readonly NewNotification[]): Promise<number[]>
  markNotification(id: number, result: DeliveryResult): Promise<void>
  /** Whether any outbox row exists for the request; a replay uses it to notice a lost outbox write. */
  hasNotifications(requestId: string): Promise<boolean>
}

export interface SubmitConfig {
  allowedOrigins: readonly string[]
  /** Publishable keys accepted on `apikey` (or as a bearer token). Empty refuses every call. */
  publishableKeys: readonly string[]
  /** Receives the Turkish new-request mail; null skips it. */
  businessEmail: string | null
  panelUrl: string | null
  rateLimit: RateLimit
  mailTimeoutMs: number
}

export interface Deps {
  store: RequestStore
  mailer: Mailer
  clock: () => Date
  config: SubmitConfig
  /** HMAC of the client IP, so raw addresses are never stored. */
  hashIp: (ip: string) => Promise<string>
  /** Server-side log for failures the visitor must not see in detail. */
  reportError?: (context: string, error: unknown) => void
}
