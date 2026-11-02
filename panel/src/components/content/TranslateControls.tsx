import { useState } from 'react'
import { translate, type TranslateRequest } from '../../data/content/entries'
import { contentErrorMessage } from '../../lib/content/messages'
import { estimateTranslation, MODE_LABELS, type TranslateMode } from '../../lib/content/translationView'
import { TARGET_LOCALES, type TargetLocale, type TranslationMeta } from '../../shared/content/translation.ts'
import { Dialog } from '../Dialog'
import { Button, Notice } from '../ui'

interface TranslateControlsProps {
  /** The saved document (DeepL works on what is stored, never on unsaved edits). */
  doc: unknown
  meta: TranslationMeta
  revision: number
  target: TranslateRequest['target']
  /** Unsaved edits block translating. */
  dirty: boolean
  onDone: (message: string) => void
}

const LOCALE_NAMES: Readonly<Record<TargetLocale, string>> = { en: 'İngilizce', fr: 'Fransızca', de: 'Almanca' }
const MODES = Object.keys(MODE_LABELS) as TranslateMode[]

/**
 * "DeepL ile çevir" (§9): languages, eksik / güncellenmeli / tümü, a character estimate, and a
 * question before any manual fix would be overwritten. DeepL writes only into the draft.
 */
export function TranslateControls({ doc, meta, revision, target, dirty, onDone }: TranslateControlsProps) {
  const [locales, setLocales] = useState<readonly TargetLocale[]>(TARGET_LOCALES)
  const [mode, setMode] = useState<TranslateMode>('missing')
  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const estimate = estimateTranslation(doc, meta, locales, mode, false)
  const toggle = (locale: TargetLocale) =>
    setLocales((current) => (current.includes(locale) ? current.filter((item) => item !== locale) : TARGET_LOCALES.filter((item) => item === locale || current.includes(item))))

  const run = async (includeManual: boolean) => {
    setAsking(false)
    setBusy(true)
    setError(null)
    try {
      const result = await translate({ target, expectedRevision: revision, locales, mode, includeManual })
      const kept = result.skippedManual > 0 ? `, ${result.skippedManual} elle düzeltme korundu` : ''
      onDone(`${result.translated} metin çevrildi (${result.sourceChars.toLocaleString('tr-TR')} karakter)${kept}. Kontrol edip yayınlayın.`)
    } catch (translateError) {
      setError(contentErrorMessage(translateError))
    } finally {
      setBusy(false)
    }
  }

  const start = () => (estimate.manualCount > 0 ? setAsking(true) : void run(false))
  const withManual = estimateTranslation(doc, meta, locales, mode, true)

  return (
    <div className="space-y-3">
      <fieldset className="flex flex-wrap gap-4">
        <legend className="mb-1 text-sm font-medium">Diller</legend>
        {TARGET_LOCALES.map((locale) => (
          <label key={locale} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={locales.includes(locale)} onChange={() => toggle(locale)} />
            {LOCALE_NAMES[locale]}
          </label>
        ))}
      </fieldset>
      <fieldset className="flex flex-wrap gap-4">
        <legend className="mb-1 text-sm font-medium">Neler çevrilsin</legend>
        {MODES.map((item) => (
          <label key={item} className="flex items-center gap-2 text-sm">
            <input type="radio" name={`mod-${target.id}`} checked={mode === item} onChange={() => setMode(item)} />
            {MODE_LABELS[item]}
          </label>
        ))}
      </fieldset>
      <p className="text-sm" aria-live="polite">
        {estimate.count === 0 && estimate.manualCount === 0
          ? 'Bu seçimle çevrilecek metin yok.'
          : `${estimate.count} metin, yaklaşık ${estimate.chars.toLocaleString('tr-TR')} karakter DeepL kotasından düşer.`}
        {estimate.manualCount > 0 && ` ${estimate.manualCount} elle düzeltilmiş çeviri var.`}
      </p>
      {dirty && <Notice tone="info">Çevirmeden önce değişiklikleri kaydedin.</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      <Button
        variant="secondary"
        onClick={start}
        disabled={busy || dirty || locales.length === 0 || (estimate.count === 0 && estimate.manualCount === 0)}
      >
        {busy ? 'Çevriliyor…' : 'DeepL ile çevir'}
      </Button>

      <Dialog open={asking} title="Elle düzeltilmiş çeviriler" onClose={() => setAsking(false)}>
        <p className="mb-4 text-sm">
          Bu seçimde {estimate.manualCount} çeviri elle düzeltilmiş. Bunların da üzerine DeepL çevirisi yazılsın mı? Üzerine
          yazılırsa toplam yaklaşık {withManual.chars.toLocaleString('tr-TR')} karakter kullanılır.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void run(false)} disabled={estimate.count === 0}>
            Elle düzeltilenleri koru
          </Button>
          <Button variant="danger" onClick={() => void run(true)}>
            Üzerine yaz
          </Button>
          <Button variant="secondary" onClick={() => setAsking(false)}>
            Vazgeç
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
