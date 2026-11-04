import type { AnswerEntry } from '../../data/questions'

/**
 * Loaded entries with the ones saved on this screen, grouped by question: a changed entry replaces
 * its loaded copy in place, a new one goes after the loaded ones (in the order it was saved).
 */
export function mergeEntries(
  loaded: readonly AnswerEntry[],
  savedHere: ReadonlyMap<string, AnswerEntry>,
): Map<string, AnswerEntry[]> {
  const loadedIds = new Set(loaded.map((entry) => entry.id))
  const all = [
    ...loaded.map((entry) => savedHere.get(entry.id) ?? entry),
    ...[...savedHere.values()].filter((entry) => !loadedIds.has(entry.id)),
  ]
  const byQuestion = new Map<string, AnswerEntry[]>()
  for (const entry of all) byQuestion.set(entry.question_id, [...(byQuestion.get(entry.question_id) ?? []), entry])
  return byQuestion
}
