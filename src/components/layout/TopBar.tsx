import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PanelLeft, PanelLeftClose, Search, User, X } from 'lucide-react';
import { Cat } from '../Cat';
import { useUi } from '../../store/useUi';
import { useToodles } from '../../store/useToodles';
import { AccountDialog } from '../auth/AccountDialog';

export function TopBar() {
  const { searchTerm, setSearchTerm } = useUi();
  const { data, actions } = useToodles();
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

  const account = data.settings.account;
  const nickname = account?.name || data.settings.displayName.trim() || 'Friend';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-divider bg-cream-banner/95 backdrop-blur">
      <div className="flex h-[56px] w-full items-center justify-between">
        {/* Far left: Cat logo + writing with vertical divider exactly matching sidebar on desktop */}
        <div
          className={`flex h-full shrink-0 items-center justify-between border-divider px-3 md:px-4 bg-sidebar transition-all duration-200 ${
            sidebarOpen ? 'w-auto md:w-56 md:border-r' : 'w-auto md:w-auto md:border-r-0'
          }`}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 text-ink hover:opacity-90 transition group min-w-0"
            title="Toodles - Go to Dashboard"
          >
            <Cat pose="happy" size={32} animated={false} />
            <div className="flex flex-col min-w-0">
              <span className="font-display text-[20px] font-bold leading-tight tracking-wide text-ink">
                Toodles
              </span>
              <span className="hidden sm:block font-sans text-[11px] text-ink-soft leading-none">
                Small tasks, big calm.
              </span>
            </div>
          </Link>

          {/* Desktop/Tablet sidebar collapse toggle */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="hidden md:grid h-7 w-7 place-items-center rounded-lg text-ink-soft hover:bg-lilac-200/60 hover:text-ink transition ml-1 cursor-pointer shrink-0"
          >
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
          </button>
        </div>

        {/* Center Search bar: flexible, perfectly centered in available space, never overlaps sidebar */}
        <div className="flex-1 flex justify-center items-center min-w-0 px-2 sm:px-4">
          <div className="relative w-full max-w-[190px] sm:max-w-xs md:max-w-sm lg:max-w-md">
            <Search
              size={15}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search tasks, notes and tags"
              aria-label="Search everything"
              className="h-[36px] w-full rounded-full border border-lilac-200 bg-cream pr-8 pl-9 text-xs sm:text-sm text-ink placeholder:text-ink-soft/70 transition focus:border-accent focus:outline-none"
            />
            {searching && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-soft hover:text-ink cursor-pointer"
              >
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Right zone: User Profile / Sign In button */}
        <div className="flex items-center gap-2 px-3 md:px-5 shrink-0">
          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            title={account ? `Account: ${account.name}` : 'Sign in / Account profile'}
            className="inline-flex items-center gap-1.5 rounded-full border border-lilac-200 bg-cream px-3 py-1.5 text-xs font-title font-medium text-ink hover:bg-lilac-100 transition shadow-none shrink-0 cursor-pointer"
          >
            <User size={13} className="text-accent shrink-0" aria-hidden="true" />
            <span className="truncate max-w-[85px] sm:max-w-[120px]">
              {account ? nickname : 'Sign in'}
            </span>
          </button>
        </div>
      </div>

      <AccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} />
    </header>
  );
}
