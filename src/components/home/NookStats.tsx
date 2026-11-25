import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, Folder, Target } from 'lucide-react';

export interface NookStatsProps {
  upcomingCount: number;
  overdueCount: number;
  projectCount: number;
  completedCount: number;
}

/**
 * Editorial ledger index strip replacing generic dashboard stat boxes:
 * Focused today, Upcoming, Overdue, Projects, Completed.
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
      accentClass: 'text-peach-500',
      to: null,
    },
    {
      label: 'Upcoming',
      value: upcomingCount,
      icon: Calendar,
      accentClass: 'text-sky-500',
      to: '/tasks?tab=upcoming',
    },
    {
      label: 'Overdue',
      value: overdueCount,
      icon: Clock,
      accentClass: overdueCount > 0 ? 'text-rose-500' : 'text-ink-soft',
      to: '/tasks?tab=overdue',
    },
    {
      label: 'Projects',
      value: projectCount,
      icon: Folder,
      accentClass: 'text-mint-500',
      to: '/projects',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: CheckCircle2,
      accentClass: 'text-butter-500',
      to: '/tasks?tab=completed',
    },
  ];

  return (
    <div className="border-y border-lilac-200/80 bg-paper-2/35">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-divider">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const content = (
            <div
              className={`flex flex-col justify-between px-4 py-3.5 transition duration-150 ${
                tile.to ? 'hover:bg-cream/70' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-ink-soft">
                <span className="font-sans text-[11px] uppercase tracking-[0.06em]">
                  {tile.label}
                </span>
                <Icon size={14} className={tile.accentClass} aria-hidden="true" />
              </div>
              <div className="mt-1.5 font-display text-3xl font-semibold text-ink leading-none tabular-nums">
                {tile.value}
              </div>
            </div>
          );

          if (tile.to) {
            return (
              <Link
                key={tile.label}
                to={tile.to}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
              >
                {content}
              </Link>
            );
          }

          return <div key={tile.label}>{content}</div>;
        })}
      </div>
    </div>
  );
}
