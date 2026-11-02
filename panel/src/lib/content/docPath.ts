/**
 * Immutable reads and writes inside a draft document by key path. Paths are arrays of property
 * names and array indexes; `pointer()` turns one into the JSON Pointer translation.ts uses.
 */

export type DocPath = readonly (string | number)[]

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

export function getIn(doc: unknown, path: DocPath): unknown {
  return path.reduce<unknown>((node, key) => {
    if (Array.isArray(node) && typeof key === 'number') return node[key]
    return isRecord(node) ? node[String(key)] : undefined
  }, doc)
}

/** A copy of `doc` with `value` at `path`; `undefined` removes an object key. */
export function setIn<T>(doc: T, path: DocPath, value: unknown): T {
  const [head, ...rest] = path
  if (head === undefined) return value as T
  if (typeof head === 'number') {
    const list = Array.isArray(doc) ? doc : []
    return list.map((item: unknown, index) => (index === head ? setIn(item, rest, value) : item)) as T
  }
  const record: Record<string, unknown> = isRecord(doc) ? doc : {}
  const next = setIn(record[head], rest, value)
  if (next === undefined) {
    const { [head]: _removed, ...others } = record
    return others as T
  }
  return { ...record, [head]: next } as T
}

const escape = (segment: string): string => segment.replaceAll('~', '~0').replaceAll('/', '~1')

/** `['faq', 0, 'answer']` → `/faq/0/answer`. */
export function pointer(path: DocPath): string {
  return path.map((key) => `/${escape(String(key))}`).join('')
}
