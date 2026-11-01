import { Link } from 'react-router-dom'
import { CalendarCheck, Mail, MessageCircle } from 'lucide-react'
import type { PageCta } from '../../app/routeHandle'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath } from '../../i18n/pages'
import { jumpToTarget } from '../../lib/inPageLink'
import { siteConfig } from '../../lib/siteConfig'

interface MobileActionBarProps {
  cta: PageCta
}

const buttonBase =
  'inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold'

/**
 * Fixed bottom bar on phones: WhatsApp plus the action that fits the page
 * (V6 §4.1). The layout reserves bottom padding so it never covers content.
 */
export function MobileActionBar({ cta }: MobileActionBarProps) {
  const locale = useLocale()
  const ui = useUi()

  const secondary =
    cta === 'request' ? (
      <a href="#request" onClick={jumpToTarget} className={`${buttonBase} border border-brand-green text-brand-green`}>
        <CalendarCheck aria-hidden="true" className="size-5" />
        {ui.actions.requestBooking}
      </a>
    ) : cta === 'transport' ? (
      <a href="#transport-request" onClick={jumpToTarget} className={`${buttonBase} border border-brand-green text-brand-green`}>
        <CalendarCheck aria-hidden="true" className="size-5" />
        {ui.actions.requestTransfer}
      </a>
    ) : (
      <Link to={localePath(locale, 'contact')} className={`${buttonBase} border border-brand-green text-brand-green`}>
        <Mail aria-hidden="true" className="size-5" />
        {ui.actions.contactUs}
      </Link>
    )

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="flex gap-2">
        <a
          href={siteConfig.contact.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonBase} bg-brand-green text-white`}
        >
          <MessageCircle aria-hidden="true" className="size-5" />
          {ui.actions.whatsapp}
        </a>
        {secondary}
      </div>
    </div>
  )
}
