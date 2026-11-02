import { z } from 'zod'
import { authorizeStaff, type StaffCaller } from '../_shared/auth/staff.ts'
import { buildReleaseSnapshot, canonicalJson, type ReleaseSnapshot } from '../_shared/content/release.ts'
import { COLLECTION_OF, type ContentType } from '../_shared/content/schema.ts'
import { validateContent, type ContentIssue } from '../_shared/content/validate.ts'
import { corsFor, failure, jsonResponse, readJsonBody, sha256Hex, type HeaderMap } from '../_shared/http/http.ts'
import { planRelease, publishBodySchema, type Plan, type PublishBody } from './plan.ts'
import { ReleaseConflict, StaleDraft, type PublishDeps } from './types.ts'

/**
 * publish-content (dalga2-sozlesme §6): Yayınla, Arşivle, Yayından kaldır, ordering and form
 * publishing. Applies the request in memory, validates every published document and the whole
 * candidate set, builds the immutable snapshot with its sha256 and hands both to
 * apply_content_release. A `conflict` (another release landed first) restarts from fresh data,
 * up to three times.
 */

export const CONFLICT_RETRIES = 3

type Outcome = readonly [status: number, body: Record<string, unknown>]

export async function handlePublish(request: Request, deps: PublishDeps): Promise<Response> {
  const cors = corsFor(request.headers.get('origin'), deps.allowedOrigins)
  if (cors === false) return jsonResponse(403, failure('forbidden'))
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (request.method !== 'POST') return jsonResponse(405, failure('bad_request'), { ...cors, allow: 'POST, OPTIONS' })
  const reply = ([status, body]: Outcome, headers: HeaderMap = cors) => jsonResponse(status, body, headers)

  try {
    const auth = await authorizeStaff(request, deps.auth, ['content.publish', 'forms.manage'])
    if (!auth.ok) return reply([auth.status, failure(auth.error)])

    const raw = await readJsonBody(request)
    if (!raw.ok) return reply([raw.reason === 'too_large' ? 413 : 400, failure('bad_request')])
    const body = publishBodySchema.safeParse(raw.value)
    if (!body.success) return reply([400, failure('bad_request', { fields: [...new Set(body.error.issues.map((issue) => issue.path.join('.') || 'body'))] })])

    const needed = body.data.action === 'publish_form' ? 'forms.manage' : 'content.publish'
    if (!auth.caller.permissions.includes(needed)) return reply([403, failure('forbidden')])

    return reply(await publish(body.data, auth.caller, deps))
  } catch (error) {
    deps.reportError?.('publish-content', error)
    return reply([500, failure('server')])
  }
}

async function publish(body: PublishBody, caller: StaffCaller, deps: PublishDeps): Promise<Outcome> {
  for (let attempt = 0; attempt <= CONFLICT_RETRIES; attempt += 1) {
    const state = await deps.store.loadState()
    const plan = planRelease(body, state)
    if ('error' in plan) return [plan.status, failure(plan.error, plan.detail)]

    const releaseId = state.baseRelease + 1
    const built = snapshotOf(plan, releaseId, deps.clock().toISOString())
    if ('issues' in built) return [422, failure('invalid', { issues: built.issues })]

    try {
      const id = await deps.store.applyRelease({
        staffId: caller.staffId,
        baseRelease: state.baseRelease,
        changes: plan.changes,
        snapshot: built.snapshot,
        snapshotSha256: await sha256Hex(canonicalJson(built.snapshot)),
        action: plan.action,
        note: body.note || null,
      })
      return [200, { ok: true, releaseId: id, deployNotBefore: await deployNotBefore(id, deps) }]
    } catch (error) {
      if (error instanceof StaleDraft) return [409, failure('stale_draft', { entryIds: [error.entryId] })]
      if (!(error instanceof ReleaseConflict)) throw error
    }
  }
  return [409, failure('conflict')]
}

/** The snapshot of the candidate state, or the issues that block it (schema first, then whole-set rules). */
function snapshotOf(plan: Plan, releaseId: number, createdAt: string): { snapshot: ReleaseSnapshot } | { issues: ContentIssue[] } {
  let snapshot: ReleaseSnapshot
  try {
    snapshot = buildReleaseSnapshot({ ...plan.input, releaseId, createdAt })
  } catch (error) {
    if (!(error instanceof z.ZodError)) throw error
    return { issues: error.issues.map((issue) => releaseIssue(issue.path, issue.message)) }
  }
  const issues = validateContent(snapshot.content)
  return issues.length > 0 ? { issues } : { snapshot }
}

/** A snapshot-level schema problem, reported against the record it sits in when the path says so. */
function releaseIssue(path: readonly PropertyKey[], message: string): ContentIssue {
  const [root, collection, index, ...rest] = path.map(String)
  const type = root === 'content' ? (collection === 'media' ? 'media' : TYPE_OF_COLLECTION.get(collection ?? '')) : undefined
  if (!type) return { code: 'schema', recordType: 'home', recordId: 'release', path: `/${path.map(String).join('/')}`, message }
  if (type === 'home') return { code: 'schema', recordType: 'home', recordId: 'home', path: `/${[index, ...rest].filter((part) => part !== undefined).join('/')}`, message }
  return { code: 'schema', recordType: type, recordId: `#${index ?? '?'}`, path: `/${rest.join('/')}`, message }
}

const TYPE_OF_COLLECTION = new Map<string, ContentType>((Object.entries(COLLECTION_OF) as [ContentType, string][]).map(([type, collection]) => [collection, type]))

/** The publish already happened; a failed read of the deploy row must not turn it into an error. */
async function deployNotBefore(releaseId: number, deps: PublishDeps): Promise<string | null> {
  try {
    return await deps.store.deployNotBefore(releaseId)
  } catch (error) {
    deps.reportError?.('publish-content: deploy row', error)
    return null
  }
}
