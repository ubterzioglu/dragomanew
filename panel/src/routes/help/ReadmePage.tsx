import { Markdown } from '../../components/docs/Markdown'
import { PageHeading } from '../../components/PageHeading'
import { Card, Notice } from '../../components/ui'
import { README } from '../../lib/docs/content'

// The file's own # Beni Oku! line is for readers of the .md; the page already has that heading.
const BODY = README.replace(/^# .*\r?\n+/, '')

/** /beni-oku: general notes about the site that every staff member should know (src/docs/beni-oku.md). */
export function ReadmePage() {
  return (
    <div className="space-y-6">
      <PageHeading title="Beni Oku!" description="Site, ekip ve çalışma kuralları hakkında bilinmesi gerekenler." />
      {BODY ? (
        <Card className="max-w-4xl shadow-soft">
          <Markdown idPrefix="beni-oku-">{BODY}</Markdown>
        </Card>
      ) : (
        <Notice tone="info">Bu sayfanın içeriği henüz yazılmadı.</Notice>
      )}
    </div>
  )
}
