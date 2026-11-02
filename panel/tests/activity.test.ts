import { describe, expect, it } from 'vitest'
import { describeActivity, staffNamer } from '../src/lib/activity'
import { CodedError, friendlyError } from '../src/lib/errors'
import type { ActivityRow } from '../src/lib/types'

const name = staffNamer([
  { id: 'a', full_name: 'Ali', role: 'reservations', active: true },
  { id: 'b', full_name: 'Berna', role: 'main_admin', active: true },
  { id: 'c', full_name: 'Cem', role: 'accounting', active: false },
])

const entry = (overrides: Partial<ActivityRow>): ActivityRow => ({
  id: 1,
  request_id: 'r',
  actor_id: null,
  action: 'created',
  from_staff: null,
  to_staff: null,
  created_at: '2026-11-01T10:00:00Z',
  ...overrides,
})

describe('staffNamer', () => {
  it('names staff, marks inactive ones and copes with unknown ids', () => {
    expect(name('a')).toBe('Ali')
    expect(name('c')).toBe('Cem (pasif)')
    expect(name('zzz')).toBe('Bilinmeyen kullanıcı')
    expect(name(null)).toBe('—')
  })
})

describe('describeActivity', () => {
  it('describes each action in a sentence', () => {
    expect(describeActivity(entry({}), name)).toBe('Talep oluşturuldu')
    expect(describeActivity(entry({ action: 'claimed', actor_id: 'a', to_staff: 'a' }), name)).toBe(
      'Ali talebi işleme aldı',
    )
    expect(describeActivity(entry({ action: 'handed_over', actor_id: 'a', from_staff: 'a', to_staff: 'c' }), name)).toBe(
      'Ali talebi Cem (pasif) kişisine devretti',
    )
    expect(describeActivity(entry({ action: 'reassigned', actor_id: 'b', from_staff: 'a', to_staff: 'c' }), name)).toBe(
      'Berna sorumluyu değiştirdi: Ali → Cem (pasif)',
    )
  })
})

describe('CodedError', () => {
  it('carries a code that friendlyError understands', () => {
    expect(friendlyError(new CodedError('PGRST116'))).toBe('Kayıt bulunamadı ya da görme yetkiniz yok.')
  })
})
