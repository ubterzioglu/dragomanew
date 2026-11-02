/**
 * Display formatting for request data. Payload, snapshot and summary arrive as JSON written by the
 * Edge Function, so every reader here checks the shape and degrades to a dash instead of throwing.
 */

const TIME_ZONE = 'Europe/Istanbul'
const DASH = '—'

const dateTimeFormat = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short', timeZone: TIME_ZONE })

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return DASH
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? DASH : dateTimeFormat.format(date)
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

type Json = Record<string, unknown>

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value)
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

// ---------------------------------------------------------------------------------------------
// Price summary (the server's requestSummary result)

export type PriceView =
  | { kind: 'none' }
  | { kind: 'note'; text: string }
  | { kind: 'total'; lines: { optionId: string; text: string }[]; total: string }

const SUMMARY_NOTES: Readonly<Record<string, string>> = {
  on_request: 'Fiyat talep üzerine.',
  empty: 'Seçenek seçilmemiş.',
  unpriced: 'Seçilen seçeneklerden birinin fiyatı yok; toplam hesaplanmadı.',
  not_combinable: 'Seçenekler farklı para birimi ya da fiyat türünde; toplam hesaplanmadı.',
}

function totalView(summary: Json): PriceView {
  const { currency, total, lines } = summary
  if (typeof currency !== 'string' || !isNumber(total) || !Array.isArray(lines)) return { kind: 'none' }
  const viewLines = lines.filter(isObject).flatMap((line) => {
    const { optionId, quantity, unitPrice, subtotal } = line
    if (typeof optionId !== 'string' || !isNumber(quantity) || !isNumber(unitPrice) || !isNumber(subtotal)) return []
    const text = `${quantity} × ${formatMoney(unitPrice, currency)} = ${formatMoney(subtotal, currency)}`
    return [{ optionId, text }]
  })
  return { kind: 'total', lines: viewLines, total: formatMoney(total, currency) }
}

export function describePriceSummary(summary: unknown): PriceView {
  if (!isObject(summary) || typeof summary.kind !== 'string') return { kind: 'none' }
  if (summary.kind === 'total') return totalView(summary)
  const note = SUMMARY_NOTES[summary.kind]
  return note ? { kind: 'note', text: note } : { kind: 'none' }
}

// ---------------------------------------------------------------------------------------------
// Payload (the validated form values)

/** Shown in the request header already. */
const CONTACT_KEYS = new Set(['fullName', 'email', 'phone'])

const FIELD_LABELS: Readonly<Record<string, string>> = {
  preferredDate: 'Tercih edilen tarih',
  partySize: 'Kişi sayısı',
  message: 'Mesaj',
  distribution: 'Seçenek dağılımı',
  tripType: 'Yolculuk türü',
  from: 'Nereden',
  to: 'Nereye',
  dateTime: 'Tarih ve saat',
  returnDateTime: 'Dönüş tarihi ve saati',
  childSeat: 'Çocuk koltuğu',
  childSeatAges: 'Çocuk koltuğu yaşları',
  note: 'Not',
  checkIn: 'Giriş tarihi',
  checkOut: 'Çıkış tarihi',
  adults: 'Yetişkin',
  children: 'Çocuk',
  childAges: 'Çocuk yaşları',
  rooms: 'Oda sayısı',
  preferences: 'Tercihler',
  subject: 'Konu',
}

const VALUE_LABELS: Readonly<Record<string, string>> = { oneWay: 'Tek yön', roundTrip: 'Gidiş-dönüş' }

function formatScalar(value: unknown): string {
  if (value === null || value === undefined || value === '') return DASH
  if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır'
  if (typeof value === 'string') return VALUE_LABELS[value] ?? value
  if (typeof value === 'number') return String(value)
  return JSON.stringify(value)
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.length > 0 ? value.map(formatScalar).join(', ') : DASH
  if (isObject(value)) {
    const parts = Object.entries(value).map(([key, inner]) => `${key}: ${formatScalar(inner)}`)
    return parts.length > 0 ? parts.join(', ') : DASH
  }
  return formatScalar(value)
}

export interface PayloadEntry {
  key: string
  label: string
  value: string
}

export function payloadEntries(payload: unknown): PayloadEntry[] {
  if (!isObject(payload)) return []
  return Object.entries(payload)
    .filter(([key]) => !CONTACT_KEYS.has(key))
    .map(([key, value]) => ({ key, label: FIELD_LABELS[key] ?? key, value: formatValue(value) }))
}

// ---------------------------------------------------------------------------------------------
// Event snapshot (the event as it was when the request came in)

export interface SnapshotView {
  title: string | null
  options: { id: string; name: string; detail: string }[]
}

const BASIS_LABELS: Readonly<Record<string, string>> = {
  person: 'kişi başı',
  group: 'grup fiyatı',
  package: 'paket fiyatı',
}

/** Accepts a plain string or a locale map; Turkish first, then whatever is there. */
function pickText(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (!isObject(value)) return null
  const preferred = value.tr
  if (typeof preferred === 'string') return preferred
  const first = Object.values(value).find((inner) => typeof inner === 'string')
  return typeof first === 'string' ? first : null
}

function optionDetail(option: Json): string {
  const { price, currency, basis, quantity } = option
  const priceText =
    isNumber(price) && typeof currency === 'string' ? formatMoney(price, currency) : 'Fiyat yok'
  const basisText = typeof basis === 'string' && isNumber(price) && BASIS_LABELS[basis] ? ` (${BASIS_LABELS[basis]})` : ''
  const countText = isNumber(quantity) ? `${quantity} kişi · ` : ''
  return `${countText}${priceText}${basisText}`
}

export function describeSnapshot(snapshot: unknown): SnapshotView | null {
  if (!isObject(snapshot)) return null
  const rawOptions = snapshot.options ?? snapshot.chosenOptions ?? snapshot.chosen
  const options = (Array.isArray(rawOptions) ? rawOptions : []).filter(isObject).map((option, index) => {
    const id = typeof option.id === 'string' ? option.id : String(index + 1)
    return { id, name: pickText(option.name) ?? id, detail: optionDetail(option) }
  })
  return { title: pickText(snapshot.title), options }
}
