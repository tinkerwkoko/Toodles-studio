import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LayoutGrid, Pencil, Plus, Trash2 } from 'lucide-react';
import type { BoardColumn, Task } from '../types';
import { BoardView } from '../components/board/BoardView';
import { Dialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { TaskDetail } from '../components/tasks/TaskDetail';
import { TaskList } from '../components/tasks/TaskList';
import { ProjectDialogs } from '../components/projects/ProjectDialogs';
import { ProjectHeader } from '../components/projects/ProjectHeader';
import { sortTasks } from '../lib/task';
import { columnsForProject } from '../store/mutations';
import { useToodles } from '../store/useToodles';
import { useUi } from '../store/useUi';

type ProjectView = 'list' | 'board';

/** `/projects/:id`: project header, task list and kanban board. */
export function ProjectDetailPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { data, actions } = useToodles();
  const { openCreate, detailTask, setDetailTaskId } = useUi();

  const [view, setView] = useState<ProjectView>('list');
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const project = data.projects.find((item) => item.id === projectId) ?? null;
  const columns = useMemo(
    () => columnsForProject(data, project?.id ?? null),
    [data, project?.id],
  );
  const tasks = useMemo(
    () => data.tasks.filter((task) => task.projectId === project?.id),
    [data.tasks, project?.id],
  );

  const openCount = tasks.filter((task) => task.status === 'todo').length;
  const doneCount = tasks.length - openCount;

  // Older projects may have no board yet: seed the default columns once.
  useEffect(() => {
    if (project && columns.length === 0) actions.ensureBoardColumns(project.id);
  }, [project, columns.length, actions]);

  if (!project) {
    return (
      <EmptyState
        pose="curious"
        title="That project is not here"
        sentence="It may have been deleted, or the link came from another device. Nothing is shared between browsers."
        actionLabel="See all projects"
        onAction={() => navigate('/projects')}
      />
    );
  }

  const addTask = (column?: BoardColumn): void => {
    openCreate('task', {
      defaults: {
        projectId: project.id,
        color: column?.color ?? project.color,
        boardColumnId: column?.id ?? null,
      },
    });
  };

  const listView = (
    <div className="space-y-6">
      <TaskList
        tasks={sortTasks(tasks.filter((task) => task.status === 'todo'), 'smart')}
        onOpen={(task: Task) => setDetailTaskId(task.id)}
        groupByDate
        showProject={false}
        emptyState={
          <EmptyState
            pose="curious"
            title="No open tasks here"
            sentence="Add the first step of this project, or switch to the board and plan it out."
            actionLabel="Add a task"
            onAction={() => addTask()}
          />
        }
      />

      {doneCount > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-lg text-mint-700">Finished here ({doneCount})</h2>
          <TaskList
            tasks={tasks.filter((task) => task.status === 'done')}
            onOpen={(task: Task) => setDetailTaskId(task.id)}
            showProject={false}
          />
        </section>
      )}
    </div>
  );

  return (
    <div className="pb-4">
      <ProjectHeader project={project} doneCount={doneCount} totalCount={tasks.length}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => addTask()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-lilac-300 px-5 font-display text-ink transition hover:bg-lilac-200"
            >
              <Plus size={18} aria-hidden="true" />
              New task
            </button>

            <SegmentedControl
              label="Project view"
              value={view}
              onChange={setView}
              options={[
                { value: 'list', label: 'List' },
                { value: 'board', label: 'Board' },
              ]}
              className="sm:ml-auto"
            />

            <IconButton label={`Edit ${project.name}`} onClick={() => setEditing(true)}>
              <Pencil size={18} aria-hidden="true" />
            </IconButton>
            <IconButton
              label={`Delete ${project.name}`}
              tone="danger"
              onClick={() => setDeleting(true)}
            >
              <Trash2 size={18} aria-hidden="true" />
            </IconButton>
          </div>

          {view === 'board' && (
            <p className="flex items-center gap-1.5 text-xs text-ink-soft">
              <LayoutGrid size={14} aria-hidden="true" />
              Cards are tasks. Use the ⋮ menu on a card to move it or change its colour.
            </p>
          )}
        </div>
      </ProjectHeader>

      {view === 'list' ? (
        listView
      ) : (
        <BoardView
          project={project}
          tasks={tasks}
          columns={columns}
          onOpenTask={(task: Task) => setDetailTaskId(task.id)}
          onAddTask={addTask}
        />
      )}

      <Dialog
        open={!!detailTask}
        onClose={() => setDetailTaskId(null)}
        title="Task details"
        size="lg"
      >
        {detailTask && <TaskDetail task={detailTask} onDeleted={() => setDetailTaskId(null)} />}
      </Dialog>

      <ProjectDialogs
        project={project}
        taskCount={tasks.length}
        openEdit={editing}
        openDelete={deleting}
        onCloseEdit={() => setEditing(false)}
        onCloseDelete={() => setDeleting(false)}
      />
    </div>
  );
}
