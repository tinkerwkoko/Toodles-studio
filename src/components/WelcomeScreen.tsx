import { useEffect, useState, type ReactNode } from 'react';
import { Cat } from './Cat';
import { BotanicalDivider } from './ui/BotanicalOrnaments';
import { cx } from '../lib/cx';

export interface WelcomeScreenProps {
  onDone: () => void;
}

const VISIBLE_MS = 1800;
const FADE_MS = 320;

/** Brief antique-volume opening shown once on a fresh visit. Tap anywhere to enter immediately. */
export function WelcomeScreen({ onDone }: WelcomeScreenProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (leaving) return;
    const timer = window.setTimeout(() => setLeaving(true), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(onDone, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving, onDone]);

  return (
    <SplashShell leaving={leaving} onSkip={() => setLeaving(true)}>
      <div className="flex w-full max-w-sm flex-col items-center px-8 py-10 text-center">
        <Cat pose="sleepy" size={140} />
        <h1 className="mt-4 font-display text-5xl leading-none tracking-tight text-ink sm:text-6xl">
          Toodles
        </h1>
        <p className="mt-2 font-hand text-[2rem] leading-none text-accent">
          Small tasks, big calm.
        </p>

        <BotanicalDivider className="my-5 w-48" />

        <div className="h-[2px] w-40 overflow-hidden rounded-full bg-paper-2">
          <div className="h-full bg-lilac-300 motion-safe:animate-grow" />
        </div>
      </div>
    </SplashShell>
  );
}

interface SplashShellProps {
  leaving: boolean;
  onSkip: () => void;
  children: ReactNode;
}

export function SplashShell({ leaving, onSkip, children }: SplashShellProps) {
  return (
    <div
      className={cx(
        'antique-library fixed inset-0 z-60 grid place-items-center transition-opacity duration-300',
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
    >
      <button
        type="button"
        onClick={onSkip}
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Skip the welcome screen"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
