import { useEffect, useRef, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { cx } from '../../lib/cx';

export interface TimePickerProps {
  value?: string | null;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  disabled?: boolean;
}

const PRESET_BLOCKS = [
  { label: '8 am - 10 am', value: '08:00 - 10:00' },
  { label: '10 am - 12 pm', value: '10:00 - 12:00' },
  { label: '1 pm - 3 pm', value: '13:00 - 15:00' },
  { label: '3 pm - 5 pm', value: '15:00 - 17:00' },
  { label: 'Morning (9am)', value: '09:00' },
  { label: 'Noon (12pm)', value: '12:00' },
  { label: 'Afternoon (2pm)', value: '14:00' },
  { label: 'Evening (5pm)', value: '17:00' },
  { label: 'Night (8pm)', value: '20:00' },
];

export function TimePicker({
  value,
  onChange,
  placeholder = 'Pick a time or time block',
  className,
  compact = false,
  disabled = false,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [customText, setCustomText] = useState(value || '');

  const [fromHour, setFromHour] = useState('08');
  const [toHour, setToHour] = useState('10');

  useEffect(() => {
    setCustomText(value || '');
  }, [value]);

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

  function handleSelectTime(t: string) {
    onChange(t);
    setOpen(false);
  }

  function handleApplyCustomRange() {
    const range = `${fromHour.padStart(2, '0')}:00 - ${toHour.padStart(2, '0')}:00`;
    onChange(range);
    setOpen(false);
  }

  function handleApplyCustomText() {
    if (customText.trim()) {
      onChange(customText.trim());
    }
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cx(
          'w-full flex items-center justify-between gap-2 rounded-[8px] border border-divider/80 bg-cream px-3 py-2 font-typewriter text-xs text-ink transition',
          'hover:border-accent/50 focus:outline-none focus:border-accent disabled:opacity-50 cursor-pointer',
          compact && 'px-2.5 py-1.5 text-[11px]',
          open && 'border-accent ring-2 ring-accent/15',
          className,
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <Clock size={compact ? 13 : 14} className="text-ink-soft shrink-0" aria-hidden="true" />
          <span className={value ? 'text-ink tabular-nums' : 'text-text-faint'}>
            {value || placeholder}
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
            className="grid h-5 w-5 place-items-center rounded-[5px] text-ink-soft hover:bg-paper-2 hover:text-ink transition"
          >
            <X size={12} aria-hidden="true" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 rounded-[10px] border border-divider/70 bg-cream p-3.5 shadow-lift motion-safe:animate-fade-in text-ink space-y-3">
          <div className="flex items-center justify-between border-b border-divider/60 pb-2">
            <span className="font-typewriter text-xs text-ink-soft">Time or time block</span>
            {value && (
              <button
                type="button"
                onClick={() => handleSelectTime('')}
                className="font-typewriter text-xs text-ink-soft hover:text-accent underline underline-offset-2 transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-0.5 tabular-nums">
            {PRESET_BLOCKS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleSelectTime(preset.value)}
                className={cx(
                  'flex items-center justify-between rounded-[6px] px-2.5 py-1.5 font-typewriter text-[11px] transition cursor-pointer',
                  value === preset.value
                    ? 'bg-lilac-300 text-primary-ink'
                    : 'bg-paper-2/65 hover:bg-paper-2 text-ink',
                )}
              >
                <span className="truncate">{preset.label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-divider/60 pt-2.5 space-y-2">
            <span className="block font-typewriter text-[11px] text-ink-soft">
              Custom time block range
            </span>
            <div className="flex items-center justify-between gap-1.5 tabular-nums">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={fromHour}
                  onChange={(e) => setFromHour(e.target.value.slice(-2))}
                  className="w-12 rounded-[6px] border border-divider/80 bg-lilac-50 p-1.5 text-center font-typewriter text-xs text-ink focus:border-accent focus:outline-none"
                />
                <span className="font-typewriter text-xs text-ink-soft">:00</span>
              </div>
              <span className="font-typewriter text-xs text-ink-soft">to</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={toHour}
                  onChange={(e) => setToHour(e.target.value.slice(-2))}
                  className="w-12 rounded-[6px] border border-divider/80 bg-lilac-50 p-1.5 text-center font-typewriter text-xs text-ink focus:border-accent focus:outline-none"
                />
                <span className="font-typewriter text-xs text-ink-soft">:00</span>
              </div>
              <button
                type="button"
                onClick={handleApplyCustomRange}
                className="rounded-[6px] bg-lilac-300 px-2.5 py-1.5 font-typewriter text-xs text-primary-ink hover:bg-lilac-400 transition cursor-pointer"
              >
                Set
              </button>
            </div>
          </div>

          <div className="border-t border-divider/60 pt-2.5">
            <span className="block font-typewriter text-[11px] text-ink-soft mb-1.5">
              Or type custom (e.g. 8 am - 10 am)
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g. 8 am - 10 am"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyCustomText();
                  }
                }}
                className="flex-1 rounded-[6px] border border-divider/80 bg-lilac-50 px-2 py-1 font-typewriter text-xs text-ink focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyCustomText}
                className="rounded-[6px] bg-paper-2 px-2.5 py-1 font-typewriter text-xs text-ink hover:bg-lilac-200/60 transition cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
