import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Check,
  Clock,
  Coffee,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Target,
  Timer,
} from 'lucide-react';
import { Cat } from '../components/Cat';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Field';
import { TaskCheckbox } from '../components/ui/TaskCheckbox';
import { cx } from '../lib/cx';
import { nowTimestamp } from '../lib/date';
import { useToodles } from '../store/useToodles';
import { useUi } from '../store/useUi';
import type { Task } from '../types';

type TimerMode = 'stopwatch' | 'pomodoro' | 'break';

const POMODORO_DURATIONS: Record<'pomodoro' | 'break', number> = {
  pomodoro: 25,
  break: 5,
};

export function StudyPage() {
  const { data, actions } = useToodles();
  const { openCreate, pushToast } = useUi();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('tab') === 'focus' ? 'pomodoro' : 'stopwatch';

  const [mode, setMode] = useState<TimerMode>(initialMode);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [running, setRunning] = useState(false);

  // Stopwatch state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const stopwatchStartRef = useRef<number | null>(null);

  // Pomodoro countdown state
  const [pomoRemaining, setPomoRemaining] = useState(POMODORO_DURATIONS.pomodoro * 60);
  const pomoEndRef = useRef<number | null>(null);
  const sessionStartedAtRef = useRef<string | null>(null);

  // Filter study-related tasks
  const studyTasks = useMemo(() => {
    return data.tasks.filter(
      (t) =>
        t.type === 'study' ||
        t.tags.some((tag) => tag.toLowerCase() === 'study') ||
        t.title.toLowerCase().includes('study') ||
        t.title.toLowerCase().includes('read') ||
        t.title.toLowerCase().includes('learn') ||
        t.title.toLowerCase().includes('exam') ||
        t.title.toLowerCase().includes('dbms') ||
        t.title.toLowerCase().includes('course'),
    );
  }, [data.tasks]);

  const openStudyTasks = useMemo(() => studyTasks.filter((t) => t.status === 'todo'), [studyTasks]);
  const doneStudyTasks = useMemo(() => studyTasks.filter((t) => t.status === 'done'), [studyTasks]);

  // Selected task object
  const selectedTask = useMemo(
    () => data.tasks.find((t) => t.id === selectedTaskId) ?? null,
    [data.tasks, selectedTaskId],
  );

  // Calculate hours studied for a specific task
  function getTaskStudiedMinutes(taskId: string): number {
    return (data.focusSessions ?? [])
      .filter((s) => s.taskId === taskId)
      .reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
  }

  function formatMinutes(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  }

  // Total study time across all sessions
  const totalStudyMinutes = useMemo(() => {
    return (data.focusSessions ?? []).reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
  }, [data.focusSessions]);

  // Handle mode switches
  function switchMode(newMode: TimerMode) {
    setRunning(false);
    stopwatchStartRef.current = null;
    pomoEndRef.current = null;
    sessionStartedAtRef.current = null;
    setMode(newMode);
    if (newMode === 'pomodoro') {
      setPomoRemaining(POMODORO_DURATIONS.pomodoro * 60);
    } else if (newMode === 'break') {
      setPomoRemaining(POMODORO_DURATIONS.break * 60);
    }
  }

  // Stopwatch timer loop
  useEffect(() => {
    if (!running || mode !== 'stopwatch') return;

    if (!stopwatchStartRef.current) {
      stopwatchStartRef.current = Date.now() - elapsedSeconds * 1000;
      if (!sessionStartedAtRef.current) {
        sessionStartedAtRef.current = nowTimestamp();
      }
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const secs = Math.floor((now - stopwatchStartRef.current!) / 1000);
      setElapsedSeconds(secs);
    }, 250);

    return () => clearInterval(interval);
  }, [running, elapsedSeconds, mode]);

  // Pomodoro / Break timer loop
  useEffect(() => {
    if (!running || (mode !== 'pomodoro' && mode !== 'break')) return;

    if (!pomoEndRef.current) {
      pomoEndRef.current = Date.now() + pomoRemaining * 1000;
      if (!sessionStartedAtRef.current) {
        sessionStartedAtRef.current = nowTimestamp();
      }
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, Math.round((pomoEndRef.current! - now) / 1000));
      setPomoRemaining(left);

      if (left <= 0) {
        clearInterval(interval);
        setRunning(false);
        pomoEndRef.current = null;

        const dur = mode === 'pomodoro' ? POMODORO_DURATIONS.pomodoro : POMODORO_DURATIONS.break;
        actions.logFocusSession({
          taskId: selectedTaskId || null,
          projectId: selectedTask?.projectId ?? null,
          type: mode === 'pomodoro' ? 'focus' : 'break',
          plannedMinutes: dur,
          actualMinutes: dur,
          startedAt: sessionStartedAtRef.current ?? nowTimestamp(),
          endedAt: nowTimestamp(),
          completed: true,
        });

        pushToast(
          mode === 'pomodoro'
            ? `Quiet study focus session completed! ${selectedTask ? `Logged for "${selectedTask.title}".` : ''}`
            : 'Break finished. Ready for another gentle study session?',
          'success',
        );
        sessionStartedAtRef.current = null;
        setPomoRemaining(dur * 60);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [running, pomoRemaining, mode, selectedTaskId, selectedTask, actions, pushToast]);

  function handleStart() {
    setRunning(true);
    if (!sessionStartedAtRef.current) {
      sessionStartedAtRef.current = nowTimestamp();
    }
    if (mode === 'stopwatch') {
      stopwatchStartRef.current = Date.now() - elapsedSeconds * 1000;
    } else {
      pomoEndRef.current = Date.now() + pomoRemaining * 1000;
    }
  }

  function handlePause() {
    setRunning(false);
    stopwatchStartRef.current = null;
    pomoEndRef.current = null;
  }

  function handleReset() {
    setRunning(false);
    stopwatchStartRef.current = null;
    pomoEndRef.current = null;
    sessionStartedAtRef.current = null;
    if (mode === 'stopwatch') {
      setElapsedSeconds(0);
    } else if (mode === 'pomodoro') {
      setPomoRemaining(POMODORO_DURATIONS.pomodoro * 60);
    } else {
      setPomoRemaining(POMODORO_DURATIONS.break * 60);
    }
  }

  function handleLogStopwatchTime() {
    if (elapsedSeconds < 60) {
      pushToast('Study for at least 1 minute to save your session');
      return;
    }
    const minutes = Math.round(elapsedSeconds / 60);
    actions.logFocusSession({
      taskId: selectedTaskId || null,
      projectId: selectedTask?.projectId ?? null,
      type: 'focus',
      plannedMinutes: minutes,
      actualMinutes: minutes,
      startedAt: sessionStartedAtRef.current ?? nowTimestamp(),
      endedAt: nowTimestamp(),
      completed: true,
    });

    const taskNote = selectedTask ? ` on "${selectedTask.title}"` : '';
    pushToast(`Logged ${formatMinutes(minutes)} of study time${taskNote}.`, 'success');
    handleReset();
  }

  function selectTaskForStudy(task: Task) {
    setSelectedTaskId(task.id);
    pushToast(`Timer linked to "${task.title}"`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Formatting strings
  const stopwatchHours = Math.floor(elapsedSeconds / 3600);
  const stopwatchMins = Math.floor((elapsedSeconds % 3600) / 60);
  const stopwatchSecs = elapsedSeconds % 60;
  const stopwatchFormatted =
    stopwatchHours > 0
      ? `${stopwatchHours}h ${String(stopwatchMins).padStart(2, '0')}m`
      : `${String(stopwatchMins).padStart(2, '0')}:${String(stopwatchSecs).padStart(2, '0')}`;

  const pomoMins = Math.floor(pomoRemaining / 60);
  const pomoSecs = pomoRemaining % 60;
  const pomoFormatted = `${String(pomoMins).padStart(2, '0')}:${String(pomoSecs).padStart(2, '0')}`;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-6">
      {/* Editorial Reading Room Header */}
      <header className="flex flex-col items-start justify-between gap-3 border-b border-divider pb-5 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <p className="font-hand text-[1.1rem] leading-none text-ink-soft">Reading desk</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2.15rem]">
            Study &amp; Focus Corner
          </h1>
          <p className="text-sm text-ink-soft">
            A quiet sanctuary for revisions, deep reading, and tracking hours studied per task.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-soft">
          <Clock size={14} className="text-lilac-700" aria-hidden="true" />
          <span>
            Total studied:{' '}
            <strong className="font-semibold tabular-nums text-ink">
              {formatMinutes(totalStudyMinutes)}
            </strong>
          </span>
        </div>
      </header>

      {/* Main Study Timer Folio */}
      <Card variant="stack" padding="lg" className="flex flex-col items-center gap-6 text-center">
        {/* Stationery mode strip */}
        <div className="inline-flex flex-wrap items-center justify-center rounded-[4px] border border-lilac-200 bg-paper-2 p-0.5">
          <button
            type="button"
            onClick={() => switchMode('stopwatch')}
            className={cx(
              'flex cursor-pointer items-center gap-1.5 rounded-[3px] px-3.5 py-1.5 text-xs font-medium transition',
              mode === 'stopwatch'
                ? 'bg-cream text-ink shadow-soft'
                : 'text-ink-soft hover:text-ink',
            )}
          >
            <Clock size={13} aria-hidden="true" />
            <span>Open Stopwatch</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('pomodoro')}
            className={cx(
              'flex cursor-pointer items-center gap-1.5 rounded-[3px] px-3.5 py-1.5 text-xs font-medium transition',
              mode === 'pomodoro'
                ? 'bg-cream text-ink shadow-soft'
                : 'text-ink-soft hover:text-ink',
            )}
          >
            <Target size={13} aria-hidden="true" />
            <span>25m Focus</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('break')}
            className={cx(
              'flex cursor-pointer items-center gap-1.5 rounded-[3px] px-3.5 py-1.5 text-xs font-medium transition',
              mode === 'break'
                ? 'bg-cream text-ink shadow-soft'
                : 'text-ink-soft hover:text-ink',
            )}
          >
            <Coffee size={13} aria-hidden="true" />
            <span>5m Calm Break</span>
          </button>
        </div>

        {/* Mascot */}
        <Cat
          pose={running ? (mode === 'break' ? 'sleepy' : 'happy') : 'curious'}
          size={98}
          animated
        />

        {/* Monumental Almanac Digits */}
        <div className="space-y-1.5">
          <div className="font-display text-6xl font-semibold tracking-wider tabular-nums text-ink sm:text-7xl">
            {mode === 'stopwatch' ? stopwatchFormatted : pomoFormatted}
          </div>
          <p className="text-xs italic text-ink-soft">
            {mode === 'stopwatch'
              ? 'Stopwatch running quietly · Save whenever you are ready'
              : mode === 'pomodoro'
                ? 'Gentle 25-minute Pomodoro focus block'
                : 'Take a soft stretch, sip water, rest your eyes'}
          </p>
        </div>

        {/* Task Linkage Inset */}
        <div className="w-full max-w-md rounded-[4px] border border-lilac-200/85 bg-paper-2/65 p-3 text-left">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider text-[11px] text-ink-soft">Studying for</span>
            {selectedTask && (
              <button
                type="button"
                onClick={() => setSelectedTaskId('')}
                className="cursor-pointer text-xs text-lilac-700 hover:underline"
              >
                Unlink
              </button>
            )}
          </div>

          <Select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            aria-label="Select study task"
          >
            <option value="">General quiet study (no specific task)</option>
            {data.tasks
              .filter((t) => t.status === 'todo')
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
          </Select>

          {selectedTask && (
            <div className="mt-2 flex items-center justify-between border-t border-divider/70 pt-2 text-xs text-ink-soft">
              <span className="truncate pr-2">{selectedTask.title}</span>
              <span className="shrink-0 font-medium tabular-nums text-lilac-700">
                {formatMinutes(getTaskStudiedMinutes(selectedTask.id))} studied
              </span>
            </div>
          )}
        </div>

        {/* Timer Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {running ? (
            <Button variant="soft" size="lg" icon={<Pause size={16} />} onClick={handlePause}>
              Pause
            </Button>
          ) : (
            <Button variant="primary" size="lg" icon={<Play size={16} />} onClick={handleStart}>
              {mode === 'stopwatch'
                ? elapsedSeconds > 0
                  ? 'Resume'
                  : 'Start study timer'
                : pomoRemaining <
                    (mode === 'pomodoro' ? POMODORO_DURATIONS.pomodoro : POMODORO_DURATIONS.break) *
                      60
                  ? 'Resume'
                  : 'Start focus block'}
            </Button>
          )}

          {mode === 'stopwatch' && elapsedSeconds > 0 && (
            <Button
              variant="soft"
              size="lg"
              icon={<Check size={16} />}
              onClick={handleLogStopwatchTime}
            >
              Log study time
            </Button>
          )}

          {((mode === 'stopwatch' && elapsedSeconds > 0) ||
            ((mode === 'pomodoro' || mode === 'break') &&
              pomoRemaining <
                (mode === 'pomodoro' ? POMODORO_DURATIONS.pomodoro : POMODORO_DURATIONS.break) *
                  60)) && (
            <Button
              variant="ghost"
              size="lg"
              icon={<RotateCcw size={16} />}
              onClick={handleReset}
              aria-label="Reset timer"
            >
              Reset
            </Button>
          )}
        </div>
      </Card>

      {/* Study Tasks & Reading Goals Ledger */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3 border-b border-divider pb-2.5">
          <div className="flex items-baseline gap-2.5">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Study tasks &amp; reading goals
            </h2>
            <span className="text-xs tabular-nums text-ink-soft">
              {openStudyTasks.length} open
            </span>
          </div>

          <Button
            size="sm"
            variant="soft"
            icon={<Plus size={14} />}
            onClick={() =>
              openCreate('task', {
                defaults: {
                  tags: ['study'],
                },
              })
            }
          >
            Add study task
          </Button>
        </div>

        <Card padding="md">
          {studyTasks.length === 0 ? (
            <div className="space-y-3 py-6 text-center text-ink-soft">
              <p className="text-sm italic">
                No study tasks yet. Add a study goal (like &ldquo;Study DBMS&rdquo; or &ldquo;Read
                Chapter 4&rdquo;) to track hours studied.
              </p>
              <Button
                variant="soft"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() =>
                  openCreate('task', {
                    defaults: {
                      title: 'Study DBMS',
                      tags: ['study'],
                    },
                  })
                }
              >
                Add a sample study task
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {openStudyTasks.length > 0 && (
                <ul className="divide-y divide-divider/70">
                  {openStudyTasks.map((task) => {
                    const taskMins = getTaskStudiedMinutes(task.id);
                    const isCurrent = selectedTaskId === task.id;

                    return (
                      <li
                        key={task.id}
                        className={cx(
                          'flex items-center justify-between gap-3 px-2 py-3 transition',
                          isCurrent ? 'bg-paper-2/75' : 'hover:bg-lilac-100/35',
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <TaskCheckbox
                            checked={false}
                            onChange={() => actions.toggleTaskDone(task.id)}
                            label={`Mark ${task.title} as done`}
                          />
                          <div
                            className="min-w-0 flex-1 cursor-pointer"
                            onClick={() => selectTaskForStudy(task)}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-medium text-sm text-ink">{task.title}</p>
                              {isCurrent && (
                                <span className="text-[11px] italic text-lilac-700">
                                  · Active in timer
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                              {task.dueDate && (
                                <span className="tabular-nums">Due {task.dueDate}</span>
                              )}
                              {taskMins > 0 ? (
                                <span className="inline-flex items-center gap-1 font-medium tabular-nums text-lilac-700">
                                  <Clock size={11} aria-hidden="true" />
                                  {formatMinutes(taskMins)} studied
                                </span>
                              ) : (
                                <span className="italic">No time logged yet</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => selectTaskForStudy(task)}
                          title={`Study "${task.title}" with timer`}
                          className={cx(
                            'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[4px] px-3 py-1.5 text-xs font-medium transition',
                            isCurrent
                              ? 'bg-lilac-300 text-primary-ink'
                              : 'border border-lilac-200 bg-cream text-ink hover:bg-lilac-100',
                          )}
                        >
                          <Timer size={13} aria-hidden="true" />
                          <span>{isCurrent && running ? 'Studying…' : 'Study this'}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {doneStudyTasks.length > 0 && (
                <div className="border-t border-divider pt-3">
                  <span className="mb-1.5 block text-xs uppercase tracking-wider text-ink-soft">
                    Completed study ({doneStudyTasks.length})
                  </span>
                  <ul className="divide-y divide-divider/60 opacity-75">
                    {doneStudyTasks.map((task) => {
                      const taskMins = getTaskStudiedMinutes(task.id);
                      return (
                        <li
                          key={task.id}
                          className="flex items-center justify-between gap-3 px-2 py-2 text-ink-soft line-through"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <TaskCheckbox
                              checked={true}
                              onChange={() => actions.toggleTaskDone(task.id)}
                              label={`Mark ${task.title} as todo`}
                            />
                            <span className="flex-1 truncate text-sm">{task.title}</span>
                          </div>
                          {taskMins > 0 && (
                            <span className="shrink-0 text-xs tabular-nums text-ink-soft no-underline">
                              {formatMinutes(taskMins)} studied
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
