import { z } from 'zod'

/**
 * Content model for Stage A. The same shapes become database rows in Stage B;
 * pages only see them through ContentRepository. Body text is structured
 * blocks, never HTML, so nothing from the old site is injected as markup.
 */

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase-hyphen slug')
const id = slug

/** Turkish is required (source language); other languages may be missing. */
export const localized = <T extends z.ZodType>(value: T) =>
  z.object({ tr: value, en: value.optional(), fr: value.optional(), de: value.optional() })

export const text = localized(z.string().min(1))

/** Per-language slugs are required so every page has an address in all four languages. */
export const localeSlugs = z.object({ tr: slug, en: slug, fr: slug, de: slug })

export const blockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('p'), text: z.string().min(1) }),
  z.object({ type: z.literal('h2'), text: z.string().min(1) }),
  z.object({ type: z.literal('h3'), text: z.string().min(1) }),
  z.object({ type: z.literal('ul'), items: z.array(z.string().min(1)).min(1) }),
])
export const blocks = localized(z.array(blockSchema).min(1))

/** cloner = old WordPress export, kayak-site = dragomanseakayak.com, mockup = written as sample. */
export const originSchema = z.enum(['cloner', 'kayak-site', 'mockup'])

/** Where each non-Turkish language came from (missing key = not translated). */
export const translationOriginSchema = z.object({
  en: originSchema.optional(),
  fr: originSchema.optional(),
  de: originSchema.optional(),
})

const provenance = {
  origin: originSchema,
  translationOrigin: translationOriginSchema,
  /** Old URLs or WordPress ids this record was built from. */
  sourceRefs: z.array(z.string()),
}

export const mediaRef = id

export const mediaAssetSchema = z.object({
  id,
  /** File name inside C:\temp_private\dragoman\cloner\images (read-only source). */
  sourceFile: z.string().min(1),
  /** Optimised widths produced under public/media/{id}-{w}.{avif,webp,jpg}. */
  widths: z.array(z.number().int().positive()).min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: text,
  topic: z.string().min(1),
  /** Usage rights are Dragoman's to confirm before launch (V6 §9). */
  rights: z.literal('unverified'),
  placeholder: z.boolean().default(false),
})

export const currencySchema = z.enum(['EUR', 'TRY'])
export const priceBasisSchema = z.enum(['person', 'group', 'package'])

export const eventOptionSchema = z.object({
  id,
  name: text,
  description: text.optional(),
  /** null = price not known; never treated as zero. */
  price: z.number().nonnegative().nullable(),
  currency: currencySchema,
  basis: priceBasisSchema,
})

export const faqItemSchema = z.object({ question: text, answer: text })
export const itineraryDaySchema = z.object({ title: text, description: text })

export const categoryKeySchema = z.enum(['diving', 'seaKayak', 'outdoor'])
export const statusSchema = z.enum(['draft', 'published', 'archived'])

export const subgroupSchema = z.object({
  id,
  category: categoryKeySchema,
  order: z.number().int(),
  title: text,
  intro: text.optional(),
})

export const eventSchema = z.object({
  id,
  category: categoryKeySchema,
  subgroup: id,
  order: z.number().int(),
  slug: localeSlugs,
  title: text,
  summary: text,
  body: blocks,
  duration: text.optional(),
  /** 'on_request' shows "Price on request" and never computes a total (V6 §4.3). */
  priceDisplay: z.enum(['numeric', 'on_request']),
  /** One option = plain price, no per-option head count asked. */
  options: z.array(eventOptionSchema),
  cover: mediaRef,
  gallery: z.array(mediaRef),
  includes: localized(z.array(z.string().min(1))).optional(),
  excludes: localized(z.array(z.string().min(1))).optional(),
  conditions: localized(z.array(z.string().min(1))).optional(),
  meetingPoint: text.optional(),
  faq: z.array(faqItemSchema),
  itinerary: z.array(itineraryDaySchema),
  /** Health form for diving/outdoor; sea kayak has none (scope not extended). */
  healthForm: z.enum(['diving', 'outdoor']).nullable(),
  featured: z.boolean().default(false),
  status: statusSchema,
  ...provenance,
})

export const categoryPageSchema = z.object({
  key: z.enum(['diving', 'seaKayak', 'outdoor', 'transport', 'shop']),
  intro: blocks,
  cover: mediaRef,
  ...provenance,
})

export const serviceOfferSchema = z.object({
  id,
  kind: z.enum(['transfer', 'lodging']),
  order: z.number().int(),
  title: text,
  summary: text,
  cover: mediaRef,
  ...provenance,
})

export const productSchema = z.object({
  id,
  slug: localeSlugs,
  order: z.number().int(),
  title: text,
  /** Language of the printed edition, e.g. "English edition". */
  edition: text,
  summary: text,
  body: blocks,
  price: z.number().nonnegative().nullable(),
  currency: currencySchema,
  /** Old shop prices are not assumed current (V6 §5). */
  priceVerified: z.literal(false),
  stockNote: text.optional(),
  deliveryNote: text.optional(),
  cover: mediaRef,
  gallery: z.array(mediaRef),
  status: statusSchema,
  ...provenance,
})

export const postSchema = z.object({
  id,
  slug: localeSlugs,
  date: z.iso.date(),
  title: text,
  excerpt: text,
  body: blocks,
  cover: mediaRef.optional(),
  /** Events this post talks about (shown as related links). */
  relatedEvents: z.array(id),
  status: statusSchema,
  ...provenance,
})

export const teamMemberSchema = z.object({
  id,
  order: z.number().int(),
  name: z.string().min(1),
  role: text,
  bio: text.optional(),
  photo: mediaRef.optional(),
  ...provenance,
})

export const testimonialSchema = z.object({
  id,
  author: z.string().min(1),
  text,
  rating: z.number().int().min(1).max(5),
  /** Stage A only shows sample reviews; they are never presented as real. */
  sample: z.literal(true),
})

export const richPageSchema = z.object({
  key: z.enum(['about', 'diveSites', 'lifeguard', 'privacy', 'terms', 'contact']),
  title: text,
  summary: text,
  sections: z.array(z.object({ heading: text.optional(), body: blocks })).min(1),
  cover: mediaRef.optional(),
  /** Legal placeholders and the provisional lifeguard scope carry a visible note. */
  notice: z.enum(['placeholder-legal', 'provisional-scope']).optional(),
  ...provenance,
})

export const homeContentSchema = z.object({
  hero: z.object({
    heading: text,
    subheading: text,
    tiles: z
      .array(z.object({ category: categoryKeySchema, media: mediaRef, tagline: text }))
      .length(3),
  }),
  quickLinks: z.array(z.object({ page: z.enum(['transport', 'shop']), media: mediaRef, text })).length(2),
  featured: z.array(z.object({ kind: z.enum(['event', 'post']), id })).min(1),
  why: z.array(z.object({ title: text, text })).min(3),
  ...provenance,
})

export type MediaAsset = z.infer<typeof mediaAssetSchema>
export type EventOption = z.infer<typeof eventOptionSchema>
export type DragomanEvent = z.infer<typeof eventSchema>
export type Subgroup = z.infer<typeof subgroupSchema>
export type CategoryKey = z.infer<typeof categoryKeySchema>
export type CategoryPage = z.infer<typeof categoryPageSchema>
export type ServiceOffer = z.infer<typeof serviceOfferSchema>
export type Product = z.infer<typeof productSchema>
export type Post = z.infer<typeof postSchema>
export type TeamMember = z.infer<typeof teamMemberSchema>
export type Testimonial = z.infer<typeof testimonialSchema>
export type RichPage = z.infer<typeof richPageSchema>
export type HomeContent = z.infer<typeof homeContentSchema>
export type Block = z.infer<typeof blockSchema>
export type Origin = z.infer<typeof originSchema>
