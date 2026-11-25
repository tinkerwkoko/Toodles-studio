import { Check } from 'lucide-react';
import type { AccentColor } from '../../types';
import { accent } from '../../lib/color';
import { cx } from '../../lib/cx';

export interface TaskCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  color?: AccentColor;
  size?: 'sm' | 'md';
  className?: string;
}

/** Organic botanical checkbox with forest/wildflower ink fill on completion. */
export function TaskCheckbox({
  checked,
  onChange,
  label,
  color = 'lilac',
  size = 'md',
  className,
}: TaskCheckboxProps) {
  const tone = accent(color);
  const dimension = size === 'sm' ? 'h-[20px] w-[20px]' : 'h-[22px] w-[22px]';
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
      className={cx(
        'grid shrink-0 cursor-pointer place-items-center rounded-[5px] border-[1.5px] transition duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        dimension,
        checked
          ? cx('border-transparent', tone.solid)
          : 'border-sage/75 bg-cream hover:border-forest',
        className,
      )}
    >
      {checked && (
        <Check
          size={size === 'sm' ? 12 : 14}
          strokeWidth={2.7}
          aria-hidden="true"
          className="motion-safe:animate-pop"
        />
      )}
    </button>
  );
}
