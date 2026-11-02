import { createHash } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { contentData } from '../../src/content/data'
import { canonicalJson, releaseSnapshotSchema, type MediaSource } from '../../src/shared/content/release'
import { DEFAULT_FORM_DEFINITIONS } from '../../src/shared/requests/forms'
import { handlePublish } from '../../../supabase/functions/publish-content/handler.ts'
import { nextSlugHistory } from '../../../supabase/functions/publish-content/plan.ts'
import {
  releaseError,
  ReleaseConflict,
  StaleDraft,
  type ApplyReleaseArgs,
  type EntryRow,
  type FormRow,
  type PublishDeps,
  type PublishState,
  type PublishStore,
} from '../../../supabase/functions/publish-content/types.ts'
import { fakeVerifier, ORIGIN, STAFF_ID, staffRequest } from './edgeStaff'

const URL = 'http://localhost/functions/v1/publish-content'
const NOW = new Date('2026-11-02T12:00:00.000Z')
const d = contentData

let counter = 0
const uuid = () => `00000000-0000-4000-8000-${String((counter += 1)).padStart(12, '0')}`

const row = (type: EntryRow['type'], key: string, doc: object, status: EntryRow['status'] = 'published'): EntryRow => ({
  id: uuid(),
  type,
  key,
  status,
  draft: doc as Record<string, unknown>,
  draftRevision: 3,
  published: doc as Record<string, unknown>,
  slugHistory: [],
})

/** The fixture as content_entries rows: everything published, draft = published. */
function fixtureState(): PublishState {
  counter = 0
  const entries: EntryRow[] = [
    row('home', 'home', d.home),
    ...d.categoryPages.map((page) => row('category_page', page.key, page)),
    ...d.subgroups.map((group) => row('subgroup', group.id, group)),
    ...d.events.map((event) => row('event', event.id, event, event.status)),
    ...d.serviceOffers.map((offer) => row('service_offer', offer.id, offer)),
    ...d.products.map((product) => row('product', product.id, product, product.status)),
    ...d.posts.map((post) => row('post', post.id, post, post.status)),
    ...d.team.map((member) => row('team_member', member.id, member)),
    ...d.testimonials.map((testimonial) => row('testimonial', testimonial.id, testimonial)),
    ...d.richPages.map((page) => row('rich_page', page.key, page)),
  ]
  const media: MediaSource[] = d.media.map((asset) => ({ ...asset, storage: 'repo' }))
  const forms: FormRow[] = Object.entries(DEFAULT_FORM_DEFINITIONS).map(([kind, definition]) => ({
    kind: kind as FormRow['kind'],
    draft: definition,
    draftRevision: 2,
    publishedVersion: 1,
    publishedDefinition: definition,
  }))
  return { baseRelease: 7, entries, media, forms }
}

const firstEvent = (state: PublishState) => state.entries.find((entry) => entry.type === 'event' && entry.status === 'published') as EntryRow

function setup(options: { state?: PublishState; apply?: PublishStore['applyRelease']; notBefore?: PublishStore['deployNotBefore'] } = {}) {
  const state = options.state ?? fixtureState()
  const calls: ApplyReleaseArgs[] = []
  const store: PublishStore = {
    loadState: vi.fn(async () => state),
    applyRelease: vi.fn(async (args: ApplyReleaseArgs) => {
      calls.push(args)
      return options.apply ? options.apply(args) : args.baseRelease + 1
    }),
    deployNotBefore: options.notBefore ?? (async () => '2026-11-02T12:01:00.000Z'),
  }
  const reportError = vi.fn()
  const deps: PublishDeps = { store, auth: fakeVerifier(), allowedOrigins: [ORIGIN], clock: () => NOW, reportError }
  return { deps, state, calls, store, reportError }
}

const send = async (deps: PublishDeps, body: unknown, options: Parameters<typeof staffRequest>[2] = {}) => {
  const response = await handlePublish(staffRequest(URL, body, options), deps)
  return { status: response.status, body: (await response.json().catch(() => null)) as Record<string, unknown> | null, headers: response.headers }
}

describe('publish-content: HTTP and auth', () => {
  it('answers the preflight for an allowed origin and refuses others', async () => {
    const { deps } = setup()
    const preflight = await handlePublish(new Request(URL, { method: 'OPTIONS', headers: { origin: ORIGIN } }), deps)
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('access-control-allow-origin')).toBe(ORIGIN)
    expect((await send(deps, {}, { origin: 'https://evil.example' })).status).toBe(403)
  })

  it('400 bad_request for a non-POST method, bad JSON or a bad body', async () => {
    const { deps } = setup()
    expect((await send(deps, null, { method: 'GET' })).status).toBe(405)
    const notJson = await send(deps, '{nope')
    expect(notJson).toMatchObject({ status: 400, body: { ok: false, error: 'bad_request' } })
    const badBody = await send(deps, { action: 'publish', entries: [] })
    expect(badBody).toMatchObject({ status: 400, body: { error: 'bad_request', fields: ['entries'] } })
    expect((await send(deps, { action: 'publish', entries: [{ id: uuid(), draftRevision: 1 }], note: 'x'.repeat(201) })).status).toBe(400)
  })

  it('401 unauthorized without a token, with a bad token or an AAL1 session', async () => {
    const { deps } = setup()
    for (const token of [null, 'bad', 'aal1']) {
      expect(await send(deps, { action: 'reorder', type: 'team_member', keys: ['a'] }, { token })).toMatchObject({ status: 401, body: { ok: false, error: 'unauthorized' } })
    }
  })

  it('403 forbidden without the permission the action needs', async () => {
    const { deps, state } = setup()
    const event = firstEvent(state)
    const publish = { action: 'publish', entries: [{ id: event.id, draftRevision: 3 }] }
    expect(await send(deps, publish, { token: 'content' })).toMatchObject({ status: 403, body: { error: 'forbidden' } })
    expect(await send(deps, publish, { token: 'forms' })).toMatchObject({ status: 403, body: { error: 'forbidden' } })
    expect(await send(deps, { action: 'publish_form', kind: 'contact', draftRevision: 2 }, { token: 'publisher' })).toMatchObject({ status: 403 })
    // A staff session without a bound active staff row.
    expect((await send(deps, publish, { token: 'orphan' })).status).toBe(403)
  })
})

describe('publish-content: publish', () => {
  it('publishes a draft: snapshot, sha256, change list and deploy time', async () => {
    const state = fixtureState()
    const event = firstEvent(state)
    const changed = { ...event.draft, title: { ...(event.draft.title as object), tr: 'Yeni başlık' } }
    const edited = { ...state, entries: state.entries.map((entry) => (entry.id === event.id ? { ...entry, draft: changed, draftRevision: 4 } : entry)) }
    const run = setup({ state: edited })
    const result = await send(run.deps, { action: 'publish', entries: [{ id: event.id, draftRevision: 4 }], note: ' saat değişti ' })
    expect(result).toMatchObject({ status: 200, body: { ok: true, releaseId: 8, deployNotBefore: '2026-11-02T12:01:00.000Z' } })
    expect(result.headers.get('access-control-allow-origin')).toBe(ORIGIN)

    const [args] = run.calls
    expect(args).toMatchObject({ staffId: STAFF_ID, baseRelease: 7, action: 'publish', note: 'saat değişti', changes: [{ op: 'publish', entryId: event.id, draftRevision: 4 }] })
    const snapshot = releaseSnapshotSchema.parse(args?.snapshot)
    expect(snapshot.releaseId).toBe(8)
    expect(snapshot.createdAt).toBe(NOW.toISOString())
    expect(snapshot.content.events.find((item) => item.id === event.key)?.title.tr).toBe('Yeni başlık')
    expect(args?.snapshotSha256).toBe(createHash('sha256').update(canonicalJson(args?.snapshot)).digest('hex'))
    expect(snapshot.forms.contact.version).toBe(1)
  })

  it('404 not_found for an unknown entry', async () => {
    const { deps } = setup()
    const missing = '00000000-0000-4000-8000-999999999999'
    expect(await send(deps, { action: 'publish', entries: [{ id: missing, draftRevision: 1 }] })).toMatchObject({ status: 404, body: { error: 'not_found', entryIds: [missing] } })
  })

  it('409 stale_draft when the revision moved, before or inside the RPC', async () => {
    const { deps, state } = setup()
    const event = firstEvent(state)
    expect(await send(deps, { action: 'publish', entries: [{ id: event.id, draftRevision: 2 }] })).toMatchObject({ status: 409, body: { error: 'stale_draft', entryIds: [event.id] } })
    const raced = setup({ apply: async () => Promise.reject(new StaleDraft(event.id)) })
    expect(await send(raced.deps, { action: 'publish', entries: [{ id: firstEvent(raced.state).id, draftRevision: 3 }] })).toMatchObject({ status: 409, body: { error: 'stale_draft' } })
  })

  it('400 bad_request for the same entry twice', async () => {
    const { deps, state } = setup()
    const event = firstEvent(state)
    expect(await send(deps, { action: 'publish', entries: [{ id: event.id, draftRevision: 3 }, { id: event.id, draftRevision: 3 }] })).toMatchObject({ status: 400 })
  })

  it('422 invalid for a document that fails its schema, or a key mismatch', async () => {
    const base = fixtureState()
    const event = firstEvent(base)
    const broken = { ...base, entries: base.entries.map((entry) => (entry.id === event.id ? { ...entry, draft: { ...entry.draft, title: { en: 'only english' } } } : entry)) }
    const { deps, store } = setup({ state: broken })
    const result = await send(deps, { action: 'publish', entries: [{ id: event.id, draftRevision: 3 }] })
    expect(result).toMatchObject({ status: 422, body: { error: 'invalid' } })
    expect(result.body?.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'schema', recordType: 'event', recordId: event.key, path: '/title/tr' })]))
    expect(store.applyRelease).not.toHaveBeenCalled()

    const renamed = { ...base, entries: base.entries.map((entry) => (entry.id === event.id ? { ...entry, draft: { ...entry.draft, id: 'other-id' } } : entry)) }
    const second = await send(setup({ state: renamed }).deps, { action: 'publish', entries: [{ id: event.id, draftRevision: 3 }] })
    expect(second.body?.issues).toEqual([expect.objectContaining({ path: '/id', message: 'must equal the entry key' })])
  })

  it('422 invalid when the whole set breaks a rule (validateContent)', async () => {
    const base = fixtureState()
    const event = firstEvent(base)
    const withEmail = { ...base, entries: base.entries.map((entry) => (entry.id === event.id ? { ...entry, draft: { ...entry.draft, summary: { tr: 'Yazın: ali@example.com' } } } : entry)) }
    const result = await send(setup({ state: withEmail }).deps, { action: 'publish', entries: [{ id: event.id, draftRevision: 3 }] })
    expect(result).toMatchObject({ status: 422, body: { error: 'invalid' } })
    expect(result.body?.issues).toEqual([expect.objectContaining({ code: 'email_in_text', recordId: event.key })])
  })

  it('retries a conflict on fresh data three times, then answers 409 conflict', async () => {
    let fails = 2
    const recovering = setup({ apply: async (args) => (fails-- > 0 ? Promise.reject(new ReleaseConflict()) : args.baseRelease + 1) })
    const event = firstEvent(recovering.state)
    expect((await send(recovering.deps, { action: 'publish', entries: [{ id: event.id, draftRevision: 3 }] })).status).toBe(200)
    expect(recovering.store.loadState).toHaveBeenCalledTimes(3)

    const stuck = setup({ apply: async () => Promise.reject(new ReleaseConflict()) })
    expect(await send(stuck.deps, { action: 'publish', entries: [{ id: firstEvent(stuck.state).id, draftRevision: 3 }] })).toMatchObject({ status: 409, body: { error: 'conflict' } })
    expect(stuck.store.applyRelease).toHaveBeenCalledTimes(4)
  })

  it('500 server on an unexpected failure, reported but not shown', async () => {
    const { deps, state, reportError } = setup({ apply: async () => Promise.reject(new Error('db down: secret detail')) })
    const result = await send(deps, { action: 'publish', entries: [{ id: firstEvent(state).id, draftRevision: 3 }] })
    expect(result).toMatchObject({ status: 500, body: { ok: false, error: 'server' } })
    expect(JSON.stringify(result.body)).not.toContain('secret')
    expect(reportError).toHaveBeenCalled()
  })

  it('a failed deploy-row read still answers 200 with deployNotBefore null', async () => {
    const { deps, state } = setup({ notBefore: async () => Promise.reject(new Error('x')) })
    expect(await send(deps, { action: 'publish', entries: [{ id: firstEvent(state).id, draftRevision: 3 }] })).toMatchObject({ status: 200, body: { deployNotBefore: null } })
  })
})

describe('publish-content: archive, unpublish, reorder, forms', () => {
  it('archives an event: it stays in the snapshot as archived', async () => {
    const { deps, state, calls } = setup()
    // A post or the home page may point at an event; keep the set valid by archiving one nobody references.
    const unreferenced = state.entries.find(
      (entry) => entry.type === 'event' && entry.status === 'published' && !d.posts.some((post) => post.relatedEvents.includes(entry.key)) && !d.home.featured.some((ref) => ref.id === entry.key),
    ) as EntryRow
    expect(unreferenced).toBeDefined()
    const result = await send(deps, { action: 'archive', entryIds: [unreferenced.id] })
    expect(result.status).toBe(200)
    const snapshot = releaseSnapshotSchema.parse(calls[0]?.snapshot)
    expect(snapshot.content.events.find((item) => item.id === unreferenced.key)?.status).toBe('archived')
    expect(calls[0]?.changes).toEqual([{ op: 'archive', entryId: unreferenced.id }])
  })

  it('unpublishing a required page is refused as invalid (missing_page)', async () => {
    const { deps, state } = setup()
    const about = state.entries.find((entry) => entry.type === 'rich_page' && entry.key === 'about') as EntryRow
    const result = await send(deps, { action: 'unpublish', entryIds: [about.id] })
    expect(result).toMatchObject({ status: 422, body: { error: 'invalid' } })
    expect(result.body?.issues).toEqual([expect.objectContaining({ code: 'missing_page', recordId: 'about' })])
  })

  it('400 for archiving a type without status or an entry that was never published; 404 for an unknown one', async () => {
    const base = fixtureState()
    const team = base.entries.find((entry) => entry.type === 'team_member') as EntryRow
    expect(await send(setup({ state: base }).deps, { action: 'archive', entryIds: [team.id] })).toMatchObject({ status: 400, body: { reason: 'not_archivable' } })
    const fresh = { ...base, entries: base.entries.map((entry) => (entry.id === team.id ? { ...entry, published: null, status: 'draft' as const } : entry)) }
    expect(await send(setup({ state: fresh }).deps, { action: 'unpublish', entryIds: [team.id] })).toMatchObject({ status: 400, body: { reason: 'never_published' } })
    expect((await send(setup().deps, { action: 'archive', entryIds: ['00000000-0000-4000-8000-999999999999'] })).status).toBe(404)
  })

  it('reorders a whole scope with 1-based positions', async () => {
    const { deps, calls } = setup()
    const keys = d.team.map((member) => member.id).toReversed()
    expect((await send(deps, { action: 'reorder', type: 'team_member', keys })).status).toBe(200)
    const snapshot = releaseSnapshotSchema.parse(calls[0]?.snapshot)
    expect(snapshot.content.team.find((member) => member.id === keys[0])?.order).toBe(1)
    expect(calls[0]?.changes).toEqual([{ op: 'reorder', type: 'team_member', keys }])
  })

  it('reorder: 400 for a partial scope or repeated key, 404 for an unknown key', async () => {
    const { deps } = setup()
    const keys = d.team.map((member) => member.id)
    if (keys.length > 1) expect(await send(deps, { action: 'reorder', type: 'team_member', keys: keys.slice(1) })).toMatchObject({ status: 400, body: { reason: 'incomplete_scope' } })
    expect((await send(deps, { action: 'reorder', type: 'team_member', keys: [...keys, keys[0]] })).status).toBe(400)
    expect(await send(deps, { action: 'reorder', type: 'team_member', keys: ['nobody'] })).toMatchObject({ status: 404, body: { keys: ['nobody'] } })
  })

  it('publishes a form as the next version; stale, unknown and invalid drafts are refused', async () => {
    const { deps, calls } = setup()
    expect((await send(deps, { action: 'publish_form', kind: 'contact', draftRevision: 2 }, { token: 'forms' })).status).toBe(200)
    expect(releaseSnapshotSchema.parse(calls[0]?.snapshot).forms.contact.version).toBe(2)
    expect(calls[0]?.changes).toEqual([{ op: 'publish_form', kind: 'contact', draftRevision: 2 }])

    expect(await send(deps, { action: 'publish_form', kind: 'contact', draftRevision: 1 })).toMatchObject({ status: 409, body: { error: 'stale_draft', kind: 'contact' } })

    const base = fixtureState()
    const noRow = { ...base, forms: base.forms.filter((form) => form.kind !== 'lodging') }
    expect((await send(setup({ state: noRow }).deps, { action: 'publish_form', kind: 'lodging', draftRevision: 2 })).status).toBe(404)

    const broken = { ...base, forms: base.forms.map((form) => (form.kind === 'contact' ? { ...form, draft: { format: 1, fields: [] } } : form)) }
    const invalid = await send(setup({ state: broken }).deps, { action: 'publish_form', kind: 'contact', draftRevision: 2 })
    expect(invalid).toMatchObject({ status: 422, body: { error: 'invalid' } })
    expect(invalid.body?.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'missing_core' })]))
  })
})

describe('publish-content: slug history and RPC errors', () => {
  it('appends changed slugs once and drops an address that comes back', () => {
    const old = { slug: { tr: 'eski', en: 'old', fr: 'old-fr', de: 'old-de' }, category: 'diving' }
    const next = { slug: { tr: 'yeni', en: 'old', fr: 'old-fr', de: 'old-de' }, category: 'diving' }
    const history = nextSlugHistory('event', old, next, [])
    expect(history).toEqual([{ locale: 'tr', slug: 'eski', category: 'diving' }])
    expect(nextSlugHistory('event', next, old, history)).toEqual([{ locale: 'tr', slug: 'yeni', category: 'diving' }])
    const moved = nextSlugHistory('event', old, { ...old, category: 'outdoor' }, [])
    expect(moved).toHaveLength(4)
    expect(nextSlugHistory('post', null, next, [])).toEqual([])
    expect(nextSlugHistory('team_member', old, next, [])).toEqual([])
  })

  it('maps apply_content_release raises onto typed errors', () => {
    expect(releaseError({ message: 'conflict' })).toBeInstanceOf(ReleaseConflict)
    const stale = releaseError({ message: 'stale_draft:abc-1' })
    expect(stale).toBeInstanceOf(StaleDraft)
    expect((stale as StaleDraft).entryId).toBe('abc-1')
    expect(releaseError({ message: 'permission denied' })).toBeNull()
  })
})
