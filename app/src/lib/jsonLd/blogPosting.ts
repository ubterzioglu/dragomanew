import { LOCALE_TAG, type Locale } from '../../i18n/locales'
import { absoluteUrl, type SocialImage } from '../socialImage'
import { imageObject, type JsonLdNode } from './graph'
import { ORGANIZATION_REF } from './organization'
import { webPageId } from './webPage'

export interface BlogPostingInput {
  path: string
  headline: string
  description: string
  locale: Locale
  /** ISO dates as shown on the page. */
  published: string
  modified: string
  image?: SocialImage
}

export const blogPostingId = (path: string): string => `${absoluteUrl(path)}#article`

/** Posts carry no personal byline, so author and publisher are the business itself. */
export function blogPosting(input: BlogPostingInput): JsonLdNode {
  return {
    '@type': 'BlogPosting',
    '@id': blogPostingId(input.path),
    url: absoluteUrl(input.path),
    headline: input.headline,
    description: input.description,
    inLanguage: LOCALE_TAG[input.locale],
    datePublished: input.published,
    dateModified: input.modified,
    ...(input.image ? { image: imageObject(input.image) } : {}),
    author: ORGANIZATION_REF,
    publisher: ORGANIZATION_REF,
    mainEntityOfPage: { '@id': webPageId(input.path) },
  }
}
