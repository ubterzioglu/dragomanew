/**
 * Site origin for canonical and hreflang URLs. The site first goes up on a
 * temporary host (https://notyetbro.club/) and moves to its own domain later,
 * so the origin comes from VITE_SITE_ORIGIN at build time. vite.config.ts calls
 * this too, so a malformed value stops the build instead of shipping bad URLs.
 * scripts/check-dist.mjs reads the same variable.
 */
export const DEFAULT_SITE_ORIGIN = 'https://dragoman-turkey.com'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

export function resolveSiteOrigin(raw: string | undefined): string {
  const value = raw?.trim()
  if (!value) return DEFAULT_SITE_ORIGIN

  const reject = (reason: string): never => {
    throw new Error(`VITE_SITE_ORIGIN "${value}" ${reason}; expected e.g. https://notyetbro.club`)
  }
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return reject('is not an absolute URL')
  }
  const local = LOCAL_HOSTS.has(url.hostname)
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) reject('must use https')
  if (url.username || url.password) reject('must not contain credentials')
  if (url.pathname !== '/' || url.search || url.hash) reject('must be an origin only (no path, query or hash)')
  return url.origin
}
