import { siteConfig } from '../siteConfig'
import { absoluteUrl } from '../socialImage'
import type { JsonLdNode } from './graph'

/** The single id every page uses for the business (V6 SEO-12: one TravelAgency). */
export const ORGANIZATION_ID = `${siteConfig.origin}/#organization`
export const ORGANIZATION_REF: JsonLdNode = { '@id': ORGANIZATION_ID }

/**
 * Only data the site shows (contact page, footer). No opening hours: there is no confirmed
 * source for them and SEO-13 rules out invented business details.
 */
export function organization(): JsonLdNode {
  const { business, contact, social, brand } = siteConfig
  return {
    '@type': 'TravelAgency',
    '@id': ORGANIZATION_ID,
    name: business.name,
    alternateName: siteConfig.siteName,
    url: `${siteConfig.origin}/`,
    logo: { '@type': 'ImageObject', url: absoluteUrl(brand.logo.path), width: brand.logo.width, height: brand.logo.height },
    image: absoluteUrl(brand.shareImage.path),
    telephone: contact.phone,
    email: contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      postalCode: business.address.postalCode,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      addressCountry: 'TR',
    },
    hasMap: contact.mapsUrl,
    identifier: { '@type': 'PropertyValue', propertyID: 'TÜRSAB', value: business.tursab },
    sameAs: Object.values(social),
  }
}
