/** Reads the panel's build-time settings; kept pure so the rules are unit tested. */

export type PanelConfig = { ok: true; url: string; key: string } | { ok: false; missing: string[] }

type Env = Readonly<Record<string, string | boolean | undefined>>

const text = (value: string | boolean | undefined): string => (typeof value === 'string' ? value.trim() : '')

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export function readPanelConfig(env: Env): PanelConfig {
  const url = text(env.VITE_SUPABASE_URL)
  const key = text(env.VITE_SUPABASE_PUBLISHABLE_KEY)
  const missing = [
    ...(isHttpUrl(url) ? [] : ['VITE_SUPABASE_URL']),
    ...(key ? [] : ['VITE_SUPABASE_PUBLISHABLE_KEY']),
  ]
  return missing.length > 0 ? { ok: false, missing } : { ok: true, url, key }
}

/** The e-mail login is for the local stack only, so a production build never shows it. */
export function devEmailLoginEnabled(env: Env): boolean {
  return env.DEV === true && text(env.VITE_PANEL_DEV_EMAIL_LOGIN) === 'true'
}

/** Where Google and the magic link send the browser back: the panel root, e.g. https://host/panel/. */
export function panelRedirectUrl(origin: string, base: string): string {
  const path = base.endsWith('/') ? base : `${base}/`
  return new URL(path, origin).href
}
