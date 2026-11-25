import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Cat } from '../components/Cat';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Field';
import { BotanicalDivider, FernSprig } from '../components/ui/BotanicalOrnaments';
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

  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_DURATIONS.focus * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(DEFAULT_DURATIONS.focus * 60);
  const endTimeRef = useRef<number | null>(null);
  const sessionStartRef = useRef<string | null>(null);

  function switchMode(newMode: Mode) {
    setRunning(false);
    endTimeRef.current = null;
    sessionStartRef.current = null;
    setMode(newMode);
    const secs = DEFAULT_DURATIONS[newMode] * 60;
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
  }

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
      <header className="space-y-3">
        <div className="space-y-1">
          <h1 className="font-display text-3xl tracking-tight text-ink sm:text-[2.2rem]">
            Focus Corner
          </h1>
          <p className="font-typewriter text-xs text-ink-soft leading-relaxed">
            Pick one thing, start the quiet clock, and work with a peaceful mind.
          </p>
        </div>
        <BotanicalDivider />
      </header>

      <Card
        variant="stack"
        padding="lg"
        className="relative overflow-hidden flex flex-col items-center gap-6 text-center"
      >
        <FernSprig className="absolute -top-2 -right-3 w-32 text-fern/20" />

        <div className="relative inline-flex flex-wrap items-center justify-center rounded-[8px] bg-paper-2/75 p-1">
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
                'rounded-[6px] px-3.5 py-1.5 font-typewriter text-xs transition cursor-pointer',
                mode === value ? 'bg-cream text-ink shadow-soft' : 'text-ink-soft hover:text-ink',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Cat
          pose={mode === 'focus' ? (running ? 'happy' : 'curious') : 'sleepy'}
          size={110}
          animated
        />

        <div className="space-y-3">
          <div className="font-display text-6xl tracking-wider tabular-nums text-ink sm:text-7xl">
            {formattedTime}
          </div>
          <div className="mx-auto h-1.5 w-56 overflow-hidden rounded-full bg-paper-2 sm:w-72">
            <div
              className="h-full rounded-full bg-lilac-300 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {mode === 'focus' && openTasks.length > 0 && (
          <div className="w-full max-w-sm text-left">
            <label className="mb-1.5 block font-typewriter text-[11px] uppercase tracking-[0.06em] text-ink-soft">
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

      <div className="rounded-[10px] bg-paper-2/45 grid grid-cols-2 divide-x divide-divider/60">
        <div className="px-5 py-4">
          <div className="font-typewriter text-[11px] tracking-wide text-ink-soft">Focused today</div>
          <div className="mt-1.5 font-display text-3xl tabular-nums text-ink">
            {todayFocusMinutes}m
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="font-typewriter text-[11px] tracking-wide text-ink-soft">
            Sessions completed
          </div>
          <div className="mt-1.5 font-display text-3xl tabular-nums text-ink">
            {todaySessions.length}
          </div>
        </div>
      </div>
    </div>
  );
}
