import { Markdown } from '../../components/docs/Markdown'
import { PageHeading } from '../../components/PageHeading'
import { Notice } from '../../components/ui'
import { CHANGELOG } from '../../lib/docs/content'
import { formatChangelogDate } from '../../lib/docs/changelog'

/** /guncellemeler: every note, newest first, on a simple timeline. */
export function ChangelogPage() {
  return (
    <div className="space-y-6">
      <PageHeading title="Son güncellemeler" description="Panelde ve sitede neler değişti, kullanıcı diliyle." />
      {CHANGELOG.length === 0 ? (
        <Notice tone="info">Henüz güncelleme notu yok.</Notice>
      ) : (
        <ol className="max-w-3xl space-y-6 border-l-2 border-line pl-6">
          {CHANGELOG.map((entry) => (
            <li key={entry.date} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[1.95rem] top-1.5 size-3.5 rounded-full border-2 border-white bg-brand-orange ring-2 ring-brand-orange-soft"
              />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-orange-ink">
                <time dateTime={entry.date}>{formatChangelogDate(entry.date)}</time>
              </h2>
              <div className="mt-2 rounded-card border border-line/70 bg-white p-5 shadow-soft">
                <ul className="list-disc space-y-2 pl-5 marker:text-brand-green">
                  {entry.items.map((item) => (
                    <li key={item}>
                      <Markdown>{item}</Markdown>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
