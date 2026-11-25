import { cx } from '../../lib/cx';

export interface ProgressBarProps {
  /** 0 – 100 */
  value: number;
  label?: string;
  /** Tailwind classes for the filled bar, e.g. 'bg-mint-500'. */
  tone?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function ProgressBar({
  value,
  label,
  tone = 'bg-lilac-300',
  className,
  size = 'sm',
}: ProgressBarProps) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progress'}
      className={cx(
        'w-full overflow-hidden rounded-[2px] bg-paper-2',
        size === 'sm' ? 'h-[5px]' : 'h-[8px]',
        className,
      )}
    >
      <div
        className={cx('h-full rounded-[2px] transition-[width] duration-500 ease-out', tone)}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}
