import { useState } from 'react';
import { LogIn, LogOut, Shield, UserPlus } from 'lucide-react';
import { Cat } from '../Cat';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Field, Input } from '../ui/Field';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';
import { nowTimestamp } from '../../lib/date';
import type { UserAccount } from '../../types';

export interface AccountDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AccountDialog({ open, onClose }: AccountDialogProps) {
  const { data, actions } = useToodles();
  const { pushToast } = useUi();

  const account = data.settings.account;
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false);

  // Form states
  const existingName = data.settings.displayName.trim();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSignIn(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email.trim()) {
      pushToast('Please enter your email');
      return;
    }

    // Preserve existing display name if already set
    const resolvedName =
      existingName.length > 0
        ? existingName
        : email.includes('@')
          ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
          : 'Friend';

    const user: UserAccount = {
      id: crypto.randomUUID(),
      email: email.trim(),
      name: resolvedName,
      provider: 'email',
      syncAcrossDevices: false,
      syncedAt: nowTimestamp(),
    };

    actions.updateSettings({
      account: user,
      displayName: resolvedName,
      guestMode: false,
    });
    pushToast(`Welcome back, ${resolvedName}! ✨`, 'success');
    onClose();
  }

  function handleSignUp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email.trim()) {
      pushToast('Please enter your email');
      return;
    }

    const resolvedName = name.trim().length > 0 ? name.trim() : existingName || 'Friend';

    const user: UserAccount = {
      id: crypto.randomUUID(),
      email: email.trim(),
      name: resolvedName,
      provider: 'email',
      syncAcrossDevices: false,
      syncedAt: nowTimestamp(),
    };

    actions.updateSettings({
      account: user,
      displayName: resolvedName,
      guestMode: false,
    });
    pushToast(`Account created! Welcome, ${resolvedName} 🎉`, 'success');
    onClose();
  }

  function handleConfirmSignOut() {
    actions.updateSettings({ account: null, guestMode: false });
    setConfirmSignOutOpen(false);
    pushToast('Signed out safely.');
    onClose();
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={account ? 'Your account' : 'Sign in to Toodles'}
        size="md"
      >
        {account ? (
          /* Signed In View */
          <div className="space-y-5">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-divider bg-card">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-lilac-100 overflow-hidden border border-divider shrink-0">
                <Cat pose="happy" size={36} animated={false} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl text-ink truncate">{account.name}</h3>
                  <span className="rounded-full bg-lilac-200/80 px-2 py-0.5 text-[11px] font-title font-medium text-ink">
                    Active
                  </span>
                </div>
                <p className="font-sans text-xs text-ink-soft truncate">{account.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-sans text-ink-soft">
              <p>
                Your personal workspace is active. All your tasks, projects, notes, and habits are
                safely stored in your private sanctuary.
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-divider pt-3">
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
          /* Sign In / Sign Up Forms */
          <div className="space-y-4">
            {/* Tab switch */}
            <div className="flex rounded-full border border-divider bg-lilac-100/60 p-1">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-title font-medium transition cursor-pointer ${
                  tab === 'signin'
                    ? 'bg-lilac-200 text-ink font-semibold shadow-sm'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <LogIn size={13} />
                <span>Sign in</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-title font-medium transition cursor-pointer ${
                  tab === 'signup'
                    ? 'bg-lilac-200 text-ink font-semibold shadow-sm'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <UserPlus size={13} />
                <span>Create account</span>
              </button>
            </div>

            {tab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-3.5">
                <Field label="Email" htmlFor="dialog-signin-email">
                  <Input
                    id="dialog-signin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@domain.com"
                  />
                </Field>

                <Field label="Password" htmlFor="dialog-signin-pass">
                  <Input
                    id="dialog-signin-pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </Field>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-divider">
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" icon={<LogIn size={14} />}>
                    Sign in
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <Field label="Your name / nickname" htmlFor="dialog-signup-name">
                  <Input
                    id="dialog-signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cozy Friend"
                  />
                </Field>

                <Field label="Email" htmlFor="dialog-signup-email">
                  <Input
                    id="dialog-signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@domain.com"
                  />
                </Field>

                <Field label="Password" htmlFor="dialog-signup-pass">
                  <Input
                    id="dialog-signup-pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </Field>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-divider">
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" icon={<UserPlus size={14} />}>
                    Create account
                  </Button>
                </div>
              </form>
            )}

            <div className="flex items-center justify-center gap-1.5 text-xs font-sans text-ink-soft pt-1">
              <Shield size={13} className="text-accent" />
              <span>We respect your privacy and never share users&apos; data.</span>
            </div>
          </div>
        )}
      </Dialog>

      {/* Sign out confirmation dialog */}
      <Dialog
        open={confirmSignOutOpen}
        onClose={() => setConfirmSignOutOpen(false)}
        title="Sign out of Toodles?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm font-sans text-ink-soft">
            Are you sure you want to sign out? Your tasks, projects, and notes are securely preserved
            on this device. You can sign back in anytime.
          </p>
          <div className="flex items-center justify-end gap-2 border-t border-divider pt-3">
            <Button variant="ghost" size="sm" onClick={() => setConfirmSignOutOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
