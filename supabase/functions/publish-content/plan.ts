import { z } from 'zod'
import { type ReleaseEntryInput, type ReleaseInput } from '../_shared/content/release.ts'
import {
  categoryPageSchema,
  eventSchema,
  homeContentSchema,
  postSchema,
  productSchema,
  richPageSchema,
  serviceOfferSchema,
  subgroupSchema,
  teamMemberSchema,
  testimonialSchema,
  type ContentType,
} from '../_shared/content/schema.ts'
import type { ContentIssue } from '../_shared/content/validate.ts'
import { DEFAULT_FORM_DEFINITIONS, formDefinitionSchema, validateDefinition, type DefinitionIssue } from '../_shared/requests/forms.ts'
import { REQUEST_KINDS, SITE_LOCALES } from '../_shared/requests/payload.ts'
import type { EntryRow, PublishState, ReleaseAction, ReleaseChange, SlugHistoryEntry } from './types.ts'

/**
 * The in-memory half of Yayınla (dalga2-sozlesme §6): applies the request to the loaded state the
 * way apply_content_release will, checks each document it publishes with its zod schema, and
 * returns the release input plus the change list for the RPC. Pure.
 */

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const note = z.string().trim().max(200).optional()
const entryIds = z.array(z.uuid()).min(1).max(50)

export const REORDER_TYPES = ['event', 'subgroup', 'product', 'team_member', 'service_offer'] as const

export const publishBodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('publish'), entries: z.array(z.object({ id: z.uuid(), draftRevision: z.number().int().positive() })).min(1).max(50), note }),
  z.object({ action: z.literal('archive'), entryIds, note }),
  z.object({ action: z.literal('unpublish'), entryIds, note }),
  z.object({ action: z.literal('reorder'), type: z.enum(REORDER_TYPES), keys: z.array(id).min(1).max(500), note }),
  z.object({ action: z.literal('publish_form'), kind: z.enum(REQUEST_KINDS), draftRevision: z.number().int().positive(), note }),
])
export type PublishBody = z.infer<typeof publishBodySchema>

/** Types whose documents carry `status`; only these can be archived. */
const WITH_STATUS = new Set<ContentType>(['event', 'post', 'product'])
const HISTORY_TYPES = WITH_STATUS

const SCHEMA_OF: Readonly<Record<ContentType, z.ZodType>> = {
  event: eventSchema,
  subgroup: subgroupSchema,
  category_page: categoryPageSchema,
  service_offer: serviceOfferSchema,
  product: productSchema,
  post: postSchema,
  team_member: teamMemberSchema,
  testimonial: testimonialSchema,
  rich_page: richPageSchema,
  home: homeContentSchema,
}

export type PlanError =
  | { error: 'bad_request'; status: 400; detail: Record<string, unknown> }
  | { error: 'not_found'; status: 404; detail: Record<string, unknown> }
  | { error: 'stale_draft'; status: 409; detail: Record<string, unknown> }
  | { error: 'invalid'; status: 422; detail: { issues: readonly (ContentIssue | DefinitionIssue)[] } }

export interface Plan {
  action: ReleaseAction
  changes: ReleaseChange[]
  input: Omit<ReleaseInput, 'releaseId' | 'createdAt'>
}

const fail = <E extends PlanError>(error: E['error'], status: E['status'], detail: E['detail']): PlanError => ({ error, status, detail }) as PlanError

const asInput = (row: EntryRow): ReleaseEntryInput => ({ type: row.type, key: row.key, status: row.status, published: row.published, slugHistory: row.slugHistory })

const pointer = (path: readonly PropertyKey[]): string => path.map((part) => `/${String(part).replaceAll('~', '~0').replaceAll('/', '~1')}`).join('')

/** The draft as it will be published: status from the column, checked against its type's schema and key. */
function checkDocument(row: EntryRow): { doc: Record<string, unknown>; issues: ContentIssue[] } {
  const doc: Record<string, unknown> = { ...row.draft, ...(WITH_STATUS.has(row.type) ? { status: 'published' } : {}) }
  const parsed = SCHEMA_OF[row.type].safeParse(doc)
  const issues: ContentIssue[] = parsed.success
    ? []
    : parsed.error.issues.map((issue) => ({ code: 'schema', recordType: row.type, recordId: row.key, path: pointer(issue.path), message: issue.message }))
  const docKey = typeof doc.id === 'string' ? doc.id : typeof doc.key === 'string' ? doc.key : null
  if (row.type !== 'home' && docKey !== row.key) {
    issues.push({ code: 'schema', recordType: row.type, recordId: row.key, path: typeof doc.key === 'string' ? '/key' : '/id', message: 'must equal the entry key' })
  }
  return { doc, issues }
}

type Slugs = Partial<Record<(typeof SITE_LOCALES)[number], string>>
const slugsOf = (doc: Readonly<Record<string, unknown>> | null): Slugs => (doc && typeof doc.slug === 'object' && doc.slug !== null ? (doc.slug as Slugs) : {})
const categoryOf = (doc: Readonly<Record<string, unknown>> | null): SlugHistoryEntry['category'] =>
  doc && typeof doc.category === 'string' ? (doc.category as SlugHistoryEntry['category']) : undefined

/**
 * slug_history after publishing `next` over `previous`: each changed slug (or, for events, a
 * changed category) is appended once, and any old address the new version uses again is dropped.
 */
export function nextSlugHistory(type: ContentType, previous: Readonly<Record<string, unknown>> | null, next: Readonly<Record<string, unknown>>, history: readonly SlugHistoryEntry[]): SlugHistoryEntry[] {
  if (!HISTORY_TYPES.has(type)) return [...history]
  const isEvent = type === 'event'
  const [oldSlugs, newSlugs] = [slugsOf(previous), slugsOf(next)]
  const [oldCategory, newCategory] = [categoryOf(previous), categoryOf(next)]
  const appended = previous
    ? SITE_LOCALES.flatMap((locale): SlugHistoryEntry[] => {
        const slug = oldSlugs[locale]
        if (!slug || (slug === newSlugs[locale] && (!isEvent || oldCategory === newCategory))) return []
        return [{ locale, slug, ...(isEvent && oldCategory ? { category: oldCategory } : {}) }]
      })
    : []
  const sameAddress = (a: SlugHistoryEntry, b: SlugHistoryEntry) => a.locale === b.locale && a.slug === b.slug && a.category === b.category
  const merged = [...history, ...appended].filter((item, index, all) => all.findIndex((other) => sameAddress(other, item)) === index)
  return merged.filter((item) => !(item.slug === newSlugs[item.locale] && (!isEvent || item.category === newCategory)))
}

function planPublish(body: Extract<PublishBody, { action: 'publish' }>, state: PublishState): Plan | PlanError {
  const ids = body.entries.map((entry) => entry.id)
  if (new Set(ids).size !== ids.length) return fail('bad_request', 400, { reason: 'duplicate_entry' })
  const byId = new Map(state.entries.map((row) => [row.id, row]))
  const missing = ids.filter((entryId) => !byId.has(entryId))
  if (missing.length > 0) return fail('not_found', 404, { entryIds: missing })
  const stale = body.entries.filter((entry) => byId.get(entry.id)?.draftRevision !== entry.draftRevision).map((entry) => entry.id)
  if (stale.length > 0) return fail('stale_draft', 409, { entryIds: stale })

  const checked = new Map(ids.map((entryId) => [entryId, checkDocument(byId.get(entryId) as EntryRow)]))
  const issues = [...checked.values()].flatMap((result) => result.issues)
  if (issues.length > 0) return fail('invalid', 422, { issues })

  const entries = state.entries.map((row): ReleaseEntryInput => {
    const result = checked.get(row.id)
    if (!result) return asInput(row)
    return { ...asInput(row), status: 'published', published: result.doc, slugHistory: nextSlugHistory(row.type, row.published, result.doc, row.slugHistory) }
  })
  return {
    action: 'publish',
    changes: body.entries.map((entry) => ({ op: 'publish', entryId: entry.id, draftRevision: entry.draftRevision })),
    input: { entries, media: state.media, forms: currentForms(state) },
  }
}

function planStatus(body: Extract<PublishBody, { action: 'archive' | 'unpublish' }>, state: PublishState): Plan | PlanError {
  const ids = [...new Set(body.entryIds)]
  const byId = new Map(state.entries.map((row) => [row.id, row]))
  const missing = ids.filter((entryId) => !byId.has(entryId))
  if (missing.length > 0) return fail('not_found', 404, { entryIds: missing })
  const neverPublished = ids.filter((entryId) => byId.get(entryId)?.published === null)
  if (neverPublished.length > 0) return fail('bad_request', 400, { reason: 'never_published', entryIds: neverPublished })
  if (body.action === 'archive') {
    const notArchivable = ids.filter((entryId) => !WITH_STATUS.has((byId.get(entryId) as EntryRow).type))
    if (notArchivable.length > 0) return fail('bad_request', 400, { reason: 'not_archivable', entryIds: notArchivable })
  }
  const status = body.action === 'archive' ? 'archived' : 'draft'
  const entries = state.entries.map((row): ReleaseEntryInput => (ids.includes(row.id) ? { ...asInput(row), status } : asInput(row)))
  return {
    action: body.action,
    changes: ids.map((entryId) => ({ op: body.action, entryId })),
    input: { entries, media: state.media, forms: currentForms(state) },
  }
}

/** The group a manual order applies to: events per subgroup, subgroups per category, offers per kind. */
function scopeOf(row: EntryRow): string {
  const field = row.type === 'event' ? 'subgroup' : row.type === 'subgroup' ? 'category' : row.type === 'service_offer' ? 'kind' : null
  const value = field ? row.draft[field] : ''
  return typeof value === 'string' ? value : ''
}

function planReorder(body: Extract<PublishBody, { action: 'reorder' }>, state: PublishState): Plan | PlanError {
  if (new Set(body.keys).size !== body.keys.length) return fail('bad_request', 400, { reason: 'duplicate_key' })
  const ofType = state.entries.filter((row) => row.type === body.type)
  const rows = body.keys.map((key) => ofType.find((row) => row.key === key))
  const unknown = body.keys.filter((_, i) => rows[i] === undefined)
  if (unknown.length > 0) return fail('not_found', 404, { keys: unknown })
  const scopes = new Set((rows as EntryRow[]).map(scopeOf))
  const scope = [...scopes][0] ?? ''
  const inScope = ofType.filter((row) => scopeOf(row) === scope)
  if (scopes.size !== 1 || inScope.length !== body.keys.length) return fail('bad_request', 400, { reason: 'incomplete_scope' })

  // Order is the 1-based position, written into both copies by apply_content_release.
  const position = new Map(body.keys.map((key, i) => [key, i + 1]))
  const entries = state.entries.map((row): ReleaseEntryInput => {
    const order = row.type === body.type ? position.get(row.key) : undefined
    if (order === undefined || row.published === null) return asInput(row)
    return { ...asInput(row), published: { ...row.published, order } }
  })
  return {
    action: 'reorder',
    changes: [{ op: 'reorder', type: body.type, keys: body.keys }],
    input: { entries, media: state.media, forms: currentForms(state) },
  }
}

/** Each kind's latest published version; version 0 = the built-in form. */
function currentForms(state: PublishState): ReleaseInput['forms'] {
  return Object.fromEntries(
    REQUEST_KINDS.map((kind) => {
      const row = state.forms.find((form) => form.kind === kind)
      return [kind, row?.publishedVersion && row.publishedDefinition ? { version: row.publishedVersion, definition: row.publishedDefinition } : { version: 0, definition: DEFAULT_FORM_DEFINITIONS[kind] }]
    }),
  ) as ReleaseInput['forms']
}

function planForm(body: Extract<PublishBody, { action: 'publish_form' }>, state: PublishState): Plan | PlanError {
  const row = state.forms.find((form) => form.kind === body.kind)
  if (!row) return fail('not_found', 404, { kind: body.kind })
  if (row.draftRevision !== body.draftRevision) return fail('stale_draft', 409, { kind: body.kind })
  const issues = validateDefinition(body.kind, row.draft, row.publishedDefinition ?? undefined)
  if (issues.length > 0) return fail('invalid', 422, { issues })
  const forms = { ...currentForms(state), [body.kind]: { version: (row.publishedVersion ?? 0) + 1, definition: formDefinitionSchema.parse(row.draft) } }
  return {
    action: 'publish_form',
    changes: [{ op: 'publish_form', kind: body.kind, draftRevision: body.draftRevision }],
    input: { entries: state.entries.map(asInput), media: state.media, forms },
  }
}

export function planRelease(body: PublishBody, state: PublishState): Plan | PlanError {
  switch (body.action) {
    case 'publish':
      return planPublish(body, state)
    case 'archive':
    case 'unpublish':
      return planStatus(body, state)
    case 'reorder':
      return planReorder(body, state)
    case 'publish_form':
      return planForm(body, state)
  }
}
