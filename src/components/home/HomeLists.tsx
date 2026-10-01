import { Link } from 'react-router-dom';
import type { Project, Task } from '../../types';
import { accent } from '../../lib/color';
import { formatDay } from '../../lib/date';
import { Card } from '../ui/Card';
import { cx } from '../../lib/cx';

export interface HomeListsProps {
  overdue: Task[];
  upcoming: Task[];
  projects: Project[];
  onOpenTask: (task: Task) => void;
  onCreate: () => void;
}

/** Overdue, upcoming and active-project snapshots for the dashboard. */
export function HomeLists({ overdue, upcoming, projects, onOpenTask, onCreate }: HomeListsProps) {
  return (
    <div className="space-y-4">
      <Card padding="lg" className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg">Needs a nudge</h2>
          <Link to="/overdue" className="text-xs font-bold text-lilac-700 hover:underline">
            See all
          </Link>
        </div>
        {overdue.length === 0 ? (
          <p className="text-sm text-ink-soft">Nothing has slipped through. Lovely.</p>
        ) : (
          <ul className="space-y-1.5">
            {overdue.slice(0, 3).map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onOpenTask(task)}
                  className="flex w-full items-center gap-2 rounded-2xl bg-rose-100 px-3 py-2 text-left text-sm transition hover:bg-rose-200"
                >
                  <span className="text-rose-700" aria-hidden="true">
                    ⏰
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink">
                    {task.title}
                  </span>
                  {task.dueDate && (
                    <span className="shrink-0 text-xs font-bold text-rose-700">
                      {formatDay(task.dueDate, { withWeekday: false })}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card padding="lg" className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg">Coming up</h2>
          <Link to="/upcoming" className="text-xs font-bold text-lilac-700 hover:underline">
            See all
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-soft">Nothing planned yet. A good time to look ahead.</p>
        ) : (
          <ul className="space-y-1.5">
            {upcoming.slice(0, 3).map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onOpenTask(task)}
                  className="flex w-full items-center gap-2 rounded-2xl bg-lilac-100 px-3 py-2 text-left text-sm transition hover:bg-lilac-200"
                >
                  <span className="min-w-0 flex-1 truncate text-ink">{task.title}</span>
                  {task.dueDate && (
                    <span className="shrink-0 text-xs font-bold text-lilac-700">
                      {formatDay(task.dueDate, { withWeekday: false })}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card padding="lg" className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg">Active projects</h2>
          <Link to="/projects" className="text-xs font-bold text-lilac-700 hover:underline">
            See all
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-ink-soft">No projects yet.</p>
            <Link
              to="/projects"
              className="inline-flex min-h-11 items-center rounded-full bg-lilac-100 px-4 text-sm font-bold text-lilac-700"
            >
              Start a project
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {projects.slice(0, 3).map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={onCreate}
          className="mt-1 min-h-11 w-full rounded-full border border-lilac-200 bg-cream text-sm font-bold text-lilac-700 hover:bg-lilac-50"
        >
          Add a task
        </button>
      </Card>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const tone = accent(project.color);
  return (
    <li>
      <Link
        to={`/projects/${project.id}`}
        className={cx('flex items-center gap-2 rounded-2xl px-3 py-2 transition', tone.soft, 'hover:opacity-90')}
      >
        <span aria-hidden="true">{project.emoji}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{project.name}</span>
      </Link>
    </li>
  );
}

