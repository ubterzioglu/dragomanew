/**
 * Turns Supabase, PostgREST and network errors into short Turkish messages. Raw error text can
 * name tables or policies, so it is never shown; unknown errors get one generic sentence.
 */

const GENERIC = 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
const NETWORK = 'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.'
const HOOK_FAULT = 'Giriş doğrulama kancası yanıt vermedi ya da hatalı. Lütfen yöneticiye haber verin.'
const NOT_STAFF = 'Bu e-posta adresi panel kullanıcısı olarak kayıtlı değil.'

const BY_CODE: Readonly<Record<string, string>> = {
  // Postgres / PostgREST
  '42501': 'Bu işlem için yetkiniz yok.',
  '23505': 'Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.',
  '23514': 'Girilen değerlerden biri geçerli değil.',
  '22P02': 'Girilen değerlerden biri geçerli değil.',
  P0001: 'İşlem yapılamadı; talep bu arada değişmiş olabilir. Listeyi yenileyip tekrar deneyin.',
  // Workflow RPCs (supabase/migrations/*_request_workflow.sql)
  '55000': 'Bu talep bu arada işleme alınmış. Listeyi yenileyip tekrar bakın.',
  P0002: 'Talep bulunamadı.',
  '22023':
    'Talep bu kişiye verilemiyor: kişi etkin olmalı, talepler üzerinde çalışabilmeli ve talep zaten onda olmamalı.',
  PGRST116: 'Kayıt bulunamadı ya da görme yetkiniz yok.',
  PGRST301: 'Oturumunuzun süresi doldu. Lütfen yeniden giriş yapın.',
  PGRST303: 'Oturumunuzun süresi doldu. Lütfen yeniden giriş yapın.',
  // Supabase Auth
  invalid_credentials: 'E-posta adresi ya da şifre hatalı.',
  email_not_confirmed: 'E-posta adresiniz henüz doğrulanmamış. Google ile giriş yapın ya da yöneticiye başvurun.',
  weak_password: 'Şifre çok zayıf. En az 12 karakterli, tahmin edilmesi zor bir şifre seçin.',
  same_password: 'Yeni şifre eskisiyle aynı olamaz.',
  reauthentication_needed: 'Güvenlik için çıkış yapıp yeniden giriş yapın, sonra şifreyi tekrar belirleyin.',
  otp_expired: 'Kodun ya da bağlantının süresi dolmuş. Yeni bir tane isteyin.',
  over_email_send_rate_limit: 'Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar deneyin.',
  over_request_rate_limit: 'Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar deneyin.',
  signup_disabled: NOT_STAFF,
  user_not_found: NOT_STAFF,
  email_address_not_authorized: 'Bu e-posta adresine giriş e-postası gönderilemiyor.',
  provider_disabled: 'Bu giriş yöntemi şu anda kapalı.',
  validation_failed: 'Girilen değerlerden biri geçerli değil.',
  session_not_found: 'Oturumunuzun süresi doldu. Lütfen yeniden giriş yapın.',
  refresh_token_not_found: 'Oturumunuzun süresi doldu. Lütfen yeniden giriş yapın.',
  // Auth may still ask for a second factor from an account that enrolled one before 2026-11-02.
  insufficient_aal: 'Bu hesapta eski bir iki adımlı doğrulama kaydı var. Kaldırılması için ana yöneticiye başvurun.',
  // A broken hook is a setup fault; it must never read as "this address is not registered".
  hook_timeout: HOOK_FAULT,
  hook_timeout_after_retry: HOOK_FAULT,
  hook_payload_over_size_limit: HOOK_FAULT,
}

/**
 * The before_user_created hook's own refusal text (supabase/migrations/*_staff_access.sql). Auth
 * passes the hook's message through, so matching it does not depend on the code it is wrapped in.
 */
export const STAFF_HOOK_TEXT = 'personeli olarak kayıtlı değil'

/** An error the panel raises itself, carrying one of the codes above. */
export class CodedError extends Error {
  readonly code: string

  constructor(code: string) {
    super(code)
    this.name = 'CodedError'
    this.code = code
  }
}

const field = (value: unknown, key: string): unknown =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>)[key] : undefined

function isNetworkFailure(error: unknown): boolean {
  const message = field(error, 'message')
  const name = field(error, 'name')
  if (name === 'AuthRetryableFetchError') return true
  return (
    typeof message === 'string' &&
    (error instanceof TypeError || name === 'FetchError') &&
    /fetch|network|load failed/i.test(message)
  )
}

/** keep_a_main_admin() raises a check violation (23514) that needs its own explanation. */
const LAST_MAIN_ADMIN = 'Son etkin ana yönetici pasifleştirilemez ya da rolü değiştirilemez.'

/** The message for a known code, or null, so callers can pick their own fallback. */
export function knownErrorMessage(code: unknown): string | null {
  // hasOwn: a code such as "toString" must not pick up Object.prototype.
  return typeof code === 'string' && Object.hasOwn(BY_CODE, code) ? (BY_CODE[code] ?? null) : null
}

export function friendlyError(error: unknown): string {
  if (isNetworkFailure(error)) return NETWORK
  const code = field(error, 'code')
  const message = field(error, 'message')
  if (code === '23514' && typeof message === 'string' && message.includes('main_admin')) return LAST_MAIN_ADMIN
  if (typeof message === 'string' && message.includes(STAFF_HOOK_TEXT)) return NOT_STAFF
  return knownErrorMessage(code) ?? GENERIC
}
