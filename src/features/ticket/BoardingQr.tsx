import { useMemo } from 'react'
import { cn } from '@/shared/lib/cn'
import { QR_QUIET_ZONE, qrMatrix } from './qr'

/**
 * The boarding code as a scannable QR.
 *
 * Pure black modules on a pure white plate, in both themes, with the quiet
 * zone drawn as part of the plate. A reader at the coach door measures
 * contrast, not the palette: an inverted or tinted code fails on many of them,
 * and so does one that runs to the edge of a dark card.
 */
export function BoardingQr({
  value,
  label,
  className,
}: {
  value: string
  label: string
  className?: string
}) {
  const { size, path } = useMemo(() => qrMatrix(value), [value])
  const full = size + QR_QUIET_ZONE * 2

  return (
    <svg
      viewBox={`${-QR_QUIET_ZONE} ${-QR_QUIET_ZONE} ${full} ${full}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={cn('block rounded-md ring-1 ring-border', className)}
    >
      <rect x={-QR_QUIET_ZONE} y={-QR_QUIET_ZONE} width={full} height={full} fill="#ffffff" />
      <path d={path} fill="#000000" />
    </svg>
  )
}
