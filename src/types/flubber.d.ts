/**
 * flubber ships no types of its own, and `@types/flubber` does not exist.
 *
 * Only the surface this project uses is declared. Left as an untyped import it
 * would be `any`, which the lint rules reject outright — and rightly: an
 * interpolator that silently returned the wrong shape would be invisible.
 */
declare module 'flubber' {
  export interface InterpolateOptions {
    /**
     * How finely each outline is resampled before the two are matched up, in
     * user units of the path's own coordinate system. Smaller is smoother and
     * costs more points.
     */
    maxSegmentLength?: number
    /** When false, the interpolator returns a ring of points instead of a `d`. */
    string?: boolean
  }

  /** Returns `t => d`, where t is 0 at `fromShape` and 1 at `toShape`. */
  export function interpolate(
    fromShape: string,
    toShape: string,
    options?: InterpolateOptions,
  ): (t: number) => string

  export function toCircle(
    fromShape: string,
    x: number,
    y: number,
    radius: number,
    options?: InterpolateOptions,
  ): (t: number) => string

  export function separate(
    fromShape: string,
    toShapes: readonly string[],
    options?: InterpolateOptions,
  ): (t: number) => string

  export function combine(
    fromShapes: readonly string[],
    toShape: string,
    options?: InterpolateOptions,
  ): (t: number) => string
}
