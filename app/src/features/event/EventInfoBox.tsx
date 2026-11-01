import { CalendarCheck, Clock, MessageCircle } from 'lucide-react'
import type { DragomanEvent } from '../../content/schema'
import { pick } from '../../content/localize'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { formatMoney } from '../../lib/format'
import { jumpToTarget } from '../../lib/inPageLink'
import { siteConfig } from '../../lib/siteConfig'
import { buttonClass } from '../../components/ui/Button'
import { PriceTag } from '../../components/ui/PriceTag'

/** Right-hand box that stays visible while scrolling on desktop (V6 §4.4). */
export function EventInfoBox({ event }: { event: DragomanEvent }) {
  const locale = useLocale()
  const ui = useUi()
  // Options are listed for every multi-option event (with their descriptions); prices only when shown numerically.
  const showOptions = event.options.length > 1
  const showPrices = event.priceDisplay === 'numeric'

  return (
    <div className="space-y-5 rounded-card border border-line bg-white p-6 shadow-sm">
      <h2 className="sr-only">{ui.pages.quickFacts}</h2>
      <PriceTag event={event} />
      {event.duration && (
        <p className="flex items-center gap-2">
          <Clock aria-hidden="true" className="size-5 text-brand-orange" />
          <span className="text-sm text-ink-muted">{ui.pages.duration}{ui.typography.labelSeparator.trimEnd()}</span>
          <span className="font-semibold">{pick(event.duration, locale).value}</span>
        </p>
      )}
      {showOptions && (
        <div>
          <h3 className="text-lg font-semibold">{ui.pages.options}</h3>
          <ul className="mt-2 divide-y divide-line text-sm">
            {event.options.map((option) => (
              <li key={option.id} className="flex justify-between gap-3 py-2">
                <span>
                  {pick(option.name, locale).value}
                  {option.description && <span className="mt-0.5 block text-ink-muted">{pick(option.description, locale).value}</span>}
                </span>
                {showPrices &&
                  (option.price !== null ? (
                    <span className="font-semibold">
                      {formatMoney(option.price, option.currency, locale)} <span className="font-normal text-ink-muted">{ui.price.basis[option.basis]}</span>
                    </span>
                  ) : (
                    <span className="shrink-0 text-ink-muted">{ui.price.onRequest}</span>
                  ))}
              </li>
            ))}
          </ul>
        </div>
      )}
      <a href="#request" onClick={jumpToTarget} className={buttonClass('primary', 'w-full')}>
        <CalendarCheck aria-hidden="true" className="size-5" />
        {ui.actions.requestBooking}
      </a>
      <a href={siteConfig.contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary', 'w-full')}>
        <MessageCircle aria-hidden="true" className="size-5" />
        {ui.actions.whatsapp}
      </a>
      {event.healthForm && <p className="text-sm text-ink-muted">{ui.pages.healthFormNote}</p>}
    </div>
  )
}
