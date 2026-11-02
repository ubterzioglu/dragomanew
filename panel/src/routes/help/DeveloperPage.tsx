import { useAuth } from '../../auth/AuthProvider'
import { Markdown } from '../../components/docs/Markdown'
import { canSeeDeveloperGuide } from '../../components/nav/navItems'
import { PageHeading } from '../../components/PageHeading'
import { Notice } from '../../components/ui'
import { COOKBOOK } from '../../lib/docs/content'
import { useScrollToHash } from './GuidePage'

/**
 * /gelistirici: the developer cookbook (docs/gelistirici-cookbook.md, copied by sync:shared).
 * Main admin only. It holds no secrets, but it maps the infrastructure, so others get "Erişim yok".
 * The page has its own <h1>; the file's own # title line would only repeat it.
 */
const withoutTitle = (markdown: string): string => markdown.replace(/^\uFEFF?\s*#\s[^\n]*\n/, '')

export function DeveloperPage() {
  const { staff } = useAuth()
  useScrollToHash()

  if (!canSeeDeveloperGuide(staff?.role ?? null)) {
    return (
      <div className="space-y-4">
        <PageHeading title="Erişim yok" />
        <Notice tone="info">Geliştirici rehberini yalnız ana yönetici görebilir.</Notice>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Geliştirici rehberi"
        description="Repoda docs/gelistirici-cookbook.md olarak durur; burada aynısı görünür."
      />
      {COOKBOOK ? (
        <article className="max-w-4xl rounded-card border border-line/70 bg-white p-6 shadow-soft sm:p-8">
          <Markdown idPrefix="cb-">{withoutTitle(COOKBOOK)}</Markdown>
        </article>
      ) : (
        <Notice tone="info">Rehber henüz panele kopyalanmadı: app klasöründe npm run sync:shared çalıştırın.</Notice>
      )}
    </div>
  )
}
