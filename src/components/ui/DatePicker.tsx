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

  // Current view month & year
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
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cx(
          'w-full flex items-center justify-between gap-2 rounded-2xl border border-lilac-200 bg-cream px-3 py-2 text-sm text-ink transition',
          'hover:border-accent focus:outline-none focus:border-accent disabled:opacity-50 cursor-pointer',
          compact && 'px-2.5 py-1.5 text-xs',
          open && 'border-accent ring-2 ring-accent/20',
          className,
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarIcon size={compact ? 13 : 15} className="text-accent shrink-0" aria-hidden="true" />
          <span className={value ? 'text-ink font-title font-medium' : 'text-ink-soft/70 font-sans'}>
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
            className="grid h-5 w-5 place-items-center rounded-full text-ink-soft hover:bg-lilac-100 hover:text-ink transition"
          >
            <X size={12} aria-hidden="true" />
          </span>
        )}
      </button>

      {/* Whimsical Calendar Popover */}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 rounded-3xl border border-lilac-200 bg-cream p-3.5 shadow-lg motion-safe:animate-fade-in text-ink">
          {/* Quick chips */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-divider">
            <button
              type="button"
              onClick={() => handleSelectDate(today)}
              className="rounded-full bg-lilac-100 px-2.5 py-1 text-[11px] font-title font-medium text-ink hover:bg-lilac-200 transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleSelectDate(addDays(today, 1))}
              className="rounded-full bg-lilac-100 px-2.5 py-1 text-[11px] font-title font-medium text-ink hover:bg-lilac-200 transition"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleSelectDate(addDays(today, 7))}
              className="rounded-full bg-lilac-100 px-2.5 py-1 text-[11px] font-title font-medium text-ink hover:bg-lilac-200 transition"
            >
              In 1 week
            </button>
            {value && (
              <button
                type="button"
                onClick={() => handleSelectDate('')}
                className="ml-auto text-[11px] font-sans text-ink-soft hover:text-ink underline transition"
              >
                Clear
              </button>
            )}
          </div>

          {/* Month & Year Navigation */}
          <div className="flex items-center justify-between py-2">
            <button
              type="button"
              onClick={() => stepMonth(-1)}
              className="grid h-7 w-7 place-items-center rounded-full hover:bg-lilac-100 transition text-ink"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-display text-sm text-ink">
              {monthNames[viewMonth - 1]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => stepMonth(1)}
              className="grid h-7 w-7 place-items-center rounded-full hover:bg-lilac-100 transition text-ink"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-title text-[11px] font-medium text-ink-soft pb-1">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              const isSelected = cell.date === value;
              const isCurrentDay = cell.date === today;
              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => handleSelectDate(cell.date)}
                  className={cx(
                    'grid h-8 w-8 place-items-center rounded-xl text-xs font-title transition',
                    !cell.inMonth && 'opacity-30',
                    isSelected
                      ? 'bg-accent text-ink font-bold shadow-sm'
                      : isCurrentDay
                        ? 'border border-accent text-accent font-semibold hover:bg-lilac-100'
                        : 'hover:bg-lilac-100 text-ink',
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
