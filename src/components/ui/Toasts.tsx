import { useUi } from '../../store/useUi';
import { cx } from '../../lib/cx';

/** Paper-slip confirmations. Rendered once in the app shell. */
export function Toasts() {
  const { toasts, dismissToast } = useUi();
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex flex-col items-center gap-2 px-4 md:bottom-6"
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className={cx(
            'pointer-events-auto max-w-sm rounded-[4px] border px-4 py-2.5 text-sm font-sans font-medium shadow-lift transition cursor-pointer',
            'motion-safe:animate-slide-up',
            toast.tone === 'success'
              ? 'border-mint-200 bg-mint-100 text-mint-700'
              : 'border-lilac-200 bg-cream text-ink',
          )}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
