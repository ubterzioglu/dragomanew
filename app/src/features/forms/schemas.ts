import { formatTemplate, type UiStrings } from '../../i18n/ui'
import * as shared from '../../shared/requests/schemas.ts'

/**
 * The request forms' validation with messages in the page language. The rules live in
 * src/shared/requests/schemas.ts, which the submit-request function re-runs on the server.
 */

export { MAX_CHILDREN } from '../../shared/requests/schemas.ts'
export type {
  ContactValues,
  EventRequestValues,
  LodgingValues,
  TransportValues,
} from '../../shared/requests/schemas.ts'

/** The page's localized error strings in the shape the shared builders take. */
export function formMessages(ui: UiStrings): shared.FormMessages {
  const errors = ui.forms.errors
  return {
    required: errors.required,
    email: errors.email,
    positiveInt: errors.positiveInt,
    nonNegativeInt: errors.nonNegativeInt,
    childAge: errors.childAge,
    childSeatAges: errors.childSeatAges,
    checkOutAfterCheckIn: errors.checkOutAfterCheckIn,
    distributionSum: (count) => formatTemplate(errors.distributionSum, { count }),
    tooManyChildren: (max) => formatTemplate(errors.tooManyChildren, { max }),
    tooLong: (max) => formatTemplate(errors.tooLong, { max }),
  }
}

export function eventRequestSchema(ui: UiStrings, options: readonly { id: string }[]) {
  return shared.eventRequestSchema(formMessages(ui), options)
}

export function transportSchema(ui: UiStrings) {
  return shared.transportSchema(formMessages(ui))
}

export function lodgingSchema(ui: UiStrings) {
  return shared.lodgingSchema(formMessages(ui))
}

export function contactSchema(ui: UiStrings) {
  return shared.contactSchema(formMessages(ui))
}
