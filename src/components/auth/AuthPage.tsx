import { useState } from 'react';
import { Cloud, Shield, User } from 'lucide-react';
import { Cat } from '../Cat';
import { Card } from '../ui/Card';
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
      pushToast(`Welcome, ${account.name}! Synced across your devices ✨`, 'success');
      onSuccess();
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code: unknown }).code)
          : '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setErrorMessage('Sign-in popup was closed. Click below whenever you are ready.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage('Your browser blocked the sign-in popup. Please allow popups and try again.');
      } else {
        setErrorMessage('Could not sign in with Google right now. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center p-5 bg-lilac-50 text-ink">
      <div className="w-full max-w-md space-y-6 motion-safe:animate-fade-in">
        {/* Bookplate header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Cat pose="wave" size={88} animated />
          <h1 className="font-display text-5xl font-semibold text-ink tracking-tight leading-none">
            Toodles
          </h1>
          <p className="font-hand text-xl text-accent">Small tasks, big calm.</p>
          <p className="font-sans text-sm italic text-ink-soft max-w-sm">
            Sign in to keep your diary, tasks, and projects synced across all your devices.
          </p>
        </div>

        {/* Stacked paper sign-in folio */}
        <Card variant="stack" padding="lg" className="space-y-5">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-sans font-medium tracking-[0.06em] uppercase text-accent">
              <Cloud size={14} aria-hidden="true" />
              <span>Real-time cross-device sync</span>
            </div>
            <p className="text-xs font-sans text-ink-soft leading-relaxed">
              Your tasks, projects, kanban boards, diary pages, habits, and moods stay safely
              in sync across phone, tablet, and desktop.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-[4px] border border-rose-200 bg-rose-100 px-3.5 py-2.5 text-xs font-sans text-rose-700"
            >
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            disabled={signingIn}
            onClick={() => void handleGoogleSignIn()}
            className="flex min-h-11 w-full items-center justify-center gap-3 rounded-[4px] border border-lilac-200 bg-lilac-50 px-5 py-2.5 font-sans text-sm font-medium text-ink transition hover:border-accent hover:bg-paper-2/80 active:translate-y-[0.5px] disabled:opacity-60 cursor-pointer"
          >
            <GoogleMark />
            <span>{signingIn ? 'Signing in with Google…' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center pt-1">
            <span className="absolute inset-x-0 h-px bg-divider" />
            <span className="relative bg-card px-3 font-hand text-base text-text-faint">or</span>
          </div>

          <div className="text-center space-y-1.5">
            <button
              type="button"
              disabled={signingIn}
              onClick={onContinueAsGuest}
              className="inline-flex items-center gap-1.5 text-xs font-sans text-ink-soft hover:text-accent underline underline-offset-4 transition cursor-pointer"
            >
              <User size={13} aria-hidden="true" />
              <span>Continue as guest (this device only)</span>
            </button>
            <p className="text-[11px] font-sans italic text-text-faint">
              You can sign in with Google anytime later to sync your workspace.
            </p>
          </div>
        </Card>

        <div className="flex items-center justify-center gap-1.5 text-xs font-sans text-ink-soft text-center px-4">
          <Shield size={13} className="text-accent shrink-0" aria-hidden="true" />
          <span>Your workspace is strictly private to your verified Google account.</span>
        </div>
      </div>
    </div>
  );
}
