import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { Markdown } from '../../components/docs/Markdown'
import { PageHeading } from '../../components/PageHeading'
import { Notice } from '../../components/ui'
import { GUIDE } from '../../lib/docs/content'

/** Scrolls to `#id` after the page has rendered (the router does not do it for us). */
export function useScrollToHash(): string {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      target?.scrollIntoView({ block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [hash])
  return hash
}

/** /kilavuz: the section list on the left, every section on the right, linkable as #id. */
export function GuidePage() {
  const hash = useScrollToHash()
  const current = hash.slice(1)

  return (
    <div className="space-y-6">
      <PageHeading title="Kullanım kılavuzu" description="Her ekran ne işe yarar, nasıl kullanılır, nelere dikkat edilir." />
      {GUIDE.length === 0 ? (
        <Notice tone="info">Kılavuz henüz yazılmadı.</Notice>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <nav aria-label="Kılavuz bölümleri" className="lg:sticky lg:top-6 lg:self-start">
            <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {GUIDE.map((section) => (
                <li key={section.id} className="shrink-0">
                  <a
                    href={`#${section.id}`}
                    aria-current={current === section.id ? 'location' : undefined}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      current === section.id
                        ? 'bg-brand-green-soft text-brand-green-dark'
                        : 'text-ink-muted hover:bg-white hover:text-ink'
                    }`}
                  >
                    {section.title || section.id}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-6">
            {GUIDE.map((section) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="scroll-mt-6 rounded-card border border-line/70 bg-white p-6 shadow-soft"
              >
                <h2 id={`${section.id}-title`} className="text-xl font-bold tracking-tight text-ink">
                  {section.title || section.id}
                </h2>
                <div className="mt-3">
                  <Markdown idPrefix={`${section.id}-`}>{section.body}</Markdown>
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
