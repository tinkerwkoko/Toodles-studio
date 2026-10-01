import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { CatFace } from '../components/CatFace';
import { addDays, formatLongDay, todayString } from '../lib/date';
import { accent } from '../lib/color';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TaskCheckbox } from '../components/ui/TaskCheckbox';
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
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-lilac-200 text-ink">
            <CalendarIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl text-ink leading-tight">Time Blocking</h1>
              {selectedMood && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-lilac-100 px-2.5 py-0.5 border border-lilac-200">
                  <CatFace mood={selectedMood.mood} size={18} decorative />
                  <span className="text-[11px] font-title font-medium text-ink capitalize">
                    {selectedMood.mood}
                  </span>
                </div>
              )}
            </div>
            <p className="font-sans text-xs text-ink-soft">
              {formatLongDay(selectedDate)}
            </p>
          </div>
        </div>

        {/* View and Date Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full border border-lilac-200 bg-cream p-0.5">
            <button
              type="button"
              onClick={() => stepDate(-1)}
              aria-label="Previous"
              className="grid h-7 w-7 place-items-center rounded-full text-ink hover:bg-lilac-100 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="px-2.5 text-xs font-title font-medium text-ink hover:underline"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => stepDate(1)}
              aria-label="Next"
              className="grid h-7 w-7 place-items-center rounded-full text-ink hover:bg-lilac-100 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex rounded-full border border-lilac-200 bg-cream p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`rounded-full px-3 py-1 text-xs font-title font-medium transition ${
                viewMode === 'day' ? 'bg-accent text-ink font-bold shadow-sm' : 'text-ink-soft hover:text-ink'
              }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`rounded-full px-3 py-1 text-xs font-title font-medium transition ${
                viewMode === 'week' ? 'bg-accent text-ink font-bold shadow-sm' : 'text-ink-soft hover:text-ink'
              }`}
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
      </div>

      {/* Week Day Pills */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
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
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition ${
                isSelected
                  ? 'border-accent bg-lilac-200 text-ink shadow-sm'
                  : isToday
                    ? 'border-accent/40 bg-cream text-ink'
                    : 'border-lilac-200 bg-cream/70 text-ink-soft hover:bg-lilac-100/60'
              }`}
            >
              <span className="text-[11px] font-sans">{dayName}</span>
              <span className="font-title font-medium text-sm text-ink">{dayNum}</span>
              {dayMood ? (
                <div className="mt-0.5">
                  <CatFace mood={dayMood.mood} size={18} decorative />
                </div>
              ) : (
                <span className="h-[18px] w-[18px]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid & Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px] items-start">
        {/* Time Blocking Schedule Grid */}
        <Card padding="md" className="space-y-1 border-lilac-200">
          <div className="divide-y divide-divider">
            {HOURS.map((hour) => {
              const hourString = `${String(hour).padStart(2, '0')}:00`;
              const tasksInHour = scheduledTasks.filter((t) => {
                const range = getTaskHourRange(t.dueTime, t.estimate);
                if (!range) return false;
                return hour >= range.startHour && hour < range.endHour;
              });

              return (
                <div key={hour} className="flex min-h-[58px] py-1.5 gap-3 group">
                  {/* Hour label */}
                  <span className="w-14 shrink-0 font-sans text-xs text-ink-soft pt-1 text-right">
                    {hourString}
                  </span>

                  {/* Hour Slot Container */}
                  <div className="flex-1 rounded-xl p-1 transition group-hover:bg-lilac-50/50 flex flex-wrap gap-2 items-center">
                    {tasksInHour.map((task) => {
                      const tone = accent(task.color);
                      return (
                        <div
                          key={task.id}
                          onClick={() => setDetailTaskId(task.id)}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-title cursor-pointer transition hover:scale-101 shadow-sm ${tone.soft} ${tone.border}`}
                        >
                          <TaskCheckbox
                            checked={task.status === 'done'}
                            onChange={() => actions.toggleTaskDone(task.id)}
                            label={`Mark ${task.title} as done`}
                            size="sm"
                          />
                          <span className="font-medium text-ink truncate max-w-[200px]">
                            {task.title}
                          </span>
                          {task.estimate && (
                            <span className="text-[10px] font-sans text-ink-soft opacity-80">
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
                      className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-[11px] font-title text-ink-soft hover:text-ink transition px-2 py-1 rounded-lg hover:bg-lilac-100"
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

        {/* Unscheduled / Waiting tasks for this day */}
        <div className="space-y-4">
          <Card padding="md" className="space-y-3 border-lilac-200">
            <div className="flex items-center justify-between border-b border-divider pb-2">
              <h2 className="font-display text-lg text-ink">Unscheduled for today</h2>
              <span className="rounded-full bg-lilac-100 px-2 py-0.5 text-xs font-sans text-ink-soft">
                {unscheduledTasks.length}
              </span>
            </div>

            {unscheduledTasks.length === 0 ? (
              <p className="text-xs font-sans text-ink-soft py-4 text-center">
                All tasks for today have a quiet time slot!
              </p>
            ) : (
              <ul className="space-y-2">
                {unscheduledTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-col gap-1.5 rounded-2xl border border-lilac-200 bg-cream p-2.5 shadow-none"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-title font-medium text-xs text-ink truncate flex-1">
                        {task.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleScheduleTask(task.id, 9)}
                        className="inline-flex items-center gap-1 text-[11px] font-title text-accent hover:underline shrink-0"
                      >
                        <Clock size={11} />
                        <span>Slot at 9am</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
