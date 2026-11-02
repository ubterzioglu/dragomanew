import { createClient } from '@supabase/supabase-js'
import type { Currency, PriceBasis } from '../_shared/requests/rules.ts'
import { throttleSubmission } from './throttle.ts'
import type { DeliveryResult, EventRecord, EventStatus, LocalizedText, RequestStore } from './types.ts'

/**
 * The real RequestStore on supabase-js with the secret key. The tables have RLS on and no
 * anon access; only this function (service_role) writes requests and the outbox, and only it
 * may execute throttle_submission.
 */

const UNIQUE_VIOLATION = '23505'

interface OptionRow {
  id: string
  name: LocalizedText
  price: number | string | null
  currency: Currency
  basis: PriceBasis
  sort: number | null
}

interface EventRow {
  id: string
  category: string
  title: LocalizedText
  price_display: 'numeric' | 'on_request'
  status: EventStatus
  event_options: OptionRow[] | null
}

interface ReferenceRow {
  id: string
  reference: string
}

function toEventRecord(row: EventRow): EventRecord {
  const options = [...(row.event_options ?? [])]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((option) => ({
      id: option.id,
      name: option.name,
      // numeric(10,2) may arrive as a string; null stays "price not known".
      price: option.price === null ? null : Number(option.price),
      currency: option.currency,
      basis: option.basis,
    }))
  return { id: row.id, category: row.category, title: row.title, priceDisplay: row.price_display, status: row.status, options }
}

function deliveryPatch(result: DeliveryResult) {
  return result.status === 'sent'
    ? { status: 'sent', attempts: 1, sent_at: result.at.toISOString(), last_error: null }
    : { status: 'failed', attempts: 1, last_error: result.error }
}

export function createSupabaseStore(url: string, secretKey: string): RequestStore {
  const db = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  return {
    throttleSubmission(ipHash, limit) {
      return throttleSubmission({ rpc: (fn, args) => db.rpc(fn, args) }, ipHash, limit)
    },

    async findEvent(id) {
      // health_form is deliberately not selected: health data never enters this flow.
      const { data, error } = await db
        .from('events')
        .select('id, category, title, price_display, status, event_options(id, name, price, currency, basis, sort)')
        .eq('id', id)
        .maybeSingle<EventRow>()
      if (error) throw error
      return data ? toEventRecord(data) : null
    },

    async saveRequest(request) {
      const { data, error } = await db
        .from('requests')
        .insert({
          kind: request.kind,
          locale: request.locale,
          full_name: request.fullName,
          email: request.email,
          phone: request.phone,
          payload: request.payload,
          event_id: request.eventId,
          event_snapshot: request.eventSnapshot,
          price_summary: request.priceSummary,
          idempotency_key: request.idempotencyKey,
        })
        .select('id, reference')
        .single<ReferenceRow>()
      if (!error) return { ...data, created: true }
      if (error.code !== UNIQUE_VIOLATION) throw error

      // A replay of the same form instance: answer with the reference it already has.
      const existing = await db
        .from('requests')
        .select('id, reference')
        .eq('idempotency_key', request.idempotencyKey)
        .maybeSingle<ReferenceRow>()
      if (existing.error) throw existing.error
      if (!existing.data) throw error
      return { ...existing.data, created: false }
    },

    async queueNotifications(rows) {
      const { data, error } = await db
        .from('notifications')
        .insert(rows.map((row) => ({ request_id: row.requestId, kind: row.kind, recipient: row.recipient, locale: row.locale })))
        .select('id, kind')
      if (error) throw error
      const inserted = (data ?? []) as Array<{ id: number; kind: string }>
      // Kinds are unique per request, so they pair the returned ids with the rows.
      return rows.map((row) => {
        const match = inserted.find((item) => item.kind === row.kind)
        if (!match) throw new Error(`outbox row for ${row.kind} was not returned`)
        return match.id
      })
    },

    async markNotification(id, result) {
      const { error } = await db.from('notifications').update(deliveryPatch(result)).eq('id', id)
      if (error) throw error
    },

    async hasNotifications(requestId) {
      // head + exact count: no rows travel, only the number (indexed by request_id).
      const { count, error } = await db.from('notifications').select('id', { count: 'exact', head: true }).eq('request_id', requestId)
      if (error) throw error
      return (count ?? 0) > 0
    },
  }
}
