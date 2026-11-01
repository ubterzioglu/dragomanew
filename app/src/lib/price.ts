import type { EventOption } from '../content/schema'

/** The parts of an event that price display needs. */
export interface PricedEvent {
  priceDisplay: 'numeric' | 'on_request'
  options: ReadonlyArray<Pick<EventOption, 'id' | 'price' | 'currency' | 'basis'>>
}

type Currency = EventOption['currency']
type Basis = EventOption['basis']

export type CardPrice =
  | { kind: 'on_request' }
  | { kind: 'none' }
  /** Options exist but cannot be compared (mixed currency or basis). */
  | { kind: 'see_details' }
  | { kind: 'single' | 'from'; amount: number; currency: Currency; basis: Basis }

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

export interface SummaryLine {
  optionId: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type RequestSummary =
  | { kind: 'on_request' }
  | { kind: 'empty' }
  /** A chosen option has no known price: no total is shown. */
  | { kind: 'unpriced' }
  /** Different currencies or non per-person prices are never added together. */
  | { kind: 'not_combinable' }
  | { kind: 'total'; currency: Currency; total: number; lines: SummaryLine[] }

const toCents = (amount: number): number => Math.round(amount * 100)

/**
 * Request-time price summary (guide §6): quantity × unit price per option,
 * e.g. 2 × 60 EUR + 2 × 45 EUR = 210 EUR. Labelled in the UI as an estimate
 * that Dragoman confirms; the server recomputes it in Stage B.
 */
export function requestSummary(event: PricedEvent, counts: Readonly<Record<string, number>>): RequestSummary {
  if (event.priceDisplay === 'on_request') return { kind: 'on_request' }

  const chosen = event.options
    .map((option) => ({ option, quantity: counts[option.id] ?? 0 }))
    .filter(({ quantity }) => Number.isInteger(quantity) && quantity > 0)
  if (chosen.length === 0) return { kind: 'empty' }

  if (chosen.some(({ option }) => option.price === null)) return { kind: 'unpriced' }

  const currency = chosen[0]?.option.currency
  const combinable =
    currency !== undefined &&
    chosen.every(({ option }) => option.currency === currency && option.basis === 'person')
  if (!combinable) return { kind: 'not_combinable' }

  const lines = chosen.map(({ option, quantity }) => {
    const unitPrice = option.price ?? 0
    return { optionId: option.id, quantity, unitPrice, subtotal: (toCents(unitPrice) * quantity) / 100 }
  })
  const total = lines.reduce((sum, line) => sum + toCents(line.subtotal), 0) / 100
  return { kind: 'total', currency, total, lines }
}
