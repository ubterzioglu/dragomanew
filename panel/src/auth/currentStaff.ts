import { db } from '../lib/supabase'
import type { CurrentStaff } from '../lib/types'
import { parseLinkedStaffId } from './linkedStaff'

/**
 * Binds the auth user to their staff row on first sign-in. Needs no AAL2, so it runs right after
 * sign-in and a non-staff account is turned away before TOTP enrolment. Null: not active staff.
 */
export async function linkStaffAccount(): Promise<string | null> {
  const { data, error } = await db().rpc('link_staff_account')
  if (error) throw error
  return parseLinkedStaffId(data)
}

/**
 * Reads the caller's own row (AAL2). Clients may read only id, full_name, role and active, so
 * extra_permissions stay unknown here and the role alone decides which actions are offered.
 */
export async function loadStaffRow(staffId: string): Promise<CurrentStaff | null> {
  const { data, error } = await db()
    .from('staff_members')
    .select('id, full_name, role, active')
    .eq('id', staffId)
    .maybeSingle<CurrentStaff>()
  if (error) throw error
  return data && data.active ? data : null
}
