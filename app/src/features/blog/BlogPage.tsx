import { PostCard } from '../../components/cards/PostCard'
import { PageHero } from '../../components/layout/PageHero'
import { PageHead } from '../../components/seo/PageHead'
import { useContent } from '../../content/ContentContext'
import { postPath } from '../../content/urls'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath, pageAlternates } from '../../i18n/pages'

export function BlogPage() {
  const locale = useLocale()
  const ui = useUi()
  const content = useContent()

  return (
    <>
      <PageHead title={ui.nav.blog} description={ui.pages.latestPostsTitle} alternates={pageAlternates('blog')} />
      <PageHero title={ui.nav.blog} breadcrumbs={[{ label: ui.nav.home, href: localePath(locale, 'home') }, { label: ui.nav.blog }]} />
      <div className="container-page py-12">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.posts().map((post) => (
            <li key={post.id} className="flex">
              <PostCard post={post} cover={post.cover ? content.media(post.cover) : null} href={postPath(locale, post)} headingLevel="h2" />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
