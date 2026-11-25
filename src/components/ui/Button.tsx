import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type ButtonVariant = 'primary' | 'soft' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-lilac-300 text-primary-ink border border-lilac-300 hover:bg-lilac-400 hover:border-lilac-400 shadow-[0_1px_0_rgba(45,30,24,0.18)]',
  soft:
    'bg-paper-2/75 text-ink border border-lilac-200/80 hover:bg-paper-2 hover:border-lilac-200',
  ghost:
    'bg-transparent text-ink-soft hover:text-ink hover:bg-paper-2/60 border border-transparent',
  outline:
    'bg-cream text-ink border border-lilac-200 hover:bg-paper-2/60 hover:border-dusty-rose',
  danger:
    'bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200/80',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] md:min-h-[32px] px-3 text-xs',
  md: 'min-h-[40px] md:min-h-[36px] px-4 text-sm',
  lg: 'min-h-[44px] md:min-h-[40px] px-5 text-[0.95rem]',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  block?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  block = false,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-[4px] font-sans font-medium tracking-[0.01em] transition duration-150 cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'active:translate-y-[0.5px] disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
