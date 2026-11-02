// Checks dist/index.html after `vite build`. The panel is served with a header CSP of
// script-src 'self' and style-src 'self' (app/deploy/nginx/dragoman.conf), with no hashes, so any
// inline <script>, <style> or style= attribute that reaches the HTML is silently blocked in production.
// Also every script and stylesheet must come from /panel/assets/ (same origin, long-cached).
// Exit code 1 when anything fails. Usage: node scripts/check-dist.mjs
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const INDEX = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'index.html')

/** Pure: the problems in one built page. */
export function distProblems(html) {
  const problems = []
  for (const [tag, attributes] of html.matchAll(/<script\b([^>]*)>/gi)) {
    const src = /\ssrc="([^"]*)"/i.exec(attributes)?.[1]
    if (src === undefined) problems.push(`inline script: ${tag}`)
    else if (!src.startsWith('/panel/assets/')) problems.push(`script from outside /panel/assets/: ${src}`)
  }
  if (/<style\b/i.test(html)) problems.push('inline <style> element')
  for (const [tag] of html.matchAll(/<[a-z][^>]*\sstyle="[^"]*"[^>]*>/gi)) problems.push(`style= attribute: ${tag}`)
  for (const [tag, href] of html.matchAll(/<link\b[^>]*\srel="(?:stylesheet|modulepreload)"[^>]*\shref="([^"]*)"[^>]*>/gi)) {
    if (!href.startsWith('/panel/assets/')) problems.push(`link from outside /panel/assets/: ${tag}`)
  }
  if (!/<script\b/i.test(html)) problems.push('no script tag: the build produced an empty page')
  return problems
}

async function main() {
  const html = await readFile(INDEX, 'utf8')
  const problems = distProblems(html)
  if (problems.length > 0) {
    console.error(`panel dist/index.html: ${problems.length} problem(s):\n${problems.join('\n')}`)
    process.exit(1)
  }
  process.stdout.write('panel dist/index.html: no inline script or style, all assets under /panel/assets/.\n')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('check-dist failed to run:', error instanceof Error ? error.message : error)
    process.exit(1)
  })
}
