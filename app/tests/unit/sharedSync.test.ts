import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/** Same folders as scripts/sync-shared.mjs; the function cannot import from app/, so it runs a copy. */
const source = fileURLToPath(new URL('../../src/shared/requests/', import.meta.url))
const target = fileURLToPath(new URL('../../../supabase/functions/_shared/requests/', import.meta.url))

const tsFiles = (dir: string): string[] =>
  readdirSync(dir)
    .filter((name) => name.endsWith('.ts'))
    .sort()

describe('shared request rules copy for the Edge Function', () => {
  it('holds exactly the same files (run `npm run sync:shared` when this fails)', () => {
    expect(tsFiles(target)).toEqual(tsFiles(source))
  })

  it.each(tsFiles(source))('%s is a byte-for-byte copy', (name) => {
    expect(readFileSync(join(target, name)).equals(readFileSync(join(source, name)))).toBe(true)
  })

  it('imports nothing but zod and sibling .ts files, so Deno can run the copy', () => {
    for (const name of tsFiles(source)) {
      const specifiers = [...readFileSync(join(source, name), 'utf8').matchAll(/from\s+'([^']+)'/g)].map((match) => match[1])
      for (const specifier of specifiers) expect(specifier === 'zod' || /^\.\/[\w-]+\.ts$/.test(specifier ?? '')).toBe(true)
    }
  })
})
