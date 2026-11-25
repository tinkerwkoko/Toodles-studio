import { NavLink } from 'react-router-dom';
import { Monitor, Moon, Sun } from 'lucide-react';
import { SIDEBAR_ITEMS } from '../../lib/nav';
import { FernSprig, LeafMark } from '../ui/BotanicalOrnaments';
import { cx } from '../../lib/cx';
import { useToodles } from '../../store/useToodles';
import type { ThemeMode } from '../../types';

export function Sidebar() {
  const { data, actions } = useToodles();
  const isOpen = data.settings.sidebarOpen ?? true;

  function handleThemeChange(theme: ThemeMode) {
    actions.updateSettings({ theme });
  }

  return (
    <aside
      aria-label="Sidebar navigation"
      className={cx(
        'relative hidden md:flex flex-col justify-between border-r border-divider/70 bg-sidebar/90 transition-all duration-250 ease-in-out overflow-hidden sticky top-[58px] h-[calc(100dvh-58px)] self-start shrink-0',
        isOpen
          ? 'w-56 opacity-100 py-5 px-3.5'
          : 'w-0 opacity-0 p-0 border-r-0 pointer-events-none',
      )}
    >
      {/* Subtle non-obstructive fern engraving in lower background */}
      <FernSprig className="absolute bottom-16 -right-4 h-24 w-32 text-fern/22" />

      {/* Navigation */}
      <nav aria-label="Main" className="relative z-10 flex-1 space-y-0.5 overflow-y-auto pr-1">
        {SIDEBAR_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cx(
                'relative flex h-[39px] items-center gap-3 rounded-[7px] px-3 font-sans text-[14px] transition duration-150 whitespace-nowrap',
                isActive
                  ? 'bg-cream/95 text-ink font-medium shadow-soft'
                  : 'text-ink-soft hover:bg-cream/50 hover:text-ink',
              )
            }
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2 : 1.65}
                    aria-hidden="true"
                    className={isActive ? 'text-forest' : 'text-ink-soft'}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {isActive && <LeafMark className="h-3.5 w-3.5 text-fern/80" />}
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      {/* Theme selector */}
      <div className="relative z-10 mt-4 border-t border-divider/70 pt-3.5">
        <p className="px-1 pb-2 font-typewriter text-[11px] text-text-faint">Appearance</p>
        <div className="grid grid-cols-3 gap-1 rounded-[7px] bg-cream/60 p-1">
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            aria-label="System theme"
            className={cx(
              'flex h-7 cursor-pointer items-center justify-center rounded-[5px] text-xs transition',
              data.settings.theme === 'system'
                ? 'bg-lilac-300 text-primary-ink shadow-soft'
                : 'text-ink-soft hover:text-ink',
            )}
            title="System theme"
          >
            <Monitor size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            aria-label="Light theme"
            className={cx(
              'flex h-7 cursor-pointer items-center justify-center rounded-[5px] text-xs transition',
              data.settings.theme === 'light'
                ? 'bg-lilac-300 text-primary-ink shadow-soft'
                : 'text-ink-soft hover:text-ink',
            )}
            title="Light theme"
          >
            <Sun size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            aria-label="Dark theme"
            className={cx(
              'flex h-7 cursor-pointer items-center justify-center rounded-[5px] text-xs transition',
              data.settings.theme === 'dark'
                ? 'bg-lilac-300 text-primary-ink shadow-soft'
                : 'text-ink-soft hover:text-ink',
            )}
            title="Dark theme"
          >
            <Moon size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
