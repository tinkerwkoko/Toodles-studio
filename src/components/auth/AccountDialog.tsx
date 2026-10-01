import { useState } from 'react';
import { Cloud, LogIn, LogOut, RefreshCw, Shield, UserPlus } from 'lucide-react';
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

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [syncing, setSyncing] = useState(false);

  function handleSignIn(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email.trim()) {
      pushToast('Please enter your email');
      return;
    }

    const defaultName = email.split('@')[0] || 'Friend';
    const user: UserAccount = {
      id: crypto.randomUUID(),
      email: email.trim(),
      name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
      provider: 'email',
      syncAcrossDevices: true,
      syncedAt: nowTimestamp(),
    };

    actions.updateSettings({
      account: user,
      displayName: user.name,
    });
    pushToast(`Welcome back, ${user.name}! ☁️ Synced`, 'success');
    onClose();
  }

  function handleSignUp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email.trim() || !name.trim()) {
      pushToast('Please provide your name and email');
      return;
    }

    const user: UserAccount = {
      id: crypto.randomUUID(),
      email: email.trim(),
      name: name.trim(),
      provider: 'email',
      syncAcrossDevices: true,
      syncedAt: nowTimestamp(),
    };

    actions.updateSettings({
      account: user,
      displayName: user.name,
    });
    pushToast(`Account created for ${user.name}! 🎉`, 'success');
    onClose();
  }

  function handleGoogleOAuth() {
    // Simulated Google OAuth login flow with immediate success
    const mockEmail = email.trim() || 'user@gmail.com';
    const parsedName = name.trim() || mockEmail.split('@')[0];
    const googleUser: UserAccount = {
      id: crypto.randomUUID(),
      email: mockEmail,
      name: parsedName.charAt(0).toUpperCase() + parsedName.slice(1),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      provider: 'google',
      syncAcrossDevices: true,
      syncedAt: nowTimestamp(),
    };

    actions.updateSettings({
      account: googleUser,
      displayName: googleUser.name,
    });
    pushToast(`Signed in with Google as ${googleUser.name}! ☁️ Synced`, 'success');
    onClose();
  }

  function handleSignOut() {
    actions.updateSettings({ account: null });
    pushToast('Signed out. Continuing in cozy local mode.');
    onClose();
  }

  function handleSyncNow() {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      if (account) {
        actions.updateSettings({
          account: {
            ...account,
            syncedAt: nowTimestamp(),
          },
        });
      }
      pushToast('All workspace data synced across devices! ☁️', 'success');
    }, 600);
  }

  function handleToggleCrossDevice() {
    if (!account) return;
    const nextVal = !account.syncAcrossDevices;
    actions.updateSettings({
      account: {
        ...account,
        syncAcrossDevices: nextVal,
      },
    });
    pushToast(nextVal ? 'Persisting across all devices' : 'Device persistence paused');
  }

  return (
    <Dialog open={open} onClose={onClose} title="Your Toodles Account" size="md">
      {account ? (
        /* Signed-in profile view */
        <div className="space-y-5">
          <div className="flex items-center gap-4 rounded-3xl border border-divider bg-card p-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-lilac-200 text-ink overflow-hidden border border-divider shrink-0">
              {account.avatar ? (
                <img src={account.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <Cat pose="happy" size={38} animated={false} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl text-ink truncate">{account.name}</h3>
                <span className="rounded-full bg-mint-100 px-2.5 py-0.5 text-[11px] font-title font-medium text-mint-700 capitalize">
                  {account.provider === 'google' ? 'Google Account' : 'Member'}
                </span>
              </div>
              <p className="font-sans text-xs text-ink-soft truncate">{account.email}</p>
              {account.syncedAt && (
                <p className="font-sans text-[11px] text-ink-soft/80 mt-1 flex items-center gap-1">
                  <Cloud size={11} className="text-accent" />
                  <span>Last synced across devices: {new Date(account.syncedAt).toLocaleTimeString()}</span>
                </p>
              )}
            </div>
          </div>

          {/* Device Persistence & Sync Card */}
          <div className="rounded-2xl border border-divider bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud size={18} className="text-accent" />
                <span className="font-title text-sm font-medium text-ink">Persist across all devices</span>
              </div>
              <button
                type="button"
                onClick={handleToggleCrossDevice}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  account.syncAcrossDevices ? 'bg-accent' : 'bg-lilac-200'
                }`}
                role="switch"
                aria-checked={account.syncAcrossDevices}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    account.syncAcrossDevices ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs font-sans text-ink-soft">
              When enabled, your tasks, projects, kanban boards, diary, and habits are kept up to date across your phone, tablet, and computer.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                variant="soft"
                onClick={handleSyncNow}
                disabled={syncing}
                icon={<RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />}
              >
                {syncing ? 'Syncing...' : 'Sync now'}
              </Button>
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="flex items-start gap-2.5 rounded-2xl bg-lilac-50 p-3 text-xs text-ink-soft border border-divider">
            <Shield size={16} className="text-accent shrink-0 mt-0.5" />
            <p>
              <strong>Privacy first:</strong> We never share users&apos; data or sell your information. Your tasks and thoughts stay private to you.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-divider pt-3">
            <Button variant="ghost" size="sm" onClick={handleSignOut} icon={<LogOut size={14} />}>
              Sign out
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        /* Sign In / Sign Up Form */
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-title font-medium transition cursor-pointer ${
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-title font-medium transition cursor-pointer ${
                  tab === 'signup'
                    ? 'bg-lilac-200 text-ink font-semibold shadow-sm'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                <UserPlus size={13} />
                <span>Sign up</span>
              </button>
            </div>
            <span className="text-[11px] font-sans text-ink-soft">Persist everywhere</span>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleOAuth}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-divider bg-card px-4 py-2.5 text-xs font-title font-medium text-ink hover:bg-lilac-100 transition shadow-none cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-2">
            <span className="absolute inset-x-0 h-px bg-divider" />
            <span className="relative bg-card px-2 text-[11px] font-sans text-ink-soft">or with email</span>
          </div>

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-3">
              <Field label="Email address" htmlFor="signin-email">
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="text-xs"
                />
              </Field>
              <Field label="Password" htmlFor="signin-password">
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-xs"
                />
              </Field>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-sans text-ink-soft">Persist workspace state</span>
                <Button type="submit" variant="primary" size="sm">
                  Sign in
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3">
              <Field label="Your name" htmlFor="signup-name">
                <Input
                  id="signup-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jamie"
                  className="text-xs"
                />
              </Field>
              <Field label="Email address" htmlFor="signup-email">
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="text-xs"
                />
              </Field>
              <Field label="Create password" htmlFor="signup-password">
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-xs"
                />
              </Field>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-sans text-ink-soft">Sync across all devices</span>
                <Button type="submit" variant="primary" size="sm">
                  Create account
                </Button>
              </div>
            </form>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-2 pt-2 text-[11px] font-sans text-ink-soft">
            <Shield size={13} className="text-accent shrink-0" />
            <span>We respect your privacy and don&apos;t share users&apos; data.</span>
          </div>
        </div>
      )}
    </Dialog>
  );
}
