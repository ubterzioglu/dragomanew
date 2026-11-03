import type { SupabaseClient } from '@supabase/supabase-js'
import type { StaffAccountStore } from './types.ts'

/** The real StaffAccountStore: staff_members and Auth admin calls with the service client. */

interface TargetRow {
  id: string
  email: string
  active: boolean
}

export function createStaffAccountStore(db: SupabaseClient): StaffAccountStore {
  return {
    async findTarget(staffId) {
      const { data, error } = await db.from('staff_members').select('id, email, active').eq('id', staffId).maybeSingle<TargetRow>()
      if (error) throw error
      if (!data) return null
      const { data: authUserId, error: lookupError } = await db.rpc('staff_auth_user_id', { p_staff_id: staffId })
      if (lookupError) throw lookupError
      return { ...data, authUserId: typeof authUserId === 'string' ? authUserId : null }
    },

    async createAccount(email, password) {
      // Confirmed at once: confirmed_email() only lets a confirmed address in, and no mail is sent.
      const { error } = await db.auth.admin.createUser({ email, password, email_confirm: true })
      if (!error) return 'created'
      if (error.code === 'email_exists') return 'exists'
      throw error
    },

    async setPassword(authUserId, password) {
      const { error } = await db.auth.admin.updateUserById(authUserId, { password, email_confirm: true })
      if (error) throw error
    },

    async markIssued(staffId, issuedBy, at) {
      const { error, count } = await db
        .from('staff_members')
        .update(
          { password_change_required: true, temp_password_issued_at: at.toISOString(), temp_password_issued_by: issuedBy },
          { count: 'exact' },
        )
        .eq('id', staffId)
      if (error) throw error
      if (count === 0) throw new Error('staff row not found while marking the temporary password')
    },
  }
}
