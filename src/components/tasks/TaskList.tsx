import type { ReactNode } from 'react';
import type { DateString, Task } from '../../types';
import { groupByDueDate } from '../../lib/task';
import { TaskCard } from './TaskCard';
import { DateSection } from './DateSection';

export interface TaskListProps {
  tasks: Task[];
  onOpen: (task: Task) => void;
  /** Groups under Today / Tomorrow / weekday headings. */
  groupByDate?: boolean;
  showProject?: boolean;
  selectedId?: string | null;
  emptyState?: ReactNode;
  /** Rendered at the right of each day heading. */
  sectionAction?: (date: DateString | 'none') => ReactNode;
  tone?: 'default' | 'overdue';
}

export function TaskList({
  tasks,
  onOpen,
  groupByDate = false,
  showProject = true,
  selectedId,
  emptyState,
  sectionAction,
  tone = 'default',
}: TaskListProps) {
  if (tasks.length === 0) return <>{emptyState ?? null}</>;

  if (!groupByDate) {
    return (
      <div className="paper-sheet rounded-[5px] border border-divider/80 overflow-visible">
        <ul className="divide-y divide-divider">
          {tasks.map((task) => (
            <li key={task.id} className="relative">
              <TaskCard
                task={task}
                onOpen={onOpen}
                showProject={showProject}
                selected={selectedId === task.id}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const groups = groupByDueDate(tasks);

  return (
    <div className="space-y-7">
      {groups.map((group) => (
        <DateSection
          key={group.date}
          date={group.date}
          count={group.items.length}
          tone={tone}
          action={sectionAction?.(group.date)}
        >
          <div className="paper-sheet rounded-[5px] border border-divider/80 overflow-visible">
            <ul className="divide-y divide-divider">
              {group.items.map((task) => (
                <li key={task.id} className="relative">
                  <TaskCard
                    task={task}
                    onOpen={onOpen}
                    showProject={showProject}
                    selected={selectedId === task.id}
                  />
                </li>
              ))}
            </ul>
          </div>
        </DateSection>
      ))}
    </div>
  );
}
