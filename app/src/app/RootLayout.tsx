import { useEffect, useMemo } from 'react'
import { Outlet, ScrollRestoration, useMatches, type UIMatch } from 'react-router-dom'
import { DepthGauge } from '../components/layout/DepthGauge'
import { DiveBackground } from '../components/layout/DiveBackground'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'
import { MobileActionBar } from '../components/layout/MobileActionBar'
import { SampleBanner } from '../components/layout/SampleBanner'
import { NotFoundPageProvider } from '../components/layout/SiteNavLink'
import { SkipLink } from '../components/layout/SkipLink'
import { ContentProvider } from '../content/ContentContext'
import { createStaticRepository, EMPTY_CONTENT, isContentData, type ContentData } from '../content/staticRepository'
import { LocaleProvider } from '../i18n/LocaleContext'
import { pageAlternates } from '../i18n/pages'
import { isPublicRelease } from '../lib/env'
import { findRouteHandle } from './routeHandle'

/** The page's content slice: its route's loader data (per-page JSON in the browser, see routes.tsx). */
function pageContentOf(matches: readonly UIMatch[]): ContentData {
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const data = matches[i]?.data
    if (isContentData(data)) return data
  }
  return EMPTY_CONTENT
}

export function RootLayout() {
  const matches = useMatches()
  const data = pageContentOf(matches)
  const content = useMemo(() => createStaticRepository(data), [data])
  const handle = findRouteHandle(matches, content)
  // Marks the page interactive. The app script starts after the first paint, so tests wait for this.
  useEffect(() => {
    document.documentElement.dataset.hydrated = ''
  }, [])
  const locale = handle?.locale ?? 'en'
  // Pages without a counterpart (404, demo index) let the switcher go to each language's home.
  const alternates = handle?.alternates ?? pageAlternates('home')

  return (
    <ContentProvider repository={content}>
      <LocaleProvider locale={locale}>
        <NotFoundPageProvider value={handle?.notFound ?? false}>
          {/* The footer's own bottom padding keeps it clear of the fixed mobile bar (Footer.tsx). */}
          <div className="flex min-h-dvh flex-col">
            <DiveBackground />
            <SkipLink />
            {!isPublicRelease && <SampleBanner />}
            <Header alternates={alternates} />
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
              <Outlet />
            </main>
            <Footer />
            <MobileActionBar cta={handle?.cta ?? 'contact'} />
            <DepthGauge />
          </div>
        </NotFoundPageProvider>
        {/* Hash entries from native "#id" navigation all share the "default" key; give them their own. */}
        <ScrollRestoration getKey={(location) => (location.hash ? location.pathname + location.hash : location.key)} />
      </LocaleProvider>
    </ContentProvider>
  )
}
