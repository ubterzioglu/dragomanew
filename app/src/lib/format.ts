import { INTL_TAG, type Locale } from '../i18n/locales'

export function formatMoney(amount: number, currency: 'EUR' | 'TRY', locale: Locale): string {
  const whole = Number.isInteger(amount)
  return new Intl.NumberFormat(INTL_TAG[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })
    .format(amount)
    // Keep a no-break space between amount and symbol so "45 €" never wraps; unify the narrow one.
    .replace(/\u202F/g, '\u00A0')
}

export function formatDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_TAG[locale], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${isoDate}T00:00:00Z`),
  )
}
