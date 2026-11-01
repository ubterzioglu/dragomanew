import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath } from '../../i18n/pages'
import { formatTemplate } from '../../i18n/ui'
import { CATEGORY_NAV, type NavItem } from './navItems'

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  `inline-flex min-h-11 items-center px-3 font-display text-lg font-semibold uppercase tracking-wide transition-colors ${
    isActive ? 'text-brand-green' : 'text-ink hover:text-brand-green'
  }`

function NavDropdown({ item }: { item: NavItem }) {
  const locale = useLocale()
  const ui = useUi()
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  const closeOnEscape = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.key === 'Escape' && open) {
      setOpen(false)
      buttonRef.current?.focus()
    }
  }
  // A menu opened by hovering must also close on Escape while focus is elsewhere (WCAG 1.4.13).
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])
  const closeWhenFocusLeaves = (event: FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }

  return (
    <li
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={closeOnEscape}
      onBlur={closeWhenFocusLeaves}
    >
      <NavLink to={localePath(locale, item.page)} className={linkClass}>
        {ui.nav[item.label]}
      </NavLink>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={formatTemplate(ui.a11y.submenu, { label: ui.nav[item.label] })}
        onClick={() => setOpen((value) => !value)}
        className="-ml-2 inline-flex min-h-11 min-w-8 items-center justify-center text-ink-muted hover:text-brand-green"
      >
        <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <ul
        id={menuId}
        hidden={!open}
        className="absolute top-full left-0 z-40 min-w-64 rounded-card border border-line bg-white py-2 shadow-lg"
      >
        {item.children?.map((child) => (
          <li key={child.label}>
            <NavLink
              to={localePath(locale, child.page)}
              end
              className="block px-4 py-2.5 text-base text-ink hover:bg-brand-green-soft hover:text-brand-green"
            >
              {ui.nav[child.label]}
            </NavLink>
          </li>
        ))}
      </ul>
    </li>
  )
}

export function DesktopNav() {
  const locale = useLocale()
  const ui = useUi()
  return (
    <nav aria-label={ui.a11y.mainNav} className="hidden lg:block">
      <ul className="flex items-center">
        {CATEGORY_NAV.map((item) =>
          item.children ? (
            <NavDropdown key={item.label} item={item} />
          ) : (
            <li key={item.label}>
              <NavLink to={localePath(locale, item.page)} className={linkClass}>
                {ui.nav[item.label]}
              </NavLink>
            </li>
          ),
        )}
      </ul>
    </nav>
  )
}
