import { operatorById } from '@/shared/api/catalog'
import { cn } from '@/shared/lib/cn'
import { upperTr } from '@/shared/lib/tr'

/**
 * A carrier's logo.
 *
 * The source files are ~114x105 PNGs drawn on white, so they sit on an
 * explicit white tile at every theme — a carrier mark inverted or tinted by
 * dark mode stops being that carrier's mark. The tile keeps a border so it
 * still reads as an object on a white page.
 *
 * Falls back to a monogram on the carrier's brand colour when no file exists,
 * which keeps the layout stable if the catalogue ever grows past the logos we
 * actually have.
 */
export interface OperatorLogoProps {
  operatorId: string
  className?: string
  /** The name is usually rendered next to the logo, so it is decorative. */
  decorative?: boolean
  /**
   * `tile` is the square used by the ticket, the seat page and the account
   * pages. `plate` is a landscape frame for places where the logo has to be
   * read rather than recognised, such as the trip cards.
   *
   * Every logo file is a wide wordmark (about 110x30) centred on a square
   * white canvas, so in a 44px square the name ends up 10px tall. The plate
   * crops the white bands above and below with `object-cover` and lets the
   * wordmark take the plate's whole width. Its aspect stays between 2.4:1 and
   * 3:1, which keeps the tallest wordmark (Nilüfer, rows 40 to 73 of 105)
   * inside the visible band.
   */
  variant?: 'tile' | 'plate'
}

function monogram(name: string): string {
  const words = name.split(' ').filter(Boolean)
  return upperTr(`${words[0]?.[0] ?? ''}${words[1]?.[0] ?? ''}`)
}

export function OperatorLogo({
  operatorId,
  className,
  decorative = true,
  variant = 'tile',
}: OperatorLogoProps) {
  const operator = operatorById(operatorId)
  const name = operator?.name ?? 'Otobüs firması'
  const plate = variant === 'plate'

  if (!operator?.logo) {
    return (
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-lg font-display text-sm font-bold text-neutral-0',
          plate ? 'h-10 w-28' : 'size-11',
          className,
        )}
        style={{ backgroundColor: operator?.color ?? 'var(--color-neutral-700)' }}
        aria-hidden={decorative ? true : undefined}
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : name}
      >
        {monogram(name)}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-lg',
        'border border-border bg-neutral-0',
        // The plate pads only the sides: the wordmarks run edge to edge of
        // their canvas, and the white above and below is already cropped. Its
        // one track is pinned to the plate (`minmax(0, 1fr)`); with an auto
        // row the image's 100% height resolved against its own natural height,
        // and the crop showed the empty top of the canvas.
        plate ? 'h-10 w-28 grid-cols-1 grid-rows-1 px-1.5' : 'size-11 p-1',
        className,
      )}
    >
      <img
        src={operator.logo}
        alt={decorative ? '' : `${name} logosu`}
        width={114}
        height={105}
        loading="lazy"
        decoding="async"
        className={cn('size-full', plate ? 'object-cover' : 'object-contain')}
        {...(decorative && { 'aria-hidden': true })}
      />
    </span>
  )
}
