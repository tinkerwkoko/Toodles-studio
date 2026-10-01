import { Link } from 'react-router-dom';
import { Check, Flame, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { habitStreak, isHabitChecked } from '../../lib/habit';
import { todayString } from '../../lib/date';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';

export function TodayHabitsCard() {
  const { data, actions } = useToodles();
  const { openCreate } = useUi();
  const today = todayString();

  const habits = data.habits.filter((h) => !h.archived).slice(0, 3);

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-divider pb-2">
        <h2 className="font-display text-[18px] text-ink">Today's habits</h2>
        <Link
          to="/wellbeing"
          className="text-xs font-title font-medium text-ink-soft hover:text-ink hover:underline"
        >
          All habits
        </Link>
      </div>

      {habits.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs font-sans text-ink-soft">
            No habits yet. Start with one small daily rhythm.
          </p>
          <button
            type="button"
            onClick={() => openCreate('habit')}
            className="mt-2 inline-flex items-center gap-1 text-xs font-title font-medium text-ink hover:underline"
          >
            <Plus size={13} aria-hidden="true" />
            <span>Add a habit</span>
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-divider">
          {habits.map((habit) => {
            const checked = isHabitChecked(data.habitChecks, habit.id, today);
            const streak = habitStreak(habit, data.habitChecks, today).current;

            return (
              <li
                key={habit.id}
                className="flex items-center justify-between gap-2.5 py-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => actions.toggleHabitCheck(habit.id, today)}
                    aria-label={`Tick ${habit.name} for today`}
                    className={`grid h-6 w-6 place-items-center rounded-[7px] border transition duration-150 ${
                      checked
                        ? 'border-peach-300 bg-peach-300 text-ink'
                        : 'border-lilac-200 bg-cream text-transparent hover:border-accent'
                    }`}
                  >
                    <Check size={14} strokeWidth={2.5} />
                  </button>
                  <span
                    className={`font-title font-medium text-[15px] truncate ${
                      checked ? 'text-ink-soft line-through' : 'text-ink'
                    }`}
                  >
                    {habit.name}
                  </span>
                </div>

                {streak > 0 && (
                  <span className="flex items-center gap-1 text-xs font-sans text-peach-700 bg-peach-100 rounded-full px-2 py-0.5 shrink-0">
                    <Flame size={12} className="text-peach-500" aria-hidden="true" />
                    <span>{streak}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
