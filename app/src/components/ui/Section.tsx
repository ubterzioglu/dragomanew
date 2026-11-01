import type { ReactNode } from 'react'

interface SectionProps {
  id?: string
  title?: string
  intro?: string
  children: ReactNode
  /** Extra element shown at the right of the heading (e.g. "All posts" link). */
  action?: ReactNode
}

// No background of its own: the page's dive background (DiveBackground.tsx) shows through.
export function Section({ id, title, intro, children, action }: SectionProps) {
  const headingId = id ? `${id}-title` : undefined
  return (
    <section id={id} aria-labelledby={title ? headingId : undefined}>
      <div className="container-page py-12 md:py-16">
        {(title || action) && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              {title && (
                <h2 id={headingId} className="text-3xl font-bold text-ink md:text-4xl">
                  {title}
                </h2>
              )}
              {intro && <p className="mt-3 text-lg text-ink-muted">{intro}</p>}
            </div>
            {action}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
