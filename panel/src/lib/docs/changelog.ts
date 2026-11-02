/**
 * "Son güncellemeler" is a hand-written Markdown file (src/docs/guncellemeler.md): `## YYYY-MM-DD`
 * headings, each with `- ` bullets in plain Turkish. Headings that are not a date are ignored.
 */

export interface ChangelogEntry {
  /** YYYY-MM-DD. */
  date: string
  /** Each bullet as Markdown (continuation lines joined). */
  items: string[]
}

const DATE_HEADING = /^##\s+(\d{4}-\d{2}-\d{2})\s*$/
const BULLET = /^\s*[-*]\s+(.*)$/

const isRealDate = (value: string): boolean => {
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
}

/** Entries newest first; entries with the same date are merged, empty entries dropped. */
export function parseChangelog(raw: string): ChangelogEntry[] {
  const byDate = new Map<string, string[]>()
  let current: string[] | null = null
  for (const line of raw.replace(/\r\n?/g, '\n').split('\n')) {
    const heading = DATE_HEADING.exec(line)
    if (heading) {
      const date = heading[1] ?? ''
      current = isRealDate(date) ? (byDate.get(date) ?? []) : null
      if (current) byDate.set(date, current)
      continue
    }
    if (/^#{1,6}\s/.test(line)) {
      // Any other heading closes the date's list unless it is a sub-heading (### …) inside it.
      if (/^#{1,2}\s/.test(line)) current = null
      continue
    }
    if (!current) continue
    const bullet = BULLET.exec(line)
    if (bullet) {
      const text = (bullet[1] ?? '').trim()
      if (text) current.push(text)
    } else if (line.trim() !== '' && current.length > 0 && /^\s+/.test(line)) {
      current[current.length - 1] = `${current[current.length - 1]} ${line.trim()}`
    }
  }
  return [...byDate.entries()]
    .filter(([, items]) => items.length > 0)
    .map(([date, items]) => ({ date, items: [...items] }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function latestEntries(entries: readonly ChangelogEntry[], count: number): ChangelogEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, Math.max(0, count))
}

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

/** `2026-11-02` → `2 Kasım 2026` (no time zone involved). */
export function formatChangelogDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const name = MONTHS[(month ?? 0) - 1]
  return name && day && year ? `${day} ${name} ${year}` : date
}
