import type { FullContentData } from '../staticRepository'
import { categoryPages } from './categories'
import { divingEvents } from './events/diving'
import { DEFAULT_FORMS } from './forms'
import { outdoorEvents } from './events/outdoor'
import { seaKayakEvents } from './events/seaKayak'
import { homeContent } from './home'
import { media } from './media'
import { richPages } from './pages'
import { posts } from './posts'
import { products } from './products'
import { withSeo } from './seo/build'
import { postSeo, productSeo } from './seo/catalog'
import { eventSeo } from './seo/events'
import { categoryPageSeo, homeSeo, richPageSeo } from './seo/pages'
import { serviceOffers } from './services'
import { subgroups } from './subgroups'
import { team } from './team'
import { testimonials } from './testimonials'

/**
 * Stage A sample content. Every record carries its origin (cloner / kayak-site / mockup).
 * Search titles/descriptions live in ./seo and are attached here to keep the record files readable.
 */
export const contentData: FullContentData = {
  media,
  home: { ...homeContent, seo: { ...homeSeo, ...homeContent.seo } },
  categoryPages: withSeo(categoryPages, (page) => page.key, categoryPageSeo),
  subgroups,
  events: withSeo([...divingEvents, ...seaKayakEvents, ...outdoorEvents], (event) => event.id, eventSeo),
  serviceOffers,
  products: withSeo(products, (product) => product.id, productSeo),
  posts: withSeo(posts, (post) => post.id, postSeo),
  team,
  testimonials,
  richPages: withSeo(richPages, (page) => page.key, richPageSeo),
  forms: DEFAULT_FORMS,
  translationGaps: {},
}
