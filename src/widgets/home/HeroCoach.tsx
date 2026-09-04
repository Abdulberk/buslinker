import { useEffect, useRef, useState } from 'react'
import { IMAGE } from '@/shared/config/assets'
import { Illustration } from '@/shared/ui/asset-icon'
import { cn } from '@/shared/lib/cn'

/**
 * The hero coach: the animation where it can be drawn, the still art otherwise.
 *
 * The animation is VP9-with-alpha in WebM, which Chromium and Firefox composite
 * correctly and WebKit does not — Safari plays the same file with the alpha
 * ignored, i.e. a black rectangle. There is no query that answers "does this
 * browser honour the alpha channel", and sniffing the user agent guesses at it,
 * so this measures the thing itself: draw one frame to a canvas and read the
 * corner. Transparent means the alpha survived; opaque black means it did not,
 * and the still art stays.
 *
 * The video is only swapped in once that passes, so nobody sees a black box —
 * not even for a frame.
 */
export function HeroCoach() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [alphaWorks, setAlphaWorks] = useState(false)
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video || reduced) return

    function check() {
      if (!video) return
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 8
        canvas.height = 8
        const context = canvas.getContext('2d', { willReadFrequently: false })
        if (!context) return
        context.clearRect(0, 0, 8, 8)
        context.drawImage(video, 0, 0, 8, 8)
        // The top-left of every frame is background, so it is transparent
        // wherever the alpha channel is honoured.
        setAlphaWorks(context.getImageData(0, 0, 1, 1).data[3]! < 32)
      } catch {
        // A tainted canvas would throw; the still art is the safe answer.
        setAlphaWorks(false)
      }
    }

    video.addEventListener('loadeddata', check)
    if (video.readyState >= 2) check()
    return () => video.removeEventListener('loadeddata', check)
  }, [reduced])

  return (
    <div className="relative">
      {/* Above the fold on desktop and therefore the LCP element, so it is never
          lazy — deferring it would defer the very thing the metric measures. */}
      <Illustration
        src={IMAGE.coach.src}
        alt="BusLinker otobüsü"
        width={IMAGE.coach.width}
        height={IMAGE.coach.height}
        priority
        sizes="(min-width: 1024px) 24rem, 0px"
        className={cn(
          'h-auto w-full drop-shadow-[0_24px_32px_oklch(0.30_0.03_35/0.22)]',
          alphaWorks && 'invisible',
        )}
      />

      {!reduced && (
        <video
          ref={videoRef}
          src="/bus.webm"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className={cn(
            'absolute inset-0 h-full w-full object-contain',
            'drop-shadow-[0_24px_32px_oklch(0.30_0.03_35/0.22)]',
            // Hidden rather than unmounted until the check passes: it has to
            // decode a frame for the check to be possible at all.
            alphaWorks ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  )
}
