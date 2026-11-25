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
        <legend className="text-xs font-medium uppercase tracking-wider text-ink-soft">
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
                'min-h-10 rounded-[4px] border px-4 text-sm font-medium transition',
                frequency === option
                  ? 'border-lilac-300 bg-lilac-300 text-primary-ink'
                  : 'border-lilac-200 bg-cream text-ink hover:bg-lilac-100',
              )}
            >
              {option === 'daily' ? 'Every day' : 'Certain weekdays'}
            </button>
          ))}
        </div>
      </fieldset>

      {frequency === 'weekly' && (
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium uppercase tracking-wider text-ink-soft">
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
                  'grid h-10 w-10 place-items-center rounded-[4px] border text-xs font-medium transition',
                  weekdays.includes(day)
                    ? 'border-lilac-300 bg-lilac-300 text-primary-ink'
                    : 'border-lilac-200 bg-cream text-ink hover:bg-lilac-100',
                )}
              >
                {weekdayInitials([day])}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wider text-ink-soft">
          Ink colour
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
                'h-8 w-8 rounded-[4px] border-2 transition',
                accent(key).mid,
                color === key ? 'scale-105 border-ink' : 'border-transparent hover:scale-105',
              )}
            />
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-end gap-2 border-t border-divider pt-4">
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
