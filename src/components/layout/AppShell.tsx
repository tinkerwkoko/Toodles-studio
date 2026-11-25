import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CreateDialogs } from './CreateDialogs';
import { QuickCreateSheet } from './QuickCreateSheet';
import { Toasts } from '../ui/Toasts';
import { forceUnlockScroll } from '../ui/Dialog';
import { useReminders } from '../../hooks/useReminders';

/** Full-width ledger header above collapsible library sidebar on desktop, bottom nav on mobile. */
export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  useReminders();

  useEffect(() => {
    forceUnlockScroll();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="min-h-dvh flex flex-col bg-lilac-50 text-ink w-full">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-[4px] focus:bg-lilac-300 focus:px-4 focus:py-2 focus:text-primary-ink"
      >
        Skip to content
      </a>

      <TopBar />

      <div className="flex-1 flex min-w-0">
        <Sidebar />
        <main
          id="main"
          key={location.pathname}
          className="flex-1 min-w-0 mx-auto w-full max-w-[1080px] px-4 py-6 sm:px-6 md:px-9 md:py-8 pb-36 md:pb-24 motion-safe:animate-fade-in"
        >
          {children}
        </main>
      </div>

      <BottomNav />
      <CreateDialogs />
      <QuickCreateSheet />
      <Toasts />
    </div>
  );
}
