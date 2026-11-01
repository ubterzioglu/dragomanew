import { useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath } from '../../i18n/pages'
import { CATEGORY_NAV, UTILITY_NAV } from './navItems'
import { SiteNavLink } from './SiteNavLink'

const itemClass = ({ isActive }: { isActive: boolean }): string =>
  `block rounded-md px-3 py-3 text-lg ${isActive ? 'bg-brand-green-soft font-semibold text-brand-green' : 'text-ink'}`

export function MobileMenu() {
  const locale = useLocale()
  const ui = useUi()
  const { key: locationKey } = useLocation()
  const [open, setOpen] = useState(false)
  const [openedAt, setOpenedAt] = useState(locationKey)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  // Close after navigating, including a tap on the link for the current page (same pathname, new key).
  // Adjusted during render rather than in an effect, so the open panel never paints on the new page.
  if (openedAt !== locationKey) {
    setOpenedAt(locationKey)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector<HTMLElement>('a')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
        return
      }
      // The opaque panel covers the page, so Tab past its last link returns to the menu button.
      const links = panelRef.current?.querySelectorAll<HTMLElement>('a')
      const last = links?.[links.length - 1]
      if (event.key === 'Tab' && !event.shiftKey && last && document.activeElement === last) {
        event.preventDefault()
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? ui.a11y.closeMenu : ui.a11y.openMenu}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-11 items-center justify-center rounded-md text-ink hover:bg-brand-green-soft"
      >
        {open ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
      </button>

      <div
        ref={panelRef}
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-white px-4 pt-3 pb-28"
      >
        <nav aria-label={ui.a11y.mainNav}>
          <ul className="space-y-1">
            {CATEGORY_NAV.map((item) => (
              <li key={item.label}>
                <SiteNavLink to={localePath(locale, item.page)} className={itemClass} end>
                  {ui.nav[item.label]}
                </SiteNavLink>
                {item.children && (
                  <ul className="ml-4 border-l border-line pl-2">
                    {item.children
                      .filter((child) => child.page !== item.page)
                      .map((child) => (
                        <li key={child.label}>
                          <SiteNavLink to={localePath(locale, child.page)} className={itemClass}>
                            {ui.nav[child.label]}
                          </SiteNavLink>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={ui.a11y.utilityNav} className="mt-4 border-t border-line pt-4">
          <ul className="space-y-1">
            {UTILITY_NAV.map((item) => (
              <li key={item.label}>
                <SiteNavLink to={localePath(locale, item.page)} className={itemClass}>
                  {ui.nav[item.label]}
                </SiteNavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
