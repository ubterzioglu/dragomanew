import { fileURLToPath } from 'node:url'
import { assertDemoBuild } from './demoBuild'

/** Local runs serve dist/ (vite preview); a deployed host (E2E_BASE_URL) is checked as it is. */
export default async function globalSetup(): Promise<void> {
  if (process.env.E2E_BASE_URL) return
  await assertDemoBuild(fileURLToPath(new URL('../../dist/', import.meta.url)))
}
