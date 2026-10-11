/**
 * Navigation state for a change that is not a new page.
 *
 * Picking another day in the date strip changes the path, so to the router it
 * looks like any other navigation: the layout moved focus to <main> and the
 * route veil washed the screen for 560ms — on every tap, while the strip the
 * user was working in stayed exactly where it was. Passing this state says
 * "same page, new data": no veil, and focus stays on the control.
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
