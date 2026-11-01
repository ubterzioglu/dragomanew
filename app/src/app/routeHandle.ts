import type { Params, UIMatch } from 'react-router-dom'
import type { ContentRepository } from '../content/repository'
import { isLocale, type Locale } from '../i18n/locales'
import type { LocalizedPaths } from '../i18n/pages'

/** What the mobile action bar's second button does on a given page. */
export type PageCta = 'contact' | 'request' | 'transport'

type Alternates = LocalizedPaths | null

/** Data every route carries so the shared layout knows language and alternates. */
export interface RouteHandle {
  locale: Locale
  /**
   * Same page in every language; null when there is no counterpart (404).
   * Detail routes compute it from their :slug parameter and the page's content.
   */
  alternates: Alternates | ((params: Params, content: ContentRepository) => Alternates)
  cta?: PageCta
  /** The page is a 404 page, which the host serves at any missing address. */
  notFound?: true
}

export interface ResolvedHandle {
  locale: Locale
  alternates: Alternates
  cta?: PageCta
  notFound?: true
}

function isRouteHandle(value: unknown): value is RouteHandle {
  if (!value || typeof value !== 'object') return false
  const locale = (value as { locale?: unknown }).locale
  return typeof locale === 'string' && isLocale(locale)
}

/**
 * Matches the prerendered 404 page of each language (/404/, /tr/404/ …), which
 * the host serves for any missing URL under that language's prefix (deploy/nginx).
 */
export function notFoundHandle(locale: Locale): ResolvedHandle {
  return { locale, alternates: null, notFound: true }
}

/**
 * The deepest matched route's handle wins (detail page over category). A
 * detail route whose record does not exist renders the 404 page, so it takes
 * its language's 404 handle and hydrates the same tree as the served 404 HTML.
 */
export function findRouteHandle(matches: readonly UIMatch[], content: ContentRepository): ResolvedHandle | null {
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const match = matches[i]
    if (match && isRouteHandle(match.handle)) {
      const { locale, alternates, cta, notFound } = match.handle
      if (typeof alternates !== 'function') return { locale, cta, alternates, notFound }
      const resolved = alternates(match.params, content)
      return resolved ? { locale, cta, alternates: resolved } : notFoundHandle(locale)
    }
  }
  return null
}
