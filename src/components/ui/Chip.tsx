import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface ChipProps {
  children: ReactNode;
  className?: string;
  /** Colour classes, usually from lib/color accents. */
  tone?: string;
  size?: 'sm' | 'md';
}

/** Understated archival index label — never a loud glossy pill. */
export function Chip({ children, className, tone, size = 'sm' }: ChipProps) {
  return (
    <span
      className={cx(
        'inline-flex max-w-full items-center gap-1.5 rounded-[3px] border border-divider bg-paper-2/65 font-sans font-medium text-ink-soft',
        size === 'sm' ? 'px-2 py-0.5 text-[11px] leading-tight' : 'px-2.5 py-1 text-xs leading-tight',
        tone,
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface ColorDotProps {
  className?: string;
  label?: string;
}

export function ColorDot({ className, label }: ColorDotProps) {
  return (
    <span
      className={cx('inline-block h-2 w-2 shrink-0 rounded-full', className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}
