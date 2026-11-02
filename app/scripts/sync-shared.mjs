// Copies the shared rules (src/shared/{requests,content}/*.ts) byte for byte to the Edge
// Functions' _shared folder and to the panel, because Deno and the panel cannot import from app/.
// Run with `npm run sync:shared`; tests/unit/sharedSync.test.ts fails while any copy differs.
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(appRoot, '..')
export const SHARED_FOLDERS = ['requests', 'content']
export const SHARED_SOURCE_ROOT = join(appRoot, 'src', 'shared')
export const SHARED_TARGET_ROOTS = [join(repoRoot, 'supabase', 'functions', '_shared'), join(repoRoot, 'panel', 'src', 'shared')]

/** The .ts files that make up the shared rules, sorted so listings compare. */
export function sharedFiles(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.ts'))
    .sort()
}

function syncFolder(source, target) {
  mkdirSync(target, { recursive: true })
  const wanted = new Set(sharedFiles(source))
  // A file removed from the source must not linger in a copy.
  for (const stale of sharedFiles(target).filter((name) => !wanted.has(name))) rmSync(join(target, stale))
  for (const name of wanted) copyFileSync(join(source, name), join(target, name))
  process.stdout.write(`sync-shared: ${wanted.size} file(s) -> ${target}\n`)
}

function sync() {
  for (const folder of SHARED_FOLDERS) {
    for (const root of SHARED_TARGET_ROOTS) syncFolder(join(SHARED_SOURCE_ROOT, folder), join(root, folder))
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) sync()
