import type { Currency, PriceBasis, PricedEvent } from '../shared/requests/rules.ts'

/**
 * Card price lives here because only the site shows it; the request summary lives in
 * src/shared/requests/rules.ts so the server recomputes it with the same code.
 */
export {
  requestSummary,
  type PricedEvent,
  type PricedOption,
  type RequestSummary,
  type SummaryLine,
} from '../shared/requests/rules.ts'

export type CardPrice =
  | { kind: 'on_request' }
  | { kind: 'none' }
  /** Options exist but cannot be compared (mixed currency or basis). */
  | { kind: 'see_details' }
  | { kind: 'single' | 'from'; amount: number; currency: Currency; basis: PriceBasis }

/**
 * Category card price (V6 §4.3): "from" the lowest offered price when options
 * share a currency and basis. Unknown prices are skipped, never read as zero.
 */
export function cardPrice(event: PricedEvent): CardPrice {
  if (event.priceDisplay === 'on_request') return { kind: 'on_request' }

  const priced = event.options.filter((option) => option.price !== null)
  const first = priced[0]
  if (!first || first.price === null) return { kind: 'none' }

  const comparable = priced.every((option) => option.currency === first.currency && option.basis === first.basis)
  if (!comparable) return { kind: 'see_details' }

  const amount = Math.min(...priced.map((option) => option.price ?? Number.POSITIVE_INFINITY))
  // Any other offered option (even one without a price yet) makes this a "from" price.
  const kind = event.options.length > 1 ? 'from' : 'single'
  return { kind, amount, currency: first.currency, basis: first.basis }
}
