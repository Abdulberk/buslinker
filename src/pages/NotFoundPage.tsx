import { useEffect } from 'react'
import { Link } from 'react-router'
import { Compass, Home } from 'lucide-react'
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
          <Button variant="secondary" size="lg" asChild>
            <Link to="/#arama">
              <Compass className="size-4" aria-hidden="true" />
              Sefer ara
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
