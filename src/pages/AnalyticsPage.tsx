import { useMemo } from 'react';
import { BarChart3, CheckCircle2, Flame, Folder, Smile, Target } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { CatFace } from '../components/CatFace';
import { MOODS } from '../lib/mood';
import { addDays, todayString } from '../lib/date';
import { useToodles } from '../store/useToodles';
import type { MoodLevel } from '../types';

export function AnalyticsPage() {
  const { data } = useToodles();
  const today = todayString();

  // Completed tasks count
  const completedTasks = useMemo(
    () => data.tasks.filter((t) => t.status === 'done'),
    [data.tasks],
  );

  // Total focus & study minutes
  const totalFocusMinutes = useMemo(() => {
    return (data.focusSessions ?? []).reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
  }, [data.focusSessions]);

  const studyHours = Math.floor(totalFocusMinutes / 60);
  const studyRemainingMins = totalFocusMinutes % 60;
  const studyHoursText =
    studyHours > 0
      ? `${studyHours}h ${studyRemainingMins > 0 ? `${studyRemainingMins}m` : ''}`
      : `${totalFocusMinutes}m`;

  // Last 7 days task completion distribution
  const last7DaysData = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = addDays(today, -i);
      const dayIndex = new Date(d + 'T12:00:00').getDay();
      const count = completedTasks.filter((t) => t.completedAt && t.completedAt.slice(0, 10) === d)
        .length;
      days.push({
        date: d,
        label: weekdays[dayIndex] ?? d.slice(5),
        count,
      });
    }
    return days;
  }, [completedTasks, today]);

  const maxDailyCount = Math.max(1, ...last7DaysData.map((d) => d.count));

  // Projects task completion
  const projectStats = useMemo(() => {
    return data.projects
      .filter((p) => !p.archived)
      .map((proj) => {
        const projTasks = data.tasks.filter((t) => t.projectId === proj.id);
        const done = projTasks.filter((t) => t.status === 'done').length;
        const total = projTasks.length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;
        return {
          id: proj.id,
          name: proj.name,
          emoji: proj.emoji,
          done,
          total,
          percent,
        };
      })
      .slice(0, 5);
  }, [data.projects, data.tasks]);

  // Mood breakdown over past 30 days
  const moodCounts = useMemo(() => {
    const counts: Record<MoodLevel, number> = {
      happy: 0,
      good: 0,
      okay: 0,
      low: 0,
      difficult: 0,
    };
    data.moods.forEach((m) => {
      if (counts[m.mood] !== undefined) {
        counts[m.mood]++;
      }
    });
    return counts;
  }, [data.moods]);

  const totalMoodLogs = Object.values(moodCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2.5">
          <BarChart3 size={26} className="text-accent" aria-hidden="true" />
          <h1 className="font-display text-3xl text-ink">Analytics and Calm Insights</h1>
        </div>
        <p className="font-sans text-sm text-ink-soft">
          A gentle look at your completed tasks, focused rhythms, and wellbeing.
        </p>
      </div>

      {/* Top 5 Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card padding="md" className="flex flex-col justify-between border-lilac-200">
          <div className="flex items-center justify-between text-ink-soft">
            <span className="font-sans text-xs">Total completed</span>
            <CheckCircle2 size={16} className="text-accent" />
          </div>
          <div className="mt-2 font-title font-medium text-2xl text-ink">
            {completedTasks.length}
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between border-lilac-200">
          <div className="flex items-center justify-between text-ink-soft">
            <span className="font-sans text-xs">Hours studied</span>
            <Target size={16} className="text-peach-700" />
          </div>
          <div className="mt-2 font-title font-medium text-2xl text-ink">
            {studyHoursText}
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between border-lilac-200">
          <div className="flex items-center justify-between text-ink-soft">
            <span className="font-sans text-xs">Sessions</span>
            <Target size={16} className="text-accent" />
          </div>
          <div className="mt-2 font-title font-medium text-2xl text-ink">
            {data.focusSessions?.length || 0}
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between border-lilac-200">
          <div className="flex items-center justify-between text-ink-soft">
            <span className="font-sans text-xs">Habit checks</span>
            <Flame size={16} className="text-peach-500" />
          </div>
          <div className="mt-2 font-title font-medium text-2xl text-ink">
            {data.habitChecks.length}
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between border-lilac-200">
          <div className="flex items-center justify-between text-ink-soft">
            <span className="font-sans text-xs">Moods logged</span>
            <Smile size={16} className="text-mint-700" />
          </div>
          <div className="mt-2 font-title font-medium text-2xl text-ink">
            {totalMoodLogs}
          </div>
        </Card>
      </div>

      {/* Two Columns: Daily Task Chart & Mood Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Last 7 Days Task Activity Chart */}
        <Card padding="md" className="space-y-4 border-lilac-200">
          <h2 className="font-display text-lg text-ink">Tasks finished (last 7 days)</h2>

          <div className="flex h-44 items-end justify-between gap-2 pt-4 border-b border-divider pb-2 px-2">
            {last7DaysData.map((d) => {
              const heightPercent = Math.max(8, (d.count / maxDailyCount) * 100);
              const isToday = d.date === today;
              return (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[11px] font-sans text-ink-soft">{d.count > 0 ? d.count : ''}</span>
                  <div
                    className={`w-full max-w-[28px] rounded-t-xl transition-all duration-300 ${
                      isToday ? 'bg-accent' : 'bg-lilac-200 hover:bg-lilac-300'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${d.count} tasks on ${d.date}`}
                  />
                  <span
                    className={`text-[11px] font-title ${
                      isToday ? 'font-medium text-ink' : 'text-ink-soft'
                    }`}
                  >
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Mood Distribution */}
        <Card padding="md" className="space-y-4 border-lilac-200">
          <h2 className="font-display text-lg text-ink">Mood balance</h2>

          {totalMoodLogs === 0 ? (
            <div className="py-8 text-center text-xs font-sans text-ink-soft">
              No moods logged yet. Check in on the overview page!
            </div>
          ) : (
            <div className="space-y-3">
              {MOODS.map((mood) => {
                const count = moodCounts[mood.level] || 0;
                const percent = Math.round((count / totalMoodLogs) * 100);
                return (
                  <div key={mood.level} className="flex items-center gap-3">
                    <CatFace mood={mood.level} size={24} decorative />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs font-title font-medium text-ink mb-1">
                        <span>{mood.label}</span>
                        <span className="text-ink-soft">{count} ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-lilac-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: `var(--mood-${mood.level})`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Projects Progress */}
      {projectStats.length > 0 && (
        <Card padding="md" className="space-y-3 border-lilac-200">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Projects completion</h2>
            <Folder size={18} className="text-ink-soft" />
          </div>

          <div className="divide-y divide-divider">
            {projectStats.map((p) => (
              <div key={p.id} className="py-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-title">
                  <span className="font-medium text-ink flex items-center gap-1.5">
                    <span>{p.emoji}</span>
                    <span>{p.name}</span>
                  </span>
                  <span className="text-ink-soft font-sans">
                    {p.done} / {p.total} done ({p.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-lilac-100 overflow-hidden">
                  <div
                    className="h-full bg-mint-500 rounded-full transition-all duration-300"
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
