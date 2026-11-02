import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { loadMyPermissions } from '../data/content/entries'
import { can, type Permission, type PermissionSubject } from '../lib/permissions'
import type { CurrentStaff } from '../lib/types'
import { useKeyedPromise } from '../lib/useKeyedPromise'
import { useRecheck } from '../lib/useRecheck'

// Permissions: `my_permissions()` (role + extra_permissions, decided by the database). Until it
// answers, the role mirror in lib/permissions stands in, so the menu does not flash.

const PermissionsContext = createContext<PermissionSubject | null>(null)

const runPermissions = () => loadMyPermissions()

export function PermissionsProvider({ staff, children }: { staff: CurrentStaff | null; children: ReactNode }) {
  const { session } = useAuth()
  const recheck = useRecheck()
  const key = staff && session ? `${staff.id}#${session.user.id}` : null
  const loaded = useKeyedPromise(key, runPermissions, `${recheck}:${session?.access_token ?? ''}`)
  const permissions = loaded.status === 'ok' ? loaded.value : undefined
  const subject = useMemo<PermissionSubject | null>(
    () => (staff ? { ...staff, ...(permissions ? { permissions } : {}) } : null),
    [staff, permissions],
  )
  return <PermissionsContext.Provider value={subject}>{children}</PermissionsContext.Provider>
}

/** For screens behind the "ready" gate: does the signed-in person hold this permission? */
export function useCan(): (permission: Permission) => boolean {
  const subject = useContext(PermissionsContext)
  return (permission) => can(subject, permission)
}
