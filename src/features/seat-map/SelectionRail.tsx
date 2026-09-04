import { useMemo, type ReactNode } from 'react'
import { ArrowRight, Clock, Info, Sun, X } from 'lucide-react'
import type { SeatMap, SeatPick } from '@/entities/seat/model'
import type { Quote } from '@/entities/seat/rules'
import { cityById, operatorById } from '@/shared/api/catalog'
import type { Trip } from '@/shared/api/mock-server'
import { cn } from '@/shared/lib/cn'
import { formatDateLong, formatDuration, formatPrice, formatTime } from '@/shared/lib/tr'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { GenderMark } from './SeatGlyph'

/**
 * The selection panel beside the deck.
 *
 * The seat strip renders exactly `maxSeats` slots, filled and empty alike.
 * That is the difference between a limit a traveller can see and a limit that
 * only shows up as an error on the fifth click, and it is the shape Turkish
 * ticketing sites have trained people to read.
 */

export interface SelectionRailProps {
  trip: Trip
  seatMap: SeatMap
  picks: readonly SeatPick[]
  quote: Quote
  maxSeats: number
  onRemove: (key: string) => void
  onContinue: () => void
  continueDisabled: boolean
  className?: string
}

export function SelectionRail({
  trip,
  seatMap,
  picks,
  quote,
  maxSeats,
  onRemove,
  onContinue,
  continueDisabled,
  className,
}: SelectionRailProps) {
  const operator = operatorById(trip.operatorId)
  const fromCity = cityById(trip.fromCityId)
  const toCity = cityById(trip.toCityId)

  const noteByKey = useMemo(
    () => new Map(seatMap.seats.map((seat) => [seat.key, seat.note])),
    [seatMap.seats],
  )
  const hasBackRow = picks.some((p) => noteByKey.get(p.key) === 'backRow')
  const hasFrontRow = picks.some((p) => noteByKey.get(p.key) === 'frontRow')

  const slots = Array.from({ length: maxSeats }, (_, index) => picks[index] ?? null)

  return (
    <aside
      aria-label="Seçim özeti"
      className={cn('rounded-xl border border-border bg-surface-raised shadow-sm', className)}
    >
      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between gap-3">
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

        <div className="mt-4 flex items-center gap-2">
          <div className="min-w-0">
            <p className="text-lg font-semibold text-fg tabular-nums">
              {formatTime(trip.departsAt)}
            </p>
            <p className="truncate text-xs text-fg-secondary">{fromCity?.name ?? '—'}</p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-lg font-semibold text-fg tabular-nums">
              {formatTime(trip.arrivesAt)}
            </p>
            <p className="truncate text-xs text-fg-secondary">{toCity?.name ?? '—'}</p>
          </div>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-fg-muted">
          <Clock className="size-3.5" aria-hidden="true" />
          {formatDuration(trip.durationMin)} yolculuk
          {trip.overnight ? ' · Gece hattı' : ''}
        </p>
      </div>

      <div className="p-4">
        <h2 className="text-sm font-semibold text-fg">Seçtiğiniz Koltuklar</h2>
        <p className="mt-1 text-xs text-fg-muted">
          {picks.length} / {maxSeats} koltuk seçildi
        </p>

        <ul
          className="mt-3 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${maxSeats}, minmax(0, 1fr))` }}
        >
          {slots.map((pick, index) =>
            pick ? (
              <li
                key={pick.key}
                className="flex h-20 animate-rise flex-col items-center justify-center gap-1 rounded-lg border border-success/30 bg-success-tint px-1"
              >
                <span className="flex items-center gap-1 text-success-fg">
                  <span className="text-base font-semibold tabular-nums">{pick.label}</span>
                  {pick.gender === 'S' ? null : <GenderMark gender={pick.gender} />}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(pick.key)}
                  aria-label={`${pick.label} numaralı koltuk seçimini kaldır`}
                  className="tap-44 grid size-6 place-items-center rounded-full text-fg-muted transition-colors duration-(--duration-fast) hover:bg-surface hover:text-danger-fg"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ) : (
              <li
                key={`empty-${index}`}
                className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border-strong"
              >
                <span className="text-2xs text-fg-subtle">Boş</span>
              </li>
            ),
          )}
        </ul>

        {hasBackRow || hasFrontRow || seatMap.sunSide !== 'none' ? (
          <div className="mt-4 space-y-2">
            {hasBackRow ? (
              <Notice icon={<Info className="size-4" aria-hidden="true" />}>
                Son sıra koltuklarının konumu ve arkalığın yatma özelliği araca göre değişebilir.
              </Notice>
            ) : null}
            {hasFrontRow ? (
              <Notice icon={<Info className="size-4" aria-hidden="true" />}>
                Ön sıra koltukları 12 yaşından küçük yolculara satılamaz.
              </Notice>
            ) : null}
            {seatMap.sunSide !== 'none' ? (
              <Notice icon={<Sun className="size-4" aria-hidden="true" />}>
                Bu seferde güneş çoğunlukla {seatMap.sunSide === 'left' ? 'sol' : 'sağ'} taraftan
                vuracaktır.
              </Notice>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="border-t border-border p-4">
        {quote.lines.length > 0 ? (
          <dl className="space-y-1.5">
            {quote.lines.map((line) => (
              <div
                key={`${line.kind}-${line.label}`}
                className="flex items-baseline justify-between gap-4"
              >
                <dt className="text-sm text-fg-secondary">{line.label}</dt>
                <dd className="text-sm text-fg tabular-nums">{formatPrice(line.amount)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-fg-muted">Devam etmek için plandan koltuk seçin.</p>
        )}

        <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-border pt-3">
          <span className="text-sm font-semibold text-fg">Toplam</span>
          <span className="font-display text-xl font-semibold text-fg tabular-nums">
            {formatPrice(quote.total)}
          </span>
        </div>

        <div className="mt-4 max-lg:hidden">
          <Button variant="primary" size="lg" full onClick={onContinue} disabled={continueDisabled}>
            Onayla ve Devam Et
          </Button>
          {continueDisabled ? (
            <p className="mt-2 text-center text-xs text-fg-muted">
              Devam etmek için en az bir koltuk seçin
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  )
}

function Notice({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-lg border border-border bg-surface-sunken p-3 text-xs text-fg-secondary">
      <span className="mt-px shrink-0 text-fg-muted">{icon}</span>
      <span>{children}</span>
    </p>
  )
}
