import { useCallback, useState } from 'react'

const KEY = 'dragoman-panel:sidebar-collapsed'

/** Storage can be blocked (private mode, policies); the menu then simply starts open. */
function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

function write(collapsed: boolean): void {
  try {
    window.localStorage.setItem(KEY, collapsed ? '1' : '0')
  } catch {
    // Not remembered this time; the toggle still works for this visit.
  }
}

/** The desktop menu's "icons only" preference, remembered per browser. */
export function useCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(read)
  const toggle = useCallback(() => {
    setCollapsed((current) => {
      write(!current)
      return !current
    })
  }, [])
  return [collapsed, toggle]
}
