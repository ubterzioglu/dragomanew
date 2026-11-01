import { Link } from 'react-router-dom'
import { LOCALE_TAG, LOCALES } from '../../i18n/locales'
import type { LocalizedPaths } from '../../i18n/pages'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { getUi } from '../../i18n/ui'

interface LanguageSwitcherProps {
  /** The current page in every language (falls back to each language's home). */
  alternates: LocalizedPaths
}

export function LanguageSwitcher({ alternates }: LanguageSwitcherProps) {
  const current = useLocale()
  const ui = useUi()

  return (
    <nav aria-label={ui.a11y.languageSwitcher}>
      <ul className="flex items-center gap-0.5">
        {LOCALES.map((locale) => {
          const isCurrent = locale === current
          return (
            <li key={locale}>
              <Link
                to={alternates[locale]}
                lang={LOCALE_TAG[locale]}
                hrefLang={LOCALE_TAG[locale]}
                aria-current={isCurrent ? 'true' : undefined}
                className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-md px-1.5 text-sm font-semibold uppercase tracking-wide ${
                  isCurrent ? 'bg-brand-green text-white' : 'text-ink-muted hover:bg-brand-green-soft hover:text-brand-green'
                }`}
              >
                {/* The visible code stays in the accessible name ("TR Türkçe", WCAG 2.5.3). */}
                <span>{locale}</span>
                <span className="sr-only"> {getUi(locale).languageName}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
