// Types for the pure part of check-events-drift.mjs, so tests import it under strict TypeScript.
export interface EventRow {
  id: string
  status: string
}

export interface OptionRow {
  eventId: string
  optionId: string
}

export interface EventsSnapshot {
  events: readonly EventRow[]
  options: readonly OptionRow[]
}

/** One line per difference; empty when content and database agree. */
export function eventsDrift(content: EventsSnapshot, db: EventsSnapshot): string[]
