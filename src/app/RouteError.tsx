import { useEffect, useState } from 'react'
import { Link, isRouteErrorResponse, useNavigate, useRouteError } from 'react-router'
import { LoaderCircle, TriangleAlert } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { isChunkLoadError, reloadForNewRelease } from './lazy-route'

/** React Router keeps the position in the session in `history.state.idx`. */
function canGoBack(): boolean {
  const state: unknown = window.history.state
  if (typeof state !== 'object' || state === null) return false
  const { idx } = state as { idx?: unknown }
  return typeof idx === 'number' && idx > 0
}

export function RouteError() {
  const error = useRouteError()
  const navigate = useNavigate()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  // A chunk a deploy replaced is not a fault in the page, and a reload is the
  // whole fix, so the page tries it first, within the shared reload budget,
  // and only shows this screen when that has already failed.
  const stale = !notFound && isChunkLoadError(error)
  const [reloading] = useState(() => stale && reloadForNewRelease())

  // What went wrong is for the developer, not the traveller. The message of a
  // thrown Error or a response's statusText is English, technical, and often
  // both ("Failed to fetch dynamically imported module …"), so it goes to the
  // console and the page says what happened in words a passenger can act on.
  useEffect(() => {
    console.error(error)
  }, [error])

  useEffect(() => {
    document.title = `${notFound ? 'Sayfa bulunamadı' : 'Bir sorun oluştu'} | BusLinker`
  }, [notFound])

  if (reloading) {
    return (
      <div className="app-container section-y">
        <p
          role="status"
          className="mx-auto flex max-w-md items-center justify-center gap-2 text-fg-muted"
        >
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          Sitenin yeni sürümü yükleniyor…
        </p>
      </div>
    )
  }

  return (
    <div className="app-container section-y">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-danger-tint text-danger-fg">
          <TriangleAlert className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl text-balance-tr">
          {notFound ? 'Sayfa bulunamadı' : 'Bu sayfa şu an açılamadı'}
        </h1>
        <p className="mt-2 text-fg-muted">
          {notFound
            ? 'Aradığınız sayfa taşınmış, kaldırılmış ya da bağlantı hatalı yazılmış olabilir.'
            : stale
              ? 'Sitenin yeni bir sürümü yayınlandı ve bu sekme eskisinde kaldı. Sayfayı yenilediğinizde yeni sürüm açılır.'
              : 'Beklenmeyen bir sorun oluştu. Sayfayı yenilemek çoğu zaman yeterli olur; olmazsa ana sayfadan devam edebilirsiniz.'}
        </p>
        {/* One filled button: the step most likely to help. A failed page is
            usually a stale chunk after a new release, which a reload fixes; a
            missing one is not helped by reloading, so there home leads. */}
        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 xs:flex-row xs:items-center">
          {notFound ? (
            <Button asChild>
              <Link to="/">Ana sayfaya git</Link>
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  window.location.reload()
                }}
              >
                Sayfayı yenileyin
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/">Ana sayfaya git</Link>
              </Button>
            </>
          )}
          {/* Only when there is somewhere to go back to: on a page opened
              from a bookmark, "Geri dön" did nothing at all. */}
          {notFound && canGoBack() ? (
            <Button variant="secondary" onClick={() => void navigate(-1)}>
              Geri dön
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
