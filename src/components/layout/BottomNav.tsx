import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Plus } from 'lucide-react';
import { MOBILE_MORE_ITEMS, MOBILE_PRIMARY_ITEMS } from '../../lib/nav';
import { cx } from '../../lib/cx';
import { useUi } from '../../store/useUi';
import { Dialog } from '../ui/Dialog';

/**
 * Mobile navigation: My Nook, Tasks, raised burgundy center +, Projects, More.
 */
export function BottomNav() {
  const { openQuickCreate } = useUi();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const [nook, tasks, projects] = MOBILE_PRIMARY_ITEMS;

  function handleMoreSelect(to: string) {
    setMoreOpen(false);
    navigate(to);
  }

  const isMoreActive = MOBILE_MORE_ITEMS.some(
    (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
  );

  return (
    <>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-lilac-200 bg-cream/95 pb-safe backdrop-blur-sm md:hidden"
      >
        <ul className="mx-auto flex max-w-md items-center justify-between px-2 py-1">
          {nook && (
            <li className="flex-1">
              <NavLink
                to={nook.to}
                end
                className={({ isActive }) =>
                  cx(
                    'flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-[4px] text-[11px] font-sans transition',
                    isActive ? 'text-accent font-semibold' : 'text-ink-soft',
                  )
                }
              >
                {({ isActive }) => {
                  const Icon = nook.icon;
                  return (
                    <>
                      <Icon size={18} strokeWidth={isActive ? 2.1 : 1.7} />
                      <span>{nook.label}</span>
                    </>
                  );
                }}
              </NavLink>
            </li>
          )}

          {tasks && (
            <li className="flex-1">
              <NavLink
                to={tasks.to}
                className={({ isActive }) =>
                  cx(
                    'flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-[4px] text-[11px] font-sans transition',
                    isActive ? 'text-accent font-semibold' : 'text-ink-soft',
                  )
                }
              >
                {({ isActive }) => {
                  const Icon = tasks.icon;
                  return (
                    <>
                      <Icon size={18} strokeWidth={isActive ? 2.1 : 1.7} />
                      <span>{tasks.label}</span>
                    </>
                  );
                }}
              </NavLink>
            </li>
          )}

          {/* Raised wax-seal burgundy plus button */}
          <li className="relative flex flex-1 items-center justify-center">
            <button
              type="button"
              onClick={openQuickCreate}
              aria-label="Quick create"
              className="-mt-5 grid h-12 w-12 place-items-center rounded-full border-2 border-cream bg-lilac-300 text-primary-ink shadow-soft transition active:scale-95 hover:bg-lilac-400 cursor-pointer"
            >
              <Plus size={21} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </li>

          {projects && (
            <li className="flex-1">
              <NavLink
                to={projects.to}
                className={({ isActive }) =>
                  cx(
                    'flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-[4px] text-[11px] font-sans transition',
                    isActive ? 'text-accent font-semibold' : 'text-ink-soft',
                  )
                }
              >
                {({ isActive }) => {
                  const Icon = projects.icon;
                  return (
                    <>
                      <Icon size={18} strokeWidth={isActive ? 2.1 : 1.7} />
                      <span>{projects.label}</span>
                    </>
                  );
                }}
              </NavLink>
            </li>
          )}

          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-label="More pages"
              className={cx(
                'flex w-full min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-[4px] text-[11px] font-sans transition cursor-pointer',
                isMoreActive ? 'text-accent font-semibold' : 'text-ink-soft',
              )}
            >
              <MoreHorizontal size={18} strokeWidth={isMoreActive ? 2.1 : 1.7} />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      <Dialog
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="More sections"
        description="Explore the rest of your quiet space."
      >
        <div className="divide-y divide-divider">
          {MOBILE_MORE_ITEMS.map((item) => {
            const Icon = item.icon;
            const isItemActive =
              location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => handleMoreSelect(item.to)}
                className={cx(
                  'flex w-full items-center gap-3 px-2 py-3 text-left transition cursor-pointer',
                  isItemActive ? 'text-accent font-semibold' : 'text-ink hover:bg-paper-2/50',
                )}
              >
                <span className="grid h-8 w-8 place-items-center rounded-[4px] bg-paper-2/75 text-ink-soft">
                  <Icon size={17} className={isItemActive ? 'text-accent' : undefined} />
                </span>
                <span className="font-sans text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </Dialog>
    </>
  );
}
