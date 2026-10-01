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

  // Find next 5 open tasks after today
  const upcomingTasks = data.tasks
    .filter((task) => task.status === 'todo' && !!task.dueDate && task.dueDate > today)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .slice(0, 5);

  if (upcomingTasks.length === 0) {
    return null;
  }

  // Group by date
  const grouped: Record<string, Task[]> = {};
  upcomingTasks.forEach((task) => {
    const key = task.dueDate!;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(task);
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-[18px] text-ink">Coming up</h2>
        <Link
          to="/tasks?tab=upcoming"
          className="text-xs font-title font-medium text-ink-soft hover:text-ink hover:underline"
        >
          See all
        </Link>
      </div>

      <div className="divide-y divide-divider border-t border-b border-divider">
        {Object.entries(grouped).map(([date, tasks]) => (
          <div key={date} className="py-2">
            <span className="block font-sans text-xs text-text-faint mb-1">
              {formatDay(date)}
            </span>
            <ul className="space-y-1">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2.5 py-1 px-1 rounded-[6px] hover:bg-lilac-50/50 transition cursor-pointer"
                  onClick={() => setDetailTaskId(task.id)}
                >
                  <TaskCheckbox
                    checked={false}
                    onChange={() => actions.toggleTaskDone(task.id)}
                    label={`Mark ${task.title} as done`}
                  />
                  <span className="font-title font-medium text-[15px] text-ink flex-1 truncate">
                    {task.title}
                  </span>
                  {task.dueTime && (
                    <span className="font-sans text-xs text-text-faint">{task.dueTime}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
