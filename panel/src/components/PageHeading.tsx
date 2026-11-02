import { useEffect, type ReactNode } from 'react'

/**
 * The page's <h1>. It sets the tab title, and the shell moves focus to it after each route change
 * (tabIndex -1 makes it focusable without adding a tab stop).
 */
export function PageHeading({ title, children }: { title: string; children?: ReactNode }) {
  useEffect(() => {
    document.title = `${title} · Dragoman Panel`
  }, [title])

  return (
    <h1 tabIndex={-1} data-page-heading className="text-2xl font-bold text-ink outline-none">
      {children ?? title}
    </h1>
  )
}
