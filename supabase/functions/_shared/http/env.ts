/**
 * Environment readers for the Dalga 2 functions' index.ts files (Deno only; handlers never import
 * this). Error messages name the variable, never its value, so a misconfiguration cannot leak a
 * secret into the logs.
 */

export function env(name: string): string | null {
  const value = Deno.env.get(name)?.trim()
  return value ? value : null
}

export function requiredEnv(name: string): string {
  const value = env(name)
  if (!value) throw new Error(`${name} is not set`)
  return value
}

/** Values of a `{ "default": "sb_..." }` key map, as the platform provides them. */
function keyMap(name: string): Record<string, string> {
  const raw = env(name)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null) return {}
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
  } catch {
    throw new Error(`${name} is not valid JSON`)
  }
}

const present = (values: ReadonlyArray<string | null | undefined>): string[] => [
  ...new Set(values.filter((value): value is string => typeof value === 'string' && value !== '')),
]

/** Every publishable key the project has; locally the CLI provides a single key. */
export function publishableKeys(): string[] {
  return present([...Object.values(keyMap('SUPABASE_PUBLISHABLE_KEYS')), env('SUPABASE_PUBLISHABLE_KEY'), env('SUPABASE_ANON_KEY')])
}

/** The `default` secret key, falling back to the single local key and the legacy service role. */
export function secretKey(): string {
  const key = keyMap('SUPABASE_SECRET_KEYS').default ?? env('SUPABASE_SECRET_KEY') ?? env('SUPABASE_SERVICE_ROLE_KEY')
  if (!key) throw new Error('SUPABASE_SECRET_KEYS (or SUPABASE_SECRET_KEY) is not set')
  return key
}

/** Comma-separated exact origins, trailing slashes dropped. */
export function allowedOrigins(): string[] {
  return present((env('ALLOWED_ORIGINS') ?? '').split(',').map((origin) => origin.trim().replace(/\/+$/, '')))
}

/** Server-side log line: the context and the error's message, never a request body or a key. */
export function logError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : String(error)
  console.error(`${context}: ${message.slice(0, 500)}`)
}
