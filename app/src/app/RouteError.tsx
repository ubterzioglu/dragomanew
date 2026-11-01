import { useEffect } from 'react'
import { useLocation, useRouteError } from 'react-router-dom'
import { isLocale, type Locale } from '../i18n/locales'
import { localePath } from '../i18n/pages'
import { getUi } from '../i18n/ui'

const RELOADED_KEY = 'dragoman:reloaded-after-error'

function localeOf(pathname: string): Locale {
  const first = pathname.split('/')[1] ?? ''
  return isLocale(first) ? first : 'en'
}

function alreadyReloaded(target: string): boolean {
  try {
    return sessionStorage.getItem(RELOADED_KEY) === target
  } catch {
    return true // storage blocked: never risk a reload loop
  }
}

/**
 * Client navigation fetches the next page's content JSON. When that fails (a deploy replaced
 * the files, the network dropped), every page is still prerendered HTML: load it directly,
 * once. Rendered outside RootLayout, so it uses no layout providers.
 */
export function RouteError() {
  const error = useRouteError()
  const { pathname, search, hash } = useLocation()
  const target = pathname + search + hash
  const reload = !alreadyReloaded(target)
  useEffect(() => {
    if (!reload) return
    try {
      sessionStorage.setItem(RELOADED_KEY, target)
    } catch {
      return
    }
    // The router has usually moved the address bar to the target already, and assigning the same URL
    // with a #fragment only scrolls: reload in that case.
    const { pathname: here, search: query, hash: fragment } = window.location
    if (here + query + fragment === target) window.location.reload()
    else window.location.assign(target)
  }, [reload, target])
  // While prerendering, a failing page must fail the build rather than ship this fallback.
  if (import.meta.env.SSR) throw error

  const locale = localeOf(pathname)
  const ui = getUi(locale)
  return (
    <main className="container-page py-20 text-center" lang={locale}>
      <h1 className="text-4xl font-bold">{ui.notFound.title}</h1>
      <p className="mt-3 text-ink-muted">{ui.notFound.body}</p>
      <a href={localePath(locale, 'home')} className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-brand-green px-6 font-semibold text-white">
        {ui.notFound.backHome}
      </a>
    </main>
  )
}
