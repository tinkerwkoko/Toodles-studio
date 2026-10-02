import { useRef, useState } from 'react';
import { Bell, Check, Download, Monitor, Moon, Shield, Sun, Trash2, Upload, User } from 'lucide-react';
import { Cat } from '../components/Cat';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { AccountDialog } from '../components/auth/AccountDialog';
import { useNotificationPermission } from '../hooks/useNotificationPermission';
import { useToodles } from '../store/useToodles';
import { useUi } from '../store/useUi';
import type { ThemeMode } from '../types';

type ImportState = { tone: 'success' | 'error'; message: string } | null;

/** `/settings`: account, profile nickname, theme, data export, import, erase, and reminder status. */
export function SettingsPage() {
  const { data, actions, storageBlocked } = useToodles();
  const { pushToast } = useUi();
  const { permission, request } = useNotificationPermission();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [confirmErase, setConfirmErase] = useState(false);
  const [message, setMessage] = useState<ImportState>(null);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);

  const account = data.settings.account;
  const [nicknameInput, setNicknameInput] = useState(account?.name || data.settings.displayName || '');
  const [nicknameSaved, setNicknameSaved] = useState(false);

  function handleSaveNickname() {
    const trimmed = nicknameInput.trim();
    actions.updateSettings({ displayName: trimmed });
    if (account) {
      actions.updateSettings({
        account: {
          ...account,
          name: trimmed,
        },
      });
    }
    setNicknameSaved(true);
    setTimeout(() => setNicknameSaved(false), 2000);
    pushToast('Nickname saved ✨', 'success');
  }

  function handleThemeChange(theme: ThemeMode) {
    actions.updateSettings({ theme });
    pushToast(`Theme updated to ${theme}`);
  }

  const counts = [
    `${data.tasks.length} task${data.tasks.length === 1 ? '' : 's'}`,
    `${data.projects.length} project${data.projects.length === 1 ? '' : 's'}`,
    `${data.diaryEntries.length} diary entr${data.diaryEntries.length === 1 ? 'y' : 'ies'}`,
    `${data.moods.length} mood log${data.moods.length === 1 ? '' : 's'}`,
    `${data.habits.length} habit${data.habits.length === 1 ? '' : 's'}`,
  ];

  function download(): void {
    const blob = new Blob([actions.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `toodles-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    pushToast('Backup downloaded', 'success');
  }

  async function importFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      const result = actions.importData(text);
      setMessage({ tone: 'success', message: `Imported ${result.tasks} tasks.` });
      pushToast('Backup restored', 'success');
    } catch (error) {
      setMessage({
        tone: 'error',
        message: error instanceof Error ? error.message : 'That file could not be read.',
      });
    }
  }

  return (
    <div className="pb-4 space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Customize your workspace, account profile, appearance, reminders, and data."
        pose="curious"
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {/* Account & Profile Card */}
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={18} className="text-accent" />
              <h2 className="text-lg">Account Profile</h2>
            </div>
            {account && (
              <span className="rounded-full bg-mint-100 px-2.5 py-0.5 text-xs font-title font-medium text-mint-700 flex items-center gap-1">
                <span>Active</span>
              </span>
            )}
          </div>

          {account ? (
            <div className="space-y-3">
              <p className="text-sm text-ink-soft">
                Signed in as <strong className="text-ink">{account.name}</strong> ({account.email}). Your personal workspace is active and securely saved.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setAccountDialogOpen(true)}
                  icon={<User size={14} />}
                >
                  Manage account
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-ink-soft">
                Sign in or create an account for a personalized experience, or continue using Toodles locally as a guest.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setAccountDialogOpen(true)}
                  icon={<User size={14} />}
                >
                  Sign in or create account
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Profile & Nickname */}
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2">
            <User size={18} className="text-accent" />
            <h2 className="text-lg">Your nickname</h2>
          </div>
          <p className="text-sm text-ink-soft">
            How Toodles greets you on your dashboard, header, and workspace.
          </p>

          <div className="flex items-center gap-2">
            <Input
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="e.g. Cozy Friend, Jamie..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveNickname();
                }
              }}
            />
            <Button
              onClick={handleSaveNickname}
              variant={nicknameSaved ? 'primary' : 'soft'}
              icon={nicknameSaved ? <Check size={16} /> : undefined}
            >
              {nicknameSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </Card>

        {/* Theme & Appearance */}
        <Card padding="lg" className="space-y-4">
          <h2 className="text-lg">Appearance</h2>
          <p className="text-sm text-ink-soft">
            Choose your mood: candlelit dark mode, soft daytime cream, or follow your system.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleThemeChange('system')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-xs font-title transition cursor-pointer ${
                data.settings.theme === 'system'
                  ? 'border-accent bg-lilac-200 text-ink shadow-sm'
                  : 'border-lilac-200 bg-cream text-ink-soft hover:bg-lilac-50'
              }`}
            >
              <Monitor size={18} />
              <span>System</span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-xs font-title transition cursor-pointer ${
                data.settings.theme === 'light'
                  ? 'border-accent bg-lilac-200 text-ink shadow-sm'
                  : 'border-lilac-200 bg-cream text-ink-soft hover:bg-lilac-50'
              }`}
            >
              <Sun size={18} />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-xs font-title transition cursor-pointer ${
                data.settings.theme === 'dark'
                  ? 'border-accent bg-lilac-200 text-ink shadow-sm'
                  : 'border-lilac-200 bg-cream text-ink-soft hover:bg-lilac-50'
              }`}
            >
              <Moon size={18} />
              <span>Dark</span>
            </button>
          </div>
        </Card>

        {/* Reminders */}
        <Card padding="lg" className="space-y-3">
          <h2 className="text-lg">Reminders</h2>
          <p className="text-sm text-ink-soft">
            Receive gentle notifications and reminders when tasks are scheduled.
          </p>
          <p className="text-sm font-bold text-ink">Status: {permissionLabel(permission)}</p>
          {permission !== 'granted' && permission !== 'unsupported' && (
            <Button
              variant="soft"
              onClick={() => {
                void request().then((result) => {
                  pushToast(
                    result === 'granted' ? 'Reminders are on 🔔' : 'Reminders stay off',
                    result === 'granted' ? 'success' : 'default',
                  );
                });
              }}
              icon={<Bell size={17} aria-hidden="true" />}
            >
              Allow notifications
            </Button>
          )}
        </Card>

        {/* Data Management */}
        <Card padding="lg" className="space-y-3">
          <h2 className="text-lg">Workspace data</h2>
          <p className="text-sm text-ink-soft">{counts.join(' · ')}</p>
          {storageBlocked && (
            <p className="rounded-2xl bg-rose-100 px-3 py-2 text-sm text-ink">
              Storage permissions are currently restricted.
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={download} icon={<Download size={17} aria-hidden="true" />}>
              Export as JSON
            </Button>
            <Button
              variant="soft"
              onClick={() => fileInput.current?.click()}
              icon={<Upload size={17} aria-hidden="true" />}
            >
              Import a backup
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              aria-label="Choose a Toodles backup file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importFile(file);
                event.target.value = '';
              }}
            />
          </div>

          {message && (
            <p
              role="status"
              className={
                message.tone === 'success'
                  ? 'rounded-2xl bg-mint-100 px-3 py-2 text-sm text-ink'
                  : 'rounded-2xl bg-rose-100 px-3 py-2 text-sm text-ink'
              }
            >
              {message.message}
            </p>
          )}

          <p className="text-xs text-ink-soft">
            Importing updates your current workspace, so export a backup first if you want to keep
            it.
          </p>
        </Card>

        {/* Privacy Card */}
        <Card padding="lg" className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-accent" />
            <h2 className="text-lg">Privacy policy</h2>
          </div>
          <div className="flex items-start gap-4">
            <Cat pose="curious" size={64} animated={false} className="shrink-0" />
            <p className="text-sm text-ink-soft leading-relaxed">
              We believe your thoughts, tasks, and journals are strictly your own. We do not share users&apos; data,
              sell your information, or track your personal activity. Your workspace belongs completely to you.
            </p>
          </div>
        </Card>
      </div>

      {/* Erase All Data */}
      <Card padding="lg" className="space-y-3 border-rose-200">
        <h2 className="text-lg text-ink">Reset workspace</h2>
        <p className="text-sm text-ink-soft">
          This permanently resets your workspace and removes all tasks, projects, diary entries, moods, and habits.
          It cannot be undone.
        </p>
        <Button
          variant="danger"
          onClick={() => setConfirmErase(true)}
          icon={<Trash2 size={17} aria-hidden="true" />}
        >
          Erase all data
        </Button>
      </Card>

      <ConfirmDialog
        open={confirmErase}
        title="Reset all workspace data?"
        tone="danger"
        confirmLabel="Erase everything"
        body={
          <p>
            You are about to delete {counts.join(', ')}. Export a backup first if
            you might want any of it later.
          </p>
        }
        onCancel={() => setConfirmErase(false)}
        onConfirm={() => {
          actions.eraseAll();
          setConfirmErase(false);
          setMessage(null);
          pushToast('All workspace data erased');
        }}
      />

      <AccountDialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} />
    </div>
  );
}

function permissionLabel(permission: string): string {
  switch (permission) {
    case 'granted':
      return 'allowed';
    case 'denied':
      return 'blocked in this browser';
    case 'unsupported':
      return 'not supported here';
    default:
      return 'not asked yet';
  }
}
