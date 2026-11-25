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
  header?: string;
}

/**
 * Accessible popover menu for task actions and board movement.
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
          'grid h-9 w-9 cursor-pointer place-items-center rounded-[6px] text-ink-soft transition hover:bg-paper-2/80 hover:text-ink',
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
            'absolute z-[100] mt-1 min-w-48 overflow-hidden rounded-[8px] border border-divider bg-cream shadow-lift motion-safe:animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {header && (
            <p className="border-b border-divider/70 px-3.5 py-2 font-typewriter text-[11px] text-text-faint">
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
                  'flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left font-sans text-sm transition',
                  item.disabled && 'pointer-events-none opacity-40',
                  item.danger
                    ? 'text-rose-700 hover:bg-rose-100'
                    : 'text-ink hover:bg-paper-2/70',
                )}
              >
                {item.icon && (
                  <span
                    className={cx(
                      'grid h-4 w-4 shrink-0 place-items-center',
                      item.danger ? 'text-rose-700' : 'text-ink-soft',
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
