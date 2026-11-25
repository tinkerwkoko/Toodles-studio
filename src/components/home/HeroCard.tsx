import { Plus } from 'lucide-react';
import { Cat, type CatPose } from '../Cat';
import { Button } from '../ui/Button';
import { FernSprig } from '../ui/BotanicalOrnaments';
import { greetingTimeOfDay } from '../../lib/date';
import { useUi } from '../../store/useUi';

export interface HeroCardProps {
  hasTasks?: boolean;
}

/** Soft sunlit botanical welcome sheet with fine-line fern corner illustration. */
export function HeroCard({ hasTasks = false }: HeroCardProps) {
  const { openCreate } = useUi();
  const isNight = greetingTimeOfDay() === 'night';

  const catPose: CatPose = isNight ? 'sleepy' : hasTasks ? 'happy' : 'wave';

  return (
    <section className="relative overflow-hidden paper-sheet rounded-[12px] px-6 py-6 sm:px-8 sm:py-7">
      <FernSprig className="absolute -top-2 -right-3 w-36 text-fern/22" />

      <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <Cat pose={catPose} size={130} animated className="shrink-0" />
        <div className="min-w-0 flex-1 pr-0 sm:pr-8">
          <h2 className="font-display text-2xl sm:text-[1.9rem] text-ink leading-tight">
            {hasTasks ? 'Your cozy corner' : 'Your cozy corner is ready'}
          </h2>
          <p className="mt-2.5 font-typewriter text-[13px] text-ink-soft leading-relaxed max-w-2xl">
            {hasTasks
              ? 'Take things one small, gentle step at a time today. Write down whatever is on your mind, celebrate the quiet wins, and rest when you need to.'
              : 'Nothing here yet, which is a lovely way to start. Write down one small thing and Toodles will help you keep track of it. Everything stays safely synced or right in this browser.'}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5 sm:justify-start">
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
