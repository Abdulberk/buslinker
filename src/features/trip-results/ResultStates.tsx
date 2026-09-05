import { Link } from 'react-router'
import { CalendarDays, CircleAlert, RotateCcw, SearchX } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { VisuallyHidden } from '@/shared/ui/visually-hidden'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/cn'
import { formatDateMedium, fromISODate } from '@/shared/lib/tr'
import { TripCardSkeleton } from './TripCard'

export function ResultsLoading({ count = 5, className }: { count?: number; className?: string }) {
  const { t } = useTranslation()
  return (
    <div role="status" aria-busy="true" className={cn('space-y-3', className)}>
      <VisuallyHidden>{t('results.loading')}</VisuallyHidden>
      {Array.from({ length: count }, (_, index) => (
        <TripCardSkeleton key={index} />
      ))}
    </div>
  )
}

export interface ResultsEmptyProps {
  hasFilters: boolean
  onClear: () => void
  /** The closest day that actually has departures, when one exists. */
  nearestDate?: { date: string; href: string }
  className?: string
}

export function ResultsEmpty({ hasFilters, onClear, nearestDate, className }: ResultsEmptyProps) {
  const { t } = useTranslation()
  return (
    <Card className={className} role="status">
      <CardBody className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-surface-sunken text-fg-muted">
          <SearchX className="size-7" aria-hidden="true" />
        </span>

        <div className="max-w-md space-y-1.5">
          <h2 className="font-display text-xl font-bold text-balance-tr text-fg">
            {hasFilters ? t('results.emptyFiltered') : t('results.emptyDate')}
          </h2>
          <p className="text-sm text-balance-tr text-fg-secondary">
            {hasFilters ? t('results.emptyFilteredBody') : t('results.emptyDateBody')}
          </p>
        </div>

        {hasFilters ? (
          <Button variant="primary" size="md" onClick={onClear}>
            <RotateCcw className="size-4" aria-hidden="true" />
            {t('results.clearFilters')}
          </Button>
        ) : nearestDate ? (
          <Button asChild variant="primary" size="md">
            <Link to={nearestDate.href}>
              <CalendarDays className="size-4" aria-hidden="true" />
              {t('results.seeDate', {
                date: formatDateMedium(fromISODate(nearestDate.date)),
              })}
            </Link>
          </Button>
        ) : (
          <Button asChild variant="secondary" size="md">
            <Link to="/">{t('results.newSearch')}</Link>
          </Button>
        )}
      </CardBody>
    </Card>
  )
}

export function ResultsError({ onRetry, className }: { onRetry: () => void; className?: string }) {
  const { t } = useTranslation()
  return (
    <Card className={cn('border-danger/30', className)} role="alert">
      <CardBody className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-danger-tint text-danger-fg">
          <CircleAlert className="size-7" aria-hidden="true" />
        </span>

        <div className="max-w-md space-y-1.5">
          <h2 className="font-display text-xl font-bold text-balance-tr text-fg">
            {t('results.errorTitle')}
          </h2>
          <p className="text-sm text-balance-tr text-fg-secondary">{t('results.errorBody')}</p>
        </div>

        <Button variant="primary" size="md" onClick={onRetry}>
          <RotateCcw className="size-4" aria-hidden="true" />
          {t('results.retry')}
        </Button>
      </CardBody>
    </Card>
  )
}
