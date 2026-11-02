import { mediaRefs } from '../../shared/content/release.ts'

/** "Nerede kullanılıyor": media id → entries whose draft points at it. */

export interface UsageEntry {
  id: string
  type: string
  key: string
}

export function mediaUsage(entries: readonly (UsageEntry & { draft: unknown })[]): ReadonlyMap<string, UsageEntry[]> {
  const usage = new Map<string, UsageEntry[]>()
  for (const { id, type, key, draft } of entries) {
    for (const ref of new Set(mediaRefs(draft))) usage.set(ref, [...(usage.get(ref) ?? []), { id, type, key }])
  }
  return usage
}
