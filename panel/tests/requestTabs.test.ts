import { describe, expect, it } from 'vitest'
import { parseTab, REQUEST_TABS, TAB_PAGE_SIZE, tabFilter, truncationNotice } from '../src/lib/requestTabs'

describe('request tabs', () => {
  it('offers the three tabs in order', () => {
    expect(REQUEST_TABS.map((tab) => tab.label)).toEqual(['Bekliyor', 'İşleme Alındı', 'Bana Atananlar'])
  })

  it('reads the tab from the query string and falls back to pending', () => {
    expect(parseTab('mine')).toBe('mine')
    expect(parseTab('in_progress')).toBe('in_progress')
    expect(parseTab('bogus')).toBe('pending')
    expect(parseTab(null)).toBe('pending')
  })

  it('filters each tab on the server: by status, or by assignee for "mine"', () => {
    expect(tabFilter('pending', 'me')).toEqual({ column: 'status', value: 'pending' })
    expect(tabFilter('in_progress', 'me')).toEqual({ column: 'status', value: 'in_progress' })
    expect(tabFilter('mine', 'me')).toEqual({ column: 'assignee_id', value: 'me' })
    expect(tabFilter('mine', null)).toBeNull()
  })

  it('pages each tab in fixed steps', () => {
    expect(TAB_PAGE_SIZE).toBeGreaterThan(0)
  })
})

describe('truncationNotice', () => {
  it('says nothing when the whole tab is shown', () => {
    expect(truncationNotice(3, 3)).toBeNull()
    expect(truncationNotice(0, 0)).toBeNull()
  })

  it('says how many are shown out of the total when the tab is cut off', () => {
    expect(truncationNotice(200, 731)).toBe('En yeni 200 talep gösteriliyor; bu sekmede toplam 731 talep var.')
  })
})
