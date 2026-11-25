import { Check } from 'lucide-react';
import type { AccentColor } from '../../types';
import { accent } from '../../lib/color';
import { cx } from '../../lib/cx';

export interface TaskCheckboxProps {
  checked: boolean;
  onChange: () => void;
  /** Required: describes the thing being ticked. */
  label: string;
  color?: AccentColor;
  size?: 'sm' | 'md';
  className?: string;
}

/** Journal ink checkbox. State is shown with a crisp tick and strikethrough, not colour alone. */
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
        'grid shrink-0 place-items-center rounded-[3px] border-[1.5px] transition duration-150 cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        dimension,
        checked
          ? cx('border-transparent', tone.solid)
          : 'border-lilac-200 bg-cream hover:border-accent',
        className,
      )}
    >
      {checked && (
        <Check
          size={size === 'sm' ? 12 : 14}
          strokeWidth={2.8}
          aria-hidden="true"
          className="motion-safe:animate-pop"
        />
      )}
    </button>
  );
}
