import type { StaffVerifier } from '../_shared/auth/staff.ts'
import type { RandomFill } from './password.ts'

/** What handleStaffAccount needs from the outside world; everything is injected so vitest can run it. */

/** The staff row a temporary password is issued for. */
export interface StaffTarget {
  id: string
  email: string
  active: boolean
  /** The Auth user behind the row (bound, or found by address before the first sign-in); null when none. */
  authUserId: string | null
}

export interface StaffAccountStore {
  /** The row with its Auth user, or null when there is no such row. */
  findTarget(staffId: string): Promise<StaffTarget | null>
  /** Creates a confirmed Auth user; 'exists' when the address is already taken. */
  createAccount(email: string, password: string): Promise<'created' | 'exists'>
  /** Replaces the password of an existing Auth user and marks the address confirmed. */
  setPassword(authUserId: string, password: string): Promise<void>
  /** Sets password_change_required and stamps who issued it and when. */
  markIssued(staffId: string, issuedBy: string, at: Date): Promise<void>
}

export interface StaffAccountDeps {
  store: StaffAccountStore
  auth: StaffVerifier
  allowedOrigins: readonly string[]
  clock: () => Date
  random?: RandomFill
  reportError?: (context: string, error: unknown) => void
}
