import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { ProjectCard } from '../components/projects/ProjectCard';
import { useToodles } from '../store/useToodles';
import { useUi } from '../store/useUi';

export function ProjectsPage() {
  const { data } = useToodles();
  const { openCreate } = useUi();

  const projects = useMemo(
    () => [...data.projects].sort((a, b) => a.name.localeCompare(b.name)),
    [data.projects],
  );

  return (
    <div className="pb-4">
      <PageHeader
        title="Projects"
        subtitle="Bigger things, split into pieces you can actually finish."
        pose={projects.length === 0 ? 'curious' : undefined}
        actions={
          <Button
            className="hidden sm:inline-flex"
            onClick={() => openCreate('project')}
            icon={<Plus size={16} aria-hidden="true" />}
          >
            New project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="Give your next little adventure a home"
          sentence="A project gathers its tasks, notes and a flexible board so nothing gets lost between steps."
          actionLabel="Create a project"
          onAction={() => openCreate('project')}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard
                project={project}
                tasks={data.tasks.filter((task) => task.projectId === project.id)}
                columns={data.boardColumns.filter((column) => column.projectId === project.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
