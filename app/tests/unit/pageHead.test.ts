import { createElement, type ComponentType, type ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PageHead } from '../../src/components/seo/PageHead'
import { LocaleProvider } from '../../src/i18n/LocaleContext'
import type { Locale } from '../../src/i18n/locales'
import { pageAlternates } from '../../src/i18n/pages'
import { pageNodes } from '../../src/lib/jsonLd/pageNodes'
import { siteConfig } from '../../src/lib/siteConfig'

// Head (vite-react-ssg) reads its own nested copy of react-helmet-async, so the provider must be that one
// (same reason as tests/unit/pageContent.test.ts).
const helmetUrl = new URL('../../node_modules/vite-react-ssg/node_modules/react-helmet-async/lib/index.js', import.meta.url).href
const { HelmetProvider } = (await import(/* @vite-ignore */ helmetUrl)) as {
  HelmetProvider: ComponentType<{ children?: ReactNode; context?: object }>
}

type HeadProps = Parameters<typeof PageHead>[0]
interface HelmetContext {
  helmet?: Record<'meta' | 'link' | 'script', { toString(): string }>
}

const ORIGIN = siteConfig.origin

/** The head tags PageHead renders for one page, as the build writes them. */
function renderHead(props: HeadProps, locale: Locale = 'tr'): { meta: string; link: string; script: string } {
  const context: HelmetContext = {}
  renderToString(createElement(HelmetProvider, { context }, createElement(LocaleProvider, { locale, children: createElement(PageHead, props) })))
  const helmet = context.helmet
  if (!helmet) throw new Error('no head tags')
  return { meta: helmet.meta.toString(), link: helmet.link.toString(), script: helmet.script.toString() }
}

const base: HeadProps = { title: 'Dalış', description: 'Kaş’ta dalış', alternates: pageAlternates('diving') }
const metaContent = (meta: string, key: string): string | undefined =>
  new RegExp(`(?:property|name)="${key}" content="([^"]*)"`).exec(meta)?.[1]

describe('PageHead', () => {
  it('falls back to the brand share image with its size and alt, and a large Twitter card', () => {
    const { meta } = renderHead(base)
    expect(metaContent(meta, 'og:image')).toBe(`${ORIGIN}/brand/dragoman-og-1200x630.png`)
    expect(metaContent(meta, 'og:image:width')).toBe('1200')
    expect(metaContent(meta, 'og:image:height')).toBe('630')
    expect(metaContent(meta, 'og:image:alt')).toBe(siteConfig.business.name)
    expect(metaContent(meta, 'og:type')).toBe('website')
    expect(metaContent(meta, 'twitter:card')).toBe('summary_large_image')
    expect(metaContent(meta, 'twitter:title')).toBe('Dalış')
    expect(metaContent(meta, 'twitter:image')).toBe(`${ORIGIN}/brand/dragoman-og-1200x630.png`)
    expect(meta).not.toContain('twitter:site')
    expect(meta).not.toContain('article:published_time')
  })

  it('uses the page image and marks blog posts as articles with their dates', () => {
    const image = { url: `${ORIGIN}/media/blog-1-1000.jpg`, width: 1000, height: 667, alt: 'Kekova' }
    const { meta } = renderHead({ ...base, image, article: { published: '2026-05-01', modified: '2026-05-03' } })
    expect(metaContent(meta, 'og:image')).toBe(image.url)
    expect(metaContent(meta, 'og:image:height')).toBe('667')
    expect(metaContent(meta, 'og:type')).toBe('article')
    expect(metaContent(meta, 'article:published_time')).toBe('2026-05-01')
    expect(metaContent(meta, 'article:modified_time')).toBe('2026-05-03')
  })

  it('links the blog RSS feed of the page language on every page', () => {
    expect(renderHead(base).link).toContain(`rel="alternate" type="application/rss+xml" title="Blog | Dragoman" href="${ORIGIN}/tr/blog/feed.xml"`)
    expect(renderHead(base, 'en').link).toContain(`type="application/rss+xml" title="Blog | Dragoman" href="${ORIGIN}/blog/feed.xml"`)
  })

  it('writes one parseable JSON-LD graph only when the page has nodes', () => {
    expect(renderHead(base).script).toBe('')
    const jsonLd = pageNodes({ path: '/tr/diving/', name: 'Dalış', description: 'd', locale: 'tr' })
    const { script } = renderHead({ ...base, jsonLd })
    const blocks = [...script.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    expect(blocks).toHaveLength(1)
    const graph = JSON.parse(blocks[0]?.[1] ?? '') as { '@graph': { '@id'?: string; '@type': string }[] }
    expect(graph['@graph'].filter((node) => node['@id'] === `${ORIGIN}/#organization`)).toHaveLength(1)
    expect(graph['@graph'].map((node) => node['@type'])).toEqual(['TravelAgency', 'WebSite', 'WebPage'])
  })

  it('keeps a canonical on normal pages and drops it on always-noindex pages', () => {
    expect(renderHead(base).link).toContain(`rel="canonical" href="${ORIGIN}/tr/diving/"`)
    const { link, meta } = renderHead({ ...base, alwaysNoindex: true })
    expect(link).not.toContain('rel="canonical"')
    expect(meta).toContain('name="robots" content="noindex,nofollow"')
  })
})
