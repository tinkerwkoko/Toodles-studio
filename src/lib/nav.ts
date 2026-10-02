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
  { to: '/study', label: 'Study & Focus', shortLabel: 'Study', icon: BookOpen },
  { to: '/diary', label: 'Diary', shortLabel: 'Diary', icon: BookOpenText },
  { to: '/wellbeing', label: 'Mood & habits', shortLabel: 'Habits', icon: Smile },
  { to: '/analytics', label: 'Analytics', shortLabel: 'Stats', icon: BarChart3 },
  { to: '/settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
];

/**
 * Sidebar navigation items:
 */
export const SIDEBAR_ITEMS: NavItem[] = [
  { to: '/', label: 'My Nook', icon: Home },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/projects', label: 'Projects', icon: Folder },
  { to: '/study', label: 'Study & Focus', icon: BookOpen },
  { to: '/diary', label: 'Diary', icon: BookOpenText },
  { to: '/wellbeing', label: 'Mood and habits', icon: Smile },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

/**
 * Mobile bottom nav primary items:
 */
export const MOBILE_PRIMARY_ITEMS: NavItem[] = [
  { to: '/', label: 'My Nook', icon: Home },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/projects', label: 'Projects', icon: Folder },
];

/**
 * Mobile bottom nav "More" modal items:
 */
export const MOBILE_MORE_ITEMS: NavItem[] = [
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/study', label: 'Study & Focus', icon: BookOpen },
  { to: '/diary', label: 'Diary', icon: BookOpenText },
  { to: '/wellbeing', label: 'Mood and habits', icon: Smile },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];
