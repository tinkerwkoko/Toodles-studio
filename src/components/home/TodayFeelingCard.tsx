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
    <Card padding="md" className="space-y-3">
      <h2 className="font-display text-[18px] text-ink">How is today feeling</h2>

      {/* Five CatFace buttons */}
      <div className="flex items-center justify-between gap-1.5 pt-1">
        {MOODS.map((mood) => {
          const isSelected = currentMood === mood.level;
          return (
            <button
              key={mood.level}
              type="button"
              onClick={() => handleSelectMood(mood.level)}
              aria-label={`Log mood as ${mood.label}`}
              aria-pressed={isSelected}
              className={`flex flex-col items-center justify-center p-1.5 rounded-[9px] transition ${
                isSelected
                  ? 'bg-lilac-200 ring-2 ring-accent scale-105'
                  : 'hover:bg-lilac-100/70'
              }`}
            >
              <CatFace mood={mood.level} size={36} decorative />
            </button>
          );
        })}
      </div>

      {/* Mood status line */}
      <div className="flex items-center justify-between text-xs font-sans text-ink-soft pt-1 border-t border-divider">
        {currentMood ? (
          <>
            <span>
              Today: <strong className="text-ink">{moodMeta(currentMood).label}</strong>,{' '}
              {moodMeta(currentMood).phrase}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-text-faint hover:text-ink underline transition"
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
