import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CalendarDays,
  CheckCheck,
  GripVertical,
  ListTodo,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import type { AccentColor, BoardColumn, Task } from '../../types';
import { ACCENT_KEYS, ACCENT_LABELS, accent } from '../../lib/color';
import { formatDay, formatTime, isToday } from '../../lib/date';
import { isTaskOverdue, subtaskProgress } from '../../lib/task';
import { Menu, type MenuItem } from '../ui/Menu';
import { ProgressBar } from '../ui/ProgressBar';
import { SubtaskChecklist } from '../tasks/SubtaskChecklist';
import { cx } from '../../lib/cx';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';

export interface BoardCardProps {
  task: Task;
  columns: BoardColumn[];
  onOpen: (task: Task) => void;
  dragEnabled: boolean;
}

/** Tactile botanical ivory card for the kanban board. */
export function BoardCard({ task, columns, onOpen, dragEnabled }: BoardCardProps) {
  const { actions } = useToodles();
  const { pushToast, celebrate } = useUi();
  const [showSteps, setShowSteps] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !dragEnabled,
  });

  const tone = accent(task.color);
  const progress = subtaskProgress(task);
  const done = task.status === 'done';
  const overdue = !done && isTaskOverdue(task);

  const dot = (key: AccentColor) => (
    <span className={cx('h-2.5 w-2.5 rounded-full', accent(key).mid)} aria-hidden="true" />
  );

  const currentColumnId =
    task.boardColumnId ||
    (task.status === 'done' ? columns[columns.length - 1]?.id : columns[0]?.id);

  const menuItems: MenuItem[] = [
    ...columns
      .filter((column) => column.id !== currentColumnId)
      .map((column) => ({
        label: `Move to ${column.name}`,
        icon: dot(column.color),
        onSelect: () => {
          actions.placeTaskOnBoard(task.id, column.id, null);
          pushToast(`Moved to ${column.name}`);
        },
      })),
    ...ACCENT_KEYS.map((key: AccentColor) => ({
      label: ACCENT_LABELS[key],
      icon: dot(key),
      onSelect: () => actions.updateTask(task.id, { color: key }),
    })),
    {
      label: done ? 'Reopen task' : 'Mark as done',
      icon: <CheckCheck size={15} aria-hidden="true" />,
      onSelect: () => {
        actions.toggleTaskDone(task.id);
        if (done) return;
        celebrate(task.id);
        pushToast(`“${task.title}” done`, 'success');
      },
    },
    {
      label: 'Delete card',
      icon: <Trash2 size={15} aria-hidden="true" />,
      danger: true,
      onSelect: () => {
        actions.deleteTask(task.id);
        pushToast('Card deleted');
      },
    },
  ];

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cx(
        'paper-sheet rounded-[9px] p-3.5 transition',
        isDragging && 'opacity-85 shadow-lift ring-1 ring-accent',
      )}
    >
      <div className="flex items-start gap-1.5">
        {dragEnabled ? (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Drag ${task.title}`}
            className="mt-0.5 grid h-7 w-6 shrink-0 cursor-grab touch-none place-items-center rounded-[5px] text-text-faint hover:bg-paper-2 hover:text-ink"
          >
            <GripVertical size={14} aria-hidden="true" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onOpen(task)}
          className="min-w-0 flex-1 text-left cursor-pointer"
          aria-label={`Open ${task.title}`}
        >
          <div className="flex items-start gap-2">
            <span
              className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', tone.mid)}
              aria-hidden="true"
            />
            <h3
              className={cx(
                'font-sans text-sm font-medium leading-snug wrap-break-word',
                done ? 'text-ink-soft line-through' : 'text-ink',
              )}
            >
              {task.title}
            </h3>
          </div>
        </button>

        <Menu label={`Card options for ${task.title}`} header="Move to…" items={menuItems}>
          <MoreVertical size={15} aria-hidden="true" />
        </Menu>
      </div>

      {(task.dueDate || progress.total > 0) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-typewriter text-[11px] text-ink-soft tabular-nums">
          {task.dueDate && (
            <span
              className={cx(
                'inline-flex items-center gap-1',
                overdue ? 'text-rose-700' : isToday(task.dueDate) ? 'text-accent' : '',
              )}
            >
              <CalendarDays size={12} aria-hidden="true" />
              <span>
                {overdue ? 'Overdue · ' : ''}
                {formatDay(task.dueDate)}
                {task.dueTime ? ` ${formatTime(task.dueTime)}` : ''}
              </span>
            </span>
          )}
          {progress.total > 0 && (
            <span className="inline-flex items-center gap-1 text-text-faint">
              <ListTodo size={12} aria-hidden="true" />
              <span>
                {progress.done}/{progress.total} steps
              </span>
            </span>
          )}
        </div>
      )}

      {progress.total > 0 && (
        <ProgressBar
          value={progress.percent}
          label={`Subtasks for ${task.title}`}
          tone={progress.done === progress.total ? 'bg-mint-500' : tone.mid}
          className="mt-2"
        />
      )}

      {progress.total > 0 && (
        <button
          type="button"
          onClick={() => setShowSteps((current) => !current)}
          aria-expanded={showSteps}
          className="mt-2 font-typewriter text-[11px] text-accent hover:underline underline-offset-4 cursor-pointer tabular-nums"
        >
          {showSteps ? 'Hide steps' : `Steps (${progress.done}/${progress.total})`}
        </button>
      )}

      {showSteps && (
        <div className="mt-2.5 border-t border-divider/65 pt-2.5">
          <SubtaskChecklist task={task} />
        </div>
      )}
    </article>
  );
}
