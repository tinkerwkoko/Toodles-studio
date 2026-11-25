import { useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { Cat } from './components/Cat';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthPage } from './components/auth/AuthPage';
import { DiaryPage } from './pages/DiaryPage';
import { CalendarPage } from './pages/CalendarPage';
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
import { useToodles } from './store/useToodles';

/**
 * Toodles: a cozy cross-device planner powered by Firebase Auth (Google OAuth) and Firestore.
 * Flow: Welcome splash -> Google OAuth / Guest gate -> Full product.
 */
export default function App() {
  const [splash, setSplash] = useState(true);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToodlesProvider>
          <UiProvider>
            <MainFlow splash={splash} onSplashDone={() => setSplash(false)} />
          </UiProvider>
        </ToodlesProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function MainFlow({ splash, onSplashDone }: { splash: boolean; onSplashDone: () => void }) {
  const { data, actions, isReady, isCloudConnected } = useToodles();
  const hasAccess = Boolean(isCloudConnected || data.settings.guestMode);

  if (splash) {
    return <WelcomeScreen onDone={onSplashDone} />;
  }

  if (!isReady) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-lilac-50 text-ink">
        <Cat pose="sleepy" size={96} animated />
        <p className="font-hand text-xl text-ink-soft">Opening your desk…</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <AuthPage
        onSuccess={() => {}}
        onContinueAsGuest={() => actions.updateSettings({ guestMode: true })}
      />
    );
  }

  return (
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
        <Route path="/focus" element={<Navigate to="/study?tab=focus" replace />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/diary" element={<DiaryPage />} />
        <Route path="/wellbeing" element={<WellbeingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}

/** Friendly landing spot for routes that are not wired up in this build. */
function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Cat pose="curious" size={124} />
      <h1 className="font-display text-3xl font-semibold text-ink">This corner is still being built</h1>
      <p className="max-w-md font-sans italic text-sm text-ink-soft">
        The section you are looking for is not part of this build yet. The overview and all task
        views are ready to use.
      </p>
      <Link
        to="/"
        className="mt-1 inline-flex min-h-10 items-center rounded-[4px] bg-lilac-300 px-5 font-sans text-sm font-medium text-primary-ink transition hover:bg-lilac-400"
      >
        Back to the overview
      </Link>
    </div>
  );
}
