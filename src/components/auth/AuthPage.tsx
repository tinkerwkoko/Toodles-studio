import { useState } from 'react';
import { LogIn, Shield, User, UserPlus } from 'lucide-react';
import { Cat } from '../Cat';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Field, Input } from '../ui/Field';
import { useToodles } from '../../store/useToodles';
import { useUi } from '../../store/useUi';
import { nowTimestamp } from '../../lib/date';
import type { UserAccount } from '../../types';

export interface AuthPageProps {
  onSuccess: () => void;
  onContinueAsGuest: () => void;
}

export function AuthPage({ onSuccess, onContinueAsGuest }: AuthPageProps) {
  const { data, actions } = useToodles();
  const { pushToast } = useUi();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const existingName = data.settings.displayName.trim();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      pushToast('Please enter your email');
      return;
    }

    // Preserve existing username if already set up
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
    onSuccess();
  }

  function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
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
    onSuccess();
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-lilac-50 text-ink">
      <div className="w-full max-w-md space-y-6 motion-safe:animate-fade-in">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Cat pose="wave" size={88} animated />
          <h1 className="font-display text-4xl text-ink tracking-wide">Toodles</h1>
          <p className="font-sans text-sm text-ink-soft">
            Small tasks, big calm. Welcome to your personal sanctuary.
          </p>
        </div>

        {/* Auth Card */}
        <Card padding="lg" className="border-lilac-200 shadow-soft space-y-5">
          {/* Mode Switcher */}
          <div className="flex rounded-full border border-divider bg-lilac-100/60 p-1">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-title font-medium transition cursor-pointer ${
                mode === 'signin'
                  ? 'bg-lilac-200 text-ink font-semibold shadow-sm'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              <LogIn size={13} />
              <span>Sign in</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-title font-medium transition cursor-pointer ${
                mode === 'signup'
                  ? 'bg-lilac-200 text-ink font-semibold shadow-sm'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              <UserPlus size={13} />
              <span>Create account</span>
            </button>
          </div>

          {/* Form */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <Field label="Email address" htmlFor="auth-signin-email">
                <Input
                  id="auth-signin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="text-sm"
                />
              </Field>

              <Field label="Password" htmlFor="auth-signin-pass">
                <Input
                  id="auth-signin-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-sm"
                />
              </Field>

              <Button type="submit" variant="primary" block size="md">
                Sign in to your sanctuary
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <Field label="Your name / nickname" htmlFor="auth-signup-name">
                <Input
                  id="auth-signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your nickname"
                  className="text-sm"
                />
              </Field>

              <Field label="Email address" htmlFor="auth-signup-email">
                <Input
                  id="auth-signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="text-sm"
                />
              </Field>

              <Field label="Password" htmlFor="auth-signup-pass">
                <Input
                  id="auth-signup-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-sm"
                />
              </Field>

              <Button type="submit" variant="primary" block size="md">
                Create your space
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-1">
            <span className="absolute inset-x-0 h-px bg-divider" />
            <span className="relative bg-card px-2 text-xs font-sans text-ink-soft">or</span>
          </div>

          {/* Continue as Guest */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="inline-flex items-center gap-1.5 text-xs font-title text-ink-soft hover:text-ink underline transition cursor-pointer"
            >
              <User size={13} />
              <span>Continue as guest for now</span>
            </button>
          </div>
        </Card>

        {/* Privacy Note */}
        <div className="flex flex-col items-center justify-center gap-1 text-xs font-sans text-ink-soft text-center px-4">
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-accent shrink-0" />
            <span>Private & local to this device. No trackers, cloud databases, or third-party servers.</span>
          </div>
          <span className="text-[11px] text-text-faint">Use Export & Backup in Settings to transfer data between devices anytime.</span>
        </div>
      </div>
    </div>
  );
}
