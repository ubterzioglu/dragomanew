import type { ReactElement } from 'react'
import { useParams, type LoaderFunction, type Params } from 'react-router-dom'
import type { RouteRecord } from 'vite-react-ssg'
import { useContent } from '../content/ContentContext'
import type { PageContentRequest } from '../content/pageContent'
import type { ContentRepository } from '../content/repository'
import type { CategoryKey } from '../content/schema'
import { createStaticRepository } from '../content/staticRepository'
import { eventAlternates, postAlternates, productAlternates } from '../content/urls'
import { BlogPage } from '../features/blog/BlogPage'
import { PostPage } from '../features/blog/PostPage'
import { CategoryPage } from '../features/category/CategoryPage'
import { DemoIndexPage } from '../features/demo/DemoIndexPage'
import { EventDetailPage } from '../features/event/EventDetailPage'
import { HealthFormPage } from '../features/health/HealthFormPage'
import { HomePage } from '../features/home/HomePage'
import { NotFoundPage } from '../features/notFound/NotFoundPage'
import { ContactPage } from '../features/pages/ContactPage'
import { RichContentPage } from '../features/pages/RichContentPage'
import { ProductPage } from '../features/shop/ProductPage'
import { ShopPage } from '../features/shop/ShopPage'
import { TransportPage } from '../features/transport/TransportPage'
import { LOCALES, type Locale } from '../i18n/locales'
import { localePath } from '../i18n/pages'
import { isPublicRelease } from '../lib/env'
import { NOT_FOUND_HANDLE, type RouteHandle } from './routeHandle'
import { staticRouteSpecs, toRoutePath, type StaticRouteSpec } from './routePaths'
import { RootLayout } from './RootLayout'
import { RouteError } from './RouteError'

// ── Content: resolved at build time only ──
// vite-react-ssg runs loaders while prerendering and writes their result as per-page JSON,
// which the browser fetches instead of running the loader. Both env flags are constants in
// the production client build, so it drops the dynamic imports and the content data never
// ships to visitors. `npm run dev` renders in the browser only, so there the loader runs too.
const hasFullContent = import.meta.env.SSR || import.meta.env.DEV

function contentLoader(request: (params: Params) => PageContentRequest): LoaderFunction {
  return async ({ params }) => {
    if (!hasFullContent) return null
    const { loadPageContent } = await import('../content/server')
    return loadPageContent(request(params))
  }
}

async function buildTimeContent(): Promise<ContentRepository> {
  if (!hasFullContent) throw new Error('The full content set is only available while prerendering')
  const { contentData } = await import('../content/server')
  return createStaticRepository(contentData)
}

function staticContent(spec: StaticRouteSpec): PageContentRequest {
  const { locale } = spec
  switch (spec.page) {
    case 'home':
      return { kind: 'home', locale }
    case 'diving':
    case 'seaKayak':
    case 'outdoor':
    case 'transport':
    case 'shop':
      return { kind: 'category', category: spec.page, locale }
    case 'blog':
      return { kind: 'blog', locale }
    case 'about':
    case 'contact':
    case 'diveSites':
    case 'lifeguard':
    case 'privacy':
    case 'terms':
      return { kind: 'rich', page: spec.page, locale }
    case 'participantForm':
      return { kind: 'none' }
    case 'product':
      throw new Error('product pages are detail routes')
  }
}

function staticElement(spec: StaticRouteSpec): ReactElement {
  switch (spec.page) {
    case 'home':
      return <HomePage />
    case 'diving':
    case 'seaKayak':
    case 'outdoor':
      return <CategoryPage category={spec.page} />
    case 'transport':
      return <TransportPage />
    case 'shop':
      return <ShopPage />
    case 'contact':
      return <ContactPage />
    case 'blog':
      return <BlogPage />
    case 'about':
    case 'diveSites':
    case 'lifeguard':
    case 'privacy':
    case 'terms':
      return <RichContentPage pageKey={spec.page} />
    case 'participantForm':
      if (!spec.formKind) throw new Error('participantForm route without a form kind')
      return <HealthFormPage kind={spec.formKind} alternates={spec.alternates} />
    case 'product':
      throw new Error('product pages are detail routes')
  }
}

function toRouteRecord(spec: StaticRouteSpec): RouteRecord {
  const handle: RouteHandle = { locale: spec.locale, alternates: spec.alternates, cta: spec.cta }
  const element = staticElement(spec)
  const pageRequest = staticContent(spec)
  const loader = contentLoader(() => pageRequest)
  return spec.path === '' ? { index: true, element, handle, loader } : { path: spec.path, element, handle, loader }
}

// ── Detail pages: one route per language, prerendered for every visible record ──

// Lookups use the route's own language, not the context (which falls back to the 404 language).
function EventRoute({ category, locale }: { category: CategoryKey; locale: Locale }) {
  const { slug = '' } = useParams()
  const event = useContent().eventBySlug(category, locale, slug)
  return event ? <EventDetailPage event={event} /> : <NotFoundPage />
}

function PostRoute({ locale }: { locale: Locale }) {
  const { slug = '' } = useParams()
  const post = useContent().postBySlug(locale, slug)
  return post ? <PostPage post={post} /> : <NotFoundPage />
}

function ProductRoute({ locale }: { locale: Locale }) {
  const { slug = '' } = useParams()
  const product = useContent().productBySlug(locale, slug)
  return product ? <ProductPage product={product} /> : <NotFoundPage />
}

const CATEGORIES: readonly CategoryKey[] = ['diving', 'seaKayak', 'outdoor']

function detailRoutes(locale: Locale): RouteRecord[] {
  const events = CATEGORIES.map((category): RouteRecord => {
    const base = toRoutePath(localePath(locale, category))
    return {
      path: `${base}/:slug`,
      element: <EventRoute category={category} locale={locale} />,
      loader: contentLoader((params) => ({ kind: 'event', category, locale, slug: params.slug ?? '' })),
      handle: {
        locale,
        cta: 'request',
        alternates: (params, content) => {
          const event = content.eventBySlug(category, locale, params.slug ?? '')
          return event ? eventAlternates(event) : null
        },
      } satisfies RouteHandle,
      getStaticPaths: async () =>
        (await buildTimeContent())
          .events()
          .filter((e) => e.category === category)
          .map((e) => `${base}/${e.slug[locale]}`),
    }
  })

  const blogBase = toRoutePath(localePath(locale, 'blog'))
  const productBase = toRoutePath(localePath(locale, 'product'))
  return [
    ...events,
    {
      path: `${blogBase}/:slug`,
      element: <PostRoute locale={locale} />,
      loader: contentLoader((params) => ({ kind: 'post', locale, slug: params.slug ?? '' })),
      handle: {
        locale,
        alternates: (params, content) => {
          const post = content.postBySlug(locale, params.slug ?? '')
          return post ? postAlternates(post) : null
        },
      } satisfies RouteHandle,
      getStaticPaths: async () => (await buildTimeContent()).posts().map((post) => `${blogBase}/${post.slug[locale]}`),
    },
    {
      path: `${productBase}/:slug`,
      element: <ProductRoute locale={locale} />,
      loader: contentLoader((params) => ({ kind: 'product', locale, slug: params.slug ?? '' })),
      handle: {
        locale,
        alternates: (params, content) => {
          const product = content.productBySlug(locale, params.slug ?? '')
          return product ? productAlternates(product) : null
        },
      } satisfies RouteHandle,
      getStaticPaths: async () => (await buildTimeContent()).products().map((product) => `${productBase}/${product.slug[locale]}`),
    },
  ]
}

const notFoundHandle = NOT_FOUND_HANDLE

// Stage A review index; never part of a public release build.
const demoRoutes: RouteRecord[] = isPublicRelease
  ? []
  : [
      {
        path: '__demo',
        element: <DemoIndexPage />,
        loader: contentLoader(() => ({ kind: 'all' })),
        handle: { locale: 'tr', alternates: null } satisfies RouteHandle,
      },
    ]

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      ...staticRouteSpecs().map(toRouteRecord),
      ...LOCALES.flatMap(detailRoutes),
      ...demoRoutes,
      // Prerendered as /404/ for the host's error page; '*' covers client navigation.
      { path: '404', element: <NotFoundPage />, handle: notFoundHandle },
      { path: '*', element: <NotFoundPage />, handle: notFoundHandle },
    ],
  },
]
