import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { carryCallbackError } from '../auth/callbackError'
import { gateNotice, redirectFor, SIGN_IN_PATH } from '../auth/gate'
import { deeplUsage, loadMyPermissions } from '../data/content/entries'
import { roleLabel } from '../lib/labels'
import { can, type Permission, type PermissionSubject } from '../lib/permissions'
import type { CurrentStaff } from '../lib/types'
import { useKeyedPromise } from '../lib/useKeyedPromise'
import { useRecheck } from '../lib/useRecheck'
import { DeeplBanner } from './content/DeeplBanner'
import { PageHeading } from './PageHeading'
import { Button, Loading, Notice } from './ui'

/** After a route change, focus the new page's heading so screen readers announce the page. */
function useFocusOnRouteChange(pathname: string): void {
  const previous = useRef<string | null>(null)
  useEffect(() => {
    if (previous.current !== null && previous.current !== pathname) {
      document.querySelector<HTMLElement>('[data-page-heading]')?.focus()
    }
    previous.current = pathname
  }, [pathname])
}

// ---------------------------------------------------------------------------------------------
// Permissions: `my_permissions()` (role + extra_permissions, decided by the database). Until it
// answers, the role mirror in lib/permissions stands in, so the menu does not flash.

const PermissionsContext = createContext<PermissionSubject | null>(null)

const runPermissions = () => loadMyPermissions()
const runUsage = () => deeplUsage()

function PermissionsProvider({ staff, children }: { staff: CurrentStaff | null; children: ReactNode }) {
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

function Header() {
  const { staff, signOut } = useAuth()
  const allowed = useCan()
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-brand-green-soft text-brand-green-dark' : 'text-ink hover:bg-brand-green-soft'}`
  const content = allowed('content.edit') || allowed('content.publish')

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <p className="text-lg font-bold text-brand-green">Dragoman Panel</p>
        {staff && (
          <nav aria-label="Panel menüsü" className="flex flex-wrap gap-1">
            <NavLink to="/" end className={navClass}>
              Talepler
            </NavLink>
            {content && (
              <NavLink to="/icerik" className={navClass}>
                İçerik
              </NavLink>
            )}
            {content && (
              <NavLink to="/medya" className={navClass}>
                Medya
              </NavLink>
            )}
            {(content || allowed('site.deploy')) && (
              <NavLink to="/yayin" className={navClass}>
                Yayın
              </NavLink>
            )}
            {allowed('forms.manage') && (
              <NavLink to="/formlar" className={navClass}>
                Formlar
              </NavLink>
            )}
            {allowed('staff.manage') && (
              <NavLink to="/kullanicilar" className={navClass}>
                Kullanıcılar
              </NavLink>
            )}
          </nav>
        )}
        {staff && (
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span>
              {staff.full_name} <span className="text-ink-muted">({roleLabel(staff.role)})</span>
            </span>
            <Button variant="secondary" onClick={() => void signOut()}>
              Çıkış yap
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

/** The 80 % / 100 % DeepL warning (§2, §9) for people who can translate. */
function QuotaBanner({ staffId }: { staffId: string }) {
  const allowed = useCan()
  const recheck = useRecheck()
  const usage = useKeyedPromise(allowed('content.translate') ? staffId : null, runUsage, String(recheck))
  return usage.status === 'ok' ? <DeeplBanner usage={usage.value} /> : null
}

function GateMessage() {
  const { gate, staffError, reloadStaff, signOut } = useAuth()
  const notice = gateNotice(gate, staffError)
  if (!notice) return <Loading label="Oturum kontrol ediliyor…" />
  return (
    <div className="space-y-4">
      <PageHeading title={notice.title} />
      <Notice tone="error">{notice.text}</Notice>
      <div className="flex gap-3">
        {notice.canRetry && <Button onClick={reloadStaff}>Tekrar dene</Button>}
        <Button variant="secondary" onClick={() => void signOut()}>
          Çıkış yap
        </Button>
      </div>
    </div>
  )
}

/** Layout plus the auth gate: every route renders only when the gate allows it. */
export function Shell() {
  const { gate, staff } = useAuth()
  const { pathname, search, hash } = useLocation()
  useFocusOnRouteChange(pathname)

  const target = redirectFor(gate, pathname)
  // A refused Google sign-in returns to /panel/ with error fields; keep them for the sign-in page.
  if (target === SIGN_IN_PATH) return <Navigate to={{ pathname: target, ...carryCallbackError(search, hash) }} replace />
  if (target) return <Navigate to={target} replace />
  const open = gate === 'sign_in' || gate === 'mfa' || gate === 'ready'
  const ready = gate === 'ready' && staff !== null

  return (
    <PermissionsProvider staff={ready ? staff : null}>
      <div className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
        >
          İçeriğe geç
        </a>
        <Header />
        {ready && <QuotaBanner staffId={staff.id} />}
        <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 outline-none">
          {open ? <Outlet /> : <GateMessage />}
        </main>
      </div>
    </PermissionsProvider>
  )
}
