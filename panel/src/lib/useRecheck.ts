import { useEffect, useState } from 'react'

/** How often a visible panel re-reads the signed-in person's staff row. */
export const RECHECK_INTERVAL_MS = 5 * 60 * 1000

/**
 * A counter that goes up when the tab is shown again and every few minutes while it is visible,
 * so lookups keyed on it are re-read without a reload. A hidden tab never polls.
 */
export function useRecheck(intervalMs: number = RECHECK_INTERVAL_MS): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const bump = () => {
      if (document.visibilityState === 'visible') setCount((value) => value + 1)
    }
    document.addEventListener('visibilitychange', bump)
    const timer = window.setInterval(bump, intervalMs)
    return () => {
      document.removeEventListener('visibilitychange', bump)
      window.clearInterval(timer)
    }
  }, [intervalMs])

  return count
}
