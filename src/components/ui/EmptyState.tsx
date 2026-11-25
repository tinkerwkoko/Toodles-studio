import type { ReactNode } from 'react';
import { Cat, type CatPose } from '../Cat';
import { Button } from './Button';
import { cx } from '../../lib/cx';

export interface EmptyStateProps {
  /** One warm sentence: never a cold "no data" message. */
  sentence: string;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: ReactNode;
  pose?: CatPose;
  small?: boolean;
  className?: string;
}

/** Understated vintage bookplate empty state — quiet paper spacing, no clunky dashed pill boxes. */
export function EmptyState({
  sentence,
  title,
  actionLabel,
  onAction,
  secondaryAction,
  pose = 'sleepy',
  small = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-center px-6 text-center',
        small
          ? 'gap-2 py-7'
          : 'gap-3 py-12 rounded-[5px] border border-divider/80 bg-cream/65',
        className,
      )}
    >
      <Cat pose={pose} size={small ? 68 : 108} title="Toodles the cat" />
      {title && (
        <h3
          className={cx(
            'font-display font-semibold text-ink',
            small ? 'text-lg' : 'text-2xl',
          )}
        >
          {title}
        </h3>
      )}
      <p
        className={cx(
          'max-w-md font-sans italic text-ink-soft leading-relaxed',
          small ? 'text-sm' : 'text-[0.95rem]',
        )}
      >
        {sentence}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size={small ? 'sm' : 'md'} onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
      {secondaryAction && <div className="mt-1">{secondaryAction}</div>}
    </div>
  );
}
