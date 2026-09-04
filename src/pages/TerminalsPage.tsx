import { useEffect } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '@/shared/ui/page-header'
import { Illustration } from '@/shared/ui/asset-icon'
import { BRAND } from '@/shared/config/assets'
import { CITIES, type City, type Terminal } from '@/shared/api/catalog'
import { compareTr, pluralTr, slugifyTr } from '@/shared/lib/tr'

interface TerminalEntry {
  readonly city: City
  readonly terminal: Terminal
}

interface RegionGroup {
  readonly region: string
  readonly anchor: string
  readonly entries: readonly TerminalEntry[]
}

/** Built once: the catalogue is static, so regrouping it per render buys nothing. */
const REGIONS: readonly RegionGroup[] = (() => {
  const byRegion = new Map<string, TerminalEntry[]>()

  for (const city of CITIES) {
    for (const terminal of city.terminals) {
      const entries = byRegion.get(city.region) ?? []
      entries.push({ city, terminal })
      byRegion.set(city.region, entries)
    }
  }

  return [...byRegion.entries()]
    .map(([region, entries]) => ({
      region,
      anchor: `bolge-${slugifyTr(region)}`,
      entries: entries.sort(
        (a, b) =>
          compareTr(a.city.name, b.city.name) || compareTr(a.terminal.name, b.terminal.name),
      ),
    }))
    .sort((a, b) => compareTr(a.region, b.region))
})()

const TERMINAL_COUNT = REGIONS.reduce((total, group) => total + group.entries.length, 0)

export default function TerminalsPage() {
  useEffect(() => {
    document.title = 'Otogarlar | BusLinker'
  }, [])

  return (
    <>
      <PageHeader
        title="Otogarlar"
        lead="BusLinker’da sefer bulabileceğiniz otogarları bölgelere göre listeledik. Kalkış yapmak istediğiniz otogarı seçerek oradan giden seferlere göz atabilirsiniz."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <p className="text-sm text-fg-muted">
          {pluralTr(REGIONS.length, 'bölgede')} toplam {pluralTr(TERMINAL_COUNT, 'otogar')}{' '}
          listeleniyor.
        </p>

        <nav aria-label="Bölgeye git" className="mt-4">
          <ul className="flex flex-wrap gap-2">
            {REGIONS.map((group) => (
              <li key={group.anchor}>
                <a
                  href={`#${group.anchor}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-fg-secondary transition-colors duration-(--duration-fast) hover:border-brand/40 hover:bg-brand/8 hover:text-brand-fg"
                >
                  {group.region}
                  <span className="text-xs text-fg-muted" data-numeric>
                    {group.entries.length}
                  </span>
                  <span className="sr-only">otogar</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 flex flex-col gap-10 sm:mt-12 sm:gap-12">
          {REGIONS.map((group) => (
            <section key={group.anchor} aria-labelledby={group.anchor}>
              <h2
                id={group.anchor}
                className="scroll-mt-24 border-b border-border pb-3 text-xl sm:text-2xl"
              >
                {group.region}
              </h2>

              <ul className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                {group.entries.map(({ city, terminal }) => (
                  <li key={terminal.id}>
                    <Link
                      to={`/terminaller/${terminal.id}`}
                      className="group flex min-h-12 items-center gap-3 py-1 text-sm text-fg-secondary transition-colors duration-(--duration-fast) hover:text-fg"
                    >
                      <Illustration
                        src={BRAND.terminal}
                        alt=""
                        width={29}
                        height={42}
                        className="h-8 w-auto shrink-0"
                      />
                      <span className="min-w-0 truncate">
                        <span className="font-medium underline-offset-4 group-hover:underline">
                          {terminal.name}
                        </span>
                        <span className="text-fg-muted"> · {city.name}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
