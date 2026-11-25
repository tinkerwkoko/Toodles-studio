import { Link } from 'react-router-dom';
import { TaskCheckbox } from '../ui/TaskCheckbox';
import { LeafMark } from '../ui/BotanicalOrnaments';
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
      <div className="flex items-baseline justify-between gap-2 border-b border-divider/70 pb-2">
        <h2 className="font-display text-2xl text-ink">Coming up</h2>
        <Link
          to="/tasks?tab=upcoming"
          className="font-typewriter text-xs text-ink-soft hover:text-accent underline underline-offset-4 transition"
        >
          See all
        </Link>
      </div>

      <div className="divide-y divide-divider/60">
        {Object.entries(grouped).map(([date, tasks]) => (
          <div key={date} className="py-3 first:pt-1">
            <span className="inline-flex items-center gap-1.5 font-typewriter text-xs text-fern leading-none mb-2">
              <LeafMark className="h-3 w-3 text-fern/75" />
              <span>{formatDay(date)}</span>
            </span>
            <ul className="space-y-1">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 py-1.5 px-2 -mx-1 rounded-[8px] hover:bg-cream/80 transition cursor-pointer"
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
                    <span className="font-typewriter text-[11px] text-text-faint tabular-nums">
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
