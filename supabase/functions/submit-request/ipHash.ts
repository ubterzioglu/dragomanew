/**
 * HMAC-SHA256 of the client IP with THROTTLE_SALT. Rate limiting needs a stable key per
 * address, but the database never keeps the address itself. Web Crypto only, so it runs in
 * Deno and in Node's test runner alike.
 */

/** Below this an attacker could brute-force the salt from one leaked hash. */
export const THROTTLE_SALT_MIN_LENGTH = 32
/** Earlier .env.example value; long enough to pass the length check, so it is refused by name. */
const PLACEHOLDER_SALT = 'change-me-to-a-long-random-string'

/** Fails at boot on a weak salt. The message names the variable, never its value. */
function assertStrongSalt(salt: string): string {
  if (salt.length < THROTTLE_SALT_MIN_LENGTH) throw new Error(`THROTTLE_SALT must be at least ${THROTTLE_SALT_MIN_LENGTH} random characters`)
  if (salt === PLACEHOLDER_SALT) throw new Error('THROTTLE_SALT still holds the .env.example placeholder')
  return salt
}

export function createIpHasher(salt: string): (ip: string) => Promise<string> {
  const encoder = new TextEncoder()
  const key = crypto.subtle.importKey('raw', encoder.encode(assertStrongSalt(salt)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return async (ip) => {
    const signature = await crypto.subtle.sign('HMAC', await key, encoder.encode(ip))
    return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('')
  }
}
