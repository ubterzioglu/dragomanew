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
 * party size. Zero means "not chosen". The server repeats this in Stage B.
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
