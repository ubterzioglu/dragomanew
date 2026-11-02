import { LOCALE_TAG, type Locale } from '../../i18n/locales'
import { absoluteUrl, type SocialImage } from '../socialImage'
import { imageObject, WEBSITE_ID, type JsonLdNode } from './graph'

export type WebPageType = 'WebPage' | 'CollectionPage' | 'ContactPage' | 'AboutPage'

export interface WebPageInput {
  type?: WebPageType
  /** Site path of the page, e.g. /tr/diving/ */
  path: string
  name: string
  description: string
  locale: Locale
  image?: SocialImage
  /** Whether the page also carries a BreadcrumbList (breadcrumb.ts uses the same id). */
  hasBreadcrumb?: boolean
  /** Id of the thing the page is about (a trip, a post, a book, the business). */
  mainEntityId?: string
}

export const webPageId = (path: string): string => `${absoluteUrl(path)}#webpage`

export function webPage(input: WebPageInput): JsonLdNode {
  const url = absoluteUrl(input.path)
  return {
    '@type': input.type ?? 'WebPage',
    '@id': webPageId(input.path),
    url,
    name: input.name,
    description: input.description,
    inLanguage: LOCALE_TAG[input.locale],
    isPartOf: { '@id': WEBSITE_ID },
    ...(input.image ? { primaryImageOfPage: imageObject(input.image) } : {}),
    ...(input.hasBreadcrumb ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
    ...(input.mainEntityId ? { mainEntity: { '@id': input.mainEntityId } } : {}),
  }
}
