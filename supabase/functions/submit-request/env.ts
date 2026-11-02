import type { SubmitConfig } from './types.ts'

/**
 * Reads the function's settings from the environment once per worker. Error messages name
 * the variable, never its value, so a misconfiguration cannot leak a secret into the logs.
 * SMTP is read separately (mailer.ts), because a bad SMTP setting must not stop the function.
 */

/** Contract: 5 submissions per IP hash in 10 minutes (throttle_submission's p_max and p_window_seconds). */
const RATE_LIMIT = { max: 5, windowSeconds: 10 * 60 } as const
/** Long enough for an SMTP handshake, short enough that the visitor still gets an answer. */
const MAIL_TIMEOUT_MS = 8_000

function env(name: string): string | null {
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
function publishableKeys(): string[] {
  return present([...Object.values(keyMap('SUPABASE_PUBLISHABLE_KEYS')), env('SUPABASE_PUBLISHABLE_KEY'), env('SUPABASE_ANON_KEY')])
}

/** The `default` secret key, falling back to the single local key and the legacy service role. */
export function secretKey(): string {
  const key = keyMap('SUPABASE_SECRET_KEYS').default ?? env('SUPABASE_SECRET_KEY') ?? env('SUPABASE_SERVICE_ROLE_KEY')
  if (!key) throw new Error('SUPABASE_SECRET_KEYS (or SUPABASE_SECRET_KEY) is not set')
  return key
}

function httpUrl(name: string): string | null {
  const value = env(name)
  return value && /^https?:\/\//.test(value) ? value : null
}

export function readConfig(): SubmitConfig {
  return {
    allowedOrigins: present((env('ALLOWED_ORIGINS') ?? '').split(',').map((origin) => origin.trim().replace(/\/+$/, ''))),
    publishableKeys: publishableKeys(),
    businessEmail: env('BUSINESS_EMAIL'),
    panelUrl: httpUrl('PANEL_URL'),
    rateLimit: RATE_LIMIT,
    mailTimeoutMs: MAIL_TIMEOUT_MS,
  }
}
