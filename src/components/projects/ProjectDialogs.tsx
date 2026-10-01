import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { ProjectForm, type ProjectFormValues } from './ProjectForm';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';

export interface ProjectDialogsProps {
  project: Project;
  taskCount: number;
  openEdit: boolean;
  openDelete: boolean;
  onCloseEdit: () => void;
  onCloseDelete: () => void;
}

/** Edit and delete flows for a project, reusing the existing ProjectForm. */
export function ProjectDialogs({
  project,
  taskCount,
  openEdit,
  openDelete,
  onCloseEdit,
  onCloseDelete,
}: ProjectDialogsProps) {
  const { actions } = useToodles();
  const { pushToast } = useUi();
  const navigate = useNavigate();

  function saveProject(values: ProjectFormValues): void {
    actions.updateProject(project.id, values);
    onCloseEdit();
    pushToast('Project updated', 'success');
  }

  return (
    <>
      <Dialog
        open={openEdit}
        onClose={onCloseEdit}
        title={`Edit “${project.name}”`}
        description="Rename it, change the icon or give it a new colour."
      >
        <ProjectForm
          key={`edit-${project.id}`}
          initial={{
            name: project.name,
            description: project.description,
            color: project.color,
            emoji: project.emoji,
            icon: project.icon,
            cover: project.cover,
          }}
          submitLabel="Save changes"
          onSubmit={saveProject}
        />
      </Dialog>

      <Dialog
        open={openDelete}
        onClose={onCloseDelete}
        title={`Delete “${project.name}”?`}
        description="This cannot be undone, so pick what should happen to the tasks inside."
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onCloseDelete}>
              Keep the project
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                actions.deleteProject(project.id, { mode: 'move', moveTo: null });
                onCloseDelete();
                pushToast('Project deleted: its tasks were kept');
                navigate('/projects');
              }}
            >
              Delete project, keep {taskCount === 1 ? 'the task' : 'tasks'}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                actions.deleteProject(project.id, { mode: 'delete' });
                onCloseDelete();
                pushToast('Project and tasks deleted');
                navigate('/projects');
              }}
            >
              Delete everything
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-[0.95rem] text-ink-soft">
          <p>
            This project holds{' '}
            <strong className="text-ink">
              {taskCount === 0 ? 'no tasks' : `${taskCount} task${taskCount === 1 ? '' : 's'}`}
            </strong>
            . You can delete just the project and keep the tasks (they move to “no project”), or
            remove the project and its tasks together.
          </p>
          <p className="rounded-2xl border border-lilac-200 bg-lilac-50 p-3 text-sm">
            Both choices also remove this project's board columns.
          </p>
        </div>
      </Dialog>
    </>
  );
}
