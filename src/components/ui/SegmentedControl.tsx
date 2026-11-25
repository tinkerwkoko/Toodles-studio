import { cx } from '../../lib/cx';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export interface SegmentedControlProps<T extends string> {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

/** Soft botanical segmented control without boxed outlines. */
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
        'no-scrollbar inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-[8px] bg-paper-2/75 p-1',
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
              'inline-flex min-h-[34px] shrink-0 cursor-pointer items-center gap-1.5 rounded-[6px] px-3.5 font-sans text-xs whitespace-nowrap transition sm:text-sm',
              active
                ? 'bg-cream text-ink font-medium shadow-soft'
                : 'text-ink-soft hover:text-ink',
            )}
          >
            {option.label}
            {typeof option.count === 'number' && (
              <span
                className={cx(
                  'font-typewriter text-[11px] tabular-nums',
                  active ? 'text-forest' : 'text-text-faint',
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
