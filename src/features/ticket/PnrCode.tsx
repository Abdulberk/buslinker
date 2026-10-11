import type { CSSProperties } from 'react'
import { cn } from '@/shared/lib/cn'

// The trailing margin takes back the spacing after the last character, so a
// centred or right-aligned code sits where its letters are.
const SPACED: CSSProperties = { letterSpacing: '0.16em', marginInlineEnd: '-0.16em' }

/**
 * A booking code, set the same way on every screen that shows one.
 *
 * Upper case and tabular, so codes line up and read one character at a time.
 * The letter-spacing is inline because the type scale bakes its own tracking
 * into each size, and a code read out over the phone needs more than prose.
 * `translate="no"` keeps a page translator from "translating" TR4NS9.
 */
export function PnrCode({ code, className }: { code: string; className?: string }) {
  return (
    <span
      className={cn('font-display font-semibold uppercase tabular-nums', className)}
      style={SPACED}
      translate="no"
      data-numeric
    >
      {code}
    </span>
  )
}
