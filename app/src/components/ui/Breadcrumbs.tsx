import { Link } from 'react-router-dom'
import { useUi } from '../../i18n/LocaleContext'

export interface Crumb {
  label: string
  /** Omit for the current page. */
  href?: string
}

export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  const ui = useUi()
  return (
    <nav aria-label={ui.a11y.breadcrumb} className="text-sm text-ink-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link to={item.href} className="hover:text-brand-green hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
