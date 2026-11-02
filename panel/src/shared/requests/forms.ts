import { z } from 'zod'
import type { RequestKind } from './payload.ts'

/**
 * Editable request forms (dalga2-sozlesme §8). A definition lists the fields in display order:
 * every core field of the kind exactly once, plus up to ten custom ones. Published versions are
 * immutable and each request keeps its version. Shared byte for byte with the functions and the
 * panel (scripts/sync-shared.mjs), so this file imports nothing but zod and sibling files.
 */

/** Turkish is required; the panel or DeepL fills the rest. */
const label = (max: number) =>
  z.object({ tr: z.string().trim().min(1).max(max), en: z.string().max(max).optional(), fr: z.string().max(max).optional(), de: z.string().max(max).optional() })

export const formLabelSchema = label(200)
export const formHelpSchema = label(500)
export type FormLabel = z.infer<typeof formLabelSchema>

/** Core keys per form, as the site's forms and schemas.ts name them. Sub-fields (return time, ages) follow their parent. */
export const CORE_KEYS = [
  'preferredDate',
  'partySize',
  'distribution',
  'fullName',
  'email',
  'phone',
  'message',
  'tripType',
  'from',
  'to',
  'dateTime',
  'childSeat',
  'note',
  'checkIn',
  'checkOut',
  'adults',
  'children',
  'rooms',
  'preferences',
  'subject',
] as const
export type CoreKey = (typeof CORE_KEYS)[number]

/** `fixed` fields change only label, help and position; `free` ones may also be hidden or made required/optional. */
export type CoreMode = 'fixed' | 'free'

export interface CoreFieldSpec {
  key: CoreKey
  mode: CoreMode
  /** Whether the built-in form requires it; a free field's definition may override this. */
  required: boolean
}

const fixed = (key: CoreKey): CoreFieldSpec => ({ key, mode: 'fixed', required: true })
const free = (key: CoreKey, required = false): CoreFieldSpec => ({ key, mode: 'free', required })

/** Each form's core fields in today's display order (§8 table). */
export const CORE_FIELDS: Readonly<Record<RequestKind, readonly CoreFieldSpec[]>> = {
  event: [fixed('fullName'), fixed('email'), fixed('preferredDate'), fixed('partySize'), fixed('distribution'), free('phone'), free('message')],
  transport: [
    fixed('tripType'),
    fixed('from'),
    fixed('to'),
    fixed('dateTime'),
    fixed('partySize'),
    free('childSeat'),
    fixed('fullName'),
    fixed('email'),
    free('phone'),
    free('note'),
  ],
  lodging: [fixed('checkIn'), fixed('checkOut'), fixed('adults'), fixed('children'), fixed('rooms'), fixed('fullName'), fixed('email'), free('phone'), free('preferences')],
  contact: [fixed('fullName'), fixed('email'), free('phone'), free('subject'), fixed('message')],
}

export const CUSTOM_FIELD_TYPES = ['text', 'textarea', 'number', 'select', 'checkbox', 'date'] as const
export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number]

/** Custom answer limits (§8). */
export const CUSTOM_LIMITS = { fields: 10, text: 200, textarea: 2000, minOptions: 2, maxOptions: 20 } as const

const optionValue = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase-hyphen slug').max(60)

const coreFieldSchema = z.object({
  kind: z.literal('core'),
  key: z.enum(CORE_KEYS),
  hidden: z.boolean().optional(),
  required: z.boolean().optional(),
  label: formLabelSchema.optional(),
  help: formHelpSchema.optional(),
})

const customFieldSchema = z.object({
  kind: z.literal('custom'),
  key: z.string().regex(/^c_[a-z0-9_]{1,40}$/, 'c_ key') as z.ZodType<`c_${string}`>,
  type: z.enum(CUSTOM_FIELD_TYPES),
  required: z.boolean(),
  hidden: z.boolean().optional(),
  label: formLabelSchema,
  help: formHelpSchema.optional(),
  options: z.array(z.object({ value: optionValue, label: formLabelSchema })).optional(),
  min: z.number().int().optional(),
  max: z.number().int().optional(),
})

export const formFieldSchema = z.discriminatedUnion('kind', [coreFieldSchema, customFieldSchema])
export const formDefinitionSchema = z.object({ format: z.literal(1), fields: z.array(formFieldSchema) })

export type CoreFormField = z.infer<typeof coreFieldSchema>
export type CustomFormField = z.infer<typeof customFieldSchema>
export type FormField = z.infer<typeof formFieldSchema>
export type FormDefinition = z.infer<typeof formDefinitionSchema>

/** Today's forms: core fields only, in today's order, with the built-in labels. */
export const DEFAULT_FORM_DEFINITIONS: Readonly<Record<RequestKind, FormDefinition>> = {
  event: { format: 1, fields: CORE_FIELDS.event.map(({ key }) => ({ kind: 'core', key })) },
  transport: { format: 1, fields: CORE_FIELDS.transport.map(({ key }) => ({ kind: 'core', key })) },
  lodging: { format: 1, fields: CORE_FIELDS.lodging.map(({ key }) => ({ kind: 'core', key })) },
  contact: { format: 1, fields: CORE_FIELDS.contact.map(({ key }) => ({ kind: 'core', key })) },
}

export type DefinitionIssueCode =
  | 'schema'
  | 'unknown_core'
  | 'missing_core'
  | 'duplicate_key'
  | 'fixed_changed'
  | 'too_many_custom'
  | 'bad_options'
  | 'bad_range'
  | 'published_key_removed'
  | 'published_type_changed'

export interface DefinitionIssue {
  code: DefinitionIssueCode
  /** Field key, when the issue belongs to one field. */
  key?: string
  message: string
}

function customIssues(field: CustomFormField): DefinitionIssue[] {
  const issues: DefinitionIssue[] = []
  const options = field.options ?? []
  if (field.type === 'select') {
    const unique = new Set(options.map((option) => option.value)).size === options.length
    if (options.length < CUSTOM_LIMITS.minOptions || options.length > CUSTOM_LIMITS.maxOptions || !unique) {
      issues.push({ code: 'bad_options', key: field.key, message: `select needs ${CUSTOM_LIMITS.minOptions}–${CUSTOM_LIMITS.maxOptions} distinct options` })
    }
  } else if (options.length > 0) {
    issues.push({ code: 'bad_options', key: field.key, message: 'only select fields have options' })
  }
  const hasRange = field.min !== undefined || field.max !== undefined
  if (field.type !== 'number' && hasRange) issues.push({ code: 'bad_range', key: field.key, message: 'only number fields have min/max' })
  if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
    issues.push({ code: 'bad_range', key: field.key, message: 'min is above max' })
  }
  return issues
}

/**
 * Checks a definition for `kind`: each core key exactly once, fixed fields only relabelled or
 * moved, unique keys, the custom limits. With `published` (the latest published version) its
 * custom keys must stay, with the same type; removing a published field means hiding it.
 */
export function validateDefinition(kind: RequestKind, definition: unknown, published?: FormDefinition): DefinitionIssue[] {
  const parsed = formDefinitionSchema.safeParse(definition)
  if (!parsed.success) {
    return parsed.error.issues.map((issue) => ({ code: 'schema', message: `${issue.path.join('.') || '(root)'}: ${issue.message}` }))
  }
  const { fields } = parsed.data
  const specs = new Map(CORE_FIELDS[kind].map((spec) => [spec.key, spec]))
  const issues: DefinitionIssue[] = []

  const keys = fields.map((field) => field.key)
  for (const key of new Set(keys)) {
    if (keys.filter((other) => other === key).length > 1) issues.push({ code: 'duplicate_key', key, message: 'key used more than once' })
  }
  for (const field of fields) {
    if (field.kind === 'custom') {
      issues.push(...customIssues(field))
      continue
    }
    const spec = specs.get(field.key)
    if (!spec) issues.push({ code: 'unknown_core', key: field.key, message: `not a ${kind} form field` })
    else if (spec.mode === 'fixed' && (field.hidden !== undefined || field.required !== undefined)) {
      issues.push({ code: 'fixed_changed', key: field.key, message: 'a fixed field can only be relabelled or moved' })
    }
  }
  for (const key of specs.keys()) {
    if (!keys.includes(key)) issues.push({ code: 'missing_core', key, message: 'core field missing' })
  }
  const customCount = fields.filter((field) => field.kind === 'custom').length
  if (customCount > CUSTOM_LIMITS.fields) issues.push({ code: 'too_many_custom', message: `at most ${CUSTOM_LIMITS.fields} custom fields` })

  for (const old of published?.fields ?? []) {
    if (old.kind !== 'custom') continue
    const now = fields.find((field) => field.key === old.key)
    if (!now) issues.push({ code: 'published_key_removed', key: old.key, message: 'a published field can be hidden, not removed' })
    else if (now.kind !== 'custom' || now.type !== old.type) issues.push({ code: 'published_type_changed', key: old.key, message: 'a published field keeps its type' })
  }
  return issues
}

/** Whether a core field is shown and required under `definition` (absent definition = built-in form). */
export function coreFieldState(kind: RequestKind, key: CoreKey, definition?: FormDefinition): { hidden: boolean; required: boolean } {
  const spec = CORE_FIELDS[kind].find((candidate) => candidate.key === key)
  const field = definition?.fields.find((candidate) => candidate.kind === 'core' && candidate.key === key)
  if (!spec || spec.mode === 'fixed' || !field || field.kind !== 'core') return { hidden: false, required: spec?.required ?? false }
  return { hidden: field.hidden ?? false, required: !(field.hidden ?? false) && (field.required ?? spec.required) }
}

/** Messages for custom answers; schemas.ts FormMessages fits. */
export interface CustomFieldMessages {
  required: string
  tooLong: (max: number) => string
  /** Out of range, not an option, not a date. Defaults to `required`. */
  invalid?: string
}

function customValueSchema(field: CustomFormField, m: CustomFieldMessages): z.ZodType {
  const invalid = m.invalid ?? m.required
  switch (field.type) {
    case 'text':
    case 'textarea': {
      const max = CUSTOM_LIMITS[field.type]
      const value = z.string().trim().max(max, m.tooLong(max))
      return field.required ? value.min(1, m.required) : value.optional()
    }
    case 'number': {
      let value = z.number({ error: field.required ? m.required : invalid }).int(invalid)
      if (field.min !== undefined) value = value.min(field.min, invalid)
      if (field.max !== undefined) value = value.max(field.max, invalid)
      return field.required ? value : value.optional()
    }
    case 'select': {
      const values = (field.options ?? []).map((option) => option.value)
      const value = z.string().refine((choice) => values.includes(choice), invalid)
      return field.required ? value : value.optional()
    }
    case 'checkbox':
      // Required means ticked.
      return field.required ? z.literal(true, { error: m.required }) : z.boolean().optional()
    case 'date': {
      const value = z.iso.date({ error: field.required ? m.required : invalid })
      return field.required ? value : value.optional()
    }
  }
}

/** Schema of `payload.custom` under `definition`: visible custom fields only, so hidden answers are dropped. */
export function customValuesSchema(definition: FormDefinition, m: CustomFieldMessages) {
  const shape: Record<string, z.ZodType> = {}
  for (const field of definition.fields) {
    if (field.kind === 'custom' && !field.hidden) shape[field.key] = customValueSchema(field, m)
  }
  return z.object(shape)
}
