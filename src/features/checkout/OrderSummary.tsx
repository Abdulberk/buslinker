import { ArrowRight, Clock } from 'lucide-react'
import type { Gender, SeatPick } from '@/entities/seat/model'
import type { Quote } from '@/entities/seat/rules'
import { GenderMark } from '@/features/seat-map/SeatGlyph'
import { cityById, operatorById } from '@/shared/api/catalog'
import type { Trip } from '@/shared/api/mock-server'
import { cn } from '@/shared/lib/cn'
import { formatDateLong, formatDuration, formatPrice, formatTime } from '@/shared/lib/tr'
import { Badge } from '@/shared/ui/badge'
import { OperatorLogo } from '@/shared/ui/operator-logo'

/**
 * The order recap that travels with the checkout form.
 *
 * Deliberately the same block as `SelectionRail` one step earlier: the
 * traveller checks the summary against what they just picked, so a second
 * visual language here would read as a second, differing order.
 */

export interface OrderSummaryProps {
  trip: Trip
  picks: readonly SeatPick[]
  quote: Quote
  className?: string
}

const GENDER_LABEL: Record<Gender, string> = { M: 'Erkek', F: 'Kadın', S: 'Yolcu' }

function terminalName(cityId: string, terminalId: string): string {
  const city = cityById(cityId)
  return city?.terminals.find((t) => t.id === terminalId)?.name ?? ''
}

export function OrderSummary({ trip, picks, quote, className }: OrderSummaryProps) {
  const operator = operatorById(trip.operatorId)
  const fromCity = cityById(trip.fromCityId)
  const toCity = cityById(trip.toCityId)
  const fromTerminal = terminalName(trip.fromCityId, trip.fromTerminalId)
  const toTerminal = terminalName(trip.toCityId, trip.toTerminalId)

  return (
    <aside
      aria-labelledby="order-summary-title"
      className={cn('rounded-xl border border-border bg-surface-raised shadow-sm', className)}
    >
      <div className="border-b border-border p-4">
        <h2 id="order-summary-title" className="text-sm font-semibold text-fg">
          Sipariş özeti
        </h2>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <OperatorLogo operatorId={trip.operatorId} className="size-14" />
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-fg">
                {operator?.name ?? 'Sefer'}
              </p>
              <p className="mt-0.5 text-xs text-fg-muted">{formatDateLong(trip.departsAt)}</p>
            </div>
          </div>
          <Badge tone="neutral" size="sm">
            {trip.seatLayout}
          </Badge>
        </div>

        <div className="mt-4 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-fg tabular-nums" data-numeric>
              {formatTime(trip.departsAt)}
            </p>
            <p className="truncate text-xs text-fg-secondary">{fromCity?.name ?? '—'}</p>
            {fromTerminal ? (
              <p className="truncate text-2xs text-fg-muted">{fromTerminal}</p>
            ) : null}
          </div>
          <ArrowRight className="mt-2 size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-fg tabular-nums" data-numeric>
              {formatTime(trip.arrivesAt)}
            </p>
            <p className="truncate text-xs text-fg-secondary">{toCity?.name ?? '—'}</p>
            {toTerminal ? <p className="truncate text-2xs text-fg-muted">{toTerminal}</p> : null}
          </div>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-fg-muted">
          <Clock className="size-3.5" aria-hidden="true" />
          {formatDuration(trip.durationMin)} yolculuk
          {trip.overnight ? ' · Gece hattı' : ''}
        </p>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-fg">Koltuklar</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {picks.map((pick) => (
            <li
              key={pick.key}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-sunken px-3 py-2"
            >
              <span className="text-sm font-semibold text-fg tabular-nums" data-numeric>
                {pick.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-fg-secondary">
                {pick.gender === 'S' ? null : <GenderMark gender={pick.gender} />}
                {GENDER_LABEL[pick.gender]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border p-4">
        <dl className="space-y-1.5">
          {quote.lines.map((line) => (
            <div
              key={`${line.kind}-${line.label}`}
              className="flex items-baseline justify-between gap-4"
            >
              <dt className="text-sm text-fg-secondary">{line.label}</dt>
              <dd className="text-sm text-fg tabular-nums" data-numeric>
                {formatPrice(line.amount)}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-border pt-3">
          <span className="text-sm font-semibold text-fg">Toplam</span>
          <span className="font-display text-xl font-semibold text-fg tabular-nums" data-numeric>
            {formatPrice(quote.total)}
          </span>
        </div>
      </div>
    </aside>
  )
}
