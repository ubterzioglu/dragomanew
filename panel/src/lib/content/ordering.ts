import { isRecord } from './docPath'

/**
 * Manual order (§2: per category and subgroup, the same in all languages). The panel keeps one
 * list per type sorted by `order`, moves an item past its neighbour in the same group, and sends
 * the whole list as the `reorder` scope; the server writes each key's index as its order, so the
 * relative order inside every group is exactly what the screen showed.
 */

export const ORDER_TYPES = ['subgroup', 'event', 'product', 'team_member', 'service_offer'] as const
export type OrderType = (typeof ORDER_TYPES)[number]

export interface OrderItem {
  key: string
  title: string
  order: number
  /** Subgroups: the category; events: the subgroup id; others: one group. */
  group: string
}

export interface OrderSource {
  key: string
  type: string
  draft: unknown
}

const titleOf = (draft: Record<string, unknown>): string => {
  const title = draft.title
  if (isRecord(title) && typeof title.tr === 'string') return title.tr
  return typeof draft.name === 'string' ? draft.name : ''
}

const groupOf = (type: OrderType, draft: Record<string, unknown>): string => {
  if (type === 'subgroup') return typeof draft.category === 'string' ? draft.category : ''
  if (type === 'event') return typeof draft.subgroup === 'string' ? draft.subgroup : ''
  if (type === 'service_offer') return typeof draft.kind === 'string' ? draft.kind : ''
  return ''
}

/** Items of one type, sorted by order then key (stable for equal orders). */
export function orderItems(type: OrderType, rows: readonly OrderSource[]): OrderItem[] {
  return rows
    .filter((row) => row.type === type && isRecord(row.draft))
    .map((row) => {
      const draft = row.draft as Record<string, unknown>
      return {
        key: row.key,
        title: titleOf(draft) || row.key,
        order: typeof draft.order === 'number' ? draft.order : 0,
        group: groupOf(type, draft),
      }
    })
    .sort((a, b) => a.order - b.order || a.key.localeCompare(b.key))
}

/**
 * Swaps `key` with its previous (-1) or next (+1) neighbour in the same group. Returns the same
 * array when it is already first or last there, so the caller can tell nothing changed.
 */
export function moveWithinGroup(list: readonly OrderItem[], key: string, direction: -1 | 1): readonly OrderItem[] {
  const from = list.findIndex((item) => item.key === key)
  const item = list[from]
  if (!item) return list
  let to = from + direction
  while (to >= 0 && to < list.length && list[to]?.group !== item.group) to += direction
  const other = list[to]
  if (!other) return list
  return list.map((entry, index) => (index === from ? other : index === to ? item : entry))
}

/** Items of one group, in list order. */
export const itemsInGroup = (list: readonly OrderItem[], group: string): OrderItem[] =>
  list.filter((item) => item.group === group)

/** The `reorder` body's keys: the whole scope. */
export const scopeKeys = (list: readonly OrderItem[]): string[] => list.map((item) => item.key)

/** True when the list differs from the stored order. */
export const orderChanged = (list: readonly OrderItem[], saved: readonly OrderItem[]): boolean =>
  list.length !== saved.length || list.some((item, index) => item.key !== saved[index]?.key)
