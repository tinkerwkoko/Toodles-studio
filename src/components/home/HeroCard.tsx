import { Plus } from 'lucide-react';
import { Cat, type CatPose } from '../Cat';
import { Button } from '../ui/Button';
import { greetingTimeOfDay } from '../../lib/date';
import { useUi } from '../../store/useUi';

export interface HeroCardProps {
  hasTasks?: boolean;
}

/** Warm stationery opening note with subtle deckled edge and burgundy bookmark tab. */
export function HeroCard({ hasTasks = false }: HeroCardProps) {
  const { openCreate } = useUi();
  const isNight = greetingTimeOfDay() === 'night';

  const catPose: CatPose = isNight ? 'sleepy' : hasTasks ? 'happy' : 'wave';

  return (
    <section className="relative paper-sheet deckled-bottom rounded-t-[5px] border border-divider/90 px-6 py-6 sm:px-8 sm:py-7">
      {/* Subtle burgundy bookmark ribbon accent */}
      <span
        aria-hidden="true"
        className="absolute top-0 right-7 h-7 w-4 bg-lilac-300/90 [clip-path:polygon(0_0,100%_0,100%_100%,50%_74%,0_100%)]"
      />

      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <Cat pose={catPose} size={132} animated className="shrink-0" />
        <div className="min-w-0 flex-1 pr-0 sm:pr-6">
          <p className="font-hand text-lg text-ink-soft leading-none">A quiet note</p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-ink leading-tight">
            {hasTasks ? 'Your cozy corner' : 'Your cozy corner is ready'}
          </h2>
          <p className="mt-2 text-sm font-sans italic text-ink-soft leading-relaxed max-w-2xl">
            {hasTasks
              ? 'Take things one small, gentle step at a time today. Write down whatever is on your mind, celebrate the quiet wins, and rest when you need to.'
              : 'Nothing here yet, which is a lovely way to start. Write down one small thing and Toodles will help you keep track of it. Everything stays safely synced or right in this browser.'}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Button
              onClick={() => openCreate('task')}
              icon={hasTasks ? <Plus size={15} aria-hidden="true" /> : undefined}
            >
              {hasTasks ? 'Add a task' : 'Create your first task'}
            </Button>
            <Button variant="outline" onClick={() => openCreate('project')}>
              {hasTasks ? 'New project' : 'Create a project'}
            </Button>
            <Button variant="ghost" onClick={() => openCreate('diary')}>
              {hasTasks ? 'Diary entry' : 'Write a diary entry'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
