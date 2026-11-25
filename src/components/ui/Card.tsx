import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Tighter padding for dense lists like board cards. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Surface treatment: paper sheet, aged secondary parchment, stacked pages, or flush. */
  variant?: 'paper' | 'aged' | 'stack' | 'flush';
}

const PADDING = {
  none: '',
  sm: 'p-3.5',
  md: 'p-5',
  lg: 'p-6 sm:p-7',
} as const;

const VARIANTS = {
  paper: 'paper-sheet rounded-[5px] border border-divider/80',
  aged: 'rounded-[5px] bg-paper-2/65 border border-divider/70',
  stack: 'paper-stack rounded-[5px] border border-divider/80',
  flush: 'bg-transparent',
} as const;

/** Layered archival paper container with restrained depth and warm edges. */
export function Card({
  children,
  padding = 'md',
  variant = 'paper',
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cx(VARIANTS[variant], PADDING[padding], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
