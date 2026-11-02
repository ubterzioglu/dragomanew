import type { TranslatableValue } from '../content/translation.ts'

/**
 * Turning translation sources into DeepL text lists and back (dalga2-sozlesme §6): every value is
 * split into plain strings (a string, list items, block texts and bullet items), strings are
 * deduplicated, and batches hold at most 50 strings and 100 KiB of request text (DeepL's request
 * limit is 128 KiB, leaving room for the envelope). Pure.
 */

export const MAX_BATCH_STRINGS = 50
export const MAX_BATCH_BYTES = 100 * 1024

type Block = Readonly<Record<string, unknown>>

const isBlockList = (value: TranslatableValue): value is readonly Block[] => Array.isArray(value) && value.some((item) => typeof item !== 'string')

/** The strings inside one Turkish value, in document order. */
export function stringsOf(value: TranslatableValue): string[] {
  if (typeof value === 'string') return [value]
  if (!isBlockList(value)) return [...(value as readonly string[])]
  return value.flatMap((block) => {
    if (typeof block.text === 'string') return [block.text]
    if (Array.isArray(block.items)) return block.items.filter((item): item is string => typeof item === 'string')
    return []
  })
}

/** The same value with each string replaced through `translate` (structure and block types kept). */
export function rebuild(value: TranslatableValue, translate: (text: string) => string): TranslatableValue {
  if (typeof value === 'string') return translate(value)
  if (!isBlockList(value)) return (value as readonly string[]).map(translate)
  return value.map((block) => ({
    ...block,
    ...(typeof block.text === 'string' ? { text: translate(block.text) } : {}),
    ...(Array.isArray(block.items) ? { items: block.items.map((item) => (typeof item === 'string' ? translate(item) : item)) } : {}),
  }))
}

/** Unique non-blank strings in first-seen order. */
export function uniqueStrings(values: readonly TranslatableValue[]): string[] {
  return [...new Set(values.flatMap(stringsOf).filter((text) => text.trim() !== ''))]
}

/** Characters as DeepL bills them: Unicode code points. */
export const codePoints = (text: string): number => [...text].length

const encoder = new TextEncoder()
/** Bytes the string takes inside the JSON body, quotes and escapes included. */
const jsonBytes = (text: string): number => encoder.encode(JSON.stringify(text)).byteLength + 1

/** Splits `strings` into batches of ≤ maxStrings and ≤ maxBytes; an oversized single string goes alone. */
export function batchStrings(strings: readonly string[], maxStrings = MAX_BATCH_STRINGS, maxBytes = MAX_BATCH_BYTES): string[][] {
  const batches: string[][] = []
  let current: string[] = []
  let bytes = 0
  for (const text of strings) {
    const size = jsonBytes(text)
    if (current.length > 0 && (current.length >= maxStrings || bytes + size > maxBytes)) {
      batches.push(current)
      current = []
      bytes = 0
    }
    current = [...current, text]
    bytes += size
  }
  return current.length > 0 ? [...batches, current] : batches
}
