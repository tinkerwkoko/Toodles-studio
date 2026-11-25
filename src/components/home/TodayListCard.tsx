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
  const [moveUnfinishedOpen, setMoveUnfinishedOpen] = useState(false);
  const [targetMoveDate, setTargetMoveDate] = useState(addDays(today, 1));

  const tasksDueToday = data.tasks.filter((t) => isTaskDueToday(t, today) || isTaskCompletedToday(t, today));
  const totalDue = tasksDueToday.length;
  const undoneDue = tasksDueToday.filter((t) => t.status === 'todo');
  const doneDue = tasksDueToday.filter((t) => t.status === 'done');
  const undoneCount = undoneDue.length;

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

  function handleSaveCustomDate() {
    if (!datePickerTask) return;
    actions.updateTask(datePickerTask.id, { dueDate: customDate });
    setDatePickerTask(null);
    pushToast(`Rescheduled to ${customDate}`);
  }

  const displayedTasks = activeTab === 'todo' ? undoneDue : doneDue;

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <h2 className="font-display text-2xl font-semibold text-ink">Today&apos;s list</h2>
          {totalDue > 0 && (
            <span className="text-xs font-sans text-ink-soft tabular-nums">
              {undoneCount} of {totalDue} left
            </span>
          )}
          {committedText && (
            <span className="text-xs font-sans italic text-text-faint tabular-nums">
              · {committedText}
            </span>
          )}
        </div>

        {undoneCount > 0 && activeTab === 'todo' && (
          <button
            type="button"
            onClick={() => {
              setTargetMoveDate(addDays(today, 1));
              setMoveUnfinishedOpen(true);
            }}
            className="text-xs font-sans text-ink-soft hover:text-accent underline underline-offset-4 transition cursor-pointer"
          >
            Move unfinished
          </button>
        )}
      </div>

      <Tabs
        ariaLabel="Today's task status"
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as 'todo' | 'done')}
        items={[
          { id: 'todo', label: 'To do', count: undoneCount },
          { id: 'done', label: 'Done', count: doneDue.length },
        ]}
      />

      {displayedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-7 text-center">
          <Cat pose="sleepy" size={56} animated={false} />
          <p className="mt-2.5 text-sm font-sans italic text-ink-soft max-w-sm">
            {activeTab === 'todo'
              ? 'Nothing is due today. Add something small if you feel like it.'
              : 'No tasks completed today yet.'}
          </p>
          {activeTab === 'todo' && (
            <div className="mt-3.5">
              <Button
                size="sm"
                variant="outline"
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
              className="flex items-center justify-between gap-3 py-3 transition hover:bg-lilac-50/70 rounded-[4px] px-1.5"
            >
              <div className="flex flex-1 items-center gap-3 min-w-0">
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
                    className={`font-sans text-[15px] leading-snug truncate ${
                      task.status === 'done'
                        ? 'line-through text-ink-soft/80'
                        : 'text-ink font-medium'
                    }`}
                  >
                    {task.title}
                  </p>
                  {(task.dueTime || task.estimate) && (
                    <p className="mt-0.5 font-sans text-xs text-text-faint tabular-nums">
                      {task.dueTime ? task.dueTime : ''}
                      {task.dueTime && task.estimate ? ' · ' : ''}
                      {task.estimate ? formatEstimate(task.estimate) : ''}
                    </p>
                  )}
                </div>
              </div>

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
                <span className="grid h-7 w-7 place-items-center rounded-[4px] text-ink-soft hover:bg-paper-2 hover:text-ink">
                  <MoreVertical size={15} />
                </span>
              </Menu>
            </li>
          ))}
        </ul>
      )}

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
            <Button variant="ghost" size="sm" onClick={() => setDatePickerTask(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveCustomDate}>
              Save date
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={moveUnfinishedOpen}
        onClose={() => setMoveUnfinishedOpen(false)}
        title="Move unfinished tasks"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm font-sans text-ink-soft leading-relaxed">
            Choose which day you would like to move your {undoneCount} unfinished task{undoneCount === 1 ? '' : 's'} to:
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTargetMoveDate(addDays(today, 1))}
              className={`rounded-[4px] border px-3 py-2 text-xs font-sans font-medium transition cursor-pointer ${
                targetMoveDate === addDays(today, 1)
                  ? 'border-accent bg-rose-100 text-rose-700'
                  : 'border-divider bg-cream text-ink-soft hover:bg-paper-2'
              }`}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setTargetMoveDate(addDays(today, 7))}
              className={`rounded-[4px] border px-3 py-2 text-xs font-sans font-medium transition cursor-pointer ${
                targetMoveDate === addDays(today, 7)
                  ? 'border-accent bg-rose-100 text-rose-700'
                  : 'border-divider bg-cream text-ink-soft hover:bg-paper-2'
              }`}
            >
              Next week
            </button>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-sans font-medium text-ink">Or pick a specific day</span>
            <DatePicker
              value={targetMoveDate}
              onChange={(d) => setTargetMoveDate(d || addDays(today, 1))}
              placeholder="Choose date"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-divider pt-3">
            <Button variant="ghost" size="sm" onClick={() => setMoveUnfinishedOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const taskIds = undoneDue.map((t) => t.id);
                taskIds.forEach((id) => {
                  actions.updateTask(id, { dueDate: targetMoveDate });
                });
                setMoveUnfinishedOpen(false);
                pushToast(`Moved ${taskIds.length} task${taskIds.length === 1 ? '' : 's'} to ${targetMoveDate}`, 'success');
              }}
            >
              Move tasks
            </Button>
          </div>
        </div>
      </Dialog>
    </Card>
  );
}
