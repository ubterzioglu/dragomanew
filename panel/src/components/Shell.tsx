import { useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { carryCallbackError } from '../auth/callbackError'
import { gateNotice, passwordRedirect, redirectFor, SIGN_IN_PATH } from '../auth/gate'
import { deeplUsage } from '../data/content/entries'
import { useKeyedPromise } from '../lib/useKeyedPromise'
import { useRecheck } from '../lib/useRecheck'
import { DeeplBanner } from './content/DeeplBanner'
import { MobileNav } from './nav/MobileNav'
import { Brand } from './nav/NavMenu'
import { Sidebar } from './nav/Sidebar'
import { TopBar } from './nav/TopBar'
import { PageHeading } from './PageHeading'
import { PermissionsProvider, useCan } from './permissionsContext'
import { Button, Loading, Notice } from './ui'

// Screens import useCan from here; it lives in permissionsContext so the menu can use it too.
export { AccessDenied, useCan } from './permissionsContext'

/** After a route change, focus the new page's heading so screen readers announce the page. */
function useFocusOnRouteChange(pathname: string): void {
  const previous = useRef<string | null>(null)
  useEffect(() => {
    if (previous.current !== null && previous.current !== pathname) {
      document.querySelector<HTMLElement>('[data-page-heading]')?.focus({ preventScroll: true })
      if (!window.location.hash) window.scrollTo({ top: 0 })
    }
    previous.current = pathname
  }, [pathname])
}

const runUsage = () => deeplUsage()

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

/** Signed out or not let in yet: no menu, just the name above the page. */
function PlainHeader() {
  return (
    <header className="border-b border-line bg-sidebar">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <Brand />
      </div>
    </header>
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
  const open = gate === 'sign_in' || gate === 'ready'
  const ready = gate === 'ready' && staff !== null
  const mustChange = ready ? passwordRedirect(staff.password_change_required === true, pathname) : null
  if (mustChange) return <Navigate to={mustChange} replace />

  return (
    <PermissionsProvider staff={ready ? staff : null}>
      <div className="min-h-dvh lg:flex">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
        >
          İçeriğe geç
        </a>
        {ready ? (
          <>
            <Sidebar />
            <MobileNav />
          </>
        ) : (
          <PlainHeader />
        )}
        <div className="min-w-0 flex-1">
          {ready && <TopBar />}
          {ready && <QuotaBanner staffId={staff.id} />}
          <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 outline-none sm:px-6 lg:px-10 lg:py-10">
            {open ? <Outlet /> : <GateMessage />}
          </main>
        </div>
      </div>
    </PermissionsProvider>
  )
}
