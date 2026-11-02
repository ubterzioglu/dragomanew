import { panelRedirectUrl } from '../lib/env'

/** Google and the magic link return here; it must be listed in auth.additional_redirect_urls. */
export function authRedirectUrl(): string {
  return panelRedirectUrl(window.location.origin, import.meta.env.BASE_URL)
}
