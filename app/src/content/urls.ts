import type { Locale } from '../i18n/locales'
import { localePath, type LocalizedPaths } from '../i18n/pages'
import { LOCALES } from '../i18n/locales'
import type { DragomanEvent, Post, Product } from './schema'

type Slugged = { slug: Readonly<Record<Locale, string>> }

const allLocales = (build: (locale: Locale) => string): LocalizedPaths =>
  Object.fromEntries(LOCALES.map((locale) => [locale, build(locale)])) as LocalizedPaths

/** /{category}/{event}/ — e.g. /tr/deniz-kanosu/kekova-klasik/ */
export function eventPath(locale: Locale, event: Pick<DragomanEvent, 'category'> & Slugged): string {
  return localePath(locale, event.category, [event.slug[locale]])
}

export function eventAlternates(event: Pick<DragomanEvent, 'category'> & Slugged): LocalizedPaths {
  return allLocales((locale) => eventPath(locale, event))
}

export function postPath(locale: Locale, post: Slugged): string {
  return localePath(locale, 'blog', [post.slug[locale]])
}

export function postAlternates(post: Pick<Post, 'slug'>): LocalizedPaths {
  return allLocales((locale) => postPath(locale, post))
}

export function productPath(locale: Locale, product: Slugged): string {
  return localePath(locale, 'product', [product.slug[locale]])
}

export function productAlternates(product: Pick<Product, 'slug'>): LocalizedPaths {
  return allLocales((locale) => productPath(locale, product))
}
