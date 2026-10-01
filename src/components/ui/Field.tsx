import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cx } from '../../lib/cx';

/* Shared input look: clean 1px border, soft whimsical radius, 32px desktop height, 40px touch. */
const CONTROL =
  'w-full rounded-2xl border border-lilac-200 bg-cream px-3.5 py-2 text-ink text-sm placeholder:text-ink-soft/70 ' +
  'transition focus:border-accent focus:outline-none disabled:opacity-60';

export interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, children, className }: FieldProps) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-title font-medium text-ink"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-soft font-sans">{hint}</p>}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  compact?: boolean;
}

export function Input({ className, compact = false, ...rest }: InputProps) {
  return (
    <input
      className={cx(CONTROL, compact && 'px-3 py-1.5 text-sm', className)}
      {...rest}
    />
  );
}

export function Textarea({ className, rows = 4, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cx(CONTROL, 'resize-y leading-relaxed', className)} {...rest} />;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  compact?: boolean;
}

interface ParsedOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, compact = false, children, value, onChange, disabled, id, name, ...rest },
  ref,
) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse option elements from children
  const options: ParsedOption[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      const el = child as ReactElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>;
      const optVal = el.props.value !== undefined ? String(el.props.value) : '';
      options.push({
        value: optVal,
        label: el.props.children ?? optVal,
        disabled: el.props.disabled,
      });
    }
  });

  const selectedOpt = options.find((opt) => String(opt.value) === String(value)) ?? options[0];

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

  function handleSelect(opt: ParsedOption) {
    if (opt.disabled) return;
    setOpen(false);
    if (onChange) {
      const syntheticEvent = {
        target: { value: opt.value, name: name ?? '' },
        currentTarget: { value: opt.value, name: name ?? '' },
      } as unknown as ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden native select for form support & ref */}
      <select
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        {...rest}
      >
        {children}
      </select>

      {/* Whimsical custom trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(
          CONTROL,
          'flex items-center justify-between gap-2 text-left cursor-pointer',
          compact && 'px-3 py-1.5 text-sm',
          open && 'border-accent ring-2 ring-accent/20',
          className,
        )}
      >
        <span className="truncate">{selectedOpt?.label ?? 'Select...'}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cx('shrink-0 text-ink-soft transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {/* Whimsical dropdown popover */}
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-2xl border border-lilac-200 bg-cream p-1.5 shadow-md motion-safe:animate-fade-in"
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onClick={() => handleSelect(opt)}
                className={cx(
                  'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-left transition',
                  isSelected
                    ? 'bg-lilac-100 text-ink font-medium'
                    : 'text-ink-soft hover:bg-lilac-50 hover:text-ink',
                  opt.disabled && 'opacity-40 cursor-not-allowed',
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={14} className="shrink-0 text-accent" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
