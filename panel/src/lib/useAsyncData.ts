import { useCallback, useEffect, useState } from 'react'
import { friendlyError } from './errors'

export type AsyncState<T> =
  | { status: 'loading'; value: T | undefined }
  | { status: 'ready'; value: T }
  | { status: 'error'; value: T | undefined; message: string }

type Settled<T> = { token: string; ok: true; value: T } | { token: string; ok: false; message: string }

/**
 * Loads data for a key and reloads on demand. `load` must be stable for the key (a module-level
 * function, or useCallback). Loading is derived from the key, so a new key never shows the old key's result as
 * current, while the last value stays visible during a reload.
 */
export function useAsyncData<T>(key: string, load: () => Promise<T>): { state: AsyncState<T>; reload: () => void } {
  const [version, setVersion] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const [last, setLast] = useState<T | undefined>(undefined)
  const token = `${key}#${version}`

  useEffect(() => {
    let alive = true
    load().then(
      (value) => {
        if (!alive) return
        setSettled({ token, ok: true, value })
        setLast(value)
      },
      (error: unknown) => {
        if (alive) setSettled({ token, ok: false, message: friendlyError(error) })
      },
    )
    return () => {
      alive = false
    }
  }, [token, load])

  const reload = useCallback(() => setVersion((current) => current + 1), [])

  if (!settled || settled.token !== token) return { state: { status: 'loading', value: last }, reload }
  if (settled.ok) return { state: { status: 'ready', value: settled.value }, reload }
  return { state: { status: 'error', value: last, message: settled.message }, reload }
}
