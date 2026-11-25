import { useEffect, useState, type ReactNode } from 'react';
import { Cat } from './Cat';
import { cx } from '../lib/cx';

export interface WelcomeScreenProps {
  onDone: () => void;
}

/** Shown once per fresh visit, for about two seconds. Tap anywhere to skip. */
const ROTATING_LINES = [
  'Untangle your day, one tiny win at a time.',
  'Your to-dos, your moods, your habits, all tucked into one cozy place.',
  'No clutter. Synced across your devices. Just you and a very helpful cat.',
];

const VISIBLE_MS = 1900;
const FADE_MS = 320;

export function WelcomeScreen({ onDone }: WelcomeScreenProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const rotate = window.setInterval(
      () => setLineIndex((current) => (current + 1) % ROTATING_LINES.length),
      1500,
    );
    return () => window.clearInterval(rotate);
  }, []);

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
      <div className="flex w-full max-w-md flex-col items-center px-8 py-10 text-center">
        <span className="font-hand text-lg text-ink-soft tracking-wide">Ex Libris</span>
        <div className="my-3 h-px w-16 bg-lilac-200" />
        <Cat pose="sleepy" size={156} />
        <h1 className="mt-4 font-display text-5xl sm:text-6xl font-semibold leading-none tracking-tight text-ink">
          Toodles
        </h1>
        <p className="mt-2 font-hand text-2xl text-accent">Small tasks, big calm.</p>

        <div className="mt-5 flex min-h-14 items-center justify-center">
          <p
            key={lineIndex}
            className="text-sm font-sans italic text-ink-soft motion-safe:animate-fade-in leading-relaxed"
          >
            {ROTATING_LINES[lineIndex]}
          </p>
        </div>

        <div className="mt-3 h-[3px] w-48 overflow-hidden rounded-[2px] bg-paper-2">
          <div className="h-full bg-lilac-300 motion-safe:animate-grow" />
        </div>
        <p className="mt-3 text-[11px] font-sans tracking-[0.18em] text-text-faint uppercase">
          Tucking things away
        </p>
      </div>
    </SplashShell>
  );
}

interface SplashShellProps {
  leaving: boolean;
  onSkip: () => void;
  children: ReactNode;
}

/** Warm parchment bookplate wash that fades out once the splash is finished. */
export function SplashShell({ leaving, onSkip, children }: SplashShellProps) {
  return (
    <div
      className={cx(
        'fixed inset-0 z-60 grid place-items-center bg-lilac-50 transition-opacity duration-300',
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
