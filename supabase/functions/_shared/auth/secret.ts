/**
 * Timing-safe comparison of a presented secret with the configured one. Both sides are hashed
 * first, so the comparison always runs over 32 bytes whatever the lengths, and the loop never
 * exits early. An empty configured secret never matches.
 */
export async function secretsEqual(presented: string | null, expected: string | null): Promise<boolean> {
  if (!expected || presented === null) return false
  const encoder = new TextEncoder()
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(presented)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ])
  const left = new Uint8Array(a)
  const right = new Uint8Array(b)
  let diff = 0
  for (let i = 0; i < left.length; i += 1) diff |= (left[i] ?? 0) ^ (right[i] ?? 0)
  return diff === 0
}
