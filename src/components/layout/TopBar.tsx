import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PanelLeft, PanelLeftClose, Search, User, X } from 'lucide-react';
import { Cat } from '../Cat';
import { useUi } from '../../store/useUi';
import { useToodles } from '../../store/useToodles';
import { AccountDialog } from '../auth/AccountDialog';

export function TopBar() {
  const { searchTerm, setSearchTerm } = useUi();
  const { data, actions, isCloudConnected } = useToodles();
  const navigate = useNavigate();
  const location = useLocation();

  const [accountOpen, setAccountOpen] = useState(false);

  const searching = searchTerm.trim().length > 0;
  const sidebarOpen = data.settings.sidebarOpen ?? true;

  function updateSearch(value: string): void {
    setSearchTerm(value);
    if (value.trim().length > 0 && location.pathname !== '/tasks') {
      navigate('/tasks');
    }
  }

  function toggleSidebar(): void {
    actions.updateSettings({ sidebarOpen: !sidebarOpen });
  }

  const account = isCloudConnected ? data.settings.account : null;
  const nickname = account?.name || data.settings.displayName.trim() || 'Friend';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-divider/75 bg-cream/90 backdrop-blur-md">
      <div className="flex h-[58px] w-full items-center justify-between">
        {/* Far left: Botanical wordmark matching sidebar width on desktop */}
        <div
          className={`flex h-full shrink-0 items-center justify-between border-divider/70 bg-sidebar/85 px-3.5 transition-all duration-200 md:px-5 ${
            sidebarOpen ? 'w-auto md:w-56 md:border-r' : 'w-auto md:w-auto md:border-r-0'
          }`}
        >
          <Link
            to="/"
            className="group flex min-w-0 items-center gap-2.5 text-ink transition hover:opacity-85"
            title="Toodles - Go to Dashboard"
          >
            <Cat pose="happy" size={30} animated={false} />
            <div className="flex min-w-0 flex-col">
              <span className="font-display text-[20px] leading-none tracking-tight text-ink">
                Toodles
              </span>
              <span className="mt-0.5 hidden font-hand text-[16px] leading-none text-accent sm:block">
                Small tasks, big calm.
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="ml-1 hidden h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-[6px] text-ink-soft transition hover:bg-cream/80 hover:text-ink md:grid"
          >
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
          </button>
        </div>

        {/* Center Search bar: integrated soft botanical input */}
        <div className="flex min-w-0 flex-1 items-center justify-center px-3 sm:px-5">
          <div className="relative w-full max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md">
            <Search
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-faint"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search tasks, notes and tags"
              aria-label="Search everything"
              className="h-[34px] w-full rounded-[7px] bg-paper-2/65 pr-8 pl-8.5 font-typewriter text-xs text-ink placeholder:text-text-faint transition focus:bg-cream focus:outline-none focus:ring-1 focus:ring-forest/35 sm:text-[13px]"
            />
            {searching && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-1.5 grid h-6 w-6 -translate-y-1/2 cursor-pointer place-items-center rounded-[5px] text-ink-soft hover:text-ink"
              >
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Right zone: Quiet account control */}
        <div className="flex shrink-0 items-center gap-2 px-3 md:px-5">
          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            title={account ? `Synced as ${account.name}` : 'Sign in with Google to sync'}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-[7px] bg-paper-2/65 px-2.5 py-1.5 font-typewriter text-xs text-ink transition hover:bg-paper-2 sm:px-3"
          >
            {account?.avatar ? (
              <img
                src={account.avatar}
                alt=""
                referrerPolicy="no-referrer"
                className="h-4 w-4 shrink-0 rounded-full object-cover"
              />
            ) : (
              <User size={13} className="shrink-0 text-forest" aria-hidden="true" />
            )}
            <span className="max-w-[85px] truncate sm:max-w-[120px]">
              {account ? nickname : 'Sign in'}
            </span>
          </button>
        </div>
      </div>

      <AccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} />
    </header>
  );
}
