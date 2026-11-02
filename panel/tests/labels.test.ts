import { describe, expect, it } from 'vitest'
import { actionLabel, kindLabel, localeLabel, roleLabel, statusLabel } from '../src/lib/labels'

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

  it('shows an unknown value as it is instead of hiding it', () => {
    expect(statusLabel('archived')).toBe('archived')
    expect(roleLabel('guest')).toBe('guest')
    expect(actionLabel('noted')).toBe('noted')
  })
})
