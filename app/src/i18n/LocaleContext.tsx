import { createContext, useContext, type ReactNode } from 'react'
import { SOURCE_LOCALE, type Locale } from './locales'
import { getUi, type UiStrings } from './ui'

const LocaleContext = createContext<Locale>(SOURCE_LOCALE)

interface LocaleProviderProps {
  locale: Locale
  children: ReactNode
}

// Locale comes from the matched route, never from global state, so pages
// rendered concurrently during SSG cannot pick up another page's language.
export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

export function useUi(): UiStrings {
  return getUi(useLocale())
}
