/**
 * Single source for business and contact data (guide §4, 31 Oct 2026, supplied
 * by the user). Contact page, footer and mobile action bar all read from here.
 */
import { resolveSiteOrigin } from './siteOrigin'

export const siteConfig = {
  // Set per host with VITE_SITE_ORIGIN (see siteOrigin.ts).
  origin: resolveSiteOrigin(import.meta.env.VITE_SITE_ORIGIN),
  business: {
    name: 'Dragoman Travel Agency',
    tursab: 'A4615',
    address: {
      street: 'Uzunçarşı Cad. No: 15',
      postalCode: '07580',
      city: 'Kaş',
      region: 'Antalya',
      country: 'Türkiye',
    },
  },
  contact: {
    phone: '+90 242 836 3614',
    mobile: '+90 533 290 1463',
    whatsappUrl: 'https://wa.me/905332901463',
    email: 'info@dragoman-turkey.com',
    mapsUrl: 'https://maps.app.goo.gl/8CHPeMSWYjqhSYJe6',
  },
  social: {
    instagram: 'https://www.instagram.com/dragomandivingandoutdoors/',
    facebook: 'https://www.facebook.com/dragomandivingandoutdoor',
    linkedin: 'https://www.linkedin.com/company/dragoman-diving-outdoor/home/',
    youtube: 'https://www.youtube.com/@dragomanturkey669',
  },
} as const

export function telHref(displayNumber: string): string {
  return `tel:${displayNumber.replace(/[^\d+]/g, '')}`
}

export function mailHref(address: string): string {
  return `mailto:${address}`
}
