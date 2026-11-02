import { useEffect, type ReactNode } from 'react'
import { ScreenHelp } from './docs/ScreenHelp'
import type { GuideId } from './nav/navItems'

interface PageHeadingProps {
  title: string
  children?: ReactNode
  /** One muted line under the title. */
  description?: string
  /** Guide section shown in "Bu ekran ne işe yarar?". */
  help?: GuideId
}

/**
 * The page's <h1>. It sets the tab title, and the shell moves focus to it after each route change
 * (tabIndex -1 makes it focusable without adding a tab stop).
 */
export function PageHeading({ title, children, description, help }: PageHeadingProps) {
  useEffect(() => {
    document.title = `${title} · Dragoman Panel`
  }, [title])

  const heading = (
    <h1 tabIndex={-1} data-page-heading className="text-2xl font-bold tracking-tight text-ink outline-none">
      {children ?? title}
    </h1>
  )
  if (!description && !help) return heading

  return (
    <div className="min-w-0 flex-1">
      {heading}
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      {help && <ScreenHelp id={help} />}
    </div>
  )
}
