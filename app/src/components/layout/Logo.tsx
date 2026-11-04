import { Link } from 'react-router-dom'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath } from '../../i18n/pages'

interface LogoProps {
  className?: string
}

/**
 * The logo carries the "diving & outdoors" line under the wordmark (UBT, 04.11.2026), so it is taller
 * for its width than the old one; these heights keep the wordmark about as large as before.
 */
export function Logo({ className = 'h-11 w-auto md:h-12 xl:h-14' }: LogoProps) {
  const locale = useLocale()
  const ui = useUi()
  return (
    <Link to={localePath(locale, 'home')} className="inline-flex shrink-0 items-center" aria-label={`Dragoman — ${ui.nav.home}`}>
      <img
        src="/brand/dragoman-logo-240.webp"
        srcSet="/brand/dragoman-logo-240.webp 240w, /brand/dragoman-logo-480.webp 480w"
        sizes="92px"
        width={240}
        height={147}
        alt=""
        className={className}
      />
    </Link>
  )
}
