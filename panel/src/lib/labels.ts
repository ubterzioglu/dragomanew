/**
 * Turkish names for database values. An unknown value is shown as it is, so a new enum value in the
 * database shows up instead of vanishing.
 */

const STATUS: Readonly<Record<string, string>> = {
  pending: 'Bekliyor',
  in_progress: 'İşleme Alındı',
}

const ROLE: Readonly<Record<string, string>> = {
  main_admin: 'Ana yönetici',
  reservations: 'Rezervasyon',
  accounting: 'Muhasebe',
  content: 'İçerik',
}

const PERMISSION: Readonly<Record<string, string>> = {
  'requests.read': 'Talepleri görme',
  'requests.work': 'Talepler üzerinde çalışma',
  'requests.reassign': 'Talep sorumlusunu değiştirme',
  'staff.manage': 'Kullanıcı yönetimi',
  'settings.manage': 'Ayarlar',
  'content.edit': 'İçerik düzenleme',
  'content.translate': 'Çeviri',
  'content.publish': 'Yayınlama',
  'forms.manage': 'Formlar',
  'site.deploy': 'Siteyi yeniden kurma',
  'revisions.use': 'Revizyonlar',
}

const KIND: Readonly<Record<string, string>> = {
  event: 'Etkinlik',
  transport: 'Transfer',
  lodging: 'Konaklama',
  contact: 'İletişim',
}

const ACTION: Readonly<Record<string, string>> = {
  created: 'Talep oluşturuldu',
  claimed: 'İşleme alındı',
  reassigned: 'Sorumlu değiştirildi',
  handed_over: 'Devredildi',
}

const LOCALE: Readonly<Record<string, string>> = {
  tr: 'Türkçe',
  en: 'İngilizce',
  fr: 'Fransızca',
  de: 'Almanca',
}

const lookup =
  (table: Readonly<Record<string, string>>) =>
  (value: string): string =>
    table[value] ?? value

export const statusLabel = lookup(STATUS)
export const roleLabel = lookup(ROLE)
export const permissionLabel = lookup(PERMISSION)
export const kindLabel = lookup(KIND)
export const actionLabel = lookup(ACTION)
export const localeLabel = lookup(LOCALE)
