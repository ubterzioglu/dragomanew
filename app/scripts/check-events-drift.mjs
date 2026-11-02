/**
 * Compares the events and options in the site's content (src/content/data) with a Supabase
 * database, because the submit function validates event requests against the events and
 * event_options tables: content that moved on without `npm run db:seed` and a seed apply means
 * refused requests. Exit code 1 on any drift. Not part of `npm run verify`; run `npm run check:events`.
 *
 * Settings come from the environment only: SUPABASE_URL (project URL) and SUPABASE_SECRET_KEY
 * (sb_secret_ key; the tables are closed to anon). Nothing reads .env.local and the key is never printed.
 */
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { runnerImport } from 'vite'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Pure: what the content has that the database lacks and the other way round. */
export function eventsDrift(content, db) {
  const key = (row) => `${row.eventId}/${row.optionId}`
  const contentEvents = new Map(content.events.map((event) => [event.id, event.status]))
  const dbEvents = new Map(db.events.map((event) => [event.id, event.status]))
  const contentOptions = new Set(content.options.map(key))
  const dbOptions = new Set(db.options.map(key))
  return [
    ...[...contentEvents.keys()].filter((id) => !dbEvents.has(id)).map((id) => `event ${id}: in content, missing in database`),
    ...[...dbEvents.keys()].filter((id) => !contentEvents.has(id)).map((id) => `event ${id}: in database, missing in content`),
    ...[...contentEvents]
      .filter(([id, status]) => dbEvents.has(id) && dbEvents.get(id) !== status)
      .map(([id, status]) => `event ${id}: status ${status} in content, ${dbEvents.get(id)} in database`),
    ...[...contentOptions].filter((id) => !dbOptions.has(id)).map((id) => `option ${id}: in content, missing in database`),
    ...[...dbOptions].filter((id) => !contentOptions.has(id)).map((id) => `option ${id}: in database, missing in content`),
  ]
}

async function loadContent() {
  const { module } = await runnerImport(path.join(appDir, 'src/content/data/index.ts'), {
    configFile: false,
    root: appDir,
    logLevel: 'error',
  })
  const events = module.contentData.events
  return {
    events: events.map((event) => ({ id: event.id, status: event.status })),
    options: events.flatMap((event) => event.options.map((option) => ({ eventId: event.id, optionId: option.id }))),
  }
}

/** PostgREST read with the secret key; the key travels only in request headers. */
async function readTable(baseUrl, key, query) {
  const response = await fetch(`${baseUrl}/rest/v1/${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`${query.split('?')[0]}: HTTP ${response.status} ${await response.text()}`)
  return response.json()
}

async function loadDatabase(baseUrl, key) {
  const [events, options] = await Promise.all([
    readTable(baseUrl, key, 'events?select=id,status&limit=1000'),
    readTable(baseUrl, key, 'event_options?select=event_id,id&limit=5000'),
  ])
  return {
    events: events.map((row) => ({ id: row.id, status: row.status })),
    options: options.map((row) => ({ eventId: row.event_id, optionId: row.id })),
  }
}

function settings() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '')
  const key = process.env.SUPABASE_SECRET_KEY?.trim()
  if (!url || !/^https?:\/\//.test(url)) throw new Error('SUPABASE_URL must be set to the project URL')
  if (!key || !key.startsWith('sb_secret_')) throw new Error('SUPABASE_SECRET_KEY must be set to an sb_secret_ key')
  return { url, key }
}

async function main() {
  const { url, key } = settings()
  const [content, db] = await Promise.all([loadContent(), loadDatabase(url, key)])
  const drift = eventsDrift(content, db)
  if (drift.length > 0) {
    process.stderr.write(`${drift.length} drift(s) between app/src/content and ${url}:\n${drift.join('\n')}\n`)
    process.stderr.write('Run `npm run db:seed` in app/ and apply supabase/seed.sql to that database.\n')
    process.exit(1)
  }
  process.stdout.write(`Content and database agree: ${content.events.length} events, ${content.options.length} options.\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`check-events-drift failed: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
}
