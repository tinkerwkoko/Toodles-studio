import {
  BarChart3,
  BookOpen,
  BookOpenText,
  Calendar,
  Folder,
  Home,
  ListChecks,
  Settings,
  Smile,
  Target,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
}

/**
 * All navigation items for IconRail or quick reference.
 */
export const NAV_ITEMS: Required<NavItem>[] = [
  { to: '/', label: 'My Nook', shortLabel: 'Nook', icon: Home },
  { to: '/tasks', label: 'Tasks', shortLabel: 'Tasks', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', shortLabel: 'Calendar', icon: Calendar },
  { to: '/projects', label: 'Projects', shortLabel: 'Projects', icon: Folder },
  { to: '/focus', label: 'Focus', shortLabel: 'Focus', icon: Target },
  { to: '/study', label: 'Study', shortLabel: 'Study', icon: BookOpen },
  { to: '/diary', label: 'Diary', shortLabel: 'Diary', icon: BookOpenText },
  { to: '/wellbeing', label: 'Mood & habits', shortLabel: 'Habits', icon: Smile },
  { to: '/analytics', label: 'Analytics', shortLabel: 'Stats', icon: BarChart3 },
  { to: '/settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
];

/**
 * Sidebar navigation items for existing pages:
 */
export const SIDEBAR_ITEMS: NavItem[] = [
  { to: '/', label: 'My Nook', icon: Home },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/projects', label: 'Projects', icon: Folder },
  { to: '/focus', label: 'Focus', icon: Target },
  { to: '/study', label: 'Study', icon: BookOpen },
  { to: '/diary', label: 'Diary', icon: BookOpenText },
  { to: '/wellbeing', label: 'Mood and habits', icon: Smile },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

/**
 * Mobile bottom nav items: My Nook, Tasks, Projects (plus center +, and More sheet).
 */
export const MOBILE_PRIMARY_ITEMS: NavItem[] = [
  { to: '/', label: 'My Nook', icon: Home },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/projects', label: 'Projects', icon: Folder },
];

export const MOBILE_MORE_ITEMS: NavItem[] = [
  { to: '/focus', label: 'Focus', icon: Target },
  { to: '/study', label: 'Study', icon: BookOpen },
  { to: '/diary', label: 'Diary', icon: BookOpenText },
  { to: '/wellbeing', label: 'Mood and habits', icon: Smile },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];
