import { friendlyError } from '../errors'

/**
 * Turkish messages for the revision screens: the revision codes (set_revision_status, the
 * attachment trigger, the screenshot bucket) first, everything else through the panel's mapping.
 */

const BY_CODE: Readonly<Record<string, string>> = {
  '55000': 'İsteğin durumu bu arada değişti. Sayfayı yenileyip tekrar bakın.',
  P0002: 'Revizyon isteği bulunamadı. Listeyi yenileyin.',
  '54000': 'Bir isteğe ya da yoruma en fazla 10 ekran görüntüsü eklenebilir.',
  '22023': 'Bu durum seçilemez.',
}

const field = (value: unknown, key: string): unknown =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>)[key] : undefined

/** Storage refusals carry an HTTP status instead of a SQLSTATE. */
function storageMessage(error: unknown): string | null {
  const status = String(field(error, 'statusCode') ?? field(error, 'status') ?? '')
  const message = String(field(error, 'message') ?? '')
  if (status === '413' || /maximum allowed size|too large/i.test(message)) return "Ekran görüntüsü 5 MB'tan büyük olamaz."
  if (status === '415' || /mime type/i.test(message)) return 'Yalnız PNG, JPEG ya da WebP ekran görüntüsü eklenebilir.'
  if (status === '403' || /row-level security/i.test(message)) return 'Bu işlem için yetkiniz yok.'
  return null
}

export function revisionErrorMessage(error: unknown): string {
  const code = field(error, 'code')
  if (typeof code === 'string' && Object.hasOwn(BY_CODE, code)) return BY_CODE[code] ?? ''
  return storageMessage(error) ?? friendlyError(error)
}

/** What revision-notify answered (counts per outcome); null when it could not be reached. */
export interface NotifyAnswer {
  recipients: number
  sent: number
  failed: number
  notConfigured: number
}

const count = (value: unknown): number => (typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : 0)

export function parseNotifyAnswer(value: unknown): NotifyAnswer | null {
  if (typeof value !== 'object' || value === null || field(value, 'ok') !== true) return null
  return {
    recipients: count(field(value, 'recipients')),
    sent: count(field(value, 'sent')),
    failed: count(field(value, 'failed')),
    notConfigured: count(field(value, 'notConfigured')),
  }
}

/**
 * One line about the e-mails after an action, or null when there is nothing to say. The action is
 * saved either way; a sent count only means the mail server accepted the mail.
 */
export function notifyMessage(answer: NotifyAnswer | null): string | null {
  if (!answer) return 'E-posta bildirimi gönderilemedi; kayıt yine de alındı.'
  if (answer.notConfigured > 0) return 'E-posta bildirimi gitmedi: panelin e-posta ayarı henüz yapılmadı. Ekip bu ekrandan takip etsin.'
  if (answer.failed > 0) {
    return answer.sent > 0
      ? `E-posta bildirimi ${answer.sent} kişiye gönderildi, ${answer.failed} kişiye gönderilemedi.`
      : 'E-posta bildirimi gönderilemedi; kayıt yine de alındı.'
  }
  return answer.sent > 0 ? `E-posta bildirimi ${answer.sent} kişiye gönderildi.` : null
}
