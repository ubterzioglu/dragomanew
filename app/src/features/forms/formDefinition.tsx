import { Fragment, useMemo, type ReactNode } from 'react'
import { pick } from '../../content/localize'
import { useLocale } from '../../i18n/LocaleContext'
import {
  coreFieldState,
  DEFAULT_FORM_DEFINITIONS,
  validateDefinition,
  type CoreKey,
  type FormDefinition,
  type FormField,
  type FormLabel,
} from '../../shared/requests/forms.ts'
import type { RequestKind } from '../../shared/requests/payload.ts'

/**
 * Editable forms on the site (dalga2-sozlesme §8): which fields a form shows, in which order and
 * with which labels. A page passes its form as `{ version, definition }` (the content repository's
 * `form(kind)`); without one, or with one that does not validate, the form is the built-in one.
 * Version 0 is the fixture's built-in form: it is never sent as `formVersion`.
 */

export interface SiteForm {
  version: number
  definition: FormDefinition
}

export interface ResolvedForm {
  definition: FormDefinition
  /** Sent with the request only for a published (release) version. */
  formVersion?: number
  /** Visible fields in display order. */
  fields: FormField[]
  /** Whether a core field is shown and required; fixed fields are always both. */
  core: (key: CoreKey) => { hidden: boolean; required: boolean }
  /** The definition's label for the page language, else the built-in UI string. */
  label: (key: string, fallback: string) => string
  /** The definition's help text for the page language, if any. */
  hint: (key: string) => string | undefined
}

export function useFormDefinition(kind: RequestKind, form: SiteForm | undefined): ResolvedForm {
  const locale = useLocale()
  return useMemo(() => {
    // A definition is checked again here: a broken one must never take a form off the page.
    const usable = form !== undefined && validateDefinition(kind, form.definition).length === 0
    const definition = usable ? form.definition : DEFAULT_FORM_DEFINITIONS[kind]
    const formVersion = usable && form.version > 0 ? form.version : undefined
    const byKey = new Map<string, FormField>(definition.fields.map((field) => [field.key, field]))
    const text = (value: FormLabel | undefined) => (value ? pick(value, locale).value : undefined)
    return {
      definition,
      formVersion,
      fields: definition.fields.filter((field) => !field.hidden),
      core: (key) => coreFieldState(kind, key, definition),
      label: (key, fallback) => text(byKey.get(key)?.label) ?? fallback,
      hint: (key) => text(byKey.get(key)?.help),
    }
  }, [kind, form, locale])
}

/** One field's place in a form: short fields share a two-column grid, wide ones take a row. */
export interface FieldItem {
  key: string
  node: ReactNode
  wide?: boolean
  /** Rendered once the field's row or grid has closed (the lodging child ages). */
  after?: ReactNode
}

/** Lays out fields in definition order, grouping consecutive short fields into one grid. */
export function FieldFlow({ items }: { items: readonly FieldItem[] }) {
  const blocks: ReactNode[] = []
  let grid: FieldItem[] = []
  const closeGrid = () => {
    const [first] = grid
    if (!first) return
    blocks.push(
      <div key={`grid-${first.key}`} className="grid gap-5 sm:grid-cols-2">
        {grid.map((item) => (
          <Fragment key={item.key}>{item.node}</Fragment>
        ))}
      </div>,
      ...grid.flatMap((item) => (item.after ? [<Fragment key={`after-${item.key}`}>{item.after}</Fragment>] : [])),
    )
    grid = []
  }
  for (const item of items) {
    if (!item.wide) {
      grid.push(item)
      continue
    }
    closeGrid()
    blocks.push(<Fragment key={item.key}>{item.node}</Fragment>)
    if (item.after) blocks.push(<Fragment key={`after-${item.key}`}>{item.after}</Fragment>)
  }
  closeGrid()
  return <>{blocks}</>
}
