import type { ContentEntryListRow, ContentStatusValue } from '../types'

/** The content list's status chips and title search (§9). */

export type StatusChip = 'draft' | 'published' | 'changed' | 'archived'

export const CHIP_LABELS: Readonly<Record<StatusChip, string>> = {
  draft: 'Taslak',
  published: 'Yayında',
  changed: 'Değişiklik var',
  archived: 'Arşiv',
}

export const STATUS_LABELS: Readonly<Record<ContentStatusValue, string>> = {
  draft: 'Taslak',
  published: 'Yayında',
  archived: 'Arşivde',
}

export function statusChip(row: Pick<ContentEntryListRow, 'status' | 'has_changes'>): StatusChip {
  if (row.status === 'archived') return 'archived'
  if (row.status === 'draft') return 'draft'
  return row.has_changes ? 'changed' : 'published'
}

const fold = (text: string): string => text.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Rows of one type whose TR title (or key) contains the search, optionally one chip only. */
export function filterRows(
  rows: readonly ContentEntryListRow[],
  type: string,
  search: string,
  chip: StatusChip | null,
): ContentEntryListRow[] {
  const needle = fold(search.trim())
  return rows.filter(
    (row) =>
      row.type === type &&
      (chip === null || statusChip(row) === chip) &&
      (needle === '' || fold(row.title_tr ?? '').includes(needle) || fold(row.key).includes(needle)),
  )
}
