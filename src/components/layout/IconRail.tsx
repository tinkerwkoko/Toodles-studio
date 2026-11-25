import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Cat } from '../Cat';
import { NAV_ITEMS } from '../../lib/nav';
import { cx } from '../../lib/cx';
import { useUi } from '../../store/useUi';

/** Slim icon rail for tablets (md → lg), so the phone bar never stretches. */
export function IconRail() {
  const { openQuickCreate } = useUi();

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-y-0 left-0 z-30 hidden w-19 flex-col items-center gap-1 border-r border-divider bg-sidebar py-4 md:flex lg:hidden"
    >
      <span className="mb-2">
        <Cat pose="sleepy" size={38} animated={false} title="Toodles" />
      </span>

      <button
        type="button"
        onClick={openQuickCreate}
        aria-label="Create something"
        className="mb-2 grid h-11 w-11 place-items-center rounded-[4px] bg-lilac-300 text-primary-ink transition hover:bg-lilac-400 active:scale-95"
      >
        <Plus size={20} strokeWidth={2.3} aria-hidden="true" />
      </button>

      <ul className="flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <li key={item.to} className="w-full px-2">
            <NavLink
              to={item.to}
              end={item.to === '/'}
              title={item.label}
              className={({ isActive }) =>
                cx(
                  'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[4px] text-[0.62rem] font-medium transition',
                  isActive
                    ? 'bg-lilac-300 text-primary-ink'
                    : 'text-ink-soft hover:bg-lilac-100 hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    aria-hidden="true"
                    className={isActive ? 'text-primary-ink' : ''}
                  />
                  <span className="truncate">{item.shortLabel}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
