import type { Locale } from '../i18n/locales'
import { localePath } from '../i18n/pages'
import { siteConfig } from './siteConfig'
import { absoluteUrl } from './socialImage'

/**
 * The blog's RSS feed in one language: /blog/feed.xml, /tr/blog/feed.xml, …
 * Absolute because the file is written after the build (plan §4), so check:dist does not
 * treat it as an internal page link.
 */
export function blogFeed(locale: Locale, blogTitle: string): { href: string; title: string } {
  return { href: absoluteUrl(`${localePath(locale, 'blog')}feed.xml`), title: `${blogTitle} | ${siteConfig.siteName}` }
}
