import type { ThemeMode } from '../types';

export function applyTheme(mode: ThemeMode = 'system'): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  let resolved: 'light' | 'dark' = 'light';

  if (mode === 'system') {
    const isDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    resolved = isDark ? 'dark' : 'light';
  } else {
    resolved = mode;
  }

  root.setAttribute('data-theme', resolved);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#1B1511' : '#F4EBDD');
  }
}
