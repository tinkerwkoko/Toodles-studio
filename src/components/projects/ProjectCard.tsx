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

/** Soft borderless botanical project card with subtle top accent rule and typewritten stats. */
export function ProjectCard({ project, tasks, columns }: ProjectCardProps) {
  const tone = accent(project.color);
  const open = tasks.filter((task) => task.status === 'todo').length;
  const done = tasks.length - open;
  const percent = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group relative flex flex-col gap-3.5 overflow-hidden paper-sheet rounded-[10px] p-5 transition duration-200 hover:-translate-y-[2px] hover:shadow-lift"
    >
      <span
        aria-hidden="true"
        className={cx('absolute inset-x-0 top-0 h-[2px] opacity-80', tone.mid)}
      />

      <div className="flex items-start gap-3 pt-0.5">
        <span
          aria-hidden="true"
          className={cx(
            'grid h-10 w-10 shrink-0 place-items-center rounded-[8px] overflow-hidden',
            tone.soft,
            tone.text,
          )}
        >
          <ProjectIconDisplay icon={project.icon} emoji={project.emoji} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-xl text-ink group-hover:text-accent transition-colors leading-tight">
            {project.name}
          </h2>
          {project.description && (
            <p className="mt-1 line-clamp-2 font-typewriter text-xs text-ink-soft leading-relaxed">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <ProgressBar
        value={percent}
        label={`${project.name} progress`}
        tone={percent === 100 && tasks.length > 0 ? 'bg-mint-500' : tone.mid}
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-typewriter text-[11px] text-ink-soft tabular-nums">
        <span className="inline-flex items-center gap-1">
          <ListChecks size={13} aria-hidden="true" />
          {open} open
        </span>
        <span className={tone.text}>{done} done</span>
        {columns.length > 0 && (
          <span className="inline-flex items-center gap-1 text-text-faint">
            <Columns3 size={13} aria-hidden="true" />
            {columns.length} cols
          </span>
        )}
        <span className="ml-auto text-ink">{percent}%</span>
      </div>
    </Link>
  );
}
