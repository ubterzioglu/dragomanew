import { describe, expect, it } from 'vitest'
import { itemsInGroup, moveWithinGroup, orderChanged, orderItems, scopeKeys } from '../src/lib/content/ordering'

const event = (key: string, subgroup: string, order: number) => ({
  key,
  type: 'event',
  draft: { id: key, subgroup, order, title: { tr: key.toUpperCase() } },
})

const rows = [
  event('c', 'tekne', 2),
  event('a', 'tekne', 0),
  event('x', 'kiyi', 1),
  event('b', 'tekne', 3),
  event('y', 'kiyi', 4),
  { key: 's1', type: 'subgroup', draft: { id: 's1', category: 'diving', order: 0, title: { tr: 'S1' } } },
]

describe('orderItems', () => {
  it('keeps one type, sorted by order, grouped by subgroup', () => {
    const list = orderItems('event', rows)
    expect(scopeKeys(list)).toEqual(['a', 'x', 'c', 'b', 'y'])
    expect(itemsInGroup(list, 'tekne').map((item) => item.key)).toEqual(['a', 'c', 'b'])
    expect(list[0]).toEqual({ key: 'a', title: 'A', order: 0, group: 'tekne' })
    expect(orderItems('subgroup', rows)).toEqual([{ key: 's1', title: 'S1', order: 0, group: 'diving' }])
  })

  it('breaks equal orders by key so the list is stable', () => {
    const list = orderItems('product', [
      { key: 'b', type: 'product', draft: { order: 0, title: { tr: 'B' } } },
      { key: 'a', type: 'product', draft: { order: 0, title: { tr: 'A' } } },
    ])
    expect(scopeKeys(list)).toEqual(['a', 'b'])
  })
})

describe('moveWithinGroup', () => {
  const list = orderItems('event', rows)

  it('swaps with the neighbour in the same group, skipping other groups', () => {
    const moved = moveWithinGroup(list, 'c', -1)
    expect(itemsInGroup(moved, 'tekne').map((item) => item.key)).toEqual(['c', 'a', 'b'])
    expect(itemsInGroup(moved, 'kiyi').map((item) => item.key)).toEqual(['x', 'y'])
    expect(scopeKeys(moved)).toEqual(['c', 'x', 'a', 'b', 'y'])
    expect(scopeKeys(moveWithinGroup(list, 'x', 1))).toEqual(['a', 'y', 'c', 'b', 'x'])
  })

  it('returns the same list at the edges and for unknown keys', () => {
    expect(moveWithinGroup(list, 'a', -1)).toBe(list)
    expect(moveWithinGroup(list, 'b', 1)).toBe(list)
    expect(moveWithinGroup(list, 'nope', 1)).toBe(list)
  })

  it('reports whether anything changed, and never mutates', () => {
    const copy = [...list]
    const moved = moveWithinGroup(list, 'b', -1)
    expect(orderChanged(moved, list)).toBe(true)
    expect(orderChanged(moveWithinGroup(moved, 'b', 1), list)).toBe(false)
    expect(list).toEqual(copy)
  })
})
