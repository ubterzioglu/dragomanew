import { contentData } from '../../src/content/data'
import type { DragomanEvent } from '../../src/content/schema'
import { eventPath, postPath, productPath } from '../../src/content/urls'
import type { Locale } from '../../src/i18n/locales'
import { localePath } from '../../src/i18n/pages'

/** Picks representative pages from the sample content so tests follow the data. */
const published = contentData.events.filter((e) => e.status === 'published')

function required<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`No sample content for: ${what}`)
  return value
}

const textLength = (e: DragomanEvent) => JSON.stringify(e.body.de ?? '').length

const byLength = published.toSorted((a, b) => textLength(a) - textLength(b))
const longest = required(byLength.at(-1), 'longest event')
const shortest = required(byLength[0], 'shortest event')
const multiDay = required(published.find((e) => e.itinerary.length >= 2), 'multi-day event')
const taken = new Set([longest.id, shortest.id, multiDay.id])

export const events = {
  klasik: required(published.find((e) => e.id === 'kekova-klasik'), 'kekova-klasik'),
  // A record of its own, so each detail template in the screenshot matrix is a different page (plan §8.2).
  onRequest: required(published.find((e) => e.priceDisplay === 'on_request' && !taken.has(e.id)), 'separate on_request event'),
  multiDay,
  withFaq: required(published.find((e) => e.faq.length > 0), 'event with FAQ'),
  bare: required(
    published.find((e) => e.faq.length === 0 && e.itinerary.length === 0 && !e.includes && !e.meetingPoint),
    'event without optional sections',
  ),
  longest,
  shortest,
  archived: required(contentData.events.find((e) => e.status === 'archived'), 'archived event'),
}

export const firstPost = required(contentData.posts.filter((p) => p.status === 'published')[0], 'post')
export const firstProduct = required(contentData.products[0], 'product')

export const eventUrl = (locale: Locale, event: DragomanEvent) => eventPath(locale, event)
export const postUrl = (locale: Locale) => postPath(locale, firstPost)
export const productUrl = (locale: Locale) => productPath(locale, firstProduct)

/** Every template group once (V6 §4.8), as paths for one language. */
export function templatePages(locale: Locale): { name: string; path: string }[] {
  return [
    { name: 'home', path: localePath(locale, 'home') },
    { name: 'diving', path: localePath(locale, 'diving') },
    { name: 'sea-kayak', path: localePath(locale, 'seaKayak') },
    { name: 'outdoor', path: localePath(locale, 'outdoor') },
    { name: 'transport', path: localePath(locale, 'transport') },
    { name: 'shop', path: localePath(locale, 'shop') },
    { name: 'event-options', path: eventUrl(locale, events.klasik) },
    { name: 'event-on-request', path: eventUrl(locale, events.onRequest) },
    { name: 'event-multi-day', path: eventUrl(locale, events.multiDay) },
    { name: 'event-bare', path: eventUrl(locale, events.bare) },
    { name: 'event-long', path: eventUrl(locale, events.longest) },
    { name: 'event-short', path: eventUrl(locale, events.shortest) },
    { name: 'lifeguard', path: localePath(locale, 'lifeguard') },
    { name: 'dive-sites', path: localePath(locale, 'diveSites') },
    { name: 'product', path: productUrl(locale) },
    { name: 'blog', path: localePath(locale, 'blog') },
    { name: 'post', path: postUrl(locale) },
    { name: 'about', path: localePath(locale, 'about') },
    { name: 'contact', path: localePath(locale, 'contact') },
    { name: 'privacy', path: localePath(locale, 'privacy') },
    { name: 'terms', path: localePath(locale, 'terms') },
    { name: 'health-diving', path: localePath(locale, 'participantForm', ['diving']) },
    { name: 'health-outdoor', path: localePath(locale, 'participantForm', ['outdoor']) },
  ]
}
