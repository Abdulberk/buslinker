import { useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  Armchair,
  Bus,
  CalendarDays,
  PiggyBank,
  Receipt,
  TicketCheck,
} from 'lucide-react'
import { cityById, operatorById } from '@/shared/api/catalog'
import {
  demoTickets,
  pastTickets,
  ticketRoute,
  upcomingTickets,
  TICKET_STATUS_LABEL,
  type Ticket,
} from '@/shared/api/tickets'
import {
  formatDateLong,
  formatDateMedium,
  formatPrice,
  formatTime,
  pluralTr,
} from '@/shared/lib/tr'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { DEMO_USER } from './AccountLayout'

/**
 * The saving a real account would compute from the fares actually paid against
 * the carriers' counter prices. There is no such history here, so the figure
 * is derived from the demo ticket set — deterministic, so the number does not
 * change between two renders of the same page.
 */
function totalSaving(tickets: readonly Ticket[]): number {
  return tickets.reduce((sum, ticket) => sum + Math.round(ticket.total * 0.11), 0)
}

export default function AccountOverviewPage() {
  useEffect(() => {
    document.title = 'Genel Bakış | BusLinker'
  }, [])

  const upcoming = useMemo(() => upcomingTickets(), [])
  const past = useMemo(() => pastTickets(), [])
  const saving = useMemo(() => totalSaving(demoTickets()), [])

  const recent = useMemo(
    () => [...demoTickets()].sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt)).slice(0, 3),
    [],
  )

  const next = upcoming[0]

  const stats = [
    {
      id: 'upcoming',
      label: 'Yaklaşan sefer',
      value: pluralTr(upcoming.length, 'sefer'),
      Icon: TicketCheck,
    },
    {
      id: 'past',
      label: 'Tamamlanan yolculuk',
      value: pluralTr(past.length, 'yolculuk'),
      Icon: Bus,
    },
    {
      id: 'saving',
      label: 'Toplam tasarruf',
      value: formatPrice(saving),
      Icon: PiggyBank,
    },
  ]

  return (
    <div className="flex flex-col gap-10">
      <Card>
        <CardBody className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-full bg-brand/8 font-display text-lg font-bold text-brand-fg"
          >
            {DEMO_USER.initials}
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-fg">
              Merhaba, {DEMO_USER.fullName}
            </h2>
            <p className="mt-1 text-sm text-fg-secondary">{DEMO_USER.email}</p>
          </div>
          <Badge tone="outline" size="md" className="ms-auto">
            Tanıtım hesabı
          </Badge>
        </CardBody>
      </Card>

      <section aria-label="Hesap özeti">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <li key={stat.id}>
              <Card className="h-full">
                <CardBody className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-sunken text-fg-secondary"
                  >
                    <stat.Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-fg-muted">{stat.label}</span>
                    <span
                      className="mt-0.5 block font-display text-xl font-bold text-fg"
                      data-numeric
                    >
                      {stat.value}
                    </span>
                  </span>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="next-trip-title">
        <h3 id="next-trip-title" className="font-display text-lg font-bold text-fg">
          Yaklaşan seferiniz
        </h3>

        {next ? (
          <NextTripCard ticket={next} />
        ) : (
          <Card className="mt-4">
            <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center rounded-full bg-surface-sunken text-fg-muted"
              >
                <Bus className="size-6" />
              </span>
              <p className="font-display text-base font-bold text-fg">
                Planlanmış seferiniz bulunmuyor
              </p>
              <p className="max-w-sm text-sm text-fg-secondary">
                Gitmek istediğiniz şehri arayın, koltuğunuzu seçin; biletiniz burada görünsün.
              </p>
              <Button asChild size="lg" className="mt-2">
                <Link to="/">Sefer arayın</Link>
              </Button>
            </CardBody>
          </Card>
        )}
      </section>

      <section aria-labelledby="recent-title">
        <h3 id="recent-title" className="font-display text-lg font-bold text-fg">
          Son işlemler
        </h3>

        {recent.length > 0 ? (
          <Card className="mt-4 overflow-hidden">
            <ul className="divide-y divide-border">
              {recent.map((ticket) => (
                <li key={ticket.pnr}>
                  <RecentRow ticket={ticket} />
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card className="mt-4">
            <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center rounded-full bg-surface-sunken text-fg-muted"
              >
                <Receipt className="size-6" />
              </span>
              <p className="font-display text-base font-bold text-fg">Henüz bir işleminiz yok</p>
              <p className="max-w-sm text-sm text-fg-secondary">
                İlk biletinizi aldığınızda satın alma geçmişiniz burada listelenir.
              </p>
            </CardBody>
          </Card>
        )}
      </section>
    </div>
  )
}

function NextTripCard({ ticket }: { ticket: Ticket }) {
  const { from, to } = ticketRoute(ticket)
  const operator = operatorById(ticket.trip.operatorId)
  const seats = ticket.passengers.map((passenger) => passenger.seat).join(', ')

  return (
    <Card className="mt-4">
      <CardBody className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <OperatorLogo operatorId={ticket.trip.operatorId} />
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-fg">
              {operator?.name ?? 'Otobüs firması'}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-fg-muted">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatDateLong(ticket.trip.departsAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-fg" data-numeric>
              {formatTime(ticket.trip.departsAt)}
            </span>
            <span className="text-sm text-fg-secondary">{from?.name ?? '—'}</span>
          </p>
          <ArrowRight className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
          <p className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-fg" data-numeric>
              {formatTime(ticket.trip.arrivesAt)}
            </span>
            <span className="text-sm text-fg-secondary">{to?.name ?? '—'}</span>
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-fg-muted">PNR</dt>
            <dd className="mt-1">
              <span
                className="inline-flex rounded-md bg-surface-sunken px-2 py-0.5 font-mono text-sm font-semibold text-fg"
                data-numeric
              >
                {ticket.pnr}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">Koltuk</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm text-fg" data-numeric>
              <Armchair className="size-4 text-fg-muted" aria-hidden="true" />
              {seats}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">Yolcu</dt>
            <dd className="mt-1 text-sm text-fg" data-numeric>
              {pluralTr(ticket.passengers.length, 'yolcu')}
            </dd>
          </div>
        </dl>

        <Button asChild size="lg" className="self-start">
          <Link to={`/bilet/${ticket.pnr}`}>Bileti Görüntüle</Link>
        </Button>
      </CardBody>
    </Card>
  )
}

function RecentRow({ ticket }: { ticket: Ticket }) {
  const from = cityById(ticket.trip.fromCityId)
  const to = cityById(ticket.trip.toCityId)

  return (
    <Link
      to={`/bilet/${ticket.pnr}`}
      className="flex min-h-11 items-center gap-3 p-4 transition-colors duration-(--duration-fast) hover:bg-surface-sunken sm:px-6"
    >
      <OperatorLogo operatorId={ticket.trip.operatorId} className="size-9" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg">
          {from?.name ?? '—'} – {to?.name ?? '—'}
        </span>
        <span className="block text-xs text-fg-muted">
          <span data-numeric>{formatDateMedium(ticket.purchasedAt)}</span>
          {' · '}
          {TICKET_STATUS_LABEL[ticket.status]}
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold text-fg" data-numeric>
        {formatPrice(ticket.total)}
      </span>
      <ArrowRight className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
    </Link>
  )
}
