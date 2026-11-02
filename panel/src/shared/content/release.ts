import { z } from 'zod'
import { formDefinitionSchema, type FormDefinition } from '../requests/forms.ts'
import { REQUEST_KINDS, SITE_LOCALES, type RequestKind } from '../requests/payload.ts'
import {
  categoryKeySchema,
  categoryPageSchema,
  COLLECTION_OF,
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
  text,
  type CategoryKey,
  type ContentStatus,
  type ContentType,
} from './schema.ts'

/**
 * The immutable release snapshot (dalga2-sozlesme §1, §4): publish-content builds it from the
 * database, the site build fetches and pre-renders it. Pure and synchronous; hashing is the
 * caller's job (canonicalJson gives the bytes).
 */

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase-hyphen slug')
const sha256 = z.string().regex(/^[0-9a-f]{64}$/, 'sha256 hex')

/** A repo image (derivatives already in public/media) or a panel upload (master in the private bucket). */
export const mediaSourceSchema = z.discriminatedUnion('storage', [
  mediaAssetSchema.extend({ storage: z.literal('repo') }),
  z
    .object({
      id,
      storage: z.literal('upload'),
      objectPath: z.string().regex(/^[a-z0-9-]+\/[0-9a-f]{64}\.jpg$/, '<id>/<sha256>.jpg'),
      sha256,
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      alt: text,
      topic: z.string().min(1),
      rights: mediaAssetSchema.shape.rights,
      placeholder: z.literal(false),
    })
    .refine((media) => media.objectPath === `${media.id}/${media.sha256}.jpg`, { message: 'objectPath must be <id>/<sha256>.jpg', path: ['objectPath'] }),
])
export type MediaSource = z.infer<typeof mediaSourceSchema>

export const releaseContentSchema = z.object({
  media: z.array(mediaSourceSchema),
  home: homeContentSchema,
  categoryPages: z.array(categoryPageSchema),
  subgroups: z.array(subgroupSchema),
  events: z.array(eventSchema),
  serviceOffers: z.array(serviceOfferSchema),
  products: z.array(productSchema),
  posts: z.array(postSchema),
  team: z.array(teamMemberSchema),
  testimonials: z.array(testimonialSchema),
  richPages: z.array(richPageSchema),
})

const formReleaseSchema = z.object({ version: z.number().int().nonnegative(), definition: formDefinitionSchema })

export const slugHistoryItemSchema = z.object({
  type: z.enum(['event', 'post', 'product']),
  id,
  locale: z.enum(SITE_LOCALES),
  slug: id,
  category: categoryKeySchema.optional(),
})
export type SlugHistoryItem = z.infer<typeof slugHistoryItemSchema>

export const releaseSnapshotSchema = z.object({
  format: z.literal(1),
  releaseId: z.number().int().positive(),
  createdAt: z.iso.datetime({ offset: true }),
  content: releaseContentSchema,
  forms: z.record(z.enum(REQUEST_KINDS), formReleaseSchema),
  slugHistory: z.array(slugHistoryItemSchema),
})
export type ReleaseSnapshot = z.infer<typeof releaseSnapshotSchema>

/** One content_entries row as the snapshot needs it. */
export interface ReleaseEntryInput {
  type: ContentType
  key: string
  status: ContentStatus
  /** The published document (jsonb); null = never published. */
  published: Readonly<Record<string, unknown>> | null
  /** Manual order when the type has one; wins over the document's copy. */
  order?: number | null
  slugHistory?: readonly { locale: (typeof SITE_LOCALES)[number]; slug: string; category?: CategoryKey }[]
}

export interface ReleaseInput {
  releaseId: number
  createdAt: string
  entries: readonly ReleaseEntryInput[]
  /** Every media row; only the ones the released content references are kept. */
  media: readonly MediaSource[]
  forms: Readonly<Record<RequestKind, { version: number; definition: FormDefinition }>>
}

/** Types whose documents carry `status`; their archived entries stay in the release (hidden, but known). */
const WITH_STATUS = new Set<ContentType>(['event', 'post', 'product'])
const ORDERED = new Set<ContentType>(['event', 'subgroup', 'product', 'team_member', 'service_offer'])
const HISTORY_TYPES = new Set<ContentType>(['event', 'post', 'product'])

/** Code-unit order, so every runtime sorts alike (localeCompare does not). */
const compare = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

const included = (entry: ReleaseEntryInput): entry is ReleaseEntryInput & { published: Readonly<Record<string, unknown>> } =>
  entry.published !== null && (entry.status === 'published' || (entry.status === 'archived' && WITH_STATUS.has(entry.type)))

/** The document as released: status and order from the columns, sourceRefs emptied. */
function releasedDocument(entry: ReleaseEntryInput & { published: Readonly<Record<string, unknown>> }): Record<string, unknown> {
  return {
    ...entry.published,
    ...(WITH_STATUS.has(entry.type) ? { status: entry.status } : {}),
    ...(ORDERED.has(entry.type) && typeof entry.order === 'number' ? { order: entry.order } : {}),
    ...('sourceRefs' in entry.published ? { sourceRefs: [] } : {}),
  }
}

/** Media ids a released document points at (covers, galleries, photos, tiles, share images). */
export function mediaRefs(doc: unknown): string[] {
  if (Array.isArray(doc)) return doc.flatMap(mediaRefs)
  if (doc === null || typeof doc !== 'object') return []
  return Object.entries(doc).flatMap(([key, value]) => {
    if ((key === 'cover' || key === 'photo' || key === 'media' || key === 'ogImage') && typeof value === 'string') return [value]
    if (key === 'gallery' && Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
    return mediaRefs(value)
  })
}

const recordKey = (doc: Record<string, unknown>, fallback: string): string =>
  typeof doc.id === 'string' ? doc.id : typeof doc.key === 'string' ? doc.key : fallback

/**
 * Builds the snapshot from database rows: published entries (plus archived events, posts and
 * products), only the media they reference, empty sourceRefs, every list in a fixed order.
 * Throws when the result is not a valid snapshot (e.g. no published home page); publish-content
 * validates documents first, so this is the last guard.
 */
export function buildReleaseSnapshot(input: ReleaseInput): ReleaseSnapshot {
  const entries = input.entries.filter(included).toSorted((a, b) => compare(a.type, b.type) || compare(a.key, b.key))
  const docs = entries.map((entry) => ({ entry, doc: releasedDocument(entry) }))
  const ofType = (type: ContentType) =>
    docs
      .filter(({ entry }) => entry.type === type)
      .map(({ entry, doc }) => ({ key: recordKey(doc, entry.key), doc }))
      .toSorted((a, b) => compare(a.key, b.key))
      .map(({ doc }) => doc)

  const referenced = new Set(docs.flatMap(({ doc }) => mediaRefs(doc)))
  const collections = Object.fromEntries(
    (Object.entries(COLLECTION_OF) as [ContentType, string][]).filter(([type]) => type !== 'home').map(([type, collection]) => [collection, ofType(type)]),
  )
  const slugHistory = entries
    .filter((entry) => HISTORY_TYPES.has(entry.type))
    .flatMap((entry) => (entry.slugHistory ?? []).map((item) => ({ type: entry.type, id: entry.key, ...item })))
    .toSorted((a, b) => compare(a.type, b.type) || compare(a.id, b.id) || compare(a.locale, b.locale) || compare(a.slug, b.slug))

  return releaseSnapshotSchema.parse({
    format: 1,
    releaseId: input.releaseId,
    createdAt: input.createdAt,
    content: {
      media: input.media.filter((media) => referenced.has(media.id)).toSorted((a, b) => compare(a.id, b.id)),
      home: ofType('home')[0],
      ...collections,
    },
    forms: Object.fromEntries(REQUEST_KINDS.map((kind) => [kind, input.forms[kind]])),
    slugHistory,
  })
}

/**
 * Deterministic JSON: object keys sorted, no whitespace, undefined properties dropped (as
 * JSON.stringify does). The snapshot's sha256 and the translation hashes are taken over this.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value))
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => (item === undefined ? null : sortKeys(item)))
  if (value === null || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.keys(value)
      .toSorted(compare)
      .filter((key) => (value as Record<string, unknown>)[key] !== undefined)
      .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
  )
}
