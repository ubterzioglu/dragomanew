import type { TranslateDeps, UsageSetting } from './types.ts'

/**
 * DeepL quota bookkeeping (dalga2-sozlesme §2, §6): /v2/usage is cached in app_settings for ten
 * minutes; the panel warns at 80 % and 100 %. Nothing upgrades the plan automatically.
 */

export const USAGE_TTL_MS = 10 * 60 * 1000
export const WARN_RATIO = 0.8

export interface UsageView {
  count: number
  limit: number
  ratio: number
  level: 'ok' | 'warn' | 'critical'
}

export function usageView(usage: UsageSetting): UsageView {
  const ratio = usage.limit > 0 ? usage.count / usage.limit : 1
  return { count: usage.count, limit: usage.limit, ratio, level: ratio >= 1 ? 'critical' : ratio >= WARN_RATIO ? 'warn' : 'ok' }
}

/**
 * The cached usage while it is younger than ten minutes (unless `force`), else a fresh /v2/usage.
 * When DeepL cannot answer, a cached value is better than none; without one the error propagates.
 */
export async function currentUsage(deps: TranslateDeps, force = false): Promise<UsageSetting> {
  const cached = await deps.store.readUsage()
  const now = deps.clock()
  if (!force && cached && now.getTime() - Date.parse(cached.checkedAt) < USAGE_TTL_MS) return cached
  try {
    const fresh = await deps.deepl.usage()
    const usage = { ...fresh, checkedAt: now.toISOString() }
    await deps.store.writeUsage(usage)
    return usage
  } catch (error) {
    if (!cached) throw error
    deps.reportError?.('translate-content: usage refresh', error)
    return cached
  }
}
