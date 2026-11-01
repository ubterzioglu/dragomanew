import { useUi } from '../../i18n/LocaleContext'
import { jumpToTarget } from '../../lib/inPageLink'

export function SkipLink() {
  const ui = useUi()
  return (
    <a
      href="#main"
      onClick={jumpToTarget}
      className="sr-only z-50 rounded-md bg-brand-green font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-2"
    >
      {ui.a11y.skipToContent}
    </a>
  )
}
