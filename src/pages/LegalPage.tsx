import { useEffect, useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { FileText, ScrollText } from 'lucide-react'
import { PageHeader, Prose } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { formatDateLong, slugifyTr } from '@/shared/lib/tr'
import { isLegalSlug, LEGAL_DOCS, LEGAL_SLUGS, type LegalDoc } from '@/shared/config/legal'

/** Anchor ids are derived from the heading, so the TOC and the body cannot drift. */
function sectionId(heading: string): string {
  return `bolum-${slugifyTr(heading)}`
}

export default function LegalPage() {
  const params = useParams()
  const { pathname } = useLocation()

  // The four documents are registered as four literal paths, so `useParams`
  // is empty unless the route happens to be declared with a `:slug` segment.
  // Falling back to the last path segment makes the page work under either.
  const slug = params.slug ?? pathname.split('/').filter(Boolean).at(-1)
  const doc: LegalDoc | undefined = isLegalSlug(slug) ? LEGAL_DOCS[slug] : undefined

  useEffect(() => {
    document.title = `${doc ? doc.title : 'Belge bulunamadı'} | BusLinker`
  }, [doc])

  const toc = useMemo(
    () =>
      doc?.sections.map((section) => ({
        id: sectionId(section.heading),
        label: section.heading,
      })) ?? [],
    [doc],
  )

  if (!doc) {
    return <UnknownDocument />
  }

  return (
    <>
      <PageHeader
        title={doc.title}
        lead={`Son güncelleme: ${formatDateLong(doc.updatedAt)}`}
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
          <nav aria-label="Belge içindekiler" className="lg:sticky lg:top-24 lg:self-start">
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
              <p className="text-lg text-fg">{doc.intro}</p>

              {doc.sections.map((section) => (
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

            <div className="mt-12 max-w-prose rounded-xl border border-border bg-surface-sunken p-5">
              <h2 className="flex items-center gap-2 text-base">
                <ScrollText className="size-4 shrink-0 text-fg-muted" aria-hidden="true" />
                Diğer belgeler
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {LEGAL_SLUGS.filter((s) => s !== doc.slug).map((s) => (
                  <li key={s}>
                    <Button variant="secondary" size="sm" asChild>
                      <Link to={`/${s}`}>{LEGAL_DOCS[s].title}</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function UnknownDocument() {
  return (
    <>
      <PageHeader
        title="Belge bulunamadı"
        lead="Aradığınız hukuki metin taşınmış ya da bağlantı hatalı yazılmış olabilir."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />
      <div className="app-container section-y">
        <div className="max-w-prose rounded-xl border border-border bg-surface p-6 sm:p-8">
          <FileText className="size-8 text-fg-subtle" aria-hidden="true" />
          <h2 className="mt-4 text-lg">Yayımdaki belgeler</h2>
          <p className="mt-2 text-base text-fg-secondary">
            Aşağıdaki metinlerden birini seçerek devam edebilirsiniz.
          </p>
          <ul className="mt-5 flex flex-col gap-2">
            {LEGAL_SLUGS.map((s) => (
              <li key={s}>
                <Link
                  to={`/${s}`}
                  className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium text-brand-fg transition-colors duration-(--duration-fast) hover:bg-surface-sunken"
                >
                  {LEGAL_DOCS[s].title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
