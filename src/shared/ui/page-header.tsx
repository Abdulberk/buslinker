import type { ReactNode } from 'react'
import { Link } from 'react-router'
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
 */
export function Prose({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'max-w-prose text-base text-fg-secondary',
        '[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:first:mt-0',
        '[&_h3]:mt-7 [&_h3]:mb-2 [&_h3]:text-lg',
        '[&_p]:mt-3',
        '[&_ul]:mt-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2',
        '[&_li]:relative [&_li]:pl-5',
        "[&_li]:before:absolute [&_li]:before:top-2.5 [&_li]:before:left-0 [&_li]:before:size-1.5 [&_li]:before:rounded-full [&_li]:before:bg-brand/50 [&_li]:before:content-['']",
        '[&_a]:font-medium [&_a]:text-brand-fg [&_a]:underline-offset-4 hover:[&_a]:underline',
        '[&_strong]:font-semibold [&_strong]:text-fg',
        className,
      )}
    >
      {children}
    </div>
  )
}
