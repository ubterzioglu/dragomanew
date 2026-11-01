import { describe, expect, it } from 'vitest'
import { contentData } from '../../src/content/data'
import { buildContentReport, missingTranslations, renderContentReport } from '../../src/content/report'

describe('missingTranslations', () => {
  it('counts every localized field without the language, at any depth', () => {
    const record = {
      id: 'x',
      title: { tr: 'a', en: 'a', fr: 'a' },
      body: { tr: [{ type: 'p', text: 'b' }], de: [{ type: 'p', text: 'b' }] },
      faq: [{ question: { tr: 'q', en: 'q', fr: 'q', de: 'q' }, answer: { tr: 'r' } }],
      slug: { tr: 's', en: 's', fr: 's', de: 's' },
    }
    expect(missingTranslations(record)).toEqual({ en: 2, fr: 2, de: 2 })
  })

  it('does not treat plain objects without a Turkish source as localized', () => {
    expect(missingTranslations({ translationOrigin: { en: 'cloner' }, widths: [480] })).toEqual({ en: 0, fr: 0, de: 0 })
  })
})

describe('buildContentReport (Stage A data)', () => {
  const report = buildContentReport(contentData)

  it('lists every content record exactly once with its origin', () => {
    const expected =
      contentData.events.length +
      contentData.posts.length +
      contentData.products.length +
      contentData.richPages.length +
      contentData.categoryPages.length +
      contentData.serviceOffers.length +
      contentData.team.length +
      1
    expect(report.records).toHaveLength(expected)
    for (const row of report.records) expect(['cloner', 'kayak-site', 'mockup']).toContain(row.origin)
  })

  it('reports German as sample text everywhere and no silent gaps in the sample set', () => {
    for (const row of report.records) expect(row.translationOrigin.de).toBe('mockup')
    expect(report.totals.missing).toEqual({ en: 0, fr: 0, de: 0 })
  })

  it('lists every numeric price as awaiting confirmation and covers all media', () => {
    const numeric = contentData.events.filter((event) => event.priceDisplay === 'numeric')
    expect(report.prices.filter((row) => row.kind === 'event')).toHaveLength(numeric.length)
    expect(report.prices.filter((row) => row.kind === 'product')).toHaveLength(contentData.products.length)
    expect(report.media).toHaveLength(contentData.media.length)
    expect(report.media.filter((row) => row.placeholder).map((row) => row.id).length).toBe(3)
  })

  it('renders a generated Markdown document', () => {
    const markdown = renderContentReport(report, '2026-10-31')
    expect(markdown).toContain('npm run content-report')
    expect(markdown).toContain('| kekova-klasik |')
    expect(markdown.split('\n').length).toBeGreaterThan(50)
  })
})
