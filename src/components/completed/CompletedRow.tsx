import { MoreVertical, RotateCcw, Trash2 } from 'lucide-react';
import type { Project, Task } from '../../types';
import { accent } from '../../lib/color';
import { formatDay } from '../../lib/date';
import { completedDate } from '../../lib/archive';
import { subtaskProgress } from '../../lib/task';
import { Menu } from '../ui/Menu';
import { cx } from '../../lib/cx';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';

export interface CompletedRowProps {
  task: Task;
  project: Project | null;
  onOpen: (task: Task) => void;
}

/** One finished task in the archive: struck-through title, project and typewritten date. */
export function CompletedRow({ task, project, onOpen }: CompletedRowProps) {
  const { actions } = useToodles();
  const { pushToast, celebrate } = useUi();
  const date = completedDate(task);
  const progress = subtaskProgress(task);
  const tone = accent(task.color);

  return (
    <li className="flex items-center gap-3 px-4 py-3 transition hover:bg-paper-2/35">
      <span className={cx('h-2 w-2 shrink-0 rounded-full', tone.mid)} aria-hidden="true" />

      <button
        type="button"
        onClick={() => onOpen(task)}
        className="min-w-0 flex-1 text-left cursor-pointer"
        aria-label={`Open ${task.title}`}
      >
        <span className="block truncate text-[0.94rem] text-ink-soft line-through">
          {task.title}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-typewriter text-[11px] text-ink-soft">
          {date && <span className="tabular-nums">Finished {formatDay(date)}</span>}
          {project && (
            <span className="truncate">
              · {project.emoji} {project.name}
            </span>
          )}
          {progress.total > 0 && (
            <span className="tabular-nums">
              · {progress.done} / {progress.total} steps
            </span>
          )}
        </span>
      </button>

      <Menu
        label={`Options for ${task.title}`}
        header="Finished task"
        items={[
          {
            label: 'Reopen task',
            icon: <RotateCcw size={15} aria-hidden="true" />,
            onSelect: () => {
              actions.setTaskStatus(task.id, 'todo');
              celebrate(task.id);
              pushToast('Back on your list');
            },
          },
          {
            label: 'Delete task',
            icon: <Trash2 size={15} aria-hidden="true" />,
            danger: true,
            onSelect: () => {
              actions.deleteTask(task.id);
              pushToast('Task deleted');
            },
          },
        ]}
      >
        <MoreVertical size={16} aria-hidden="true" />
      </Menu>
    </li>
  );
}
