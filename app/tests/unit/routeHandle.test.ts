import type { UIMatch } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { findRouteHandle, type RouteHandle } from '../../src/app/routeHandle'
import { contentData } from '../../src/content/data'
import { createStaticRepository, EMPTY_CONTENT } from '../../src/content/staticRepository'
import { eventAlternates } from '../../src/content/urls'
import { pageAlternates } from '../../src/i18n/pages'

const match = (handle: unknown, params: Record<string, string> = {}): UIMatch =>
  ({ id: 'x', pathname: '/', params, data: undefined, handle }) as UIMatch
const empty = createStaticRepository(EMPTY_CONTENT)

describe('findRouteHandle', () => {
  it('uses the deepest route handle', () => {
    const outer: RouteHandle = { locale: 'tr', alternates: null }
    const inner: RouteHandle = { locale: 'fr', alternates: pageAlternates('home'), cta: 'request' }
    expect(findRouteHandle([match(outer), match(inner)], empty)).toEqual({ locale: 'fr', alternates: pageAlternates('home'), cta: 'request' })
  })

  it('resolves detail alternates from the route params', () => {
    const detail: RouteHandle = { locale: 'de', cta: 'request', alternates: (params) => (params.slug === 'ok' ? pageAlternates('home') : null) }
    expect(findRouteHandle([match(detail, { slug: 'ok' })], empty)?.cta).toBe('request')
  })

  it('resolves detail alternates from the page content slice', () => {
    const event = contentData.events.find((e) => e.status === 'published')
    if (!event) throw new Error('no published event in the sample content')
    const content = createStaticRepository({ ...EMPTY_CONTENT, events: [event] })
    const detail: RouteHandle = {
      locale: 'tr',
      alternates: (params, repository) => {
        const found = repository.eventBySlug(event.category, 'tr', params.slug ?? '')
        return found ? eventAlternates(found) : null
      },
    }
    expect(findRouteHandle([match(detail, { slug: event.slug.tr })], content)?.alternates).toEqual(eventAlternates(event))
  })

  // A host serves the prerendered /404/ (English, contact CTA) for a missing slug; hydration must see the same tree.
  it('falls back to the 404 handle when a detail record does not exist', () => {
    const detail: RouteHandle = { locale: 'de', cta: 'request', alternates: () => null }
    expect(findRouteHandle([match(detail, { slug: 'gone' })], empty)).toEqual({ locale: 'en', alternates: null })
  })
})
