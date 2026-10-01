import { Link } from 'react-router-dom';
import { Columns3, ListChecks } from 'lucide-react';
import type { BoardColumn, Project, Task } from '../../types';
import { accent } from '../../lib/color';
import { ProgressBar } from '../ui/ProgressBar';
import { ProjectIconDisplay } from './ProjectIconDisplay';
import { cx } from '../../lib/cx';

export interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  columns: BoardColumn[];
}

/** Project summary with its own pastel identity and a soft progress bar. */
export function ProjectCard({ project, tasks, columns }: ProjectCardProps) {
  const tone = accent(project.color);
  const open = tasks.filter((task) => task.status === 'todo').length;
  const done = tasks.length - open;
  const percent = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);

  return (
    <Link
      to={`/projects/${project.id}`}
      className={cx(
        'flex flex-col gap-3 rounded-2xl border-[1.5px] bg-peach-100 p-4 shadow-soft transition',
        'hover:-translate-y-0.5 hover:shadow-lift',
        tone.border,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cx(
            'grid h-12 w-12 shrink-0 place-items-center rounded-2xl overflow-hidden',
            tone.soft,
          )}
        >
          <ProjectIconDisplay icon={project.icon} emoji={project.emoji} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-title text-lg font-medium text-ink">{project.name}</h2>
          {project.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">{project.description}</p>
          )}
        </div>
      </div>

      <ProgressBar
        value={percent}
        label={`${project.name} progress`}
        tone={percent === 100 && tasks.length > 0 ? 'bg-mint-300' : 'bg-lilac-300'}
      />

      <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-ink-soft">
        <span className="inline-flex items-center gap-1">
          <ListChecks size={14} aria-hidden="true" />
          {open} open
        </span>
        <span className={tone.text}>{done} done</span>
        {columns.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <Columns3 size={14} aria-hidden="true" />
            {columns.length} columns
          </span>
        )}
        <span className="ml-auto">{percent}%</span>
      </div>
    </Link>
  );
}
