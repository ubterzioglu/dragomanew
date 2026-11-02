import type { z } from 'zod'
import {
  categoryPageSchema,
  eventSchema,
  homeContentSchema,
  postSchema,
  productSchema,
  richPageSchema,
  serviceOfferSchema,
  subgroupSchema,
  teamMemberSchema,
  type ContentType,
} from '../../shared/content/schema.ts'

/**
 * What the one-column editor shows for each entry type (dalga2-sozlesme §9). The editor renders
 * these descriptors; the zod schema of the type stays the single judge of what may be saved and
 * published, and its issues are labelled through the same descriptors.
 */

export type FieldKind =
  /** Localized one-line text. */
  | 'text'
  /** Localized multi-line text. */
  | 'textarea'
  /** Localized list of short lines (one per line). */
  | 'list'
  /** Localized body blocks (p / h2 / h3 / ul, never HTML). */
  | 'blocks'
  /** Not translated: a name or an id. */
  | 'plain'
  | 'media'
  | 'gallery'
  | 'select'
  | 'number'
  | 'boolean'
  | 'date'
  /** Per-language URL slugs. */
  | 'slug'
  /** A nested object (SEO, hero). */
  | 'object'
  /** A list of objects: options table, FAQ, itinerary, sections, home tiles… */
  | 'items'
  /** Ids of other entries (related events). */
  | 'references'

export type FieldGroup = 'main' | 'details' | 'seo'

export interface SelectOption {
  value: string
  label: string
}

export interface FieldConfig {
  key: string
  label: string
  kind: FieldKind
  group?: FieldGroup
  /** May be left empty; empty values are dropped before validation. */
  optional?: boolean
  /** number/select: empty means null (price unknown, no health form). */
  nullable?: boolean
  help?: string
  options?: readonly SelectOption[]
  /** select filled at run time (subgroups of the chosen category). */
  dynamicOptions?: 'subgroups'
  /** references: which entry type the ids point at. */
  referenceType?: ContentType
  /** object / items children. */
  fields?: readonly FieldConfig[]
  /** items: the name of one row. */
  itemLabel?: string
  /** items: the schema fixes the count, so rows cannot be added or removed. */
  fixedLength?: boolean
  /** items: a new empty row. */
  newItem?: () => unknown
}

export const LOCALIZED_KINDS: ReadonlySet<FieldKind> = new Set(['text', 'textarea', 'list', 'blocks'])

export const EDITOR_LOCALES = ['tr', 'en', 'fr', 'de'] as const
export type EditorLocale = (typeof EDITOR_LOCALES)[number]

const CATEGORY_OPTIONS: readonly SelectOption[] = [
  { value: 'diving', label: 'Dalış' },
  { value: 'seaKayak', label: 'Deniz kanosu' },
  { value: 'outdoor', label: 'Doğa' },
]

const CURRENCY: FieldConfig = {
  key: 'currency',
  label: 'Para birimi',
  kind: 'select',
  options: [
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'TRY', label: 'Türk lirası (TRY)' },
  ],
}

const SEO: FieldConfig = {
  key: 'seo',
  label: 'SEO',
  kind: 'object',
  group: 'seo',
  optional: true,
  help: 'Boş bırakılırsa başlık, özet ve kapak fotoğrafı kullanılır.',
  fields: [
    { key: 'title', label: 'Arama başlığı (en fazla 120 karakter)', kind: 'text', optional: true },
    { key: 'description', label: 'Arama açıklaması (en fazla 320 karakter)', kind: 'textarea', optional: true },
    { key: 'ogImage', label: 'Paylaşım görseli', kind: 'media', optional: true },
  ],
}

const emptyText = () => ({ tr: '' })

const FAQ: FieldConfig = {
  key: 'faq',
  label: 'Sık sorulan sorular',
  kind: 'items',
  group: 'details',
  itemLabel: 'Soru',
  newItem: () => ({ question: emptyText(), answer: emptyText() }),
  fields: [
    { key: 'question', label: 'Soru', kind: 'text' },
    { key: 'answer', label: 'Yanıt', kind: 'textarea' },
  ],
}

const ITINERARY: FieldConfig = {
  key: 'itinerary',
  label: 'Program',
  kind: 'items',
  group: 'details',
  itemLabel: 'Gün',
  newItem: () => ({ title: emptyText(), description: emptyText() }),
  fields: [
    { key: 'title', label: 'Başlık', kind: 'text' },
    { key: 'description', label: 'Açıklama', kind: 'textarea' },
  ],
}

const OPTIONS: FieldConfig = {
  key: 'options',
  label: 'Seçenekler ve fiyatlar',
  kind: 'items',
  group: 'details',
  itemLabel: 'Seçenek',
  help: 'Tek seçenek düz fiyat demektir. Fiyatı bilinmeyen seçeneğin fiyatını boş bırakın (sıfır yazmayın).',
  newItem: () => ({ id: '', name: emptyText(), price: null, currency: 'EUR', basis: 'person' }),
  fields: [
    { key: 'id', label: 'Kısa ad (ör. tek-dalis)', kind: 'plain' },
    { key: 'name', label: 'Ad', kind: 'text' },
    { key: 'description', label: 'Açıklama', kind: 'text', optional: true },
    { key: 'price', label: 'Fiyat', kind: 'number', nullable: true },
    CURRENCY,
    {
      key: 'basis',
      label: 'Fiyat türü',
      kind: 'select',
      options: [
        { value: 'person', label: 'Kişi başı' },
        { value: 'group', label: 'Grup' },
        { value: 'package', label: 'Paket' },
      ],
    },
  ],
}

const EVENT: readonly FieldConfig[] = [
  { key: 'title', label: 'Başlık', kind: 'text' },
  { key: 'summary', label: 'Özet', kind: 'textarea' },
  { key: 'body', label: 'Metin', kind: 'blocks' },
  { key: 'cover', label: 'Kapak fotoğrafı', kind: 'media' },
  { key: 'gallery', label: 'Fotoğraflar', kind: 'gallery' },
  { key: 'category', label: 'Kategori', kind: 'select', group: 'details', options: CATEGORY_OPTIONS },
  { key: 'subgroup', label: 'Alt grup', kind: 'select', group: 'details', dynamicOptions: 'subgroups' },
  { key: 'slug', label: 'Adres (kısa ad)', kind: 'slug', group: 'details' },
  {
    key: 'priceDisplay',
    label: 'Fiyat gösterimi',
    kind: 'select',
    group: 'details',
    options: [
      { value: 'numeric', label: 'Fiyat göster' },
      { value: 'on_request', label: 'Fiyat talep üzerine' },
    ],
  },
  OPTIONS,
  { key: 'duration', label: 'Süre', kind: 'text', group: 'details', optional: true },
  {
    key: 'healthForm',
    label: 'Sağlık formu',
    kind: 'select',
    group: 'details',
    nullable: true,
    options: [
      { value: 'diving', label: 'Dalış sağlık formu' },
      { value: 'outdoor', label: 'Doğa etkinliği sağlık formu' },
    ],
  },
  { key: 'meetingPoint', label: 'Buluşma noktası', kind: 'text', group: 'details', optional: true },
  { key: 'includes', label: 'Dahil olanlar', kind: 'list', group: 'details', optional: true },
  { key: 'excludes', label: 'Hariç olanlar', kind: 'list', group: 'details', optional: true },
  { key: 'conditions', label: 'Koşullar', kind: 'list', group: 'details', optional: true },
  ITINERARY,
  FAQ,
  { key: 'featured', label: 'Ana sayfada öne çıkar', kind: 'boolean', group: 'details' },
  SEO,
]

const SUBGROUP: readonly FieldConfig[] = [
  { key: 'title', label: 'Başlık', kind: 'text' },
  { key: 'intro', label: 'Giriş', kind: 'textarea', optional: true },
  { key: 'category', label: 'Kategori', kind: 'select', options: CATEGORY_OPTIONS },
]

const CATEGORY_PAGE: readonly FieldConfig[] = [
  { key: 'intro', label: 'Giriş metni', kind: 'blocks' },
  { key: 'cover', label: 'Kapak fotoğrafı', kind: 'media' },
  SEO,
]

const SERVICE_OFFER: readonly FieldConfig[] = [
  { key: 'title', label: 'Başlık', kind: 'text' },
  { key: 'summary', label: 'Özet', kind: 'textarea' },
  { key: 'cover', label: 'Kapak fotoğrafı', kind: 'media' },
  {
    key: 'kind',
    label: 'Tür',
    kind: 'select',
    options: [
      { value: 'transfer', label: 'Ulaşım' },
      { value: 'lodging', label: 'Konaklama' },
    ],
  },
]

const PRODUCT: readonly FieldConfig[] = [
  { key: 'title', label: 'Başlık', kind: 'text' },
  { key: 'edition', label: 'Baskı (ör. İngilizce baskı)', kind: 'text' },
  { key: 'summary', label: 'Özet', kind: 'textarea' },
  { key: 'body', label: 'Metin', kind: 'blocks' },
  { key: 'cover', label: 'Kapak fotoğrafı', kind: 'media' },
  { key: 'gallery', label: 'Fotoğraflar', kind: 'gallery' },
  { key: 'slug', label: 'Adres (kısa ad)', kind: 'slug', group: 'details' },
  { key: 'price', label: 'Fiyat', kind: 'number', group: 'details', nullable: true },
  { ...CURRENCY, group: 'details' },
  { key: 'priceVerified', label: 'Fiyat güncel (teyit edildi)', kind: 'boolean', group: 'details' },
  { key: 'stockNote', label: 'Stok notu', kind: 'text', group: 'details', optional: true },
  { key: 'deliveryNote', label: 'Teslimat notu', kind: 'text', group: 'details', optional: true },
  SEO,
]

const POST: readonly FieldConfig[] = [
  { key: 'title', label: 'Başlık', kind: 'text' },
  { key: 'excerpt', label: 'Özet', kind: 'textarea' },
  { key: 'body', label: 'Metin', kind: 'blocks' },
  { key: 'cover', label: 'Kapak fotoğrafı', kind: 'media', optional: true },
  { key: 'slug', label: 'Adres (kısa ad)', kind: 'slug', group: 'details' },
  { key: 'date', label: 'Yayın tarihi', kind: 'date', group: 'details' },
  { key: 'updated', label: 'Son güncelleme tarihi', kind: 'date', group: 'details', optional: true },
  { key: 'relatedEvents', label: 'İlgili etkinlikler', kind: 'references', group: 'details', referenceType: 'event' },
  SEO,
]

const TEAM_MEMBER: readonly FieldConfig[] = [
  { key: 'name', label: 'Ad soyad', kind: 'plain' },
  { key: 'role', label: 'Görevi', kind: 'text' },
  { key: 'bio', label: 'Kısa tanıtım', kind: 'textarea', optional: true },
  { key: 'photo', label: 'Fotoğraf', kind: 'media', optional: true },
]

const RICH_PAGE: readonly FieldConfig[] = [
  { key: 'title', label: 'Başlık', kind: 'text' },
  { key: 'summary', label: 'Özet', kind: 'textarea' },
  {
    key: 'sections',
    label: 'Bölümler',
    kind: 'items',
    itemLabel: 'Bölüm',
    newItem: () => ({ body: { tr: [{ type: 'p', text: '' }] } }),
    fields: [
      { key: 'heading', label: 'Bölüm başlığı', kind: 'text', optional: true },
      { key: 'body', label: 'Metin', kind: 'blocks' },
    ],
  },
  { key: 'cover', label: 'Kapak fotoğrafı', kind: 'media', optional: true },
  SEO,
]

const HOME: readonly FieldConfig[] = [
  {
    key: 'hero',
    label: 'Açılış',
    kind: 'object',
    fields: [
      { key: 'heading', label: 'Başlık', kind: 'text' },
      { key: 'subheading', label: 'Alt başlık', kind: 'textarea' },
      {
        key: 'tiles',
        label: 'Kategori kutuları',
        kind: 'items',
        itemLabel: 'Kutu',
        fixedLength: true,
        fields: [
          { key: 'category', label: 'Kategori', kind: 'select', options: CATEGORY_OPTIONS },
          { key: 'media', label: 'Fotoğraf', kind: 'media' },
          { key: 'tagline', label: 'Kısa metin', kind: 'text' },
        ],
      },
    ],
  },
  {
    key: 'quickLinks',
    label: 'Hızlı bağlantılar',
    kind: 'items',
    itemLabel: 'Bağlantı',
    fixedLength: true,
    fields: [
      {
        key: 'page',
        label: 'Sayfa',
        kind: 'select',
        options: [
          { value: 'transport', label: 'Ulaşım ve konaklama' },
          { value: 'shop', label: 'Kitaplar' },
        ],
      },
      { key: 'media', label: 'Fotoğraf', kind: 'media' },
      { key: 'text', label: 'Metin', kind: 'text' },
    ],
  },
  {
    key: 'featured',
    label: 'Öne çıkanlar',
    kind: 'items',
    itemLabel: 'Kayıt',
    newItem: () => ({ kind: 'event', id: '' }),
    fields: [
      {
        key: 'kind',
        label: 'Tür',
        kind: 'select',
        options: [
          { value: 'event', label: 'Etkinlik' },
          { value: 'post', label: 'Blog yazısı' },
        ],
      },
      { key: 'id', label: 'Kısa ad', kind: 'plain' },
    ],
  },
  {
    key: 'why',
    label: 'Neden Dragoman',
    kind: 'items',
    itemLabel: 'Madde',
    newItem: () => ({ title: emptyText(), text: emptyText() }),
    fields: [
      { key: 'title', label: 'Başlık', kind: 'text' },
      { key: 'text', label: 'Metin', kind: 'textarea' },
    ],
  },
  SEO,
]

/** Entry types the panel edits. Testimonials stay sample-only (§4) and are not editable. */
export type EditableType = Exclude<ContentType, 'testimonial'>

export interface TypeConfig {
  /** List tab name. */
  tab: string
  /** One entry, for headings ("Yeni etkinlik"). */
  singular: string
  schema: z.ZodType
  fields: readonly FieldConfig[]
  /** Staff may add entries (the page sets are fixed). */
  creatable: boolean
  /** Where the TR title lives, for the list and the new key. */
  titleKey: string
}

export const TYPE_CONFIG: Readonly<Record<EditableType, TypeConfig>> = {
  event: { tab: 'Etkinlikler', singular: 'etkinlik', schema: eventSchema, fields: EVENT, creatable: true, titleKey: 'title' },
  subgroup: { tab: 'Alt gruplar', singular: 'alt grup', schema: subgroupSchema, fields: SUBGROUP, creatable: true, titleKey: 'title' },
  post: { tab: 'Blog', singular: 'blog yazısı', schema: postSchema, fields: POST, creatable: true, titleKey: 'title' },
  product: { tab: 'Kitaplar', singular: 'kitap', schema: productSchema, fields: PRODUCT, creatable: true, titleKey: 'title' },
  rich_page: { tab: 'Sayfalar', singular: 'sayfa', schema: richPageSchema, fields: RICH_PAGE, creatable: false, titleKey: 'title' },
  category_page: {
    tab: 'Kategoriler',
    singular: 'kategori sayfası',
    schema: categoryPageSchema,
    fields: CATEGORY_PAGE,
    creatable: false,
    titleKey: 'key',
  },
  service_offer: {
    tab: 'Ulaşım/Konaklama',
    singular: 'hizmet',
    schema: serviceOfferSchema,
    fields: SERVICE_OFFER,
    creatable: true,
    titleKey: 'title',
  },
  team_member: { tab: 'Ekip', singular: 'ekip üyesi', schema: teamMemberSchema, fields: TEAM_MEMBER, creatable: true, titleKey: 'name' },
  home: { tab: 'Ana sayfa', singular: 'ana sayfa', schema: homeContentSchema, fields: HOME, creatable: false, titleKey: 'hero' },
}

/** List tab order (§9). */
export const EDITABLE_TYPES: readonly EditableType[] = [
  'event',
  'subgroup',
  'post',
  'product',
  'rich_page',
  'category_page',
  'service_offer',
  'team_member',
  'home',
]

export const isEditableType = (value: unknown): value is EditableType =>
  typeof value === 'string' && (EDITABLE_TYPES as readonly string[]).includes(value)

/** Per-group heading in the editor; `main` is always open, the others are folded. */
export const GROUP_LABELS: Readonly<Record<FieldGroup, string>> = {
  main: 'İçerik',
  details: 'Ayrıntılar',
  seo: 'SEO (her dil için)',
}
