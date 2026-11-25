import { Check, Flame, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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

/** One habit row with its current week of botanical check tiles and streak count. */
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
    <li className="py-4 first:pt-1 last:pb-0">
      <div className="flex items-center gap-2.5">
        <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', tone.mid)} aria-hidden="true" />
        <p className="min-w-0 flex-1 truncate font-title text-lg text-ink">
          {habit.name}
        </p>
        <span className={cx('flex items-center gap-1 font-typewriter text-xs tabular-nums', tone.text)}>
          <Flame size={13} aria-hidden="true" />
          {streak.current > 0 ? `${streak.current}d streak` : 'Starting out'}
        </span>
        <Menu
          label={`Options for ${habit.name}`}
          header="Habit"
          items={[
            {
              label: 'Edit habit',
              icon: <Pencil size={15} aria-hidden="true" />,
              onSelect: () => onEdit(habit),
            },
            {
              label: 'Delete habit',
              icon: <Trash2 size={15} aria-hidden="true" />,
              danger: true,
              onSelect: () => {
                actions.deleteHabit(habit.id);
                pushToast('Habit deleted');
              },
            },
          ]}
        >
          <MoreVertical size={16} aria-hidden="true" />
        </Menu>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5">
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
                'flex h-10 flex-col items-center justify-center rounded-[7px] font-typewriter text-[11px] transition cursor-pointer',
                done
                  ? cx(tone.solid)
                  : 'bg-cream text-ink-soft hover:bg-lilac-50 hover:text-ink',
                !scheduled && 'opacity-35',
                isToday && !done && 'ring-1 ring-lilac-300/70',
              )}
            >
              {done ? (
                <Check size={14} strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <span>{day.label}</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-2 font-typewriter text-[11px] text-ink-soft tabular-nums">
        Best streak: {streak.best} day{streak.best === 1 ? '' : 's'}
      </p>
    </li>
  );
}
