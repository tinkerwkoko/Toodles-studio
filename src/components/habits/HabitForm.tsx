import { useState, type FormEvent } from 'react';
import type { AccentColor, Habit } from '../../types';
import { ACCENT_KEYS, ACCENT_LABELS, accent } from '../../lib/color';
import { WEEKDAY_LONG } from '../../lib/date';
import { weekdayInitials } from '../../lib/habit';
import { Button } from '../ui/Button';
import { Field, Input } from '../ui/Field';
import { cx } from '../../lib/cx';

export interface HabitFormValues {
  name: string;
  color: AccentColor;
  frequency: 'daily' | 'weekly';
  weekdays: number[];
}

export interface HabitFormProps {
  initial?: Habit;
  submitLabel: string;
  onSubmit: (values: HabitFormValues) => void;
  onDelete?: () => void;
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

/** Create or edit a habit: name, colour and how often it should happen. */
export function HabitForm({ initial, submitLabel, onSubmit, onDelete }: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState<AccentColor>(initial?.color ?? 'mint');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(initial?.frequency ?? 'daily');
  const [weekdays, setWeekdays] = useState<number[]>(
    initial?.weekdays ?? [1, 2, 3, 4, 5],
  );

  const canSubmit = name.trim().length > 0;

  function toggleDay(day: number): void {
    setWeekdays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      color,
      frequency,
      weekdays: frequency === 'daily' ? ALL_DAYS : weekdays.length > 0 ? weekdays : [1],
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="What would you like to do?" htmlFor="habit-name">
        <Input
          id="habit-name"
          data-autofocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Read 10 pages"
        />
      </Field>

      <fieldset className="space-y-2">
        <legend className="font-typewriter text-[11px] uppercase tracking-[0.06em] text-ink-soft">
          How often?
        </legend>
        <div className="flex flex-wrap gap-2">
          {(['daily', 'weekly'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={frequency === option}
              onClick={() => setFrequency(option)}
              className={cx(
                'min-h-10 rounded-[8px] px-4 font-typewriter text-xs transition cursor-pointer',
                frequency === option
                  ? 'bg-lilac-300 text-primary-ink'
                  : 'bg-paper-2/65 text-ink hover:bg-paper-2',
              )}
            >
              {option === 'daily' ? 'Every day' : 'Certain weekdays'}
            </button>
          ))}
        </div>
      </fieldset>

      {frequency === 'weekly' && (
        <fieldset className="space-y-2">
          <legend className="font-typewriter text-[11px] uppercase tracking-[0.06em] text-ink-soft">
            Which days?
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {ALL_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                aria-label={WEEKDAY_LONG[day]}
                aria-pressed={weekdays.includes(day)}
                onClick={() => toggleDay(day)}
                className={cx(
                  'grid h-10 w-10 place-items-center rounded-[8px] font-typewriter text-xs transition cursor-pointer',
                  weekdays.includes(day)
                    ? 'bg-lilac-300 text-primary-ink'
                    : 'bg-paper-2/65 text-ink hover:bg-paper-2',
                )}
              >
                {weekdayInitials([day])}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-2">
        <legend className="font-typewriter text-[11px] uppercase tracking-[0.06em] text-ink-soft">
          Colour
        </legend>
        <div className="flex flex-wrap gap-2">
          {ACCENT_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              aria-label={ACCENT_LABELS[key]}
              aria-pressed={color === key}
              onClick={() => setColor(key)}
              className={cx(
                'h-8 w-8 rounded-[8px] border-2 transition cursor-pointer',
                accent(key).mid,
                color === key ? 'scale-105 border-ink' : 'border-transparent hover:scale-105',
              )}
            />
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-end gap-2 border-t border-divider/65 pt-4">
        {onDelete && (
          <Button variant="ghost" className="text-rose-700 hover:bg-rose-100" onClick={onDelete}>
            Delete habit
          </Button>
        )}
        <Button type="submit" disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
