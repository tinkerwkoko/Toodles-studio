import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface MenuItem {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export interface MenuProps {
  label: string;
  items: MenuItem[];
  children: ReactNode;
  align?: 'left' | 'right';
  buttonClassName?: string;
  /** Optional heading shown at the top of the popover. */
  header?: string;
}

/**
 * Small accessible popover menu. Used for task actions and the mobile
 * "Move to…" alternative to dragging kanban cards.
 */
export function Menu({
  label,
  items,
  children,
  align = 'right',
  buttonClassName,
  header,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Elevate parent card and parent list item stacking context so pop-up never hides behind subsequent tasks
    const parentCard = containerRef.current?.closest('article');
    const parentLi = containerRef.current?.closest('li');
    let prevCardZ = '';
    let prevCardPos = '';
    let prevLiZ = '';
    let prevLiPos = '';

    if (parentCard instanceof HTMLElement) {
      prevCardZ = parentCard.style.zIndex;
      prevCardPos = parentCard.style.position;
      parentCard.style.position = 'relative';
      parentCard.style.zIndex = '999';
    }
    if (parentLi instanceof HTMLElement) {
      prevLiZ = parentLi.style.zIndex;
      prevLiPos = parentLi.style.position;
      parentLi.style.position = 'relative';
      parentLi.style.zIndex = '999';
    }

    function handlePointerDown(event: MouseEvent | TouchEvent): void {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
      if (parentCard instanceof HTMLElement) {
        parentCard.style.zIndex = prevCardZ;
        parentCard.style.position = prevCardPos;
      }
      if (parentLi instanceof HTMLElement) {
        parentLi.style.zIndex = prevLiZ;
        parentLi.style.position = prevLiPos;
      }
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div className={cx('relative', open ? 'z-[100]' : 'z-auto')} ref={containerRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        className={cx(
          'grid h-11 w-11 place-items-center rounded-full text-lilac-700 transition hover:bg-lilac-100 cursor-pointer',
          buttonClassName,
        )}
      >
        {children}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={header ?? label}
          className={cx(
            'absolute z-[100] mt-1 min-w-48 overflow-hidden rounded-2xl border border-lilac-200 bg-cream shadow-lift motion-safe:animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {header && (
            <p className="border-b border-lilac-100 px-4 py-2 text-xs font-bold tracking-wide text-ink-soft uppercase">
              {header}
            </p>
          )}

          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={`${item.label}-${index}`}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect();
                  setOpen(false);
                }}
                className={cx(
                  'flex w-full items-center gap-2.5 px-4 py-2 text-left font-title text-sm transition cursor-pointer',
                  item.disabled && 'pointer-events-none opacity-40',
                  item.danger
                    ? 'text-rose-700 hover:bg-rose-100 hover:text-rose-700'
                    : 'text-ink hover:bg-lilac-100',
                )}
              >
                {item.icon && (
                  <span
                    className={cx(
                      'grid h-4 w-4 shrink-0 place-items-center',
                      item.danger ? 'text-rose-700' : 'text-lilac-700',
                    )}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
