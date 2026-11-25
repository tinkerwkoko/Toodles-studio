import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { formatMonthYear } from '../../lib/date';
import { cx } from '../../lib/cx';

export interface MonthPickerProps {
  /** `YYYY-MM`, or null when every month is shown. */
  value: string | null;
  onChange: (value: string | null) => void;
}

/** Quiet previous/next month navigation for the diary. */
export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [year, month] = value ? value.split('-').map(Number) : [null, null];
  const hasYear = year !== null && month !== null;

  function step(delta: number): void {
    if (!hasYear || year === null || month === null) return;
    const date = new Date(year, month - 1 + delta, 1);
    onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }

  return (
    <div className="flex items-center gap-1.5">
      {hasYear && (
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous month"
          className="grid h-9 w-9 place-items-center rounded-[4px] border border-lilac-200 bg-cream text-ink-soft transition hover:bg-lilac-100 hover:text-ink"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
      )}

      <p
        className={cx(
          'flex min-w-36 items-center justify-center gap-2 rounded-[4px] border px-3.5 py-2 text-xs font-medium',
          hasYear
            ? 'border-lilac-200 bg-paper-2 text-ink'
            : 'border-lilac-200 bg-cream text-ink-soft',
        )}
      >
        <CalendarDays size={14} aria-hidden="true" />
        <span className="tabular-nums">
          {hasYear ? formatMonthYear(year as number, (month as number) - 1) : 'All months'}
        </span>
      </p>

      {hasYear && (
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next month"
          className="grid h-9 w-9 place-items-center rounded-[4px] border border-lilac-200 bg-cream text-ink-soft transition hover:bg-lilac-100 hover:text-ink"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}

      {hasYear && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="min-h-9 rounded-[4px] px-2.5 text-xs font-medium text-lilac-700 transition hover:bg-lilac-100"
        >
          Show all
        </button>
      )}
    </div>
  );
}
