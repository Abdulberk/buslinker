import { useEffect, useMemo, type ComponentType, type SVGProps } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import {
  Ban,
  Bus,
  CircleCheck,
  CircleSlash,
  Copy,
  IdCard,
  Printer,
  Search,
  Clock,
} from 'lucide-react'
import { GenderMark } from '@/features/seat-map/SeatGlyph'
import { cityById } from '@/shared/api/catalog'
import {
  getTicket,
  ticketRoute,
  TICKET_STATUS_LABEL,
  type TicketStatus,
} from '@/shared/api/tickets'
import { formatDateLong, formatDuration, formatPrice, formatTime } from '@/shared/lib/tr'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { PageHeader } from '@/shared/ui/page-header'
import { VisuallyHidden } from '@/shared/ui/visually-hidden'

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

const GENDER_LABEL: Record<'M' | 'F', string> = { M: 'Erkek', F: 'Kadın' }

function terminalName(cityId: string, terminalId: string): string {
  const city = cityById(cityId)
  return city?.terminals.find((t) => t.id === terminalId)?.name ?? city?.name ?? ''
}

export default function TicketDetailPage() {
  const { pnr = '' } = useParams<{ pnr: string }>()
  const ticket = useMemo(() => getTicket(pnr), [pnr])

  useEffect(() => {
    document.title = ticket ? 'Biletiniz | BusLinker' : 'Bilet bulunamadı | BusLinker'
  }, [ticket])

  if (!ticket) {
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
              PNR kodu 6 karakterden oluşur ve yalnızca harf ile rakam içerir. Kodu onay
              e-postanızdan kontrol edip tekrar deneyin.
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

  const { trip } = ticket
  const { from, to, operator } = ticketRoute(ticket)
  const status = STATUS_ART[ticket.status]
  const StatusIcon = status.Icon
  const operatorName = operator?.name ?? 'Otobüs firması'

  const handleCopy = async () => {
    // A page served without a secure context has no clipboard at all, so the
    // capability is checked rather than assumed and the failure is honest.
    if (typeof navigator.clipboard?.writeText !== 'function') {
      toast.error('PNR kodu kopyalanamadı.', {
        description: 'Tarayıcınız kopyalamayı desteklemiyor. Kodu elle not alabilirsiniz.',
      })
      return
    }
    try {
      await navigator.clipboard.writeText(ticket.pnr)
      toast.success('PNR kodu kopyalandı.')
    } catch {
      toast.error('PNR kodu kopyalanamadı.', {
        description: 'Kodu elle not alabilirsiniz.',
      })
    }
  }

  return (
    <>
      <PageHeader
        title="Biletiniz"
        breadcrumbs={[{ label: 'Bilet Sorgula', to: '/bilet-sorgula' }]}
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              window.print()
            }}
          >
            <Printer className="size-4" aria-hidden="true" />
            Yazdır
          </Button>
        }
      />

      <div className="app-container section-y">
        <Card className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4 sm:p-6">
            <div className="flex min-w-0 items-center gap-3">
              <OperatorLogo operatorId={trip.operatorId} className="size-14" />
              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold text-fg">
                  {operatorName}
                </p>
                <p className="text-xs text-fg-muted">Elektronik otobüs bileti</p>
              </div>
            </div>
            <Badge tone={status.tone} size="md" className="ms-auto">
              <StatusIcon aria-hidden="true" />
              {TICKET_STATUS_LABEL[ticket.status]}
            </Badge>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-secondary">
              <span className="font-medium text-fg">
                {from?.name ?? '—'} — {to?.name ?? '—'}
              </span>
              <span className="text-fg-muted" data-numeric>
                {formatDateLong(trip.departsAt)}
              </span>
            </div>

            <div className="mt-4 flex items-start gap-2 sm:gap-5">
              <div className="min-w-16 flex-1">
                <p className="font-display text-2xl font-semibold text-fg sm:text-3xl" data-numeric>
                  {formatTime(trip.departsAt)}
                </p>
                <p className="mt-1 text-sm font-medium text-fg-secondary">{from?.name ?? '—'}</p>
                <p className="text-xs text-fg-muted">
                  {terminalName(trip.fromCityId, trip.fromTerminalId)}
                </p>
              </div>

              <div className="w-16 shrink-0 pt-1 sm:w-28">
                <p className="mb-1.5 text-center text-xs font-medium text-fg-muted" data-numeric>
                  {formatDuration(trip.durationMin)}
                </p>
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="size-2 shrink-0 rounded-full ring-2 ring-border-strong ring-inset" />
                  <span className="h-px flex-1 bg-border-strong" />
                  <Bus className="size-4 shrink-0 text-fg-muted" />
                  <span className="h-px flex-1 bg-border-strong" />
                  <span className="size-2 shrink-0 rounded-full bg-border-strong" />
                </div>
              </div>

              <div className="min-w-16 flex-1 text-end">
                <p className="font-display text-2xl font-semibold text-fg sm:text-3xl">
                  <span data-numeric>{formatTime(trip.arrivesAt)}</span>
                  {trip.overnight ? (
                    <sup className="ms-0.5 text-2xs font-bold text-warning-fg">
                      +1
                      <VisuallyHidden> ertesi gün varış</VisuallyHidden>
                    </sup>
                  ) : null}
                </p>
                <p className="mt-1 text-sm font-medium text-fg-secondary">{to?.name ?? '—'}</p>
                <p className="text-xs text-fg-muted">
                  {terminalName(trip.toCityId, trip.toTerminalId)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border-strong bg-surface-sunken p-4">
              <div className="min-w-0">
                <p className="text-xs font-medium text-fg-muted">PNR kodu</p>
                {/* Letter-spacing is set here rather than through a utility: the
                    type scale bakes its own tracking in, and a boarding code has
                    to be read one character at a time. */}
                <p
                  className="mt-1 font-display text-2xl font-bold text-fg sm:text-3xl"
                  style={{ letterSpacing: '0.28em' }}
                  data-numeric
                >
                  {ticket.pnr}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="tap-44"
                onClick={() => {
                  void handleCopy()
                }}
              >
                <Copy className="size-4" aria-hidden="true" />
                Kopyala
                <VisuallyHidden> — PNR kodunu panoya kopyalayın</VisuallyHidden>
              </Button>
            </div>
          </div>

          <Perforation />

          <section aria-labelledby="passengers-title" className="p-4 sm:p-6">
            <h2 id="passengers-title" className="font-display text-base font-semibold text-fg">
              Yolcular
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-76 text-sm">
                <caption className="sr-only">
                  Bu bilete kayıtlı yolcular ve koltuk numaraları
                </caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="pb-2 text-start text-xs font-medium text-fg-muted">
                      Ad Soyad
                    </th>
                    <th scope="col" className="pb-2 text-start text-xs font-medium text-fg-muted">
                      Koltuk
                    </th>
                    <th scope="col" className="pb-2 text-start text-xs font-medium text-fg-muted">
                      Cinsiyet
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.passengers.map((passenger) => (
                    <tr key={passenger.seat} className="border-b border-border last:border-b-0">
                      <th scope="row" className="py-3 text-start font-medium text-fg">
                        {passenger.fullName}
                      </th>
                      <td className="py-3">
                        <span
                          className="inline-flex min-w-8 justify-center rounded-md bg-surface-sunken px-2 py-0.5 font-semibold text-fg"
                          data-numeric
                        >
                          {passenger.seat}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5 text-fg-secondary">
                          <GenderMark gender={passenger.gender} />
                          {GENDER_LABEL[passenger.gender]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="fare-title" className="border-t border-border p-4 sm:p-6">
            <h2 id="fare-title" className="font-display text-base font-semibold text-fg">
              Ücret dökümü
            </h2>
            <dl className="mt-3 flex flex-col gap-2.5">
              {ticket.passengers.map((passenger) => (
                <div key={passenger.seat} className="flex items-baseline justify-between gap-4">
                  <dt className="min-w-0 text-sm text-fg-secondary">
                    {passenger.fullName}
                    <span className="text-fg-muted" data-numeric>
                      {` · ${passenger.seat}. koltuk`}
                    </span>
                  </dt>
                  <dd className="shrink-0 text-sm font-medium text-fg" data-numeric>
                    {formatPrice(trip.price)}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-border pt-4">
              <span className="text-base font-semibold text-fg">Toplam</span>
              <span className="font-display text-xl font-bold text-fg sm:text-2xl" data-numeric>
                {formatPrice(ticket.total)}
              </span>
            </div>
          </section>

          <section
            aria-labelledby="notes-title"
            className="rounded-b-xl border-t border-border bg-surface-sunken p-4 sm:p-6"
          >
            <h2 id="notes-title" className="font-display text-base font-semibold text-fg">
              Yolculuk öncesi
            </h2>
            <ul className="mt-3 flex flex-col gap-3 text-sm text-fg-secondary">
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden="true" />
                Kalkıştan en az 15 dakika önce peronda hazır bulunun.
              </li>
              <li className="flex gap-2.5">
                <IdCard className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden="true" />
                Yanınızda fotoğraflı kimlik belgenizi bulundurun; kontrolde istenebilir.
              </li>
              <li className="flex gap-2.5">
                <CircleSlash className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden="true" />
                {ticket.refundable
                  ? 'İptal işlemini kalkış saatinden 3 saat öncesine kadar çevrim içi yapabilirsiniz.'
                  : 'Bu bilet çevrim içi iptale kapalıdır; iptal için firmanın çağrı merkezine başvurmanız gerekir.'}
              </li>
            </ul>

            {ticket.refundable ? (
              <Button variant="secondary" size="md" asChild className="mt-5">
                <Link to={`/bilet-iptal?pnr=${ticket.pnr}`}>Bileti iptal edin</Link>
              </Button>
            ) : null}

            <p className="mt-5 text-xs text-fg-muted">
              Bu sayfa BusLinker tanıtım sürümüne aittir; gösterilen bilet örnek verilerle
              oluşturulmuştur.
            </p>
          </section>
        </Card>
      </div>
    </>
  )
}

/**
 * The tear line.
 *
 * Two circles filled with the page background sit centred on the card's own
 * edges, so they punch through the border and read as a perforation rather
 * than as one more horizontal rule.
 */
function Perforation() {
  return (
    <div className="relative h-6" aria-hidden="true">
      <span className="absolute top-1/2 left-0 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-bg" />
      <span className="absolute top-1/2 right-0 size-6 translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-bg" />
      <span className="absolute inset-x-6 top-1/2 border-t border-dashed border-border-strong" />
    </div>
  )
}
