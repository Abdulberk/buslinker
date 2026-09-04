import type { CSSProperties } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * Renders the project's own SVG artwork.
 *
 * Two kinds of asset, two techniques:
 *
 *   `AssetIcon` is for the MONOCHROME line icons (the 25x24 amenity set, the
 *   48x49 social marks, the UI glyphs). Their fill is baked into the file, so
 *   an `<img>` would render them in the original slate grey on every surface,
 *   including dark mode. Using the SVG as a CSS `mask` and painting through
 *   `background-color: currentColor` keeps the exact artwork while letting it
 *   inherit colour like any icon font would — no re-authoring, no build step.
 *
 *   `Illustration` is for the artwork that is MEANT to be multi-colour — the
 *   80x80 two-tone value-prop icons, the operator logos, the payment cards.
 *   Masking those would flatten them to a silhouette, so they stay `<img>`.
 */

export interface AssetIconProps {
  /** Path under `public/`, e.g. `/icons/tv.svg`. */
  src: string
  className?: string
  /** Decorative by default; pass a label when the icon is the only content. */
  label?: string
  style?: CSSProperties
}

export function AssetIcon({ src, className, label, style }: AssetIconProps) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('inline-block size-5 shrink-0 bg-current', className)}
      style={{
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        ...style,
      }}
    />
  )
}

export interface IllustrationProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  /** Above the fold: skips lazy loading and raises fetch priority. */
  priority?: boolean
  sizes?: string
}

export function Illustration({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
}: IllustrationProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...(priority && { fetchPriority: 'high' as const })}
      {...(sizes && { sizes })}
      className={className}
    />
  )
}
