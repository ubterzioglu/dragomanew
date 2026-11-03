import { ExternalLink, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useLocation } from 'react-router'
import { SITE_HOME, Slogan } from './branding'
import { Brand, NavLinks, UserBox } from './NavMenu'

/**
 * Below lg: a top bar with a menu button; the menu opens as a drawer from the left on the native
 * modal <dialog>, which keeps focus inside and makes the page behind it inert. Escape, a click
 * outside and following a link close it; focus goes back to the menu button.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    else if (!open && element.open) element.close()
  }, [open])

  // A route change (also via back/forward) closes the drawer.
  const [shownFor, setShownFor] = useState(pathname)
  if (shownFor !== pathname) {
    setShownFor(pathname)
    if (open) setOpen(false)
  }

  const close = () => setOpen(false)
  const onDialogClose = () => {
    setOpen(false)
    button.current?.focus()
  }
  // The dialog box itself is only hit outside the panel (its content fills the drawer).
  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close()
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-sidebar/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <Brand />
        <button
          ref={button}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menüyü aç"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex size-10 items-center justify-center rounded-lg border border-line bg-white text-ink shadow-xs"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </header>
      <dialog
        id="mobile-menu"
        ref={dialog}
        aria-label="Panel menüsü"
        onClose={onDialogClose}
        onClick={onDialogClick}
        className="m-0 h-dvh max-h-none w-80 max-w-[85vw] border-0 bg-transparent p-0 backdrop:bg-ink/40 lg:hidden"
      >
        {open && (
          <div className="flex h-full flex-col bg-sidebar shadow-lift">
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <Brand onNavigate={close} />
              <button
                type="button"
                onClick={close}
                aria-label="Menüyü kapat"
                className="flex size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-brand-green-soft hover:text-brand-green-dark"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <NavLinks onNavigate={close} />
            <div className="space-y-2 border-t border-line px-6 py-3">
              <Slogan tone="light" className="text-sm" />
              <a
                href={SITE_HOME}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-sea underline-offset-2 hover:underline"
              >
                Siteyi aç
                <ExternalLink aria-hidden="true" className="size-3.5" />
                <span className="sr-only">(yeni sekmede açılır)</span>
              </a>
            </div>
            <UserBox onNavigate={close} />
          </div>
        )}
      </dialog>
    </>
  )
}
