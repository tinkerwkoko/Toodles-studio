import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
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
import { TaskCheckbox } from '../components/ui/TaskCheckbox';
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
    pushToast(`Logged ${formatMinutes(minutes)} of study time${taskNote}! 📖`, 'success');
    handleReset();
  }

  function selectTaskForStudy(task: Task) {
    setSelectedTaskId(task.id);
    pushToast(`Timer linked to "${task.title}" ⏱️`);
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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <BookOpen size={26} className="text-accent" aria-hidden="true" />
            <h1 className="font-display text-3xl text-ink">Study & Focus Corner</h1>
          </div>
          <p className="font-sans text-sm text-ink-soft">
            A quiet sanctuary for revisions, deep reading, and tracking hours studied per task.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-divider bg-card px-3.5 py-1.5 shadow-sm">
          <Clock size={14} className="text-accent" />
          <span className="font-title text-xs font-medium text-ink">
            Total studied: <strong className="text-accent">{formatMinutes(totalStudyMinutes)}</strong>
          </span>
        </div>
      </div>

      {/* Main Study Timer Card */}
      <Card padding="lg" className="flex flex-col items-center gap-5 text-center border-lilac-200">
        {/* Mode selector pills */}
        <div className="flex rounded-full border border-divider bg-lilac-100/60 p-1">
          <button
            type="button"
            onClick={() => switchMode('stopwatch')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-title font-medium transition cursor-pointer ${
              mode === 'stopwatch'
                ? 'bg-lilac-200 text-ink font-semibold shadow-sm'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <Clock size={13} />
            <span>Open Stopwatch</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('pomodoro')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-title font-medium transition cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-lilac-200 text-ink font-semibold shadow-sm'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <Target size={13} />
            <span>25m Focus</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('break')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-title font-medium transition cursor-pointer ${
              mode === 'break'
                ? 'bg-lilac-200 text-ink font-semibold shadow-sm'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <Coffee size={13} />
            <span>5m Calm Break</span>
          </button>
        </div>

        {/* Mascot */}
        <Cat
          pose={running ? (mode === 'break' ? 'sleepy' : 'happy') : 'curious'}
          size={105}
          animated
        />

        {/* Task Linkage Banner */}
        <div className="w-full max-w-md rounded-2xl border border-divider bg-lilac-50/70 p-3">
          <div className="flex items-center justify-between text-xs font-title">
            <span className="text-ink-soft">Studying for:</span>
            {selectedTask ? (
              <button
                type="button"
                onClick={() => setSelectedTaskId('')}
                className="text-xs text-ink-soft hover:text-ink underline cursor-pointer"
              >
                Unlink
              </button>
            ) : null}
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              aria-label="Select study task"
              className="w-full rounded-xl border border-lilac-200 bg-card px-3 py-1.5 text-xs sm:text-sm font-title text-ink focus:border-accent focus:outline-none"
            >
              <option value="">General quiet study (no specific task)</option>
              {data.tasks
                .filter((t) => t.status === 'todo')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>

          {selectedTask && (
            <div className="mt-2 flex items-center justify-between text-[11px] font-sans text-ink-soft pt-1 border-t border-divider">
              <span>Task: {selectedTask.title}</span>
              <span className="font-title font-semibold text-accent">
                {formatMinutes(getTaskStudiedMinutes(selectedTask.id))} studied so far
              </span>
            </div>
          )}
        </div>

        {/* Big digits */}
        <div className="space-y-1">
          <div className="font-display text-6xl tracking-wider text-ink sm:text-7xl">
            {mode === 'stopwatch' ? stopwatchFormatted : pomoFormatted}
          </div>
          <p className="text-xs font-sans text-ink-soft">
            {mode === 'stopwatch'
              ? 'Stopwatch running smoothly · Save whenever you are ready'
              : mode === 'pomodoro'
                ? 'Gentle 25-minute Pomodoro focus block'
                : 'Take a soft stretch, sip water, rest your eyes'}
          </p>
        </div>

        {/* Timer Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {running ? (
            <Button variant="soft" size="lg" icon={<Pause size={18} />} onClick={handlePause}>
              Pause
            </Button>
          ) : (
            <Button variant="primary" size="lg" icon={<Play size={18} />} onClick={handleStart}>
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
              icon={<Check size={18} />}
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
              icon={<RotateCcw size={18} />}
              onClick={handleReset}
              aria-label="Reset timer"
            >
              Reset
            </Button>
          )}
        </div>
      </Card>

      {/* Study Tasks List with individual timer triggers */}
      <Card padding="md" className="space-y-4 border-lilac-200">
        <div className="flex items-center justify-between border-b border-divider pb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl text-ink">Study tasks & reading goals</h2>
            <span className="rounded-full bg-lilac-100 px-2 py-0.5 text-xs font-sans text-ink-soft">
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

        {studyTasks.length === 0 ? (
          <div className="py-6 text-center text-ink-soft space-y-2">
            <p className="text-sm font-sans">
              No study tasks yet. Add a study goal (like &ldquo;Study DBMS&rdquo; or &ldquo;Read Chapter 4&rdquo;) to track hours studied.
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
          <div className="space-y-3">
            {openStudyTasks.length > 0 && (
              <ul className="divide-y divide-divider">
                {openStudyTasks.map((task) => {
                  const taskMins = getTaskStudiedMinutes(task.id);
                  const isCurrent = selectedTaskId === task.id;

                  return (
                    <li
                      key={task.id}
                      className={`flex items-center justify-between gap-3 py-2.5 px-2 rounded-xl transition ${
                        isCurrent
                          ? 'bg-lilac-200/50 border border-accent/40'
                          : 'hover:bg-lilac-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <TaskCheckbox
                          checked={false}
                          onChange={() => actions.toggleTaskDone(task.id)}
                          label={`Mark ${task.title} as done`}
                        />
                        <div
                          className="min-w-0 flex-1 cursor-pointer"
                          onClick={() => selectTaskForStudy(task)}
                        >
                          <div className="flex items-center gap-2">
                            <p className="font-title font-medium text-sm text-ink truncate">
                              {task.title}
                            </p>
                            {isCurrent && (
                              <span className="rounded-full bg-accent/20 px-2 py-0.2 text-[10px] font-title font-semibold text-accent uppercase tracking-wider shrink-0">
                                Active in timer
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-sans text-ink-soft">
                            {task.dueDate && <span>Due {task.dueDate}</span>}
                            {taskMins > 0 ? (
                              <span className="font-title font-semibold text-accent flex items-center gap-1">
                                <Clock size={11} />
                                {formatMinutes(taskMins)} studied
                              </span>
                            ) : (
                              <span>No time logged yet</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Start timer button for this task */}
                      <button
                        type="button"
                        onClick={() => selectTaskForStudy(task)}
                        title={`Study "${task.title}" with timer`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-title font-medium transition cursor-pointer shrink-0 ${
                          isCurrent
                            ? 'bg-accent text-white shadow-sm'
                            : 'border border-divider bg-card text-ink hover:bg-lilac-100'
                        }`}
                      >
                        <Timer size={13} />
                        <span>{isCurrent && running ? 'Studying...' : 'Study this'}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {doneStudyTasks.length > 0 && (
              <div className="border-t border-divider pt-2.5">
                <span className="text-xs font-title font-medium text-ink-soft block mb-1">
                  Completed study ({doneStudyTasks.length})
                </span>
                <ul className="divide-y divide-divider opacity-70">
                  {doneStudyTasks.map((task) => {
                    const taskMins = getTaskStudiedMinutes(task.id);
                    return (
                      <li
                        key={task.id}
                        className="flex items-center justify-between gap-3 py-1.5 px-2 line-through text-ink-soft"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <TaskCheckbox
                            checked={true}
                            onChange={() => actions.toggleTaskDone(task.id)}
                            label={`Mark ${task.title} as todo`}
                          />
                          <span className="font-title text-sm truncate flex-1">{task.title}</span>
                        </div>
                        {taskMins > 0 && (
                          <span className="text-xs font-sans text-ink-soft shrink-0">
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
    </div>
  );
}
