import type { Session } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { friendlyError } from '../lib/errors'
import { db } from '../lib/supabase'
import type { CurrentStaff } from '../lib/types'
import { useKeyedPromise } from '../lib/useKeyedPromise'
import { useRecheck } from '../lib/useRecheck'
import { readTokenClaims, sessionScope } from './claims'
import { linkStaffAccount, loadStaffRow } from './currentStaff'
import { gateFor, type Gate } from './gate'
import { lookupOf, staffLookup } from './staffLookup'

interface AuthValue {
  gate: Gate
  session: Session | null
  staff: CurrentStaff | null
  /** Friendly Turkish message when linking or reading the staff row failed. */
  staffError: string | null
  reloadStaff: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

const runLink = () => linkStaffAccount()
const runStaff = (key: string) => loadStaffRow(key.split('#')[0] ?? '')

/**
 * Holds the session, its assurance level and the staff row. The level is read from the current
 * token, so it can never lag behind or outlive it. Link and staff lookups are keyed by the sign-in
 * (user plus the token's session id), so a token refresh never blanks the open page, while a
 * sign-out and a new sign-in never reuse the last session's answers. The staff row is still read
 * again on every refresh and re-check (see staffLookup), so a deactivation reaches an open panel.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialised, setInitialised] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [retry, setRetry] = useState(0)
  const recheck = useRecheck()

  useEffect(() => {
    // Fires INITIAL_SESSION first, so no separate getSession() is needed.
    const { data } = db().auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setInitialised(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const token = session?.access_token ?? null
  const userId = session?.user.id ?? null
  const level = token ? readTokenClaims(token).level : null
  const scope = token && userId ? sessionScope(userId, token) : null

  const link = useKeyedPromise(scope ? `${scope}#${retry}` : null, runLink)
  const staffId = link.status === 'ok' ? link.value : null
  const lookup = staffLookup({ level, staffId, scope, retry, token, recheck })
  const staffRow = useKeyedPromise(lookup?.key ?? null, runStaff, lookup?.revision)

  const gate = gateFor({
    loading: !initialised,
    signedIn: token !== null,
    aal: level,
    link: lookupOf(link),
    staff: lookupOf(staffRow),
  })

  const failure = link.status === 'error' ? link.error : staffRow.status === 'error' ? staffRow.error : null
  const staffError = failure === null ? null : friendlyError(failure)
  const staff = staffRow.status === 'ok' ? staffRow.value : null

  const reloadStaff = useCallback(() => setRetry((value) => value + 1), [])
  const signOut = useCallback(async () => {
    await db().auth.signOut()
  }, [])

  const value = useMemo<AuthValue>(
    () => ({ gate, session, staff, staffError, reloadStaff, signOut }),
    [gate, session, staff, staffError, reloadStaff, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}

/** For screens behind the "ready" gate, where the staff row is known. */
export function useStaff(): CurrentStaff {
  const { staff } = useAuth()
  if (!staff) throw new Error('useStaff must be used behind the staff gate')
  return staff
}
