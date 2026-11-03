import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LastUpdated } from '../../src/components/ui/LastUpdated'
import { postUpdated } from '../../src/content/seo'
import { LocaleProvider } from '../../src/i18n/LocaleContext'
import type { Locale } from '../../src/i18n/locales'
import { postFeedItems } from '../../src/lib/crawl/rssFeed'
import { contentData } from '../../src/content/data'

const post = contentData.posts[0]!

describe('postUpdated', () => {
  it('counts an update only when it is later than the publication date', () => {
    expect(postUpdated({ date: '2026-03-01', updated: '2026-11-02' })).toBe('2026-11-02')
    expect(postUpdated({ date: '2026-03-01', updated: '2026-03-01' })).toBeUndefined()
    expect(postUpdated({ date: '2026-03-01', updated: '2025-12-31' })).toBeUndefined()
    expect(postUpdated({ date: '2026-03-01' })).toBeUndefined()
  })

  it('drives the feed, which falls back to the publication date', () => {
    const items = (updated?: string) => postFeedItems([{ ...post, date: '2026-03-01', updated }], 'tr', 'https://example.test')
    expect(items('2026-11-02')[0]?.updated).toBe('2026-11-02')
    expect(items('2025-12-31')[0]?.updated).toBe('2026-03-01')
  })
})

describe('LastUpdated', () => {
  const render = (locale: Locale) => renderToString(createElement(LocaleProvider, { locale, children: createElement(LastUpdated, { date: '2026-11-02' }) }))

  it('shows the label and a machine-readable date in each language', () => {
    expect(render('tr')).toMatch(/Güncellendi:.*<time dateTime="2026-11-02">2 Kasım 2026<\/time>/)
    expect(render('en')).toMatch(/Updated.*<time dateTime="2026-11-02">2 November 2026<\/time>/)
    expect(render('fr')).toMatch(/Mis à jour le.*<time dateTime="2026-11-02">2 novembre 2026<\/time>/)
    expect(render('de')).toMatch(/Aktualisiert am.*<time dateTime="2026-11-02">2\. November 2026<\/time>/)
  })
})
