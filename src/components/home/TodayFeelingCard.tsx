import { CatFace } from '../CatFace';
import { Card } from '../ui/Card';
import { MOODS, moodMeta } from '../../lib/mood';
import { todayString } from '../../lib/date';
import { useToodles } from '../../store/useToodles';
import type { MoodLevel } from '../../types';

export function TodayFeelingCard() {
  const { data, actions } = useToodles();
  const today = todayString();

  const todayLog = data.moods.find((m) => m.date === today);
  const currentMood = todayLog?.mood;

  function handleSelectMood(level: MoodLevel) {
    actions.logMood(today, level);
  }

  function handleClear() {
    actions.clearMood(today);
  }

  return (
    <Card variant="aged" padding="md" className="space-y-3.5">
      <div>
        <p className="font-hand text-base text-ink-soft leading-none">Daily reflection</p>
        <h2 className="mt-0.5 font-display text-2xl font-semibold text-ink">
          How is today feeling
        </h2>
      </div>

      <div className="flex items-center justify-between gap-1 pt-0.5">
        {MOODS.map((mood) => {
          const isSelected = currentMood === mood.level;
          return (
            <button
              key={mood.level}
              type="button"
              onClick={() => handleSelectMood(mood.level)}
              aria-label={`Log mood as ${mood.label}`}
              aria-pressed={isSelected}
              title={mood.label}
              className={`flex flex-col items-center justify-center p-1.5 rounded-[4px] transition cursor-pointer ${
                isSelected
                  ? 'bg-cream ring-1 ring-accent shadow-[0_1px_2px_rgba(69,56,47,0.16)] scale-105'
                  : 'hover:bg-cream/65 opacity-80 hover:opacity-100'
              }`}
            >
              <CatFace mood={mood.level} size={36} decorative />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs font-sans text-ink-soft pt-2.5 border-t border-divider">
        {currentMood ? (
          <>
            <span>
              Today: <strong className="font-semibold text-ink">{moodMeta(currentMood).label}</strong>
              <span className="italic"> — {moodMeta(currentMood).phrase}</span>
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-text-faint hover:text-accent underline underline-offset-2 transition cursor-pointer shrink-0 ml-2"
            >
              Clear
            </button>
          </>
        ) : (
          <span className="italic text-text-faint">Tap an expression to log today.</span>
        )}
      </div>
    </Card>
  );
}
