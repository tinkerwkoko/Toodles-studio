import { useEffect, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { addDays, formatDay, monthGrid, todayString } from '../../lib/date';
import { cx } from '../../lib/cx';

export interface DatePickerProps {
  value?: string | null;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  compact = false,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const today = todayString();

  const initialDate = value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T12:00:00') : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth() + 1);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open]);

  function stepMonth(delta: number) {
    let nextMonth = viewMonth + delta;
    let nextYear = viewYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    setViewMonth(nextMonth);
    setViewYear(nextYear);
  }

  function handleSelectDate(date: string) {
    onChange(date);
    setOpen(false);
  }

  const cells = monthGrid(viewYear, viewMonth, 1);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cx(
          'w-full flex items-center justify-between gap-2 rounded-[4px] border border-lilac-200 bg-cream px-3 py-2 text-sm text-ink font-sans transition',
          'hover:border-dusty-rose focus:outline-none focus:border-accent disabled:opacity-50 cursor-pointer',
          compact && 'px-2.5 py-1.5 text-xs',
          open && 'border-accent ring-2 ring-accent/15',
          className,
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarIcon size={compact ? 13 : 15} className="text-ink-soft shrink-0" aria-hidden="true" />
          <span className={value ? 'text-ink font-medium tabular-nums' : 'text-text-faint'}>
            {value ? formatDay(value) : placeholder}
          </span>
        </span>

        {value && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="grid h-5 w-5 place-items-center rounded-[3px] text-ink-soft hover:bg-paper-2 hover:text-ink transition"
          >
            <X size={12} aria-hidden="true" />
          </span>
        )}
      </button>

      {/* Desk Almanac Popover */}
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 rounded-[5px] border border-lilac-200 bg-cream p-3.5 shadow-lift motion-safe:animate-fade-in text-ink">
          <div className="flex flex-wrap items-center gap-2 pb-2.5 border-b border-divider text-xs font-sans">
            <button
              type="button"
              onClick={() => handleSelectDate(today)}
              className="rounded-[3px] bg-paper-2/80 px-2 py-0.5 text-ink hover:bg-paper-2 transition cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleSelectDate(addDays(today, 1))}
              className="rounded-[3px] bg-paper-2/80 px-2 py-0.5 text-ink hover:bg-paper-2 transition cursor-pointer"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleSelectDate(addDays(today, 7))}
              className="rounded-[3px] bg-paper-2/80 px-2 py-0.5 text-ink hover:bg-paper-2 transition cursor-pointer"
            >
              +1 week
            </button>
            {value && (
              <button
                type="button"
                onClick={() => handleSelectDate('')}
                className="ml-auto text-ink-soft hover:text-accent underline underline-offset-2 transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between py-2.5">
            <button
              type="button"
              onClick={() => stepMonth(-1)}
              className="grid h-7 w-7 place-items-center rounded-[3px] hover:bg-paper-2 transition text-ink cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="font-display text-base font-semibold tracking-wide text-ink tabular-nums">
              {monthNames[viewMonth - 1]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => stepMonth(1)}
              className="grid h-7 w-7 place-items-center rounded-[3px] hover:bg-paper-2 transition text-ink cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-sans text-[11px] font-medium text-text-faint pb-1.5 border-b border-divider/60 mb-1.5">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>

          <div className="grid grid-cols-7 gap-0.5 tabular-nums">
            {cells.map((cell) => {
              const isSelected = cell.date === value;
              const isCurrentDay = cell.date === today;
              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => handleSelectDate(cell.date)}
                  className={cx(
                    'grid h-8 w-8 place-items-center rounded-[3px] text-xs font-sans transition cursor-pointer',
                    !cell.inMonth && 'opacity-30',
                    isSelected
                      ? 'bg-lilac-300 text-primary-ink font-semibold'
                      : isCurrentDay
                        ? 'border border-accent text-accent font-semibold hover:bg-paper-2/70'
                        : 'hover:bg-paper-2/70 text-ink',
                  )}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
