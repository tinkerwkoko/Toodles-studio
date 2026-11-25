import type { MoodLevel } from '../../types';
import { accent } from '../../lib/color';
import { MOODS, moodMeta } from '../../lib/mood';
import { CatFace } from '../CatFace';
import { cx } from '../../lib/cx';

export interface MoodPickerProps {
  value: MoodLevel | null;
  onChange: (mood: MoodLevel) => void;
  /** Quiet labels for tight spaces like a diary form row. */
  compact?: boolean;
  label?: string;
}

/** One tap to log how today (or a diary day) felt. No health claims. */
export function MoodPicker({
  value,
  onChange,
  compact = false,
  label = 'How did the day feel?',
}: MoodPickerProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-medium uppercase tracking-wider text-ink-soft">
        {label}
      </legend>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {MOODS.map((mood) => {
          const active = value === mood.level;
          const tone = accent(mood.color);
          return (
            <button
              key={mood.level}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(mood.level)}
              className={cx(
                'flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[4px] border px-2.5 py-2 transition',
                compact ? 'flex-col gap-1 text-[0.7rem]' : 'text-xs',
                active
                  ? cx(tone.soft, tone.border, tone.text, 'font-semibold ring-1 ring-inset ring-current/20')
                  : 'border-lilac-200 bg-cream text-ink-soft hover:bg-lilac-100/60 hover:text-ink',
              )}
              title={mood.hint}
            >
              <CatFace mood={mood.level} size={compact ? 26 : 30} />
              <span>{mood.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export interface MoodBadgeProps {
  mood: MoodLevel;
  withLabel?: boolean;
  className?: string;
}

export function MoodBadge({ mood, withLabel = true, className }: MoodBadgeProps) {
  const meta = moodMeta(mood);
  const tone = accent(meta.color);
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-0.5 text-xs font-medium',
        tone.soft,
        tone.border,
        tone.text,
        className,
      )}
    >
      <CatFace mood={mood} size={16} />
      {withLabel && meta.label}
    </span>
  );
}
