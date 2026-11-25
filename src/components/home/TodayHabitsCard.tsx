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
    <Card padding="md" className="space-y-3.5">
      <div className="flex items-baseline justify-between gap-2 border-b border-divider/70 pb-2.5">
        <h2 className="font-display text-2xl text-ink">Today&apos;s habits</h2>
        <Link
          to="/wellbeing"
          className="font-typewriter text-xs text-ink-soft hover:text-accent underline underline-offset-4 transition"
        >
          All habits
        </Link>
      </div>

      {habits.length === 0 ? (
        <div className="py-4 text-center">
          <p className="font-typewriter text-xs text-ink-soft leading-relaxed">
            No habits yet. Start with one small daily rhythm.
          </p>
          <button
            type="button"
            onClick={() => openCreate('habit')}
            className="mt-3 inline-flex items-center gap-1 font-typewriter text-xs text-accent hover:underline underline-offset-4 cursor-pointer"
          >
            <Plus size={13} aria-hidden="true" />
            <span>Add a habit</span>
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-divider/60">
          {habits.map((habit) => {
            const checked = isHabitChecked(data.habitChecks, habit.id, today);
            const streak = habitStreak(habit, data.habitChecks, today).current;

            return (
              <li
                key={habit.id}
                className="flex items-center justify-between gap-2.5 py-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => actions.toggleHabitCheck(habit.id, today)}
                    aria-label={`Tick ${habit.name} for today`}
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border-[1.5px] transition duration-150 cursor-pointer ${
                      checked
                        ? 'border-lilac-300 bg-lilac-300 text-primary-ink'
                        : 'border-lilac-200 bg-cream text-transparent hover:border-accent'
                    }`}
                  >
                    <Check size={13} strokeWidth={2.5} />
                  </button>
                  <span
                    className={`font-sans text-sm truncate ${
                      checked ? 'text-ink-soft line-through' : 'text-ink font-medium'
                    }`}
                  >
                    {habit.name}
                  </span>
                </div>

                {streak > 0 && (
                  <span className="flex items-center gap-1 font-typewriter text-xs text-peach-700 tabular-nums shrink-0">
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
