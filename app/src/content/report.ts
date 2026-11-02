import type { FullContentData } from './staticRepository'
import type { Origin, TranslationSource } from './schema'

/**
 * Source/sample report for the Stage A hand-over (plan §3.3 item 3, §8.5 item 2):
 * where each record came from, which translations are missing, alt-text and
 * rights status of every image, and prices that still need Dragoman's
 * confirmation. The hand-over table is generated from this, never typed by hand.
 */

type TargetLocale = 'en' | 'fr' | 'de'
const TARGET_LOCALES: readonly TargetLocale[] = ['en', 'fr', 'de']
const LOCALE_KEYS = new Set(['tr', 'en', 'fr', 'de'])

export type MissingCounts = Record<TargetLocale, number>

export interface RecordRow {
  kind: 'home' | 'category' | 'event' | 'service' | 'product' | 'post' | 'page' | 'team'
  id: string
  title: string
  status: string
  origin: Origin
  translationOrigin: Partial<Record<TargetLocale, TranslationSource>>
  missing: MissingCounts
  sourceRefs: number
}

export interface PriceRow {
  kind: 'event' | 'product'
  id: string
  prices: string
  origin: Origin
}

export interface MediaRow {
  id: string
  topic: string
  sourceFile: string
  rights: string
  placeholder: boolean
  missingAlt: TargetLocale[]
}

export interface ContentReport {
  records: RecordRow[]
  prices: PriceRow[]
  media: MediaRow[]
  testimonials: number
  totals: { byOrigin: Record<Origin, number>; missing: MissingCounts }
}

function isLocalized(value: object): value is Record<string, unknown> & { tr: unknown } {
  const keys = Object.keys(value)
  return keys.includes('tr') && keys.every((key) => LOCALE_KEYS.has(key))
}

/** Localized fields ({ tr, en?, fr?, de? }) anywhere in a record that lack each target language. */
export function missingTranslations(value: unknown): MissingCounts {
  const counts: MissingCounts = { en: 0, fr: 0, de: 0 }
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) return node.forEach(visit)
    if (node === null || typeof node !== 'object') return
    if (isLocalized(node)) {
      for (const locale of TARGET_LOCALES) if (node[locale] === undefined) counts[locale] += 1
      return
    }
    Object.values(node).forEach(visit)
  }
  visit(value)
  return counts
}

interface Provenanced {
  origin: Origin
  translationOrigin: Partial<Record<TargetLocale, TranslationSource>>
  sourceRefs: string[]
}

function row(kind: RecordRow['kind'], id: string, title: string, status: string, record: Provenanced): RecordRow {
  return {
    kind,
    id,
    title,
    status,
    origin: record.origin,
    translationOrigin: record.translationOrigin,
    missing: missingTranslations(record),
    sourceRefs: record.sourceRefs.length,
  }
}

const BASIS_LABEL: Record<string, string> = { person: 'kişi başı', group: 'grup', package: 'paket' }

function money(price: number | null, currency: string, basis?: string): string {
  if (price === null) return 'fiyat yok'
  return `${price} ${currency}${basis ? ` / ${BASIS_LABEL[basis] ?? basis}` : ''}`
}

export function buildContentReport(data: FullContentData): ContentReport {
  const records: RecordRow[] = [
    row('home', 'home', 'Ana sayfa', 'published', data.home),
    ...data.categoryPages.map((page) => row('category', page.key, page.key, 'published', page)),
    ...data.events.map((event) => row('event', event.id, event.title.tr, event.status, event)),
    ...data.serviceOffers.map((offer) => row('service', offer.id, offer.title.tr, 'published', offer)),
    ...data.products.map((product) => row('product', product.id, product.title.tr, product.status, product)),
    ...data.posts.map((post) => row('post', post.id, post.title.tr, post.status, post)),
    ...data.richPages.map((page) => row('page', page.key, page.title.tr, 'published', page)),
    ...data.team.map((member) => row('team', member.id, member.name, 'published', member)),
  ]

  const prices: PriceRow[] = [
    ...data.events
      .filter((event) => event.priceDisplay === 'numeric')
      .map((event) => ({
        kind: 'event' as const,
        id: event.id,
        prices: event.options.map((option) => `${option.name.tr}: ${money(option.price, option.currency, option.basis)}`).join('; '),
        origin: event.origin,
      })),
    ...data.products.map((product) => ({
      kind: 'product' as const,
      id: product.id,
      prices: money(product.price, product.currency),
      origin: product.origin,
    })),
  ]

  const media: MediaRow[] = data.media.map((asset) => {
    const missing = missingTranslations({ alt: asset.alt })
    return {
      id: asset.id,
      topic: asset.topic,
      sourceFile: asset.sourceFile,
      rights: asset.rights,
      placeholder: asset.placeholder,
      missingAlt: TARGET_LOCALES.filter((locale) => missing[locale] > 0),
    }
  })

  const byOrigin: Record<Origin, number> = { cloner: 0, 'kayak-site': 0, mockup: 0, panel: 0 }
  const missing: MissingCounts = { en: 0, fr: 0, de: 0 }
  for (const record of records) {
    byOrigin[record.origin] += 1
    for (const locale of TARGET_LOCALES) missing[locale] += record.missing[locale]
  }

  return { records, prices, media, testimonials: data.testimonials.length, totals: { byOrigin, missing } }
}

const ORIGIN_LABEL: Record<TranslationSource, string> = {
  cloner: 'eski site (cloner)',
  'kayak-site': 'dragomanseakayak.com',
  mockup: 'örnek (mockup)',
  panel: 'panel',
  deepl: 'DeepL',
  manual: 'elle düzeltildi',
}

const KIND_LABEL: Record<RecordRow['kind'], string> = {
  home: 'ana sayfa',
  category: 'kategori',
  event: 'etkinlik',
  service: 'hizmet',
  product: 'kitap',
  post: 'yazı',
  page: 'sayfa',
  team: 'ekip',
}

const cell = (value: string): string => value.replaceAll('|', '\\|').replaceAll('\n', ' ')

function table(header: string[], rows: string[][]): string[] {
  return [
    `| ${header.join(' | ')} |`,
    `|${header.map(() => '---').join('|')}|`,
    ...rows.map((cells) => `| ${cells.map(cell).join(' | ')} |`),
  ]
}

function translationCell(record: RecordRow): string {
  return TARGET_LOCALES.map((locale) => {
    const origin = record.translationOrigin[locale]
    const gap = record.missing[locale] > 0 ? ` (${record.missing[locale]} eksik)` : ''
    return `${locale.toUpperCase()}: ${origin ? ORIGIN_LABEL[origin] : 'yok'}${gap}`
  }).join('<br>')
}

export function renderContentReport(report: ContentReport, generatedOn: string): string {
  const { totals } = report
  const placeholders = report.media.filter((asset) => asset.placeholder)
  const missingAlt = report.media.filter((asset) => asset.missingAlt.length > 0)
  return [
    '# Kaynak / örnek ayrımı',
    '',
    `> Bu dosya \`npm run content-report\` ile üretilir (${generatedOn}); elle düzenlenmez. Kaynak: \`app/src/content/data/\`.`,
    '',
    '## Özet',
    '',
    ...table(
      ['Kaynak', 'Kayıt'],
      (Object.keys(totals.byOrigin) as Origin[]).map((origin) => [ORIGIN_LABEL[origin], String(totals.byOrigin[origin])]),
    ),
    '',
    `- Toplam kayıt: ${report.records.length} (ayrıca ${report.testimonials} örnek yorum; hepsi "Örnek" etiketli, gerçek kişi değil).`,
    `- Eksik çeviri alanı: EN ${totals.missing.en}, FR ${totals.missing.fr}, DE ${totals.missing.de}. Eksik alan sitede Türkçeye düşer ve \`data-i18n-fallback\` ile işaretlenir.`,
    '- Almanca metinlerin tamamı örnek çeviridir (kaynakta Almanca yok; DeepL çağrılmadı).',
    `- Görseller: ${report.media.length}; kullanım hakkı Dragoman teyidi bekliyor (hepsi \`unverified\`); yer tutucu: ${placeholders.length}; alt metni eksik: ${missingAlt.length}.`,
    `- Fiyatlar: ${report.prices.length} kayıt kaynaktan alındı, hiçbiri Dragoman tarafından güncel diye teyit edilmedi.`,
    '',
    '## Kayıtlar',
    '',
    ...table(
      ['Tür', 'Kimlik', 'Başlık (TR)', 'Durum', 'Kaynak', 'Çeviriler', 'Kaynak atfı (adet)'],
      report.records.map((record) => [
        KIND_LABEL[record.kind],
        record.id,
        record.title,
        record.status,
        ORIGIN_LABEL[record.origin],
        translationCell(record),
        String(record.sourceRefs),
      ]),
    ),
    '',
    '## Doğrulanmamış fiyatlar',
    '',
    ...table(
      ['Tür', 'Kimlik', 'Fiyat', 'Kaynak'],
      report.prices.map((price) => [KIND_LABEL[price.kind], price.id, price.prices, ORIGIN_LABEL[price.origin]]),
    ),
    '',
    '## Görseller: alt metin ve hak durumu',
    '',
    ...table(
      ['Kimlik', 'Konu', 'Kaynak dosya', 'Hak', 'Yer tutucu', 'Eksik alt metin'],
      report.media.map((asset) => [
        asset.id,
        asset.topic,
        asset.sourceFile,
        asset.rights,
        asset.placeholder ? 'evet' : '',
        asset.missingAlt.join(', ').toUpperCase(),
      ]),
    ),
    '',
  ].join('\n')
}
