/**
 * The GA4 measurement id from VITE_GA4_ID. Empty means analytics is off: no consent banner, no
 * footer link, no Google host in the page policy and nothing loaded. vite.config.ts calls this and
 * writes the result into the bundle (lib/env.ts), so a malformed id stops the build instead of
 * shipping a broken tag.
 */
const GA4_ID = /^G-[A-Z0-9]+$/

export function resolveGa4Id(raw: string | undefined): string {
  const value = raw?.trim() ?? ''
  if (value && !GA4_ID.test(value)) {
    throw new Error(`VITE_GA4_ID "${value}" is not a GA4 measurement id; expected G- and capital letters or digits, e.g. G-ABC123XYZ9`)
  }
  return value
}
