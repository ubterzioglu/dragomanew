/** Below this, the crop is too small to change which srcset candidate is picked. */
const MIN_FACTOR = 1.02

/** Splits a sizes list on commas that are not inside parentheses. */
function splitEntries(sizes: string): string[] {
  const entries: string[] = []
  let depth = 0
  let current = ''
  for (const char of sizes) {
    if (char === '(') depth++
    if (char === ')') depth--
    if (char === ',' && depth === 0) {
      entries.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  if (current.trim()) entries.push(current.trim())
  return entries
}

/** Splits an entry into its media condition ('' when absent) and its length, the last top-level token. */
function splitLength(entry: string): { condition: string; length: string } {
  let start = entry.lastIndexOf(' ') + 1
  if (entry.endsWith(')')) {
    let depth = 0
    for (let i = entry.length - 1; i >= 0; i--) {
      if (entry[i] === ')') depth++
      if (entry[i] === '(') depth--
      if (depth === 0) {
        start = i
        break
      }
    }
    while (start > 0 && /[a-z-]/i.test(entry[start - 1] ?? '')) start--
  }
  return { condition: entry.slice(0, start).trim(), length: entry.slice(start) }
}

const scaleLength = (length: string, factor: number): string =>
  `calc(${length.startsWith('calc(') ? length.slice('calc'.length) : length} * ${factor})`

/**
 * `sizes` for an image shown with object-fit: cover in a box of `boxAspect`
 * (width / height). An image wider than its box is scaled to the box height,
 * so it renders imageAspect / boxAspect times wider than the box; every length
 * grows by that factor (rounded up) so the browser picks a sharp enough candidate.
 */
export function coverSizes(sizes: string, imageAspect: number, boxAspect: number): string {
  const ratio = imageAspect / boxAspect
  if (ratio < MIN_FACTOR) return sizes
  const factor = Math.ceil(ratio * 100 - 1e-9) / 100
  return splitEntries(sizes)
    .map((entry) => {
      const { condition, length } = splitLength(entry)
      return condition ? `${condition} ${scaleLength(length, factor)}` : scaleLength(length, factor)
    })
    .join(', ')
}
