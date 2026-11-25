import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CatFace } from '../CatFace';
import type { DateString, MoodLevel, MoodLog } from '../../types';
import { WEEKDAY_MIN, formatMonthYear, monthGrid, todayString } from '../../lib/date';
import { moodMeta } from '../../lib/mood';
import { accent } from '../../lib/color';
import { cx } from '../../lib/cx';

export interface MoodCalendarProps {
  year: number;
  month: number;
  logs: MoodLog[];
  selected: DateString;
  onSelect: (date: DateString) => void;
  onStep: (delta: number) => void;
}

/** Month grid of the days you actually logged a mood on. Never fills blanks. */
export function MoodCalendar({
  year,
  month,
  logs,
  selected,
  onSelect,
  onStep,
}: MoodCalendarProps) {
  const byDate = new Map(logs.map((log) => [log.date, log.mood]));
  const cells = monthGrid(year, month, 1);
  const today = todayString();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onStep(-1)}
          aria-label="Previous month"
          className="grid h-9 w-9 place-items-center rounded-[8px] bg-paper-2/65 text-ink-soft transition hover:bg-paper-2 hover:text-ink cursor-pointer"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <p className="font-display text-xl text-ink">
          {formatMonthYear(year, month)}
        </p>
        <button
          type="button"
          onClick={() => onStep(1)}
          aria-label="Next month"
          className="grid h-9 w-9 place-items-center rounded-[8px] bg-paper-2/65 text-ink-soft transition hover:bg-paper-2 hover:text-ink cursor-pointer"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5" role="grid" aria-label="Mood calendar">
        {[1, 2, 3, 4, 5, 6, 0].map((weekdayIndex) => (
          <span
            key={weekdayIndex}
            aria-hidden="true"
            className="pb-1 text-center font-typewriter text-[10px] uppercase tracking-wider text-ink-soft"
          >
            {WEEKDAY_MIN[weekdayIndex]}
          </span>
        ))}

        {cells.map((cell) => {
          const mood = byDate.get(cell.date);
          const meta = mood ? moodMeta(mood) : null;
          const isSelected = cell.date === selected;
          return (
            <button
              key={cell.date}
              type="button"
              role="gridcell"
              onClick={() => onSelect(cell.date)}
              aria-label={`${cell.date}${mood ? `: ${meta?.label}` : ': no mood logged'}`}
              aria-pressed={isSelected}
              className={cx(
                'relative flex aspect-square flex-col items-center justify-center rounded-[8px] p-1 text-xs transition cursor-pointer',
                !cell.inMonth && 'opacity-30',
                isSelected
                  ? 'ring-2 ring-lilac-300/65'
                  : 'hover:ring-1 hover:ring-lilac-300/40',
                mood
                  ? meta
                    ? accent(meta.color).soft
                    : 'bg-paper-2'
                  : 'bg-paper-2/40 text-ink-soft hover:bg-paper-2/70',
                cell.date === today && !isSelected && 'ring-1 ring-lilac-300/50',
              )}
            >
              <span className="mb-0.5 font-typewriter text-[10px] leading-none tabular-nums text-ink-soft">
                {cell.day}
              </span>
              {mood ? (
                <CatFace mood={mood} size={24} decorative />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-divider" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      <p className="font-typewriter text-xs text-ink-soft">
        The sketches show how each day felt. Pick any date to log or update.
      </p>
    </div>
  );
}

export function moodLabel(level: MoodLevel | null): string {
  return level ? moodMeta(level).label : 'Nothing logged';
}
