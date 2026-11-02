import { readFile } from 'node:fs/promises'
import path from 'node:path'

const POLICY_META = /<meta http-equiv="Content-Security-Policy" content="([^"]*)">/

/**
 * The origins a built page may post to besides itself. The build adds the Supabase origin to
 * connect-src exactly when VITE_SUPABASE_URL is set, so a non-empty list marks a live build.
 */
export function liveConnectSources(html: string): string[] {
  const policy = POLICY_META.exec(html)?.[1] ?? ''
  const directive = policy
    .split(';')
    .map((part) => part.trim().split(/\s+/))
    .find(([name]) => name === 'connect-src')
  return (directive ?? []).slice(1).filter((source) => source !== "'self'")
}

/**
 * Fails before any test runs when dist/ is a live build: the E2E suite submits every form and
 * expects the sample result, so against a live build it would store test requests in the
 * configured project (app/.env.local sets one, and a plain `npm run build` reads it).
 */
export async function assertDemoBuild(distDir: string): Promise<void> {
  const page = path.join(distDir, 'index.html')
  const html = await readFile(page, 'utf8').catch((error: unknown) => {
    throw new Error(`E2E needs a demo build in ${distDir}: run \`npm run build:demo\` first`, { cause: error })
  })
  const sources = liveConnectSources(html)
  if (sources.length > 0) {
    throw new Error(
      `${page} is a live build (forms post to ${sources.join(', ')}); E2E stays in demo mode: run \`npm run build:demo\` first`,
    )
  }
}
