import type { ReactNode } from 'react'
import { getIn, isRecord, pointer, type DocPath } from '../../lib/content/docPath'
import { LOCALIZED_KINDS, type EditorLocale, type FieldConfig } from '../../lib/content/editorConfig'
import { STATE_BADGES, type StateByPointer } from '../../lib/content/translationView'
import { fieldClass, labelClass } from '../ui'
import { BlocksInput, BlocksPreview } from './BlocksInput'

/**
 * Renders one descriptor of lib/content/editorConfig. In the TR tab every field is editable; in
 * EN/FR/DE only localized values (and slugs) are, each beside its read-only Turkish source and a
 * translation badge.
 */

export interface PickOption {
  id: string
  label: string
}

export interface EditorContext {
  media: readonly PickOption[]
  subgroups: readonly (PickOption & { category: string })[]
  events: readonly PickOption[]
}

export interface FieldEditorProps {
  field: FieldConfig
  path: DocPath
  doc: unknown
  locale: EditorLocale
  states: StateByPointer
  issues: ReadonlyMap<string, readonly string[]>
  context: EditorContext
  onChange: (path: DocPath, value: unknown) => void
}

const fieldId = (locale: string, path: DocPath): string => `alan-${locale}${pointer(path).replace(/[^a-zA-Z0-9]+/g, '-')}`
const smallButton = 'rounded border border-line-strong bg-white px-2 py-1 text-xs font-semibold disabled:opacity-50'

/** Translatable somewhere inside (decides what an EN/FR/DE tab shows). */
export function hasLocalized(field: FieldConfig): boolean {
  return LOCALIZED_KINDS.has(field.kind) || field.kind === 'slug' || (field.fields ?? []).some(hasLocalized)
}

/** Issues at this pointer or below it (a leaf shows its locale's problems too). */
function issuesBelow(issues: ReadonlyMap<string, readonly string[]>, at: string): string[] {
  return [...issues.entries()].flatMap(([path, messages]) => (path === at || path.startsWith(`${at}/`) ? messages : []))
}

function FieldShell({
  id,
  label,
  help,
  errors,
  badge,
  children,
}: {
  id: string
  label: string
  help?: string
  errors: readonly string[]
  badge?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className={labelClass}>
        {label}
        {badge && (
          <span className="ml-2 rounded bg-brand-orange-soft px-2 py-0.5 text-xs font-semibold text-brand-orange-ink">{badge}</span>
        )}
      </label>
      {help && <p className="text-xs text-ink-muted">{help}</p>}
      {children}
      {errors.length > 0 && (
        <ul id={`${id}-hata`} className="text-xs text-red-800">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SourceBox({ field, value }: { field: FieldConfig; value: unknown }) {
  return (
    <div className="rounded-md border border-dashed border-line-strong bg-[#f6f5f1] px-3 py-2 text-sm text-ink-muted">
      <p className="mb-1 text-xs font-semibold uppercase">Türkçe kaynak</p>
      {field.kind === 'blocks' ? (
        <BlocksPreview value={value} />
      ) : Array.isArray(value) ? (
        <ul className="list-disc pl-5">
          {value.map((line, index) => (
            <li key={index}>{String(line)}</li>
          ))}
        </ul>
      ) : (
        <p className="whitespace-pre-wrap">{typeof value === 'string' && value !== '' ? value : '(boş)'}</p>
      )}
    </div>
  )
}

function LocalizedInput({ field, path, doc, locale, states, issues, onChange }: FieldEditorProps) {
  const at = pointer(path)
  const id = fieldId(locale, path)
  const container = getIn(doc, path)
  const value = isRecord(container) ? container[locale] : undefined
  const errors = issuesBelow(issues, locale === 'tr' ? at : `${at}/${locale}`)
  const state = locale === 'tr' ? undefined : states.get(at)?.[locale]
  const badge = state && state !== 'ok' ? STATE_BADGES[state] : undefined
  const invalid = errors.length > 0
  const describedBy = invalid ? `${id}-hata` : undefined
  const set = (next: unknown) => onChange([...path, locale], next)

  let input: ReactNode
  if (field.kind === 'blocks') {
    input = <BlocksInput id={id} value={value} onChange={set} invalid={invalid} describedBy={describedBy} />
  } else if (field.kind === 'list') {
    input = (
      <textarea
        id={id}
        className={`${fieldClass} min-h-24`}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        value={Array.isArray(value) ? value.join('\n') : ''}
        onChange={(event) => set(event.target.value.split('\n'))}
      />
    )
  } else if (field.kind === 'textarea') {
    input = (
      <textarea
        id={id}
        className={`${fieldClass} min-h-24`}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => set(event.target.value)}
      />
    )
  } else {
    input = (
      <input
        id={id}
        className={fieldClass}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => set(event.target.value)}
      />
    )
  }

  const help = field.kind === 'list' ? 'Her satır bir madde.' : field.help
  return (
    <FieldShell id={id} label={`${field.label}${locale === 'tr' ? '' : ` (${locale.toUpperCase()})`}`} help={help} errors={errors} badge={badge}>
      {locale !== 'tr' && <SourceBox field={field} value={isRecord(container) ? container.tr : undefined} />}
      {input}
    </FieldShell>
  )
}

/** Gallery and references: an ordered pick list. */
function PickList({ id, value, options, onChange }: { id: string; value: unknown; options: readonly PickOption[]; onChange: (next: string[]) => void }) {
  const picked = Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  const labelOf = (key: string) => options.find((option) => option.id === key)?.label ?? key
  const move = (index: number, direction: -1 | 1) => {
    const a = picked[index]
    const b = picked[index + direction]
    if (a === undefined || b === undefined) return
    onChange(picked.map((item, i) => (i === index ? b : i === index + direction ? a : item)))
  }
  return (
    <div className="space-y-2">
      {picked.length > 0 && (
        <ol className="space-y-1">
          {picked.map((key, index) => (
            <li key={`${key}-${index}`} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="min-w-48 flex-1">
                {index + 1}. {labelOf(key)}
              </span>
              <button type="button" className={smallButton} disabled={index === 0} onClick={() => move(index, -1)}>
                Yukarı
              </button>
              <button type="button" className={smallButton} disabled={index === picked.length - 1} onClick={() => move(index, 1)}>
                Aşağı
              </button>
              <button type="button" className={smallButton} onClick={() => onChange(picked.filter((_, i) => i !== index))}>
                Çıkar
              </button>
            </li>
          ))}
        </ol>
      )}
      <select
        id={id}
        className={fieldClass}
        value=""
        onChange={(event) => event.target.value && onChange([...picked, event.target.value])}
      >
        <option value="">Ekle…</option>
        {options
          .filter((option) => !picked.includes(option.id))
          .map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
      </select>
    </div>
  )
}

function ScalarInput({ field, path, doc, issues, context, onChange }: FieldEditorProps) {
  const at = pointer(path)
  const id = fieldId('tr', path)
  const value = getIn(doc, path)
  const errors = issuesBelow(issues, at)
  const invalid = errors.length > 0
  const describedBy = invalid ? `${id}-hata` : undefined
  const set = (next: unknown) => onChange(path, next)
  const common = { id, 'aria-invalid': invalid, 'aria-describedby': describedBy }

  let input: ReactNode
  switch (field.kind) {
    case 'boolean':
      return (
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" {...common} checked={value === true} onChange={(event) => set(event.target.checked)} />
            {field.label}
          </label>
          {errors.length > 0 && <p className="text-xs text-red-800">{errors.join(' ')}</p>}
        </div>
      )
    case 'number':
      input = (
        <input
          {...common}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          className={`${fieldClass} max-w-48`}
          value={typeof value === 'number' ? value : ''}
          onChange={(event) => set(event.target.value === '' ? (field.nullable ? null : undefined) : Number(event.target.value))}
        />
      )
      break
    case 'date':
      input = (
        <input
          {...common}
          type="date"
          className={`${fieldClass} max-w-56`}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => set(event.target.value)}
        />
      )
      break
    case 'select': {
      const category = getIn(doc, [...path.slice(0, -1), 'category'])
      const options =
        field.dynamicOptions === 'subgroups'
          ? context.subgroups.filter((item) => item.category === category).map((item) => ({ value: item.id, label: item.label }))
          : (field.options ?? [])
      input = (
        <select {...common} className={fieldClass} value={typeof value === 'string' ? value : ''} onChange={(event) => set(event.target.value)}>
          <option value="">{field.nullable ? 'Yok' : 'Seçin…'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
      break
    }
    case 'media':
      input = (
        <select {...common} className={fieldClass} value={typeof value === 'string' ? value : ''} onChange={(event) => set(event.target.value)}>
          <option value="">{field.optional ? 'Yok' : 'Fotoğraf seçin…'}</option>
          {context.media.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      )
      break
    case 'gallery':
      input = <PickList id={id} value={value} options={context.media} onChange={set} />
      break
    case 'references':
      input = <PickList id={id} value={value} options={context.events} onChange={set} />
      break
    default:
      input = (
        <input {...common} className={fieldClass} value={typeof value === 'string' ? value : ''} onChange={(event) => set(event.target.value)} />
      )
  }
  return (
    <FieldShell id={id} label={field.label} help={field.help} errors={errors}>
      {input}
    </FieldShell>
  )
}

function SlugInput({ field, path, doc, locale, issues, onChange }: FieldEditorProps) {
  const at = `${pointer(path)}/${locale}`
  const id = fieldId(locale, path)
  const value = getIn(doc, [...path, locale])
  const errors = issuesBelow(issues, at)
  return (
    <FieldShell id={id} label={`${field.label} (${locale.toUpperCase()})`} help="Yalnız küçük harf, rakam ve tire. Yayındaki adres değişirse eski adres yeni adrese yönlenir." errors={errors}>
      <input
        id={id}
        className={fieldClass}
        aria-invalid={errors.length > 0}
        aria-describedby={errors.length > 0 ? `${id}-hata` : undefined}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange([...path, locale], event.target.value)}
      />
    </FieldShell>
  )
}

function ItemsInput(props: FieldEditorProps) {
  const { field, path, doc, locale, issues, onChange } = props
  const list = getIn(doc, path)
  const items = Array.isArray(list) ? list : []
  const own = issues.get(pointer(path)) ?? []
  const editable = locale === 'tr' && !field.fixedLength
  const move = (index: number, direction: -1 | 1) => {
    const a = items[index]
    const b = items[index + direction]
    if (a === undefined || b === undefined) return
    onChange(path, items.map((item, i) => (i === index ? b : i === index + direction ? a : item)))
  }
  const children = (field.fields ?? []).filter((child) => locale === 'tr' || hasLocalized(child))

  return (
    <fieldset className="space-y-3 rounded-md border border-line p-3">
      <legend className="px-1 text-sm font-semibold">{field.label}</legend>
      {field.help && locale === 'tr' && <p className="text-xs text-ink-muted">{field.help}</p>}
      {own.length > 0 && <p className="text-xs text-red-800">{own.join(' ')}</p>}
      {items.length === 0 && <p className="text-sm text-ink-muted">Henüz yok.</p>}
      {items.map((_, index) => (
        <div key={index} className="space-y-3 rounded-md bg-[#f6f5f1] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">
              {index + 1}. {field.itemLabel ?? 'Öğe'}
            </p>
            {locale === 'tr' && (
              <>
                <button type="button" className={smallButton} disabled={index === 0} onClick={() => move(index, -1)}>
                  Yukarı
                </button>
                <button type="button" className={smallButton} disabled={index === items.length - 1} onClick={() => move(index, 1)}>
                  Aşağı
                </button>
              </>
            )}
            {editable && (
              <button type="button" className={smallButton} onClick={() => onChange(path, items.filter((__, i) => i !== index))}>
                Sil
              </button>
            )}
          </div>
          {children.map((child) => (
            <FieldEditor key={child.key} {...props} field={child} path={[...path, index, child.key]} />
          ))}
        </div>
      ))}
      {editable && field.newItem && (
        <button type="button" className={smallButton} onClick={() => onChange(path, [...items, field.newItem?.()])}>
          + {field.itemLabel ?? 'Öğe'} ekle
        </button>
      )}
    </fieldset>
  )
}

export function FieldEditor(props: FieldEditorProps) {
  const { field, locale } = props
  if (locale !== 'tr' && !hasLocalized(field)) return null
  if (LOCALIZED_KINDS.has(field.kind)) return <LocalizedInput {...props} />
  if (field.kind === 'slug') return <SlugInput {...props} />
  if (field.kind === 'items') return <ItemsInput {...props} />
  if (field.kind === 'object') {
    const children = (field.fields ?? []).filter((child) => locale === 'tr' || hasLocalized(child))
    return (
      <fieldset className="space-y-4 rounded-md border border-line p-3">
        <legend className="px-1 text-sm font-semibold">{field.label}</legend>
        {field.help && <p className="text-xs text-ink-muted">{field.help}</p>}
        {children.map((child) => (
          <FieldEditor key={child.key} {...props} field={child} path={[...props.path, child.key]} />
        ))}
      </fieldset>
    )
  }
  return <ScalarInput {...props} />
}
