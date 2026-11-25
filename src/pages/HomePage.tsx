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
    <div className="space-y-8">
      {/* Diary entry header: handwritten date + editorial serif greeting */}
      <header className="pb-4 border-b border-divider flex flex-col gap-1">
        <p className="font-hand text-xl text-accent leading-none">
          {formatLongDay(today)}
        </p>
        <div className="flex items-center gap-3 pt-0.5">
          <h1 className="font-display text-4xl sm:text-[2.75rem] font-semibold text-ink leading-none tracking-tight">
            {greetingHeading}
          </h1>
          <Cat pose={isNight ? 'sleepy' : 'happy'} size={42} animated />
        </div>
      </header>

      {/* Open letter-paper welcome anchor */}
      <HeroCard hasTasks={data.tasks.length > 0} />

      {/* Archival ledger index strip */}
      <NookStats
        upcomingCount={counts.upcoming}
        overdueCount={counts.overdue}
        projectCount={counts.projects}
        completedCount={counts.completed}
      />

      {/* Active projects folio shelf */}
      {activeProjects.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-baseline justify-between border-b border-divider pb-2">
            <h2 className="font-display text-2xl font-semibold text-ink">Active projects</h2>
            <Link
              to="/projects"
              className="text-xs font-sans text-ink-soft hover:text-accent underline underline-offset-4 transition tabular-nums"
            >
              See all ({counts.projects})
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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

      {/* Asymmetric two-column diary spread: main ledger + margin notes */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div className="space-y-8 min-w-0">
          <TodayListCard />
          <ComingUpList />
        </div>

        <aside className="space-y-6 min-w-0">
          <TodayFeelingCard />
          <TodayHabitsCard />
        </aside>
      </div>
    </div>
  );
}
