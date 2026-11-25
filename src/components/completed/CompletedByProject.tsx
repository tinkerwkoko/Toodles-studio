import type { Project, Task } from '../../types';
import { accent } from '../../lib/color';
import { groupByProject } from '../../lib/archive';
import { CompletedRow } from './CompletedRow';
import { cx } from '../../lib/cx';

export interface CompletedByProjectProps {
  tasks: Task[];
  projects: Project[];
  onOpen: (task: Task) => void;
}

/** Archive grouped by project, with a friendly group for projectless tasks. */
export function CompletedByProject({ tasks, projects, onOpen }: CompletedByProjectProps) {
  const groups = groupByProject(tasks, projects);

  return (
    <div className="space-y-7">
      {groups.map((group) => {
        const tone = accent(group.project?.color ?? 'lilac');
        const name = group.project ? `${group.project.emoji} ${group.project.name}` : 'No project';
        return (
          <section key={group.project?.id ?? 'no-project'} className="space-y-2.5">
            <div className="flex items-baseline gap-2.5 border-b border-divider pb-2">
              <span
                aria-hidden="true"
                className={cx(
                  'h-2.5 w-2.5 self-center rounded-[2px]',
                  group.project ? tone.mid : 'bg-lilac-200',
                )}
              />
              <h2 className="font-display text-2xl font-semibold text-ink">{name}</h2>
              <span className="text-xs tabular-nums text-ink-soft">{group.tasks.length}</span>
            </div>
            <ul className="paper-sheet divide-y divide-divider/65 overflow-hidden rounded-[5px]">
              {group.tasks.map((task) => (
                <CompletedRow
                  key={task.id}
                  task={task}
                  project={group.project}
                  onOpen={onOpen}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
