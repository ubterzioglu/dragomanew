import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { loadMyPermissions } from '../data/content/entries'
import { withLastAnswer } from '../lib/lastAnswer'
import { can, type Permission, type PermissionSubject } from '../lib/permissions'
import type { CurrentStaff } from '../lib/types'
import { useKeyedPromise } from '../lib/useKeyedPromise'
import { useRecheck } from '../lib/useRecheck'
import { Button, Loading, Notice } from './ui'

// Permissions: `my_permissions()` (role + extra_permissions, decided by the database). Until it
// answers, the role mirror in lib/permissions stands in, so the menu does not flash. A failed
// recheck keeps the last answer, so extra permissions never vanish from a screen mid-work.

const PermissionsContext = createContext<PermissionSubject | null>(null)

interface PermissionsState {
  /** pending: no answer yet; failed: no answer for this sign-in at all. Either way only the role is known. */
  status: 'pending' | 'ready' | 'failed'
  retry: () => void
}

const StateContext = createContext<PermissionsState>({ status: 'ready', retry: () => {} })

const runPermissions = withLastAnswer(() => loadMyPermissions())

export function PermissionsProvider({ staff, children }: { staff: CurrentStaff | null; children: ReactNode }) {
  const { session } = useAuth()
  const recheck = useRecheck()
  // A retry is a new key, so it shows as pending (Loading) instead of leaving the old failure up.
  const [attempt, setAttempt] = useState(0)
  const key = staff && session ? `${staff.id}#${session.user.id}#${attempt}` : null
  const loaded = useKeyedPromise(key, runPermissions, `${recheck}:${session?.access_token ?? ''}`)
  const permissions = loaded.status === 'ok' ? loaded.value : undefined
  const subject = useMemo<PermissionSubject | null>(
    () => (staff ? { ...staff, ...(permissions ? { permissions } : {}) } : null),
    [staff, permissions],
  )
  const retry = useCallback(() => setAttempt((count) => count + 1), [])
  const status = loaded.status === 'pending' ? 'pending' : loaded.status === 'error' ? 'failed' : 'ready'
  const state = useMemo<PermissionsState>(() => ({ status, retry }), [status, retry])
  return (
    <PermissionsContext.Provider value={subject}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </PermissionsContext.Provider>
  )
}

/**
 * Wraps a screen's "no access" view. Until my_permissions() answers only the role decides, so
 * someone with the permission as an extra would see the refusal flash or be sent away; if it never
 * answered, the refusal may be wrong, so offer a retry instead.
 */
export function AccessDenied({ children }: { children: ReactNode }) {
  const { status, retry } = useContext(StateContext)
  if (status === 'pending') return <Loading label="Yetkiler kontrol ediliyor…" />
  if (status === 'failed') {
    return (
      <div className="space-y-3">
        <Notice tone="error">Yetkileriniz okunamadı, bu yüzden bu ekranı açıp açamayacağınız bilinmiyor.</Notice>
        <Button variant="secondary" onClick={retry}>
          Tekrar dene
        </Button>
      </div>
    )
  }
  return children
}

/** For screens behind the "ready" gate: does the signed-in person hold this permission? */
export function useCan(): (permission: Permission) => boolean {
  const subject = useContext(PermissionsContext)
  return (permission) => can(subject, permission)
}
