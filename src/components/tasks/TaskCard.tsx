import { CalendarDays, MoreVertical, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import type { Task } from '../../types';
import { Menu } from '../ui/Menu';
import { TaskCheckbox } from '../ui/TaskCheckbox';
import { TaskCardMeta } from './TaskCardMeta';
import { cx } from '../../lib/cx';
import { todayString } from '../../lib/date';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';

export interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
  selected?: boolean;
  showProject?: boolean;
  className?: string;
}

/** Clean journal row for a single task with typewritten notes & metadata. */
export function TaskCard({
  task,
  onOpen,
  selected = false,
  showProject = true,
  className,
}: TaskCardProps) {
  const { actions } = useToodles();
  const { celebrate, pushToast, celebratedTaskId } = useUi();

  const done = task.status === 'done';
  const celebrating = celebratedTaskId === task.id;

  function complete(): void {
    const reopening = task.status === 'done';
    actions.toggleTaskDone(task.id);
    if (reopening) {
      pushToast('Back on the list');
      return;
    }
    celebrate(task.id);
    pushToast(`“${task.title}” done`, 'success');
  }

  return (
    <article
      className={cx(
        'group relative flex items-start gap-3.5 px-4 py-3.5 transition duration-150 sm:px-5 first:rounded-t-[10px] last:rounded-b-[10px]',
        selected ? 'bg-paper-2/70' : 'hover:bg-lilac-50/65',
        celebrating && 'motion-safe:animate-pop',
        className,
      )}
    >
      <TaskCheckbox
        checked={done}
        onChange={complete}
        label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
        color={task.color}
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onOpen(task)}
          className="block w-full text-left cursor-pointer"
          aria-label={`Open ${task.title}`}
        >
          <h3
            className={cx(
              'font-sans text-[15px] font-medium leading-snug',
              done ? 'text-ink-soft/80 line-through' : 'text-ink group-hover:text-accent transition-colors',
            )}
          >
            {task.title}
          </h3>
        </button>

        {task.description && (
          <p className="mt-1 line-clamp-2 font-typewriter text-xs text-ink-soft leading-relaxed">
            {task.description}
          </p>
        )}

        <TaskCardMeta task={task} showProject={showProject} />
      </div>

      <Menu
        label={`Actions for ${task.title}`}
        header={task.title}
        items={[
          {
            label: done ? 'Reopen task' : 'Mark as done',
            icon: done ? <RotateCcw size={15} aria-hidden="true" /> : undefined,
            onSelect: complete,
          },
          {
            label: 'Open details',
            icon: <Pencil size={15} aria-hidden="true" />,
            onSelect: () => onOpen(task),
          },
          {
            label: 'Move to today',
            icon: <CalendarDays size={15} aria-hidden="true" />,
            disabled: task.dueDate === todayString(),
            onSelect: () => {
              actions.updateTask(task.id, { dueDate: todayString() });
              pushToast('Moved to today');
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
    </article>
  );
}
