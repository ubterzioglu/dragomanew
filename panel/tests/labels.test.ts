import { describe, expect, it } from 'vitest'
import { actionLabel, kindLabel, localeLabel, permissionLabel, roleLabel, statusLabel } from '../src/lib/labels'
import { PERMISSIONS } from '../src/lib/permissions'

describe('labels', () => {
  it('names both request statuses in Turkish', () => {
    expect(statusLabel('pending')).toBe('Bekliyor')
    expect(statusLabel('in_progress')).toBe('İşleme Alındı')
  })

  it('names every staff role', () => {
    expect(roleLabel('main_admin')).toBe('Ana yönetici')
    expect(roleLabel('reservations')).toBe('Rezervasyon')
    expect(roleLabel('accounting')).toBe('Muhasebe')
    expect(roleLabel('content')).toBe('İçerik')
  })

  it('names request kinds, activity actions and locales', () => {
    expect(kindLabel('event')).toBe('Etkinlik')
    expect(kindLabel('transport')).toBe('Transfer')
    expect(kindLabel('lodging')).toBe('Konaklama')
    expect(kindLabel('contact')).toBe('İletişim')
    expect(actionLabel('created')).toBe('Talep oluşturuldu')
    expect(actionLabel('claimed')).toBe('İşleme alındı')
    expect(actionLabel('handed_over')).toBe('Devredildi')
    expect(actionLabel('reassigned')).toBe('Sorumlu değiştirildi')
    expect(localeLabel('de')).toBe('Almanca')
  })

  it('names every permission', () => {
    for (const permission of PERMISSIONS) expect(permissionLabel(permission)).not.toBe(permission)
    expect(permissionLabel('revisions.use')).toBe('Revizyonlar')
    expect(permissionLabel('content.publish')).toBe('Yayınlama')
  })

  it('shows an unknown value as it is instead of hiding it', () => {
    expect(statusLabel('archived')).toBe('archived')
    expect(roleLabel('guest')).toBe('guest')
    expect(actionLabel('noted')).toBe('noted')
  })
})
