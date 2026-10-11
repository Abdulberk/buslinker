import { useEffect } from 'react'
import { Link } from 'react-router'
import { Home, TrendingUp } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Sayfa bulunamadı | BusLinker'
  }, [])

  return (
    <div className="app-container section-y">
      <div className="mx-auto max-w-lg text-center">
        <p
          className="font-display text-5xl font-semibold text-fg-subtle tabular-nums"
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-balance-tr text-fg sm:text-4xl">
          Sayfa bulunamadı
        </h1>
        <p className="mt-3 text-sm text-fg-secondary sm:text-base">
          Aradığınız sayfa taşınmış, kaldırılmış ya da bağlantı hatalı yazılmış olabilir. Buradan
          devam edebilirsiniz.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 xs:flex-row xs:items-center">
          <Button variant="primary" size="lg" asChild>
            <Link to="/">
              <Home className="size-4" aria-hidden="true" />
              Ana sayfa
            </Link>
          </Button>
          {/* Not "/#arama": the home page has no element by that id, so the
              link quietly did the same as the one beside it. The search form
              is the first thing on the home page anyway; the second way out
              goes somewhere else. */}
          <Button variant="secondary" size="lg" asChild>
            <Link to="/populer-seferler">
              <TrendingUp className="size-4" aria-hidden="true" />
              Popüler seferler
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
