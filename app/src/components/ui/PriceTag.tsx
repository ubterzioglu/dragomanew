import { useLocale, useUi } from '../../i18n/LocaleContext'
import { formatTemplate } from '../../i18n/ui'
import { formatMoney } from '../../lib/format'
import { cardPrice, type PricedEvent } from '../../lib/price'
import { Badge } from './Badge'

interface PriceTagProps {
  event: PricedEvent
  /** Old-site prices are never assumed current (V6 §5); show the sample note. */
  showUnverified?: boolean
  className?: string
}

/** Card/info-box price: "From €45 per person", "Price on request", or nothing. */
export function PriceTag({ event, showUnverified = true, className = '' }: PriceTagProps) {
  const locale = useLocale()
  const ui = useUi()
  const price = cardPrice(event)

  if (price.kind === 'none') return null
  if (price.kind === 'on_request') {
    return <p className={`font-semibold text-brand-green ${className}`}>{ui.price.onRequest}</p>
  }
  if (price.kind === 'see_details') {
    return <p className={`text-sm text-ink-muted ${className}`}>{ui.price.seeDetails}</p>
  }

  const money = formatMoney(price.amount, price.currency, locale)
  const label = price.kind === 'from' ? formatTemplate(ui.price.from, { price: money }) : money
  return (
    <div className={className}>
      <p>
        <span className="font-display text-2xl font-bold text-brand-green">{label}</span>{' '}
        <span className="text-sm text-ink-muted">{ui.price.basis[price.basis]}</span>
      </p>
      {showUnverified && (
        <Badge tone="sample" className="mt-1">
          {ui.sample.priceUnverified}
        </Badge>
      )}
    </div>
  )
}
