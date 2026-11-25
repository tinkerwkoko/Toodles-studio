import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Cat } from '../components/Cat';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Field';
import { cx } from '../lib/cx';
import { nowTimestamp, todayString } from '../lib/date';
import { useToodles } from '../store/useToodles';
import { useUi } from '../store/useUi';

type Mode = 'focus' | 'shortBreak' | 'longBreak';

const DEFAULT_DURATIONS: Record<Mode, number> = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

export function FocusPage() {
  const { data, actions } = useToodles();
  const { pushToast } = useUi();
  const today = todayString();

  const [mode, setMode] = useState<Mode>('focus');
  const [running, setRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  // Timestamp-based timing (survives tab switches and refreshes)
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_DURATIONS.focus * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(DEFAULT_DURATIONS.focus * 60);
  const endTimeRef = useRef<number | null>(null);
  const sessionStartRef = useRef<string | null>(null);

  // Switch modes
  function switchMode(newMode: Mode) {
    setRunning(false);
    endTimeRef.current = null;
    sessionStartRef.current = null;
    setMode(newMode);
    const secs = DEFAULT_DURATIONS[newMode] * 60;
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
  }

  // Timer loop checking Date.now()
  useEffect(() => {
    if (!running) return;

    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + secondsRemaining * 1000;
      if (!sessionStartRef.current) {
        sessionStartRef.current = nowTimestamp();
      }
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, Math.round((endTimeRef.current! - now) / 1000));
      setSecondsRemaining(left);

      if (left <= 0) {
        clearInterval(interval);
        setRunning(false);
        endTimeRef.current = null;

        // Log session
        const actualMinutes = Math.round(totalSeconds / 60);
        actions.logFocusSession({
          taskId: selectedTaskId || null,
          projectId: data.tasks.find((t) => t.id === selectedTaskId)?.projectId ?? null,
          type: mode === 'focus' ? 'focus' : 'break',
          plannedMinutes: Math.round(totalSeconds / 60),
          actualMinutes,
          startedAt: sessionStartRef.current ?? nowTimestamp(),
          endedAt: nowTimestamp(),
          completed: true,
        });

        pushToast(
          mode === 'focus'
            ? 'Quiet focus session complete! Well done.'
            : 'Break finished. Ready for another gentle focus?',
          'success',
        );
        sessionStartRef.current = null;
      }
    }, 250);

    return () => clearInterval(interval);
  }, [running, secondsRemaining, totalSeconds, mode, selectedTaskId, data.tasks, actions, pushToast]);

  function handleStart() {
    setRunning(true);
    endTimeRef.current = Date.now() + secondsRemaining * 1000;
    if (!sessionStartRef.current) {
      sessionStartRef.current = nowTimestamp();
    }
  }

  function handlePause() {
    setRunning(false);
    endTimeRef.current = null;
  }

  function handleReset() {
    setRunning(false);
    endTimeRef.current = null;
    sessionStartRef.current = null;
    const secs = DEFAULT_DURATIONS[mode] * 60;
    setSecondsRemaining(secs);
  }

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;

  const openTasks = data.tasks.filter((t) => t.status === 'todo');

  const todaySessions = (data.focusSessions ?? []).filter(
    (s) => s.startedAt.slice(0, 10) === today && s.type === 'focus',
  );
  const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.actualMinutes, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-6">
      <header className="space-y-1 border-b border-divider pb-5">
        <p className="font-hand text-[1.1rem] leading-none text-ink-soft">Quiet clock</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2.15rem]">
          Focus Corner
        </h1>
        <p className="text-sm text-ink-soft">
          Pick one thing, start the quiet clock, and work with a peaceful mind.
        </p>
      </header>

      {/* Main Timer Folio */}
      <Card variant="stack" padding="lg" className="flex flex-col items-center gap-6 text-center">
        {/* Mode Selector */}
        <div className="inline-flex flex-wrap items-center justify-center rounded-[4px] border border-lilac-200 bg-paper-2 p-0.5">
          {(
            [
              ['focus', 'Focus (25m)'],
              ['shortBreak', 'Short break (5m)'],
              ['longBreak', 'Long break (15m)'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => switchMode(value)}
              className={cx(
                'rounded-[3px] px-3.5 py-1.5 text-xs font-medium transition',
                mode === value ? 'bg-cream text-ink shadow-soft' : 'text-ink-soft hover:text-ink',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mascot */}
        <Cat
          pose={mode === 'focus' ? (running ? 'happy' : 'curious') : 'sleepy'}
          size={110}
          animated
        />

        {/* Clock display */}
        <div className="space-y-3">
          <div className="font-display text-6xl font-semibold tracking-wider tabular-nums text-ink sm:text-7xl">
            {formattedTime}
          </div>
          <div className="mx-auto h-1.5 w-56 overflow-hidden rounded-[2px] bg-paper-2 sm:w-72">
            <div
              className="h-full rounded-[2px] bg-lilac-300 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Task linking */}
        {mode === 'focus' && openTasks.length > 0 && (
          <div className="w-full max-w-sm text-left">
            <label className="mb-1 block text-xs uppercase tracking-wider text-ink-soft">
              Focus on a task (optional)
            </label>
            <Select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              disabled={running}
            >
              <option value="">No specific task</option>
              {openTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          {running ? (
            <Button variant="soft" size="lg" icon={<Pause size={16} />} onClick={handlePause}>
              Pause
            </Button>
          ) : (
            <Button variant="primary" size="lg" icon={<Play size={16} />} onClick={handleStart}>
              {secondsRemaining < totalSeconds ? 'Resume' : 'Start'}
            </Button>
          )}

          <Button
            variant="ghost"
            size="lg"
            icon={<RotateCcw size={16} />}
            onClick={handleReset}
            aria-label="Reset timer"
          >
            Reset
          </Button>
        </div>
      </Card>

      {/* Hairline-Divided Daily Focus Ledger */}
      <div className="paper-sheet grid grid-cols-2 divide-x divide-divider/70 rounded-[5px]">
        <div className="px-5 py-4">
          <div className="text-[11px] uppercase tracking-wider text-ink-soft">Focused today</div>
          <div className="mt-1 font-display text-3xl font-semibold tabular-nums text-ink">
            {todayFocusMinutes}m
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="text-[11px] uppercase tracking-wider text-ink-soft">
            Sessions completed
          </div>
          <div className="mt-1 font-display text-3xl font-semibold tabular-nums text-ink">
            {todaySessions.length}
          </div>
        </div>
      </div>
    </div>
  );
}
