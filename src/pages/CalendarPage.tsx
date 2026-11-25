import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { CatFace } from '../components/CatFace';
import { addDays, formatLongDay, todayString } from '../lib/date';
import { accent } from '../lib/color';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TaskCheckbox } from '../components/ui/TaskCheckbox';
import { BotanicalDivider, LeafMark } from '../components/ui/BotanicalOrnaments';
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

  const rangeMatch = clean.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|—|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i,
  );
  if (rangeMatch) {
    let start = parseInt(rangeMatch[1], 10);
    const startAmPm = rangeMatch[3]?.toLowerCase();
    let end = parseInt(rangeMatch[4], 10);
    const endMin = rangeMatch[5] ? parseInt(rangeMatch[5], 10) : 0;
    const endAmPm = rangeMatch[6]?.toLowerCase();

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

  const dayTasks = useMemo(() => {
    return data.tasks.filter((t) => {
      if (t.status !== 'todo') return false;
      if (t.dueDate === selectedDate || t.startDate === selectedDate) return true;
      if (t.startDate && t.startDate <= selectedDate && (!t.dueDate || t.dueDate >= selectedDate))
        return true;
      return false;
    });
  }, [data.tasks, selectedDate]);

  const scheduledTasks = useMemo(() => {
    return dayTasks.filter((t) => !!getTaskHourRange(t.dueTime, t.estimate));
  }, [dayTasks]);

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
      <header className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1.5 font-typewriter text-xs text-fern">
              <LeafMark className="h-3.5 w-3.5 text-fern/75" />
              <span>{formatLongDay(selectedDate)}</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl tracking-tight text-ink sm:text-[2.2rem]">
                Time Blocking
              </h1>
              {selectedMood && (
                <span className="inline-flex items-center gap-1.5 font-typewriter text-xs text-ink-soft">
                  <span aria-hidden="true" className="text-divider">·</span>
                  <CatFace mood={selectedMood.mood} size={18} decorative />
                  <span className="capitalize">{selectedMood.mood}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-[8px] bg-cream/95 border border-divider/60 p-0.5 shadow-soft">
              <button
                type="button"
                onClick={() => stepDate(-1)}
                aria-label="Previous"
                className="grid h-8 w-8 place-items-center rounded-[6px] text-ink-soft transition hover:bg-paper-2 hover:text-ink cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(today)}
                className="px-2.5 font-typewriter text-xs text-ink transition hover:text-accent cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => stepDate(1)}
                aria-label="Next"
                className="grid h-8 w-8 place-items-center rounded-[6px] text-ink-soft transition hover:bg-paper-2 hover:text-ink cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="inline-flex rounded-[8px] bg-paper-2/70 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className={cx(
                  'rounded-[6px] px-3 py-1.5 font-typewriter text-xs transition cursor-pointer',
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
                  'rounded-[6px] px-3 py-1.5 font-typewriter text-xs transition cursor-pointer',
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
        </div>
        <BotanicalDivider />
      </header>

      {/* Week Strip */}
      <div className="paper-sheet grid grid-cols-7 divide-x divide-divider/55 overflow-hidden rounded-[10px]">
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
                'relative flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 transition cursor-pointer',
                isSelected
                  ? 'bg-lilac-300 text-primary-ink'
                  : isToday
                    ? 'bg-paper-2/70 text-ink hover:bg-paper-2'
                    : 'bg-transparent text-ink-soft hover:bg-paper-2/40 hover:text-ink',
              )}
            >
              <span
                className={cx(
                  'font-typewriter text-[10px] uppercase tracking-wider',
                  isSelected ? 'text-primary-ink/85' : 'text-ink-soft',
                )}
              >
                {dayName}
              </span>
              <span
                className={cx(
                  'font-display text-lg tabular-nums leading-tight',
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

      {/* Main Hourly Schedule & Unscheduled List */}
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_290px]">
        <Card padding="none" className="overflow-hidden">
          <div className="divide-y divide-divider/55">
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
                  className="group flex min-h-[56px] items-stretch transition hover:bg-paper-2/30"
                >
                  <span className="w-16 shrink-0 border-r border-divider/55 px-3 py-2.5 text-right font-typewriter text-xs tabular-nums text-ink-soft">
                    {hourString}
                  </span>

                  <div className="flex flex-1 flex-wrap items-center gap-2 px-3 py-2">
                    {tasksInHour.map((task) => {
                      const tone = accent(task.color);
                      return (
                        <div
                          key={task.id}
                          onClick={() => setDetailTaskId(task.id)}
                          className={cx(
                            'flex cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-1.5 text-xs transition hover:brightness-[0.97]',
                            tone.soft,
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
                            <span className="font-typewriter text-[11px] tabular-nums text-ink-soft">
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
                      className="inline-flex items-center gap-1 rounded-[6px] px-2 py-1 font-typewriter text-[11px] text-ink-soft opacity-0 transition hover:bg-paper-2 hover:text-ink focus:opacity-100 group-hover:opacity-100 cursor-pointer"
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

        <aside className="space-y-4">
          <Card variant="aged" padding="md" className="space-y-3">
            <div className="flex items-baseline justify-between border-b border-divider/65 pb-2">
              <h2 className="font-display text-xl text-ink">
                Unscheduled for today
              </h2>
              <span className="font-typewriter text-xs tabular-nums text-ink-soft">
                {unscheduledTasks.length}
              </span>
            </div>

            {unscheduledTasks.length === 0 ? (
              <p className="py-4 text-center font-typewriter text-xs text-ink-soft">
                All tasks for today have a quiet time slot.
              </p>
            ) : (
              <ul className="divide-y divide-divider/55">
                {unscheduledTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-2 py-2.5 first:pt-1 last:pb-0"
                  >
                    <button
                      type="button"
                      onClick={() => setDetailTaskId(task.id)}
                      className="min-w-0 flex-1 truncate text-left text-xs font-medium text-ink transition hover:text-accent cursor-pointer"
                    >
                      {task.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScheduleTask(task.id, 9)}
                      className="inline-flex shrink-0 items-center gap-1 font-typewriter text-[11px] text-accent transition hover:underline cursor-pointer"
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
