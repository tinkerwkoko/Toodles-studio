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
          <Clock size={compact ? 13 : 15} className="text-accent shrink-0" aria-hidden="true" />
          <span className={value ? 'text-ink font-title font-medium' : 'text-ink-soft/70 font-sans'}>
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
            className="grid h-5 w-5 place-items-center rounded-full text-ink-soft hover:bg-lilac-100 hover:text-ink transition"
          >
            <X size={12} aria-hidden="true" />
          </span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 rounded-3xl border border-lilac-200 bg-cream p-4 shadow-lg motion-safe:animate-fade-in text-ink space-y-3">
          <div className="flex items-center justify-between border-b border-divider pb-2">
            <span className="font-title font-medium text-xs text-ink-soft">Time or time block</span>
            {value && (
              <button
                type="button"
                onClick={() => handleSelectTime('')}
                className="text-[11px] font-sans text-ink-soft hover:text-ink underline transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick presets (single hours and multi-hour blocks) */}
          <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-0.5">
            {PRESET_BLOCKS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleSelectTime(preset.value)}
                className={cx(
                  'flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-title transition cursor-pointer',
                  value === preset.value
                    ? 'bg-accent text-ink font-medium shadow-sm'
                    : 'bg-lilac-100/70 hover:bg-lilac-100 text-ink',
                )}
              >
                <span className="truncate">{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Block Range Creator (e.g. 8am - 10am) */}
          <div className="border-t border-divider pt-2.5 space-y-2">
            <span className="block text-[11px] font-title font-medium text-ink-soft">
              Custom time block range
            </span>
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={fromHour}
                  onChange={(e) => setFromHour(e.target.value.slice(-2))}
                  className="w-12 rounded-xl border border-lilac-200 bg-lilac-50 p-1.5 text-center font-title text-xs text-ink focus:border-accent focus:outline-none"
                />
                <span className="text-xs font-sans text-ink-soft">:00</span>
              </div>
              <span className="text-xs font-sans text-ink-soft">to</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={toHour}
                  onChange={(e) => setToHour(e.target.value.slice(-2))}
                  className="w-12 rounded-xl border border-lilac-200 bg-lilac-50 p-1.5 text-center font-title text-xs text-ink focus:border-accent focus:outline-none"
                />
                <span className="text-xs font-sans text-ink-soft">:00</span>
              </div>
              <button
                type="button"
                onClick={handleApplyCustomRange}
                className="rounded-xl bg-accent px-2.5 py-1.5 text-xs font-title font-medium text-ink hover:opacity-90 transition cursor-pointer"
              >
                Set
              </button>
            </div>
          </div>

          {/* Direct Text Input */}
          <div className="border-t border-divider pt-2">
            <span className="block text-[11px] font-title font-medium text-ink-soft mb-1">
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
                className="flex-1 rounded-xl border border-lilac-200 bg-lilac-50 px-2 py-1 text-xs font-title text-ink focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyCustomText}
                className="rounded-xl bg-lilac-200 px-2.5 py-1 text-xs font-title font-medium text-ink hover:bg-lilac-300 transition cursor-pointer"
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
