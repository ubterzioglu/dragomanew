/**
 * Writes supabase/seed.sql from the site's own content (src/content/data): the content entries
 * (draft = published, translations marked `seed`), the repo media, form version 1 of each form,
 * release #1 (the same snapshot publish-content would build) and the events projection the submit
 * function prices from. Run with `npm run db:seed`; `--check` fails when seed.sql is out of date.
 *
 * Every insert is `on conflict do nothing`, so running the seed against a database the panel has
 * already edited never overwrites anything.
 *
 * The content is TypeScript. Vite's module runner (already a dependency) loads it directly,
 * so there is no build step and no extra tool.
 */
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { runnerImport } from 'vite'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const seedFile = path.resolve(appDir, '../supabase/seed.sql')

/** Fixed, so the file is reproducible (--check). */
const SEED_AT = '2026-11-01T00:00:00.000Z'
const TARGET_LOCALES = ['en', 'fr', 'de']
const WITH_STATUS = new Set(['event', 'post', 'product'])

/** A SQL string literal. standard_conforming_strings is on, so only quotes need doubling. */
function sqlText(value) {
  if (value === null || value === undefined) return 'null'
  if (typeof value !== 'string') throw new TypeError(`expected a string, got ${typeof value}`)
  return `'${value.replaceAll("'", "''")}'`
}

function sqlJson(value, canonicalJson = JSON.stringify) {
  return `${sqlText(canonicalJson(value))}::jsonb`
}

function sqlNumber(value) {
  if (value === null) return 'null'
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`expected a number, got ${value}`)
  return String(value)
}

/** Only the locales the site has; drops anything else a content file might carry. */
function localizedText(text) {
  return Object.fromEntries(
    ['tr', 'en', 'fr', 'de'].filter((locale) => typeof text[locale] === 'string').map((locale) => [locale, text[locale]]),
  )
}

function eventRow(event) {
  return `  (${[
    sqlText(event.id),
    sqlText(event.category),
    sqlJson(localizedText(event.title)),
    sqlText(event.priceDisplay),
    sqlText(event.healthForm),
    sqlText(event.status),
  ].join(', ')})`
}

function optionRows(event) {
  return event.options.map(
    (option, index) =>
      `  (${[
        sqlText(event.id),
        sqlText(option.id),
        sqlJson(localizedText(option.name)),
        sqlNumber(option.price),
        sqlText(option.currency),
        sqlText(option.basis),
        String(index),
      ].join(', ')})`,
  )
}

function eventStatements(events) {
  const statements = [
    [
      'insert into public.events (id, category, title, price_display, health_form, status) values',
      events.map(eventRow).join(',\n'),
      'on conflict (id) do nothing;',
    ].join('\n'),
  ]
  const options = events.flatMap(optionRows)
  if (options.length > 0) {
    statements.push(
      [
        'insert into public.event_options (event_id, id, name, price, currency, basis, sort) values',
        options.join(',\n'),
        'on conflict (event_id, id) do nothing;',
      ].join('\n'),
    )
  }
  return statements
}

/** The value at a JSON Pointer (only the pointers translatablePaths returns). */
function pointerGet(doc, pointer) {
  if (pointer === '') return doc
  return pointer
    .slice(1)
    .split('/')
    .map((segment) => segment.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce((node, segment) => (node !== null && typeof node === 'object' ? node[segment] : undefined), doc)
}

const isPresent = (value) => (typeof value === 'string' ? value.trim() !== '' : Array.isArray(value) ? value.length > 0 : value !== undefined)

/** TranslationMeta marking every translation the fixture already has as `seed`, made from today's Turkish. */
function seedMeta(doc, translation) {
  const meta = {}
  for (const pointer of translation.translatablePaths(doc)) {
    const localized = pointerGet(doc, pointer)
    const hash = translation.hashSource(localized.tr)
    const marks = {}
    for (const locale of TARGET_LOCALES) {
      if (isPresent(localized[locale])) marks[locale] = { hash, origin: 'seed', at: SEED_AT }
    }
    if (Object.keys(marks).length > 0) meta[pointer] = marks
  }
  return meta
}

/** One content_entries row per fixture record, validated with the shared schemas. */
function contentEntries(data, schema) {
  const schemaOf = {
    event: schema.eventSchema,
    subgroup: schema.subgroupSchema,
    category_page: schema.categoryPageSchema,
    service_offer: schema.serviceOfferSchema,
    product: schema.productSchema,
    post: schema.postSchema,
    team_member: schema.teamMemberSchema,
    testimonial: schema.testimonialSchema,
    rich_page: schema.richPageSchema,
    home: schema.homeContentSchema,
  }
  const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
  return Object.entries(schema.COLLECTION_OF)
    .flatMap(([type, collection]) => {
      const records = type === 'home' ? [data.home] : data[collection]
      return records.map((record) => {
        const doc = schemaOf[type].parse(record)
        const key = type === 'home' ? 'home' : (doc.id ?? doc.key)
        const status = WITH_STATUS.has(type) ? doc.status : 'published'
        return { type, key, doc, status, published: status === 'draft' ? null : doc }
      })
    })
    .toSorted((a, b) => compare(a.type, b.type) || compare(a.key, b.key))
}

function contentStatement(entries, translation, canonicalJson) {
  const rows = entries.map(
    (entry) => `  (${[sqlText(entry.type), sqlText(entry.key), sqlJson(entry.doc, canonicalJson), sqlJson(seedMeta(entry.doc, translation), canonicalJson), sqlText(entry.status)].join(', ')})`,
  )
  return [
    'insert into public.content_entries (type, key, draft, translation_meta, published, published_revision, status, published_at)',
    'select v.type::public.content_type, v.key, v.doc, v.meta,',
    "       case when v.status <> 'draft' then v.doc end,",
    "       case when v.status <> 'draft' then 1 end,",
    '       v.status::public.content_status,',
    `       case when v.status <> 'draft' then ${sqlText(SEED_AT)}::timestamptz end`,
    'from (values',
    rows.join(',\n'),
    ') as v (type, key, doc, meta, status)',
    'on conflict (type, key) do nothing;',
  ].join('\n')
}

function mediaStatement(media, translation, canonicalJson) {
  const rows = media.map(
    (asset) =>
      `  (${[
        sqlText(asset.id),
        "'repo'",
        sqlText(asset.sourceFile),
        `array[${asset.widths.map(sqlNumber).join(', ')}]::integer[]`,
        sqlNumber(asset.width),
        sqlNumber(asset.height),
        sqlJson(asset.alt, canonicalJson),
        sqlText(asset.topic),
        sqlText(asset.rights),
        asset.placeholder ? 'true' : 'false',
        sqlJson(seedMeta({ alt: asset.alt }, translation), canonicalJson),
      ].join(', ')})`,
  )
  return [
    'insert into public.media_assets (id, storage, source_file, widths, width, height, alt, topic, rights, placeholder, translation_meta) values',
    rows.join(',\n'),
    'on conflict (id) do nothing;',
  ].join('\n')
}

function formStatements(definitions, canonicalJson) {
  const kinds = Object.keys(definitions)
  return [
    [
      'insert into public.form_versions (kind, version, definition, published_at) values',
      kinds.map((kind) => `  (${sqlText(kind)}, 1, ${sqlJson(definitions[kind], canonicalJson)}, ${sqlText(SEED_AT)})`).join(',\n'),
      'on conflict (kind, version) do nothing;',
    ].join('\n'),
    [
      'insert into public.form_definitions (kind, draft, published_version) values',
      kinds.map((kind) => `  (${sqlText(kind)}, ${sqlJson(definitions[kind], canonicalJson)}, 1)`).join(',\n'),
      'on conflict (kind) do nothing;',
    ].join('\n'),
  ]
}

function releaseStatement(snapshot, canonicalJson) {
  const bytes = canonicalJson(snapshot)
  const sha256 = createHash('sha256').update(bytes, 'utf8').digest('hex')
  return [
    'insert into public.content_releases (id, created_at, action, entry_ids, note, snapshot, snapshot_sha256)',
    `select 1, ${sqlText(SEED_AT)}, 'seed', array(select e.id from public.content_entries as e order by e.type, e.key), 'Stage A content',`,
    `       ${sqlText(bytes)}::jsonb, ${sqlText(sha256)}`,
    'on conflict (id) do nothing;',
  ].join('\n')
}

/** The whole seed, from already loaded modules (exported for tests). */
export function renderSeed({ data, schema, release, translation, forms }) {
  const entries = contentEntries(data, schema)
  const media = data.media.map((asset) => schema.mediaAssetSchema.parse(asset))
  const events = data.events.map((event) => schema.eventSchema.parse(event))
  const formReleases = Object.fromEntries(Object.entries(forms.DEFAULT_FORM_DEFINITIONS).map(([kind, definition]) => [kind, { version: 1, definition }]))
  const snapshot = release.buildReleaseSnapshot({
    releaseId: 1,
    createdAt: SEED_AT,
    entries: entries.map(({ type, key, status, published }) => ({ type, key, status, published, slugHistory: [] })),
    media: media.map((asset) => ({ ...asset, storage: 'repo' })),
    forms: formReleases,
  })
  const { canonicalJson } = release

  const statements = [
    contentStatement(entries, translation, canonicalJson),
    mediaStatement(media, translation, canonicalJson),
    ...formStatements(forms.DEFAULT_FORM_DEFINITIONS, canonicalJson),
    releaseStatement(snapshot, canonicalJson),
    ...eventStatements(events),
  ]
  return [
    '-- Generated by app/scripts/generate-supabase-seed.mjs from app/src/content/data.',
    '-- Do not edit by hand: change the content and run `npm run db:seed` in app/.',
    '-- Every insert is "on conflict do nothing": the seed never overwrites panel edits.',
    '',
    statements.join('\n\n'),
    '',
  ].join('\n')
}

async function loadModule(relativePath) {
  const { module } = await runnerImport(path.join(appDir, relativePath), {
    configFile: false,
    root: appDir,
    logLevel: 'error',
  })
  return module
}

async function loadModules() {
  const [data, schema, release, translation, forms] = await Promise.all([
    loadModule('src/content/data/index.ts'),
    loadModule('src/shared/content/schema.ts'),
    loadModule('src/shared/content/release.ts'),
    loadModule('src/shared/content/translation.ts'),
    loadModule('src/shared/requests/forms.ts'),
  ])
  return { data: data.contentData, schema, release, translation, forms }
}

async function main() {
  const sql = renderSeed(await loadModules())
  if (process.argv.includes('--check')) {
    const current = await readFile(seedFile, 'utf8').catch(() => '')
    if (current !== sql) {
      process.stderr.write('supabase/seed.sql is out of date; run `npm run db:seed` in app/.\n')
      process.exit(1)
    }
    process.stdout.write('supabase/seed.sql is up to date.\n')
    return
  }
  await writeFile(seedFile, sql, 'utf8')
  process.stdout.write(`Wrote ${path.relative(appDir, seedFile)}.\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
    process.exit(1)
  })
}
