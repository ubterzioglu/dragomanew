import { useEffect, useState } from 'react'

export type Keyed<T> =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'ok'; value: T }
  | { status: 'error'; error: unknown }

export type Settled<T> = { key: string; ok: true; value: T } | { key: string; ok: false; error: unknown }

/** The latest answer for this key, whichever revision it came from; pending until there is one. */
export function keyedView<T>(key: string | null, settled: Settled<T> | null): Keyed<T> {
  if (key === null) return { status: 'idle' }
  if (!settled || settled.key !== key) return { status: 'pending' }
  return settled.ok ? { status: 'ok', value: settled.value } : { status: 'error', error: settled.error }
}

/**
 * Runs `run(key)` whenever the key or the revision changes (null key: do nothing). The result is
 * tied to its key, so an answer for an old key is never mistaken for the current one, while a new
 * revision of the same key re-runs without hiding the last answer. `run` must be stable.
 */
export function useKeyedPromise<T>(key: string | null, run: (key: string) => Promise<T>, revision = ''): Keyed<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null)

  useEffect(() => {
    if (key === null) return
    let alive = true
    run(key).then(
      (value) => alive && setSettled({ key, ok: true, value }),
      (error: unknown) => alive && setSettled({ key, ok: false, error }),
    )
    return () => {
      alive = false
    }
  }, [key, revision, run])

  return keyedView(key, settled)
}
