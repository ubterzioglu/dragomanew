import { z } from 'zod'
import { authorizeStaff, type StaffCaller } from '../_shared/auth/staff.ts'
import {
  applyTranslations,
  collectSources,
  slugify,
  TARGET_LOCALES,
  type TargetLocale,
  type TranslationResult,
} from '../_shared/content/translation.ts'
import { batchStrings, codePoints, rebuild, uniqueStrings } from '../_shared/deepl/batch.ts'
import { DeeplError } from '../_shared/deepl/client.ts'
import { ensureGlossary } from '../_shared/deepl/glossary.ts'
import { corsFor, failure, jsonResponse, readJsonBody, type HeaderMap } from '../_shared/http/http.ts'
import { REQUEST_KINDS } from '../_shared/requests/payload.ts'
import type { LoadedTarget, TranslateDeps, TranslateTarget } from './types.ts'
import { currentUsage, usageView } from './usage.ts'

/**
 * translate-content (dalga2-sozlesme §2, §6): DeepL fills the other languages of a Turkish draft
 * (content entry, media alt text or form labels). It writes only into the draft; Yayınla stays
 * the human gate. Manual fixes are skipped unless asked for. The quota is checked before any
 * text is sent.
 */

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const translateBodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('usage') }),
  z.object({
    action: z.literal('translate'),
    target: z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('content'), id: z.uuid() }),
      z.object({ kind: z.literal('media'), id: slug }),
      z.object({ kind: z.literal('form'), key: z.enum(REQUEST_KINDS) }),
    ]),
    expectedRevision: z.number().int().positive(),
    locales: z.array(z.enum(TARGET_LOCALES)).min(1).max(3),
    mode: z.enum(['missing', 'stale', 'all']),
    includeManual: z.boolean().default(false),
  }),
])
type TranslateBody = Extract<z.infer<typeof translateBodySchema>, { action: 'translate' }>

type Outcome = readonly [status: number, body: Record<string, unknown>]

export async function handleTranslate(request: Request, deps: TranslateDeps): Promise<Response> {
  const cors = corsFor(request.headers.get('origin'), deps.allowedOrigins)
  if (cors === false) return jsonResponse(403, failure('forbidden'))
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (request.method !== 'POST') return jsonResponse(405, failure('bad_request'), { ...cors, allow: 'POST, OPTIONS' })
  const reply = ([status, body]: Outcome, headers: HeaderMap = cors) => jsonResponse(status, body, headers)

  try {
    const auth = await authorizeStaff(request, deps.auth, 'content.translate')
    if (!auth.ok) return reply([auth.status, failure(auth.error)])

    const raw = await readJsonBody(request)
    if (!raw.ok) return reply([raw.reason === 'too_large' ? 413 : 400, failure('bad_request')])
    const body = translateBodySchema.safeParse(raw.value)
    if (!body.success) return reply([400, failure('bad_request', { fields: [...new Set(body.error.issues.map((issue) => issue.path.join('.') || 'body'))] })])

    if (body.data.action === 'usage') return reply([200, { ok: true, usage: usageView(await currentUsage(deps)) }])
    // The service client writes the draft, so the right to edit that draft is checked here, as RLS would.
    if (!auth.caller.permissions.includes(EDIT_PERMISSION[body.data.target.kind])) return reply([403, failure('forbidden')])
    return reply(await translate(body.data, auth.caller, deps))
  } catch (error) {
    deps.reportError?.('translate-content', error)
    if (error instanceof DeeplError) return reply(deeplFailure(error))
    return reply([500, failure('server')])
  }
}

/** Who may change each kind of draft (dalga2-sozlesme §5): forms are `forms.manage`, the rest `content.edit`. */
const EDIT_PERMISSION: Readonly<Record<TranslateTarget['kind'], string>> = { content: 'content.edit', media: 'content.edit', form: 'forms.manage' }

const targetId = (target: TranslateTarget): string => (target.kind === 'form' ? target.key : target.id)

/** DeepL refusals as the caller sees them; the trace id is logged, never returned. */
function deeplFailure(error: DeeplError): Outcome {
  switch (error.kind) {
    case 'auth':
      return [502, failure('deepl_auth')]
    case 'quota':
      return [503, failure('deepl_quota')]
    case 'unavailable':
      return [503, failure('deepl_unavailable')]
    case 'bad_request':
      return [500, failure('server')]
  }
}

async function translate(body: TranslateBody, caller: StaffCaller, deps: TranslateDeps): Promise<Outcome> {
  const locales = TARGET_LOCALES.filter((locale) => body.locales.includes(locale))
  const loaded = await deps.store.loadTarget(body.target)
  if (!loaded) return [404, failure('not_found')]
  if (loaded.revision !== body.expectedRevision) return [409, failure('stale_draft', { draftRevision: loaded.revision })]

  const sources = collectSources(loaded.doc, loaded.meta, locales, body.mode, body.includeManual)
  const skippedManual = body.includeManual ? 0 : collectSources(loaded.doc, loaded.meta, locales, body.mode, true).length - sources.length
  const perLocale = locales.map((locale) => ({ locale, strings: uniqueStrings(sources.filter((source) => source.locale === locale).map((source) => source.source)) }))
  const sourceChars = perLocale.reduce((sum, { strings }) => sum + strings.reduce((chars, text) => chars + codePoints(text), 0), 0)

  if (sourceChars === 0) {
    return [200, { ok: true, draftRevision: loaded.revision, translated: 0, skippedManual, sourceChars: 0, usage: usageView(await currentUsage(deps)) }]
  }
  const usage = await currentUsage(deps)
  const remaining = Math.max(0, usage.limit - usage.count)
  if (sourceChars > remaining) return [409, failure('quota_insufficient', { needed: sourceChars, remaining })]

  const run = { targetKind: body.target.kind, targetId: targetId(body.target), locales, sourceChars, staffId: caller.staffId }
  let traceId: string | null = null
  try {
    const glossaryId = await ensureGlossary(deps.deepl, deps.store, (context, error) => deps.reportError?.(context, error))
    const translated = new Map<TargetLocale, Map<string, string>>()
    for (const { locale, strings } of perLocale) {
      const map = new Map<string, string>()
      for (const batch of batchStrings(strings)) {
        const result = await deps.deepl.translate({ texts: batch, target: locale, context: loaded.context ?? undefined, glossaryId })
        traceId = result.traceId ?? traceId
        batch.forEach((text, i) => map.set(text, result.texts[i] ?? text))
      }
      translated.set(locale, map)
    }
    const results = sources.map((source): TranslationResult => ({ ...source, value: rebuild(source.source, (text) => translated.get(source.locale)?.get(text) ?? text) }))
    const applied = applyTranslations(loaded.doc, loaded.meta, results, deps.clock().toISOString())
    const doc = body.target.kind === 'content' && loaded.neverPublished ? followTitleSlugs(applied.doc, results, loaded) : applied.doc

    const revision = await deps.store.saveTarget(body.target, body.expectedRevision, doc, applied.meta)
    if (revision === null) {
      await logRun(deps, { ...run, status: 'failed', errorCode: 'stale_draft', deeplTraceId: traceId })
      return [409, failure('stale_draft')]
    }
    await logRun(deps, { ...run, status: 'ok', errorCode: null, deeplTraceId: traceId })
    const after = await currentUsage(deps, true).catch(() => ({ ...usage, count: usage.count + sourceChars }))
    return [200, { ok: true, draftRevision: revision, translated: results.length, skippedManual, sourceChars, usage: usageView(after) }]
  } catch (error) {
    // Logged whatever failed: DeepL may already have counted the characters.
    if (!(error instanceof DeeplError)) {
      await logRun(deps, { ...run, status: 'failed', errorCode: 'server', deeplTraceId: traceId })
      throw error
    }
    await logRun(deps, { ...run, status: 'failed', errorCode: `deepl_${error.kind}`, deeplTraceId: error.traceId ?? traceId })
    // 456: the account is out of characters, whatever the cached count says.
    if (error.kind === 'quota') await deps.store.writeUsage({ count: usage.limit, limit: usage.limit, checkedAt: deps.clock().toISOString() }).catch(() => undefined)
    throw error
  }
}

/** A failed log write must not hide the translation's own outcome. */
async function logRun(deps: TranslateDeps, run: Parameters<TranslateDeps['store']['logRun']>[0]): Promise<void> {
  await deps.store.logRun(run).catch((error: unknown) => deps.reportError?.('translate-content: run log', error))
}

/**
 * On a never-published entry, a language's slug follows its new title while it is still empty
 * or a copy of the Turkish slug (§6 step 3). Published slugs never change here.
 */
function followTitleSlugs(doc: Readonly<Record<string, unknown>>, results: readonly TranslationResult[], loaded: LoadedTarget): Readonly<Record<string, unknown>> {
  const slugs = doc.slug
  if (!loaded.neverPublished || typeof slugs !== 'object' || slugs === null) return doc
  const current = slugs as Record<string, unknown>
  const titles = results.filter((result) => result.path === '/title' && typeof result.value === 'string')
  const next = titles.reduce<Record<string, unknown>>((acc, { locale, value }) => {
    const existing = acc[locale]
    const fresh = slugify(value as string)
    return fresh && (typeof existing !== 'string' || existing === '' || existing === acc.tr) ? { ...acc, [locale]: fresh } : acc
  }, current)
  return next === current ? doc : { ...doc, slug: next }
}
