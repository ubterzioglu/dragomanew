import { isLocale, LOCALES, SOURCE_LOCALE, type Locale } from '../i18n/locales'
import type { RequestKind } from '../shared/requests/payload.ts'
import type { CategoryKey, CategoryPage, DragomanEvent, Post, Product, RichPage } from './schema'
import { createStaticRepository, EMPTY_CONTENT, type ContentData } from './staticRepository'

/**
 * Which content a page renders. Every route declares one; the build resolves it
 * into the slice the page is served with (per-page JSON), so the browser never
 * downloads the whole content set.
 */
export type PageContentRequest =
  | { kind: 'home'; locale: Locale }
  | { kind: 'category'; category: CategoryPage['key']; locale: Locale }
  | { kind: 'blog'; locale: Locale }
  | { kind: 'rich'; page: RichPage['key']; locale: Locale }
  | { kind: 'event'; category: CategoryKey; locale: Locale; slug: string }
  | { kind: 'post'; locale: Locale; slug: string }
  | { kind: 'product'; locale: Locale; slug: string }
  /** Stage A review index: lists every record with its origin. */
  | { kind: 'all' }
  | { kind: 'none' }

/**
 * List pages render records as cards (title, summary, cover, price, duration). Their detail
 * fields are emptied so a category or the blog does not ship every full text; the record's
 * own page gets it complete, search texts (seo) included: only the record's own head uses them.
 * tests/unit/pageContent.test.ts proves no list page renders them.
 */
const asEventCard = (event: DragomanEvent): DragomanEvent => ({
  ...event,
  body: { tr: [] },
  gallery: [],
  includes: undefined,
  excludes: undefined,
  conditions: undefined,
  meetingPoint: undefined,
  faq: [],
  itinerary: [],
  seo: undefined,
})
const asPostCard = (post: Post): Post => ({ ...post, body: { tr: [] }, seo: undefined })

const byId =<T extends { id: string }>(records: readonly T[], ids: ReadonlySet<string>): T[] => records.filter((record) => ids.has(record.id))

// Records come from the repository, so drafts and archived records never reach a page slice.
function select(data: ContentData, request: PageContentRequest): Omit<ContentData, 'media' | 'forms' | 'translationGaps'> {
  const content = createStaticRepository(data)
  switch (request.kind) {
    case 'home': {
      const home = content.home()
      const featured = (kind: 'event' | 'post') => home.featured.filter((ref) => ref.kind === kind).map((ref) => ref.id)
      const latestPosts = content.posts().slice(0, 3).map((post) => post.id)
      return {
        ...EMPTY_CONTENT,
        home,
        events: byId(content.events(), new Set(featured('event'))).map(asEventCard),
        posts: byId(content.posts(), new Set([...featured('post'), ...latestPosts])).map(asPostCard),
        testimonials: content.testimonials(),
      }
    }
    case 'category': {
      const { category } = request
      const categoryPages = data.categoryPages.filter((page) => page.key === category)
      if (category === 'transport') return { ...EMPTY_CONTENT, categoryPages, serviceOffers: data.serviceOffers }
      if (category === 'shop') return { ...EMPTY_CONTENT, categoryPages, products: content.products() }
      return {
        ...EMPTY_CONTENT,
        categoryPages,
        subgroups: content.subgroups(category),
        events: content.events().filter((event) => event.category === category).map(asEventCard),
      }
    }
    case 'blog':
      return { ...EMPTY_CONTENT, posts: content.posts().map(asPostCard) }
    case 'rich':
      return {
        ...EMPTY_CONTENT,
        richPages: data.richPages.filter((page) => page.key === request.page),
        team: request.page === 'about' ? data.team : [],
      }
    case 'event': {
      const event = content.eventBySlug(request.category, request.locale, request.slug)
      return { ...EMPTY_CONTENT, events: event ? [event] : [] }
    }
    case 'post': {
      const post = content.postBySlug(request.locale, request.slug)
      return { ...EMPTY_CONTENT, posts: post ? [post] : [], events: post ? byId(content.events(), new Set(post.relatedEvents)).map(asEventCard) : [] }
    }
    case 'product': {
      const product = content.productBySlug(request.locale, request.slug)
      return { ...EMPTY_CONTENT, products: product ? [product] : [] }
    }
    case 'all':
      // The review index lists every record, archived ones included, with its status.
      return data
    case 'none':
      return EMPTY_CONTENT
  }
}

/** Every string inside a value; media are referenced by id from any record field. */
function strings(value: unknown, found: Set<string>): Set<string> {
  if (typeof value === 'string') found.add(value)
  else if (Array.isArray(value)) value.forEach((item) => strings(item, found))
  else if (value !== null && typeof value === 'object') Object.values(value).forEach((item) => strings(item, found))
  return found
}

/** Source bookkeeping is for the content report, not for visitors (security review L2). */
function withoutSourceDetails<T extends object>(record: T): T {
  return {
    ...record,
    ...('sourceRefs' in record ? { sourceRefs: [] } : {}),
    ...('sourceFile' in record ? { sourceFile: '' } : {}),
  }
}

// Localized values every page needs in all four languages: the language switcher links to each.
const KEEP_ALL_LOCALES = new Set(['slug'])

const isLocalized = (value: object): boolean => {
  const keys = Object.keys(value)
  return keys.includes(SOURCE_LOCALE) && keys.every((key) => isLocale(key))
}

/**
 * Keeps the page's language and the Turkish source (pick() falls back to it) in every
 * localized text. Slugs stay complete: the language switcher links to all four pages.
 */
function forLocale<T>(value: T, locale: Locale): T {
  if (Array.isArray(value)) return value.map((item: unknown) => forLocale(item, locale)) as T
  if (value === null || typeof value !== 'object') return value
  if (isLocalized(value)) {
    const localized = value as Record<string, unknown>
    return { [SOURCE_LOCALE]: localized[SOURCE_LOCALE], ...(locale in localized ? { [locale]: localized[locale] } : {}) } as T
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, KEEP_ALL_LOCALES.has(key) ? item : forLocale(item, locale)])) as T
}

/** The request forms a page renders: the event form, transport + lodging, contact (dalga2-sozlesme §7). */
function formsOf(request: PageContentRequest): readonly RequestKind[] {
  if (request.kind === 'event') return ['event']
  if (request.kind === 'category' && request.category === 'transport') return ['transport', 'lodging']
  if (request.kind === 'rich' && request.page === 'contact') return ['contact']
  if (request.kind === 'all') return ['event', 'transport', 'lodging', 'contact']
  return []
}

type Localized = { tr: unknown } & Partial<Record<Locale, unknown>>

/** Languages in which any of these texts would fall back to Turkish. */
const gapsOf = (texts: readonly (Localized | undefined)[]): Locale[] =>
  LOCALES.filter((locale) => locale !== SOURCE_LOCALE && texts.some((value) => value !== undefined && value[locale] === undefined))

/**
 * Translation gaps of the detail records a page shows in full (title, summary/excerpt, body), from the
 * complete record: the slice keeps only one language, so the page could not tell otherwise which of
 * its alternates exist (dalga2-sozlesme §7, Q2: a fallback page is noindex and leaves hreflang).
 */
export function translationGaps(records: {
  events?: readonly DragomanEvent[]
  posts?: readonly Post[]
  products?: readonly Product[]
  richPages?: readonly RichPage[]
}): Record<string, Locale[]> {
  const entries: [string, Locale[]][] = [
    ...(records.events ?? []).map((event): [string, Locale[]] => [`event:${event.id}`, gapsOf([event.title, event.summary, event.body])]),
    ...(records.posts ?? []).map((post): [string, Locale[]] => [`post:${post.id}`, gapsOf([post.title, post.excerpt, post.body])]),
    ...(records.products ?? []).map((product): [string, Locale[]] => [`product:${product.id}`, gapsOf([product.title, product.summary, product.body])]),
    ...(records.richPages ?? []).map((page): [string, Locale[]] => [`rich:${page.key}`, gapsOf([page.title, page.summary, ...page.sections.map((section) => section.body)])]),
  ]
  return Object.fromEntries(entries.filter(([, locales]) => locales.length > 0))
}

/** Detail records of a page (cards on list pages are not, so they never mark a page as fallback). */
function detailRecords(records: Omit<ContentData, 'media' | 'forms' | 'translationGaps'>, request: PageContentRequest): Parameters<typeof translationGaps>[0] {
  if (request.kind === 'event') return { events: records.events }
  if (request.kind === 'post') return { posts: records.posts }
  if (request.kind === 'product') return { products: records.products }
  if (request.kind === 'rich') return { richPages: records.richPages }
  return {}
}

/** The slice of content one page needs: its records plus the media they reference. */
export function pageContent(data: ContentData, request: PageContentRequest): ContentData {
  const records = select(data, request)
  const referenced = strings(records, new Set())
  const forms = Object.fromEntries(formsOf(request).flatMap((kind) => (data.forms[kind] ? [[kind, data.forms[kind]]] : [])))
  const slice: ContentData = {
    media: data.media.filter((asset) => referenced.has(asset.id)).map(withoutSourceDetails),
    home: records.home ? withoutSourceDetails(records.home) : null,
    categoryPages: records.categoryPages.map(withoutSourceDetails),
    subgroups: records.subgroups,
    events: records.events.map(withoutSourceDetails),
    serviceOffers: records.serviceOffers.map(withoutSourceDetails),
    products: records.products.map(withoutSourceDetails),
    posts: records.posts.map(withoutSourceDetails),
    team: records.team.map(withoutSourceDetails),
    testimonials: records.testimonials.map(withoutSourceDetails),
    richPages: records.richPages.map(withoutSourceDetails),
    forms,
    translationGaps: translationGaps(detailRecords(records, request)),
  }
  // Requests without a locale (review index, empty pages) keep every translation.
  return 'locale' in request ? forLocale(slice, request.locale) : slice
}
