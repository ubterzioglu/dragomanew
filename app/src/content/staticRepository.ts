import type { Locale } from '../i18n/locales'
import type { ContentRepository } from './repository'
import type {
  CategoryPage,
  DragomanEvent,
  HomeContent,
  MediaAsset,
  Post,
  Product,
  RichPage,
  ServiceOffer,
  Subgroup,
  TeamMember,
  Testimonial,
} from './schema'

export interface ContentData {
  media: readonly MediaAsset[]
  /** Null in page slices that do not render the home page. */
  home: HomeContent | null
  categoryPages: readonly CategoryPage[]
  subgroups: readonly Subgroup[]
  events: readonly DragomanEvent[]
  serviceOffers: readonly ServiceOffer[]
  products: readonly Product[]
  posts: readonly Post[]
  team: readonly TeamMember[]
  testimonials: readonly Testimonial[]
  richPages: readonly RichPage[]
}

/** The complete content set (build time only); unlike a page slice it always has the home page. */
export type FullContentData = ContentData & { home: HomeContent }

/** Content of a page that renders no records (participant form, 404). */
export const EMPTY_CONTENT: ContentData = {
  media: [],
  home: null,
  categoryPages: [],
  subgroups: [],
  events: [],
  serviceOffers: [],
  products: [],
  posts: [],
  team: [],
  testimonials: [],
  richPages: [],
}

/** Loader data is untrusted JSON until it has the slice's shape. */
export function isContentData(value: unknown): value is ContentData {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return Object.keys(EMPTY_CONTENT).every((key) => (key === 'home' ? typeof record.home === 'object' : Array.isArray(record[key])))
}

const byOrder =<T extends { order: number }>(a: T, b: T): number => a.order - b.order
const isVisible = (record: { status: 'draft' | 'published' | 'archived' }): boolean => record.status === 'published'

function required<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`Content missing: ${what}`)
  return value
}

/** Read-only repository over static data; never mutates its input. */
export function createStaticRepository(data: ContentData): ContentRepository {
  const mediaById = new Map(data.media.map((asset) => [asset.id, asset]))
  const visibleEvents = data.events.filter(isVisible)
  const visiblePosts = data.posts.filter(isVisible)
  const visibleProducts = data.products.filter(isVisible)

  return {
    media: (id) => required(mediaById.get(id), `media "${id}"`),
    home: () => required(data.home ?? undefined, 'home page'),
    categoryPage: (key) => required(data.categoryPages.find((page) => page.key === key), `category page "${key}"`),
    subgroups: (category) => data.subgroups.filter((group) => group.category === category).toSorted(byOrder),
    eventsInSubgroup: (subgroupId) => visibleEvents.filter((event) => event.subgroup === subgroupId).toSorted(byOrder),
    events: () => [...visibleEvents],
    eventById: (id) => visibleEvents.find((event) => event.id === id) ?? null,
    eventBySlug: (category, locale: Locale, slug) =>
      visibleEvents.find((event) => event.category === category && event.slug[locale] === slug) ?? null,
    serviceOffers: (kind) => data.serviceOffers.filter((offer) => offer.kind === kind).toSorted(byOrder),
    products: () => visibleProducts.toSorted(byOrder),
    productBySlug: (locale, slug) => visibleProducts.find((product) => product.slug[locale] === slug) ?? null,
    posts: () => visiblePosts.toSorted((a, b) => b.date.localeCompare(a.date)),
    postById: (id) => visiblePosts.find((post) => post.id === id) ?? null,
    postBySlug: (locale, slug) => visiblePosts.find((post) => post.slug[locale] === slug) ?? null,
    team: () => data.team.toSorted(byOrder),
    testimonials: () => [...data.testimonials],
    richPage: (key) => required(data.richPages.find((page) => page.key === key), `page "${key}"`),
  }
}
