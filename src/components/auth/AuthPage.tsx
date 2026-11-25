import { useState } from 'react';
import { Cloud, Shield, User } from 'lucide-react';
import { Cat } from '../Cat';
import { BotanicalDivider, WildflowerSprig } from '../ui/BotanicalOrnaments';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';

export interface AuthPageProps {
  onSuccess: () => void;
  onContinueAsGuest: () => void;
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.57-5.15 3.57-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.45 1.14-4.06 1.14-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.28v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77Z"
      />
    </svg>
  );
}

/**
 * Pre-entry Antique Library opening: pairs the engraved botanical archway plate
 * with quiet typewritten sign-in and guest entry.
 */
export function AuthPage({ onSuccess, onContinueAsGuest }: AuthPageProps) {
  const { actions } = useToodles();
  const { pushToast } = useUi();
  const [signingIn, setSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleGoogleSignIn(): Promise<void> {
    setSigningIn(true);
    setErrorMessage(null);
    try {
      const account = await actions.signInWithGoogle();
      pushToast(`Welcome, ${account.name}. Synced across your devices.`, 'success');
      onSuccess();
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code: unknown }).code)
          : '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setErrorMessage('Sign-in popup was closed. Click below whenever you are ready.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage(
          'Your browser blocked the sign-in popup. Please allow popups and try again.',
        );
      } else {
        setErrorMessage('Could not sign in with Google right now. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <div className="antique-library min-h-dvh w-full flex items-center justify-center px-4 py-8 sm:px-8 text-ink">
      <div className="relative w-full max-w-4xl motion-safe:animate-fade-in">
        {/* Antique library open-volume spread */}
        <div className="paper-stack relative grid overflow-hidden rounded-[12px] lg:grid-cols-[1.02fr_1fr] lg:items-stretch">
          {/* Delicate corner botanical engraving linework */}
          <WildflowerSprig className="absolute -right-2 -top-2 z-10 h-20 w-20 text-dusty-rose/45 rotate-90 hidden sm:block" />

          {/* Left plate: Antique engraved garden archway */}
          <div className="relative flex items-center justify-center overflow-hidden bg-paper-2/70 p-4 sm:p-6 lg:p-7">
            <div className="antique-frame relative h-56 w-full overflow-hidden rounded-t-[140px] rounded-b-[4px] bg-cream sm:h-72 lg:h-full lg:min-h-[470px]">
              <img
                src="/assets/aistudio/WA_1795626366480_d5812337.jpg"
                alt="Botanical archway illustration"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-[50%_46%] opacity-90 transition duration-500"
              />
              {/* Soft warm parchment edge veil */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent"
              />
            </div>
          </div>

          {/* Right leaf: Quiet bookplate & sign-in controls */}
          <div className="relative flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-11">
            <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center">
              <Cat pose="wave" size={78} animated />

              <h1 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight text-ink leading-none">
                Toodles
              </h1>
              <p className="mt-1.5 font-hand text-[1.75rem] leading-none text-accent">
                Small tasks, big calm.
              </p>

              <BotanicalDivider className="my-5 w-full max-w-[220px]" />

              <div className="w-full space-y-4">
                <p className="font-typewriter text-xs leading-relaxed text-ink-soft">
                  Sign in with Google to keep your tasks, projects, diary pages, habits and moods in
                  sync across devices.
                </p>

                {errorMessage && (
                  <div
                    role="alert"
                    className="rounded-[6px] bg-rose-100 px-3.5 py-2.5 font-typewriter text-xs text-rose-700"
                  >
                    {errorMessage}
                  </div>
                )}

                <button
                  type="button"
                  disabled={signingIn}
                  onClick={() => void handleGoogleSignIn()}
                  className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-[7px] bg-lilac-300 px-5 py-2.5 font-sans text-sm font-medium text-primary-ink shadow-soft transition duration-200 hover:bg-lilac-400 active:translate-y-[0.5px] disabled:opacity-60"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-cream/95">
                    <GoogleMark />
                  </span>
                  <span>{signingIn ? 'Signing in with Google…' : 'Continue with Google'}</span>
                </button>

                <div className="flex items-center gap-3 pt-1 text-text-faint">
                  <span className="h-px flex-1 bg-divider" />
                  <span className="font-typewriter text-[11px]">or</span>
                  <span className="h-px flex-1 bg-divider" />
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    disabled={signingIn}
                    onClick={onContinueAsGuest}
                    className="inline-flex cursor-pointer items-center gap-1.5 font-typewriter text-xs text-ink-soft underline decoration-divider underline-offset-4 transition hover:text-ink hover:decoration-accent disabled:opacity-50"
                  >
                    <User size={13} aria-hidden="true" />
                    <span>Continue as guest (this device only)</span>
                  </button>
                  <p className="font-typewriter text-[11px] text-text-faint">
                    You can sign in with Google anytime later in Settings.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex items-center justify-center gap-2 border-t border-divider/70 pt-4 font-typewriter text-[11px] text-ink-soft">
                <Cloud size={12} className="shrink-0 text-accent" aria-hidden="true" />
                <Shield size={12} className="shrink-0 text-accent" aria-hidden="true" />
                <span>Private to your Google account</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
