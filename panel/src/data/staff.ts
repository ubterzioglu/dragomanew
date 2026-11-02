import { CodedError } from '../lib/errors'
import type { NewStaffRow } from '../lib/staffForm'
import { db } from '../lib/supabase'
import type { StaffAdminRow, StaffMember, StaffRole } from '../lib/types'

/** Every active staff member may read these columns (names in activity, the hand-over list). */
export async function listStaffDirectory(): Promise<StaffMember[]> {
  const { data, error } = await db()
    .from('staff_members')
    .select('id, full_name, role, active')
    .order('full_name', { ascending: true })
  if (error) throw error
  return (data ?? []) as StaffMember[]
}

/**
 * The users page. The table hides e-mail from clients, so full rows come from the
 * `list_staff_members()` RPC, which refuses anyone without staff.manage (active first, then name).
 */
export async function listStaffAdmin(): Promise<StaffAdminRow[]> {
  const { data, error } = await db().rpc('list_staff_members')
  if (error) throw error
  return (data ?? []) as StaffAdminRow[]
}

/** No `.select()` after insert, so the write needs no extra read privilege. */
export async function addStaff(row: NewStaffRow): Promise<void> {
  const { error } = await db().from('staff_members').insert(row)
  if (error) throw error
}

export type StaffPatch = { role: StaffRole } | { active: boolean }

/**
 * An update that RLS filters out changes nothing and reports no error, so the row count is checked
 * and a zero count surfaces as "not found or not allowed".
 */
export async function updateStaff(id: string, patch: StaffPatch): Promise<void> {
  const { error, count } = await db().from('staff_members').update(patch, { count: 'exact' }).eq('id', id)
  if (error) throw error
  if (count === 0) throw new CodedError('PGRST116')
}
