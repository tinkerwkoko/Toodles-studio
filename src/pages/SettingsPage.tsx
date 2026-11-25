import { useRef, useState } from 'react';
import {
  Bell,
  Check,
  Cloud,
  Download,
  Monitor,
  Moon,
  Shield,
  Sun,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { Cat } from '../components/Cat';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { AccountDialog } from '../components/auth/AccountDialog';
import { useNotificationPermission } from '../hooks/useNotificationPermission';
import { cx } from '../lib/cx';
import { useToodles } from '../store/useToodles';
import { useUi } from '../store/useUi';
import type { ThemeMode } from '../types';

type ImportState = { tone: 'success' | 'error'; message: string } | null;

/** `/settings`: account, profile nickname, theme, data export, import, erase, and reminder status. */
export function SettingsPage() {
  const { data, actions, isCloudConnected, cloudSyncing, storageBlocked } = useToodles();
  const { pushToast } = useUi();
  const { permission, request } = useNotificationPermission();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [confirmErase, setConfirmErase] = useState(false);
  const [message, setMessage] = useState<ImportState>(null);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);

  const account = isCloudConnected ? data.settings.account : null;
  const [nicknameInput, setNicknameInput] = useState(
    account?.name || data.settings.displayName || '',
  );
  const [nicknameSaved, setNicknameSaved] = useState(false);

  function handleSaveNickname() {
    const trimmed = nicknameInput.trim();
    actions.updateSettings({
      displayName: trimmed,
      ...(account ? { account: { ...account, name: trimmed || account.name } } : {}),
    });
    setNicknameSaved(true);
    setTimeout(() => setNicknameSaved(false), 2000);
    pushToast('Nickname saved', 'success');
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
    <div className="mx-auto max-w-4xl space-y-6 pb-6">
      <PageHeader
        title="Settings"
        subtitle="Customize your workspace, Google sync, reading light, reminders, and archive."
        pose="curious"
      />

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        {/* Account & Cloud Sync */}
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-2.5">
            <div className="flex items-center gap-2">
              <Cloud size={17} className="text-lilac-700" aria-hidden="true" />
              <h2 className="font-display text-xl font-semibold text-ink">
                Account &amp; Cloud Sync
              </h2>
            </div>
            {account && (
              <span className="inline-flex items-center gap-1 rounded-[3px] border border-mint-200 bg-mint-100 px-2 py-0.5 text-[11px] font-medium text-mint-700">
                <Cloud size={11} aria-hidden="true" />
                <span>{cloudSyncing ? 'Syncing…' : 'Synced'}</span>
              </span>
            )}
          </div>

          {account ? (
            <div className="space-y-3">
              <p className="text-sm text-ink-soft">
                Signed in with Google as <strong className="text-ink">{account.name}</strong> (
                {account.email}).
              </p>
              <div className="space-y-1 rounded-[4px] border border-lilac-200/80 bg-paper-2/65 p-3 text-xs text-ink-soft">
                <p className="font-semibold text-ink">Real-time cross-device sync active</p>
                <p className="leading-relaxed">
                  Your tasks, projects, kanban boards, diary pages, moods, habits, and focus
                  sessions persist in your private cloud database and stay in sync automatically
                  across all your devices.
                </p>
              </div>
              <div className="pt-1">
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
                You are currently using guest mode on this device only. Sign in with Google to sync
                your workspace automatically across phone, tablet, and desktop.
              </p>
              <div className="pt-1">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setAccountDialogOpen(true)}
                  icon={<Cloud size={14} />}
                >
                  Sign in with Google
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Profile & Nickname */}
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-divider pb-2.5">
            <User size={17} className="text-lilac-700" aria-hidden="true" />
            <h2 className="font-display text-xl font-semibold text-ink">Your nickname</h2>
          </div>
          <p className="text-sm text-ink-soft">
            How Toodles addresses you on your desk header and opening page.
          </p>

          <div className="flex items-center gap-2">
            <Input
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="e.g. Cozy Cat"
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
              icon={nicknameSaved ? <Check size={15} /> : undefined}
            >
              {nicknameSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </Card>

        {/* Theme & Appearance */}
        <Card padding="lg" className="space-y-4">
          <div className="border-b border-divider pb-2.5">
            <h2 className="font-display text-xl font-semibold text-ink">Reading light</h2>
          </div>
          <p className="text-sm text-ink-soft">
            Choose warm daylight parchment, an old library at night, or follow your system.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ['system', 'System', Monitor],
                ['light', 'Parchment', Sun],
                ['dark', 'Night Library', Moon],
              ] as const
            ).map(([value, label, Icon]) => {
              const active = data.settings.theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleThemeChange(value)}
                  className={cx(
                    'flex cursor-pointer flex-col items-center gap-1.5 rounded-[4px] border p-3 text-xs font-medium transition',
                    active
                      ? 'border-lilac-300 bg-lilac-300 text-primary-ink'
                      : 'border-lilac-200 bg-cream text-ink-soft hover:bg-lilac-100/60 hover:text-ink',
                  )}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Reminders */}
        <Card padding="lg" className="space-y-3">
          <div className="border-b border-divider pb-2.5">
            <h2 className="font-display text-xl font-semibold text-ink">Reminders</h2>
          </div>
          <p className="text-sm text-ink-soft">
            Receive gentle notifications and reminders when tasks are scheduled.
          </p>
          <p className="text-sm font-medium text-ink">
            Status: <span className="italic text-ink-soft">{permissionLabel(permission)}</span>
          </p>
          {permission !== 'granted' && permission !== 'unsupported' && (
            <Button
              variant="soft"
              onClick={() => {
                void request().then((result) => {
                  pushToast(
                    result === 'granted' ? 'Reminders are on' : 'Reminders stay off',
                    result === 'granted' ? 'success' : 'default',
                  );
                });
              }}
              icon={<Bell size={15} aria-hidden="true" />}
            >
              Allow notifications
            </Button>
          )}
        </Card>

        {/* Data Management */}
        <Card padding="lg" className="space-y-3">
          <div className="border-b border-divider pb-2.5">
            <h2 className="font-display text-xl font-semibold text-ink">Workspace archive</h2>
          </div>
          <p className="text-xs tabular-nums text-ink-soft">{counts.join(' · ')}</p>
          {storageBlocked && (
            <p className="rounded-[4px] border border-rose-200 bg-rose-100 px-3 py-2 text-sm text-rose-700">
              Storage permissions are currently restricted.
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={download} icon={<Download size={15} aria-hidden="true" />}>
              Export as JSON
            </Button>
            <Button
              variant="soft"
              onClick={() => fileInput.current?.click()}
              icon={<Upload size={15} aria-hidden="true" />}
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
                  ? 'rounded-[4px] border border-mint-200 bg-mint-100 px-3 py-2 text-sm text-mint-700'
                  : 'rounded-[4px] border border-rose-200 bg-rose-100 px-3 py-2 text-sm text-rose-700'
              }
            >
              {message.message}
            </p>
          )}

          <p className="text-xs italic text-ink-soft">
            Importing updates your current workspace, so export a backup first if you want to keep
            it.
          </p>
        </Card>

        {/* Privacy Note */}
        <Card variant="aged" padding="lg" className="space-y-3">
          <div className="flex items-center gap-2 border-b border-divider pb-2.5">
            <Shield size={17} className="text-lilac-700" aria-hidden="true" />
            <h2 className="font-display text-xl font-semibold text-ink">Privacy pledge</h2>
          </div>
          <div className="flex items-start gap-4">
            <Cat pose="curious" size={60} animated={false} className="shrink-0" />
            <p className="text-sm leading-relaxed text-ink-soft">
              We believe your thoughts, tasks, and journals are strictly your own. We do not share
              users&apos; data, sell your information, or track your personal activity. Your
              workspace belongs completely to you.
            </p>
          </div>
        </Card>
      </div>

      {/* Reset Workspace */}
      <Card padding="lg" className="space-y-3 border-rose-300/70">
        <h2 className="font-display text-xl font-semibold text-ink">Reset workspace</h2>
        <p className="text-sm text-ink-soft">
          This permanently resets your workspace and removes all tasks, projects, diary entries,
          moods, and habits. It cannot be undone.
        </p>
        <Button
          variant="danger"
          onClick={() => setConfirmErase(true)}
          icon={<Trash2 size={15} aria-hidden="true" />}
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
            You are about to delete {counts.join(', ')}. Export a backup first if you might want any
            of it later.
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
