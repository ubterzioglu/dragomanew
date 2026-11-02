/**
 * Request rules shared by the site and the submit-request Edge Function. Pure TS with no
 * imports, so the function can run a byte-for-byte copy (scripts/sync-shared.mjs).
 */

export type Currency = 'EUR' | 'TRY'
export type PriceBasis = 'person' | 'group' | 'package'

/** Structural on purpose: content options and database rows both fit. */
export interface PricedOption {
  id: string
  price: number | null
  currency: Currency
  basis: PriceBasis
}

/** The parts of an event that price display needs. */
export interface PricedEvent {
  priceDisplay: 'numeric' | 'on_request'
  options: readonly PricedOption[]
}

/** Head count per option within one event's request (guide §6). */
export type DistributionError =
  | { code: 'invalid_party_size' }
  | { code: 'invalid_count'; optionId: string }
  | { code: 'unknown_option'; optionId: string }
  | { code: 'sum_mismatch' }

interface OptionLike {
  id: string
}

/** Only events with more than one option ask how many people take each. */
export function needsDistribution(options: readonly OptionLike[]): boolean {
  return options.length > 1
}

/**
 * Counts must be whole numbers ≥ 0, belong to this event, and add up to the
 * party size. Zero means "not chosen". The server repeats this against its own options.
 */
export function validateDistribution(
  options: readonly OptionLike[],
  partySize: number,
  counts: Readonly<Record<string, number>>,
): DistributionError[] {
  if (!Number.isInteger(partySize) || partySize < 1) return [{ code: 'invalid_party_size' }]
  if (!needsDistribution(options)) return []

  const known = new Set(options.map((option) => option.id))
  const errors: DistributionError[] = []

  for (const [optionId, count] of Object.entries(counts)) {
    if (!known.has(optionId)) errors.push({ code: 'unknown_option', optionId })
    else if (!Number.isInteger(count) || count < 0) errors.push({ code: 'invalid_count', optionId })
  }
  if (errors.length > 0) return errors

  const sum = Object.values(counts).reduce((total, count) => total + count, 0)
  return sum === partySize ? [] : [{ code: 'sum_mismatch' }]
}

/**
 * Head count per option as the form means it: the distribution when several options are
 * offered, otherwise the whole party on the only option.
 */
export function optionCounts(
  options: readonly OptionLike[],
  partySize: number,
  distribution: Readonly<Record<string, number>> | undefined,
): Readonly<Record<string, number>> {
  if (needsDistribution(options)) return distribution ?? {}
  const only = options[0]
  return only ? { [only.id]: partySize } : {}
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
 * e.g. 2 × 60 EUR + 2 × 45 EUR = 210 EUR. Labelled as an estimate that Dragoman
 * confirms; the server recomputes it from its own prices and never trusts the client's.
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
