import { useState } from 'react';
import { Calendar, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { Cat } from '../Cat';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Tabs } from '../ui/Tabs';
import { Menu } from '../ui/Menu';
import { TaskCheckbox } from '../ui/TaskCheckbox';
import { Dialog } from '../ui/Dialog';
import { DatePicker } from '../ui/DatePicker';
import { addDays, formatEstimate, todayString } from '../../lib/date';
import { isTaskDueToday, isTaskCompletedToday } from '../../lib/task';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';
import type { Task } from '../../types';

export function TodayListCard() {
  const { data, actions } = useToodles();
  const { openCreate, setDetailTaskId, pushToast } = useUi();
  const today = todayString();

  const [activeTab, setActiveTab] = useState<'todo' | 'done'>('todo');
  const [datePickerTask, setDatePickerTask] = useState<Task | null>(null);
  const [customDate, setCustomDate] = useState(today);

  // All tasks due or starting today
  const tasksDueToday = data.tasks.filter((t) => isTaskDueToday(t, today) || isTaskCompletedToday(t, today));
  const totalDue = tasksDueToday.length;
  const undoneDue = tasksDueToday.filter((t) => t.status === 'todo');
  const doneDue = tasksDueToday.filter((t) => t.status === 'done');
  const undoneCount = undoneDue.length;

  // Estimates calculation
  const hasAllEstimates =
    totalDue > 0 &&
    tasksDueToday.every((t) => typeof t.estimate === 'number' && t.estimate > 0);

  let committedText = '';
  if (hasAllEstimates) {
    const totalMinutes = tasksDueToday.reduce((sum, t) => sum + (t.estimate ?? 0), 0);
    committedText = `${formatEstimate(totalMinutes)} committed`;
  } else if (totalDue > 0) {
    const timedCount = tasksDueToday.filter(
      (t) => typeof t.estimate === 'number' && t.estimate > 0,
    ).length;
    committedText = `${timedCount} of ${totalDue} timed`;
  }

  // Move unfinished to tomorrow with undo note
  function handleMoveUnfinished() {
    if (undoneCount === 0) return;
    const taskIds = undoneDue.map((t) => t.id);
    const tomorrow = addDays(today, 1);

    taskIds.forEach((id) => {
      actions.updateTask(id, { dueDate: tomorrow });
    });

    pushToast(
      `Moved ${taskIds.length} task${taskIds.length === 1 ? '' : 's'} to tomorrow`,
    );
  }

  function handleSaveCustomDate() {
    if (!datePickerTask) return;
    actions.updateTask(datePickerTask.id, { dueDate: customDate });
    setDatePickerTask(null);
    pushToast(`Rescheduled to ${customDate}`);
  }

  const displayedTasks = activeTab === 'todo' ? undoneDue : doneDue;

  return (
    <Card padding="md" className="space-y-3">
      {/* Top row: Section title & metrics */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-divider pb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-[18px] text-ink">Today's list</h2>
          {totalDue > 0 && (
            <span className="rounded-full bg-lilac-100 px-2 py-0.5 text-xs font-sans text-ink-soft">
              {undoneCount} of {totalDue} left
            </span>
          )}
          {committedText && (
            <span className="text-xs font-sans text-text-faint">
              · {committedText}
            </span>
          )}
        </div>

        {undoneCount > 0 && activeTab === 'todo' && (
          <button
            type="button"
            onClick={handleMoveUnfinished}
            className="text-xs font-sans text-ink-soft hover:text-ink underline transition"
          >
            Move unfinished
          </button>
        )}
      </div>

      {/* Tabs: To do / Done */}
      <Tabs
        ariaLabel="Today's task status"
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as 'todo' | 'done')}
        items={[
          { id: 'todo', label: 'To do', count: undoneCount },
          { id: 'done', label: 'Done', count: doneDue.length },
        ]}
      />

      {/* Task list or empty state */}
      {displayedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Cat pose="sleepy" size={54} animated={false} />
          <p className="mt-2 text-sm font-sans text-ink-soft">
            {activeTab === 'todo'
              ? 'Nothing is due today. Add something small if you feel like it.'
              : 'No tasks completed today yet.'}
          </p>
          {activeTab === 'todo' && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="soft"
                onClick={() => openCreate('task')}
                icon={<Plus size={14} aria-hidden="true" />}
              >
                Create your first task
              </Button>
            </div>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-divider">
          {displayedTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between gap-3 py-2.5 transition hover:bg-lilac-50/50 rounded-[6px] px-1"
            >
              <div className="flex flex-1 items-center gap-2.5 min-w-0">
                <TaskCheckbox
                  checked={task.status === 'done'}
                  onChange={() => actions.toggleTaskDone(task.id)}
                  label={`Mark ${task.title} as ${task.status === 'done' ? 'todo' : 'done'}`}
                />
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => setDetailTaskId(task.id)}
                >
                  <p
                    className={`font-title font-medium text-[15px] truncate ${
                      task.status === 'done'
                        ? 'line-through text-ink-soft'
                        : 'text-ink'
                    }`}
                  >
                    {task.title}
                  </p>
                  {(task.dueTime || task.estimate) && (
                    <p className="font-sans text-xs text-text-faint">
                      {task.dueTime ? task.dueTime : ''}
                      {task.dueTime && task.estimate ? ' · ' : ''}
                      {task.estimate ? formatEstimate(task.estimate) : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Task menu */}
              <Menu
                label={`Options for ${task.title}`}
                items={[
                  {
                    label: 'Move to tomorrow',
                    icon: <Calendar size={14} />,
                    onSelect: () =>
                      actions.updateTask(task.id, { dueDate: addDays(today, 1) }),
                  },
                  {
                    label: 'Pick a date',
                    icon: <Calendar size={14} />,
                    onSelect: () => {
                      setDatePickerTask(task);
                      setCustomDate(task.dueDate || today);
                    },
                  },
                  {
                    label: 'Delete',
                    icon: <Trash2 size={14} />,
                    danger: true,
                    onSelect: () => actions.deleteTask(task.id),
                  },
                ]}
              >
                <span className="grid h-7 w-7 place-items-center rounded-[6px] text-ink-soft hover:bg-lilac-100 hover:text-ink">
                  <MoreVertical size={15} />
                </span>
              </Menu>
            </li>
          ))}
        </ul>
      )}

      {/* Pick a date dialog */}
      <Dialog
        open={!!datePickerTask}
        onClose={() => setDatePickerTask(null)}
        title="Pick a date"
        description="Choose when this task should be due."
      >
        <div className="space-y-4">
          <DatePicker
            value={customDate}
            onChange={(date) => setCustomDate(date || today)}
            placeholder="Select due date"
          />
          <div className="flex justify-end gap-2">
            <Button variant="soft" size="sm" onClick={() => setDatePickerTask(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveCustomDate}>
              Save date
            </Button>
          </div>
        </div>
      </Dialog>
    </Card>
  );
}
