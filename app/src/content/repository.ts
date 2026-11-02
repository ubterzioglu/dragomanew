import type { Locale } from '../i18n/locales'
import type { RequestKind } from '../shared/requests/payload.ts'
import type {
  CategoryKey,
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
import type { FormRelease } from './staticRepository'

/** Detail records whose page may show a Turkish fallback (dalga2-sozlesme §7, Q2). */
export type TranslationGapKind = 'event' | 'post' | 'product' | 'rich'

/**
 * The only way templates read content. Stage A implements it over static
 * typed data (src/content/data); Stage B swaps in the database-backed version.
 * All list methods return visitor-visible records only: published, never
 * archived or draft, in the manually managed order.
 */
export interface ContentRepository {
  media(id: string): MediaAsset
  home(): HomeContent
  categoryPage(key: CategoryPage['key']): CategoryPage
  subgroups(category: CategoryKey): Subgroup[]
  eventsInSubgroup(subgroupId: string): DragomanEvent[]
  /** Every visitor-visible event, all categories (route generation, featured). */
  events(): DragomanEvent[]
  eventById(id: string): DragomanEvent | null
  eventBySlug(category: CategoryKey, locale: Locale, slug: string): DragomanEvent | null
  serviceOffers(kind: ServiceOffer['kind']): ServiceOffer[]
  products(): Product[]
  productBySlug(locale: Locale, slug: string): Product | null
  /** Newest first. */
  posts(): Post[]
  postById(id: string): Post | null
  postBySlug(locale: Locale, slug: string): Post | null
  team(): TeamMember[]
  testimonials(): Testimonial[]
  richPage(key: RichPage['key']): RichPage
  /** The published definition of a request form (fixture and pages without a release: version 0, the built-in one). */
  form(kind: RequestKind): FormRelease
  /** Languages in which this record's title, summary or body falls back to Turkish (never 'tr'). */
  translationGaps(kind: TranslationGapKind, id: string): readonly Locale[]
}
