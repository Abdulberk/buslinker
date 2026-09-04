import { useEffect } from 'react'
import { Hero } from '@/widgets/home/Hero'
import { PopularRoutes } from '@/widgets/home/PopularRoutes'
import { Campaigns } from '@/widgets/home/Campaigns'
import { PopularDestinations } from '@/widgets/home/PopularDestinations'
import { ValueProps } from '@/widgets/home/ValueProps'
import { OperatorStrip } from '@/widgets/home/OperatorStrip'
import { PopularTerminals } from '@/widgets/home/PopularTerminals'

export default function HomePage() {
  useEffect(() => {
    document.title = 'BusLinker — Otobüs Bileti Al'
  }, [])

  return (
    <>
      <Hero />

      <section className="app-container section-y" aria-labelledby="populer-seferler">
        <PopularRoutes />
      </section>

      <section
        className="app-container border-t border-border section-y"
        aria-labelledby="kampanyalar"
      >
        <Campaigns />
      </section>

      {/* Two sections share this tinted band; the inset rule between them keeps
          the rhythm readable without a third background value. */}
      <div className="border-y border-border bg-bg-alt">
        <section className="app-container section-y" aria-labelledby="populer-destinasyonlar">
          <PopularDestinations />
        </section>
        <section
          className="app-container border-t border-border section-y"
          aria-labelledby="neden-buslinker"
        >
          <ValueProps />
        </section>
      </div>

      <section className="app-container section-y" aria-labelledby="anlasmali-firmalar">
        <OperatorStrip />
      </section>

      <section
        className="app-container border-t border-border section-y"
        aria-labelledby="populer-terminaller"
      >
        <PopularTerminals />
      </section>
    </>
  )
}
