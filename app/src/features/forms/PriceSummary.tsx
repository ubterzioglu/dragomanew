import type { DragomanEvent } from '../../content/schema'
import { pick } from '../../content/localize'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { formatMoney } from '../../lib/format'
import { requestSummary } from '../../lib/price'

interface PriceSummaryProps {
  event: DragomanEvent
  counts: Readonly<Record<string, number>>
}

/** Live "2 × €60 + 2 × €45 = €210" estimate (guide §6); never a payment or final price. */
export function PriceSummary({ event, counts }: PriceSummaryProps) {
  const locale = useLocale()
  const ui = useUi()
  const summary = requestSummary(event, counts)

  if (summary.kind === 'on_request' || summary.kind === 'empty') return null

  return (
    <div aria-live="polite" className="rounded-card bg-brand-green-soft p-4">
      <p className="font-semibold text-brand-green">{ui.forms.summaryTitle}</p>
      {summary.kind === 'total' ? (
        <>
          <ul className="mt-2 space-y-1 text-ink">
            {summary.lines.map((line) => {
              const option = event.options.find((o) => o.id === line.optionId)
              const name = option ? pick(option.name, locale).value : line.optionId
              return (
                <li key={line.optionId} className="flex justify-between gap-4">
                  <span>
                    {line.quantity} × {name} ({formatMoney(line.unitPrice, summary.currency, locale)})
                  </span>
                  <span>{formatMoney(line.subtotal, summary.currency, locale)}</span>
                </li>
              )
            })}
          </ul>
          <p className="mt-2 flex justify-between border-t border-brand-green/20 pt-2 text-lg font-bold">
            <span>=</span>
            <span>{formatMoney(summary.total, summary.currency, locale)}</span>
          </p>
        </>
      ) : (
        <p className="mt-2 text-ink">{summary.kind === 'unpriced' ? ui.forms.summaryUnpriced : ui.forms.summaryNotCombinable}</p>
      )}
      <p className="mt-2 text-sm text-ink-muted">{ui.forms.summaryNote}</p>
    </div>
  )
}
