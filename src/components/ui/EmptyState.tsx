import type { ReactNode } from 'react';
import { Cat, type CatPose } from '../Cat';
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

/** Every empty state gets the cat, one kind sentence and a clear button. */
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
        'flex flex-col items-center rounded-2xl border border-dashed border-lilac-300 bg-lilac-50/80 px-6 text-center',
        small ? 'gap-2 py-6' : 'gap-3 py-10',
        className,
      )}
    >
      <Cat pose={pose} size={small ? 72 : 116} title="Toodles the cat" />
      {title && <h3 className={cx(small ? 'text-base' : 'text-xl')}>{title}</h3>}
      <p className={cx('max-w-md text-ink-soft', small ? 'text-sm' : 'text-[0.95rem]')}>
        {sentence}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 inline-flex min-h-11 items-center justify-center rounded-full bg-lilac-300 px-5 font-display text-ink transition hover:bg-lilac-600 active:scale-[0.97]"
        >
          {actionLabel}
        </button>
      )}
      {secondaryAction && <div className="mt-1">{secondaryAction}</div>}
    </div>
  );
}
