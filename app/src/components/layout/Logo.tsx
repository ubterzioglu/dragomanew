import { Link } from 'react-router-dom'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath } from '../../i18n/pages'

interface LogoProps {
  className?: string
}

export function Logo({ className = 'h-9 w-auto md:h-11' }: LogoProps) {
  const locale = useLocale()
  const ui = useUi()
  return (
    <Link to={localePath(locale, 'home')} className="inline-flex shrink-0 items-center" aria-label={`Dragoman — ${ui.nav.home}`}>
      <img
        src="/brand/dragoman-logo-240.webp"
        srcSet="/brand/dragoman-logo-240.webp 240w, /brand/dragoman-logo-480.webp 480w"
        sizes="120px"
        width={240}
        height={104}
        alt=""
        className={className}
      />
    </Link>
  )
}
