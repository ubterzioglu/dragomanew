/**
 * Wraps a loader for useKeyedPromise so a failed re-read falls back to the last answer for the same
 * key; only a key that never had an answer fails. Used for my_permissions(): a recheck that hits a
 * network blip must not take extra permissions away from a screen someone is working in.
 */
export function withLastAnswer<T>(load: () => Promise<T>): (key: string) => Promise<T> {
  const answers = new Map<string, T>()
  return async (key) => {
    try {
      const value = await load()
      answers.set(key, value)
      return value
    } catch (error) {
      if (answers.has(key)) return answers.get(key) as T
      throw error
    }
  }
}
