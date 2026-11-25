import { Link } from 'react-router-dom';
import { TaskCheckbox } from '../ui/TaskCheckbox';
import { formatDay, todayString } from '../../lib/date';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';
import type { Task } from '../../types';

export function ComingUpList() {
  const { data, actions } = useToodles();
  const { setDetailTaskId } = useUi();
  const today = todayString();

  const upcomingTasks = data.tasks
    .filter((task) => task.status === 'todo' && !!task.dueDate && task.dueDate > today)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .slice(0, 5);

  if (upcomingTasks.length === 0) {
    return null;
  }

  const grouped: Record<string, Task[]> = {};
  upcomingTasks.forEach((task) => {
    const key = task.dueDate!;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(task);
  });

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-2 border-b border-divider pb-2">
        <h2 className="font-display text-2xl font-semibold text-ink">Coming up</h2>
        <Link
          to="/tasks?tab=upcoming"
          className="text-xs font-sans text-ink-soft hover:text-accent underline underline-offset-4 transition"
        >
          See all
        </Link>
      </div>

      <div className="divide-y divide-divider">
        {Object.entries(grouped).map(([date, tasks]) => (
          <div key={date} className="py-3 first:pt-1">
            <span className="block font-hand text-lg text-accent leading-none mb-2">
              {formatDay(date)}
            </span>
            <ul className="space-y-1">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 py-1.5 px-1.5 rounded-[4px] hover:bg-cream/80 transition cursor-pointer"
                  onClick={() => setDetailTaskId(task.id)}
                >
                  <TaskCheckbox
                    checked={false}
                    onChange={() => actions.toggleTaskDone(task.id)}
                    label={`Mark ${task.title} as done`}
                  />
                  <span className="font-sans text-[15px] text-ink flex-1 truncate">
                    {task.title}
                  </span>
                  {task.dueTime && (
                    <span className="font-sans text-xs text-text-faint tabular-nums">
                      {task.dueTime}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
