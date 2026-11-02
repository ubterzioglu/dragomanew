import { describe, expect, it } from 'vitest'
import { contentData } from '../../src/content/data'
import type { Post } from '../../src/content/schema'
import { buildRobotsTxt, crawlExclusions, NAMED_CRAWLERS } from '../../src/lib/crawl/robotsTxt'
import { buildRssFeed, postFeedItems, rfc822 } from '../../src/lib/crawl/rssFeed'
import { buildSitemap } from '../../src/lib/crawl/sitemap'
import { escapeXml } from '../../src/lib/crawl/xml'

const ORIGIN = 'https://example.test'

describe('escapeXml', () => {
  it('escapes markup and both quote kinds', () => {
    expect(escapeXml(`a & <b> "c" 'd'`)).toBe('a &amp; &lt;b&gt; &quot;c&quot; &apos;d&apos;')
  })
})

describe('buildRobotsTxt', () => {
  it('shuts every crawler out in Stage A, with no sitemap', () => {
    const robots = buildRobotsTxt({ publicRelease: false, origin: ORIGIN })
    expect(robots).toMatch(/^User-agent: \*\nDisallow: \/$/m)
    expect(robots).not.toContain('Sitemap:')
    expect(robots).not.toContain('Allow: /')
  })

  it('opens a release to everyone, names the AI crawlers and keeps the exclusions in every group', () => {
    const robots = buildRobotsTxt({ publicRelease: true, origin: ORIGIN })
    expect(robots).not.toMatch(/^Disallow: \/$/m)
    for (const crawler of NAMED_CRAWLERS) expect(robots).toContain(`User-agent: ${crawler}\n`)
    const groups = robots.split('\n\n').filter((block) => block.includes('User-agent'))
    expect(groups).toHaveLength(2)
    for (const group of groups) {
      expect(group).toContain('Allow: /\n')
      for (const path of crawlExclusions()) expect(group).toContain(`Disallow: ${path}`)
    }
    expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`)
  })

  it('excludes the panel, the review index and the participant form in every language', () => {
    expect(crawlExclusions()).toEqual([
      '/panel/',
      '/__demo/',
      '/tr/katilimci-formu/',
      '/participant-form/',
      '/fr/formulaire-participant/',
      '/de/teilnehmerformular/',
    ])
  })
})

describe('buildSitemap', () => {
  it('lists pages sorted, with lastmod only when given and every alternate', () => {
    const xml = buildSitemap([
      { loc: `${ORIGIN}/tr/`, alternates: [{ hreflang: 'en', href: `${ORIGIN}/` }] },
      { loc: `${ORIGIN}/blog/a/`, alternates: [], lastmod: '2026-05-01' },
    ])
    expect(xml.indexOf('/blog/a/')).toBeLessThan(xml.indexOf('/tr/'))
    expect(xml).toContain('<lastmod>2026-05-01</lastmod>')
    expect(xml.match(/<lastmod>/g)).toHaveLength(1)
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="en" href="${ORIGIN}/"/>`)
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
  })
})

describe('RSS feed', () => {
  const posts = contentData.posts.filter((post) => post.status === 'published')
  const channel = { title: 'Blog | Dragoman', description: 'D & D', link: `${ORIGIN}/tr/blog/`, self: `${ORIGIN}/tr/blog/feed.xml`, language: 'tr-TR' }

  it('formats dates as RFC 822 at midnight UTC', () => {
    expect(rfc822('2026-07-05')).toBe('Sun, 05 Jul 2026 00:00:00 GMT')
  })

  it('builds one item per post with absolute links in the requested language', () => {
    const items = postFeedItems(posts, 'tr', ORIGIN)
    expect(items).toHaveLength(posts.length)
    const [first] = items
    const [post] = posts as [Post, ...Post[]]
    expect(first?.link).toBe(`${ORIGIN}/tr/blog/${post.slug.tr}/`)
    expect(first?.published).toBe(post.date)
    expect(first?.updated).toBe(post.updated ?? post.date)
  })

  it('writes an RSS 2.0 channel with a self link and the latest update as lastBuildDate', () => {
    const xml = buildRssFeed(channel, [
      { title: 'A <b>', link: `${ORIGIN}/tr/blog/a/`, description: 'x', published: '2026-01-02', updated: '2026-03-04' },
      { title: 'B', link: `${ORIGIN}/tr/blog/b/`, description: 'y', published: '2026-02-01', updated: '2026-02-01' },
    ])
    expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">')
    expect(xml).toContain(`<atom:link href="${ORIGIN}/tr/blog/feed.xml" rel="self" type="application/rss+xml"/>`)
    expect(xml).toContain('<language>tr-tr</language>')
    expect(xml).toContain(`<lastBuildDate>${rfc822('2026-03-04')}</lastBuildDate>`)
    expect(xml).toContain('<title>A &lt;b&gt;</title>')
    expect(xml).toContain('<description>D &amp; D</description>')
    expect(xml.match(/<item>/g)).toHaveLength(2)
  })

  it('leaves out lastBuildDate when there are no posts', () => {
    expect(buildRssFeed(channel, [])).not.toContain('lastBuildDate')
  })
})
