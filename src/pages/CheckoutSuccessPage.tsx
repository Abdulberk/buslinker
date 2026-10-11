import { useEffect, useMemo } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router'
import { ArrowRight, CalendarPlus, Copy, Moon, Search, Ticket as TicketIcon } from 'lucide-react'
import { useBookingStore } from '@/features/booking/store'
import { GenderMark } from '@/features/seat-map/SeatGlyph'
import { copyPnr, downloadTicketIcs } from '@/features/ticket/actions'
import { PnrCode } from '@/features/ticket/PnrCode'
import { ticketFacts } from '@/features/ticket/ticket-text'
import {
  getTicket,
  isPnrShape,
  issuedTickets,
  ticketRoute,
  type Ticket,
} from '@/shared/api/tickets'
import {
  formatDateLong,
  formatDuration,
  formatPrice,
  formatTime,
  nightOfLabel,
} from '@/shared/lib/tr'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { PageHeader } from '@/shared/ui/page-header'
import { VisuallyHidden } from '@/shared/ui/visually-hidden'

/**
 * The confirmation step.
 *
 * It shows the booking checkout just wrote down — this trip, these seats,
 * these names — and hands over its code. It used to derive a PNR from the trip
 * id, which the ticket page then read as a different journey altogether.
 *
 * The page says once, in its lead, that nothing was sold; saying it four times
 * made the one thing the traveller came for, the code, hard to find.
 */

function pnrFromState(state: unknown): string | undefined {
  if (typeof state !== 'object' || state === null || !('pnr' in state)) return undefined
  const { pnr } = state
  return typeof pnr === 'string' && isPnrShape(pnr) ? pnr : undefined
}

export default function CheckoutSuccessPage() {
  const { tripId = '' } = useParams<{ tripId: string }>()
  const location = useLocation()
  const clearDraft = useBookingStore((s) => s.clear)

  // The code travels with the navigation from checkout, and the browser keeps
  // that state across a refresh. Failing that, the newest booking this session
  // made on this trip is the one being confirmed. A code is only honoured if it
  // was issued here for this trip: a generated sample is not a booking.
  const ticket = useMemo(() => {
    const pnr = pnrFromState(location.state)
    const fromState = pnr ? getTicket(pnr) : undefined
    if (fromState?.origin === 'booking' && fromState.trip.id === tripId) return fromState
    return issuedTickets().find((t) => t.trip.id === tripId)
  }, [location.state, tripId])

  useEffect(() => {
    document.title = ticket ? 'Rezervasyon Onayı | BusLinker' : 'Rezervasyon bulunamadı | BusLinker'
  }, [ticket])

  // Clearing the draft is what stops the same seats from being submitted a
  // second time by going back.
  useEffect(() => {
    clearDraft()
  }, [clearDraft])

  if (tripId === '') return <Navigate to="/" replace />
  if (!ticket) return <NoBooking />
  return <Confirmation ticket={ticket} />
}

function Confirmation({ ticket }: { ticket: Ticket }) {
  const { trip } = ticket
  const { from, to, operator, fromTerminal, toTerminal } = ticketRoute(ticket)
  const night = nightOfLabel(trip.departsAt)

  return (
    <>
      <PageHeader
        title="Rezervasyonunuz oluşturuldu"
        lead="Tanıtım sürümü: ödeme alınmadı ve gerçek bir bilet düzenlenmedi."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <Card className="mx-auto max-w-2xl">
          <section aria-labelledby="recap-title" className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <OperatorLogo operatorId={trip.operatorId} className="size-11" />
              <div className="min-w-0">
                <h2
                  id="recap-title"
                  className="font-display text-lg font-semibold text-balance-tr text-fg"
                >
                  {from?.name ?? '—'}
                  <ArrowRight
                    className="mx-1.5 inline size-4 align-[-0.125em] text-fg-muted"
                    aria-hidden="true"
                  />
                  <VisuallyHidden>–</VisuallyHidden>
                  {to?.name ?? '—'}
                </h2>
                <p className="truncate text-sm text-fg-secondary">
                  {operator?.name ?? 'Otobüs firması'}
                </p>
              </div>
            </div>

            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <time
                dateTime={trip.departsAt}
                className="text-sm font-medium text-fg-secondary"
                data-numeric
              >
                {formatDateLong(trip.departsAt)}
              </time>
              {night ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-warning-tint px-2 py-0.5 text-xs font-medium text-warning-fg">
                  <Moon className="size-3.5 shrink-0" aria-hidden="true" />
                  {night}
                </span>
              ) : null}
            </p>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="min-w-0">
                <dt className="text-xs text-fg-muted">Kalkış</dt>
                <dd>
                  <span className="font-display text-2xl font-semibold text-fg" data-numeric>
                    {formatTime(trip.departsAt)}
                  </span>
                  <span className="block text-sm wrap-break-word text-fg-secondary">
                    {fromTerminal?.name ?? from?.name ?? '—'}
                  </span>
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-fg-muted">
                  Varış
                  <span className="text-fg-subtle" data-numeric>
                    {' · '}
                    {formatDuration(trip.durationMin)}
                  </span>
                </dt>
                <dd>
                  <span className="font-display text-2xl font-semibold text-fg" data-numeric>
                    {formatTime(trip.arrivesAt)}
                  </span>
                  {trip.overnight ? (
                    <sup className="ms-0.5 text-xs font-bold text-warning-fg">
                      +1
                      <VisuallyHidden> ertesi gün varış</VisuallyHidden>
                    </sup>
                  ) : null}
                  <span className="block text-sm wrap-break-word text-fg-secondary">
                    {toTerminal?.name ?? to?.name ?? '—'}
                  </span>
                </dd>
              </div>
            </dl>

            <ul
              aria-label="Yolcular ve koltuklar"
              className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4"
            >
              {ticket.passengers.map((passenger) => (
                <li
                  key={passenger.seat}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 wrap-break-word text-fg">{passenger.fullName}</span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-fg-secondary">
                    {passenger.gender === 'S' ? null : <GenderMark gender={passenger.gender} />}
                    Koltuk{' '}
                    <strong className="font-semibold text-fg" data-numeric>
                      {passenger.seat}
                    </strong>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 flex items-baseline justify-between gap-4 border-t border-border pt-4">
              <span className="text-sm font-semibold text-fg">Toplam</span>
              <span className="font-display text-xl font-semibold text-fg" data-numeric>
                {formatPrice(ticket.total)}
              </span>
            </p>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border bg-surface-sunken px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="text-xs font-medium text-fg-muted">PNR kodunuz</p>
              <PnrCode code={ticket.pnr} className="text-3xl text-fg" />
              <p className="mt-1 text-xs text-fg-muted">
                Bileti sorgularken bu kodu ve soyadınızı kullanın.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="tap-44"
              onClick={() => {
                void copyPnr(ticket.pnr)
              }}
            >
              <Copy className="size-4" aria-hidden="true" />
              Kopyala
              <VisuallyHidden> — PNR kodunu panoya kopyalayın</VisuallyHidden>
            </Button>
          </div>

          <div className="flex flex-col items-stretch gap-3 p-4 sm:flex-row sm:flex-wrap sm:p-6">
            <Button variant="primary" size="lg" asChild>
              <Link to={`/bilet/${ticket.pnr}`}>
                <TicketIcon className="size-4" aria-hidden="true" />
                Bileti görüntüle
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                downloadTicketIcs(ticketFacts(ticket))
              }}
            >
              <CalendarPlus className="size-4" aria-hidden="true" />
              Takvime ekle
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link to="/">
                <Search className="size-4" aria-hidden="true" />
                Yeni sefer ara
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}

/**
 * Reached by a link or a bookmark with no booking behind it in this browser:
 * there is nothing to confirm, and inventing a code would send the traveller
 * to someone else's ticket.
 */
function NoBooking() {
  return (
    <>
      <PageHeader
        title="Rezervasyon bulunamadı"
        lead="Bu sefer için bu tarayıcıda oluşturulmuş bir rezervasyon yok."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />
      <div className="app-container section-y">
        <div className="mx-auto max-w-md text-center">
          <p className="text-sm text-fg-secondary">
            Rezervasyonu başka bir cihazda ya da tarayıcıda yaptıysanız biletinizi PNR kodunuz ve
            soyadınızla sorgulayabilirsiniz.
          </p>
          <div className="mt-7 flex flex-col items-stretch gap-3 xs:flex-row xs:justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link to="/bilet-sorgula">
                <Search className="size-4" aria-hidden="true" />
                Bilet sorgula
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/">Sefer ara</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
