import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only buttons must be named for screen readers. */
  label: string;
  children: ReactNode;
  tone?: 'default' | 'danger';
}

/** 30px desktop, 40px touch icon button with 9px radius. */
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
        'inline-flex h-10 w-10 md:h-[30px] md:w-[30px] shrink-0 items-center justify-center rounded-[9px] border transition duration-150',
        'active:scale-95 disabled:pointer-events-none disabled:opacity-40',
        tone === 'danger'
          ? 'border-rose-200 bg-rose-100 text-ink hover:bg-rose-200'
          : 'border-lilac-200 bg-cream text-ink hover:bg-lilac-100',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
