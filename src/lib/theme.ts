import type { ThemeMode } from '../types';

export function applyTheme(mode: ThemeMode = 'system'): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  if (mode === 'system') {
    const isDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', mode);
  }
}
