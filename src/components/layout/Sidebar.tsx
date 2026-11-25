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
        'hidden md:flex flex-col justify-between border-r border-divider bg-sidebar transition-all duration-250 ease-in-out overflow-hidden sticky top-[58px] h-[calc(100dvh-58px)] self-start shrink-0',
        isOpen ? 'w-56 opacity-100 py-5 px-3.5' : 'w-0 opacity-0 p-0 border-r-0 pointer-events-none',
      )}
    >
      {/* Library catalogue table-of-contents */}
      <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto pr-1">
        <p className="px-3 pb-2 font-hand text-base text-text-faint select-none">
          Contents
        </p>
        {SIDEBAR_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cx(
                'relative flex h-[38px] items-center gap-3 rounded-[4px] px-3 font-sans text-[14px] transition duration-150 whitespace-nowrap',
                isActive
                  ? 'bg-cream text-ink font-semibold shadow-[0_1px_0_var(--border)]'
                  : 'text-ink-soft hover:bg-paper-2/70 hover:text-ink',
              )
            }
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-[2px] bg-lilac-300"
                    />
                  )}
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2 : 1.7}
                    aria-hidden="true"
                    className={isActive ? 'text-accent' : 'text-ink-soft'}
                  />
                  <span>{item.label}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      {/* Theme selector: System / Parchment Light / Library Night */}
      <div className="mt-4 pt-3.5 border-t border-divider">
        <p className="px-1 pb-2 text-[11px] font-sans text-text-faint tracking-[0.06em] uppercase">
          Reading light
        </p>
        <div className="grid grid-cols-3 gap-1 rounded-[4px] border border-divider bg-paper-2/70 p-1">
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            aria-label="System theme"
            className={cx(
              'flex h-7 items-center justify-center rounded-[3px] text-xs font-sans transition cursor-pointer',
              data.settings.theme === 'system'
                ? 'bg-cream text-accent font-semibold shadow-[0_1px_2px_rgba(69,56,47,0.12)]'
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
              'flex h-7 items-center justify-center rounded-[3px] text-xs font-sans transition cursor-pointer',
              data.settings.theme === 'light'
                ? 'bg-cream text-accent font-semibold shadow-[0_1px_2px_rgba(69,56,47,0.12)]'
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
              'flex h-7 items-center justify-center rounded-[3px] text-xs font-sans transition cursor-pointer',
              data.settings.theme === 'dark'
                ? 'bg-cream text-accent font-semibold shadow-[0_1px_2px_rgba(69,56,47,0.12)]'
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
