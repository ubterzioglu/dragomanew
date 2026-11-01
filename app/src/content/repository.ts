import type { Locale } from '../i18n/locales'
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
}
