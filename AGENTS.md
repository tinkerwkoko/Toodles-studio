# AGENTS.md — working notes for AI agents on Toodles

Read this file before changing anything. If a change makes part of this file wrong, update this file in
the same change.

**IMPORTANT: docs/ROADMAP.md is the source of truth for the redesign and must be read before every change.**

## 1. What Toodles is

Toodles is a private, local-first personal productivity app: tasks, subtasks, projects, kanban boards,
a diary, mood logs, habits and a completed-work archive. It should feel like a soft, warm, hand-drawn
storybook planner — cozy, calm, a little playful — never like a corporate dashboard or generic SaaS.

Tagline: **"Small tasks, big calm."**

## 2. Tech stack (do not add to this without explicit approval)

- Vite + React 19 + TypeScript (strict, no `any`)
- Tailwind CSS v4 through the `@tailwindcss/vite` plugin — **there is no `tailwind.config.js`**; all
  design tokens live in `@theme` inside `src/index.css`
- `react-router-dom` for routing
- `lucide-react` for icons
- `@dnd-kit/*` for kanban drag and drop
- `localStorage` for persistence
- Deploy target: Vercel static site (`vercel.json` rewrites every path to `index.html`)

Explicitly **not** allowed: backend/API routes, database, auth/login, accounts, cloud sync, analytics,
payments, AI features, social features, team features, server-side notifications, extra UI kits or
state-management libraries (no Redux/Zustand/React Query). No secrets, no `.env` files.

## 3. Privacy rules (non-negotiable)

- All user data lives in **one versioned localStorage key**: `toodles`, value
  `{ version: number, ...collections }`. Every read/write goes through `src/store/storage.ts`, wrapped
  in `try/catch`.
- No component touches `localStorage` directly, and no personal data ever goes into the URL, query
  string, route params or `navigate()` state. Search/filter state lives in React memory.
- Fresh browser, fresh device or incognito window = **empty workspace**. Never ship sample, demo or
  seeded data with the app (a clearly-labelled demo is only allowed if the user asks for one).
- Only IDs (`crypto.randomUUID()`) and ISO date strings are stored. Dates that mean "a calendar day"
  are stored as `YYYY-MM-DD` in local time; timestamps are full ISO 8601 strings.

## 4. Folder structure

```
src/
  main.tsx                 React entry, mounts <App/>
  App.tsx                  splash gate + router + providers
  index.css                Tailwind import, @theme tokens, base styles, keyframes
  types/index.ts           All shared TypeScript types (single source of truth)
  lib/
    date.ts                Date helpers (local-day safe, no date library)
    color.ts               Pastel palette maps -> Tailwind class strings
  store/
    storage.ts             localStorage read/write/migrate/import/export
    ToodlesProvider.tsx    Context provider: state + all mutations
    useToodles.ts          Consumer hook
    UiProvider.tsx         UI-only state: create sheets, search term, toasts
  hooks/
    useReminders.ts        In-app Notification API reminders (permission gated)
  components/
    ui/                    Button, IconButton, Card, Modal, Sheet, Input, Textarea,
                           Select, Field, Chip, ProgressBar, SegmentedControl,
                           EmptyState, ConfirmDialog, Toast, TaskCheckbox
    Cat.tsx                The original Toodles mascot (SVG, multiple poses)
    layout/                AppShell, Sidebar, IconRail, TopBar, BottomNav, CreateTaskDialog
    tasks/                 TaskCard, TaskList, TaskDetail, SubtaskList, TaskForm
    projects/              ProjectCard, ProjectForm
    board/                 BoardView, BoardColumnView, BoardCard
    diary/                 DiaryList, DiaryEditor, MonthPicker
    habits/                HabitCard, HabitGrid, MoodPicker, MoodCalendar
    home/                  HomeSummary, QuickTile, HeroCard
  pages/                   Route-level screens (Home, Tasks, Projects, Board, ...)
```

Rules: pages compose, components render, `lib`/`store` hold logic. Keep files small; split instead of
growing a mega-component.


## 5. Design tokens

Defined once in `src/index.css` under `@theme`. Use the Tailwind utilities, never raw hex in JSX.

| Token | Value | Use |
| --- | --- | --- |
| `lilac-50` | `#F8F2EF` | page background |
| `lilac-100` | `#F1E7E6` | sidebar/icon rail |
| `lilac-200` | `#E4D0D9` | borders/dividers |
| `lilac-300` | `#D9BFCC` | primary/active/selected |
| `lilac-500` | `#D9BFCC` | primary buttons, active nav |
| `lilac-700` | `#4A3540` | main text |
| `ink` | `#4A3540` | body text |

Pastel accents (each has `100 / 200 / 300 / 500 / 700`): `peach`, `mint`, `butter`, `sky`, `rose`.
Rule of thumb: `-100` background, `-200` border, `-300` dot/decoration, `-500` solid fill, `-700` text on light fills.
Text contrast must stay AA: use `ink` or `*-700` on light surfaces, white only on `lilac-500`+.

- Fonts: **Chewy** for display headings (`font-display`), **Fredoka** for item titles (`font-title`),
  **Handlee** for body copy (`font-sans`), via Google Fonts.
- Shape: cards and sheets are `rounded-3xl` (24px), buttons are pills, borders are soft
  (`border-lilac-200`), shadows are gentle (`shadow-soft`), never harsh black lines.
- Light mode only.
- Animations: small and soft (blink, check pop, slide-up sheet, fade). All motion must sit behind
  `prefers-reduced-motion` guards — the global CSS reset kills animation/transition durations.
- Touch targets ≥ 44px on mobile; no horizontal page scroll from 320px up.

## 6. Data model

All types live in `src/types/index.ts`:

- `Project`: id, name, color, emoji, createdAt, archived
- `Task`: id, title, description, projectId, priority (`none|low|medium|high`), startDate, dueDate,
  dueTime, estimate (minutes), repeat (`none|daily|weekdays|weekly|monthly`), reminder, tags[],
  status (`todo|done`), boardColumnId, color?, completedAt, createdAt, subtasks[]
- `Subtask`: id, title, done, color?
- `BoardColumn`: id, projectId, name, color, order
- `DiaryEntry`: id, date, title, body, mood?, createdAt, updatedAt
- `MoodLog`: date, mood (`happy|good|okay|low|difficult`), note?, updatedAt
- `Habit`: id, name, color, frequency (`daily|weekly`), weekdays[], createdAt, archived
- `HabitCheck`: habitId, date
- `AppSettings`: displayName, weekStartsOn, splashSeenAt
- `ToodlesData`: version + all collections above

Store rules:
- Mutations always produce new arrays/objects (immutable updates) inside `ToodlesProvider`.
- Deleting a task removes its subtasks with it; deleting a project must ask: delete its tasks or move
  them to another project / no project.
- Completing a repeating task automatically creates the next occurrence (dates shifted, subtasks reset).
- Every mutation is a named function on the context — no ad-hoc persistence code in components.

## 7. Accessibility

- Semantic HTML (`nav`, `main`, `header`, `ul/li`, `button`, `label`), one `h1` per page.
- Icon-only buttons need `aria-label`; inputs always have a visible `<label>` or aria-label.
- Dialogs: `role="dialog"`, `aria-modal`, labelled heading, Escape closes, focus moves inside and back.
- Visible focus rings (`focus-visible:outline` on a lilac ring) everywhere.
- Status is never colour-only: pair colour with icons, text or strikethrough.
- Keyboard: all actions reachable by tab; kanban cards move via the "Move to…" menu, not only dragging.

## 8. Animation rules

Soft and short (150–450ms). Use the shared keyframes in `index.css` (`fade-in`, `pop`, `slide-up`,
`blink`, `float`). No bounce-spam, and nothing longer than ~2.5s except the splash. Respect
`prefers-reduced-motion` (handled globally in CSS).

## 9. Things agents must NOT introduce without explicit approval

- Sample/seed/demo data, fake historical records, "as seen in" or health/medical claims.
- Copying any existing character, artwork or logo; the cat mascot is original and lives in
  `src/components/Cat.tsx`.
- New runtime dependencies, CSS frameworks, UI kits, icon sets.
- Server code, API routes, auth, telemetry, external API calls (Google Fonts is the only exception).
- Rewriting the storage format without bumping `SCHEMA_VERSION` and adding a migration.

## 10. Commands

```
npm install        # install
npm run dev        # dev server on http://localhost:5173
npm run typecheck  # tsc -p tsconfig.json
npm run build      # tsc + vite build -> dist/
npm run preview    # serve the production build
```

Always run `npm run build` before saying a change is done.

## 11. Progress

Last verified: `npx tsc --noEmit` reports 0 errors and `npm run build` succeeds (tsc + vite).

### Phase status

| Phase | Scope | State |
| --- | --- | --- |
| 1 | Setup, Tailwind theme, cat SVG, welcome screen, app shell + responsive nav, localStorage store, create-task form, Tasks CRUD | **done** |
| 2 | Projects, subtasks, task detail, Upcoming/Overdue, Home dashboard, empty-state CTAs | **done** |
| 3 | Board view with colours and drag & drop, completed archive by project and by date | **done** |
| 4 | Diary, Mood & Habits, Settings (export/import/erase), notification reminders | **done** |
| 5 | Polish animations, accessibility pass, README, Vercel config, final build | **done** |
| Redesign 1 | Full-width TopBar, collapsible animated Sidebar, mobile BottomNav, Tabs component, My Nook dashboard (flat cream banner, 5 stat tiles, 2-column layout, Today's list card with reschedule menu and time commitment, Coming up list, Today's feeling card, Habits card) | **done** |
| Redesign 2 | Tasks page redesign (tabs with sliding underline, plain row list, search bar, overdue styling, task detail) | **not started** |
| Redesign 3 | Projects, kanban board, diary, wellbeing calendar/grids, settings, and final polish | **not started** |

### Screens that work today

- Welcome / splash — `src/components/WelcomeScreen.tsx` (tap to skip, ~1.9 s)
- Home / overview — `src/pages/HomePage.tsx` (far-left greeting with cat face, Your cozy corner HeroCard, stat tiles, active projects, Today's list, coming up, feeling & habit cards)
- Tasks — `src/pages/TasksPage.tsx` renders `/tasks`, `/today`, `/upcoming`, `/overdue`, `/completed` with search, project/priority/tag filters, sort, day grouping and per-task menu
- Projects list — `src/pages/ProjectsPage.tsx` (route `/projects`; creating a project also creates its To do / Doing / Done columns)
- Project detail — `src/pages/ProjectDetailPage.tsx` (route `/projects/:id`): header with customizable cover banner & icon upload, progress, List | Board toggle, edit + delete project dialogs
- Focus corner — `src/pages/FocusPage.tsx` (route `/focus`): Pomodoro timer (25m/5m/15m) using Date.now timestamps, task linkage, concentrating/happy cat pose, focus session logging
- Study corner — `src/pages/StudyPage.tsx` (route `/study`): study stopwatch/timer, study goals, study tasks list with quick completion
- Analytics & calm insights — `src/pages/AnalyticsPage.tsx` (route `/analytics`): 7-day task completion bar chart, mood balance breakdown, project progress breakdown, summary stats
- Kanban board — `src/components/board/BoardView.tsx` + `BoardColumnView.tsx` + `BoardCard.tsx` + `ColumnDialog.tsx`
- Diary — `src/pages/DiaryPage.tsx`
- Mood & habits — `src/pages/WellbeingPage.tsx`
- Settings — `src/pages/SettingsPage.tsx`

### Built but not mounted in a route yet

Type-checked and working at component/store level, waiting for their page:

- `src/components/diary/DiaryForm.tsx`, `src/components/habits/MoodPicker.tsx`, `src/components/CatFace.tsx`
- `exportJson` / `parseImport` / `clearStoredData` in `src/store/storage.ts`

Board notes for future agents:

- All board logic already lives in `src/store/mutations.ts` (`placeTaskInColumn`, `insertColumn`, `replaceColumn`, `removeColumn`, `moveColumn`, `columnsForProject`). Do not add a second board store.
- `actions.ensureBoardColumns(projectId)` only seeds To do / Doing / Done when a project has **no** columns. It never overwrites an existing board.
- `actions.placeTaskOnBoard(taskId, columnId, beforeTaskId)` is what drag and drop and the card "Move to…" menu both call; it also keeps `status`/`completedAt` in step with the last column.

### Known gaps

- `/diary`, `/wellbeing` and `/settings` render the placeholder card in `src/App.tsx`; register each route as its page lands and remove the placeholder once nothing uses it.
- `/projects` and `/projects/:id` are mounted (Stage A). `/projects` was missing from the router before Stage A — keep both routes registered.
- `/completed` is the Completed *task view*, not the year/month archive (Stage B).
- Habits have helpers in `src/lib/habit.ts` but no HabitGrid / week-grid UI yet.
- No README.md yet.
