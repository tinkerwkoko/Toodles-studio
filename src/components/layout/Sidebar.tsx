import { NavLink } from 'react-router-dom';
import { Monitor, Moon, Sun } from 'lucide-react';
import { SIDEBAR_ITEMS } from '../../lib/nav';
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
        'hidden md:flex flex-col justify-between border-r border-divider bg-sidebar transition-all duration-250 ease-in-out overflow-hidden sticky top-[56px] h-[calc(100dvh-56px)] self-start shrink-0',
        isOpen ? 'w-56 opacity-100 py-4 px-3' : 'w-0 opacity-0 p-0 border-r-0 pointer-events-none',
      )}
    >
      {/* Navigation items in Chewy font */}
      <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto pr-1">
        {SIDEBAR_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cx(
                'flex h-[36px] items-center gap-2.5 rounded-2xl px-3 font-display text-[16px] tracking-wide transition duration-150 whitespace-nowrap',
                isActive
                  ? 'bg-lilac-200 text-ink font-bold'
                  : 'text-ink-soft hover:bg-lilac-100 hover:text-ink',
              )
            }
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <Icon
                    size={17}
                    aria-hidden="true"
                    className={isActive ? 'text-ink' : 'text-ink-soft'}
                  />
                  <span>{item.label}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer: only theme selector as requested */}
      <div className="mt-4 pt-3 border-t border-divider">
        <div className="grid grid-cols-3 gap-1 rounded-2xl border border-lilac-200 bg-cream/70 p-1">
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            aria-label="System theme"
            className={cx(
              'flex h-7 items-center justify-center gap-1 rounded-xl text-xs font-title transition cursor-pointer',
              data.settings.theme === 'system'
                ? 'bg-lilac-200 text-ink font-semibold shadow-none'
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
              'flex h-7 items-center justify-center gap-1 rounded-xl text-xs font-title transition cursor-pointer',
              data.settings.theme === 'light'
                ? 'bg-lilac-200 text-ink font-semibold shadow-none'
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
              'flex h-7 items-center justify-center gap-1 rounded-xl text-xs font-title transition cursor-pointer',
              data.settings.theme === 'dark'
                ? 'bg-lilac-200 text-ink font-semibold shadow-none'
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
