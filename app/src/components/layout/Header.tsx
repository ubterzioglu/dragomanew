import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath, type LocalizedPaths } from '../../i18n/pages'
import { DesktopNav } from './DesktopNav'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { UTILITY_NAV } from './navItems'
import { SiteNavLink } from './SiteNavLink'

interface HeaderProps {
  alternates: LocalizedPaths
}

/**
 * One row (UBT, 01.11.2026). From xl: logo, the five categories, About · Blog · Contact and the
 * language switch — the longest labels (French) need 1280px. Narrower: logo, language and menu
 * button (V6 §4.1).
 */
export function Header({ alternates }: HeaderProps) {
  const locale = useLocale()
  const ui = useUi()

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="container-page flex h-16 items-center justify-between gap-4 xl:h-20">
        <Logo />
        <div className="hidden items-center gap-4 xl:flex">
          <DesktopNav />
          <nav aria-label={ui.a11y.utilityNav} className="border-l border-line pl-4">
            <ul className="flex items-center gap-4 whitespace-nowrap text-sm">
              {UTILITY_NAV.map((item) => (
                <li key={item.label}>
                  <SiteNavLink
                    to={localePath(locale, item.page)}
                    className={({ isActive }) =>
                      isActive ? 'font-semibold text-brand-green' : 'text-ink-muted hover:text-brand-green'
                    }
                  >
                    {ui.nav[item.label]}
                  </SiteNavLink>
                </li>
              ))}
            </ul>
          </nav>
          <LanguageSwitcher alternates={alternates} />
        </div>
        <div className="flex items-center gap-1 xl:hidden">
          <LanguageSwitcher alternates={alternates} />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
