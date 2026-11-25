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
      <legend className="font-typewriter text-[11px] uppercase tracking-[0.06em] text-ink-soft">
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
                'flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[8px] px-2.5 py-2 font-typewriter transition cursor-pointer',
                compact ? 'flex-col gap-1 text-[0.68rem]' : 'text-xs',
                active
                  ? cx(tone.soft, tone.text, 'ring-1 ring-inset ring-current/30')
                  : 'bg-paper-2/50 text-ink-soft hover:bg-paper-2 hover:text-ink',
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
        'inline-flex items-center gap-1.5 rounded-[6px] px-2 py-0.5 font-typewriter text-[11px]',
        tone.soft,
        tone.text,
        className,
      )}
    >
      <CatFace mood={mood} size={16} />
      {withLabel && meta.label}
    </span>
  );
}
