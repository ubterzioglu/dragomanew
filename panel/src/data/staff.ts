import { FunctionCallError } from '../lib/content/messages'
import { CodedError } from '../lib/errors'
import { parseIssuedPassword, type IssuedPassword } from '../lib/staffAccount'
import type { NewStaffRow } from '../lib/staffForm'
import { db } from '../lib/supabase'
import { callFunction } from './content/functions'
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

/** Returns the new row's id (staff may read `id`), so a temporary password can follow. */
export async function addStaff(row: NewStaffRow): Promise<string> {
  const { data, error } = await db().from('staff_members').insert(row).select('id').single<{ id: string }>()
  if (error) throw error
  return data.id
}

/**
 * staff-account Edge Function (staff.manage): opens or updates the person's sign-in account with a
 * new temporary password and returns it once.
 */
export async function issueTemporaryPassword(staffId: string): Promise<IssuedPassword> {
  const answer = await callFunction<unknown>('staff-account', { staffId })
  const issued = parseIssuedPassword(answer)
  if (!issued) throw new FunctionCallError(200, 'server', {})
  return issued
}

/** After the person set their own password: lift the "Şifre first" flag on their own row. */
export async function finishPasswordChange(): Promise<void> {
  const { error } = await db().rpc('finish_password_change')
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
