import type { ReactNode } from 'react';
import { Cat, type CatPose } from '../Cat';
import { Button } from './Button';
import { BotanicalDivider, FernSprig } from './BotanicalOrnaments';
import { cx } from '../../lib/cx';

export interface EmptyStateProps {
  sentence: string;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: ReactNode;
  pose?: CatPose;
  small?: boolean;
  className?: string;
}

/** Airy botanical empty state with fine fern sprig and Special Elite prose — no clunky boxes. */
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
        'relative flex flex-col items-center overflow-hidden px-6 text-center',
        small ? 'gap-2.5 py-7' : 'gap-3.5 rounded-[12px] bg-cream/65 py-12',
        className,
      )}
    >
      {!small && (
        <FernSprig className="absolute -bottom-3 -right-3 h-24 w-32 text-sage/40" />
      )}
      <Cat pose={pose} size={small ? 64 : 100} title="Toodles the cat" />
      {title && (
        <h3 className={cx('font-display text-ink', small ? 'text-lg' : 'text-2xl')}>
          {title}
        </h3>
      )}
      {!small && <BotanicalDivider className="w-36" />}
      <p
        className={cx(
          'max-w-md font-typewriter leading-relaxed text-ink-soft',
          small ? 'text-xs' : 'text-[13px]',
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
