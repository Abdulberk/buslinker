import { Skeleton } from '@/shared/ui/skeleton'

/** Route-level loading state. Sized to the content it replaces so nothing shifts. */
export function PageFallback() {
  return (
    <div className="app-container section-y" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Sayfa yükleniyor</span>
      <Skeleton className="h-10 w-64" />
      <div className="mt-8 grid gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
