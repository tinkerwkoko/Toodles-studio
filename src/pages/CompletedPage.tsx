import { useMemo, useState } from 'react';
import type { Task } from '../types';
import { completedTasks, completionYears } from '../lib/archive';
import { Dialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { TaskDetail } from '../components/tasks/TaskDetail';
import { CompletedByDate } from '../components/completed/CompletedByDate';
import { CompletedByProject } from '../components/completed/CompletedByProject';
import { cx } from '../lib/cx';
import { useToodles } from '../store/useToodles';
import { useUi } from '../store/useUi';

type ArchiveMode = 'project' | 'date';

/** `/completed`: a personal archive of everything that actually got finished. */
export function CompletedPage() {
  const { data } = useToodles();
  const { detailTask, setDetailTaskId, openCreate } = useUi();
  const [mode, setMode] = useState<ArchiveMode>('project');
  const [year, setYear] = useState<string | null>(null);

  const finished = useMemo(() => completedTasks(data.tasks), [data.tasks]);
  const years = useMemo(() => completionYears(data.tasks), [data.tasks]);
  const selectedYear = year ?? years[0] ?? '';

  const openTask = (task: Task): void => setDetailTaskId(task.id);

  return (
    <div className="pb-4">
      <PageHeader
        title="Completed"
        subtitle="Everything you have finished, kept exactly as long as you want it."
        pose={finished.length === 0 ? 'sleepy' : undefined}
      />

      {finished.length === 0 ? (
        <EmptyState
          title="Your future self has not got much to look back on yet"
          sentence="Tick something off and it will be kept here with the day you finished it."
          actionLabel="See your tasks"
          onAction={() => openCreate('task')}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SegmentedControl
              label="Archive grouping"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'project', label: 'By project' },
                { value: 'date', label: 'By date' },
              ]}
            />
            <p className="text-sm font-semibold text-ink-soft">
              {finished.length} finished task{finished.length === 1 ? '' : 's'}
            </p>
          </div>

          {mode === 'project' ? (
            <CompletedByProject tasks={finished} projects={data.projects} onOpen={openTask} />
          ) : (
            <>
              {years.length > 1 && (
                <div
                  role="group"
                  aria-label="Choose a year"
                  className="mb-4 flex flex-wrap gap-2"
                >
                  {years.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selectedYear === option}
                      onClick={() => setYear(option)}
                      className={cx(
                        'min-h-11 rounded-full border px-4 text-sm font-bold transition',
                        selectedYear === option
                          ? 'border-lilac-500 bg-lilac-500 text-white'
                          : 'border-lilac-200 bg-cream text-lilac-700 hover:bg-lilac-100',
                      )}
                    >
                      {option}
                      <span className="ml-2 text-xs opacity-80">
                        {finished.filter(
                          (task) => task.completedAt?.slice(0, 4) === option,
                        ).length}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <CompletedByDate
                tasks={finished}
                projects={data.projects}
                selectedYear={selectedYear}
                onOpen={openTask}
                onBackToProjects={() => setMode('project')}
              />
            </>
          )}
        </>
      )}

      <Dialog
        open={!!detailTask}
        onClose={() => setDetailTaskId(null)}
        title="Task details"
        size="lg"
      >
        {detailTask && <TaskDetail task={detailTask} onDeleted={() => setDetailTaskId(null)} />}
      </Dialog>
    </div>
  );
}
