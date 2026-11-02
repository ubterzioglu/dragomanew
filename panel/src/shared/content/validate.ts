import type { z } from 'zod'
import { mediaSourceSchema, type MediaSource } from './release.ts'
import {
  categoryPageSchema,
  eventSchema,
  homeContentSchema,
  mediaAssetSchema,
  postSchema,
  productSchema,
  richPageSchema,
  serviceOfferSchema,
  subgroupSchema,
  teamMemberSchema,
  testimonialSchema,
  type ContentSet,
  type ContentType,
  type MediaAsset,
} from './schema.ts'

export type { ContentSet } from './schema.ts'

/**
 * Whole-set rules on top of the per-record schemas (from the Stage A content.test.ts invariants).
 * Yayınla and the site build both run this; an empty list means the set may be published.
 * Sample-content facts (inventory, prices, amounts) are not rules and stay in the fixture tests.
 */

export type ContentIssueCode =
  | 'schema'
  | 'duplicate_id'
  | 'duplicate_slug'
  | 'missing_subgroup'
  | 'missing_media'
  | 'invisible_reference'
  | 'missing_page'
  | 'html_in_text'
  | 'email_in_text'

export interface ContentIssue {
  code: ContentIssueCode
  recordType: ContentType | 'media'
  recordId: string
  /** JSON Pointer inside the record. */
  path?: string
  message: string
}

export const CATEGORY_PAGE_KEYS = ['diving', 'seaKayak', 'outdoor', 'transport', 'shop'] as const
export const RICH_PAGE_KEYS = ['about', 'diveSites', 'lifeguard', 'privacy', 'terms', 'contact'] as const

const LOCALES = ['tr', 'en', 'fr', 'de'] as const
const HTML = /<[a-z!/][^>]*>/i
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/g
/** The only address content may show is the business inbox (info@…). */
const ALLOWED_EMAIL = /^info@/i

interface RecordRef {
  recordType: ContentType | 'media'
  recordId: string
  record: unknown
  schema: z.ZodType
}

const pointer = (segments: readonly (string | number | symbol)[]): string =>
  segments.map((segment) => `/${String(segment).replaceAll('~', '~0').replaceAll('/', '~1')}`).join('')

function records(set: ContentSet<MediaAsset | MediaSource>): RecordRef[] {
  const of = <T extends object>(recordType: ContentType, list: readonly T[], schema: z.ZodType, key: (record: T) => string): RecordRef[] =>
    list.map((record) => ({ recordType, recordId: key(record), record, schema }))
  return [
    ...set.media.map((media): RecordRef => ({ recordType: 'media', recordId: media.id, record: media, schema: 'storage' in media ? mediaSourceSchema : mediaAssetSchema })),
    ...(set.home ? [{ recordType: 'home' as const, recordId: 'home', record: set.home, schema: homeContentSchema }] : []),
    ...of('category_page', set.categoryPages, categoryPageSchema, (page) => page.key),
    ...of('subgroup', set.subgroups, subgroupSchema, (group) => group.id),
    ...of('event', set.events, eventSchema, (event) => event.id),
    ...of('service_offer', set.serviceOffers, serviceOfferSchema, (offer) => offer.id),
    ...of('product', set.products, productSchema, (product) => product.id),
    ...of('post', set.posts, postSchema, (post) => post.id),
    ...of('team_member', set.team, teamMemberSchema, (member) => member.id),
    ...of('testimonial', set.testimonials, testimonialSchema, (testimonial) => testimonial.id),
    ...of('rich_page', set.richPages, richPageSchema, (page) => page.key),
  ]
}

function schemaIssues(refs: readonly RecordRef[]): ContentIssue[] {
  return refs.flatMap(({ recordType, recordId, record, schema }) => {
    const result = schema.safeParse(record)
    return result.success ? [] : result.error.issues.map((issue) => ({ code: 'schema' as const, recordType, recordId, path: pointer(issue.path), message: issue.message }))
  })
}

function duplicates<T>(list: readonly T[], key: (item: T) => string): string[] {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const item of list) {
    const value = key(item)
    if (seen.has(value)) repeated.add(value)
    seen.add(value)
  }
  return [...repeated]
}

function duplicateIdIssues(set: ContentSet<MediaAsset | MediaSource>): ContentIssue[] {
  const issue = (recordType: ContentIssue['recordType'], recordId: string, message = 'id used more than once'): ContentIssue => ({ code: 'duplicate_id', recordType, recordId, message })
  return [
    ...duplicates(set.media, (media) => media.id).map((id) => issue('media', id)),
    ...duplicates(set.categoryPages, (page) => page.key).map((key) => issue('category_page', key)),
    ...duplicates(set.subgroups, (group) => group.id).map((id) => issue('subgroup', id)),
    ...duplicates(set.events, (event) => event.id).map((id) => issue('event', id)),
    ...duplicates(set.serviceOffers, (offer) => offer.id).map((id) => issue('service_offer', id)),
    ...duplicates(set.products, (product) => product.id).map((id) => issue('product', id)),
    ...duplicates(set.posts, (post) => post.id).map((id) => issue('post', id)),
    ...duplicates(set.team, (member) => member.id).map((id) => issue('team_member', id)),
    ...duplicates(set.testimonials, (testimonial) => testimonial.id).map((id) => issue('testimonial', id)),
    ...duplicates(set.richPages, (page) => page.key).map((key) => issue('rich_page', key)),
    ...set.events.flatMap((event) => duplicates(event.options, (option) => option.id).map((id) => ({ ...issue('event', event.id, `option id "${id}" used more than once`), path: '/options' }))),
  ]
}

function duplicateSlugIssues(set: ContentSet<MediaAsset | MediaSource>): ContentIssue[] {
  const scoped = <T extends { id: string; slug: Record<(typeof LOCALES)[number], string> }>(recordType: ContentType, list: readonly T[], scope: (record: T) => string): ContentIssue[] =>
    LOCALES.flatMap((locale) =>
      duplicates(list, (record) => `${scope(record)}/${record.slug[locale]}`).flatMap((taken) =>
        list
          .filter((record) => `${scope(record)}/${record.slug[locale]}` === taken)
          .map((record) => ({ code: 'duplicate_slug' as const, recordType, recordId: record.id, path: `/slug/${locale}`, message: `slug "${record.slug[locale]}" is taken` })),
      ),
    )
  return [...scoped('event', set.events, (event) => event.category), ...scoped('post', set.posts, () => ''), ...scoped('product', set.products, () => '')]
}

function subgroupIssues(set: ContentSet<MediaAsset | MediaSource>): ContentIssue[] {
  return set.events
    .filter((event) => set.subgroups.find((group) => group.id === event.subgroup)?.category !== event.category)
    .map((event) => ({ code: 'missing_subgroup', recordType: 'event', recordId: event.id, path: '/subgroup', message: `no ${event.category} subgroup "${event.subgroup}"` }))
}

function mediaIssues(set: ContentSet<MediaAsset | MediaSource>): ContentIssue[] {
  const byId = new Map(set.media.map((media) => [media.id, media]))
  const refs = (recordType: ContentType, recordId: string, list: readonly (readonly [string, string | undefined])[]): ContentIssue[] =>
    list.flatMap(([path, mediaId]) => (mediaId === undefined || byId.has(mediaId) ? [] : [{ code: 'missing_media' as const, recordType, recordId, path, message: `no media "${mediaId}"` }]))
  // A share image must be a real photo, never a placeholder.
  const share = (recordType: ContentType, recordId: string, seo: { ogImage?: string } | undefined): ContentIssue[] => {
    const media = seo?.ogImage === undefined ? undefined : byId.get(seo.ogImage)
    return media?.placeholder ? [{ code: 'missing_media', recordType, recordId, path: '/seo/ogImage', message: `media "${media.id}" is a placeholder` }] : refs(recordType, recordId, [['/seo/ogImage', seo?.ogImage]])
  }
  const { home } = set
  return [
    ...set.events.flatMap((event) => [
      ...refs('event', event.id, [['/cover', event.cover], ...event.gallery.map((ref, i) => [`/gallery/${i}`, ref] as const)]),
      ...share('event', event.id, event.seo),
    ]),
    ...set.categoryPages.flatMap((page) => [...refs('category_page', page.key, [['/cover', page.cover]]), ...share('category_page', page.key, page.seo)]),
    ...set.serviceOffers.flatMap((offer) => refs('service_offer', offer.id, [['/cover', offer.cover]])),
    ...set.products.flatMap((product) => [
      ...refs('product', product.id, [['/cover', product.cover], ...product.gallery.map((ref, i) => [`/gallery/${i}`, ref] as const)]),
      ...share('product', product.id, product.seo),
    ]),
    ...set.posts.flatMap((post) => [...refs('post', post.id, [['/cover', post.cover]]), ...share('post', post.id, post.seo)]),
    ...set.team.flatMap((member) => refs('team_member', member.id, [['/photo', member.photo]])),
    ...set.richPages.flatMap((page) => [...refs('rich_page', page.key, [['/cover', page.cover]]), ...share('rich_page', page.key, page.seo)]),
    ...(home
      ? [
          ...refs('home', 'home', [
            ...home.hero.tiles.map((tile, i) => [`/hero/tiles/${i}/media`, tile.media] as const),
            ...home.quickLinks.map((link, i) => [`/quickLinks/${i}/media`, link.media] as const),
          ]),
          ...share('home', 'home', home.seo),
        ]
      : []),
  ]
}

function referenceIssues(set: ContentSet<MediaAsset | MediaSource>): ContentIssue[] {
  const visibleEvents = new Set(set.events.filter((event) => event.status === 'published').map((event) => event.id))
  const visiblePosts = new Set(set.posts.filter((post) => post.status === 'published').map((post) => post.id))
  const featured = (set.home?.featured ?? []).flatMap((ref, i): ContentIssue[] =>
    (ref.kind === 'event' ? visibleEvents : visiblePosts).has(ref.id)
      ? []
      : [{ code: 'invisible_reference', recordType: 'home', recordId: 'home', path: `/featured/${i}`, message: `${ref.kind} "${ref.id}" is not published` }],
  )
  const related = set.posts.flatMap((post) =>
    post.relatedEvents.flatMap((eventId, i): ContentIssue[] =>
      visibleEvents.has(eventId) ? [] : [{ code: 'invisible_reference', recordType: 'post', recordId: post.id, path: `/relatedEvents/${i}`, message: `event "${eventId}" is not published` }],
    ),
  )
  return [...featured, ...related]
}

function pageIssues(set: ContentSet<MediaAsset | MediaSource>): ContentIssue[] {
  const missing = (recordType: ContentType, keys: readonly string[], present: readonly string[]): ContentIssue[] =>
    keys.filter((key) => !present.includes(key)).map((key) => ({ code: 'missing_page', recordType, recordId: key, message: `page "${key}" is missing` }))
  return [
    ...(set.home ? [] : [{ code: 'missing_page' as const, recordType: 'home' as const, recordId: 'home', message: 'home page is missing' }]),
    ...missing('category_page', CATEGORY_PAGE_KEYS, set.categoryPages.map((page) => page.key)),
    ...missing('rich_page', RICH_PAGE_KEYS, set.richPages.map((page) => page.key)),
  ]
}

/** Every string in a record with its JSON Pointer. */
function strings(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]]
  if (Array.isArray(value)) return value.flatMap((item, i) => strings(item, `${path}/${i}`))
  if (value !== null && typeof value === 'object') return Object.entries(value).flatMap(([key, child]) => strings(child, `${path}${pointer([key])}`))
  return []
}

function textIssues(refs: readonly RecordRef[]): ContentIssue[] {
  return refs.flatMap(({ recordType, recordId, record }) =>
    strings(record).flatMap(([path, value]): ContentIssue[] => [
      ...(HTML.test(value) ? [{ code: 'html_in_text' as const, recordType, recordId, path, message: 'text contains HTML' }] : []),
      ...(value.match(EMAIL) ?? [])
        .filter((address) => !ALLOWED_EMAIL.test(address))
        .map((address) => ({ code: 'email_in_text' as const, recordType, recordId, path, message: `email address "${address}" in text` })),
    ]),
  )
}

/** All problems that block publishing `set`; empty = publishable. Never mutates its input. */
export function validateContent(set: ContentSet<MediaAsset | MediaSource>): ContentIssue[] {
  const refs = records(set)
  return [
    ...schemaIssues(refs),
    ...duplicateIdIssues(set),
    ...duplicateSlugIssues(set),
    ...subgroupIssues(set),
    ...mediaIssues(set),
    ...referenceIssues(set),
    ...pageIssues(set),
    ...textIssues(refs),
  ]
}
