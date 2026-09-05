import { useId, useState, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * A labelled text field.
 *
 * Every control gets a real `<label>` (never a placeholder standing in for
 * one), and an error is wired through `aria-describedby` + `aria-invalid` so a
 * screen reader hears it on focus rather than only seeing it in red. The error
 * slot keeps its height reserved so validating a form does not shunt the
 * layout downward.
 */
export interface FieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string
  /** Shown under the field until an error replaces it. */
  hint?: string
  error?: string | undefined
  /** Rendered inside the field, before the text. */
  icon?: ReactNode
  containerClassName?: string
}

export function Field({
  label,
  hint,
  error,
  icon,
  className,
  containerClassName,
  type = 'text',
  ...props
}: FieldProps) {
  const autoId = useId()
  const id = props.name ? `field-${props.name}` : autoId
  const messageId = `${id}-message`

  const isPassword = type === 'password'
  const [revealed, setRevealed] = useState(false)
  const resolvedType = isPassword && revealed ? 'text' : type

  return (
    // The bottom margin is on the field itself rather than a gap on the form,
    // so a hint in the reserved message slot cannot run into the next label.
    <div className={cn('mb-3 flex flex-col gap-1.5 last:mb-0', containerClassName)}>
      <label htmlFor={id} className="text-sm font-medium text-fg-secondary">
        {label}
      </label>

      <div
        className={cn(
          'relative flex items-center rounded-lg border bg-surface',
          'transition-colors duration-(--duration-fast) ease-standard',
          'focus-within:border-brand hover:border-border-strong',
          error ? 'border-danger' : 'border-border-strong',
        )}
      >
        {icon ? (
          <span className="pointer-events-none absolute left-3 flex text-fg-muted">{icon}</span>
        ) : null}

        <input
          id={id}
          type={resolvedType}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            'h-11 w-full min-w-0 rounded-lg bg-transparent text-base text-fg',
            'placeholder:text-fg-subtle',
            icon ? 'pl-10' : 'pl-3',
            isPassword ? 'pr-11' : 'pr-3',
            className,
          )}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            // The label states the ACTION, and the control is not a toggle in
            // the ARIA sense — it changes the field, not its own pressed state.
            aria-label={revealed ? 'Parolayı gizle' : 'Parolayı göster'}
            className={cn(
              'tap-44 absolute right-2 grid size-7 place-items-center rounded-md',
              'text-fg-muted transition-colors duration-(--duration-fast)',
              'hover:bg-surface-sunken hover:text-fg',
            )}
          >
            <RevealIcon revealed={revealed} />
          </button>
        ) : null}
      </div>

      {/* Reserved so an appearing error does not push the form down. */}
      <p
        id={messageId}
        {...(error && { role: 'alert' })}
        className={cn('min-h-4 text-xs', error ? 'font-medium text-danger-fg' : 'text-fg-muted')}
      >
        {error ?? hint ?? ''}
      </p>
    </div>
  )
}

/**
 * The password field's eye, with the slash drawn rather than swapped in.
 *
 * lucide ships `eye` and `eye-off` as separate glyphs, and switching between
 * them is a hard cut: the eye's outline is redrawn as three fragments the
 * instant you press. Here the eye never changes — only the slash arrives,
 * stroked on with `pathLength="1"` so the dash maths is in fractions of the
 * line and stays right at any size.
 *
 * A path morph was the other option and is the wrong tool here: the two states
 * differ by an added line, not by a change of shape, and `flubber` would have
 * to tear one outline into several to say so. Under reduced motion the theme
 * zeroes the duration token, so the slash simply appears.
 */
function RevealIcon({ revealed }: { revealed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* lucide's `eye`, verbatim. */}
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
      {/* lucide's `eye-off` slash, drawn from the top-left corner down. */}
      <path
        d="m2 2 20 20"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={revealed ? 0 : 1}
        className="transition-[stroke-dashoffset] duration-(--duration-slow) ease-out"
      />
    </svg>
  )
}
