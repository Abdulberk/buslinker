import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function RouteError() {
  const error = useRouteError()
  const navigate = useNavigate()

  const title = isRouteErrorResponse(error)
    ? error.status === 404
      ? 'Sayfa bulunamadı'
      : 'Bir şeyler ters gitti'
    : 'Bir şeyler ters gitti'

  const detail = isRouteErrorResponse(error)
    ? error.statusText || 'Aradığınız sayfaya ulaşamadık.'
    : error instanceof Error
      ? error.message
      : 'Beklenmeyen bir hata oluştu.'

  return (
    <div className="app-container section-y">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-danger-tint text-danger-fg">
          <TriangleAlert className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl">{title}</h1>
        <p className="mt-2 text-fg-muted">{detail}</p>
        <div className="mt-7 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => void navigate(-1)}>
            Geri dön
          </Button>
          <Button onClick={() => void navigate('/')}>Ana sayfaya git</Button>
        </div>
      </div>
    </div>
  )
}
