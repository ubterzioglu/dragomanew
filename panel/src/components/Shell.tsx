import { useEffect, useRef } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { carryCallbackError } from '../auth/callbackError'
import { gateNotice, redirectFor, SIGN_IN_PATH } from '../auth/gate'
import { roleLabel } from '../lib/labels'
import { can } from '../lib/permissions'
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

function Header() {
  const { staff, signOut } = useAuth()
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-brand-green-soft text-brand-green-dark' : 'text-ink hover:bg-brand-green-soft'}`

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <p className="text-lg font-bold text-brand-green">Dragoman Panel</p>
        {staff && (
          <nav aria-label="Panel menüsü" className="flex gap-1">
            <NavLink to="/" end className={navClass}>
              Talepler
            </NavLink>
            {can(staff, 'staff.manage') && (
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
  const { gate } = useAuth()
  const { pathname, search, hash } = useLocation()
  useFocusOnRouteChange(pathname)

  const target = redirectFor(gate, pathname)
  // A refused Google sign-in returns to /panel/ with error fields; keep them for the sign-in page.
  if (target === SIGN_IN_PATH) return <Navigate to={{ pathname: target, ...carryCallbackError(search, hash) }} replace />
  if (target) return <Navigate to={target} replace />
  const open = gate === 'sign_in' || gate === 'mfa' || gate === 'ready'

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
      >
        İçeriğe geç
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 outline-none">
        {open ? <Outlet /> : <GateMessage />}
      </main>
    </div>
  )
}
