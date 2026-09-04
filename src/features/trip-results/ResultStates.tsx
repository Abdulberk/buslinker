import { Link } from 'react-router'
import { CalendarDays, CircleAlert, RotateCcw, SearchX } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { VisuallyHidden } from '@/shared/ui/visually-hidden'
import { cn } from '@/shared/lib/cn'
import { formatDateMedium, fromISODate } from '@/shared/lib/tr'
import { TripCardSkeleton } from './TripCard'

export function ResultsLoading({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div role="status" aria-busy="true" className={cn('space-y-3', className)}>
      <VisuallyHidden>Seferler yükleniyor</VisuallyHidden>
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
  return (
    <Card className={className} role="status">
      <CardBody className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-surface-sunken text-fg-muted">
          <SearchX className="size-7" aria-hidden="true" />
        </span>

        <div className="max-w-md space-y-1.5">
          <h2 className="font-display text-xl font-bold text-balance-tr text-fg">
            {hasFilters ? 'Bu filtrelerle sefer bulamadık' : 'Bu tarihte sefer bulunmuyor'}
          </h2>
          <p className="text-sm text-balance-tr text-fg-secondary">
            {hasFilters
              ? 'Seçtiğiniz filtreler arama sonuçlarının tamamını eledi. Birkaç filtreyi kaldırıp yeniden deneyin.'
              : 'Seçtiğiniz güzergâhta bu gün için planlanmış bir kalkış yok. Yakın bir tarihi deneyebilirsiniz.'}
          </p>
        </div>

        {hasFilters ? (
          <Button variant="primary" size="md" onClick={onClear}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Filtreleri temizle
          </Button>
        ) : nearestDate ? (
          <Button asChild variant="primary" size="md">
            <Link to={nearestDate.href}>
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatDateMedium(fromISODate(nearestDate.date))} tarihine bak
            </Link>
          </Button>
        ) : (
          <Button asChild variant="secondary" size="md">
            <Link to="/">Yeni arama yap</Link>
          </Button>
        )}
      </CardBody>
    </Card>
  )
}

export function ResultsError({ onRetry, className }: { onRetry: () => void; className?: string }) {
  return (
    <Card className={cn('border-danger/30', className)} role="alert">
      <CardBody className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-danger-tint text-danger-fg">
          <CircleAlert className="size-7" aria-hidden="true" />
        </span>

        <div className="max-w-md space-y-1.5">
          <h2 className="font-display text-xl font-bold text-balance-tr text-fg">
            Seferler yüklenemedi
          </h2>
          <p className="text-sm text-balance-tr text-fg-secondary">
            Bağlantı sırasında bir sorun oluştu. Lütfen tekrar deneyin; sorun sürerse birkaç dakika
            sonra yeniden bakın.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={onRetry}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Tekrar dene
        </Button>
      </CardBody>
    </Card>
  )
}
