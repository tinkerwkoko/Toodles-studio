import { Plus } from 'lucide-react';
import { Cat, type CatPose } from '../Cat';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { greetingTimeOfDay } from '../../lib/date';
import { useUi } from '../../store/useUi';

export interface HeroCardProps {
  hasTasks?: boolean;
}

/** Warm welcome and calm anchor for the workspace. */
export function HeroCard({ hasTasks = false }: HeroCardProps) {
  const { openCreate } = useUi();
  const isNight = greetingTimeOfDay() === 'night';

  const catPose: CatPose = isNight ? 'sleepy' : hasTasks ? 'happy' : 'wave';

  return (
    <Card padding="lg" className="mb-6 overflow-hidden border-lilac-200 bg-lilac-100">
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <Cat pose={catPose} size={150} animated className="shrink-0" />
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl">
            {hasTasks ? 'Your cozy corner' : 'Your cozy corner is ready'}
          </h2>
          <p className="mt-2 text-[0.95rem] text-ink-soft">
            {hasTasks
              ? 'Take things one small, gentle step at a time today. Write down whatever is on your mind, celebrate the quiet wins, and rest when you need to.'
              : 'Nothing here yet, which is a lovely way to start. Write down one small thing and Toodles will help you keep track of it. Everything stays in this browser.'}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Button
              onClick={() => openCreate('task')}
              icon={hasTasks ? <Plus size={18} aria-hidden="true" /> : undefined}
            >
              {hasTasks ? 'Add a task' : 'Create your first task'}
            </Button>
            <Button variant="soft" onClick={() => openCreate('project')}>
              {hasTasks ? 'New project' : 'Create a project'}
            </Button>
            <Button variant="soft" onClick={() => openCreate('diary')}>
              {hasTasks ? 'Diary entry' : 'Write a diary entry'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
