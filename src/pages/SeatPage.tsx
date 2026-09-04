import { useCallback, useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import type { Gender, Seat } from '@/entities/seat/model'
import { DEFAULT_POLICY } from '@/entities/seat/model'
import { maxSeatsFor, quote } from '@/entities/seat/rules'
import { useBookingStore } from '@/features/booking/store'
import { SeatMap } from '@/features/seat-map/SeatMap'
import { SeatLegend } from '@/features/seat-map/SeatLegend'
import { SelectionRail } from '@/features/seat-map/SelectionRail'
import { cityById, operatorById } from '@/shared/api/catalog'
import { seatMapQuery, tripQuery } from '@/shared/api/queries'
import { checkoutPath, resultsPath } from '@/shared/lib/search-params'
import { formatDateLong, formatPrice, formatTime, toISODate } from '@/shared/lib/tr'
import { Button } from '@/shared/ui/button'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { Skeleton } from '@/shared/ui/skeleton'

/**
 * Seat selection.
 *
 * Two live regions, deliberately different: picks flow through a POLITE status
 * that exists from the first render (a region inserted in the same tick as its
 * text is routinely dropped by screen readers), while a rejected pick lands in
 * an ASSERTIVE alert plus a toast — the sighted user gets the toast, everyone
 * gets the alert, and nobody gets `window.alert`.
 */
export default function SeatPage() {
  const { tripId = '' } = useParams<{ tripId: string }>()
  const navigate = useNavigate()

  const enabled = tripId !== ''
  const tripResult = useQuery({ ...tripQuery(tripId), enabled })
  const seatMapResult = useQuery({ ...seatMapQuery(tripId), enabled })
  const trip = tripResult.data
  const seatMap = seatMapResult.data

  const picks = useBookingStore((s) => s.picks)
  const lastError = useBookingStore((s) => s.lastError)
  const announcement = useBookingStore((s) => s.announcement)
  const startTrip = useBookingStore((s) => s.startTrip)
  const addSeat = useBookingStore((s) => s.addSeat)
  const removeSeat = useBookingStore((s) => s.removeSeat)
  const clearError = useBookingStore((s) => s.clearError)
  const clearAnnouncement = useBookingStore((s) => s.clearAnnouncement)

  // Scoping the draft by trip id is what stops seats picked on one departure
  // from silently following the traveller to another.
  useEffect(() => {
    if (enabled) startTrip(tripId)
  }, [enabled, startTrip, tripId])

  // The store already drops `lastError` on the next successful add or remove,
  // so the alert is rendered straight from it rather than mirrored into local
  // state — one source, no cascading render. Clearing on unmount stops a stale
  // rejection from reappearing when the page is revisited.
  useEffect(() => {
    if (lastError) toast.error(lastError.message)
  }, [lastError])

  useEffect(() => clearError, [clearError])

  // Emptying the region after the announcement lands is what lets an identical
  // message ("2 koltuk seçili") be announced a second time.
  useEffect(() => {
    if (!announcement) return
    const timer = setTimeout(clearAnnouncement, 150)
    return () => clearTimeout(timer)
  }, [announcement, clearAnnouncement])

  const errorMessage = lastError?.message ?? null

  const fromCity = trip ? cityById(trip.fromCityId) : undefined
  const toCity = trip ? cityById(trip.toCityId) : undefined
  const routeLabel = fromCity && toCity ? `${fromCity.name} – ${toCity.name}` : ''

  useEffect(() => {
    document.title = routeLabel
      ? `${routeLabel} koltuk seçimi | BusLinker`
      : 'Koltuk seçimi | BusLinker'
  }, [routeLabel])

  const policy = seatMap?.policy ?? DEFAULT_POLICY
  const currentQuote = useMemo(() => quote(picks, policy), [picks, policy])
  const maxSeats = maxSeatsFor(policy)

  const handlePick = useCallback(
    (seat: Seat, gender: Gender) => {
      if (!seatMap) return
      addSeat(seat, gender, seatMap.policy)
    },
    [addSeat, seatMap],
  )

  const handleRemove = useCallback((key: string) => removeSeat(key), [removeSeat])

  const handleContinue = useCallback(() => {
    if (picks.length === 0 || !enabled) return
    void navigate(checkoutPath(tripId))
  }, [enabled, navigate, picks.length, tripId])

  const liveRegion = (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement ?? ''}
    </div>
  )

  const backHref =
    trip && fromCity && toCity
      ? resultsPath(fromCity.slug, toCity.slug, toISODate(new Date(trip.departsAt)))
      : '/'

  if (!enabled || tripResult.isError || seatMapResult.isError) {
    return (
      <>
        {liveRegion}
        <NotFoundState />
      </>
    )
  }

  if (!trip || !seatMap) {
    return (
      <>
        {liveRegion}
        <LoadingState />
      </>
    )
  }

  const operator = operatorById(trip.operatorId)
  const continueDisabled = picks.length === 0

  return (
    <>
      {liveRegion}

      <div className="app-container pt-6 pb-8 sm:pt-8">
        <Button variant="ghost" size="sm" asChild className="-ml-3">
          <Link to={backHref}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Seferlere dön
          </Link>
        </Button>

        <header className="mt-4">
          <h1 className="font-display text-2xl font-semibold text-balance-tr text-fg sm:text-3xl">
            {routeLabel} koltuk seçimi
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <OperatorLogo operatorId={trip.operatorId} className="size-14" />
            <p className="text-sm text-fg-secondary">
              {operator?.name ?? 'Sefer'} · {formatDateLong(trip.departsAt)} ·{' '}
              <span className="tabular-nums">
                {formatTime(trip.departsAt)} – {formatTime(trip.arrivesAt)}
              </span>
            </p>
          </div>
        </header>

        <div role="alert" aria-atomic="true" className="mt-6 empty:mt-0">
          {errorMessage ? (
            <p className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger-tint p-3 text-sm text-danger-fg">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-6">
          <div className="grid gap-6">
            <section
              aria-labelledby="deck-title"
              className="rounded-xl border border-border bg-surface-raised p-4 shadow-sm sm:p-6 lg:p-5"
            >
              {/* Both stay in the document: the section is labelled by the heading,
                  and the keyboard hint is exactly what a screen-reader user needs
                  and a sighted one does not. */}
              <h2 id="deck-title" className="sr-only">
                Koltuk planı
              </h2>
              <p className="sr-only">
                Bir koltuğa dokunun, ardından yolcunun cinsiyetini seçin. Klavyeyle ok tuşlarını
                kullanabilirsiniz.
              </p>
              <SeatMap
                data={seatMap}
                picks={picks}
                onPick={handlePick}
                onRemove={handleRemove}
                className="mt-6"
              />
            </section>

            <section
              aria-labelledby="legend-title"
              className="rounded-xl border border-border bg-surface p-4"
            >
              <h2 id="legend-title" className="text-sm font-semibold text-fg">
                Açıklamalar
              </h2>
              <SeatLegend
                hasGenderSelection={seatMap.policy.hasGenderSelection}
                className="mt-3 sm:max-w-md"
              />
            </section>
          </div>

          <SelectionRail
            trip={trip}
            seatMap={seatMap}
            picks={picks}
            quote={currentQuote}
            maxSeats={maxSeats}
            onRemove={handleRemove}
            onContinue={handleContinue}
            continueDisabled={continueDisabled}
            className="lg:sticky lg:top-6"
          />
        </div>
      </div>

      <div className="sticky bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="app-container flex items-center gap-4 py-3">
          {continueDisabled ? (
            // Kept short: the full sentence wrapped to three lines beside the
            // button in the 390px sticky bar.
            <p id="seat-cta-hint" className="flex-1 text-xs text-balance text-fg-muted">
              Önce bir koltuk seçin
            </p>
          ) : (
            <div>
              <p className="text-2xs text-fg-muted">Toplam</p>
              <p className="font-display text-lg font-semibold text-fg tabular-nums">
                {formatPrice(currentQuote.total)}
              </p>
            </div>
          )}
          <Button
            variant="primary"
            size="lg"
            className="shrink-0"
            onClick={handleContinue}
            disabled={continueDisabled}
            {...(continueDisabled && { 'aria-describedby': 'seat-cta-hint' })}
          >
            Onayla ve Devam Et
          </Button>
        </div>
      </div>
    </>
  )
}

function LoadingState() {
  return (
    <div className="app-container pt-6 pb-8 sm:pt-8" aria-busy="true">
      <span className="sr-only">Koltuk planı yükleniyor</span>
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-4 h-9 w-72 max-w-full" />
      <Skeleton className="mt-3 h-4 w-56 max-w-full" />
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-6">
        <div className="grid gap-6">
          <Skeleton className="h-144 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <Skeleton className="h-120 w-full rounded-xl" />
      </div>
    </div>
  )
}

function NotFoundState() {
  return (
    <div className="app-container section-y">
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold text-fg sm:text-3xl">
          Sefer bulunamadı
        </h1>
        <p className="mt-3 text-sm text-fg-secondary">
          Aradığınız sefer kaldırılmış ya da bağlantı geçerliliğini yitirmiş olabilir. Güncel
          seferler için yeni bir arama yapın.
        </p>
        <Button variant="primary" size="lg" asChild className="mt-6">
          <Link to="/">Sefer ara</Link>
        </Button>
      </div>
    </div>
  )
}
