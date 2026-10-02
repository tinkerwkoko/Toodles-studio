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
import { Chip } from '../ui/Chip';
import { Menu, type MenuItem } from '../ui/Menu';
import { ProgressBar } from '../ui/ProgressBar';
import { SubtaskChecklist } from '../tasks/SubtaskChecklist';
import { cx } from '../../lib/cx';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';

export interface BoardCardProps {
  task: Task;
  /** All board columns, so "Move to…" is always available, not just dragging. */
  columns: BoardColumn[];
  onOpen: (task: Task) => void;
  /** Dragging is enabled from tablet width up; phones use "Move to…". */
  dragEnabled: boolean;
}

/** One kanban card: title, colour, dates, subtask progress and a steps drawer. */
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
      icon: <CheckCheck size={16} aria-hidden="true" />,
      onSelect: () => {
        actions.toggleTaskDone(task.id);
        if (done) return;
        celebrate(task.id);
        pushToast(`“${task.title}” done ✨`, 'success');
      },
    },
    {
      label: 'Delete card',
      icon: <Trash2 size={16} aria-hidden="true" />,
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
        'rounded-2xl border border-lilac-200 border-l-4 bg-cream p-3 shadow-soft',
        tone.border,
        isDragging && 'opacity-80 shadow-lift ring-2 ring-lilac-300',
      )}
    >
      <div className="flex items-start gap-1.5">
        {dragEnabled ? (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Drag ${task.title}`}
            className="mt-0.5 grid h-8 w-7 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-lilac-400 hover:bg-lilac-100"
          >
            <GripVertical size={16} aria-hidden="true" />
          </button>
        ) : (
          <span aria-hidden="true" className="h-8 w-3 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => onOpen(task)}
          className="min-w-0 flex-1 text-left"
          aria-label={`Open ${task.title}`}
        >
          <h3
            className={cx(
              'font-title text-[17px] font-medium leading-snug wrap-break-word',
              done ? 'text-ink-soft line-through' : 'text-ink',
            )}
          >
            {task.title}
          </h3>
        </button>

        <Menu label={`Card options for ${task.title}`} header="Move to…" items={menuItems}>
          <MoreVertical size={17} aria-hidden="true" />
        </Menu>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {task.dueDate && (
          <Chip
            tone={overdue ? 'border-rose-200 bg-rose-100 text-ink' : isToday(task.dueDate) ? 'border-lilac-200 bg-lilac-300 text-ink' : undefined}
          >
            <CalendarDays size={13} aria-hidden="true" />
            {overdue ? 'Overdue · ' : ''}
            {formatDay(task.dueDate)}
            {task.dueTime ? ` ${formatTime(task.dueTime)}` : ''}
          </Chip>
        )}
        {progress.total > 0 && (
          <Chip>
            <ListTodo size={13} aria-hidden="true" />
            {progress.done} / {progress.total} steps
          </Chip>
        )}
      </div>

      {progress.total > 0 && (
        <ProgressBar
          value={progress.percent}
          label={`Subtasks for ${task.title}`}
          tone={progress.done === progress.total ? 'bg-mint-300' : 'bg-lilac-300'}
          className="mt-2"
        />
      )}

      {progress.total > 0 && (
        <button
          type="button"
          onClick={() => setShowSteps((current) => !current)}
          aria-expanded={showSteps}
          className="mt-2 min-h-11 rounded-full bg-lilac-300 px-3 text-xs font-bold text-ink hover:bg-lilac-200"
        >
          {showSteps ? 'Hide steps' : `Steps (${progress.done}/${progress.total})`}
        </button>
      )}

      {showSteps && (
        <div className="mt-2 rounded-2xl border border-lilac-200 bg-lilac-50/70 p-2.5">
          <SubtaskChecklist task={task} />
        </div>
      )}
    </article>
  );
}
