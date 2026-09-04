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
}

function monogram(name: string): string {
  const words = name.split(' ').filter(Boolean)
  return upperTr(`${words[0]?.[0] ?? ''}${words[1]?.[0] ?? ''}`)
}

export function OperatorLogo({ operatorId, className, decorative = true }: OperatorLogoProps) {
  const operator = operatorById(operatorId)
  const name = operator?.name ?? 'Otobüs firması'

  if (!operator?.logo) {
    return (
      <span
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-lg font-display text-sm font-bold text-neutral-0',
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
        'grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg',
        'bg-white border border-border p-1',
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
        className="size-full object-contain"
        {...(decorative && { 'aria-hidden': true })}
      />
    </span>
  )
}
