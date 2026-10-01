import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import { Cat } from '../components/Cat';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TaskCheckbox } from '../components/ui/TaskCheckbox';
import { nowTimestamp } from '../lib/date';
import { useToodles } from '../store/useToodles';
import { useUi } from '../store/useUi';

export function StudyPage() {
  const { data, actions } = useToodles();
  const { openCreate, pushToast } = useUi();

  // Timestamp-based study stopwatch/timer
  const [running, setRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now() - elapsedSeconds * 1000;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const secs = Math.floor((now - startTimeRef.current!) / 1000);
      setElapsedSeconds(secs);
    }, 250);

    return () => clearInterval(interval);
  }, [running, elapsedSeconds]);

  function handleStart() {
    setRunning(true);
    startTimeRef.current = Date.now() - elapsedSeconds * 1000;
  }

  function handlePause() {
    setRunning(false);
    startTimeRef.current = null;
  }

  function handleReset() {
    setRunning(false);
    startTimeRef.current = null;
    setElapsedSeconds(0);
  }

  function handleLogStudyTime() {
    if (elapsedSeconds < 60) {
      pushToast('Study at least 1 minute to save your session');
      return;
    }
    const minutes = Math.round(elapsedSeconds / 60);
    actions.logFocusSession({
      taskId: null,
      projectId: null,
      type: 'focus',
      plannedMinutes: minutes,
      actualMinutes: minutes,
      startedAt: nowTimestamp(),
      endedAt: nowTimestamp(),
      completed: true,
    });
    pushToast(`Logged ${minutes}m of quiet study time! 📖`, 'success');
    handleReset();
  }

  const hours = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);
  const secs = elapsedSeconds % 60;
  const timeFormatted =
    hours > 0
      ? `${hours}h ${String(mins).padStart(2, '0')}m`
      : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Filter tasks that have 'study' tag or title includes study
  const studyTasks = data.tasks.filter(
    (t) =>
      t.type === 'study' ||
      t.tags.some((tag) => tag.toLowerCase() === 'study') ||
      t.title.toLowerCase().includes('study') ||
      t.title.toLowerCase().includes('read'),
  );

  const openStudyTasks = studyTasks.filter((t) => t.status === 'todo');
  const doneStudyTasks = studyTasks.filter((t) => t.status === 'done');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2.5">
          <BookOpen size={26} className="text-accent" aria-hidden="true" />
          <h1 className="font-display text-3xl text-ink">Study Corner</h1>
        </div>
        <p className="font-sans text-sm text-ink-soft">
          A dedicated sanctuary for reading, revisions, deep learning, and quiet study.
        </p>
      </div>

      {/* Study Stopwatch / Timer */}
      <Card padding="lg" className="flex flex-col items-center gap-5 text-center border-lilac-200">
        <Cat pose={running ? 'happy' : 'curious'} size={110} animated />

        <div className="space-y-1">
          <span className="text-xs font-title font-medium text-ink-soft uppercase tracking-wider">
            Current study session
          </span>
          <div className="font-display text-6xl tracking-wider text-ink sm:text-7xl">
            {timeFormatted}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {running ? (
            <Button variant="soft" size="lg" icon={<Pause size={18} />} onClick={handlePause}>
              Pause
            </Button>
          ) : (
            <Button variant="primary" size="lg" icon={<Play size={18} />} onClick={handleStart}>
              {elapsedSeconds > 0 ? 'Resume' : 'Start studying'}
            </Button>
          )}

          {elapsedSeconds > 0 && (
            <>
              <Button
                variant="soft"
                size="lg"
                icon={<Check size={18} />}
                onClick={handleLogStudyTime}
              >
                Log study time
              </Button>
              <Button
                variant="ghost"
                size="lg"
                icon={<RotateCcw size={18} />}
                onClick={handleReset}
                aria-label="Reset timer"
              >
                Reset
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Study Checklist / Tasks */}
      <Card padding="md" className="space-y-4 border-lilac-200">
        <div className="flex items-center justify-between border-b border-divider pb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl text-ink">Study goals and reading</h2>
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
              No study tasks tagged yet. Tag any task with "study" to have it live here.
            </p>
            <Button
              variant="soft"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() =>
                openCreate('task', {
                  defaults: {
                    tags: ['study'],
                  },
                })
              }
            >
              Add a study task
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {openStudyTasks.length > 0 && (
              <ul className="divide-y divide-divider">
                {openStudyTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 py-2.5 transition hover:bg-lilac-50/50 rounded-xl px-2"
                  >
                    <TaskCheckbox
                      checked={false}
                      onChange={() => actions.toggleTaskDone(task.id)}
                      label={`Mark ${task.title} as done`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-title font-medium text-sm text-ink truncate">
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <p className="font-sans text-xs text-ink-soft">Due {task.dueDate}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {doneStudyTasks.length > 0 && (
              <div className="border-t border-divider pt-2.5">
                <span className="text-xs font-title font-medium text-ink-soft block mb-1">
                  Completed study ({doneStudyTasks.length})
                </span>
                <ul className="divide-y divide-divider opacity-70">
                  {doneStudyTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 py-1.5 px-2 line-through text-ink-soft"
                    >
                      <TaskCheckbox
                        checked={true}
                        onChange={() => actions.toggleTaskDone(task.id)}
                        label={`Mark ${task.title} as todo`}
                      />
                      <span className="font-title text-sm truncate flex-1">{task.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
