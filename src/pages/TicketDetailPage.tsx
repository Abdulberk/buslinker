import { useEffect, useMemo, type ComponentType, type SVGProps } from 'react'
import { Link, useParams } from 'react-router'
import {
  Ban,
  Bus,
  CircleCheck,
  CircleSlash,
  Clock,
  Copy,
  DoorOpen,
  IdCard,
  Moon,
  Search,
} from 'lucide-react'
import { GenderMark } from '@/features/seat-map/SeatGlyph'
import { copyPnr } from '@/features/ticket/actions'
import { BoardingQr } from '@/features/ticket/BoardingQr'
import { departureCountdown } from '@/features/ticket/countdown'
import { PnrCode } from '@/features/ticket/PnrCode'
import { boardingPayload } from '@/features/ticket/qr'
import { TicketActions, TicketHeading } from '@/features/ticket/TicketActions'
import { ticketFacts } from '@/features/ticket/ticket-text'
import { useNow } from '@/features/ticket/use-now'
import {
  BOARDING_LEAD_MINUTES,
  CANCEL_CUTOFF_HOURS,
  boardingTime,
  cancellationState,
  effectiveStatus,
  getTicket,
  refundFor,
  ticketRoute,
  TICKET_STATUS_LABEL,
  type CancelBlocker,
  type Ticket,
  type TicketGender,
  type TicketStatus,
} from '@/shared/api/tickets'
import { cn } from '@/shared/lib/cn'
import {
  foldTr,
  formatDateLong,
  formatDateMedium,
  formatDuration,
  formatPrice,
  formatTime,
  nightOfLabel,
} from '@/shared/lib/tr'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { PageHeader } from '@/shared/ui/page-header'
import { VisuallyHidden } from '@/shared/ui/visually-hidden'

/**
 * The ticket, read as a boarding pass.
 *
 * The first screen is the stub a traveller shows at the coach door: whether
 * the ticket is good, how long until departure, the date and the night it
 * falls on, both times, both terminals, when to be at the platform, the seats
 * and the code to scan. Everything a traveller reads once — the receipt, the
 * rules, the help — comes after it, so the stub never scrolls away on a phone.
 */

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

/** Status is never carried by colour alone — each tone ships its own mark. */
const STATUS_ART: Record<
  TicketStatus,
  { tone: 'success' | 'neutral' | 'danger'; Icon: IconComponent }
> = {
  confirmed: { tone: 'success', Icon: CircleCheck },
  used: { tone: 'neutral', Icon: CircleSlash },
  cancelled: { tone: 'danger', Icon: Ban },
}

const GENDER_LABEL: Record<TicketGender, string> = { M: 'Erkek', F: 'Kadın', S: 'Yolcu' }

/**
 * The city under a terminal's name, unless the name already says it: "Dudullu
 * Otogarı" needs "İstanbul" beneath it, "Van Otogarı" does not need "Van".
 */
function CityNote({ terminal, city }: { terminal: string | undefined; city: string | undefined }) {
  if (!terminal || !city || foldTr(terminal).includes(foldTr(city))) return null
  return <p className="text-xs text-fg-muted">{city}</p>
}

/** `26 Ekim Pzt 23:30`: an exact moment, with no suffix glued onto a computed value. */
function moment(date: Date): string {
  return `${formatDateMedium(date)} ${formatTime(date)}`
}

export default function TicketDetailPage() {
  const { pnr = '' } = useParams<{ pnr: string }>()
  const ticket = useMemo(() => getTicket(pnr), [pnr])
  // Refreshed on the minute: the countdown, the status and the cancellation
  // rule all move with the clock while the page stays open.
  const now = useNow()

  useEffect(() => {
    document.title = ticket ? 'Biletiniz | BusLinker' : 'Bilet bulunamadı | BusLinker'
  }, [ticket])

  if (!ticket) return <TicketNotFound />
  return <TicketView ticket={ticket} now={now} />
}

function TicketView({ ticket, now }: { ticket: Ticket; now: Date }) {
  const { trip } = ticket
  const { from, to, operator, fromTerminal, toTerminal } = ticketRoute(ticket)
  const facts = ticketFacts(ticket)
  const status = effectiveStatus(ticket, now)
  const art = STATUS_ART[status]
  const StatusIcon = art.Icon
  const boardable = status === 'confirmed'
  const countdown = boardable ? departureCountdown(trip.departsAt, now) : null
  const night = nightOfLabel(trip.departsAt)
  const operatorName = operator?.name ?? 'Otobüs firması'

  return (
    <>
      <PageHeader
        title="Biletiniz"
        breadcrumbs={[{ label: 'Bilet Sorgula', to: '/bilet-sorgula' }]}
        className="print:hidden"
      />

      <div className="app-container section-y print:py-0">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:gap-5">
          <article
            aria-labelledby="pass-title"
            className="rounded-xl border border-border bg-surface-raised shadow-sm md:flex print:break-inside-avoid print:shadow-none"
          >
            <h2 id="pass-title" className="sr-only">
              Biniş kartı
            </h2>

            {/* From `md` up the pass turns sideways, as a printed one is: the
                journey on the left, the code on a stub torn off to the right,
                so the whole pass fits the first screen of a laptop too. */}
            <div className="min-w-0 md:flex-1">
              <header className="flex items-center gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
                <OperatorLogo operatorId={trip.operatorId} className="size-11 sm:size-12" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-semibold text-fg">
                    {operatorName}
                  </p>
                  <p className="text-xs text-fg-muted">Elektronik otobüs bileti</p>
                </div>
                <Badge tone={art.tone} size="md" className="shrink-0">
                  <StatusIcon aria-hidden="true" />
                  {TICKET_STATUS_LABEL[status]}
                </Badge>
              </header>

              <div className="px-4 pt-4 pb-5 sm:px-6 sm:pb-6">
                <StatusLine ticket={ticket} status={status} countdownText={countdown?.text} />

                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
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

                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-3 sm:gap-x-5">
                  <div className="min-w-0">
                    <p className="text-xs text-fg-muted">Kalkış</p>
                    <p className="font-display text-3xl font-semibold text-fg lg:text-4xl">
                      <time dateTime={trip.departsAt} data-numeric>
                        {formatTime(trip.departsAt)}
                      </time>
                    </p>
                    <p className="mt-1.5 text-sm font-semibold wrap-break-word text-fg">
                      {fromTerminal?.name ?? from?.name ?? '—'}
                    </p>
                    <CityNote terminal={fromTerminal?.name} city={from?.name} />
                  </div>

                  <div className="flex w-14 flex-col items-center pt-7 sm:w-24 lg:w-32 lg:pt-8">
                    <span
                      className="text-2xs font-medium whitespace-nowrap text-fg-muted"
                      data-numeric
                    >
                      <VisuallyHidden>Yolculuk süresi </VisuallyHidden>
                      {formatDuration(trip.durationMin)}
                    </span>
                    <span className="mt-1 flex w-full items-center gap-1" aria-hidden="true">
                      <span className="size-1.5 shrink-0 rounded-full ring-1 ring-border-strong" />
                      <span className="h-px flex-1 bg-border-strong" />
                      <Bus className="size-3.5 shrink-0 text-fg-muted" />
                      <span className="h-px flex-1 bg-border-strong" />
                      <span className="size-1.5 shrink-0 rounded-full bg-border-strong" />
                    </span>
                  </div>

                  <div className="min-w-0 text-end">
                    <p className="text-xs text-fg-muted">Varış</p>
                    <p className="font-display text-3xl font-semibold text-fg lg:text-4xl">
                      <time dateTime={trip.arrivesAt} data-numeric>
                        {formatTime(trip.arrivesAt)}
                      </time>
                      {trip.overnight ? (
                        <sup className="ms-0.5 text-xs font-bold text-warning-fg">
                          +1
                          <VisuallyHidden> ertesi gün varış</VisuallyHidden>
                        </sup>
                      ) : null}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold wrap-break-word text-fg">
                      {toTerminal?.name ?? to?.name ?? '—'}
                    </p>
                    <CityNote terminal={toTerminal?.name} city={to?.name} />
                  </div>
                </div>

                {boardable ? (
                  <p className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 rounded-lg bg-surface-sunken px-3 py-2.5 text-sm text-fg">
                    <span className="inline-flex items-center gap-2">
                      <DoorOpen className="size-4 shrink-0 text-fg-muted" aria-hidden="true" />
                      <span>
                        Peronda olun:{' '}
                        <strong className="font-semibold" data-numeric>
                          {formatTime(boardingTime(ticket))}
                        </strong>
                      </span>
                    </span>
                    <span className="text-xs text-fg-muted">
                      Kalkıştan {BOARDING_LEAD_MINUTES} dakika önce
                    </span>
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <p className="text-sm text-fg-secondary" id="pass-seats">
                    {ticket.passengers.length > 1 ? 'Koltuklar' : 'Koltuk'}
                  </p>
                  <ul aria-labelledby="pass-seats" className="flex flex-wrap gap-1.5">
                    {ticket.passengers.map((passenger) => (
                      <li
                        key={passenger.seat}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface px-2.5 py-1 font-display text-base font-semibold text-fg"
                      >
                        <span data-numeric>{passenger.seat}</span>
                        {passenger.gender === 'S' ? null : (
                          <span className="text-fg-muted">
                            <GenderMark gender={passenger.gender} />
                          </span>
                        )}
                        {passenger.gender === 'S' ? null : (
                          <VisuallyHidden>, {GENDER_LABEL[passenger.gender]} yolcu</VisuallyHidden>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <Perforation />

            <div className="flex items-center gap-4 px-4 pt-3 pb-4 sm:gap-6 sm:px-6 sm:pb-6 md:w-72 md:shrink-0 md:flex-col md:items-start md:justify-center md:gap-4 md:py-6 md:ps-3">
              {boardable ? (
                <BoardingQr
                  value={boardingPayload(ticket)}
                  label="Biniş kodu, QR"
                  className="size-28 shrink-0 min-[360px]:size-32 sm:size-36"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                {boardable ? (
                  <>
                    <p className="text-sm font-semibold text-fg">Biniş kodu</p>
                    <p className="mt-0.5 text-xs text-fg-muted">Binişte görevliye okutun.</p>
                  </>
                ) : (
                  <p className="text-sm text-fg-secondary">
                    {status === 'cancelled'
                      ? 'İptal edilen bilette biniş kodu yer almaz.'
                      : 'Tamamlanan yolculukta biniş kodu gösterilmez.'}
                  </p>
                )}
                <p className="mt-3 text-xs font-medium text-fg-muted">PNR kodu</p>
                {/* The copy control sits on the code's own line, as an icon: a
                    labelled button underneath pushed the stub past the first
                    screen of a phone. */}
                <div className="flex flex-wrap items-center gap-x-1">
                  <PnrCode
                    code={ticket.pnr}
                    className="text-xl text-fg min-[360px]:text-2xl sm:text-3xl"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="tap-44 print:hidden"
                    title="Kopyala"
                    onClick={() => {
                      void copyPnr(ticket.pnr)
                    }}
                  >
                    <Copy className="size-4" aria-hidden="true" />
                    <VisuallyHidden>PNR kodunu kopyala</VisuallyHidden>
                  </Button>
                </div>
              </div>
            </div>
          </article>

          <TicketActions facts={facts} active={boardable} />

          <TicketDetails ticket={ticket} boardable={boardable} />

          <CancellationBlock ticket={ticket} now={now} operatorName={operatorName} />
        </div>
      </div>
    </>
  )
}

/**
 * The line under the operator: a countdown on a good ticket, and on a spent or
 * cancelled one a plain statement that it will not get anyone on a coach.
 * No live region: it changes once a minute, and a screen reader re-reading it
 * that often would talk over everything else on the page.
 */
function StatusLine({
  ticket,
  status,
  countdownText,
}: {
  ticket: Ticket
  status: TicketStatus
  countdownText: string | undefined
}) {
  if (status === 'cancelled') {
    const { paid, deduction, refund } = refundFor(ticket)
    return (
      <div className="flex gap-3 rounded-lg border border-danger/30 bg-danger-tint p-3.5">
        <Ban className="mt-0.5 size-5 shrink-0 text-danger-fg" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-semibold text-danger-fg">Bu bilet iptal edildi</p>
          <p className="mt-0.5 text-sm text-fg-secondary">Binişte geçerli değildir.</p>
          <p className="mt-2 text-sm text-fg">
            İade tutarı:{' '}
            <strong className="font-semibold" data-numeric>
              {formatPrice(refund)}
            </strong>{' '}
            <span className="text-fg-muted" data-numeric>
              (ödenen {formatPrice(paid)}, örnek kesinti {formatPrice(deduction)})
            </span>
          </p>
        </div>
      </div>
    )
  }

  if (status === 'used') {
    return (
      <div className="flex gap-3 rounded-lg border border-border bg-surface-sunken p-3.5">
        <CircleSlash className="mt-0.5 size-5 shrink-0 text-fg-muted" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-semibold text-fg">Bu yolculuk tamamlandı</p>
          <p className="mt-0.5 text-sm text-fg-secondary">
            Bilet binişte artık geçerli değildir; kayıt olarak saklanır.
          </p>
        </div>
      </div>
    )
  }

  return countdownText ? (
    <p className="flex items-center gap-2 font-display text-lg font-semibold text-fg">
      <Clock className="size-5 shrink-0 text-success-fg" aria-hidden="true" />
      {countdownText}
    </p>
  ) : null
}

function TicketDetails({ ticket, boardable }: { ticket: Ticket; boardable: boolean }) {
  return (
    <section
      aria-label="Bilet ayrıntıları"
      className="rounded-xl border border-border bg-surface-raised shadow-sm print:break-inside-avoid print:shadow-none"
    >
      {/* Side by side on paper, so the pass and its receipt share one sheet. */}
      <div className="print:grid print:grid-cols-2">
        <div className="p-4 sm:p-6">
          <TicketHeading id="passengers-title">Yolcular</TicketHeading>
          <ul aria-labelledby="passengers-title" className="mt-2 divide-y divide-border">
            {ticket.passengers.map((passenger) => (
              <li
                key={passenger.seat}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5"
              >
                <span className="min-w-0 font-medium wrap-break-word text-fg">
                  {passenger.fullName}
                </span>
                <span className="flex shrink-0 items-center gap-3 text-sm text-fg-secondary">
                  {passenger.gender === 'S' ? null : (
                    <span className="inline-flex items-center gap-1.5">
                      <GenderMark gender={passenger.gender} />
                      {GENDER_LABEL[passenger.gender]}
                    </span>
                  )}
                  <span>
                    Koltuk{' '}
                    <strong className="font-semibold text-fg" data-numeric>
                      {passenger.seat}
                    </strong>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border p-4 sm:p-6 print:border-s print:border-t-0">
          <TicketHeading id="fare-title">Ücret dökümü</TicketHeading>
          <dl aria-labelledby="fare-title" className="mt-3 flex flex-col gap-2">
            {ticket.fareLines.map((line) => (
              <div
                key={`${line.kind}-${line.label}`}
                className="flex items-baseline justify-between gap-4"
              >
                <dt className="min-w-0 text-sm text-fg-secondary">{line.label}</dt>
                <dd className="shrink-0 text-sm font-medium text-fg" data-numeric>
                  {formatPrice(line.amount)}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-border pt-3">
            <span className="text-base font-semibold text-fg">Toplam</span>
            <span className="font-display text-xl font-semibold text-fg" data-numeric>
              {formatPrice(ticket.total)}
            </span>
          </div>
          <p className="mt-3 text-xs text-fg-muted">
            Satın alma:{' '}
            <time dateTime={ticket.purchasedAt} data-numeric>
              {formatDateLong(ticket.purchasedAt)} {formatTime(ticket.purchasedAt)}
            </time>
          </p>
        </div>
      </div>

      {/* Advice for the day, not part of the ticket: printing it pushed the
          pass onto a second A4 sheet. */}
      {boardable ? (
        <div className="border-t border-border p-4 sm:p-6 print:hidden" data-print-hide>
          <TicketHeading id="notes-title">Yolculuk öncesi</TicketHeading>
          <ul
            aria-labelledby="notes-title"
            className="mt-3 flex flex-col gap-2.5 text-sm text-fg-secondary"
          >
            <li className="flex gap-2.5">
              <IdCard className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden="true" />
              Yanınızda fotoğraflı kimlik belgenizi bulundurun; binişte istenebilir.
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden="true" />
              Otobüs kalkış saatinde hareket eder; peronda beklemez.
            </li>
          </ul>
        </div>
      ) : null}

      <p className="rounded-b-xl border-t border-border bg-surface-sunken px-4 py-3 text-xs text-fg-muted sm:px-6">
        {ticket.origin === 'booking'
          ? 'Bu bilet tanıtım sürümündeki rezervasyonunuzdan oluşturuldu: ödeme alınmadı ve gerçek bir yolculukta geçerli değildir.'
          : 'Bu bilet BusLinker tanıtım sürümünde örnek verilerle oluşturuldu ve gerçek bir yolculukta geçerli değildir.'}
      </p>
    </section>
  )
}

const BLOCKER_REASON: Record<Exclude<CancelBlocker, 'cancelled' | 'used'>, string> = {
  nonrefundable:
    'Bu bilet iptal ve iade hakkı bulunmayan bir tarifeyle alındı; çevrim içi iptal edilemez. İptal talebi için firmayla iletişime geçin.',
  deadline: `Çevrim içi iptal, kalkıştan ${CANCEL_CUTOFF_HOURS} saat önce kapandı. Bu aşamada iptal için firmayla iletişime geçin.`,
}

/**
 * One cancellation rule, stated with its exact deadline.
 *
 * "Kalkıştan 3 saat öncesine kadar" makes the traveller do the arithmetic, and
 * for a coach at 01:30 the answer lands on the previous day. The deadline is
 * printed as a moment instead. A ticket that is over or already cancelled has
 * nothing to cancel, so only the ways to get help remain.
 */
function CancellationBlock({
  ticket,
  now,
  operatorName,
}: {
  ticket: Ticket
  now: Date
  operatorName: string
}) {
  const { deadline, blocker } = cancellationState(ticket, now)
  const settled = blocker === 'cancelled' || blocker === 'used'

  return (
    <section
      aria-labelledby="cancel-title"
      data-print-hide
      className="rounded-xl border border-border bg-surface p-4 sm:p-6 print:hidden"
    >
      <TicketHeading id="cancel-title">{settled ? 'Yardım' : 'İptal ve yardım'}</TicketHeading>

      {settled ? null : blocker === null ? (
        <>
          <p className="mt-2 text-sm text-fg-secondary">
            Bu bileti çevrim içi iptal edebilirsiniz. Son iptal zamanı:{' '}
            <strong className="font-semibold whitespace-nowrap text-fg" data-numeric>
              {moment(deadline)}
            </strong>{' '}
            (kalkıştan {CANCEL_CUTOFF_HOURS} saat önce).
          </p>
          <Button variant="secondary" size="md" asChild className="mt-4">
            <Link to={`/bilet-iptal?pnr=${ticket.pnr}`}>Bileti iptal et</Link>
          </Button>
        </>
      ) : (
        <>
          <p id="cancel-reason" className="mt-2 text-sm text-fg-secondary">
            {BLOCKER_REASON[blocker]}
            {blocker === 'deadline' ? (
              <>
                {' '}
                Son iptal zamanı:{' '}
                <span className="font-medium whitespace-nowrap text-fg" data-numeric>
                  {moment(deadline)}
                </span>
              </>
            ) : null}
          </p>
          <Button
            variant="secondary"
            size="md"
            disabled
            aria-describedby="cancel-reason"
            className="mt-4"
          >
            Bileti iptal et
          </Button>
        </>
      )}

      <p className={cn('text-sm text-fg-muted', settled ? 'mt-2' : 'mt-4')}>
        Sorunuz mu var?{' '}
        <Link
          to={`/otobus-firmalari/${ticket.trip.operatorId}`}
          className="font-medium text-brand-fg underline underline-offset-4 hover:no-underline"
        >
          {operatorName} iletişim bilgileri
        </Link>
        {' · '}
        <Link
          to="/yardim"
          className="font-medium text-brand-fg underline underline-offset-4 hover:no-underline"
        >
          Yardım merkezi
        </Link>
      </p>
    </section>
  )
}

/**
 * The tear line, with true notches.
 *
 * Only the inner half of each notch is drawn: a half-disc in the page colour
 * that covers the card's own edge, outlined along its arc alone. The card's
 * border appears to dip into the ticket, instead of a full circle sitting on
 * top of the edge. In print the notches go; the dashed line stays as the fold.
 */
function Perforation() {
  return (
    <div className="relative h-6 md:h-auto md:w-6 md:shrink-0" aria-hidden="true">
      {/* Across the pass, on a phone. */}
      <span className="absolute top-0 -left-px h-6 w-3 rounded-r-full border border-s-0 border-border bg-bg md:hidden print:hidden" />
      <span className="absolute top-0 -right-px h-6 w-3 rounded-l-full border border-e-0 border-border bg-bg md:hidden print:hidden" />
      <span className="absolute inset-x-5 top-1/2 border-t border-dashed border-border-strong md:hidden" />
      {/* Down the pass, from `md` up. */}
      <span className="absolute -top-px left-0 hidden h-3 w-6 rounded-b-full border border-t-0 border-border bg-bg md:block print:hidden" />
      <span className="absolute -bottom-px left-0 hidden h-3 w-6 rounded-t-full border border-b-0 border-border bg-bg md:block print:hidden" />
      <span className="absolute inset-y-5 left-1/2 hidden border-s border-dashed border-border-strong md:block" />
    </div>
  )
}

function TicketNotFound() {
  return (
    <>
      <PageHeader
        title="Bilet bulunamadı"
        lead="Bu PNR koduna ait bir bilet kaydı yok. Kodu kontrol edip yeniden sorgulayabilirsiniz."
        breadcrumbs={[{ label: 'Bilet Sorgula', to: '/bilet-sorgula' }]}
      />
      <div className="app-container section-y">
        <div className="mx-auto max-w-md text-center">
          <span
            className="mx-auto grid size-16 place-items-center rounded-full bg-surface-sunken text-fg-subtle"
            aria-hidden="true"
          >
            <Search className="size-7" />
          </span>
          <h2 className="mt-5 font-display text-xl font-semibold text-balance-tr text-fg">
            Aradığınız bilete ulaşamadık
          </h2>
          <p className="mt-3 text-sm text-fg-secondary">
            PNR kodu 6 karakterden oluşur ve yalnızca harf ile rakam içerir. Kodu onay e-postanızdan
            kontrol edip tekrar deneyin.
          </p>
          <div className="mt-7 flex flex-col items-stretch gap-3 xs:flex-row xs:justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link to="/bilet-sorgula">
                <Search className="size-4" aria-hidden="true" />
                Bilet sorgula
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/">Ana sayfa</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
