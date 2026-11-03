import type { SupabaseClient } from '@supabase/supabase-js'
import type { ClaimedNotification, Recipient, RevisionEvent, RevisionEventRecord, RevisionNotifyStore } from './types.ts'

/** The real RevisionNotifyStore on the revision tables, with the service client. */

interface RequestPart {
  id: string
  number: number
  description: string
  urgency: number
}

const REQUEST_COLUMNS = 'id, number, description, urgency'

export function createRevisionNotifyStore(db: SupabaseClient): RevisionNotifyStore {
  const actorName = async (staffId: string): Promise<string> => {
    const { data, error } = await db.from('staff_members').select('full_name').eq('id', staffId).maybeSingle<{ full_name: string }>()
    if (error) throw error
    return data?.full_name ?? 'Bir panel kullanıcısı'
  }

  const recordOf = async (
    event: RevisionEvent,
    sourceId: string,
    request: RequestPart | null,
    actorId: string,
    comment: string | null,
  ): Promise<RevisionEventRecord | null> => {
    if (!request) return null
    const { id: requestId, number, description, urgency } = request
    return { event, sourceId, requestId, number, description, urgency, comment, actorId, actorName: await actorName(actorId) }
  }

  return {
    async throttle(key, limit) {
      const { data, error } = await db.rpc('throttle_submission', {
        p_ip_hash: key,
        p_max: limit.max,
        p_window_seconds: limit.windowSeconds,
      })
      if (error) throw error
      return data === true
    },

    async findEvent(event, id) {
      if (event === 'created') {
        const { data, error } = await db
          .from('revision_requests')
          .select(`${REQUEST_COLUMNS}, requester_id`)
          .eq('id', id)
          .maybeSingle<RequestPart & { requester_id: string }>()
        if (error) throw error
        return data ? recordOf(event, data.id, data, data.requester_id, null) : null
      }
      if (event === 'commented') {
        const { data, error } = await db
          .from('revision_comments')
          .select(`id, body, author_id, request:revision_requests(${REQUEST_COLUMNS})`)
          .eq('id', id)
          .maybeSingle<{ id: string; body: string; author_id: string; request: RequestPart | null }>()
        if (error) throw error
        return data ? recordOf(event, data.id, data.request, data.author_id, data.body) : null
      }
      // done: only a change that ended in done is announced.
      const { data, error } = await db
        .from('revision_status_changes')
        .select(`id, changed_by, request:revision_requests(${REQUEST_COLUMNS})`)
        .eq('id', id)
        .eq('to_status', 'done')
        .maybeSingle<{ id: string; changed_by: string; request: RequestPart | null }>()
      if (error) throw error
      return data ? recordOf(event, data.id, data.request, data.changed_by, null) : null
    },

    async recipients(exclude) {
      const { data, error } = await db.rpc('revision_recipients', { p_exclude: exclude })
      if (error) throw error
      const rows = (data ?? []) as { staff_id: string; email: string; full_name: string }[]
      return rows.map((row): Recipient => ({ staffId: row.staff_id, email: row.email, name: row.full_name }))
    },

    async claim(event, recipients) {
      const rows = recipients.map((recipient) => ({
        request_id: event.requestId,
        event: event.event,
        source_id: event.sourceId,
        actor_id: event.actorId,
        recipient_id: recipient.staffId,
        recipient: recipient.email,
      }))
      // ON CONFLICT DO NOTHING: rows from an earlier call for the same event are not returned.
      const { data, error } = await db
        .from('revision_notifications')
        .upsert(rows, { onConflict: 'event,source_id,recipient_id', ignoreDuplicates: true })
        .select('id, recipient_id')
      if (error) throw error
      const byStaff = new Map(recipients.map((recipient) => [recipient.staffId, recipient]))
      return ((data ?? []) as { id: string; recipient_id: string }[]).flatMap((row): ClaimedNotification[] => {
        const recipient = byStaff.get(row.recipient_id)
        return recipient ? [{ id: row.id, recipient }] : []
      })
    },

    async finish(id, outcome) {
      const patch =
        outcome.status === 'sent'
          ? { status: 'sent', sent_at: outcome.at.toISOString(), error: null }
          : outcome.status === 'failed'
            ? { status: 'failed', error: outcome.error }
            : { status: 'smtp_not_configured', error: null }
      const { error } = await db.from('revision_notifications').update(patch).eq('id', id).eq('status', 'pending')
      if (error) throw error
    },
  }
}
