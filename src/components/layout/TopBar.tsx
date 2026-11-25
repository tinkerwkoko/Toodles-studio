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
    <header className="sticky top-0 z-40 w-full border-b border-lilac-200/80 bg-cream/95 backdrop-blur-sm">
      <div className="flex h-[58px] w-full items-center justify-between">
        {/* Far left: Bookplate wordmark matching sidebar width on desktop */}
        <div
          className={`flex h-full shrink-0 items-center justify-between border-divider px-3.5 md:px-5 bg-sidebar/95 transition-all duration-200 ${
            sidebarOpen ? 'w-auto md:w-56 md:border-r' : 'w-auto md:w-auto md:border-r-0'
          }`}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 text-ink hover:opacity-85 transition group min-w-0"
            title="Toodles - Go to Dashboard"
          >
            <Cat pose="happy" size={30} animated={false} />
            <div className="flex flex-col min-w-0">
              <span className="font-display text-[22px] font-semibold leading-none tracking-tight text-ink">
                Toodles
              </span>
              <span className="hidden sm:block font-hand text-[14px] text-ink-soft leading-none mt-0.5">
                Small tasks, big calm.
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="hidden md:grid h-7 w-7 place-items-center rounded-[4px] text-ink-soft hover:bg-paper-2 hover:text-ink transition ml-1 cursor-pointer shrink-0"
          >
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
          </button>
        </div>

        {/* Center Search bar: understated archival search rule */}
        <div className="flex-1 flex justify-center items-center min-w-0 px-3 sm:px-5">
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
              className="h-[34px] w-full rounded-[4px] border border-divider bg-lilac-50/75 pr-8 pl-8.5 text-xs sm:text-sm font-sans text-ink placeholder:text-text-faint placeholder:italic transition focus:border-accent focus:bg-cream focus:outline-none"
            />
            {searching && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-1.5 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-[3px] text-ink-soft hover:text-ink cursor-pointer"
              >
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Right zone: Quiet reader/account trigger */}
        <div className="flex items-center gap-2 px-3 md:px-5 shrink-0">
          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            title={account ? `Synced as ${account.name}` : 'Sign in with Google to sync'}
            className="inline-flex items-center gap-2 rounded-[4px] border border-divider bg-lilac-50/70 px-2.5 sm:px-3 py-1.5 text-xs font-sans font-medium text-ink hover:border-dusty-rose hover:bg-paper-2/70 transition shrink-0 cursor-pointer"
          >
            {account?.avatar ? (
              <img
                src={account.avatar}
                alt=""
                referrerPolicy="no-referrer"
                className="h-4 w-4 rounded-full object-cover shrink-0 border border-divider"
              />
            ) : (
              <User size={13} className="text-accent shrink-0" aria-hidden="true" />
            )}
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
