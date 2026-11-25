import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, FolderHeart, Repeat, Trash2 } from 'lucide-react';
import type { Task } from '../../types';
import { PRIORITY_STYLES } from '../../lib/color';
import { formatDay, formatEstimate, formatTimestamp } from '../../lib/date';
import { REPEAT_LABELS } from '../../lib/task';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { TaskCheckbox } from '../ui/TaskCheckbox';
import { SubtaskChecklist } from './SubtaskChecklist';
import { TaskForm } from './TaskForm';
import { formValuesToTaskPatch, taskToFormValues } from './taskFormValues';
import { cx } from '../../lib/cx';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';

export interface TaskDetailProps {
  task: Task;
  onDeleted?: () => void;
}

/** Everything about one task: clean hairline sections without nested boxes. */
export function TaskDetail({ task, onDeleted }: TaskDetailProps) {
  const { data, actions } = useToodles();
  const { pushToast, celebrate } = useUi();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const project = data.projects.find((item) => item.id === task.projectId);
  const done = task.status === 'done';

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <TaskCheckbox
          checked={done}
          color={task.color}
          label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
          onChange={() => {
            actions.toggleTaskDone(task.id);
            if (!done) {
              celebrate(task.id);
              pushToast(`“${task.title}” done`, 'success');
            }
          }}
          className="mt-1"
        />
        <div className="min-w-0 flex-1">
          <h2
            className={cx(
              'font-display text-2xl sm:text-[1.6rem] leading-tight wrap-break-word',
              done ? 'text-ink-soft line-through' : 'text-ink',
            )}
          >
            {task.title}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-typewriter text-xs text-ink-soft tabular-nums">
            <span className={done ? 'text-mint-700' : 'text-accent'}>
              {done ? 'Completed' : 'Open'}
            </span>
            {project && (
              <Link
                to={`/projects/${project.id}`}
                className="inline-flex items-center gap-1 hover:text-accent underline underline-offset-2"
              >
                <FolderHeart size={12} aria-hidden="true" />
                <span>{project.name}</span>
              </Link>
            )}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={12} aria-hidden="true" />
                <span>{formatDay(task.dueDate, { withYear: 'auto' })}</span>
              </span>
            )}
            {task.estimate ? (
              <span className="inline-flex items-center gap-1">
                <Clock size={12} aria-hidden="true" />
                <span>{formatEstimate(task.estimate)}</span>
              </span>
            ) : null}
            {task.priority !== 'none' && (
              <span className={cx(PRIORITY_STYLES[task.priority].icon)}>
                {PRIORITY_STYLES[task.priority].label} priority
              </span>
            )}
            {task.repeat !== 'none' && (
              <span className="inline-flex items-center gap-1">
                <Repeat size={12} aria-hidden="true" />
                <span>{REPEAT_LABELS[task.repeat]}</span>
              </span>
            )}
          </div>

          <p className="mt-1.5 font-typewriter text-[11px] text-text-faint">
            Added {formatTimestamp(task.createdAt)}
            {task.completedAt ? ` · Completed ${formatTimestamp(task.completedAt)}` : ''}
          </p>
        </div>
      </div>

      <div className="border-t border-divider/65 pt-5">
        <SubtaskChecklist task={task} />
      </div>

      <section className="border-t border-divider/65 pt-5">
        <h3 className="mb-3.5 font-display text-xl text-ink">Edit details</h3>
        <TaskForm
          key={task.id}
          initial={taskToFormValues(task)}
          submitLabel="Save changes"
          hint="Changes are saved automatically to your workspace."
          onSubmit={(values) => {
            actions.updateTask(task.id, formValuesToTaskPatch(values, task));
            pushToast('Changes saved', 'success');
          }}
        />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-divider/65 pt-4">
        <p className="font-typewriter text-xs text-ink-soft">Done with this one for good?</p>
        <Button
          variant="ghost"
          size="sm"
          className="text-rose-700 hover:bg-rose-100"
          icon={<Trash2 size={14} aria-hidden="true" />}
          onClick={() => setConfirmDelete(true)}
        >
          Delete task
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Tuck this task away for good?"
        body={<p>“{task.title}” and its steps will be removed. This cannot be undone.</p>}
        confirmLabel="Delete task"
        tone="danger"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          actions.deleteTask(task.id);
          setConfirmDelete(false);
          onDeleted?.();
          pushToast('Task deleted');
        }}
      />
    </div>
  );
}
