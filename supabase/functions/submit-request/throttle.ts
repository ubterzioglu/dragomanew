import type { RateLimit } from './types.ts'

/**
 * The rate-limit call on its own, so the site's vitest suite can check it without supabase-js.
 * public.throttle_submission counts and inserts under a per-hash advisory lock and prunes rows
 * older than a day, so one round trip both decides and records; a count-then-insert from here
 * let a parallel burst through.
 */

/** The slice of a supabase-js client this needs. */
export interface RpcClient {
  rpc(
    fn: 'throttle_submission',
    args: { p_ip_hash: string; p_max: number; p_window_seconds: number },
  ): PromiseLike<{ data: unknown; error: unknown }>
}

export async function throttleSubmission(db: RpcClient, ipHash: string, limit: RateLimit): Promise<boolean> {
  const { data, error } = await db.rpc('throttle_submission', {
    p_ip_hash: ipHash,
    p_max: limit.max,
    p_window_seconds: limit.windowSeconds,
  })
  if (error) throw error
  // Anything but a boolean means the database and this code disagree; fail rather than let it through.
  if (typeof data !== 'boolean') throw new Error('throttle_submission returned no boolean')
  return data
}
