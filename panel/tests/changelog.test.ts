import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { formatChangelogDate, latestEntries, parseChangelog } from '../src/lib/docs/changelog'

const SAMPLE = [
  '# Son güncellemeler',
  '',
  'Giriş paragrafı, madde değil.',
  '',
  '## 2026-10-20',
  '- Formlar eklendi.',
  '- Uzun bir madde',
  '  ikinci satırda devam ediyor.',
  '',
  '## 2026-11-02',
  '- **Google** ile giriş.',
  '* Yıldızlı madde de olur.',
  '',
  '## Taslak notlar',
  '- Tarihsiz başlığın altı sayılmaz.',
  '',
  '## 2026-02-30',
  '- Geçersiz tarih sayılmaz.',
  '',
  '## 2026-10-25',
  '',
  '## 2026-10-20',
  '- Aynı gün ikinci başlık birleşir.',
].join('\n')

describe('parseChangelog', () => {
  const entries = parseChangelog(SAMPLE)

  it('reads dated entries newest first, whatever the file order', () => {
    expect(entries.map((entry) => entry.date)).toEqual(['2026-11-02', '2026-10-20'])
  })

  it('keeps bullets as Markdown, joins continuation lines and merges the same date', () => {
    expect(entries[0]?.items).toEqual(['**Google** ile giriş.', 'Yıldızlı madde de olur.'])
    expect(entries[1]?.items).toEqual([
      'Formlar eklendi.',
      'Uzun bir madde ikinci satırda devam ediyor.',
      'Aynı gün ikinci başlık birleşir.',
    ])
  })

  it('ignores the intro, undated or impossible dates and empty entries', () => {
    const all = entries.flatMap((entry) => entry.items).join(' ')
    expect(all).not.toContain('Giriş paragrafı')
    expect(all).not.toContain('Tarihsiz')
    expect(all).not.toContain('Geçersiz')
    expect(entries.some((entry) => entry.date === '2026-10-25')).toBe(false)
  })

  it('reads Windows line endings and an empty file', () => {
    expect(parseChangelog('## 2026-01-05\r\n- Bir\r\n- İki\r\n')).toEqual([{ date: '2026-01-05', items: ['Bir', 'İki'] }])
    expect(parseChangelog('')).toEqual([])
  })
})

describe('latestEntries', () => {
  const entries = [
    { date: '2026-01-01', items: ['a'] },
    { date: '2026-03-01', items: ['c'] },
    { date: '2026-02-01', items: ['b'] },
    { date: '2026-04-01', items: ['d'] },
  ]

  it('returns the newest N, newest first, without changing the input', () => {
    expect(latestEntries(entries, 3).map((entry) => entry.date)).toEqual(['2026-04-01', '2026-03-01', '2026-02-01'])
    expect(entries[0]?.date).toBe('2026-01-01')
  })

  it('copes with fewer entries than asked and with zero', () => {
    expect(latestEntries(entries.slice(0, 1), 3)).toHaveLength(1)
    expect(latestEntries(entries, 0)).toEqual([])
  })
})

describe('formatChangelogDate', () => {
  it('writes the date in Turkish', () => {
    expect(formatChangelogDate('2026-11-02')).toBe('2 Kasım 2026')
    expect(formatChangelogDate('2026-02-14')).toBe('14 Şubat 2026')
    expect(formatChangelogDate('nope')).toBe('nope')
  })
})

describe('src/docs/guncellemeler.md', () => {
  it('has at least one dated entry with bullets', () => {
    const raw = readFileSync(new URL('../src/docs/guncellemeler.md', import.meta.url), 'utf8')
    const entries = parseChangelog(raw)
    expect(entries.length).toBeGreaterThan(0)
    expect(entries.every((entry) => entry.items.length > 0)).toBe(true)
  })
})
