import type { Keyed } from '../lib/useKeyedPromise'
import type { Level } from './claims'
import type { Lookup } from './gate'

export interface StaffLookupInput {
  level: Level | null
  /** From link_staff_account(). */
  staffId: string | null
  /** sessionScope(): one sign-in. */
  scope: string | null
  /** Bumped by "Tekrar dene". */
  retry: number
  /** The access token; every refresh replaces it. */
  token: string | null
  /** Bumped when the tab is shown again and on a timer. */
  recheck: number
}

export interface StaffLookup {
  /** One sign-in plus a retry. runStaff reads the staff id from the first `#` segment. */
  key: string
  /** A new revision reads the row again while the last answer for the key stays on screen. */
  revision: string
}

/**
 * The staff row lookup at AAL2. RLS re-checks `active` on every query, so a deactivated person's
 * reads quietly return nothing; re-reading the row on each token refresh and re-check lets the
 * open panel notice and switch to "Erişim yok" (or pick up a new role) without blanking meanwhile.
 */
export function staffLookup({ level, staffId, scope, retry, token, recheck }: StaffLookupInput): StaffLookup | null {
  if (level !== 'aal2' || !staffId || !scope || !token) return null
  return { key: `${staffId}#${scope}#${retry}`, revision: `${recheck}:${token}` }
}

/** What the gate makes of a lookup: an empty answer means the account is not (or no longer) staff. */
export function lookupOf<T>(result: Keyed<T | null>): Lookup {
  if (result.status === 'ok') return result.value ? 'ready' : 'missing'
  return result.status === 'error' ? 'error' : 'unknown'
}
