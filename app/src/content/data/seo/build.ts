import type { SeoFields } from '../../schema'

/** One language: [search title without the " | Dragoman" suffix, meta description]. */
type SeoLine = readonly [title: string, description: string]

/** Search title and description in all four languages (tr, en, fr, de). */
export const seo = (tr: SeoLine, en: SeoLine, fr: SeoLine, de: SeoLine): SeoFields => ({
  title: { tr: tr[0], en: en[0], fr: fr[0], de: de[0] },
  description: { tr: tr[1], en: en[1], fr: fr[1], de: de[1] },
})

/**
 * Attaches the search texts to their records by id/key. A field written on the record itself
 * wins. An entry without a matching record is a typo, so it fails the build instead of vanishing.
 */
export function withSeo<T extends { seo?: SeoFields }>(
  records: readonly T[],
  keyOf: (record: T) => string,
  table: Readonly<Record<string, SeoFields>>,
): T[] {
  const keys = new Set(records.map(keyOf))
  const unknown = Object.keys(table).filter((key) => !keys.has(key))
  if (unknown.length > 0) throw new Error(`SEO texts for unknown records: ${unknown.join(', ')}`)
  return records.map((record) => {
    const fields = table[keyOf(record)]
    return fields ? { ...record, seo: { ...fields, ...record.seo } } : record
  })
}
