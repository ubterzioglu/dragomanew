import type { FormKind } from '../../features/forms/submission'
import { LOCALES, type Locale } from '../../i18n/locales'
import { localePath } from '../../i18n/pages'
import { ga4Id } from '../env'

/**
 * GA4 through gtag.js, loaded only once the visitor grants analytics (CookieConsent). Before that
 * nothing reaches Google: no script, no request, no cookie. Google's inline snippet lives here as
 * bundled code, so the page policy needs no 'unsafe-inline'.
 *
 * Events carry no personal data: no names, e-mail addresses, phone numbers, field values,
 * request references or query strings. Every event uses the page's address without its query.
 */
export const GTAG_SCRIPT_URL = 'https://www.googletagmanager.com/gtag/js'

export interface Ga4 {
  /** Turns measurement on; the first call loads gtag.js. */
  grant(): void
  /** Stops measurement at once and removes the GA cookies; the script is not loaded again. */
  withdraw(): void
  /** One page of the single-page app; `path` is the router's pathname. */
  pageView(path: string, title: string): void
  /** A request the server stored (never sent for the health form). */
  formSent(kind: FormKind, locale: Locale): void
  whatsappClick(locale: Locale): void
}

/** The globals gtag.js reads: its data layer and Google's per-property opt-out flag. */
type GaGlobals = { dataLayer?: unknown[] } & Partial<Record<`ga-disable-${string}`, boolean>>

const gaGlobals = (): GaGlobals => window as unknown as GaGlobals

/**
 * Participant (health) form pages count as their form root only: whatever follows it in the path,
 * such as a person's own link (Dalga 3), never reaches Google.
 */
// Computed per call, not at import, so a build without VITE_GA4_ID can drop this module entirely.
const participantFormRoots = (): string[] => LOCALES.map((locale) => localePath(locale, 'participantForm'))

/** A path as the router matches it: decoded and lower case (a malformed escape is left as it is). */
function asRouted(path: string): string {
  try {
    return decodeURIComponent(path).toLowerCase()
  } catch {
    return path.toLowerCase()
  }
}

/** The part of a site path GA4 may see: no query, no fragment, no participant-form details. */
export function measurablePath(path: string): string {
  const bare = path.split(/[?#]/, 1)[0] ?? ''
  const routed = asRouted(bare)
  return participantFormRoots().find((root) => routed.startsWith(root)) ?? bare
}

/**
 * The referrer GA4 may see, or '' for none: this site's own pages as measurablePath has them,
 * another site by its origin only (its path may name a person; GA4 attributes by host anyway).
 */
function measurableReferrer(href: string): string {
  try {
    const url = new URL(href)
    return url.origin === window.location.origin ? `${url.origin}${measurablePath(url.pathname)}` : `${url.origin}/`
  } catch {
    return ''
  }
}

/** Analytics never breaks the page: a blocker may have replaced the data layer or the cookie jar. */
const failSafe =
  <A extends unknown[]>(run: (...args: A) => void) =>
  (...args: A): void => {
    try {
      run(...args)
    } catch {
      // Nothing to do: the visitor's page matters more than one lost hit.
    }
  }

/** The host and each parent domain a cookie can be set for, down to the registrable one (two labels). */
export function cookieDomains(hostname: string): string[] {
  const labels = hostname.split('.')
  if (labels.length < 2 || /^[\d.]+$/.test(hostname)) return []
  return labels.slice(0, -1).map((_, index) => labels.slice(index).join('.'))
}

/** Expires the GA cookies (_ga, _ga_<container>) whether gtag.js set them on the host or a parent domain. */
export function expireGaCookies(jar: { cookie: string }, hostname: string): void {
  const names = jar.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0] ?? '')
    .filter((name) => name === '_ga' || name.startsWith('_ga_'))
  for (const name of names) {
    for (const domain of [undefined, ...cookieDomains(hostname)]) {
      jar.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ''}`
    }
  }
}

export function isWhatsAppLink(href: string | null, base: string): boolean {
  if (!href) return false
  try {
    const { hostname } = new URL(href, base)
    return hostname === 'wa.me' || hostname === 'api.whatsapp.com'
  } catch {
    return false
  }
}

export function createGa4(id: string): Ga4 {
  const disableFlag = `ga-disable-${id}` as const
  let loaded = false
  let granted = false

  // Google's gtag(): gtag.js runs the Arguments objects it finds in the data layer, not arrays.
  function gtag(..._args: unknown[]): void {
    // eslint-disable-next-line prefer-rest-params -- an array would be ignored by gtag.js
    ;(gaGlobals().dataLayer ??= []).push(arguments)
  }

  const pageLocation = (path: string) => `${window.location.origin}${measurablePath(path)}`

  function load(): void {
    loaded = true
    // Ads stay off: marketing has no tags, and the property is not linked to Google Ads.
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })
    gtag('js', new Date())
    const referrer = measurableReferrer(document.referrer)
    gtag('config', id, {
      // The site is a single-page app after hydration: CookieConsent sends each page view itself.
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      // 395 days, not renewed on each hit (CNIL: at most 13 months); the lawyer may shorten it.
      cookie_expires: 34_128_000,
      cookie_update: false,
      page_location: pageLocation(window.location.pathname),
      ...(referrer ? { page_referrer: referrer } : {}),
    })
    const script = document.createElement('script')
    script.async = true
    script.src = `${GTAG_SCRIPT_URL}?id=${encodeURIComponent(id)}`
    document.head.append(script)
  }

  function send(name: string, params: Record<string, string>): void {
    if (granted) gtag('event', name, params)
  }

  return {
    grant: failSafe(() => {
      if (granted) return
      gaGlobals()[disableFlag] = false
      if (!loaded) load()
      else gtag('consent', 'update', { analytics_storage: 'granted' })
      granted = true
    }),
    withdraw: failSafe(() => {
      // Stop first: whatever fails below, nothing more is sent.
      granted = false
      gaGlobals()[disableFlag] = true
      if (loaded) gtag('consent', 'update', { analytics_storage: 'denied' })
      expireGaCookies(document, window.location.hostname)
    }),
    pageView: failSafe((path: string, title: string) => {
      if (!granted) return
      const url = pageLocation(path)
      // Later events (form, WhatsApp) belong to this page, not to the one gtag.js was loaded on.
      gtag('set', { page_location: url })
      send('page_view', { page_location: url, page_title: title })
    }),
    formSent: failSafe((kind: FormKind, locale: Locale) => {
      if (kind !== 'health') send('generate_lead', { form_kind: kind, locale })
    }),
    whatsappClick: failSafe((locale: Locale) => {
      send('whatsapp_click', { locale })
    }),
  }
}

/** The site's GA4, or null while VITE_GA4_ID is unset: then nothing on the site measures anything. */
export const siteAnalytics: Ga4 | null = ga4Id ? createGa4(ga4Id) : null
