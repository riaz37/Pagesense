'use client';

import { useCallback, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';
import { cn } from '@/lib/cn';
import { useTheme } from '@/components/ThemeProvider';

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<'button'> {
  duration?: number;
}

export function AnimatedThemeToggler({
  className,
  duration = 400,
  'aria-label': ariaLabel = 'Toggle theme',
  ...props
}: AnimatedThemeTogglerProps): React.ReactElement {
  const { theme, toggle } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isDark = theme === 'dark';

  const handleClick = useCallback(() => {
    const button = buttonRef.current;
    if (!button) {
      toggle();
      return;
    }

    if (typeof document.startViewTransition !== 'function') {
      toggle();
      return;
    }

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y),
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        toggle();
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    }).catch(() => {});
  }, [toggle, duration]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={handleClick}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full',
        'border border-black/10 dark:border-white/10',
        'bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]',
        'transition-colors duration-150 ease-out',
        'hover:bg-[color:var(--bg-surface-subtle)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-emerald)]',
        className,
      )}
      {...props}
    >
      {isDark ? (
        <Sun size={16} strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Moon size={16} strokeWidth={1.75} aria-hidden="true" />
      )}
    </button>
  );
}
