import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js'
import { FunctionCallError } from '../../lib/content/messages'
import { db } from '../../lib/supabase'

/**
 * Calls a staff Edge Function (publish-content, translate-content). They answer
 * `{ok:false, error, ...detail}` on failure (dalga2-sozlesme §6); the body is read so the screen can
 * name the problem (stale draft, invalid issues, quota) instead of a generic failure.
 */
export async function callFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await db().functions.invoke<T>(name, { body })
  if (!error) return data as T
  if (error instanceof FunctionsHttpError) {
    const response = error.context as Response
    const payload: unknown = await response.json().catch(() => null)
    throw FunctionCallError.from(response.status, payload)
  }
  if (error instanceof FunctionsFetchError) throw new FunctionCallError(0, 'network', {})
  throw new FunctionCallError(0, 'server', {})
}
