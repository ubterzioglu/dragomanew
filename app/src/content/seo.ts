import type { Locale } from '../i18n/locales'
import { pick } from './localize'
import type { Post, SeoFields } from './schema'

export interface PageSeo {
  title: string
  description: string
}

/**
 * Search title and description of a page: the record's `seo` texts when written, otherwise what
 * the page itself shows (seo-geo-plan §3). PageHead appends the site name to the title.
 */
export function pageSeo(seo: SeoFields | undefined, locale: Locale, fallback: PageSeo): PageSeo {
  return {
    title: seo?.title ? pick(seo.title, locale).value : fallback.title,
    description: seo?.description ? pick(seo.description, locale).value : fallback.description,
  }
}

/** Share image id: the record's `seo.ogImage` when set, otherwise the page's own photo. */
export const shareImageId = <T extends string | undefined>(seo: SeoFields | undefined, fallback: T): string | T => seo?.ogImage ?? fallback

/** A post's update date counts only when it is later than its publication date; otherwise the page shows none. */
export const postUpdated = (post: Pick<Post, 'date' | 'updated'>): string | undefined =>
  post.updated !== undefined && post.updated > post.date ? post.updated : undefined
