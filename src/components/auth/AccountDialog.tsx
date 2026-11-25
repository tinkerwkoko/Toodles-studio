import { useState } from 'react';
import { Cloud, LogOut, Shield } from 'lucide-react';
import { Cat } from '../Cat';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';

export interface AccountDialogProps {
  open: boolean;
  onClose: () => void;
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

export function AccountDialog({ open, onClose }: AccountDialogProps) {
  const { data, actions, isCloudConnected, cloudSyncing } = useToodles();
  const { pushToast } = useUi();

  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false);

  const account = isCloudConnected ? data.settings.account : null;

  async function handleGoogleSignIn(): Promise<void> {
    setSigningIn(true);
    setErrorMessage(null);
    try {
      const signedIn = await actions.signInWithGoogle();
      pushToast(`Signed in as ${signedIn.name} — cloud sync is active`, 'success');
      onClose();
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code: unknown }).code)
          : '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setErrorMessage('Sign-in popup was closed. Try again whenever you are ready.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage('Your browser blocked the sign-in popup. Allow popups and try again.');
      } else {
        setErrorMessage('Could not sign in with Google right now. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  }

  async function handleConfirmSignOut(): Promise<void> {
    setSigningOut(true);
    try {
      await actions.signOutUser();
      setConfirmSignOutOpen(false);
      pushToast('Signed out safely.');
      onClose();
    } catch {
      pushToast('Could not sign out right now. Please try again.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={account ? 'Your account' : 'Sync across devices'}
        size="md"
      >
        {account ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3.5 pb-4 border-b border-divider/65">
              <div className="grid h-12 w-12 place-items-center rounded-[10px] bg-paper-2 overflow-hidden shrink-0">
                {account.avatar ? (
                  <img
                    src={account.avatar}
                    alt={account.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Cat pose="happy" size={34} animated={false} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-display text-2xl text-ink truncate leading-tight">
                    {account.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 font-typewriter text-xs text-fern">
                    <Cloud size={12} aria-hidden="true" />
                    {cloudSyncing ? 'Syncing…' : 'Synced'}
                  </span>
                </div>
                <p className="font-typewriter text-xs text-ink-soft truncate">{account.email}</p>
              </div>
            </div>

            <div className="space-y-3 font-typewriter text-xs text-ink-soft leading-relaxed">
              <p>
                Signed in with Google. Every task, project, board column, diary entry, mood, habit,
                and focus session persists automatically to your private cloud workspace and stays
                in sync across all your devices.
              </p>
              <div className="flex items-center gap-2.5 rounded-[8px] bg-paper-2/60 p-3 text-xs">
                <Shield size={14} className="text-accent shrink-0" aria-hidden="true" />
                <span>Protected by verified Google OAuth and strict per-user database rules.</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-divider/65 pt-3.5">
              <Button
                variant="danger"
                size="sm"
                icon={<LogOut size={14} />}
                onClick={() => setConfirmSignOutOpen(true)}
              >
                Sign out
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-divider/65">
              <Cat pose="wave" size={44} animated={false} />
              <div className="space-y-1 text-xs text-ink-soft leading-relaxed">
                <p className="font-display text-lg text-ink">
                  Keep Toodles with you everywhere
                </p>
                <p className="font-typewriter text-xs">
                  Sign in with Google to back up your workspace to the cloud and sync seamlessly
                  across phone, tablet, and desktop. Existing guest items will upload automatically.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-[8px] bg-rose-100 px-3.5 py-2.5 font-typewriter text-xs text-rose-700"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              disabled={signingIn}
              onClick={() => void handleGoogleSignIn()}
              className="flex min-h-11 w-full items-center justify-center gap-3 rounded-[8px] border border-divider/80 bg-cream px-5 py-2.5 font-sans text-sm font-medium text-ink transition hover:border-accent/60 hover:bg-paper-2/70 active:translate-y-[0.5px] disabled:opacity-60 cursor-pointer"
            >
              <GoogleMark />
              <span>{signingIn ? 'Signing in with Google…' : 'Continue with Google'}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 font-typewriter text-xs text-ink-soft pt-1">
              <Shield size={13} className="text-accent shrink-0" aria-hidden="true" />
              <span>Only you can read or modify your personal Toodles data.</span>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        open={confirmSignOutOpen}
        onClose={() => setConfirmSignOutOpen(false)}
        title="Sign out of Toodles?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="font-typewriter text-xs text-ink-soft leading-relaxed">
            Your cloud workspace stays safely saved under your Google account. Signing back in on
            any device will restore everything right away.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={signingOut}
              onClick={() => setConfirmSignOutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={signingOut}
              onClick={() => void handleConfirmSignOut()}
            >
              {signingOut ? 'Signing out…' : 'Yes, sign out'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
