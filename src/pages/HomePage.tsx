import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Cat } from '../components/Cat';
import { HeroCard } from '../components/home/HeroCard';
import { NookStats } from '../components/home/NookStats';
import { TodayListCard } from '../components/home/TodayListCard';
import { ComingUpList } from '../components/home/ComingUpList';
import { TodayFeelingCard } from '../components/home/TodayFeelingCard';
import { TodayHabitsCard } from '../components/home/TodayHabitsCard';
import { ProjectCard } from '../components/projects/ProjectCard';
import { formatLongDay, greetingTimeOfDay, todayString } from '../lib/date';
import { filterByScope } from '../lib/task';
import { columnsForProject } from '../store/mutations';
import { useToodles } from '../store/useToodles';

export function HomePage() {
  const { data } = useToodles();
  const today = todayString();
  const timeOfDay = greetingTimeOfDay();
  const isNight = timeOfDay === 'night';

  const greetingHeading =
    timeOfDay === 'morning'
      ? 'Good morning'
      : timeOfDay === 'afternoon'
        ? 'Good afternoon'
        : timeOfDay === 'evening'
          ? 'Good evening'
          : 'Still awake?';

  const counts = useMemo(
    () => ({
      upcoming: filterByScope(data.tasks, 'upcoming').length,
      overdue: filterByScope(data.tasks, 'overdue').length,
      projects: data.projects.filter((p) => !p.archived).length,
      completed: filterByScope(data.tasks, 'completed').length,
    }),
    [data.tasks, data.projects],
  );

  const activeProjects = useMemo(
    () => data.projects.filter((p) => !p.archived).slice(0, 3),
    [data.projects],
  );

  return (
    <div className="space-y-6">
      {/* Top greeting on the far left with cat face sitting beside it */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">
            {greetingHeading}
          </h1>
          <Cat pose={isNight ? 'sleepy' : 'happy'} size={44} animated />
        </div>
        <p className="font-sans text-sm text-ink-soft">
          {formatLongDay(today)}
        </p>
      </div>

      {/* Your cozy corner card with mascot cat */}
      <HeroCard hasTasks={data.tasks.length > 0} />

      {/* 5-tile stat strip */}
      <NookStats
        upcomingCount={counts.upcoming}
        overdueCount={counts.overdue}
        projectCount={counts.projects}
        completedCount={counts.completed}
      />

      {/* Active projects back on dashboard */}
      {activeProjects.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[18px] text-ink">Active projects</h2>
            <Link
              to="/projects"
              className="text-xs font-title font-medium text-ink-soft hover:text-ink hover:underline"
            >
              See all ({counts.projects})
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {activeProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                tasks={data.tasks.filter((t) => t.projectId === project.id)}
                columns={columnsForProject(data, project.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Two columns, stacked on mobile */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
        {/* Left column */}
        <div className="space-y-6 min-w-0">
          <TodayListCard />
          <ComingUpList />
        </div>

        {/* Right column */}
        <div className="space-y-6 min-w-0">
          <TodayFeelingCard />
          <TodayHabitsCard />
        </div>
      </div>
    </div>
  );
}
