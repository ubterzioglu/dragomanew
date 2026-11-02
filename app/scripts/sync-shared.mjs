// Copies the shared request rules (src/shared/requests/*.ts) to the Edge Functions'
// _shared folder byte for byte, because Deno cannot import from app/. Run with
// `npm run sync:shared`; tests/unit/sharedSync.test.ts fails while the copies differ.
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const SHARED_SOURCE = join(appRoot, 'src', 'shared', 'requests')
export const SHARED_TARGET = resolve(appRoot, '..', 'supabase', 'functions', '_shared', 'requests')

/** The .ts files that make up the shared rules, sorted so listings compare. */
export function sharedFiles(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.ts'))
    .sort()
}

function sync() {
  mkdirSync(SHARED_TARGET, { recursive: true })
  const wanted = new Set(sharedFiles(SHARED_SOURCE))
  // A file removed from the source must not linger in the function's copy.
  for (const stale of sharedFiles(SHARED_TARGET).filter((name) => !wanted.has(name))) {
    rmSync(join(SHARED_TARGET, stale))
  }
  for (const name of wanted) copyFileSync(join(SHARED_SOURCE, name), join(SHARED_TARGET, name))
  process.stdout.write(`sync-shared: ${wanted.size} file(s) -> ${SHARED_TARGET}\n`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) sync()
