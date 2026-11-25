import { cx } from '../../lib/cx';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Optional count, e.g. number of tasks in that view. */
  count?: number;
}

export interface SegmentedControlProps<T extends string> {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

/** Library index strip: restrained paper tabs without bubbly pills. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx(
        'no-scrollbar inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-[4px] border border-lilac-200/80 bg-paper-2/70 p-1',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cx(
              'inline-flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-[3px] px-3.5 text-xs sm:text-sm font-sans transition cursor-pointer',
              active
                ? 'bg-cream text-ink font-semibold shadow-[0_1px_2px_rgba(69,56,47,0.12)]'
                : 'text-ink-soft hover:text-ink',
            )}
          >
            {option.label}
            {typeof option.count === 'number' && (
              <span
                className={cx(
                  'text-[11px] tabular-nums',
                  active ? 'text-accent font-semibold' : 'text-text-faint',
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
