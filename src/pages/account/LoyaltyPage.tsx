import { useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import { Award, Coins, Crown, Medal, Sparkles, TicketCheck } from 'lucide-react'
import { cityById } from '@/shared/api/catalog'
import { demoTickets, TICKET_STATUS_LABEL, type Ticket } from '@/shared/api/tickets'
import { formatDateMedium, formatPrice, pluralTr } from '@/shared/lib/tr'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { cn } from '@/shared/lib/cn'

/** Ten points for every full 100 TL of a fare that was actually travelled. */
const POINTS_PER_100_TL = 10

interface Tier {
  readonly id: 'blue' | 'silver' | 'gold'
  readonly name: string
  readonly min: number
  readonly Icon: typeof Sparkles
  readonly perk: string
}

const TIERS = [
  {
    id: 'blue',
    name: 'Mavi',
    min: 0,
    Icon: Sparkles,
    perk: 'Her yolculukta puan kazanırsınız.',
  },
  {
    id: 'silver',
    name: 'Gümüş',
    min: 750,
    Icon: Medal,
    perk: 'Öncelikli koltuk seçimi ve ücretsiz tarih değişikliği.',
  },
  {
    id: 'gold',
    name: 'Altın',
    min: 2000,
    Icon: Crown,
    perk: 'Kalkışa iki saat kalana kadar ücretsiz iptal ve çağrı merkezinde öncelik.',
  },
] as const satisfies readonly Tier[]

/**
 * A cancelled journey earns nothing: showing points for a fare that was
 * refunded would make the balance impossible to reconcile with the table
 * underneath it.
 */
function pointsFor(ticket: Ticket): number {
  if (ticket.status === 'cancelled') return 0
  return Math.floor(ticket.total / 100) * POINTS_PER_100_TL
}

export default function LoyaltyPage() {
  useEffect(() => {
    document.title = 'Yolculuk Puanlarım | BusLinker'
  }, [])

  const rows = useMemo(
    () =>
      [...demoTickets()]
        .sort((a, b) => b.trip.departsAt.localeCompare(a.trip.departsAt))
        .map((ticket) => ({ ticket, points: pointsFor(ticket) })),
    [],
  )

  const points = rows.reduce((sum, row) => sum + row.points, 0)

  // `TIERS` is a tuple, so the first entry is never `undefined` — the fallback
  // is only there for the balance below the lowest threshold.
  const current = TIERS.filter((tier) => points >= tier.min).at(-1) ?? TIERS[0]
  const next = TIERS.find((tier) => tier.min > points)

  const remaining = next ? next.min - points : 0
  const span = next ? next.min - current.min : 0
  const progress =
    next && span > 0 ? Math.min(100, Math.round(((points - current.min) / span) * 100)) : 100

  const valueText = next
    ? `${next.name} seviyesine ${pluralTr(remaining, 'puan')} kaldı`
    : `En üst seviyedesiniz: ${current.name}`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-bold text-fg">Yolculuk Puanlarım</h2>
        <p className="text-sm text-fg-secondary">
          Bu tablo örnek amaçlıdır: tanıtım hesabındaki biletlerin her 100 TL&apos;si için 10 puan
          sayılarak hesaplanmıştır, yürürlükte olan bir sadakat programı değildir.
        </p>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start gap-4">
            <span
              aria-hidden="true"
              className="grid size-12 shrink-0 place-items-center rounded-full bg-brand/8 text-brand-fg"
            >
              <Coins className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-fg-muted">Puan bakiyeniz</p>
              <p className="mt-0.5 font-display text-3xl font-bold text-fg" data-numeric>
                {pluralTr(points, 'puan')}
              </p>
            </div>
            <Badge tone="brand" size="md" className="mt-1">
              <current.Icon aria-hidden="true" />
              {current.name} seviye
            </Badge>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-sm font-medium text-fg">{valueText}</p>
              <p className="text-xs text-fg-muted" data-numeric>
                {next
                  ? `${pluralTr(points, 'puan')} / ${pluralTr(next.min, 'puan')}`
                  : pluralTr(points, 'puan')}
              </p>
            </div>

            <div
              role="progressbar"
              aria-valuenow={points}
              aria-valuemin={current.min}
              aria-valuemax={next ? next.min : points}
              aria-valuetext={valueText}
              aria-label="Sonraki seviyeye ilerleme"
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-sunken"
            >
              <div
                aria-hidden="true"
                className="h-full rounded-full bg-brand transition-[width] duration-(--duration-slow) ease-standard"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-fg-muted">
              {next
                ? `${next.name} seviyede: ${next.perk}`
                : 'Tüm seviye avantajları hesabınızda açık.'}
            </p>
          </div>
        </CardBody>
      </Card>

      <section aria-labelledby="tiers-title" className="flex flex-col gap-4">
        <h3 id="tiers-title" className="font-display text-lg font-bold text-fg">
          Seviyeler
        </h3>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TIERS.map((tier) => {
            const isCurrent = tier.id === current.id
            const reached = points >= tier.min

            return (
              <li key={tier.id}>
                <Card
                  className={cn('h-full', isCurrent && 'border-brand/40 ring-1 ring-brand/25')}
                  {...(isCurrent && { 'aria-current': 'true' })}
                >
                  <CardBody className="flex h-full flex-col gap-2">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'grid size-9 place-items-center rounded-lg',
                        isCurrent
                          ? 'bg-brand/8 text-brand-fg'
                          : 'bg-surface-sunken text-fg-secondary',
                      )}
                    >
                      <tier.Icon className="size-4" />
                    </span>

                    <p className="font-display text-base font-bold text-fg">{tier.name}</p>

                    <p className="text-xs text-fg-muted" data-numeric>
                      {tier.min === 0
                        ? 'Başlangıç seviyesi'
                        : `${pluralTr(tier.min, 'puan')} ve üzeri`}
                    </p>

                    {/* Never colour alone: the current tier is named in words
                        and carries its own glyph. */}
                    {isCurrent ? (
                      <Badge tone="brand" className="self-start">
                        <Award aria-hidden="true" />
                        Mevcut seviyeniz
                      </Badge>
                    ) : reached ? (
                      <Badge tone="neutral" className="self-start">
                        Tamamlandı
                      </Badge>
                    ) : (
                      <Badge tone="outline" className="self-start">
                        Henüz ulaşılmadı
                      </Badge>
                    )}

                    <p className="mt-auto pt-2 text-sm text-fg-secondary">{tier.perk}</p>
                  </CardBody>
                </Card>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="history-title" className="flex flex-col gap-4">
        <h3 id="history-title" className="font-display text-lg font-bold text-fg">
          Puan geçmişi
        </h3>

        {rows.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-lg border-collapse text-left">
                <caption className="sr-only">
                  Tanıtım hesabındaki biletler ve her birinden kazanılan puanlar
                </caption>
                <thead>
                  <tr className="border-b border-border bg-surface-sunken">
                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-fg-secondary">
                      Tarih
                    </th>
                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-fg-secondary">
                      Sefer
                    </th>
                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-fg-secondary">
                      Durum
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-semibold text-fg-secondary"
                    >
                      Tutar
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-semibold text-fg-secondary"
                    >
                      Puan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map(({ ticket, points: earned }) => {
                    const from = cityById(ticket.trip.fromCityId)
                    const to = cityById(ticket.trip.toCityId)

                    return (
                      <tr key={ticket.pnr}>
                        <td className="px-4 py-3 text-sm whitespace-nowrap text-fg-secondary">
                          <span data-numeric>{formatDateMedium(ticket.trip.departsAt)}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-fg">
                          <Link
                            to={`/bilet/${ticket.pnr}`}
                            className="font-medium text-brand-fg underline-offset-4 hover:underline"
                          >
                            {from?.name ?? '—'} – {to?.name ?? '—'}
                          </Link>
                          <span className="block font-mono text-xs text-fg-muted" data-numeric>
                            {ticket.pnr}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap text-fg-muted">
                          {TICKET_STATUS_LABEL[ticket.status]}
                        </td>
                        <td
                          className="px-4 py-3 text-right text-sm whitespace-nowrap text-fg-secondary"
                          data-numeric
                        >
                          {formatPrice(ticket.total)}
                        </td>
                        <td
                          className="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap text-fg"
                          data-numeric
                        >
                          {earned > 0 ? `+${pluralTr(earned, 'puan')}` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border-strong">
                    <th scope="row" colSpan={4} className="px-4 py-3 text-sm font-semibold text-fg">
                      Toplam
                    </th>
                    <td
                      className="px-4 py-3 text-right text-sm font-bold whitespace-nowrap text-fg"
                      data-numeric
                    >
                      {pluralTr(points, 'puan')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        ) : (
          <Card>
            <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center rounded-full bg-surface-sunken text-fg-muted"
              >
                <TicketCheck className="size-6" />
              </span>
              <p className="font-display text-base font-bold text-fg">Henüz puan kazanmadınız</p>
              <p className="max-w-sm text-sm text-fg-secondary">
                İlk yolculuğunuzu tamamladığınızda kazandığınız puanlar burada listelenir.
              </p>
              <Button asChild size="lg" className="mt-2">
                <Link to="/">Sefer arayın</Link>
              </Button>
            </CardBody>
          </Card>
        )}

        <p className="text-xs text-fg-muted">
          İptal edilen biletler puan kazandırmaz. Puanlar seferin tamamlanmasının ardından
          hesabınıza işlenir.
        </p>
      </section>
    </div>
  )
}
