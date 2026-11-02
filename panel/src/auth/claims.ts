/**
 * What the gate needs from an access token, read from the token itself. RLS checks the same
 * claim (`auth.jwt() ->> 'aal'`), so the gate agrees with the database at once, with no network
 * round trip, and a new token can never inherit an older token's level (a sign-out followed by a
 * fresh aal1 sign-in reads aal1 straight away). The signature is not checked here: this only
 * decides which screen to show, and every query is still checked by the database.
 */

export type Level = 'aal1' | 'aal2'

export interface TokenClaims {
  level: Level
  /** The `session_id` claim: the same across token refreshes, new on every sign-in. */
  sessionId: string | null
}

const UNKNOWN: TokenClaims = { level: 'aal1', sessionId: null }

function decodeSegment(segment: string): unknown {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

/** An unreadable token counts as aal1, so the person lands on /2fa rather than past it. */
export function readTokenClaims(token: string): TokenClaims {
  try {
    const payload = decodeSegment(token.split('.')[1] ?? '')
    if (typeof payload !== 'object' || payload === null) return UNKNOWN
    const { aal, session_id: sessionId } = payload as Record<string, unknown>
    return {
      level: aal === 'aal2' ? 'aal2' : 'aal1',
      sessionId: typeof sessionId === 'string' && sessionId !== '' ? sessionId : null,
    }
  } catch {
    return UNKNOWN
  }
}

/**
 * Scopes cached lookups to one sign-in: a token refresh keeps the scope (the open page never
 * blanks), a new sign-in changes it (nothing from the last session is reused). Without a session
 * id the token itself is the scope, which is merely slower. `#` is the lookup-key separator, so it
 * is stripped.
 */
export function sessionScope(userId: string, token: string): string {
  const scope = readTokenClaims(token).sessionId ?? token
  return `${userId}:${scope.replace(/#/g, '')}`
}
