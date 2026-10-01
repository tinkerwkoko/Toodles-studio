import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Task, TaskScope } from '../types';
import { allTags, filterByScope, searchTasks, sortTasks } from '../lib/task';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { TaskList } from '../components/tasks/TaskList';
import { TaskDetail } from '../components/tasks/TaskDetail';
import { DEFAULT_FILTERS, TaskFilters, type TaskFilterState } from '../components/tasks/TaskFilters';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { useToodles } from '../store/useToodles';
import { useUi } from '../store/useUi';

const TITLES: Record<TaskScope, { title: string; subtitle: string }> = {
  all: { title: 'All tasks', subtitle: 'Everything you have written down, in one gentle pile.' },
  today: { title: 'Today', subtitle: 'Just the things that belong to today.' },
  upcoming: { title: 'Upcoming', subtitle: 'What is coming, grouped by day.' },
  overdue: { title: 'Overdue', subtitle: 'Not a disaster: just things that need a nudge.' },
  completed: { title: 'Completed', subtitle: 'Everything you have already finished.' },
};

export function TasksPage({ scope: initialScope = 'all' }: { scope?: TaskScope }) {
  const { data } = useToodles();
  const { searchTerm, setSearchTerm, detailTask, setDetailTaskId, openCreate } = useUi();
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_FILTERS);
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useIsDesktop();

  const tabParam = searchParams.get('tab') as TaskScope | null;
  const scope: TaskScope = tabParam && TITLES[tabParam] ? tabParam : initialScope;

  function handleTabChange(next: string) {
    setSearchParams({ tab: next });
  }

  const counts = useMemo(
    () => ({
      all: filterByScope(data.tasks, 'all').length,
      today: filterByScope(data.tasks, 'today').length,
      upcoming: filterByScope(data.tasks, 'upcoming').length,
      overdue: filterByScope(data.tasks, 'overdue').length,
      completed: filterByScope(data.tasks, 'completed').length,
    }),
    [data.tasks],
  );

  const tasks = useMemo(() => {
    let list = filterByScope(data.tasks, scope);
    list = searchTasks(list, searchTerm);
    if (filters.projectId !== 'all') {
      list = list.filter((task) =>
        filters.projectId === 'none' ? !task.projectId : task.projectId === filters.projectId,
      );
    }
    if (filters.priority !== 'all') {
      list = list.filter((task) => task.priority === filters.priority);
    }
    if (filters.tag !== 'all') {
      list = list.filter((task) => task.tags.includes(filters.tag));
    }
    return sortTasks(list, filters.sort);
  }, [data.tasks, scope, searchTerm, filters]);

  const tags = useMemo(() => allTags(data.tasks), [data.tasks]);
  const header = TITLES[scope];
  const grouped = scope === 'upcoming' || scope === 'overdue';

  function openTask(task: Task): void {
    setDetailTaskId(task.id);
  }

  return (
    <div className="pb-4">
      <PageHeader
        title={header.title}
        subtitle={header.subtitle}
        actions={
          <Button
            className="hidden sm:inline-flex"
            onClick={() => openCreate('task')}
            icon={<Plus size={18} aria-hidden="true" />}
          >
            New task
          </Button>
        }
      />

      <Tabs
        ariaLabel="Task views"
        className="mb-4"
        activeId={scope}
        onChange={handleTabChange}
        items={[
          { id: 'all', label: 'All', count: counts.all },
          { id: 'today', label: 'Today', count: counts.today },
          { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
          { id: 'overdue', label: 'Overdue', count: counts.overdue },
          { id: 'completed', label: 'Completed', count: counts.completed },
        ]}
      />

      <TaskFilters
        filters={filters}
        onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
        projects={data.projects}
        tags={tags}
        query={searchTerm}
        onQueryChange={setSearchTerm}
        showSearch={!isDesktop}
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-6">
        <div>
          <TaskList
            tasks={tasks}
            onOpen={openTask}
            groupByDate={grouped}
            tone={scope === 'overdue' ? 'overdue' : 'default'}
            selectedId={isDesktop ? detailTask?.id ?? null : null}
            emptyState={<ScopeEmptyState scope={scope} onCreate={() => openCreate('task')} />}
          />
        </div>

        {isDesktop && (
          <aside className="sticky top-24 hidden lg:block">
            <Card padding="lg">
              {detailTask ? (
                <TaskDetail task={detailTask} onDeleted={() => setDetailTaskId(null)} />
              ) : (
                <div className="text-center">
                  <p className="mb-2 font-display text-lg text-lilac-700">Pick a task</p>
                  <p className="text-sm text-ink-soft">
                    Choose something on the left to read its notes, tick off little steps and change
                    the details.
                  </p>
                </div>
              )}
            </Card>
          </aside>
        )}
      </div>

      {!isDesktop && (
        <Dialog
          open={!!detailTask}
          onClose={() => setDetailTaskId(null)}
          title="Task details"
          size="lg"
        >
          {detailTask && <TaskDetail task={detailTask} onDeleted={() => setDetailTaskId(null)} />}
        </Dialog>
      )}
    </div>
  );
}

function ScopeEmptyState({ scope, onCreate }: { scope: TaskScope; onCreate: () => void }) {
  switch (scope) {
    case 'today':
      return (
        <EmptyState
          pose="happy"
          title="Today is all clear"
          sentence="Nothing is waiting for you today. Enjoy the quiet, or add something small."
          actionLabel="Add something for today"
          onAction={onCreate}
        />
      );
    case 'upcoming':
      return (
        <EmptyState
          pose="curious"
          title="Nothing on the horizon"
          sentence="When you plan something for later, it will show up here, grouped by day."
          actionLabel="Plan something"
          onAction={onCreate}
        />
      );
    case 'overdue':
      return (
        <EmptyState
          pose="happy"
          title="Nothing slipped through"
          sentence="No overdue tasks. Your past self and your present self are on good terms."
          actionLabel="Add a task"
          onAction={onCreate}
        />
      );
    case 'completed':
      return (
        <EmptyState
          pose="sleepy"
          title="Nothing finished yet"
          sentence="Your future self has not got much to look back on yet. Tick something off and it will appear here."
          actionLabel="Add a task"
          onAction={onCreate}
        />
      );
    case 'all':
    default:
      return (
        <EmptyState
          title="Nothing waiting for you here"
          sentence="This is where your tasks will live. Start with one small thing."
          actionLabel="Create your first task"
          onAction={onCreate}
        />
      );
  }
}
