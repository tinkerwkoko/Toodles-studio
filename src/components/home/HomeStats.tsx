import {
  AlarmClock,
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  Flame,
  FolderHeart,
  ListChecks,
  Smile,
  Sparkles,
} from 'lucide-react';
import { QuickTile } from './QuickTile';
import { StatTile } from './StatTile';

export interface HomeStatsProps {
  dueToday: number;
  completedToday: number;
  streak: number;
  openCount: number;
  projectCount: number;
}

/** "Today at a glance": four soft figures. */
export function HomeStats({
  dueToday,
  completedToday,
  streak,
  openCount,
  projectCount,
}: HomeStatsProps) {
  return (
    <section aria-label="Today at a glance" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        label="Tasks due today"
        value={String(dueToday)}
        icon={<CalendarDays size={18} aria-hidden="true" />}
        className="bg-stat-1 border-stat-1"
      />
      <StatTile
        label="Finished today"
        value={String(completedToday)}
        hint="Little wins count"
        icon={<CheckCircle2 size={18} aria-hidden="true" />}
        className="bg-stat-2 border-stat-2"
      />
      <StatTile
        label="Current streak"
        value={streak === 0 ? '0' : `${streak} day${streak === 1 ? '' : 's'}`}
        hint={streak > 0 ? 'Keep it cosy' : 'Tick one off to start'}
        icon={<Flame size={18} aria-hidden="true" />}
        className="bg-stat-3 border-stat-3"
      />
      <StatTile
        label="Open tasks"
        value={String(openCount)}
        hint={`${projectCount} project${projectCount === 1 ? '' : 's'}`}
        icon={<ListChecks size={18} aria-hidden="true" />}
        className="bg-cream border-lilac-200"
      />
    </section>
  );
}

export interface HomeTilesProps {
  upcoming: number;
  overdue: number;
  projectCount: number;
  diaryCount: number;
  recentDiaryDate: string | null;
  habitCount: number;
  completed: number;
}

/** Six tiles that lead into the rest of the app. */
export function HomeTiles({
  upcoming,
  overdue,
  projectCount,
  diaryCount,
  recentDiaryDate,
  habitCount,
  completed,
}: HomeTilesProps) {
  return (
    <section aria-label="Jump back in" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
      <QuickTile
        to="/upcoming"
        label="Upcoming"
        value={String(upcoming)}
        hint="Later this week and beyond"
        icon={<AlarmClock size={20} aria-hidden="true" />}
        tone="sky"
      />
      <QuickTile
        to="/overdue"
        label="Overdue"
        value={String(overdue)}
        hint={overdue === 0 ? 'All caught up' : 'Needs a gentle nudge'}
        icon={<AlarmClock size={20} aria-hidden="true" />}
        tone="rose"
      />
      <QuickTile
        to="/projects"
        label="Projects"
        value={String(projectCount)}
        hint="Lists and boards"
        icon={<FolderHeart size={20} aria-hidden="true" />}
        tone="mint"
      />
      <QuickTile
        to="/diary"
        label="Diary"
        value={String(diaryCount)}
        hint={recentDiaryDate ?? 'Your own pages'}
        icon={<BookOpenText size={20} aria-hidden="true" />}
        tone="butter"
      />
      <QuickTile
        to="/wellbeing"
        label="Mood & habits"
        value={String(habitCount)}
        hint="Gentle trackers"
        icon={<Smile size={20} aria-hidden="true" />}
        tone="peach"
      />
      <QuickTile
        to="/completed"
        label="Completed"
        value={String(completed)}
        hint="Your little archive"
        icon={<Sparkles size={20} aria-hidden="true" />}
        tone="lilac"
      />
    </section>
  );
}
