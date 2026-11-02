import type { FormDefinition } from '../requests/forms.ts'
import type { SiteLocale } from '../requests/payload.ts'
import type { Currency, RequestSummary } from '../requests/rules.ts'
import type { ContactValues, EventRequestValues, LodgingValues, TransportValues } from '../requests/schemas.ts'
import { escapeHtml, escapeMultiline, oneLine } from './escape.ts'
import { BUSINESS_STRINGS, MAIL_STRINGS, type MailStrings } from './strings.ts'

/**
 * Plain-text and HTML bodies for the two request mails. Only whitelisted, validated fields
 * are shown, so nothing else (health data above all) can ever reach a mail; every value is
 * escaped in the HTML part. The customer receipt shows even less: see receiptRows.
 */

/** The parts of an event snapshot a mail shows. */
export interface MailEvent {
  title: string
  options: ReadonlyArray<{ name: string; quantity: number }>
}

interface MailBase {
  reference: string
  locale: SiteLocale
  event: MailEvent | null
  summary: RequestSummary | null
  /** The form version the request was checked against; its custom answers go into the business mail. */
  form?: FormDefinition
}

export type MailRequest = MailBase &
  (
    | { kind: 'event'; values: EventRequestValues }
    | { kind: 'transport'; values: TransportValues }
    | { kind: 'lodging'; values: LodgingValues }
    | { kind: 'contact'; values: ContactValues }
  )

export interface MailContent {
  subject: string
  text: string
  html: string
}

type Row = readonly [label: string, value: string]

const LOCALE_TAGS: Readonly<Record<SiteLocale, string>> = { tr: 'tr-TR', en: 'en-GB', fr: 'fr-FR', de: 'de-DE' }

function formatMoney(amount: number, currency: Currency, locale: SiteLocale): string {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], { style: 'currency', currency }).format(amount)
}

const filled = (rows: readonly Row[]): Row[] => rows.filter(([, value]) => value.trim() !== '')
const list = (numbers: readonly number[]): string => numbers.join(', ')

function detailRows(request: MailRequest, s: MailStrings): Row[] {
  const l = s.labels
  switch (request.kind) {
    case 'event': {
      const v = request.values
      const options = (request.event?.options ?? []).map((option) => `${option.quantity} × ${option.name}`).join(', ')
      return filled([
        [l.event, request.event?.title ?? ''],
        [l.preferredDate, v.preferredDate],
        [l.partySize, String(v.partySize)],
        [l.options, options],
        [l.message, v.message ?? ''],
      ])
    }
    case 'transport': {
      const v = request.values
      return filled([
        [l.tripType, v.tripType === 'roundTrip' ? l.roundTrip : l.oneWay],
        [l.from, v.from],
        [l.to, v.to],
        [l.dateTime, v.dateTime],
        [l.returnDateTime, v.tripType === 'roundTrip' ? (v.returnDateTime ?? '') : ''],
        [l.partySize, String(v.partySize)],
        [l.childSeat, v.childSeat ? l.yes : l.no],
        [l.childSeatAges, v.childSeat ? list(v.childSeatAges) : ''],
        [l.note, v.note ?? ''],
      ])
    }
    case 'lodging': {
      const v = request.values
      return filled([
        [l.checkIn, v.checkIn],
        [l.checkOut, v.checkOut],
        [l.adults, String(v.adults)],
        [l.children, String(v.children)],
        [l.childAges, list(v.childAges)],
        [l.rooms, String(v.rooms)],
        [l.preferences, v.preferences ?? ''],
      ])
    }
    case 'contact':
      return filled([
        [l.subject, request.values.subject ?? ''],
        [l.message, request.values.message],
      ])
  }
}

/**
 * Custom answers (dalga2-sozlesme §8) with the definition's Turkish labels, in display order.
 * Only fields the definition shows are listed: schemas.ts already dropped the rest.
 */
export function customAnswerRows(form: FormDefinition | undefined, answers: unknown, s: MailStrings): Row[] {
  if (!form || typeof answers !== 'object' || answers === null) return []
  const values = answers as Readonly<Record<string, unknown>>
  return form.fields.flatMap((field): Row[] => {
    if (field.kind !== 'custom' || field.hidden) return []
    const value = values[field.key]
    if (value === undefined || value === null || value === '') return []
    if (typeof value === 'boolean') return [[field.label.tr, value ? s.labels.yes : s.labels.no]]
    const option = field.type === 'select' ? field.options?.find((candidate) => candidate.value === value) : undefined
    return [[field.label.tr, option ? option.label.tr : String(value)]]
  })
}

/** What `<input type="date">` and `datetime-local` send; anything else is free text. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/
const isoOnly = (value: string | undefined): string => (value && ISO_DATE.test(value) ? value : '')

/**
 * The customer receipt goes to an address nobody has verified, so it carries no text the
 * visitor typed (name, message, places, notes): otherwise anyone could make Dragoman's own
 * mailbox deliver their words to a third party. Only database values, numbers, enums and
 * well-formed dates appear; the business mail keeps the full text.
 */
function receiptRows(request: MailRequest, s: MailStrings): Row[] {
  const l = s.labels
  switch (request.kind) {
    case 'event': {
      const v = request.values
      const options = (request.event?.options ?? []).map((option) => `${option.quantity} × ${option.name}`).join(', ')
      return filled([
        [l.event, request.event?.title ?? ''],
        [l.preferredDate, isoOnly(v.preferredDate)],
        [l.partySize, String(v.partySize)],
        [l.options, options],
      ])
    }
    case 'transport': {
      const v = request.values
      return filled([
        [l.tripType, v.tripType === 'roundTrip' ? l.roundTrip : l.oneWay],
        [l.dateTime, isoOnly(v.dateTime)],
        [l.returnDateTime, v.tripType === 'roundTrip' ? isoOnly(v.returnDateTime) : ''],
        [l.partySize, String(v.partySize)],
        [l.childSeat, v.childSeat ? l.yes : l.no],
        [l.childSeatAges, v.childSeat ? list(v.childSeatAges) : ''],
      ])
    }
    case 'lodging': {
      const v = request.values
      return filled([
        [l.checkIn, isoOnly(v.checkIn)],
        [l.checkOut, isoOnly(v.checkOut)],
        [l.adults, String(v.adults)],
        [l.children, String(v.children)],
        [l.childAges, list(v.childAges)],
        [l.rooms, String(v.rooms)],
      ])
    }
    case 'contact':
      return []
  }
}

/** Event requests always say something about price; the total is labelled as an estimate. */
function priceLine(request: MailRequest, s: MailStrings, locale: SiteLocale): string | null {
  if (!request.summary) return null
  if (request.summary.kind !== 'total') return s.priceLater
  return s.estimate(formatMoney(request.summary.total, request.summary.currency, locale))
}

function textBody(paragraphs: ReadonlyArray<string | null>, rows: readonly Row[]): string {
  const [head = '', ...tail] = paragraphs.filter((p): p is string => p !== null)
  const table = rows.map(([label, value]) => `${label}: ${value}`).join('\n')
  return [head, table, ...tail].filter((block) => block !== '').join('\n\n') + '\n'
}

function htmlBody(locale: SiteLocale, subject: string, intro: readonly string[], rows: readonly Row[], outro: readonly string[]): string {
  const paragraph = (html: string) => `<p style="margin:0 0 12px">${html}</p>`
  const row = ([label, value]: Row) =>
    `<tr><th align="left" valign="top" style="padding:4px 12px 4px 0;font-weight:600">${escapeHtml(label)}</th>` +
    `<td style="padding:4px 0">${escapeMultiline(value)}</td></tr>`
  return [
    `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>`,
    '<body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#17302e;background:#ffffff">',
    ...intro,
    `<table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 16px">${rows.map(row).join('')}</table>`,
    ...outro.map(paragraph),
    '</body></html>',
  ].join('\n')
}

/** "Talebiniz alındı — DRG-000123" in the visitor's language. */
export function customerReceipt(request: MailRequest): MailContent {
  const s = MAIL_STRINGS[request.locale]
  const subject = oneLine(s.receiptSubject(request.reference))
  const rows: Row[] = [[s.labels.reference, request.reference], [s.labels.requestType, s.kinds[request.kind]], ...receiptRows(request, s)]
  const price = priceLine(request, s, request.locale)
  const greeting = s.greeting

  const text = textBody([`${greeting}\n\n${s.intro}`, price, s.notConfirmed, s.signOff], rows)
  const intro = [greeting, s.intro].map((p) => `<p style="margin:0 0 12px">${escapeHtml(p)}</p>`)
  const outro = [...(price ? [escapeHtml(price)] : []), `<strong>${escapeHtml(s.notConfirmed)}</strong>`, escapeHtml(s.signOff)]
  return { subject, text, html: htmlBody(request.locale, subject, intro, rows, outro) }
}

/** The Turkish notice to the business, with the visitor's contact details and a panel link. */
export function businessNotice(request: MailRequest, panelUrl: string | null): MailContent {
  const s = MAIL_STRINGS.tr
  const kind = s.kinds[request.kind]
  const subject = oneLine(BUSINESS_STRINGS.subject(request.reference, kind))
  const { fullName, email, phone } = request.values
  const rows: Row[] = filled([
    [s.labels.reference, request.reference],
    [s.labels.requestType, kind],
    [BUSINESS_STRINGS.language, request.locale.toUpperCase()],
    [s.labels.fullName, fullName],
    [s.labels.email, email],
    [s.labels.phone, phone ?? ''],
    ...detailRows(request, s),
    ...customAnswerRows(request.form, request.values.custom, s),
  ])
  const price = priceLine(request, s, 'tr')
  const link = panelUrl ? `${BUSINESS_STRINGS.openPanel}: ${panelUrl}` : null

  const text = textBody([BUSINESS_STRINGS.intro, price, link], rows)
  const intro = [`<p style="margin:0 0 12px">${escapeHtml(BUSINESS_STRINGS.intro)}</p>`]
  const outro = [
    ...(price ? [escapeHtml(price)] : []),
    ...(panelUrl ? [`<a href="${escapeHtml(panelUrl)}">${escapeHtml(BUSINESS_STRINGS.openPanel)}</a>`] : []),
  ]
  return { subject, text, html: htmlBody('tr', subject, intro, rows, outro) }
}
