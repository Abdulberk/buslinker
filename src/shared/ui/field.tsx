import { useId, useState, type ComponentProps, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
            {revealed ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
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
