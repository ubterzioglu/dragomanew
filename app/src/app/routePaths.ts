import { LOCALES, type Locale } from '../i18n/locales'
import { localePath, pageAlternates, type LocalizedPaths, type PageKey } from '../i18n/pages'
import type { PageCta } from './routeHandle'

export type HealthFormKind = 'diving' | 'outdoor'

export const HEALTH_FORM_KINDS: readonly HealthFormKind[] = ['diving', 'outdoor']

/** Fixed pages that get one route per language (detail pages are added from content). */
const STATIC_PAGES: readonly PageKey[] = [
  'home',
  'diving',
  'seaKayak',
  'outdoor',
  'transport',
  'shop',
  'about',
  'contact',
  'blog',
  'diveSites',
  'lifeguard',
  'privacy',
  'terms',
]

const PAGE_CTA: Partial<Record<PageKey, PageCta>> = { transport: 'transport' }

export interface StaticRouteSpec {
  locale: Locale
  page: PageKey
  /** React Router child path ('' = index route). */
  path: string
  alternates: LocalizedPaths
  cta?: PageCta
  formKind?: HealthFormKind
}

/** '/tr/deniz-kanosu/' → 'tr/deniz-kanosu' */
export function toRoutePath(sitePath: string): string {
  return sitePath.replace(/^\/+|\/+$/g, '')
}

export function participantFormAlternates(kind: HealthFormKind): LocalizedPaths {
  return Object.fromEntries(
    LOCALES.map((locale) => [locale, localePath(locale, 'participantForm', [kind])]),
  ) as LocalizedPaths
}

export function staticRouteSpecs(): StaticRouteSpec[] {
  const pages = LOCALES.flatMap((locale) =>
    STATIC_PAGES.map((page) => ({
      locale,
      page,
      path: toRoutePath(localePath(locale, page)),
      alternates: pageAlternates(page),
      cta: PAGE_CTA[page],
    })),
  )
  const healthForms = LOCALES.flatMap((locale) =>
    HEALTH_FORM_KINDS.map((formKind) => ({
      locale,
      page: 'participantForm' as const,
      path: toRoutePath(localePath(locale, 'participantForm', [formKind])),
      alternates: participantFormAlternates(formKind),
      formKind,
    })),
  )
  return [...pages, ...healthForms]
}
