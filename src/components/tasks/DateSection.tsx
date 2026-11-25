import type { ReactNode } from 'react';
import type { DateString } from '../../types';
import { dayLabel, formatDay, formatLongDay, todayString } from '../../lib/date';
import { cx } from '../../lib/cx';

export interface DateSectionProps {
  date: DateString | 'none';
  count?: number;
  /** Extra control on the right, e.g. "Reschedule all to today". */
  action?: ReactNode;
  tone?: 'default' | 'overdue';
  children: ReactNode;
}

/** Editorial day heading: "Today", "Friday", "Next week", "Later". */
export function DateSection({
  date,
  count,
  action,
  tone = 'default',
  children,
}: DateSectionProps) {
  const label =
    date === 'none'
      ? 'No date yet'
      : date === todayString()
        ? 'Today'
        : dayLabel(date);

  const sub = date === 'none' ? 'Whenever you like' : formatLongDay(date);

  return (
    <section className="space-y-2.5">
      <div className="flex flex-wrap items-baseline gap-2.5 pb-1">
        <h2
          className={cx(
            'font-display text-2xl font-semibold leading-none',
            tone === 'overdue' ? 'text-rose-700' : 'text-ink',
          )}
        >
          {label}
        </h2>
        {date !== 'none' && label !== formatDay(date, { withWeekday: false }) && (
          <span className="font-hand text-lg text-ink-soft leading-none">
            {formatDay(date)}
          </span>
        )}
        {typeof count === 'number' && (
          <span
            className={cx(
              'text-xs font-sans tabular-nums',
              tone === 'overdue' ? 'text-rose-700 font-medium' : 'text-text-faint',
            )}
          >
            · {count}
          </span>
        )}
        {action && <div className="ml-auto">{action}</div>}
      </div>
      <p className="sr-only">{sub}</p>
      {children}
    </section>
  );
}
