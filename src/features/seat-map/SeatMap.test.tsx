import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getSeatMap, searchTrips } from '@/shared/api/mock-server'
import type { SeatMap as SeatMapData } from '@/entities/seat/model'
import { SeatMap } from './SeatMap'

/**
 * The invariant these tests defend is the roving tabindex: EXACTLY ONE cell
 * carries tabIndex=0 at any moment.
 *
 * Doors and WCs are announced as grid cells but carry no button. Arrow keys
 * walk the geometry's neighbour links, which include those fixtures — so
 * before the seatward() walk existed, one ArrowDown from the seat above the
 * mid door moved `focusedKey` onto a door, no button matched the tabIndex
 * test, and the entire seat grid dropped out of the tab order. The map still
 * looked perfect; it was simply unreachable by keyboard.
 */

function buildMap(): SeatMapData {
  // A 2+1 coach, which is the layout that has the two-row mid door.
  const { trips } = searchTrips({ from: '34', to: '6', date: '2026-09-04' })
  const trip = trips.find((t) => t.seatLayout === '2+1')
  if (!trip) throw new Error('fixture: no 2+1 trip')
  const map = getSeatMap(trip.id)
  if (!map) throw new Error('fixture: no seat map')
  return map
}

function renderMap(data = buildMap()) {
  const onPick = vi.fn()
  const onRemove = vi.fn()
  const view = render(<SeatMap data={data} picks={[]} onPick={onPick} onRemove={onRemove} />)
  return { ...view, data, onPick, onRemove }
}

const tabStops = (container: HTMLElement) => container.querySelectorAll('[tabindex="0"]')

describe('SeatMap — roving tabindex', () => {
  it('starts with exactly one tab stop', () => {
    const { container } = renderMap()
    expect(tabStops(container)).toHaveLength(1)
  })

  it('keeps exactly one tab stop after arrowing across the whole coach', async () => {
    const user = userEvent.setup()
    const { container } = renderMap()

    const first = tabStops(container)[0] as HTMLElement
    first.focus()

    // Walk far enough to cross the mid door in both axes several times over.
    for (const key of ['{ArrowDown}', '{ArrowRight}', '{ArrowLeft}', '{ArrowUp}']) {
      for (let i = 0; i < 20; i++) {
        await user.keyboard(key)
        expect(tabStops(container)).toHaveLength(1)
      }
    }
  })

  it('never parks focus on a door or WC cell', async () => {
    const user = userEvent.setup()
    const { container } = renderMap()
    ;(tabStops(container)[0] as HTMLElement).focus()

    for (let i = 0; i < 30; i++) {
      await user.keyboard('{ArrowDown}')
      const stop = tabStops(container)[0]
      // Fixtures render as <div>; every tab stop must be a real button.
      expect(stop?.tagName).toBe('BUTTON')
      expect(stop?.getAttribute('aria-roledescription')).toBe('Koltuk')
    }
  })

  it('steps over the mid door instead of dead-ending on it', async () => {
    const user = userEvent.setup()
    const { container, data } = renderMap()
    ;(tabStops(container)[0] as HTMLElement).focus()

    const visited = new Set<string>()
    for (let i = 0; i < 40; i++) {
      await user.keyboard('{ArrowDown}')
      const label = tabStops(container)[0]?.getAttribute('aria-label')
      if (label) visited.add(label)
    }

    // If ArrowDown dead-ended at the door, only the seats above it would ever
    // be reached. Crossing it means visiting well past the door row.
    expect(visited.size).toBeGreaterThan(4)
    expect(data.seats.length).toBeGreaterThan(30)
  })

  it('keeps the grid reachable by Tab after arrow navigation', async () => {
    const user = userEvent.setup()
    const { container } = renderMap()
    ;(tabStops(container)[0] as HTMLElement).focus()
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}')
    ;(document.activeElement as HTMLElement | null)?.blur()

    await user.tab()
    expect(container.contains(document.activeElement)).toBe(true)
  })

  it('Home and End stay on seats even when a row begins or ends at the door', async () => {
    const user = userEvent.setup()
    const { container } = renderMap()
    ;(tabStops(container)[0] as HTMLElement).focus()

    for (let i = 0; i < 12; i++) {
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{End}')
      expect(tabStops(container)[0]?.tagName).toBe('BUTTON')
      await user.keyboard('{Home}')
      expect(tabStops(container)[0]?.tagName).toBe('BUTTON')
    }
  })

  it('PageDown and PageUp land on a seat', async () => {
    const user = userEvent.setup()
    const { container } = renderMap()
    ;(tabStops(container)[0] as HTMLElement).focus()

    for (let i = 0; i < 6; i++) {
      await user.keyboard('{PageDown}')
      expect(tabStops(container)[0]?.tagName).toBe('BUTTON')
    }
    for (let i = 0; i < 6; i++) {
      await user.keyboard('{PageUp}')
      expect(tabStops(container)[0]?.tagName).toBe('BUTTON')
    }
  })
})

describe('SeatMap — ARIA', () => {
  it('exposes the APG grid structure', () => {
    renderMap()
    const grid = screen.getByRole('grid')
    expect(grid).toHaveAttribute('aria-multiselectable', 'true')
    expect(grid).toHaveAttribute('lang', 'tr')
    expect(Number(grid.getAttribute('aria-rowcount'))).toBeGreaterThan(0)
    expect(screen.getAllByRole('row').length).toBeGreaterThan(0)
  })

  it('announces occupied seats as disabled but leaves them arrow-reachable', () => {
    const data = buildMap()
    const { container } = renderMap(data)
    const sold = data.seats.find((s) => s.unavailableReason === 'SOLD')
    if (!sold) return

    const button = container.querySelector<HTMLButtonElement>(
      `button[aria-label^="${sold.label} numaralı koltuk"]`,
    )
    expect(button).not.toBeNull()
    expect(button).toHaveAttribute('aria-disabled', 'true')
    // The HTML `disabled` attribute would remove it from the grid traversal.
    expect(button?.disabled).toBe(false)
  })

  it('never puts selection state in the label — aria-selected carries it', () => {
    const { container } = renderMap()
    for (const button of container.querySelectorAll('button[role="gridcell"]')) {
      const label = button.getAttribute('aria-label') ?? ''
      expect(label).not.toContain('seçili')
      expect(label).not.toContain('seçildi')
      expect(button).toHaveAttribute('aria-selected')
    }
  })
})
