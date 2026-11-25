import type { Project, Task } from '../../types';
import { groupByDate } from '../../lib/archive';
import { formatDay } from '../../lib/date';
import { EmptyState } from '../ui/EmptyState';
import { CompletedRow } from './CompletedRow';

export interface CompletedByDateProps {
  tasks: Task[];
  projects: Project[];
  selectedYear: string;
  onOpen: (task: Task) => void;
  /** Called when the chosen year has nothing in it. */
  onBackToProjects: () => void;
}

/** Archive grouped Year → Month → Day → tasks, for one chosen year. */
export function CompletedByDate({
  tasks,
  projects,
  selectedYear,
  onOpen,
  onBackToProjects,
}: CompletedByDateProps) {
  const year = groupByDate(tasks).find((group) => group.year === selectedYear) ?? null;

  if (!year) {
    return (
      <EmptyState
        pose="sleepy"
        title={`Nothing finished in ${selectedYear}`}
        sentence="That year is still blank. Finish a task and it will show up here on its own."
        actionLabel="Back to projects"
        onAction={onBackToProjects}
      />
    );
  }

  return (
    <div className="space-y-8">
      {year.months.map((month) => (
        <section key={`${year.year}-${month.month}`} className="space-y-4">
          <div className="flex items-baseline gap-2.5 border-b border-divider pb-2">
            <h2 className="font-display text-2xl font-semibold text-ink">
              {month.label} <span className="text-ink-soft">{year.year}</span>
            </h2>
            <span className="text-xs tabular-nums text-ink-soft">
              {month.days.reduce((sum, day) => sum + day.tasks.length, 0)}
            </span>
          </div>

          {month.days.map((day) => (
            <div key={day.date} className="space-y-2">
              <h3 className="font-hand text-base text-ink-soft">{formatDay(day.date)}</h3>
              <ul className="paper-sheet divide-y divide-divider/65 overflow-hidden rounded-[5px]">
                {day.tasks.map((task) => (
                  <CompletedRow
                    key={task.id}
                    task={task}
                    project={projects.find((project) => project.id === task.projectId) ?? null}
                    onOpen={onOpen}
                  />
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
