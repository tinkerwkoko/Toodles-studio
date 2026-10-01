import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type ButtonVariant = 'primary' | 'soft' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-lilac-300 text-ink hover:bg-lilac-400',
  soft: 'bg-cream text-ink border border-lilac-200 hover:bg-lilac-100',
  ghost: 'bg-transparent text-ink hover:bg-lilac-100',
  outline: 'bg-cream text-ink border border-lilac-200 hover:bg-lilac-100',
  danger: 'bg-rose-100 text-ink border border-rose-200 hover:bg-rose-200',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] md:min-h-[30px] md:h-[30px] px-2.5 text-xs',
  md: 'min-h-[40px] md:min-h-[30px] md:h-[30px] px-3.5 text-sm',
  lg: 'min-h-[44px] md:min-h-[36px] md:h-[36px] px-4 text-[0.95rem]',
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
        'inline-flex items-center justify-center gap-1.5 rounded-[9px] font-display font-normal transition duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45',
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
