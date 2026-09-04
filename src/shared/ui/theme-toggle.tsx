import { Moon, Sun } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useTheme } from '@/shared/lib/use-theme'
import { Button } from '@/shared/ui/button'

const ICON = [
  'col-start-1 row-start-1 size-5',
  'transition-[opacity,transform] duration-(--duration-slow) ease-spring',
].join(' ')

/**
 * The label names the ACTION, not the current state — a screen-reader user has
 * no way to see which theme is on, so "Koyu temaya geç" is the only phrasing
 * that tells them what pressing it does.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      // 36px keeps the header compact; `tap-44` restores the 44px hit area.
      className={cn('tap-44', className)}
    >
      <span className="grid size-5 place-items-center">
        <Sun
          aria-hidden="true"
          className={cn(
            ICON,
            isDark ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
          )}
        />
        <Moon
          aria-hidden="true"
          className={cn(
            ICON,
            isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0',
          )}
        />
      </span>
    </Button>
  )
}
