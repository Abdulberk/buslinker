import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export interface Crumb {
  label: string
  to?: string
}

export interface PageHeaderProps {
  title: string
  lead?: string
  /** The trail WITHOUT the current page; the title is appended automatically. */
  breadcrumbs?: readonly Crumb[]
  /** Actions rendered opposite the title on wide screens. */
  actions?: ReactNode
  className?: string
}

/**
 * The standard top of every secondary page.
 *
 * Keeping the h1, the lead and the breadcrumb in one component is what stops
 * fifteen pages from each inventing their own heading scale and gutter.
 */
export function PageHeader({ title, lead, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('border-b border-border bg-bg-alt', className)}>
      <div className="app-container py-8 sm:py-10">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Sayfa yolu" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-fg-muted">
              {breadcrumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-1">
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className="rounded-xs underline-offset-4 hover:text-brand-fg hover:underline"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                  <ChevronRight className="size-3.5 shrink-0 text-fg-subtle" aria-hidden="true" />
                </li>
              ))}
              {/* The current page is the trail's end, so it is not a link. */}
              <li aria-current="page" className="font-medium text-fg-secondary">
                {title}
              </li>
            </ol>
          </nav>
        ) : null}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl text-balance-tr sm:text-3xl">{title}</h1>
            {lead ? <p className="mt-2 max-w-prose text-base text-fg-secondary">{lead}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
        </div>
      </div>
    </div>
  )
}

/**
 * Long-form body copy. Legal and editorial pages set their own headings and
 * lists, so the rhythm is defined once here rather than per page.
 *
 * The rules, and why:
 *
 * - The measure is 68 characters rather than a fixed rem width, so the line
 *   stays comfortable at whatever text size the reader has set.
 * - A section heading gets far more space above it than below (2.5rem against
 *   0.75rem). With the gaps closer to equal, a heading floated between two
 *   sections; the space has to say which one it starts. The block's first
 *   child takes no top margin, so it lines up with whatever sits beside it.
 * - Headings inside the body step down from the page's h1 (xl and lg against
 *   2xl/3xl), so a section never reads as a second page title.
 * - Links are underlined at rest. In a paragraph, colour alone does not set a
 *   link apart from emphasis for everyone (SC 1.4.1). The line is drawn at the
 *   font's own thickness and 4px below the baseline, clear of descenders.
 * - List bullets are a neutral grey. Red is what you press, and a red dot that
 *   does nothing teaches the eye to ignore red.
 */
export function Prose({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'max-w-[68ch] text-base text-fg-secondary',
        '[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:text-balance-tr',
        '[&_h3]:mt-7 [&_h3]:mb-2 [&_h3]:text-lg',
        '[&_p]:mt-3',
        '[&_ul]:mt-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2',
        '[&_li]:relative [&_li]:pl-5',
        "[&_li]:before:absolute [&_li]:before:top-2.5 [&_li]:before:left-0 [&_li]:before:size-1.5 [&_li]:before:rounded-full [&_li]:before:bg-fg-subtle [&_li]:before:content-['']",
        '[&_a]:font-medium [&_a]:text-brand-fg [&_a]:underline [&_a]:decoration-from-font [&_a]:underline-offset-4',
        // On the link itself: a variant written hover:[&_a] would thicken every
        // link in the block whenever the pointer was anywhere over the text.
        '[&_a:hover]:decoration-2',
        '[&_strong]:font-semibold [&_strong]:text-fg',
        // After the element rules, so it wins over the top margin of whichever
        // element opens the block: a heading, or a lead paragraph inside a
        // section.
        '[&>:first-child]:mt-0 [&>:first-child>:first-child]:mt-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Scrolls to the element the URL's #fragment names, once the page has drawn.
 *
 * The browser does this on its own only for a document that is already there.
 * A route here is a lazy chunk: on a fresh load of `/sss#odeme`, or a link to
 * it from another page, the router's scroll restoration runs before the chunk
 * has rendered, finds no `#odeme`, and leaves the reader at the top. Calling
 * this once the content exists closes that gap. `scrollIntoView` honours the
 * root's scroll-padding, so the target lands below the sticky header rather
 * than under it (SC 2.4.11).
 *
 * `ready` lets a page hold the jump until what it targets has rendered.
 */
export function useScrollToHash(ready = true) {
  const { hash } = useLocation()

  useEffect(() => {
    if (!ready || hash.length < 2) return
    let id: string
    try {
      id = decodeURIComponent(hash.slice(1))
    } catch {
      return
    }
    // One frame later, so the layout above the target has settled before its
    // position is measured.
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [hash, ready])
}
