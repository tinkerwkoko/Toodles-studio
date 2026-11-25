import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Tighter padding for dense lists like board cards. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Soft organic surface treatments without heavy boxed borders. */
  variant?: 'paper' | 'aged' | 'stack' | 'flush';
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
} as const;

const VARIANTS = {
  paper: 'paper-sheet rounded-[10px]',
  aged: 'rounded-[10px] bg-paper-2/55',
  stack: 'paper-stack rounded-[10px]',
  flush: 'bg-transparent',
} as const;

/** Open botanical surface container — separates sections via gentle tone and layering instead of boxed borders. */
export function Card({
  children,
  padding = 'md',
  variant = 'paper',
  className,
  ...rest
}: CardProps) {
  return (
    <div className={cx(VARIANTS[variant], PADDING[padding], className)} {...rest}>
      {children}
    </div>
  );
}
