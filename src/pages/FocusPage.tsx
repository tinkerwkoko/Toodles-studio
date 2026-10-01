import { useEffect, useRef, useState } from 'react';
import { Coffee, Pause, Play, RotateCcw, Sparkles, Target } from 'lucide-react';
import { Cat } from '../components/Cat';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Field';
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

  // Timer loop via requestAnimationFrame / interval checking Date.now()
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

  // Active uncompleted tasks
  const openTasks = data.tasks.filter((t) => t.status === 'todo');

  // Today's focus sessions
  const todaySessions = (data.focusSessions ?? []).filter(
    (s) => s.startedAt.slice(0, 10) === today && s.type === 'focus',
  );
  const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.actualMinutes, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2.5">
          <Target size={26} className="text-accent" aria-hidden="true" />
          <h1 className="font-display text-3xl text-ink">Focus Corner</h1>
        </div>
        <p className="font-sans text-sm text-ink-soft">
          Pick one thing, start the quiet clock, and work with a peaceful mind.
        </p>
      </div>

      {/* Main Timer Card */}
      <Card padding="lg" className="flex flex-col items-center gap-6 text-center border-lilac-200">
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-lilac-200 bg-lilac-50 p-1">
          <button
            type="button"
            onClick={() => switchMode('focus')}
            className={`rounded-full px-4 py-1.5 text-xs font-title font-medium transition ${
              mode === 'focus' ? 'bg-cream text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
            }`}
          >
            Focus (25m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('shortBreak')}
            className={`rounded-full px-4 py-1.5 text-xs font-title font-medium transition ${
              mode === 'shortBreak' ? 'bg-cream text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
            }`}
          >
            Short break (5m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('longBreak')}
            className={`rounded-full px-4 py-1.5 text-xs font-title font-medium transition ${
              mode === 'longBreak' ? 'bg-cream text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
            }`}
          >
            Long break (15m)
          </button>
        </div>

        {/* Mascot */}
        <div className="relative">
          <Cat
            pose={mode === 'focus' ? (running ? 'happy' : 'curious') : 'sleepy'}
            size={120}
            animated
          />
        </div>

        {/* Clock display */}
        <div className="space-y-2">
          <div className="font-display text-6xl tracking-wider text-ink sm:text-7xl">
            {formattedTime}
          </div>
          {/* Progress bar */}
          <div className="mx-auto h-2 w-56 sm:w-72 overflow-hidden rounded-full bg-lilac-100">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Task linking */}
        {mode === 'focus' && openTasks.length > 0 && (
          <div className="w-full max-w-sm text-left">
            <label className="block text-xs font-title font-medium text-ink-soft mb-1">
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
        <div className="flex items-center gap-3">
          {running ? (
            <Button
              variant="soft"
              size="lg"
              icon={<Pause size={18} />}
              onClick={handlePause}
            >
              Pause
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              icon={<Play size={18} />}
              onClick={handleStart}
            >
              {secondsRemaining < totalSeconds ? 'Resume' : 'Start'}
            </Button>
          )}

          <Button
            variant="ghost"
            size="lg"
            icon={<RotateCcw size={18} />}
            onClick={handleReset}
            aria-label="Reset timer"
          >
            Reset
          </Button>
        </div>
      </Card>

      {/* Focus stats & history */}
      <div className="grid grid-cols-2 gap-4">
        <Card padding="md" className="flex items-center gap-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-peach-100 text-peach-700">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="font-display text-2xl text-ink">{todayFocusMinutes}m</div>
            <div className="font-sans text-xs text-ink-soft">Focused today</div>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-mint-100 text-mint-700">
            <Coffee size={20} />
          </div>
          <div>
            <div className="font-display text-2xl text-ink">{todaySessions.length}</div>
            <div className="font-sans text-xs text-ink-soft">Sessions completed</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
