import { createElement, type ComponentType, type ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { PageHead } from '../../src/components/seo/PageHead'
import { TranslationNote } from '../../src/components/seo/TranslationNote'
import { contentData } from '../../src/content/data'
import { pageContent, translationGaps } from '../../src/content/pageContent'
import { createStaticRepository } from '../../src/content/staticRepository'
import { eventAlternates } from '../../src/content/urls'
import { LocaleProvider } from '../../src/i18n/LocaleContext'
import type { Locale } from '../../src/i18n/locales'
import { siteConfig } from '../../src/lib/siteConfig'

// A public release, where a fallback page is the only kind of noindex page.
vi.mock('../../src/lib/env', () => ({ isPublicRelease: true, buildYear: 2026 }))

/** dalga2-sozlesme §7, Q2: a page showing the Turkish fallback gets a visible note, noindex, and leaves hreflang. */
const helmetUrl = new URL('../../node_modules/vite-react-ssg/node_modules/react-helmet-async/lib/index.js', import.meta.url).href
const { HelmetProvider } = (await import(/* @vite-ignore */ helmetUrl)) as {
  HelmetProvider: ComponentType<{ children?: ReactNode; context?: object }>
}

const event = contentData.events.find((e) => e.status === 'published')!
/** The event with its German body missing (published before the translation arrived). */
const untranslated = { ...event, body: { tr: event.body.tr, en: event.body.en, fr: event.body.fr } }
const data = { ...contentData, events: contentData.events.map((e) => (e.id === event.id ? untranslated : e)) }
const ORIGIN = siteConfig.origin

function render(locale: Locale, gaps: readonly Locale[]) {
  const context: { helmet?: Record<'meta' | 'link', { toString(): string }> } = {}
  const body = renderToString(
    createElement(
      HelmetProvider,
      { context },
      createElement(LocaleProvider, {
        locale,
        children: [
          createElement(PageHead, { key: 'head', title: 'T', description: 'D', alternates: eventAlternates(event), untranslated: gaps }),
          createElement(TranslationNote, { key: 'note', untranslated: gaps }),
        ],
      }),
    ),
  )
  return { body, meta: context.helmet!.meta.toString(), link: context.helmet!.link.toString() }
}

describe('translation gaps', () => {
  it('lists the languages whose title, summary or body falls back to Turkish', () => {
    expect(translationGaps({ events: [untranslated] })).toEqual({ [`event:${event.id}`]: ['de'] })
    expect(translationGaps({ events: [event], posts: contentData.posts, products: contentData.products, richPages: contentData.richPages })).toEqual({})
  })

  it('travels with the page slice, which itself keeps only one language', () => {
    const slice = pageContent(data, { kind: 'event', category: event.category, locale: 'en', slug: event.slug.en })
    expect(slice.events[0]?.body.de).toBeUndefined()
    expect(createStaticRepository(slice).translationGaps('event', event.id)).toEqual(['de'])
    expect(pageContent(data, { kind: 'category', category: event.category, locale: 'en' }).translationGaps).toEqual({})
  })
})

describe('a Turkish-fallback page', () => {
  it('shows the note, is noindex and is not in its own hreflang set', () => {
    const { body, meta, link } = render('de', ['de'])
    expect(body).toContain('data-translation-fallback')
    expect(meta).toContain('name="robots" content="noindex,nofollow"')
    expect(link).toContain(`rel="canonical" href="${ORIGIN}${eventAlternates(event).de}"`)
    expect(link).not.toMatch(/hreflang="de/i)
  })

  it('leaves the translated pages indexable, without the untranslated alternate', () => {
    const { body, meta, link } = render('en', ['de'])
    expect(body).not.toContain('data-translation-fallback')
    expect(meta).not.toContain('noindex')
    expect(link).not.toMatch(/hreflang="de/i)
    expect(link).toMatch(/hreflang="fr/i)
    expect(link).toContain(`hrefLang="x-default" href="${ORIGIN}${eventAlternates(event).en}"`)
  })

  it('points x-default at Turkish when English is the untranslated one', () => {
    const { link } = render('tr', ['en'])
    expect(link).toContain(`hrefLang="x-default" href="${ORIGIN}${eventAlternates(event).tr}"`)
  })
})
