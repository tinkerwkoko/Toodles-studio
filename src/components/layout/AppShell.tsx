import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CreateDialogs } from './CreateDialogs';
import { QuickCreateSheet } from './QuickCreateSheet';
import { Toasts } from '../ui/Toasts';
import { useReminders } from '../../hooks/useReminders';

/** Full-width header above collapsible sidebar on desktop, bottom nav on mobile. */
export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  useReminders();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="min-h-dvh flex flex-col bg-lilac-50 text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-[9px] focus:bg-lilac-300 focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>

      {/* Full-width header above everything */}
      <TopBar />

      {/* Main body: sidebar + content */}
      <div className="flex-1 flex min-w-0">
        <Sidebar />
        <main
          id="main"
          key={location.pathname}
          className="flex-1 min-w-0 mx-auto w-full max-w-[1100px] px-4 py-6 md:px-6 pb-24 md:pb-12 motion-safe:animate-fade-in"
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
