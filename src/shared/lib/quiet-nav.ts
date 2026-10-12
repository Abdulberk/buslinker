/**
 * Navigation state for a change that is not a new page.
 *
 * Picking another day in the date strip changes the path, so to the router it
 * looks like any other navigation, and the layout moved focus to <main> — on
 * every tap, while the strip the user was working in stayed exactly where it
 * was. Passing this state says "same page, new data": focus stays on the
 * control.
 *
 *   <Link to={path} state={QUIET_NAV} />
 *   navigate(path, { state: QUIET_NAV })
 */
export const QUIET_NAV = { quiet: true } as const

export function isQuietNav(state: unknown): boolean {
  return (
    typeof state === 'object' && state !== null && (state as { quiet?: unknown }).quiet === true
  )
}

/**
 * Navigation state for a new page that arrives by morphing out of the old one.
 *
 * A trip card opens the seat page in a view transition: the card itself
 * travels into the page's header while the rest cross-fades. Unlike a quiet
 * navigation it IS a new page, so focus still moves to <main>.
 *
 *   <Link to={path} viewTransition state={MORPH_NAV} />
 */
export const MORPH_NAV = { morph: true } as const

export function isMorphNav(state: unknown): boolean {
  return (
    typeof state === 'object' && state !== null && (state as { morph?: unknown }).morph === true
  )
}

/**
 * MORPH_NAV that also remembers the page it left — the results list, with its
 * filters, sort and date — so the new page's own back link can step back to
 * it instead of opening a fresh copy.
 *
 * A fresh copy was the problem with "Seferlere dön": it pushed a new results
 * page, scrolled to the top, with no transition, so the card the person had
 * picked was nowhere near where they left it. A real step back lets the
 * router replay the morph in reverse and restore the scroll position, the
 * same as the browser's back button does.
 */
export function morphFrom(href: string) {
  return { morph: true, back: href } as const
}

/** The page a morph left from, when the current entry was opened by one. */
export function morphedFrom(state: unknown): string | null {
  if (!isMorphNav(state)) return null
  const back = (state as { back?: unknown }).back
  return typeof back === 'string' ? back : null
}
