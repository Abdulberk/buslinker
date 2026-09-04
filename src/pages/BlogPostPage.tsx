import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowRight, Clock, FileQuestion, Search } from 'lucide-react'
import { PageHeader, Prose } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { CAMPAIGN_GRADIENT } from '@/shared/config/campaigns'
import { BLOG_CATEGORIES, BLOG_POSTS, postBySlug, type BlogPost } from '@/shared/config/blog'
import { blogPath } from '@/shared/lib/search-params'
import { formatDateLong, formatDateMedium, fromISODate, slugifyTr } from '@/shared/lib/tr'

/** Anchor ids come from the heading, so the TOC and the body cannot drift. */
function sectionId(heading: string): string {
  return `bolum-${slugifyTr(heading)}`
}

/** Same category first, then newest — the reader's most likely next article. */
function relatedPosts(post: BlogPost): BlogPost[] {
  return [...BLOG_POSTS]
    .filter((candidate) => candidate.slug !== post.slug)
    .sort((a, b) => {
      const sameCategory =
        Number(b.category === post.category) - Number(a.category === post.category)
      if (sameCategory !== 0) return sameCategory
      return fromISODate(b.publishedAt).getTime() - fromISODate(a.publishedAt).getTime()
    })
    .slice(0, 3)
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = postBySlug(slug)

  useEffect(() => {
    document.title = `${post ? post.title : 'Yazı bulunamadı'} | BusLinker`
  }, [post])

  if (!post) return <PostNotFound />

  return <Article post={post} />
}

function Article({ post }: { post: BlogPost }) {
  const toc = useMemo(
    () =>
      post.sections.map((section) => ({ id: sectionId(section.heading), label: section.heading })),
    [post],
  )
  const related = useMemo(() => relatedPosts(post), [post])

  return (
    <>
      <PageHeader
        title={post.title}
        lead={post.excerpt}
        breadcrumbs={[
          { label: 'Ana sayfa', to: '/' },
          { label: 'Blog', to: '/blog' },
        ]}
      />

      <div className="app-container section-y">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Badge tone="brand" size="md">
            {BLOG_CATEGORIES[post.category]}
          </Badge>
          <span className="text-sm text-fg-muted">
            <span data-numeric>{formatDateLong(post.publishedAt)}</span> tarihinde yayımlandı
          </span>
          <span className="inline-flex items-center gap-1 text-sm text-fg-muted">
            <Clock className="size-3.5" aria-hidden="true" />
            <span data-numeric>{post.readingMinutes} dk</span> okuma
          </span>
        </div>

        <div
          className="mt-6 h-32 rounded-2xl border border-border sm:h-44"
          style={{ background: CAMPAIGN_GRADIENT[post.heroTone] }}
          aria-hidden="true"
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
          <nav aria-label="Yazı içindekiler" className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-2xs font-semibold text-fg-muted uppercase">İçindekiler</h2>
            <ol className="mt-3 flex flex-col border-l border-border">
              {toc.map((entry, index) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className="-ml-px flex min-h-11 items-center gap-2.5 border-l-2 border-transparent py-2 pl-4 text-sm text-fg-secondary transition-colors duration-(--duration-fast) hover:border-brand hover:text-brand-fg"
                  >
                    <span className="text-fg-subtle tabular-nums" aria-hidden="true">
                      {index + 1}.
                    </span>
                    <span className="min-w-0">{entry.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0">
            <Prose>
              {post.sections.map((section) => (
                <section key={section.heading} aria-labelledby={sectionId(section.heading)}>
                  {/* The sticky site header would otherwise sit on top of a
                      freshly jumped-to heading. */}
                  <h2 id={sectionId(section.heading)} className="scroll-mt-24">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet.slice(0, 40)}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </Prose>

            <div className="mt-12 max-w-prose rounded-2xl border border-border bg-surface-sunken p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-base">
                <Search className="size-4 shrink-0 text-brand-fg" aria-hidden="true" />
                Yolculuğunuzu planlamaya hazır mısınız?
              </h2>
              <p className="mt-2 text-sm text-fg-secondary">
                Kalkış, varış ve tarih seçerek seferleri karşılaştırın; koltuğunuzu otobüsün planı
                üzerinden kendiniz seçin.
              </p>
              <Button variant="primary" size="lg" asChild className="mt-5">
                <Link to="/">Sefer arayın</Link>
              </Button>
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <section aria-labelledby="ilgili-yazilar-baslik" className="mt-14 sm:mt-16">
            <h2 id="ilgili-yazilar-baslik" className="text-xl sm:text-2xl">
              İlgili yazılar
            </h2>
            <ul className="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <RelatedCard post={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  )
}

function RelatedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={blogPath(post.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-[border-color,box-shadow,translate] duration-(--duration-base) ease-standard hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
    >
      <div className="relative">
        <div
          className="h-20"
          style={{ background: CAMPAIGN_GRADIENT[post.heroTone] }}
          aria-hidden="true"
        />
        <Badge
          tone="neutral"
          size="sm"
          className="absolute top-3 left-4 bg-surface/85 backdrop-blur-sm"
        >
          {BLOG_CATEGORIES[post.category]}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-bold text-balance-tr text-fg">{post.title}</h3>
        <p className="mt-1.5 text-sm text-fg-secondary">{post.excerpt}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-4 text-xs text-fg-muted">
          <span data-numeric>{formatDateMedium(post.publishedAt)}</span>
          <span className="inline-flex items-center gap-1 font-medium text-brand-fg">
            Okuyun
            <ArrowRight
              className="size-3.5 transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  )
}

function PostNotFound() {
  return (
    <div className="app-container section-y">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 text-center" role="alert">
        <span className="grid size-14 place-items-center rounded-full bg-surface-sunken text-fg-muted">
          <FileQuestion className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-balance-tr text-fg">
            Yazı bulunamadı
          </h1>
          <p className="text-sm text-balance-tr text-fg-secondary">
            Aradığınız yazı yayından kaldırılmış ya da bağlantı hatalı yazılmış olabilir. Blog
            sayfasından güncel yazıların tamamına ulaşabilirsiniz.
          </p>
        </div>
        <Button asChild variant="primary" size="lg">
          <Link to="/blog">Blog sayfasına dönün</Link>
        </Button>
      </div>
    </div>
  )
}
