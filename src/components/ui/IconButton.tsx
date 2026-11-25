import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only buttons must be named for screen readers. */
  label: string;
  children: ReactNode;
  tone?: 'default' | 'danger';
}

/** Quiet botanical icon control: 32px desktop, 40px touch target. */
export function IconButton({
  label,
  children,
  tone = 'default',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-10 w-10 md:h-[32px] md:w-[32px] shrink-0 items-center justify-center rounded-[7px] transition duration-150 cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'active:scale-95 disabled:pointer-events-none disabled:opacity-40',
        tone === 'danger'
          ? 'bg-rose-100/80 text-rose-700 hover:bg-rose-200/75'
          : 'bg-transparent text-ink-soft hover:bg-paper-2/75 hover:text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
