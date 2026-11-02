import { friendlyError } from '../errors'

/**
 * Turkish messages for the publish-content and translate-content refusals (dalga2-sozlesme §6).
 * Detail fields (issue lists, quota numbers) are shown only where they help the person act.
 */

const MESSAGES: Readonly<Record<string, string>> = {
  bad_request: 'İstek geçersiz. Sayfayı yenileyip tekrar deneyin.',
  unauthorized: 'Oturumunuzun süresi doldu. Lütfen yeniden giriş yapın.',
  forbidden: 'Bu işlem için yetkiniz yok.',
  not_found: 'Form bulunamadı.',
  stale_draft: 'Bu kayıt başka biri tarafından değiştirildi, yeniden yükleyin.',
  conflict: 'Aynı anda başka bir yayın yapıldı. Birkaç saniye sonra tekrar deneyin.',
  invalid: 'Form yayınlanamadı; aşağıdaki sorunları düzeltin.',
  quota_insufficient: 'DeepL kotası bu çeviri için yetmiyor.',
  deepl_auth: 'DeepL anahtarı geçersiz. UBT’ye haber verin.',
  deepl_quota: 'DeepL kotası doldu. Çeviri yapılamıyor.',
  deepl_unavailable: 'DeepL şu anda yanıt vermiyor. Biraz sonra tekrar deneyin.',
  server: 'Sunucuda bir hata oluştu. Lütfen tekrar deneyin.',
}

interface CodedFailure {
  code: string
  detail?: Record<string, unknown>
}

const isCoded = (error: unknown): error is CodedFailure =>
  typeof error === 'object' && error !== null && error instanceof Error && error.name === 'FunctionError' && typeof (error as { code?: unknown }).code === 'string'

/** The person-facing message for a failed function call, a PostgREST error or anything else. */
export function functionErrorMessage(error: unknown): string {
  if (!isCoded(error)) return error instanceof Error && error.message.startsWith('Bu kayıt') ? error.message : friendlyError(error)
  const base = MESSAGES[error.code] ?? MESSAGES.server ?? ''
  if (error.code === 'quota_insufficient') {
    const { needed, remaining } = error.detail ?? {}
    if (typeof needed === 'number' && typeof remaining === 'number') return `${base} Gereken: ${needed} karakter, kalan: ${remaining}.`
  }
  return base
}

/** `invalid` refusals carry `issues: [{message}]`; their messages, if any. */
export function functionIssues(error: unknown): string[] {
  if (!isCoded(error) || error.code !== 'invalid') return []
  const issues = error.detail?.issues
  if (!Array.isArray(issues)) return []
  return issues.flatMap((issue) => (typeof issue === 'object' && issue !== null && typeof (issue as { message?: unknown }).message === 'string' ? [(issue as { message: string }).message] : []))
}
