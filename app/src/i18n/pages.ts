import { LOCALE_PREFIX, LOCALES, type Locale } from './locales'

/**
 * Fixed pages and their per-language slugs. Existing WordPress slugs are kept
 * exactly (SEO value, V6 §9.2); German has no legacy pages, so its slugs are new.
 */
const PAGE_SLUGS = {
  home: { tr: '', en: '', fr: '', de: '' },
  diving: { tr: 'diving', en: 'diving', fr: 'plongee', de: 'tauchen' },
  seaKayak: { tr: 'deniz-kanosu', en: 'sea-kayak', fr: 'kayak-de-mer', de: 'seekajak' },
  outdoor: {
    tr: 'doga-etkinlikleri',
    en: 'outdoor-activities',
    fr: 'activites-pleine-nature',
    de: 'outdoor-aktivitaeten',
  },
  transport: {
    tr: 'ulasim-konaklama',
    en: 'transportation-and-accomodation',
    fr: 'transport-et-hebergement',
    de: 'transfer-und-unterkunft',
  },
  shop: { tr: 'dukkan', en: 'shop', fr: 'boutique', de: 'shop' },
  product: { tr: 'urun', en: 'product', fr: 'produit', de: 'produkt' },
  about: { tr: 'dragoman', en: 'dragoman', fr: 'dragoman', de: 'dragoman' },
  contact: { tr: 'rezervasyon-ve-iletisim', en: 'contact', fr: 'contact', de: 'kontakt' },
  blog: { tr: 'blog', en: 'blog', fr: 'blog', de: 'blog' },
  diveSites: {
    tr: 'kas-dalis-noktalari',
    en: 'kas-dive-sites',
    fr: 'sites-de-plongee-a-kas',
    de: 'tauchplaetze-kas',
  },
  lifeguard: {
    tr: 'cankurtarma-merkezi',
    en: 'lifeguard-training',
    fr: 'formation-sauveteur',
    de: 'rettungsschwimmer-ausbildung',
  },
  privacy: {
    tr: 'gizlilik-politikasi',
    en: 'privacy-policy',
    fr: 'politique-de-confidentialite',
    de: 'datenschutz',
  },
  terms: {
    tr: 'sartlar-ve-kosullar',
    en: 'terms-and-conditions',
    fr: 'conditions-generales-dutilisation',
    de: 'agb',
  },
  participantForm: {
    tr: 'katilimci-formu',
    en: 'participant-form',
    fr: 'formulaire-participant',
    de: 'teilnehmerformular',
  },
} as const satisfies Record<string, Record<Locale, string>>

export type PageKey = keyof typeof PAGE_SLUGS

export const PAGE_KEYS = Object.keys(PAGE_SLUGS) as readonly PageKey[]

export type LocalizedPaths = Readonly<Record<Locale, string>>

// Lowercase ASCII words joined by single hyphens: nothing that can leave the
// site path (no slashes, dots, schemes, or backslashes — see the React Router
// backslash open-redirect advisory noted in tmp/docs/asama-a-ilerleme.md).
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function assertSafeSlug(slug: string): string {
  if (!SAFE_SLUG.test(slug)) {
    throw new Error(`Unsafe URL slug: "${slug}"`)
  }
  return slug
}

export function pageSlug(locale: Locale, key: PageKey): string {
  return PAGE_SLUGS[key][locale]
}

/** The only way internal URLs are built; every link goes through here. */
export function localePath(locale: Locale, key: PageKey, childSlugs: readonly string[] = []): string {
  const segments = [LOCALE_PREFIX[locale], pageSlug(locale, key), ...childSlugs.map(assertSafeSlug)].filter(
    (segment) => segment !== '',
  )
  return segments.length === 0 ? '/' : `/${segments.join('/')}/`
}

export function pageAlternates(key: PageKey): LocalizedPaths {
  return Object.fromEntries(LOCALES.map((locale) => [locale, localePath(locale, key)])) as LocalizedPaths
}
