import type { RequestStatus } from './types'

/** The inbox tabs; the id is also the `sekme` query value, so a tab can be linked and reloaded. */
export const REQUEST_TABS = [
  { id: 'pending', label: 'Bekliyor' },
  { id: 'in_progress', label: 'İşleme Alındı' },
  { id: 'mine', label: 'Bana Atananlar' },
] as const

export type RequestTab = (typeof REQUEST_TABS)[number]['id']

/** Rows per step of a tab; "Daha fazla göster" adds another step. */
export const TAB_PAGE_SIZE = 200

export function parseTab(value: string | null): RequestTab {
  return REQUEST_TABS.find((tab) => tab.id === value)?.id ?? 'pending'
}

/** The server-side filter of a tab, so each tab and its count cover every matching request. */
export type TabFilter = { column: 'status'; value: RequestStatus } | { column: 'assignee_id'; value: string }

/** Null when the tab cannot match anything (no staff id for "mine"). */
export function tabFilter(tab: RequestTab, myStaffId: string | null): TabFilter | null {
  if (tab === 'mine') return myStaffId ? { column: 'assignee_id', value: myStaffId } : null
  return { column: 'status', value: tab }
}

/** Says that a tab is cut off, so older requests are never silently missing; null when all are shown. */
export function truncationNotice(shown: number, total: number): string | null {
  if (shown >= total) return null
  return `En yeni ${shown} talep gösteriliyor; bu sekmede toplam ${total} talep var.`
}
