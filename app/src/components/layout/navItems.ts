import type { PageKey } from '../../i18n/pages'
import type { UiStrings } from '../../i18n/ui'

type NavLabelKey = keyof UiStrings['nav']

export interface NavItem {
  page: PageKey
  label: NavLabelKey
  children?: readonly NavItem[]
}

/** Main row: the five accepted categories (V6 §4.1). Lifeguard sits under Diving (§4.5). */
export const CATEGORY_NAV: readonly NavItem[] = [
  {
    page: 'diving',
    label: 'diving',
    children: [
      { page: 'diving', label: 'allDiving' },
      { page: 'lifeguard', label: 'lifeguard' },
      { page: 'diveSites', label: 'diveSites' },
    ],
  },
  { page: 'seaKayak', label: 'seaKayak' },
  { page: 'outdoor', label: 'outdoor' },
  { page: 'transport', label: 'transport' },
  { page: 'shop', label: 'shop' },
]

/** Thin utility row: About, Blog, Contact (language switcher sits beside it). */
export const UTILITY_NAV: readonly NavItem[] = [
  { page: 'about', label: 'about' },
  { page: 'blog', label: 'blog' },
  { page: 'contact', label: 'contact' },
]
