import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { CircleAlert, CircleCheck, Info, Search, Ticket } from 'lucide-react'
import { DEFAULT_POLICY, type SeatPick } from '@/entities/seat/model'
import { quote } from '@/entities/seat/rules'
import { useBookingStore } from '@/features/booking/store'
import { OrderSummary } from '@/features/checkout/OrderSummary'
import { seatMapQuery, tripQuery } from '@/shared/api/queries'
import { createRng } from '@/shared/lib/rng'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

/**
 * The confirmation step.
 *
 * Nothing was sold here, and the page says so in as many words. The PNR is
 * derived from the trip id rather than drawn at random, so a refresh — or a
 * link sent to someone else — shows the same code instead of inventing a
 * second booking.
 */

/** No I, O, 0 or 1: a code people read aloud should not have look-alikes. */
const PNR_ALPHABET = [...'ABCDEFGHJKLMNPQRSTUVWXYZ23456789']
const PNR_LENGTH = 6

function demoPnr(tripId: string): string {
  const rng = createRng(`checkout-pnr:${tripId}`)
  return Array.from({ length: PNR_LENGTH }, () => rng.pick(PNR_ALPHABET)).join('')
}

export default function CheckoutSuccessPage() {
  const { tripId = '' } = useParams<{ tripId: string }>()

  // The draft is read into local state BEFORE it is cleared, or the page would
  // render its own order as empty one tick after mounting.
  const [picks] = useState<readonly SeatPick[]>(() => useBookingStore.getState().picks)
  const clearDraft = useBookingStore((s) => s.clear)

  const enabled = tripId !== ''
  const tripResult = useQuery({ ...tripQuery(tripId), enabled })
  const seatMapResult = useQuery({ ...seatMapQuery(tripId), enabled })
  const trip = tripResult.data
  const seatMap = seatMapResult.data

  const pnr = useMemo(() => demoPnr(tripId), [tripId])
  const currentQuote = useMemo(
    () => quote(picks, seatMap?.policy ?? DEFAULT_POLICY),
    [picks, seatMap?.policy],
  )

  useEffect(() => {
    document.title = 'Rezervasyon Onayı | BusLinker'
  }, [])

  // Clearing the draft is what stops the same seats from being submitted a
  // second time by going back.
  useEffect(() => {
    clearDraft()
  }, [clearDraft])

  if (!enabled) return <Navigate to="/" replace />

  const header = (
    <PageHeader
      title="Tanıtım Rezervasyonunuz Oluşturuldu"
      lead="Bu bir tanıtım kaydıdır: sizden ödeme alınmadı ve gerçek bir bilet düzenlenmedi."
      breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
    />
  )

  if (tripResult.isError || seatMapResult.isError) {
    return (
      <>
        {header}
        <div className="app-container section-y">
          <div className="mx-auto max-w-md text-center">
            <span
              className="mx-auto grid size-16 place-items-center rounded-full bg-surface-sunken text-fg-subtle"
              aria-hidden="true"
            >
              <CircleAlert className="size-7" />
            </span>
            <h2 className="mt-5 font-display text-xl font-semibold text-balance-tr text-fg">
              Sefer bilgilerine ulaşamadık
            </h2>
            <p className="mt-3 text-sm text-fg-secondary">
              Rezervasyon kodunuz{' '}
              <strong className="font-display font-semibold text-fg" data-numeric>
                {pnr}
              </strong>
              . Sefer ayrıntılarını bilet sayfasından görüntüleyebilirsiniz.
            </p>
            <div className="mt-7 flex flex-col items-stretch gap-3 xs:flex-row xs:justify-center">
              <Button variant="primary" size="lg" asChild>
                <Link to={`/bilet/${pnr}`}>
                  <Ticket className="size-4" aria-hidden="true" />
                  Bileti görüntüleyin
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/">Sefer arayın</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!trip || !seatMap) {
    return (
      <>
        {header}
        <div className="app-container section-y" aria-busy="true">
          <span className="sr-only">Rezervasyon bilgileri yükleniyor</span>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-112 w-full rounded-xl" />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {header}

      <div className="app-container section-y">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <Card>
              <CardBody>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="grid size-12 shrink-0 place-items-center rounded-full bg-success-tint text-success-fg"
                    aria-hidden="true"
                  >
                    <CircleCheck className="size-7" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-xl font-semibold text-balance-tr text-fg">
                      Rezervasyonunuz tamamlandı
                    </h2>
                    <Badge tone="success" size="md" className="mt-1.5">
                      <CircleCheck aria-hidden="true" />
                      Tanıtım kaydı · ödeme alınmadı
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-dashed border-border-strong bg-surface-sunken p-4 text-center">
                  <p className="text-xs font-medium text-fg-muted">PNR kodunuz</p>
                  <p
                    className="mt-1 font-display text-3xl font-semibold text-fg tabular-nums"
                    data-numeric
                  >
                    {pnr}
                  </p>
                  <p className="mt-2 text-xs text-fg-muted">
                    Bileti sorgularken bu kodu ve yolcunun soyadını kullanabilirsiniz.
                  </p>
                </div>

                <p className="mt-4 flex gap-2.5 rounded-lg border border-info/25 bg-info-tint p-3.5 text-sm">
                  <Info className="mt-0.5 size-4 shrink-0 text-info-fg" aria-hidden="true" />
                  <span className="text-fg-secondary">
                    Bu ekran satın alma akışının son adımını gösterir. Gerçek bir satın alma
                    yapılmadığı için tutar tahsil edilmedi, bilet düzenlenmedi ve e-posta
                    gönderilmedi.
                  </span>
                </p>

                <div className="mt-6 flex flex-col items-stretch gap-3 xs:flex-row xs:flex-wrap">
                  <Button variant="primary" size="lg" asChild>
                    <Link to={`/bilet/${pnr}`}>
                      <Ticket className="size-4" aria-hidden="true" />
                      Bileti Görüntüleyin
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" asChild>
                    <Link to="/hesabim/seferlerim">Seferlerim</Link>
                  </Button>
                  <Button variant="ghost" size="lg" asChild>
                    <Link to="/">
                      <Search className="size-4" aria-hidden="true" />
                      Yeni sefer arayın
                    </Link>
                  </Button>
                </div>
              </CardBody>
            </Card>

            <section
              aria-labelledby="next-steps-title"
              className="mt-6 rounded-xl border border-border bg-surface-sunken p-4 sm:p-5"
            >
              <h2 id="next-steps-title" className="font-display text-base font-semibold text-fg">
                Gerçek bir satın almada sırada ne olurdu?
              </h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-fg-secondary">
                <li className="flex gap-2">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                    aria-hidden="true"
                  />
                  Biletiniz, PNR kodunuz ve koltuk numaralarınızla birlikte iletişim adresinize
                  gönderilirdi.
                </li>
                <li className="flex gap-2">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                    aria-hidden="true"
                  />
                  Kalkıştan önce terminalde kimlik ibraz etmeniz yeterli olurdu; çıktı almanız
                  gerekmezdi.
                </li>
                <li className="flex gap-2">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                    aria-hidden="true"
                  />
                  Planınız değişirse bileti kalkış saatinden önce PNR kodunuzla iptal edebilirdiniz.
                </li>
              </ul>
            </section>
          </div>

          {picks.length > 0 ? (
            <OrderSummary trip={trip} picks={picks} quote={currentQuote} />
          ) : (
            <aside
              aria-labelledby="summary-missing-title"
              className="rounded-xl border border-border bg-surface-raised p-4 shadow-sm"
            >
              <h2 id="summary-missing-title" className="text-sm font-semibold text-fg">
                Sipariş özeti
              </h2>
              <p className="mt-2 text-sm text-fg-secondary">
                Rezervasyon tamamlandığı için seçim ayrıntıları bu ekranda tutulmuyor. Koltuk ve
                tutar bilgilerini bilet sayfasından görüntüleyebilirsiniz.
              </p>
              <Button variant="brand-outline" size="md" full asChild className="mt-4">
                <Link to={`/bilet/${pnr}`}>
                  <Ticket className="size-4" aria-hidden="true" />
                  Bilet ayrıntıları
                </Link>
              </Button>
            </aside>
          )}
        </div>
      </div>
    </>
  )
}
