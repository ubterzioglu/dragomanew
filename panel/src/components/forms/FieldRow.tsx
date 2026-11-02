import { useId, useState } from 'react'
import type { FormField } from '../../shared/requests/forms.ts'
import type { RequestKind } from '../../shared/requests/payload.ts'
import {
  canHide,
  canRequire,
  CUSTOM_TYPE_LABELS,
  fieldTitle,
  FORM_LOCALES,
  isRequired,
  type FormLocale,
} from '../../lib/forms/editor'
import { Button, fieldClass, labelClass } from '../ui'

const LOCALE_NAMES: Readonly<Record<FormLocale, string>> = { tr: 'Türkçe', en: 'İngilizce', fr: 'Fransızca', de: 'Almanca' }

export interface FieldRowActions {
  move: (delta: -1 | 1) => void
  setHidden: (hidden: boolean) => void
  setRequired: (required: boolean) => void
  setText: (part: 'label' | 'help', locale: FormLocale, text: string) => void
  /** Only for custom fields never published. */
  remove?: () => void
}

interface FieldRowProps {
  kind: RequestKind
  field: FormField
  position: number
  count: number
  actions: FieldRowActions
}

function kindBadge(kind: RequestKind, field: FormField): string {
  if (field.kind === 'custom') return `Ek alan · ${CUSTOM_TYPE_LABELS[field.type]}`
  return canHide(kind, field) ? 'Temel alan · gizlenebilir' : 'Temel alan · kilitli'
}

/** One field of the form being edited: order, visibility, required, labels in four languages. */
export function FieldRow({ kind, field, position, count, actions }: FieldRowProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const title = fieldTitle(field)
  const hidden = field.hidden === true

  return (
    <li className={`rounded-card border p-4 ${hidden ? 'border-dashed border-line-strong bg-sand' : 'border-line bg-white'}`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {position + 1}. {title}
            {hidden && <span className="ml-2 text-sm font-normal text-ink-muted">(gizli)</span>}
          </p>
          <p className="text-xs text-ink-muted">
            {kindBadge(kind, field)} · <code>{field.key}</code>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => actions.move(-1)} disabled={position === 0} aria-label={`${title}: yukarı taşı`}>
            Yukarı
          </Button>
          <Button variant="secondary" onClick={() => actions.move(1)} disabled={position === count - 1} aria-label={`${title}: aşağı taşı`}>
            Aşağı
          </Button>
          {canHide(kind, field) && (
            <Button variant="secondary" onClick={() => actions.setHidden(!hidden)} aria-pressed={hidden}>
              {hidden ? 'Göster' : 'Gizle'}
            </Button>
          )}
          {canRequire(kind, field) && (
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 accent-brand-green"
                checked={isRequired(kind, field)}
                disabled={hidden}
                onChange={(event) => actions.setRequired(event.target.checked)}
              />
              Zorunlu
            </label>
          )}
          <Button variant="secondary" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={`${id}-texts`}>
            Metinler
          </Button>
          {actions.remove && (
            <Button variant="danger" onClick={actions.remove}>
              Kaldır
            </Button>
          )}
        </div>
      </div>
      {open && (
        <div id={`${id}-texts`} className="mt-4 grid gap-4 md:grid-cols-2">
          {(['label', 'help'] as const).map((part) => (
            <fieldset key={part} className="space-y-2">
              <legend className="text-sm font-semibold">{part === 'label' ? 'Etiket' : 'Yardım metni'}</legend>
              {FORM_LOCALES.map((locale) => (
                <div key={locale}>
                  <label htmlFor={`${id}-${part}-${locale}`} className={labelClass}>
                    {LOCALE_NAMES[locale]}
                  </label>
                  <input
                    id={`${id}-${part}-${locale}`}
                    className={fieldClass}
                    value={field[part]?.[locale] ?? ''}
                    placeholder={part === 'label' && locale === 'tr' && field.kind === 'core' ? title : undefined}
                    maxLength={part === 'label' ? 200 : 500}
                    onChange={(event) => actions.setText(part, locale, event.target.value)}
                  />
                </div>
              ))}
            </fieldset>
          ))}
          {field.kind === 'core' && (
            <p className="text-xs text-ink-muted md:col-span-2">
              Türkçe etiket boş kalırsa sitedeki hazır metin kullanılır. Hazır metnin çevirileri de sitededir.
            </p>
          )}
        </div>
      )}
    </li>
  )
}
