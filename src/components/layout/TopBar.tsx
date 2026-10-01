import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Cloud, Search, User, X } from 'lucide-react';
import { Cat } from '../Cat';
import { useUi } from '../../store/useUi';
import { useToodles } from '../../store/useToodles';
import { AccountDialog } from '../auth/AccountDialog';

export function TopBar() {
  const { searchTerm, setSearchTerm } = useUi();
  const { data } = useToodles();
  const navigate = useNavigate();
  const location = useLocation();

  const [accountOpen, setAccountOpen] = useState(false);

  const searching = searchTerm.trim().length > 0;

  function updateSearch(value: string): void {
    setSearchTerm(value);
    if (value.trim().length > 0 && location.pathname !== '/tasks') {
      navigate('/tasks');
    }
  }

  const account = data.settings.account;
  const nickname = account?.name || data.settings.displayName.trim() || 'Friend';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-divider bg-cream-banner/90 backdrop-blur">
      <div className="relative flex h-[56px] w-full items-center justify-between">
        {/* Far left: Cat logo + writing with vertical divider exactly matching sidebar width on desktop */}
        <div className="flex h-full w-auto md:w-56 shrink-0 items-center border-r-0 md:border-r border-divider px-3 md:px-4 bg-sidebar">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-ink hover:opacity-90 transition group"
            title="Toodles - Go to Dashboard"
          >
            <Cat pose="happy" size={36} animated={false} />
            <div className="flex flex-col">
              <span className="font-display text-[22px] font-bold leading-tight tracking-wide text-ink">
                Toodles
              </span>
              <span className="hidden sm:block font-sans text-[11px] text-ink-soft leading-none">
                Small tasks, big calm.
              </span>
            </div>
          </Link>
        </div>

        {/* Dead-Center Search bar: perfectly centered across header width */}
        <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 w-full max-w-xs md:max-w-md pointer-events-auto px-2">
          <div className="relative w-full">
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

        {/* Right zone: mobile search toggle & User Profile / Sign In button */}
        <div className="flex items-center gap-2 px-3 md:px-6 ml-auto">
          {/* Mobile search bar if on small screen */}
          <div className="sm:hidden relative w-36">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search..."
              className="h-[32px] w-full rounded-full border border-lilac-200 bg-cream px-3 text-xs text-ink placeholder:text-ink-soft/70 focus:outline-none"
            />
          </div>

          {/* Account & Profile Badge */}
          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            title={account ? `Account: ${account.name} (Sync active)` : 'Sign in / Account profile'}
            className="inline-flex items-center gap-1.5 rounded-full border border-lilac-200 bg-cream px-3 py-1.5 text-xs font-title font-medium text-ink hover:bg-lilac-100 transition shadow-none shrink-0 cursor-pointer"
          >
            {account?.syncAcrossDevices ? (
              <Cloud size={13} className="text-accent shrink-0" aria-hidden="true" />
            ) : (
              <User size={13} className="text-accent shrink-0" aria-hidden="true" />
            )}
            <span className="truncate max-w-[100px] sm:max-w-[130px]">
              {account ? nickname : 'Sign in'}
            </span>
          </button>
        </div>
      </div>

      <AccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} />
    </header>
  );
}
