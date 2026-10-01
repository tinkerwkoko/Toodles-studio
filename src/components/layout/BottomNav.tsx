import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Plus } from 'lucide-react';
import { MOBILE_MORE_ITEMS, MOBILE_PRIMARY_ITEMS } from '../../lib/nav';
import { cx } from '../../lib/cx';
import { useUi } from '../../store/useUi';
import { Dialog } from '../ui/Dialog';

/**
 * Mobile navigation: My Nook, Tasks, raised center +, Projects, More.
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
        className="fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-cream pb-safe backdrop-blur md:hidden"
      >
        <ul className="mx-auto flex max-w-md items-center justify-between px-2 py-1">
          {/* Nook & Tasks */}
          {nook && (
            <li className="flex-1">
              <NavLink
                to={nook.to}
                end
                className={({ isActive }) =>
                  cx(
                    'flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-[9px] text-[11px] font-title transition',
                    isActive ? 'text-ink font-medium' : 'text-ink-soft',
                  )
                }
              >
                {({ isActive }) => {
                  const Icon = nook.icon;
                  return (
                    <>
                      <Icon size={19} className={isActive ? 'text-ink' : 'text-ink-soft'} />
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
                    'flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-[9px] text-[11px] font-title transition',
                    isActive ? 'text-ink font-medium' : 'text-ink-soft',
                  )
                }
              >
                {({ isActive }) => {
                  const Icon = tasks.icon;
                  return (
                    <>
                      <Icon size={19} className={isActive ? 'text-ink' : 'text-ink-soft'} />
                      <span>{tasks.label}</span>
                    </>
                  );
                }}
              </NavLink>
            </li>
          )}

          {/* Raised center plus button */}
          <li className="relative flex flex-1 items-center justify-center">
            <button
              type="button"
              onClick={openQuickCreate}
              aria-label="Quick create"
              className="-mt-5 grid h-12 w-12 place-items-center rounded-full border border-lilac-200 bg-lilac-300 text-ink shadow-none transition active:scale-95 hover:bg-lilac-400"
            >
              <Plus size={22} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </li>

          {/* Projects */}
          {projects && (
            <li className="flex-1">
              <NavLink
                to={projects.to}
                className={({ isActive }) =>
                  cx(
                    'flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-[9px] text-[11px] font-title transition',
                    isActive ? 'text-ink font-medium' : 'text-ink-soft',
                  )
                }
              >
                {({ isActive }) => {
                  const Icon = projects.icon;
                  return (
                    <>
                      <Icon size={19} className={isActive ? 'text-ink' : 'text-ink-soft'} />
                      <span>{projects.label}</span>
                    </>
                  );
                }}
              </NavLink>
            </li>
          )}

          {/* More */}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-label="More pages"
              className={cx(
                'flex w-full min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-[9px] text-[11px] font-title transition',
                isMoreActive ? 'text-ink font-medium' : 'text-ink-soft',
              )}
            >
              <MoreHorizontal size={19} className={isMoreActive ? 'text-ink' : 'text-ink-soft'} />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* More sheet */}
      <Dialog
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="More sections"
        description="Explore the rest of your quiet space."
      >
        <div className="grid gap-2">
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
                  'flex items-center gap-3 rounded-[9px] border border-lilac-200 p-3 text-left transition',
                  isItemActive ? 'bg-lilac-200 text-ink' : 'bg-cream text-ink hover:bg-lilac-100',
                )}
              >
                <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-lilac-100 text-ink">
                  <Icon size={18} />
                </span>
                <span className="font-title font-medium text-sm text-ink">{item.label}</span>
              </button>
            );
          })}
        </div>
      </Dialog>
    </>
  );
}
