# Toodles Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants & Master Source of Truth
1. **Strict Ownership Isolation (Master Gate)**: Every subcollection document under `/users/{userId}/...` belongs strictly to `userId`. Access requires `request.auth != null`, `request.auth.uid == userId`, `request.auth.token.email_verified == true`, and existence of the parent `/users/{userId}` document (checked on single-document operations via `exists()`).
2. **PII Isolation**: `/users/{userId}` contains `email`. Read (`get`) is strictly limited to `request.auth.uid == userId`. Collection listing on `/users` is permanently denied (`allow list: if false;`).
3. **Referential Integrity**:
   - A `BoardColumn` cannot be created unless its parent `Project` exists (`existsAfter`).
   - A `Task` or `DiaryEntry` with a non-null `projectId` cannot be created unless that `Project` exists (`existsAfter`).
   - A `HabitCheck` cannot be created unless its parent `Habit` exists (`existsAfter`).
   - A `FocusSession` with non-null `projectId`/`taskId` cannot be created unless those records exist (`existsAfter`).
4. **Immutable Fields**: `uid`, `id`, `ownerId`, and `createdAt` can never be mutated after creation. `BoardColumn.projectId` and `MoodLog.date` are immutable.
5. **Terminal Log Immutability**: `HabitCheck` and `FocusSession` are append/delete records (`allow update: if false;`).
6. **Temporal Integrity**: `createdAt == request.time` on create and `updatedAt == request.time` on create/update.
7. **Volumetric & Key Hardening**: Every string has an explicit `.size()` upper bound, every array has a `.size() <= MAX` bound plus element type checking, every ID matches `^[a-zA-Z0-9_\-]+$` (<= 128 chars), and every write enforces exact key allowlists (`hasAll`/`hasOnly` on create, `affectedKeys().hasOnly(...)` on update).

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Cross-Tenant Read (PII Leak)**: User B attempts `get(/users/userA)` -> DENIED.
2. **Cross-Tenant List**: User B attempts `list(/users/userA/tasks)` -> DENIED.
3. **Unverified Email Spoofing**: User with `email_verified: false` attempts to create `/users/userA/tasks/task-1` -> DENIED.
4. **Shadow Field Injection (Ghost Field)**: User A creates `/users/userA` with extra field `{ isAdmin: true }` or `{ role: "admin" }` -> DENIED by `keys().hasOnly(...)`.
5. **Identity Spoofing**: User A creates `/users/userA/tasks/task-1` with `{ ownerId: "userB" }` -> DENIED because `ownerId != request.auth.uid`.
6. **ID Poisoning**: User A writes to `/users/userA/projects/a...1500chars` or ID with `$` -> DENIED by `isValidId()`.
7. **Orphaned BoardColumn**: User A creates `/users/userA/boardColumns/col-1` referencing non-existent `projectId: "ghost-project"` -> DENIED by `existsAfter()`.
8. **Orphaned HabitCheck**: User A creates `/users/userA/habitChecks/check-1` referencing non-existent `habitId: "ghost-habit"` -> DENIED by `existsAfter()`.
9. **Client Timestamp Forgery**: User A creates `/users/userA/tasks/task-1` with backdated `createdAt: Timestamp(2020-01-01)` -> DENIED by `createdAt == request.time`.
10. **Immortal Field Mutation**: User A updates `/users/userA/tasks/task-1` attempting to change `createdAt` or `ownerId` -> DENIED by `affectedKeys().hasOnly(...)` and immutability check.
11. **Array Exhaustion (Denial of Wallet)**: User A updates `/users/userA/tasks/task-1` with 25 tags (> 20 limit) or 60 subtasks (> 50 limit) -> DENIED by `isValidTask()`.
12. **Terminal Log Mutation**: User A attempts `update` on `/users/userA/focusSessions/sess-1` -> DENIED by `allow update: if false;`.
