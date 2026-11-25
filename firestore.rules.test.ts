/**
 * Phase 0 Security TDD Specification for Toodles Firestore Rules.
 * Verifies all "Dirty Dozen" adversarial payloads return PERMISSION_DENIED
 * and legitimate verified-owner operations succeed.
 *
 * Run against the Firebase Emulator Suite with @firebase/rules-unit-testing.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  actor: { uid: string; emailVerified: boolean } | null;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  payload?: Record<string, unknown>;
  expected: 'ALLOW' | 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Cross-tenant PII read on /users/{otherUid}',
    actor: { uid: 'userB', emailVerified: true },
    operation: 'get',
    path: 'users/userA',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Cross-tenant collection list on /users/{otherUid}/tasks',
    actor: { uid: 'userB', emailVerified: true },
    operation: 'list',
    path: 'users/userA/tasks',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified email token write attempt',
    actor: { uid: 'userA', emailVerified: false },
    operation: 'create',
    path: 'users/userA/tasks/task-1',
    payload: {
      id: 'task-1',
      ownerId: 'userA',
      title: 'Unverified write',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow field privilege escalation on UserProfile create',
    actor: { uid: 'userA', emailVerified: true },
    operation: 'create',
    path: 'users/userA',
    payload: {
      uid: 'userA',
      displayName: 'Test',
      email: 'a@example.com',
      weekStartsOn: 1,
      theme: 'system',
      sidebarOpen: true,
      isAdmin: true,
      role: 'admin',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Identity spoofing via mismatched ownerId',
    actor: { uid: 'userA', emailVerified: true },
    operation: 'create',
    path: 'users/userA/projects/proj-1',
    payload: {
      id: 'proj-1',
      ownerId: 'userB',
      name: 'Spoofed',
      description: '',
      color: 'lilac',
      emoji: '🌱',
      archived: false,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'ID poisoning with oversized invalid characters',
    actor: { uid: 'userA', emailVerified: true },
    operation: 'create',
    path: `users/userA/projects/${'x'.repeat(200)}$bad`,
    payload: {
      id: `${'x'.repeat(200)}$bad`,
      ownerId: 'userA',
      name: 'Poisoned',
      description: '',
      color: 'lilac',
      emoji: '🌱',
      archived: false,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Orphaned BoardColumn referencing missing project',
    actor: { uid: 'userA', emailVerified: true },
    operation: 'create',
    path: 'users/userA/boardColumns/col-1',
    payload: {
      id: 'col-1',
      ownerId: 'userA',
      projectId: 'non-existent-project',
      name: 'To do',
      color: 'lilac',
      order: 0,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Orphaned HabitCheck referencing missing habit',
    actor: { uid: 'userA', emailVerified: true },
    operation: 'create',
    path: 'users/userA/habitChecks/ghost_2026-11-25',
    payload: {
      id: 'ghost_2026-11-25',
      ownerId: 'userA',
      habitId: 'ghost-habit',
      date: '2026-11-25',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Client timestamp forgery on task creation',
    actor: { uid: 'userA', emailVerified: true },
    operation: 'create',
    path: 'users/userA/tasks/task-forged',
    payload: {
      id: 'task-forged',
      ownerId: 'userA',
      title: 'Forged time',
      description: '',
      priority: 'none',
      repeat: 'none',
      reminder: false,
      tags: [],
      status: 'todo',
      color: 'lilac',
      subtasks: [],
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immortal field mutation (createdAt / ownerId) on update',
    actor: { uid: 'userA', emailVerified: true },
    operation: 'update',
    path: 'users/userA/tasks/task-1',
    payload: {
      ownerId: 'userB',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Array exhaustion exceeding 20 tags on Task update',
    actor: { uid: 'userA', emailVerified: true },
    operation: 'update',
    path: 'users/userA/tasks/task-1',
    payload: {
      tags: Array.from({ length: 25 }, (_, i) => `tag-${i}`),
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Mutation of terminal immutable FocusSession record',
    actor: { uid: 'userA', emailVerified: true },
    operation: 'update',
    path: 'users/userA/focusSessions/sess-1',
    payload: {
      actualMinutes: 999,
    },
    expected: 'PERMISSION_DENIED',
  },
];
