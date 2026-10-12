import { useEffect, useState } from 'react'
import { Skeleton } from '@/shared/ui/skeleton'

/** A chunk that arrives within this never shows a skeleton at all. */
const SHOW_AFTER_MS = 250

/**
 * Route-level loading state. Sized to the content it replaces so nothing
 * shifts.
 *
 * Delayed: most page chunks arrive in well under a quarter of a second, and a
 * skeleton that flashes for one frame and is gone reads as a glitch, not as
 * loading. Until the delay passes the space is held, blank, at the skeleton's
 * height, so the footer does not jump up into view and back down.
 */
export function PageFallback() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setShown(true), SHOW_AFTER_MS)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="app-container section-y" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Sayfa yükleniyor</span>
      <div className={shown ? 'animate-in duration-(--duration-base) fade-in-0' : 'invisible'}>
        <Skeleton className="h-10 w-64" />
        <div className="mt-8 grid gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
