import { useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { Cat } from './components/Cat';
import { AppShell } from './components/layout/AppShell';
import { WelcomeScreen } from './components/WelcomeScreen';
import { DiaryPage } from './pages/DiaryPage';
import { CalendarPage } from './pages/CalendarPage';
import { FocusPage } from './pages/FocusPage';
import { HomePage } from './pages/HomePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SettingsPage } from './pages/SettingsPage';
import { StudyPage } from './pages/StudyPage';
import { TasksPage } from './pages/TasksPage';
import { WellbeingPage } from './pages/WellbeingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ToodlesProvider } from './store/ToodlesProvider';
import { UiProvider } from './store/UiProvider';

/**
 * Toodles: a private, local-first planner.
 * Splash screen -> providers -> responsive shell -> routes.
 */
export default function App() {
  const [splash, setSplash] = useState(true);

  return (
    <BrowserRouter>
      <ToodlesProvider>
        <UiProvider>
          {splash && <WelcomeScreen onDone={() => setSplash(false)} />}
          <AppShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/today" element={<Navigate to="/tasks?tab=today" replace />} />
              <Route path="/upcoming" element={<Navigate to="/tasks?tab=upcoming" replace />} />
              <Route path="/overdue" element={<Navigate to="/tasks?tab=overdue" replace />} />
              <Route path="/completed" element={<Navigate to="/tasks?tab=completed" replace />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/focus" element={<FocusPage />} />
              <Route path="/study" element={<StudyPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/diary" element={<DiaryPage />} />
              <Route path="/wellbeing" element={<WellbeingPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
        </UiProvider>
      </ToodlesProvider>
    </BrowserRouter>
  );
}

/** Friendly landing spot for routes that are not wired up in this build. */
function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Cat pose="curious" size={132} />
      <h1 className="text-2xl">This corner is still being built</h1>
      <p className="max-w-md text-ink-soft">
        The section you are looking for is not part of this build yet. The overview and all task
        views are ready to use.
      </p>
      <Link
        to="/"
        className="inline-flex min-h-11 items-center rounded-full bg-lilac-300 px-5 font-display text-ink transition hover:bg-lilac-200"
      >
        Back to the overview
      </Link>
    </div>
  );
}
