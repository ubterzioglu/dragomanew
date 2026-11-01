import { NavLink } from 'react-router-dom'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath, type LocalizedPaths } from '../../i18n/pages'
import { DesktopNav } from './DesktopNav'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { UTILITY_NAV } from './navItems'

interface HeaderProps {
  alternates: LocalizedPaths
}

/**
 * Desktop: thin utility row (About · Blog · Contact · language) above the main
 * row (logo + five categories). Mobile: logo, language and menu button (V6 §4.1).
 */
export function Header({ alternates }: HeaderProps) {
  const locale = useLocale()
  const ui = useUi()

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="hidden border-b border-line bg-sand lg:block">
        <div className="container-page flex h-10 items-center justify-end gap-6">
          <nav aria-label={ui.a11y.utilityNav}>
            <ul className="flex items-center gap-5 text-sm">
              {UTILITY_NAV.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={localePath(locale, item.page)}
                    className={({ isActive }) =>
                      isActive ? 'font-semibold text-brand-green' : 'text-ink-muted hover:text-brand-green'
                    }
                  >
                    {ui.nav[item.label]}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <LanguageSwitcher alternates={alternates} />
        </div>
      </div>

      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
        <Logo />
        <DesktopNav />
        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher alternates={alternates} />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
