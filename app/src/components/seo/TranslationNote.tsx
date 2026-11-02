import { Info } from 'lucide-react'
import type { Locale } from '../../i18n/locales'
import { useLocale, useUi } from '../../i18n/LocaleContext'

/**
 * Visible note on a page whose title, summary or body falls back to Turkish (dalga2-sozlesme §7, Q2).
 * PageHead makes the same page noindex; check-dist recognises it by data-translation-fallback.
 */
export function TranslationNote({ untranslated, className = '' }: { untranslated: readonly Locale[]; className?: string }) {
  const locale = useLocale()
  const ui = useUi()
  if (!untranslated.includes(locale)) return null
  return (
    <p role="note" data-translation-fallback="" className={`flex gap-3 rounded-card border border-brand-orange bg-brand-orange-soft p-4 text-brand-orange-ink ${className}`}>
      <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <span>{ui.seo.translationFallback}</span>
    </p>
  )
}
