import type { ReactNode } from 'react';
import type { DateString } from '../../types';
import { dayLabel, formatDay, formatLongDay, todayString } from '../../lib/date';
import { cx } from '../../lib/cx';
import { LeafMark } from '../ui/BotanicalOrnaments';

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
            'font-display text-2xl leading-none',
            tone === 'overdue' ? 'text-rose-700' : 'text-ink',
          )}
        >
          {label}
        </h2>
        {date !== 'none' && label !== formatDay(date, { withWeekday: false }) && (
          <span className="inline-flex items-center gap-1 font-typewriter text-xs text-fern leading-none">
            <LeafMark className="h-3 w-3 text-fern/75" />
            <span>{formatDay(date)}</span>
          </span>
        )}
        {typeof count === 'number' && (
          <span
            className={cx(
              'font-typewriter text-xs tabular-nums',
              tone === 'overdue' ? 'text-rose-700' : 'text-text-faint',
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
