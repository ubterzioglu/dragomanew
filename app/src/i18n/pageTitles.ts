import type { PageKey } from './pages'
import type { UiStrings } from './ui'

/** Human title for a fixed page in the current language. */
export function pageTitle(ui: UiStrings, key: PageKey): string {
  switch (key) {
    case 'home':
      return ui.titles.home
    case 'diving':
    case 'seaKayak':
    case 'outdoor':
    case 'transport':
    case 'shop':
    case 'about':
    case 'contact':
    case 'blog':
    case 'diveSites':
    case 'lifeguard':
      return ui.nav[key]
    case 'privacy':
      return ui.titles.privacy
    case 'terms':
      return ui.titles.terms
    case 'participantForm':
      return ui.titles.participantForm
    case 'product':
      return ui.titles.product
  }
}
