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
      <h2 className="font-display text-2xl text-ink">
        How is today feeling
      </h2>

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
              className={`flex flex-col items-center justify-center p-1.5 rounded-[8px] transition cursor-pointer ${
                isSelected
                  ? 'bg-cream ring-1 ring-lilac-300/60 shadow-soft scale-105'
                  : 'hover:bg-cream/70 opacity-80 hover:opacity-100'
              }`}
            >
              <CatFace mood={mood.level} size={36} decorative />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between font-typewriter text-xs text-ink-soft pt-3 border-t border-divider/60">
        {currentMood ? (
          <>
            <span>
              Today: <strong className="font-normal text-ink">{moodMeta(currentMood).label}</strong>
              <span> — {moodMeta(currentMood).phrase}</span>
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
          <span className="text-text-faint">Tap an expression to log today.</span>
        )}
      </div>
    </Card>
  );
}
