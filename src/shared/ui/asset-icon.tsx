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

/**
 * One of the project's two-tone illustrations (VALUE_ICON) on its tile.
 *
 * The art is slate and brick, drawn for a light ground. Standing bare on a
 * card it read as clip-art dropped into a corner, and in dark mode its slate
 * half all but vanished, so each page had started to improvise its own fix.
 * This is the one recipe: a soft rounded tile in the sky of the hero sheet
 * (`bg-art-tile`, light in both themes), with the drawing filling about three
 * quarters of it, the way the illustrated feature lists of the cleaner travel sites
 * sit their icons on a base. The pixels of the art are untouched.
 *
 * Decorative: the heading beside it carries the meaning, so the tile is
 * hidden from assistive tech and the image has an empty alt.
 */
export function ArtTile({
  src,
  size = 'md',
  className,
}: {
  src: string
  /** `md` for feature cards (48, 56 from sm), `sm` for inline lists (40). */
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-2xl bg-art-tile',
        size === 'md' ? 'size-12 sm:size-14' : 'size-10 rounded-xl',
        className,
      )}
    >
      <Illustration
        src={src}
        alt=""
        width={80}
        height={80}
        className={size === 'md' ? 'size-9 sm:size-10' : 'size-7'}
      />
    </span>
  )
}
