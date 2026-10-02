import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cx } from '../../lib/cx';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Sticky action row at the bottom of the panel. */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Element to focus when the dialog opens. */
  autoFocus?: boolean;
}

let activeDialogCount = 0;

export function forceUnlockScroll(): void {
  activeDialogCount = 0;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
}

function lockScroll(): void {
  activeDialogCount++;
  if (activeDialogCount === 1 && typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
}

function unlockScroll(): void {
  activeDialogCount = Math.max(0, activeDialogCount - 1);
  if (activeDialogCount === 0 && typeof document !== 'undefined') {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
}

/**
 * One component for every overlay: a bottom sheet on phones, a centred modal
 * from md upwards. Escape and backdrop click both close it.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  autoFocus = true,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    lockScroll();

    if (autoFocus) {
      const target = panelRef.current?.querySelector<HTMLElement>(
        '[data-autofocus], input:not([type="hidden"]), textarea, select, button',
      );
      target?.focus();
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockScroll();
      restoreFocusRef.current?.focus?.();
    };
  }, [open, autoFocus]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-lilac-700/25 backdrop-blur-[2px] motion-safe:animate-fade-in"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cx(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden border border-lilac-200 bg-lilac-50 shadow-lift',
          'rounded-t-4xl md:rounded-4xl motion-safe:animate-slide-up',
          size === 'sm' ? 'md:max-w-md' : size === 'lg' ? 'md:max-w-3xl' : 'md:max-w-xl',
        )}
      >
        <header className="flex items-start gap-3 border-b border-lilac-200/70 bg-cream/70 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-xl">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-0.5 text-sm text-ink-soft">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-lilac-700 transition hover:bg-lilac-100"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="border-t border-lilac-200/70 bg-cream/70 px-5 py-3 pb-safe">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
