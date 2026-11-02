import { REQUEST_TABS, tabFilter, type RequestTab, type TabFilter } from '../lib/requestTabs'
import { db } from '../lib/supabase'
import type { ActivityRow, RequestDetail, RequestRow } from '../lib/types'

/**
 * Requests are read through RLS (active staff + requests.read) and never updated directly: every state
 * change goes through a security-definer RPC that also writes request_activity.
 */

const LIST_COLUMNS =
  'id, reference, kind, status, locale, full_name, email, phone, event_id, assignee_id, claimed_at, created_at'

/** One tab, filtered on the server and newest first, so no tab loses rows to another tab's. */
export async function listTab(filter: TabFilter, limit: number): Promise<RequestRow[]> {
  const { data, error } = await db()
    .from('requests')
    .select(LIST_COLUMNS)
    .eq(filter.column, filter.value)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as RequestRow[]
}

/** The exact number of requests in a tab, without fetching them. */
export async function countTab(filter: TabFilter): Promise<number> {
  const { count, error } = await db()
    .from('requests')
    .select('id', { count: 'exact', head: true })
    .eq(filter.column, filter.value)
  if (error) throw error
  return count ?? 0
}

export interface Inbox {
  /** The tab these rows belong to, so a tab switch never shows the previous tab's rows. */
  tab: RequestTab
  rows: RequestRow[]
  counts: Record<RequestTab, number>
}

export async function loadInbox(tab: RequestTab, myStaffId: string | null, limit: number): Promise<Inbox> {
  const countOf = (id: RequestTab): Promise<number> => {
    const filter = tabFilter(id, myStaffId)
    return filter ? countTab(filter) : Promise.resolve(0)
  }
  const current = tabFilter(tab, myStaffId)
  const [rows, ...counts] = await Promise.all([
    current ? listTab(current, limit) : Promise.resolve([]),
    ...REQUEST_TABS.map((item) => countOf(item.id)),
  ])
  const [pending = 0, inProgress = 0, mine = 0] = counts
  return { tab, rows, counts: { pending, in_progress: inProgress, mine } }
}

export async function getRequest(id: string): Promise<RequestDetail> {
  const { data, error } = await db()
    .from('requests')
    .select(`${LIST_COLUMNS}, payload, event_snapshot, price_summary, updated_at`)
    .eq('id', id)
    .single<RequestDetail>()
  if (error) throw error
  return data
}

export async function listActivity(requestId: string): Promise<ActivityRow[]> {
  const { data, error } = await db()
    .from('request_activity')
    .select('id, request_id, actor_id, action, from_staff, to_staff, created_at')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
  if (error) throw error
  return (data ?? []) as ActivityRow[]
}

async function call(fn: string, args: Record<string, string>): Promise<void> {
  const { error } = await db().rpc(fn, args)
  if (error) throw error
}

/** pending → in_progress, with me as the assignee. */
export const claimRequest = (requestId: string): Promise<void> => call('claim_request', { p_request: requestId })

/** Only the current assignee may hand over. */
export const handOverRequest = (requestId: string, toStaffId: string): Promise<void> =>
  call('hand_over_request', { p_request: requestId, p_to: toStaffId })

/** main_admin only (requests.reassign). */
export const reassignRequest = (requestId: string, toStaffId: string): Promise<void> =>
  call('reassign_request', { p_request: requestId, p_to: toStaffId })
