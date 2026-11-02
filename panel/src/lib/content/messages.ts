import { friendlyError } from '../errors'

/**
 * Turkish messages for the content screens. Function error codes come from publish-content and
 * translate-content (dalga2-sozlesme §6); raw server text is never shown.
 */

/** The exact text §9 asks for when an optimistic save finds a newer revision. */
export const CONFLICT_MESSAGE = 'Bu kayıt başka biri tarafından değiştirildi, yeniden yükleyin'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export class FunctionCallError extends Error {
  readonly status: number
  readonly code: string
  readonly detail: Readonly<Record<string, unknown>>

  constructor(status: number, code: string, detail: Readonly<Record<string, unknown>>) {
    super(code)
    this.name = 'FunctionCallError'
    this.status = status
    this.code = code
    this.detail = detail
  }

  static from(status: number, payload: unknown): FunctionCallError {
    if (!isRecord(payload)) return new FunctionCallError(status, status >= 500 ? 'server' : 'bad_request', {})
    const { error, ...detail } = payload
    return new FunctionCallError(status, typeof error === 'string' ? error : 'server', detail)
  }
}

/** Optimistic save found no row with the revision it was based on. */
export class ConflictError extends Error {
  constructor() {
    super(CONFLICT_MESSAGE)
    this.name = 'ConflictError'
  }
}

const FUNCTION_MESSAGES: Readonly<Record<string, string>> = {
  bad_request: 'İstek geçersiz. Sayfayı yenileyip tekrar deneyin.',
  unauthorized: 'Oturumunuzun süresi doldu. Lütfen yeniden giriş yapın.',
  forbidden: 'Bu işlem için yetkiniz yok.',
  not_found: 'Kayıt bulunamadı.',
  stale_draft: CONFLICT_MESSAGE,
  conflict: 'Bu sırada başka bir yayın yapıldı. Birkaç saniye sonra tekrar deneyin.',
  invalid: 'İçerik yayınlanamadı; aşağıdaki sorunları düzeltin.',
  quota_insufficient: 'DeepL kotası bu çeviri için yetmiyor.',
  deepl_auth: 'DeepL anahtarı geçersiz. UBT’ye haber verin.',
  deepl_quota: 'DeepL kotası doldu. Paket yükseltmeyi Dragoman onaylamalı.',
  deepl_unavailable: 'DeepL şu anda yanıt vermiyor. Biraz sonra tekrar deneyin.',
  network: 'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.',
  server: 'Sunucuda bir hata oluştu. Lütfen tekrar deneyin.',
}

const numberIn = (detail: Readonly<Record<string, unknown>>, key: string): number | null => {
  const value = detail[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/** The message for any error the content screens can meet. */
export function contentErrorMessage(error: unknown): string {
  if (error instanceof ConflictError) return CONFLICT_MESSAGE
  if (error instanceof FunctionCallError) {
    if (error.code === 'quota_insufficient') {
      const needed = numberIn(error.detail, 'needed')
      const remaining = numberIn(error.detail, 'remaining')
      if (needed !== null && remaining !== null) {
        return `DeepL kotası yetmiyor: ${needed.toLocaleString('tr-TR')} karakter gerekli, ${remaining.toLocaleString('tr-TR')} kaldı.`
      }
    }
    return FUNCTION_MESSAGES[error.code] ?? FUNCTION_MESSAGES.server ?? ''
  }
  // unique(type, key) / media id: the shared message would talk about e-mail addresses.
  if (isRecord(error) && error.code === '23505') return 'Bu kısa adla bir kayıt zaten var; başlığı ya da kısa adı değiştirin.'
  return friendlyError(error)
}

export interface ServerIssue {
  path: string
  message: string
  recordId: string
}

/** `422 invalid {issues}` from publish-content, as far as the shape can be read. */
export function serverIssues(error: unknown): ServerIssue[] {
  if (!(error instanceof FunctionCallError) || error.code !== 'invalid') return []
  const issues = error.detail.issues
  if (!Array.isArray(issues)) return []
  return issues.filter(isRecord).map((issue) => ({
    path: typeof issue.path === 'string' ? issue.path : '',
    message: typeof issue.message === 'string' ? issue.message : String(issue.code ?? ''),
    recordId: typeof issue.recordId === 'string' ? issue.recordId : '',
  }))
}
