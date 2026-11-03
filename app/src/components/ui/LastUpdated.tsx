import { useLocale, useUi } from '../../i18n/LocaleContext'
import { formatDate } from '../../lib/format'

/**
 * The visible "updated on" line of an event or post. Pages render it only for a date someone
 * entered in the panel, so dateModified in the markup claims exactly what readers see (SEO-12).
 */
export function LastUpdated({ date, className }: { date: string; className?: string }) {
  const locale = useLocale()
  const ui = useUi()
  return (
    <p className={className}>
      {ui.pages.updated} <time dateTime={date}>{formatDate(date, locale)}</time>
    </p>
  )
}
