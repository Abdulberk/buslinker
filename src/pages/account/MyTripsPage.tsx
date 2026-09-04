import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Ban, Bus, CircleCheck, CircleX, Clock, History, Users } from 'lucide-react'
import { cityById, operatorById } from '@/shared/api/catalog'
import {
  pastTickets,
  upcomingTickets,
  TICKET_STATUS_LABEL,
  type Ticket,
  type TicketStatus,
} from '@/shared/api/tickets'
import { formatDateLong, formatPrice, formatTime, pluralTr } from '@/shared/lib/tr'
import { Badge, type BadgeProps } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/primitives'

type TabId = 'upcoming' | 'past'

/**
 * Status carries meaning, so each one gets its own glyph as well as its own
 * tone — a red pill and a green pill are the same pill to a colour-blind
 * reader, and to anyone printing the page.
 */
const STATUS_STYLE: Record<TicketStatus, { tone: BadgeProps['tone']; Icon: typeof CircleCheck }> = {
  confirmed: { tone: 'success', Icon: CircleCheck },
  used: { tone: 'neutral', Icon: Clock },
  cancelled: { tone: 'danger', Icon: CircleX },
}

export default function MyTripsPage() {
  useEffect(() => {
    document.title = 'Seferlerim | BusLinker'
  }, [])

  const [tab, setTab] = useState<TabId>('upcoming')

  const upcoming = useMemo(() => upcomingTickets(), [])
  const past = useMemo(() => pastTickets(), [])
  const tickets = tab === 'upcoming' ? upcoming : past

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-bold text-fg">Seferlerim</h2>

      <div className="flex flex-col gap-3">
        <ToggleGroup
          type="single"
          value={tab}
          // Radix allows deselecting the active item, which would leave the
          // list with no tab at all; an empty value keeps the current one.
          onValueChange={(value: string) => {
            if (value === 'upcoming' || value === 'past') setTab(value)
          }}
          aria-label="Sefer listesi filtresi"
          className="flex flex-wrap gap-2"
        >
          <ToggleGroupItem value="upcoming">Yaklaşan</ToggleGroupItem>
          <ToggleGroupItem value="past">Geçmiş</ToggleGroupItem>
        </ToggleGroup>

        <p role="status" className="text-sm text-fg-muted">
          <span data-numeric>{pluralTr(tickets.length, 'sefer')}</span> listeleniyor
        </p>
      </div>

      {tickets.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {tickets.map((ticket) => (
            <li key={ticket.pnr}>
              <TicketCard ticket={ticket} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyTab tab={tab} />
      )}
    </div>
  )
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const { trip } = ticket
  const operator = operatorById(trip.operatorId)
  const fromCity = cityById(trip.fromCityId)
  const toCity = cityById(trip.toCityId)
  const fromTerminal = fromCity?.terminals.find((terminal) => terminal.id === trip.fromTerminalId)
  const toTerminal = toCity?.terminals.find((terminal) => terminal.id === trip.toTerminalId)
  const status = STATUS_STYLE[ticket.status]

  return (
    <Card>
      <CardBody className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start gap-3">
          <OperatorLogo operatorId={trip.operatorId} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-bold text-fg">
              {operator?.name ?? 'Otobüs firması'}
            </p>
            <p className="text-xs text-fg-muted" data-numeric>
              {formatDateLong(trip.departsAt)}
            </p>
          </div>
          <Badge tone={status.tone} size="md">
            <status.Icon aria-hidden="true" />
            {TICKET_STATUS_LABEL[ticket.status]}
          </Badge>
        </div>

        <div className="flex flex-col gap-3 xs:flex-row xs:items-start xs:gap-4">
          <div className="min-w-0 xs:flex-1">
            <p className="text-lg font-semibold text-fg" data-numeric>
              {formatTime(trip.departsAt)}
            </p>
            <p className="text-sm text-fg-secondary">{fromCity?.name ?? '—'}</p>
            <p className="text-xs text-fg-muted">{fromTerminal?.name ?? 'Terminal bilgisi yok'}</p>
          </div>

          <ArrowRight
            className="size-4 shrink-0 rotate-90 text-fg-subtle xs:mt-2 xs:rotate-0"
            aria-hidden="true"
          />

          <div className="min-w-0 xs:flex-1">
            <p className="text-lg font-semibold text-fg" data-numeric>
              {formatTime(trip.arrivesAt)}
            </p>
            <p className="text-sm text-fg-secondary">{toCity?.name ?? '—'}</p>
            <p className="text-xs text-fg-muted">{toTerminal?.name ?? 'Terminal bilgisi yok'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4">
          <span className="flex items-center gap-1.5 text-sm text-fg-secondary">
            <Users className="size-4 text-fg-muted" aria-hidden="true" />
            <span data-numeric>{pluralTr(ticket.passengers.length, 'yolcu')}</span>
          </span>

          <span className="flex items-center gap-1.5 text-sm text-fg-secondary">
            <span className="text-fg-muted">PNR</span>
            <span
              className="rounded-md bg-surface-sunken px-2 py-0.5 font-mono text-sm font-semibold text-fg"
              data-numeric
            >
              {ticket.pnr}
            </span>
          </span>

          <span className="ms-auto text-base font-semibold text-fg" data-numeric>
            {formatPrice(ticket.total)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Every card carries the same action, so none of them may take the
              solid brand fill — that is reserved for a single page decision. */}
          <Button asChild variant="brand-outline">
            <Link to={`/bilet/${ticket.pnr}`}>Bileti Görüntüle</Link>
          </Button>

          {ticket.refundable ? (
            <Button asChild variant="secondary">
              <Link to={`/bilet-iptal?pnr=${ticket.pnr}`}>
                <Ban className="size-4" aria-hidden="true" />
                İptal Et
              </Link>
            </Button>
          ) : null}
        </div>
      </CardBody>
    </Card>
  )
}

function EmptyTab({ tab }: { tab: TabId }) {
  const upcoming = tab === 'upcoming'

  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full bg-surface-sunken text-fg-muted"
        >
          {upcoming ? <Bus className="size-6" /> : <History className="size-6" />}
        </span>
        <p className="font-display text-base font-bold text-fg">
          {upcoming ? 'Yaklaşan seferiniz bulunmuyor' : 'Geçmiş seferiniz bulunmuyor'}
        </p>
        <p className="max-w-sm text-sm text-fg-secondary">
          {upcoming
            ? 'Yeni bir bilet aldığınızda sefer bilgileriniz, koltuklarınız ve PNR kodunuz bu listede yer alır.'
            : 'Tamamladığınız ve iptal ettiğiniz seferler yolculuğunuzun ardından burada listelenir.'}
        </p>
        {upcoming ? (
          <Button asChild size="lg" className="mt-2">
            <Link to="/">Sefer arayın</Link>
          </Button>
        ) : null}
      </CardBody>
    </Card>
  )
}
