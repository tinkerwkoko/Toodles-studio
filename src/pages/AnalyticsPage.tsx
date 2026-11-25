import { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { CatFace } from '../components/CatFace';
import { MOODS } from '../lib/mood';
import { addDays, todayString } from '../lib/date';
import { cx } from '../lib/cx';
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
      ? `${studyHours}h${studyRemainingMins > 0 ? ` ${studyRemainingMins}m` : ''}`
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

  // Mood breakdown
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

  const summaryItems = [
    { label: 'Completed', value: String(completedTasks.length) },
    { label: 'Hours studied', value: studyHoursText },
    { label: 'Focus sessions', value: String(data.focusSessions?.length || 0) },
    { label: 'Habit checks', value: String(data.habitChecks.length) },
    { label: 'Moods logged', value: String(totalMoodLogs) },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-7 pb-6">
      <header className="space-y-1 border-b border-divider pb-5">
        <p className="font-hand text-[1.1rem] leading-none text-ink-soft">Archival ledger</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2.15rem]">
          Analytics &amp; Calm Insights
        </h1>
        <p className="text-sm text-ink-soft">
          A gentle look at your completed tasks, focused rhythms, and wellbeing.
        </p>
      </header>

      {/* Hairline-Divided 5-Column Summary Ledger */}
      <div className="paper-sheet grid grid-cols-2 divide-y divide-divider/70 rounded-[5px] sm:grid-cols-5 sm:divide-x sm:divide-y-0">
        {summaryItems.map((item) => (
          <div key={item.label} className="px-4 py-4">
            <div className="text-[11px] uppercase tracking-wider text-ink-soft">{item.label}</div>
            <div className="mt-1 font-display text-3xl font-semibold tabular-nums text-ink">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two Columns: Daily Task Activity & Mood Balance */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Last 7 Days Task Activity Chart */}
        <Card padding="lg" className="space-y-4">
          <div className="border-b border-divider pb-2.5">
            <p className="font-hand text-base leading-none text-ink-soft">Past week</p>
            <h2 className="mt-0.5 font-display text-xl font-semibold text-ink">
              Tasks finished (last 7 days)
            </h2>
          </div>

          <div className="flex h-44 items-end justify-between gap-2.5 border-b border-divider px-2 pt-4 pb-2">
            {last7DaysData.map((d) => {
              const heightPercent = Math.max(6, (d.count / maxDailyCount) * 100);
              const isToday = d.date === today;
              return (
                <div
                  key={d.date}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                >
                  <span className="text-[11px] tabular-nums text-ink-soft">
                    {d.count > 0 ? d.count : ''}
                  </span>
                  <div
                    className={cx(
                      'w-full max-w-[26px] rounded-t-[3px] transition-all duration-300',
                      isToday ? 'bg-lilac-300' : 'bg-dusty-rose/65 hover:bg-dusty-rose',
                    )}
                    style={{ height: `${heightPercent}%` }}
                    title={`${d.count} tasks on ${d.date}`}
                  />
                  <span
                    className={cx(
                      'text-[11px]',
                      isToday ? 'font-semibold text-ink' : 'text-ink-soft',
                    )}
                  >
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Mood Distribution */}
        <Card variant="aged" padding="lg" className="space-y-4">
          <div className="border-b border-divider pb-2.5">
            <p className="font-hand text-base leading-none text-ink-soft">Reflections</p>
            <h2 className="mt-0.5 font-display text-xl font-semibold text-ink">Mood balance</h2>
          </div>

          {totalMoodLogs === 0 ? (
            <p className="py-10 text-center text-xs italic text-ink-soft">
              No moods logged yet. Check in on the overview page.
            </p>
          ) : (
            <div className="space-y-3.5">
              {MOODS.map((mood) => {
                const count = moodCounts[mood.level] || 0;
                const percent = Math.round((count / totalMoodLogs) * 100);
                return (
                  <div key={mood.level} className="flex items-center gap-3">
                    <CatFace mood={mood.level} size={22} decorative />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex justify-between text-xs text-ink">
                        <span className="font-medium">{mood.label}</span>
                        <span className="tabular-nums text-ink-soft">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-[2px] bg-cream">
                        <div
                          className="h-full rounded-[2px] transition-all duration-300"
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
        <Card padding="lg" className="space-y-3">
          <div className="border-b border-divider pb-2.5">
            <p className="font-hand text-base leading-none text-ink-soft">Folios</p>
            <h2 className="mt-0.5 font-display text-xl font-semibold text-ink">
              Projects completion
            </h2>
          </div>

          <div className="divide-y divide-divider/70">
            {projectStats.map((p) => (
              <div key={p.id} className="space-y-1.5 py-3 first:pt-1 last:pb-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-ink">
                    <span>{p.emoji}</span>
                    <span>{p.name}</span>
                  </span>
                  <span className="tabular-nums text-ink-soft">
                    {p.done} / {p.total} done ({p.percent}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-[2px] bg-paper-2">
                  <div
                    className="h-full rounded-[2px] bg-forest transition-all duration-300"
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
