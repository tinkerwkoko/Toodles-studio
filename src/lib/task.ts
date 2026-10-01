import type { DateString, Priority, RepeatRule, Task, TaskScope } from '../types';
import { addDays, addMonths, isPast, todayString } from './date';

export interface SubtaskProgress {
  done: number;
  total: number;
  percent: number;
}

export function subtaskProgress(task: Task): SubtaskProgress {
  const total = task.subtasks.length;
  const done = task.subtasks.filter((subtask) => subtask.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

export function isTaskOverdue(task: Task): boolean {
  return task.status === 'todo' && isPast(task.dueDate);
}

export function isTaskDueToday(task: Task, today = todayString()): boolean {
  if (task.status !== 'todo') return false;
  // If any task starts today regardless of the deadline, it should be in today's list
  if (task.startDate === today) return true;
  // If the deadline is today
  if (task.dueDate === today) return true;
  // If the task started on or before today and is still active
  if (task.startDate && task.startDate <= today) return true;
  return false;
}

export function isTaskCompletedToday(task: Task, today = todayString()): boolean {
  return task.status === 'done' && !!task.completedAt && task.completedAt.slice(0, 10) === today;
}

export function filterByScope(tasks: Task[], scope: TaskScope): Task[] {
  const today = todayString();
  switch (scope) {
    case 'today':
      return tasks.filter((task) => isTaskDueToday(task, today));
    case 'upcoming':
      return tasks.filter(
        (task) =>
          task.status === 'todo' &&
          !isTaskDueToday(task, today) &&
          ((!!task.dueDate && task.dueDate > today) || (!!task.startDate && task.startDate > today)),
      );
    case 'overdue':
      return tasks.filter(
        (task) => task.status === 'todo' && !!task.dueDate && task.dueDate < today,
      );
    case 'completed':
      return tasks.filter((task) => task.status === 'done');
    case 'all':
    default:
      return tasks.filter((task) => task.status === 'todo');
  }
}

export type TaskSort = 'smart' | 'due' | 'created' | 'priority' | 'title';

export const TASK_SORT_LABELS: Record<TaskSort, string> = {
  smart: 'Smart order',
  due: 'Due date',
  created: 'Recently added',
  priority: 'Priority',
  title: 'A to Z',
};

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 0, medium: 1, low: 2, none: 3 };

/** Sorts a copy of the list; tasks without dates always sink to the bottom. */
export function sortTasks(tasks: Task[], sort: TaskSort = 'smart'): Task[] {
  const copy = [...tasks];
  const byDue = (a: Task, b: Task): number => {
    if (a.dueDate === b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  };

  switch (sort) {
    case 'due':
      return copy.sort((a, b) => byDue(a, b) || a.title.localeCompare(b.title));
    case 'created':
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'priority':
      return copy.sort(
        (a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] || byDue(a, b),
      );
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'smart':
    default:
      return copy.sort(
        (a, b) =>
          PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] ||
          byDue(a, b) ||
          a.title.localeCompare(b.title),
      );
  }
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return tasks;
  return tasks.filter((task) => {
    const haystack = [
      task.title,
      task.description,
      ...task.tags,
      ...task.subtasks.map((subtask) => subtask.title),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export interface DateGroup<T> {
  date: DateString;
  items: T[];
}

/** Groups tasks by due date, ascending; undated tasks come last. */
export function groupByDueDate(tasks: Task[]): DateGroup<Task>[] {
  const buckets = new Map<DateString, Task[]>();
  tasks.forEach((task) => {
    const key = task.dueDate ?? 'none';
    const bucket = buckets.get(key);
    if (bucket) bucket.push(task);
    else buckets.set(key, [task]);
  });
  return [...buckets.entries()]
    .sort(([a], [b]) => {
      if (a === 'none') return 1;
      if (b === 'none') return -1;
      return a < b ? -1 : 1;
    })
    .map(([date, items]) => ({ date, items }));
}

export const REPEAT_LABELS: Record<RepeatRule, string> = {
  none: 'Does not repeat',
  daily: 'Every day',
  weekdays: 'Every weekday',
  weekly: 'Every week',
  monthly: 'Every month',
};

export const REPEAT_SHORT: Record<RepeatRule, string> = {
  none: '',
  daily: 'Daily',
  weekdays: 'Weekdays',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

/** Next occurrence date for a repeating task (weekdays skip the weekend). */
export function nextOccurrence(from: DateString, repeat: RepeatRule): DateString | null {
  switch (repeat) {
    case 'daily':
      return addDays(from, 1);
    case 'weekdays': {
      let next = addDays(from, 1);
      let guard = 0;
      while ([0, 6].includes(new Date(`${next}T00:00:00`).getDay()) && guard < 7) {
        next = addDays(next, 1);
        guard += 1;
      }
      return next;
    }
    case 'weekly':
      return addDays(from, 7);
    case 'monthly':
      return addMonths(from, 1);
    case 'none':
    default:
      return null;
  }
}

export function allTags(tasks: Task[]): string[] {
  const set = new Set<string>();
  tasks.forEach((task) => task.tags.forEach((tag) => set.add(tag)));
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Consecutive days (ending today or yesterday) with at least one completion. */
export function completionStreak(tasks: Task[]): number {
  const days = new Set(
    tasks.filter((task) => task.completedAt).map((task) => task.completedAt?.slice(0, 10) ?? ''),
  );
  let streak = 0;
  let cursor = todayString();
  if (!days.has(cursor)) cursor = addDays(cursor, -1);
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
