import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { CatFace } from '../components/CatFace';
import { addDays, formatLongDay, todayString } from '../lib/date';
import { accent } from '../lib/color';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TaskCheckbox } from '../components/ui/TaskCheckbox';
import { cx } from '../lib/cx';
import { useToodles } from '../store/useToodles';
import { useUi } from '../store/useUi';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 to 21:00

export function getTaskHourRange(
  dueTime?: string | null,
  estimate?: number | null,
): { startHour: number; endHour: number } | null {
  if (!dueTime) return null;
  const clean = dueTime.trim();

  // Range pattern like "8 am - 10 am", "8am - 10am", "08:00 - 10:00", "8 - 10", "8am to 10am", "8:00-10:00"
  const rangeMatch = clean.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|—|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i,
  );
  if (rangeMatch) {
    let start = parseInt(rangeMatch[1], 10);
    const startAmPm = rangeMatch[3]?.toLowerCase();
    let end = parseInt(rangeMatch[4], 10);
    const endMin = rangeMatch[5] ? parseInt(rangeMatch[5], 10) : 0;
    const endAmPm = rangeMatch[6]?.toLowerCase();

    // If start has no am/pm but end does: e.g. "8 - 10 am" or "1 - 3 pm"
    if (!startAmPm && endAmPm) {
      if (endAmPm === 'pm' && start < 12 && end <= 12 && start < end) {
        start += 12;
      }
    }

    if (startAmPm === 'pm' && start < 12) start += 12;
    if (startAmPm === 'am' && start === 12) start = 0;
    if (endAmPm === 'pm' && end < 12) end += 12;
    if (endAmPm === 'am' && end === 12) end = 0;

    const computedEnd = endMin > 0 ? end + 1 : end;
    return { startHour: start, endHour: Math.max(start + 1, computedEnd) };
  }

  // Standard "HH:mm" or "8am" or "8"
  const singleMatch = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (singleMatch) {
    let startHour = parseInt(singleMatch[1], 10);
    const minutes = singleMatch[2] ? parseInt(singleMatch[2], 10) : 0;
    const ampm = singleMatch[3]?.toLowerCase();
    if (ampm === 'pm' && startHour < 12) startHour += 12;
    if (ampm === 'am' && startHour === 12) startHour = 0;

    const durationMinutes = estimate && estimate > 0 ? estimate : 60;
    const endHour = Math.max(startHour + 1, startHour + Math.ceil((minutes + durationMinutes) / 60));
    return { startHour, endHour };
  }

  return null;
}

export function CalendarPage() {
  const { data, actions } = useToodles();
  const { openCreate, setDetailTaskId } = useUi();
  const today = todayString();

  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Week days starting from Monday of current selectedDate
  const weekDays = useMemo(() => {
    const curr = new Date(selectedDate + 'T12:00:00');
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [selectedDate]);

  function stepDate(delta: number) {
    if (viewMode === 'day') {
      setSelectedDate((prev) => addDays(prev, delta));
    } else {
      setSelectedDate((prev) => addDays(prev, delta * 7));
    }
  }

  // Tasks for the selected day: due on or starting on this day
  const dayTasks = useMemo(() => {
    return data.tasks.filter((t) => {
      if (t.status !== 'todo') return false;
      if (t.dueDate === selectedDate || t.startDate === selectedDate) return true;
      if (t.startDate && t.startDate <= selectedDate && (!t.dueDate || t.dueDate >= selectedDate))
        return true;
      return false;
    });
  }, [data.tasks, selectedDate]);

  // Scheduled tasks (tasks that have a dueTime)
  const scheduledTasks = useMemo(() => {
    return dayTasks.filter((t) => !!getTaskHourRange(t.dueTime, t.estimate));
  }, [dayTasks]);

  // Unscheduled tasks (due today but without a specific time block)
  const unscheduledTasks = useMemo(() => {
    return dayTasks.filter((t) => !getTaskHourRange(t.dueTime, t.estimate));
  }, [dayTasks]);

  const selectedMood = data.moods.find((m) => m.date === selectedDate);

  function handleScheduleTask(taskId: string, hour: number) {
    const formattedHour = `${String(hour).padStart(2, '0')}:00`;
    actions.updateTask(taskId, { dueTime: formattedHour });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-6">
      {/* Editorial Almanac Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-divider pb-5">
        <div className="space-y-1">
          <p className="font-hand text-[1.1rem] leading-none text-ink-soft">
            {formatLongDay(selectedDate)}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2.15rem]">
              Time Blocking
            </h1>
            {selectedMood && (
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                <span aria-hidden="true" className="text-divider">·</span>
                <CatFace mood={selectedMood.mood} size={18} decorative />
                <span className="italic capitalize">{selectedMood.mood}</span>
              </span>
            )}
          </div>
        </div>

        {/* Date & View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-[4px] border border-lilac-200 bg-cream p-0.5">
            <button
              type="button"
              onClick={() => stepDate(-1)}
              aria-label="Previous"
              className="grid h-8 w-8 place-items-center rounded-[3px] text-ink-soft transition hover:bg-lilac-100 hover:text-ink"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="px-2.5 text-xs font-medium text-ink transition hover:text-lilac-700"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => stepDate(1)}
              aria-label="Next"
              className="grid h-8 w-8 place-items-center rounded-[3px] text-ink-soft transition hover:bg-lilac-100 hover:text-ink"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="inline-flex rounded-[4px] border border-lilac-200 bg-paper-2 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={cx(
                'rounded-[3px] px-3 py-1.5 text-xs font-medium transition',
                viewMode === 'day'
                  ? 'bg-cream text-ink shadow-soft'
                  : 'text-ink-soft hover:text-ink',
              )}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={cx(
                'rounded-[3px] px-3 py-1.5 text-xs font-medium transition',
                viewMode === 'week'
                  ? 'bg-cream text-ink shadow-soft'
                  : 'text-ink-soft hover:text-ink',
              )}
            >
              Week
            </button>
          </div>

          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => openCreate('task', { defaults: { dueDate: selectedDate } })}
          >
            New task
          </Button>
        </div>
      </header>

      {/* Week Almanac Strip */}
      <div className="paper-sheet grid grid-cols-7 divide-x divide-divider/70 overflow-hidden rounded-[5px]">
        {weekDays.map((d) => {
          const dateObj = new Date(d + 'T12:00:00');
          const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()];
          const dayNum = dateObj.getDate();
          const isSelected = d === selectedDate;
          const isToday = d === today;
          const dayMood = data.moods.find((m) => m.date === d);

          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDate(d)}
              className={cx(
                'relative flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 transition',
                isSelected
                  ? 'bg-lilac-300 text-primary-ink'
                  : isToday
                    ? 'bg-paper-2/70 text-ink hover:bg-paper-2'
                    : 'bg-transparent text-ink-soft hover:bg-lilac-100/50 hover:text-ink',
              )}
            >
              <span
                className={cx(
                  'text-[10px] uppercase tracking-wider',
                  isSelected ? 'text-primary-ink/80' : 'text-ink-soft',
                )}
              >
                {dayName}
              </span>
              <span
                className={cx(
                  'font-display text-lg font-semibold tabular-nums leading-tight',
                  isSelected ? 'text-primary-ink' : 'text-ink',
                )}
              >
                {dayNum}
              </span>
              {dayMood ? (
                <div className="mt-0.5">
                  <CatFace mood={dayMood.mood} size={17} decorative />
                </div>
              ) : (
                <span className="h-[17px] w-[17px]" aria-hidden="true" />
              )}
              {isToday && !isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-lilac-300"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Hourly Ledger & Margin List */}
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_290px]">
        {/* Time Blocking Schedule Ledger */}
        <Card padding="none" className="overflow-hidden">
          <div className="divide-y divide-divider/65">
            {HOURS.map((hour) => {
              const hourString = `${String(hour).padStart(2, '0')}:00`;
              const tasksInHour = scheduledTasks.filter((t) => {
                const range = getTaskHourRange(t.dueTime, t.estimate);
                if (!range) return false;
                return hour >= range.startHour && hour < range.endHour;
              });

              return (
                <div
                  key={hour}
                  className="group flex min-h-[56px] items-stretch transition hover:bg-lilac-100/35"
                >
                  {/* Hour margin */}
                  <span className="w-16 shrink-0 border-r border-divider/60 px-3 py-2.5 text-right text-xs tabular-nums text-ink-soft">
                    {hourString}
                  </span>

                  {/* Hour slot */}
                  <div className="flex flex-1 flex-wrap items-center gap-2 px-3 py-2">
                    {tasksInHour.map((task) => {
                      const tone = accent(task.color);
                      return (
                        <div
                          key={task.id}
                          onClick={() => setDetailTaskId(task.id)}
                          className={cx(
                            'flex cursor-pointer items-center gap-2 rounded-[4px] border px-2.5 py-1.5 text-xs transition hover:brightness-[0.98]',
                            tone.soft,
                            tone.border,
                          )}
                        >
                          <TaskCheckbox
                            checked={task.status === 'done'}
                            onChange={() => actions.toggleTaskDone(task.id)}
                            label={`Mark ${task.title} as done`}
                            size="sm"
                          />
                          <span className="max-w-[220px] truncate font-medium text-ink">
                            {task.title}
                          </span>
                          {task.estimate && (
                            <span className="text-[11px] tabular-nums text-ink-soft">
                              {task.estimate}m
                            </span>
                          )}
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() =>
                        openCreate('task', {
                          defaults: {
                            dueDate: selectedDate,
                            dueTime: hourString,
                          },
                        })
                      }
                      title={`Add task at ${hourString}`}
                      className="inline-flex items-center gap-1 rounded-[3px] px-2 py-1 text-[11px] text-ink-soft opacity-0 transition hover:bg-lilac-100 hover:text-ink focus:opacity-100 group-hover:opacity-100"
                    >
                      <Plus size={12} />
                      <span>{tasksInHour.length === 0 ? `Plan at ${hourString}` : 'Add another'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Unscheduled Margin Notes */}
        <aside className="space-y-4">
          <Card variant="aged" padding="md" className="space-y-3">
            <div className="flex items-baseline justify-between border-b border-divider pb-2">
              <h2 className="font-display text-xl font-semibold text-ink">
                Unscheduled for today
              </h2>
              <span className="text-xs tabular-nums text-ink-soft">
                {unscheduledTasks.length}
              </span>
            </div>

            {unscheduledTasks.length === 0 ? (
              <p className="py-4 text-center text-xs italic text-ink-soft">
                All tasks for today have a quiet time slot.
              </p>
            ) : (
              <ul className="divide-y divide-divider/65">
                {unscheduledTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-2 py-2.5 first:pt-1 last:pb-0"
                  >
                    <button
                      type="button"
                      onClick={() => setDetailTaskId(task.id)}
                      className="min-w-0 flex-1 truncate text-left text-xs font-medium text-ink transition hover:text-lilac-700"
                    >
                      {task.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScheduleTask(task.id, 9)}
                      className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-lilac-700 transition hover:underline"
                    >
                      <Clock size={11} aria-hidden="true" />
                      <span>Slot at 9am</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
