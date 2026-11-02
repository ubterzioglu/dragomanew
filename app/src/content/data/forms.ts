import { DEFAULT_FORM_DEFINITIONS } from '../../shared/requests/forms.ts'
import { REQUEST_KINDS, type RequestKind } from '../../shared/requests/payload.ts'
import type { FormRelease } from '../staticRepository'

/** The fixture's forms: version 0, today's definitions (dalga2-sozlesme §7). Build time only. */
export const DEFAULT_FORMS: Readonly<Record<RequestKind, FormRelease>> = Object.fromEntries(
  REQUEST_KINDS.map((kind) => [kind, { version: 0, definition: DEFAULT_FORM_DEFINITIONS[kind] }]),
) as Record<RequestKind, FormRelease>
