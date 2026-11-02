import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/** Same folders as scripts/sync-shared.mjs; the functions and the panel cannot import from app/, so they run copies. */
const folders = ['requests', 'content'] as const
const sourceRoot = fileURLToPath(new URL('../../src/shared/', import.meta.url))
const targetRoots = {
  'Edge Functions': fileURLToPath(new URL('../../../supabase/functions/_shared/', import.meta.url)),
  panel: fileURLToPath(new URL('../../../panel/src/shared/', import.meta.url)),
}

const tsFiles = (dir: string): string[] =>
  readdirSync(dir)
    .filter((name) => name.endsWith('.ts'))
    .sort()

const copies = folders.flatMap((folder) => Object.entries(targetRoots).map(([where, root]) => [where, folder, join(sourceRoot, folder), join(root, folder)] as const))
const sources = folders.flatMap((folder) => tsFiles(join(sourceRoot, folder)).map((name) => [folder, name, readFileSync(join(sourceRoot, folder, name), 'utf8')] as const))

describe.each(copies)('shared %s copy of %s', (_where, _folder, source, target) => {
  it('holds exactly the same files (run `npm run sync:shared` when this fails)', () => {
    expect(tsFiles(target)).toEqual(tsFiles(source))
  })

  it.each(tsFiles(source))('%s is a byte-for-byte copy', (name) => {
    expect(readFileSync(join(target, name)).equals(readFileSync(join(source, name)))).toBe(true)
  })
})

/** Same pairs as SHARED_SINGLE_FILES in scripts/sync-shared.mjs: the panel's Docker stage copies only panel/. */
const repoRoot = fileURLToPath(new URL('../../../', import.meta.url))
const singleFiles = [['docs/gelistirici-cookbook.md', 'panel/src/docs/gelistirici-cookbook.md']] as const

describe.each(singleFiles)('%s', (source, target) => {
  it(`is copied byte for byte to ${target} (run \`npm run sync:shared\` when this fails)`, () => {
    expect(readFileSync(join(repoRoot, target)).equals(readFileSync(join(repoRoot, source)))).toBe(true)
  })
})

describe('shared files run unchanged in Deno, the browser and Node', () => {
  it.each(sources)('%s/%s imports nothing but zod and sibling shared .ts files', (_folder, _name, code) => {
    const specifiers = [...code.matchAll(/from\s+'([^']+)'/g)].map((match) => match[1] ?? '')
    for (const specifier of specifiers) expect(specifier === 'zod' || /^\.\/[\w-]+\.ts$|^\.\.\/(requests|content)\/[\w-]+\.ts$/.test(specifier), specifier).toBe(true)
  })

  it.each(sources)('%s/%s uses no platform API and nothing async', (_folder, _name, code) => {
    expect(code).not.toMatch(/\b(async|await|Promise)\b|\b(Deno|process|window|document|globalThis|navigator|crypto)\.|\brequire\(|'node:/)
  })
})
