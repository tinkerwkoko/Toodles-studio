import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, Folder, Target } from 'lucide-react';

export interface NookStatsProps {
  upcomingCount: number;
  overdueCount: number;
  projectCount: number;
  completedCount: number;
}

/**
 * 5 small tinted stat tiles per section 6:
 * Focused today (0m), Upcoming, Overdue, Projects, Completed.
 * No card borders. 12px gap between tiles.
 */
export function NookStats({
  upcomingCount,
  overdueCount,
  projectCount,
  completedCount,
}: NookStatsProps) {
  const tiles = [
    {
      label: 'Focused today',
      value: '0m',
      icon: Target,
      bg: 'bg-peach-300/35',
      to: null,
    },
    {
      label: 'Upcoming',
      value: upcomingCount,
      icon: Calendar,
      bg: 'bg-stat-1/40',
      to: '/tasks?tab=upcoming',
    },
    {
      label: 'Overdue',
      value: overdueCount,
      icon: Clock,
      bg: 'bg-stat-2/50',
      to: '/tasks?tab=overdue',
    },
    {
      label: 'Projects',
      value: projectCount,
      icon: Folder,
      bg: 'bg-stat-3/45',
      to: '/projects',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: CheckCircle2,
      bg: 'bg-stat-4/40',
      to: '/tasks?tab=completed',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        const content = (
          <div
            className={`flex flex-col justify-between rounded-[12px] ${tile.bg} p-3 transition duration-150 ${
              tile.to ? 'hover:brightness-95' : ''
            }`}
          >
            <div className="flex items-center justify-between text-ink-soft">
              <span className="font-sans text-xs">{tile.label}</span>
              <Icon size={15} aria-hidden="true" />
            </div>
            <div className="mt-2 font-title font-medium text-2xl text-ink leading-tight">
              {tile.value}
            </div>
          </div>
        );

        if (tile.to) {
          return (
            <Link key={tile.label} to={tile.to} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-[12px]">
              {content}
            </Link>
          );
        }

        return <div key={tile.label}>{content}</div>;
      })}
    </div>
  );
}
