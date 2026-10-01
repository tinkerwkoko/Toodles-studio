import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Tighter padding for dense lists like board cards. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5 sm:p-6',
} as const;

/** Flat card: cream surface, 1px border, 12px corners, no shadow. */
export function Card({ children, padding = 'md', className, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        'rounded-[12px] border border-lilac-200 bg-cream',
        PADDING[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
