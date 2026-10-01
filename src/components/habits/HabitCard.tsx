import { Flame, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { DateString, Habit, HabitCheck } from '../../types';
import { accent } from '../../lib/color';
import { WEEKDAY_MIN, todayString, weekStart } from '../../lib/date';
import { habitStreak, isHabitChecked, isHabitScheduled } from '../../lib/habit';
import { Menu } from '../ui/Menu';
import { cx } from '../../lib/cx';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';

export interface HabitCardProps {
  habit: Habit;
  checks: HabitCheck[];
  weekStartsOn: 0 | 1;
  onEdit: (habit: Habit) => void;
}

/** One habit with its current week of dots and a streak count. */
export function HabitCard({ habit, checks, weekStartsOn, onEdit }: HabitCardProps) {
  const { actions } = useToodles();
  const { pushToast } = useUi();
  const today = todayString();
  const tone = accent(habit.color);
  const streak = habitStreak(habit, checks, today);
  const start = weekStart(today, weekStartsOn);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${start}T00:00:00`);
    date.setDate(date.getDate() + index);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;
    return { date: iso, label: WEEKDAY_MIN[date.getDay()] ?? '' };
  });

  return (
    <li className="rounded-3xl border border-lilac-200 bg-cream p-3.5">
      <div className="flex items-center gap-2">
        <span className={cx('h-3 w-3 shrink-0 rounded-full', tone.mid)} aria-hidden="true" />
        <p className="min-w-0 flex-1 truncate text-base font-bold text-ink">{habit.name}</p>
        <span className={cx('flex items-center gap-1 text-xs font-bold', tone.text)}>
          <Flame size={13} aria-hidden="true" />
          {streak.current > 0 ? `${streak.current} day streak` : 'No streak yet'}
        </span>
        <Menu
          label={`Options for ${habit.name}`}
          header="Habit"
          items={[
            {
              label: 'Edit habit',
              icon: <Pencil size={16} aria-hidden="true" />,
              onSelect: () => onEdit(habit),
            },
            {
              label: 'Delete habit',
              icon: <Trash2 size={16} aria-hidden="true" />,
              danger: true,
              onSelect: () => {
                actions.deleteHabit(habit.id);
                pushToast('Habit deleted');
              },
            },
          ]}
        >
          <MoreVertical size={17} aria-hidden="true" />
        </Menu>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {days.map((day) => {
          const scheduled = isHabitScheduled(habit, day.date as DateString);
          const done = isHabitChecked(checks, habit.id, day.date);
          const isToday = day.date === today;
          return (
            <button
              key={day.date}
              type="button"
              disabled={!scheduled}
              onClick={() => actions.toggleHabitCheck(habit.id, day.date)}
              aria-label={`${habit.name} on ${day.date}${done ? ': done' : ''}`}
              aria-pressed={done}
              className={cx(
                'grid h-10 flex-1 place-items-center rounded-xl border text-xs font-bold transition',
                done ? cx(tone.solid, 'border-transparent') : 'border-lilac-200 bg-cream text-ink-soft',
                !scheduled && 'opacity-35',
                isToday && !done && 'ring-2 ring-lilac-300',
              )}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-ink-soft">
        Best streak so far: {streak.best} day{streak.best === 1 ? '' : 's'}
      </p>
    </li>
  );
}
