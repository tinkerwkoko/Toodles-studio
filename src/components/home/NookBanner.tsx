import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatLongDay, todayString } from '../../lib/date';
import { getTimeOfDayGreeting } from '../../lib/copy';
import { useUi } from '../../store/useUi';

/**
 * My Nook banner per section 6:
 * Flat tinted cream block, no border, greeting + date on same line,
 * witty time-of-day line, 3 buttons (New task, New project, Diary entry). No big cat.
 */
export function NookBanner() {
  const { openCreate } = useUi();
  const today = todayString();
  const greeting = getTimeOfDayGreeting();

  return (
    <div className="rounded-[12px] bg-cream-banner p-5 text-ink">
      {/* Top line: Greeting on the left, date on the right */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-[30px] leading-tight text-ink">
          {greeting.heading}
        </h1>
        <span className="font-sans text-sm text-ink-soft">
          {formatLongDay(today)}
        </span>
      </div>

      {/* 8px gap: witty line */}
      <p className="mt-2 font-sans text-sm text-ink-soft">
        {greeting.wittyLine}
      </p>

      {/* 12px gap: 3 buttons */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          onClick={() => openCreate('task')}
          icon={<Plus size={16} aria-hidden="true" />}
        >
          New task
        </Button>
        <Button variant="soft" onClick={() => openCreate('project')}>
          New project
        </Button>
        <Button variant="soft" onClick={() => openCreate('diary')}>
          Diary entry
        </Button>
      </div>
    </div>
  );
}
