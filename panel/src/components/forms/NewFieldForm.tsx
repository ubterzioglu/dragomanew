import { useId, useState, type FormEvent } from 'react'
import { CUSTOM_FIELD_TYPES, CUSTOM_LIMITS, type CustomFieldType } from '../../shared/requests/forms.ts'
import { CUSTOM_TYPE_LABELS, type NewCustomField } from '../../lib/forms/editor'
import { Button, fieldClass, labelClass } from '../ui'

interface NewFieldFormProps {
  /** Custom fields already on the form; at the limit the form is replaced by a note. */
  count: number
  onAdd: (field: NewCustomField) => void
}

const parseLimit = (text: string): number | undefined => (text.trim() === '' ? undefined : Number.parseInt(text, 10))

/** "Yeni alan": type, Turkish label, required, and options or limits where the type has them. */
export function NewFieldForm({ count, onAdd }: NewFieldFormProps) {
  const id = useId()
  const [type, setType] = useState<CustomFieldType>('text')
  const [label, setLabel] = useState('')
  const [required, setRequired] = useState(false)
  const [options, setOptions] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')

  if (count >= CUSTOM_LIMITS.fields) {
    return <p className="text-sm text-ink-muted">Bu formda {CUSTOM_LIMITS.fields} ek alan var; daha fazlası eklenemez.</p>
  }

  const optionList = options.split('\n').map((line) => line.trim()).filter(Boolean)
  const valid =
    label.trim() !== '' &&
    (type !== 'select' || (optionList.length >= CUSTOM_LIMITS.minOptions && optionList.length <= CUSTOM_LIMITS.maxOptions))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!valid) return
    onAdd({ type, label, required, options: optionList, min: parseLimit(min), max: parseLimit(max) })
    setLabel('')
    setRequired(false)
    setOptions('')
    setMin('')
    setMax('')
  }

  return (
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2" aria-label="Yeni alan">
      <div>
        <label htmlFor={`${id}-type`} className={labelClass}>
          Alan türü
        </label>
        <select id={`${id}-type`} className={fieldClass} value={type} onChange={(event) => setType(event.target.value as CustomFieldType)}>
          {CUSTOM_FIELD_TYPES.map((option) => (
            <option key={option} value={option}>
              {CUSTOM_TYPE_LABELS[option]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${id}-label`} className={labelClass}>
          Etiket (Türkçe)
        </label>
        <input id={`${id}-label`} className={fieldClass} value={label} maxLength={200} onChange={(event) => setLabel(event.target.value)} />
      </div>
      {type === 'select' && (
        <div className="md:col-span-2">
          <label htmlFor={`${id}-options`} className={labelClass}>
            Seçenekler (her satıra bir tane, {CUSTOM_LIMITS.minOptions}–{CUSTOM_LIMITS.maxOptions} adet)
          </label>
          <textarea id={`${id}-options`} rows={4} className={fieldClass} value={options} onChange={(event) => setOptions(event.target.value)} />
        </div>
      )}
      {type === 'number' && (
        <>
          <div>
            <label htmlFor={`${id}-min`} className={labelClass}>
              En az (isteğe bağlı)
            </label>
            <input id={`${id}-min`} type="number" step={1} className={fieldClass} value={min} onChange={(event) => setMin(event.target.value)} />
          </div>
          <div>
            <label htmlFor={`${id}-max`} className={labelClass}>
              En çok (isteğe bağlı)
            </label>
            <input id={`${id}-max`} type="number" step={1} className={fieldClass} value={max} onChange={(event) => setMax(event.target.value)} />
          </div>
        </>
      )}
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" className="size-4 accent-brand-green" checked={required} onChange={(event) => setRequired(event.target.checked)} />
        {type === 'checkbox' ? 'Zorunlu (işaretlenmeden gönderilemez)' : 'Zorunlu'}
      </label>
      <div className="md:col-span-2">
        <Button type="submit" disabled={!valid}>
          Alanı ekle
        </Button>
      </div>
    </form>
  )
}
