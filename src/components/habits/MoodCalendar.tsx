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
          className="grid h-11 w-11 place-items-center rounded-full border border-lilac-200 bg-cream text-lilac-700 hover:bg-lilac-100"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <p className="font-display text-lg text-lilac-700">{formatMonthYear(year, month)}</p>
        <button
          type="button"
          onClick={() => onStep(1)}
          aria-label="Next month"
          className="grid h-11 w-11 place-items-center rounded-full border border-lilac-200 bg-cream text-lilac-700 hover:bg-lilac-100"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Mood calendar">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <span
            key={`${day}-${index}`}
            aria-hidden="true"
            className="pb-1 text-center text-xs font-bold text-ink-soft"
          >
            {WEEKDAY_MIN[index]}
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
                'relative flex aspect-square flex-col items-center justify-center rounded-2xl border text-xs font-bold transition p-1',
                !cell.inMonth && 'opacity-25',
                isSelected
                  ? 'border-accent ring-2 ring-accent/40 shadow-sm'
                  : 'border-lilac-200 hover:border-accent/40',
                mood
                  ? meta ? accent(meta.color).soft : 'bg-lilac-50'
                  : 'bg-cream text-ink-soft hover:bg-lilac-50',
                cell.date === today && !isSelected && 'ring-2 ring-accent/30',
              )}
            >
              <span className="text-[11px] leading-none mb-0.5 text-ink font-title">{cell.day}</span>
              {mood ? (
                <CatFace mood={mood} size={26} decorative />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full bg-lilac-200/50" />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-ink-soft">
        The cat faces show how you felt each day. Pick any day to log or update.
      </p>
    </div>
  );
}

export function moodLabel(level: MoodLevel | null): string {
  return level ? moodMeta(level).label : 'Nothing logged';
}
