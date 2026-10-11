import { useEffect, useState } from 'react'

/**
 * The current time, refreshed once a minute on the minute.
 *
 * Aligned to the wall clock rather than to mount time, so a countdown changes
 * when the phone's own clock does instead of up to 59 seconds later. Nothing
 * runs while the tab is hidden; coming back refreshes at once, which is the
 * moment a stale "Kalkışa 3 saat" would otherwise be read.
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer: number | undefined

    const schedule = () => {
      window.clearTimeout(timer)
      if (document.hidden) return
      // A few ms past the boundary, so the tick never lands just before it.
      const delay = intervalMs - (Date.now() % intervalMs) + 20
      timer = window.setTimeout(() => {
        setNow(new Date())
        schedule()
      }, delay)
    }

    const onVisibility = () => {
      if (!document.hidden) setNow(new Date())
      schedule()
    }

    schedule()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [intervalMs])

  return now
}
