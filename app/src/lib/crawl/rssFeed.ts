import { pick } from '../../content/localize'
import type { Post } from '../../content/schema'
import { postUpdated } from '../../content/seo'
import { postPath } from '../../content/urls'
import type { Locale } from '../../i18n/locales'
import { escapeXml } from './xml'

export interface FeedChannel {
  title: string
  description: string
  /** The blog page in this language. */
  link: string
  /** The feed's own URL (atom:link rel="self"). */
  self: string
  /** BCP 47 tag, e.g. tr-TR. */
  language: string
}

export interface FeedItem {
  title: string
  link: string
  description: string
  /** YYYY-MM-DD publication date. */
  published: string
  /** YYYY-MM-DD last real update; drives lastBuildDate so an unchanged blog gives an identical file. */
  updated: string
}

/** RFC 822 date as RSS 2.0 wants it; content dates carry no time, so midnight UTC. */
export const rfc822 = (isoDate: string): string => new Date(`${isoDate}T00:00:00Z`).toUTCString()

/** Feed items for one language, in the order given (the repository sorts newest first). */
export function postFeedItems(posts: readonly Post[], locale: Locale, origin: string): FeedItem[] {
  return posts.map((post) => ({
    title: pick(post.title, locale).value,
    link: `${origin}${postPath(locale, post)}`,
    description: pick(post.excerpt, locale).value,
    published: post.date,
    updated: postUpdated(post) ?? post.date,
  }))
}

function itemXml(item: FeedItem): string {
  const link = escapeXml(item.link)
  return [
    '    <item>',
    `      <title>${escapeXml(item.title)}</title>`,
    `      <link>${link}</link>`,
    `      <guid isPermaLink="true">${link}</guid>`,
    `      <pubDate>${rfc822(item.published)}</pubDate>`,
    `      <description>${escapeXml(item.description)}</description>`,
    '    </item>',
  ].join('\n')
}

/** RSS 2.0 document for one language's blog. */
export function buildRssFeed(channel: FeedChannel, items: readonly FeedItem[]): string {
  const lastUpdate = items.map((item) => item.updated).toSorted().at(-1)
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(channel.title)}</title>`,
    `    <link>${escapeXml(channel.link)}</link>`,
    `    <description>${escapeXml(channel.description)}</description>`,
    `    <language>${escapeXml(channel.language.toLowerCase())}</language>`,
    ...(lastUpdate ? [`    <lastBuildDate>${rfc822(lastUpdate)}</lastBuildDate>`] : []),
    `    <atom:link href="${escapeXml(channel.self)}" rel="self" type="application/rss+xml"/>`,
    ...items.map(itemXml),
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}
