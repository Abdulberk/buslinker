import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Clock, Newspaper } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/primitives'
import { CAMPAIGN_GRADIENT } from '@/shared/config/campaigns'
import { BLOG_CATEGORIES, BLOG_POSTS, type BlogCategory, type BlogPost } from '@/shared/config/blog'
import { blogPath } from '@/shared/lib/search-params'
import { formatDateMedium, fromISODate, pluralTr } from '@/shared/lib/tr'

type Filter = 'all' | BlogCategory

const FILTERS: readonly Filter[] = ['all', 'rehber', 'ipucu', 'guzergah', 'haber']

function filterLabel(filter: Filter): string {
  return filter === 'all' ? 'Tümü' : BLOG_CATEGORIES[filter]
}

/** Newest first. Compared as instants, so no string collation is involved. */
function byNewest(a: BlogPost, b: BlogPost): number {
  return fromISODate(b.publishedAt).getTime() - fromISODate(a.publishedAt).getTime()
}

export default function BlogPage() {
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    document.title = 'Blog | BusLinker'
  }, [])

  const posts = useMemo(
    () =>
      [...BLOG_POSTS].filter((post) => filter === 'all' || post.category === filter).sort(byNewest),
    [filter],
  )

  const [featured, ...rest] = posts

  return (
    <>
      <PageHeader
        title="Blog"
        lead="Otobüsle yolculuk üzerine rehberler, güzergâh notları ve bilet almadan önce işinize yarayacak pratik bilgiler."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <div className="flex flex-col gap-3">
          <ToggleGroup
            type="single"
            value={filter}
            // Radix lets the active item be deselected, which would leave the
            // list with no filter at all; an empty value keeps the current one.
            onValueChange={(value: string) => {
              const next = FILTERS.find((option) => option === value)
              if (next) setFilter(next)
            }}
            aria-label="Yazı kategorisi filtresi"
            className="flex flex-wrap gap-2"
          >
            {FILTERS.map((option) => (
              <ToggleGroupItem key={option} value={option} className="tap-44">
                {filterLabel(option)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <p role="status" className="text-sm text-fg-muted">
            {filter === 'all' ? (
              <>
                Toplam <span data-numeric>{pluralTr(posts.length, 'yazı')}</span> listeleniyor.
              </>
            ) : (
              <>
                {filterLabel(filter)} başlığında{' '}
                <span data-numeric>{pluralTr(posts.length, 'yazı')}</span> listeleniyor.
              </>
            )}
          </p>
        </div>

        {featured ? (
          <>
            <section aria-labelledby="one-cikan-baslik" className="mt-8 sm:mt-10">
              <h2 id="one-cikan-baslik" className="text-xl sm:text-2xl">
                Öne çıkan yazı
              </h2>
              <div className="mt-4">
                <FeaturedCard post={featured} />
              </div>
            </section>

            {rest.length > 0 ? (
              <section aria-labelledby="tum-yazilar-baslik" className="mt-12 sm:mt-14">
                <h2 id="tum-yazilar-baslik" className="text-xl sm:text-2xl">
                  Diğer yazılar
                </h2>
                <ul className="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <li key={post.slug}>
                      <PostCard post={post} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <p className="mt-6 max-w-prose text-sm text-fg-muted">
                Bu başlıkta şimdilik tek bir yazı bulunuyor. Diğer başlıkları da inceleyebilir ya da
                filtreyi &quot;Tümü&quot; olarak değiştirebilirsiniz.
              </p>
            )}
          </>
        ) : (
          <EmptyState
            label={filterLabel(filter)}
            onClear={() => {
              setFilter('all')
            }}
          />
        )}
      </div>
    </>
  )
}

function ToneBand({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <div
      className={className}
      style={{ background: CAMPAIGN_GRADIENT[post.heroTone] }}
      aria-hidden="true"
    />
  )
}

function Meta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
      <span data-numeric>{formatDateMedium(post.publishedAt)}</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3.5" aria-hidden="true" />
        <span data-numeric>{post.readingMinutes} dk</span> okuma
      </span>
    </div>
  )
}

const CARD_CLASS = [
  'group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface',
  'transition-[border-color,box-shadow,translate] duration-(--duration-base) ease-standard',
  'hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md',
].join(' ')

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link to={blogPath(post.slug)} className={`${CARD_CLASS} sm:flex-row`}>
      <div className="relative shrink-0 sm:w-64 lg:w-80">
        <ToneBand post={post} className="h-32 w-full sm:h-full" />
        <Badge
          tone="neutral"
          size="md"
          className="absolute top-4 left-4 bg-surface/85 backdrop-blur-sm"
        >
          {BLOG_CATEGORIES[post.category]}
        </Badge>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold text-balance-tr text-fg sm:text-xl">
          {post.title}
        </h3>
        <p className="mt-2 text-base text-fg-secondary">{post.excerpt}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-5">
          <Meta post={post} />
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-fg">
            Yazıyı okuyun
            <ArrowRight
              className="size-4 transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  )
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link to={blogPath(post.slug)} className={CARD_CLASS}>
      <div className="relative">
        <ToneBand post={post} className="h-24" />
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
        <div className="mt-auto pt-4">
          <Meta post={post} />
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-border-strong bg-surface-sunken p-8 text-center sm:p-12">
      <Newspaper className="mx-auto size-8 text-fg-subtle" aria-hidden="true" />
      <h2 className="mt-4 text-lg text-balance-tr">
        {label} başlığında henüz bir yazı yayımlanmadı
      </h2>
      <p className="mx-auto mt-2 max-w-prose text-base text-fg-secondary">
        Bu başlık için hazırlık sürüyor. Diğer başlıklardaki yazıları inceleyebilir ya da sık
        sorulan sorular sayfasından aradığınız bilgiye doğrudan ulaşabilirsiniz.
      </p>
      <div className="mt-6 flex flex-col items-stretch justify-center gap-3 xs:flex-row xs:items-center">
        <Button variant="primary" onClick={onClear}>
          Tüm yazıları görüntüleyin
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/sss">Sık sorulan sorular</Link>
        </Button>
      </div>
    </div>
  )
}
