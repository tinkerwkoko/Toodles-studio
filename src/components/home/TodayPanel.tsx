import { Link } from 'react-router-dom';
import { BookOpenText, Pencil } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CatFace } from '../CatFace';
import { MoodPicker } from '../habits/MoodPicker';
import { TaskCheckbox } from '../ui/TaskCheckbox';
import { accent } from '../../lib/color';
import { formatDay, todayString } from '../../lib/date';
import { habitStreak, isHabitChecked, isHabitScheduled } from '../../lib/habit';
import { moodMeta } from '../../lib/mood';
import { cx } from '../../lib/cx';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';

/** Today's mood, one tap to log it. */
export function MoodSnapshot() {
  const { data, actions } = useToodles();
  const { pushToast } = useUi();
  const today = todayString();
  const log = data.moods.find((item) => item.date === today);

  return (
    <Card padding="lg" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg">How is today feeling?</h2>
        <Link to="/wellbeing" className="text-xs font-bold text-ink hover:underline">
          Mood history
        </Link>
      </div>

      {log ? (
        <div className="flex items-center gap-3 rounded-2xl border border-lilac-200 bg-lilac-50 p-3">
          <CatFace mood={log.mood} size={44} decorative={false} />
          <div className="min-w-0">
            <p className="font-bold text-ink">Today: {moodMeta(log.mood).label}</p>
            <p className="text-xs text-ink-soft">{log.note || moodMeta(log.mood).hint}</p>
          </div>
          <Button
            size="sm"
            variant="soft"
            className="ml-auto"
            onClick={() => actions.clearMood(today)}
            aria-label="Clear today's mood"
          >
            Clear
          </Button>
        </div>
      ) : (
        <MoodPicker
          value={null}
          label="Tap a face to log today"
          onChange={(mood) => {
            actions.logMood(today, mood);
            pushToast('Mood logged 🌤️', 'success');
          }}
        />
      )}
    </Card>
  );
}

/** Habits scheduled for today, tickable right here. */
export function HabitsSnapshot() {
  const { data, actions } = useToodles();
  const today = todayString();
  const habits = data.habits.filter((habit) => !habit.archived && isHabitScheduled(habit, today));

  return (
    <Card padding="lg" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg">Today&rsquo;s habits</h2>
        <Link to="/wellbeing" className="text-xs font-bold text-lilac-700 hover:underline">
          All habits
        </Link>
      </div>

      {habits.length === 0 ? (
        <p className="text-sm text-ink-soft">
          No habits yet. Add one small thing you would like to do most days.
        </p>
      ) : (
        <ul className="space-y-2">
          {habits.map((habit) => {
            const checked = isHabitChecked(data.habitChecks, habit.id, today);
            const streak = habitStreak(habit, data.habitChecks, today).current;
            const tone = accent(habit.color);
            return (
              <li
                key={habit.id}
                className="flex items-center gap-3 rounded-2xl border border-lilac-200 bg-cream px-3 py-2"
              >
                <TaskCheckbox
                  size="sm"
                  color={habit.color}
                  checked={checked}
                  onChange={() => actions.toggleHabitCheck(habit.id, today)}
                  label={checked ? `Undo ${habit.name}` : `Mark ${habit.name} done`}
                />
                <span
                  className={cx(
                    'min-w-0 flex-1 truncate text-sm font-semibold',
                    checked ? 'text-ink-soft line-through' : 'text-ink',
                  )}
                >
                  {habit.name}
                </span>
                <span className={cx('text-xs font-bold', tone.text)}>
                  {streak > 0 ? `${streak} day${streak === 1 ? '' : 's'}` : '0'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/** The last diary entry, so the day has a little continuity. */
export function RecentEntry() {
  const { data } = useToodles();
  const { openCreate } = useUi();
  const [latest] = [...data.diaryEntries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Card padding="lg" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg">Diary</h2>
        <Link to="/diary" className="text-xs font-bold text-lilac-700 hover:underline">
          All entries
        </Link>
      </div>

      {latest ? (
        <Link
          to="/diary"
          className="block rounded-2xl border border-lilac-200 bg-lilac-50 p-3 transition hover:bg-lilac-100"
        >
          <p className="flex items-center gap-2 text-xs font-bold text-lilac-700">
            <BookOpenText size={14} aria-hidden="true" />
            {formatDay(latest.date, { withYear: 'always' })}
          </p>
          <p className="mt-1 font-display text-base text-ink">
            {latest.title || 'An untitled page'}
          </p>
          {latest.body && (
            <p className="mt-1 line-clamp-3 text-sm text-ink-soft">{latest.body}</p>
          )}
        </Link>
      ) : (
        <p className="text-sm text-ink-soft">
          Your thoughts are welcome here. Nothing is uploaded, ever.
        </p>
      )}

      <Button
        variant="soft"
        block
        icon={<Pencil size={16} aria-hidden="true" />}
        onClick={() => openCreate('diary')}
      >
        Write today&rsquo;s page
      </Button>
    </Card>
  );
}
