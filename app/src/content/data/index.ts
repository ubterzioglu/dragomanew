import type { FullContentData } from '../staticRepository'
import { categoryPages } from './categories'
import { divingEvents } from './events/diving'
import { outdoorEvents } from './events/outdoor'
import { seaKayakEvents } from './events/seaKayak'
import { homeContent } from './home'
import { media } from './media'
import { richPages } from './pages'
import { posts } from './posts'
import { products } from './products'
import { serviceOffers } from './services'
import { subgroups } from './subgroups'
import { team } from './team'
import { testimonials } from './testimonials'

/** Stage A sample content. Every record carries its origin (cloner / kayak-site / mockup). */
export const contentData: FullContentData = {
  media,
  home: homeContent,
  categoryPages,
  subgroups,
  events: [...divingEvents, ...seaKayakEvents, ...outdoorEvents],
  serviceOffers,
  products,
  posts,
  team,
  testimonials,
  richPages,
}
