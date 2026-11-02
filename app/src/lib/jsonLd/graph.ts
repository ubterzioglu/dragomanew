import { LOCALE_TAG, LOCALES } from '../../i18n/locales'
import { siteConfig } from '../siteConfig'
import type { SocialImage } from '../socialImage'
import { organization, ORGANIZATION_REF } from './organization'

/** One schema.org node; generators build plain readonly objects. */
export type JsonLdNode = Readonly<Record<string, unknown>>

export const WEBSITE_ID = `${siteConfig.origin}/#website`

export const imageObject = (image: SocialImage): JsonLdNode => ({
  '@type': 'ImageObject',
  url: image.url,
  width: image.width,
  height: image.height,
})

function website(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${siteConfig.origin}/`,
    name: siteConfig.siteName,
    inLanguage: LOCALES.map((locale) => LOCALE_TAG[locale]),
    publisher: ORGANIZATION_REF,
  }
}

/** The page's nodes plus the shared site and organization nodes, as one @graph (one script per page). */
export function pageGraph(nodes: readonly JsonLdNode[]): JsonLdNode {
  return { '@context': 'https://schema.org', '@graph': [organization(), website(), ...nodes] }
}

/**
 * JSON for an inline <script> element. "<" is escaped so no text can close the element early;
 * the line separators are escaped because older parsers treat them as line ends.
 */
export function serializeJsonLd(graph: JsonLdNode): string {
  return JSON.stringify(graph)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
