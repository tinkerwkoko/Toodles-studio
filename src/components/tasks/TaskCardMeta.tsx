import type { Task } from '../../types';
import { PRIORITY_STYLES, accent } from '../../lib/color';
import { formatDay, formatEstimate, formatTime, isToday } from '../../lib/date';
import { REPEAT_SHORT, isTaskOverdue, subtaskProgress } from '../../lib/task';
import { AlarmClock, Bell, CalendarDays, Clock, Repeat } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { cx } from '../../lib/cx';
import { useToodles } from '../../store/useToodles';

export interface TaskCardMetaProps {
  task: Task;
  showProject?: boolean;
}

/** Quiet inline typewritten metadata — no pill capsules cluttering every task row. */
export function TaskCardMeta({ task, showProject = true }: TaskCardMetaProps) {
  const { data } = useToodles();
  const done = task.status === 'done';
  const overdue = !done && isTaskOverdue(task);
  const progress = subtaskProgress(task);
  const project = data.projects.find((item) => item.id === task.projectId);
  const tone = accent(task.color);

  const hasMeta =
    Boolean(task.dueDate) ||
    Boolean(!task.dueDate && task.startDate) ||
    Boolean(showProject && project) ||
    task.priority !== 'none' ||
    Boolean(task.estimate) ||
    task.repeat !== 'none' ||
    task.reminder ||
    task.tags.length > 0 ||
    Boolean(done && task.completedAt);

  return (
    <>
      {hasMeta && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-typewriter text-[11px] text-ink-soft tabular-nums">
          {task.dueDate && (
            <span
              className={cx(
                'inline-flex items-center gap-1',
                overdue
                  ? 'text-rose-700'
                  : isToday(task.dueDate)
                    ? 'text-accent'
                    : 'text-ink-soft',
              )}
            >
              {overdue ? (
                <AlarmClock size={12} aria-hidden="true" />
              ) : (
                <CalendarDays size={12} aria-hidden="true" />
              )}
              <span>
                {overdue ? 'Overdue · ' : ''}
                {formatDay(task.dueDate)}
                {task.dueTime ? ` · ${formatTime(task.dueTime)}` : ''}
              </span>
            </span>
          )}

          {!task.dueDate && task.startDate && (
            <span className="inline-flex items-center gap-1 text-ink-soft">
              <CalendarDays size={12} aria-hidden="true" />
              <span>Starts {formatDay(task.startDate)}</span>
            </span>
          )}

          {showProject && project && (
            <span className="inline-flex items-center gap-1.5 text-ink-soft">
              <span className={cx('h-2 w-2 rounded-full', tone.mid)} aria-hidden="true" />
              <span>{project.name}</span>
            </span>
          )}

          {task.priority !== 'none' && (
            <span className={cx('inline-flex items-center gap-1', PRIORITY_STYLES[task.priority].icon)}>
              <span className={cx('h-1.5 w-1.5 rounded-full', PRIORITY_STYLES[task.priority].dot)} aria-hidden="true" />
              <span>{PRIORITY_STYLES[task.priority].label}</span>
            </span>
          )}

          {task.estimate ? (
            <span className="inline-flex items-center gap-1 text-text-faint">
              <Clock size={12} aria-hidden="true" />
              <span>{formatEstimate(task.estimate)}</span>
            </span>
          ) : null}

          {task.repeat !== 'none' && (
            <span className="inline-flex items-center gap-1 text-text-faint">
              <Repeat size={12} aria-hidden="true" />
              <span>{REPEAT_SHORT[task.repeat]}</span>
            </span>
          )}

          {task.reminder && (
            <span className="inline-flex items-center gap-1 text-butter-700">
              <Bell size={12} aria-hidden="true" />
              <span>Reminder</span>
            </span>
          )}

          {task.tags.map((tag) => (
            <span key={tag} className="text-text-faint">
              #{tag}
            </span>
          ))}

          {done && task.completedAt && (
            <span className="text-mint-700">
              Finished {formatDay(task.completedAt.slice(0, 10))}
            </span>
          )}
        </div>
      )}

      {progress.total > 0 && (
        <div className="mt-2 flex items-center gap-2.5">
          <ProgressBar
            value={progress.percent}
            label={`Subtasks for ${task.title}`}
            tone={progress.done === progress.total ? 'bg-mint-500' : 'bg-lilac-300'}
            className="max-w-36"
          />
          <span className="font-typewriter text-[11px] text-text-faint tabular-nums">
            {progress.done}/{progress.total} steps
          </span>
        </div>
      )}
    </>
  );
}
