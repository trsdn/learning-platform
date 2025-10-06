import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { db } from './modules/storage/database';
import { seedDatabase } from './modules/storage/seed-data';
import type { Topic, LearningPath, PracticeSession as IPracticeSession } from './modules/core/types/services';
import { PracticeSession } from './modules/ui/components/practice-session';
import { SessionResults } from './modules/ui/components/session-results';
import { Dashboard } from './modules/ui/components/dashboard';
import { TopicCard, type TopicCardTopic } from './modules/ui/components/TopicCard';
import { SettingsPage } from './modules/ui/components/settings/SettingsPage';
import { WebsiteLoginScreen } from './modules/ui/components/website-login-screen';
import { settingsService } from '@core/services/settings-service';
import { websiteAuthService } from '@core/services/website-auth-service';
import type { ThemeMode, AppSettings } from '@core/entities/app-settings';
import './modules/ui/styles/variables.css';
import './modules/ui/styles/global.css';
import './modules/ui/styles/utilities.css';
import './index.css';

/**
 * German Learning Platform with Spaced Repetition
 */

if (typeof window !== 'undefined') {
  settingsService.load();
}

function App() {
  // Website authentication state
  const [isWebsiteAuthenticated, setIsWebsiteAuthenticated] = useState(false);
  const [websiteAuthError, setWebsiteAuthError] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [learningPathTaskCounts, setLearningPathTaskCounts] = useState<Record<string, number>>({});
  const [selectedLearningPath, setSelectedLearningPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inSession, setInSession] = useState(false);
  const [completedSession, setCompletedSession] = useState<IPracticeSession | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSessionConfig, setShowSessionConfig] = useState(false);
  const [sessionConfig, setSessionConfig] = useState({ targetCount: 10, includeReview: true });
  const [showSettings, setShowSettings] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const initStarted = useRef(false);

  // Check website authentication on mount
  useEffect(() => {
    const isAuth = websiteAuthService.isAuthenticated();
    setIsWebsiteAuthenticated(isAuth);
  }, []);

  useEffect(() => {
    if (!initStarted.current) {
      initStarted.current = true;
      initializeApp();
    }
  }, []);

  useEffect(() => {
    const handleReseedEvent = (_event: Event) => {
      reseedDatabase(true).catch((error) => console.error('Reseed event failed', error));
    };
    const handleResetEvent = (_event: Event) => {
      handleFullReset().catch((error) => console.error('Reset event failed', error));
    };

    window.addEventListener('app:database:reseed', handleReseedEvent);
    window.addEventListener('app:database:reset', handleResetEvent);

    return () => {
      window.removeEventListener('app:database:reseed', handleReseedEvent);
      window.removeEventListener('app:database:reset', handleResetEvent);
    };
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ settings: AppSettings }>).detail;
      if (detail?.settings?.theme?.mode) {
        setThemeMode(detail.settings.theme.mode as ThemeMode);
      }
    };
    window.addEventListener('app:settings:updated', handler);
    setThemeMode(settingsService.getSettings().theme.mode as ThemeMode);
    return () => {
      window.removeEventListener('app:settings:updated', handler);
    };
  }, []);

  const cycleThemeMode = () => {
    const order: ThemeMode[] = ['system', 'light', 'dark'];
    const currentIndex = order.indexOf(themeMode);
    const nextMode = (order[(currentIndex + 1) % order.length] ?? 'system') as ThemeMode;
    const updated = settingsService.update((prev) => ({
      ...prev,
      theme: { ...prev.theme, mode: nextMode },
    }));
    setThemeMode(updated.theme.mode as ThemeMode);
  };

  const themeLabel = themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Hell' : 'Dunkel';

  async function initializeApp() {
    try {
      // Log deployment version
      const deploymentVersion = document.querySelector('meta[name="deployment-version"]')?.getAttribute('content');
      const buildTime = document.querySelector('meta[name="deployment-version"]')?.getAttribute('data-build-time');
      console.log('🚀 Deployment Version:', deploymentVersion, 'Build Time:', buildTime);

      // Database version for forced re-seeding when data schema changes
      const DB_VERSION = '2'; // Bumped to force re-seed with language: 'Spanish'
      const currentVersion = localStorage.getItem('dbVersion');

      // Check if database has data
      const topicCount = await db.topics.count();
      const taskCount = await db.tasks.count();

      console.log(`Database status: ${topicCount} topics, ${taskCount} tasks, version: ${currentVersion}`);

      // Force re-seed if version changed or DB is empty
      if (topicCount === 0 || taskCount === 0 || currentVersion !== DB_VERSION) {
        if (currentVersion !== DB_VERSION) {
          console.log(`Database version mismatch (${currentVersion} -> ${DB_VERSION}), re-seeding...`);
        } else {
          console.log('Database empty or incomplete, seeding...');
        }
        await seedDatabase(db);
        localStorage.setItem('dbVersion', DB_VERSION);
      } else {
        console.log('Database already seeded, skipping seed');
      }

      // Load topics
      const loadedTopics = await db.topics.toArray();
      setTopics(loadedTopics);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to initialize app:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        failures: error?.failures,
        stack: error?.stack,
      });
      setIsLoading(false);
    }
  }

  async function selectTopic(topic: Topic) {
    setSelectedTopic(topic);
    const paths = await db.learningPaths.where('topicId').equals(topic.id).toArray();
    console.log(`Loading learning paths for topic ${topic.id}:`, paths);

    // Sort by createdAt (latest first)
    paths.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Get actual task counts from database
    const taskCounts: Record<string, number> = {};
    for (const path of paths) {
      const tasks = await db.tasks.where('learningPathId').equals(path.id).toArray();
      taskCounts[path.id] = tasks.length;
      console.log(`Learning path "${path.title}" (${path.id}): ${tasks.length} tasks in DB, taskIds array length: ${path.taskIds?.length || 0}`);
      console.log('Task IDs:', tasks.map(t => t.id));
    }

    setLearningPathTaskCounts(taskCounts);
    setLearningPaths(paths);
  }

  function showConfigScreen(learningPath: LearningPath) {
    setSelectedLearningPath(learningPath);
    setShowSessionConfig(true);
  }

  function startPracticeSession() {
    setShowSessionConfig(false);
    setInSession(true);
  }

  function cancelSessionConfig() {
    setShowSessionConfig(false);
    setSelectedLearningPath(null);
  }

  async function handleSessionComplete() {
    setInSession(false);
    if (selectedLearningPath && selectedTopic) {
      // Get the completed session
      const sessions = await db.practiceSessions
        .where('execution.status')
        .equals('completed')
        .reverse()
        .limit(1)
        .toArray();

      if (sessions.length > 0 && sessions[0]) {
        setCompletedSession(sessions[0]);
      }
    }
  }

  function handleSessionCancel() {
    setInSession(false);
    setSelectedLearningPath(null);
  }

  function handleCloseResults() {
    setCompletedSession(null);
  }

  function handleStartNewSession() {
    setCompletedSession(null);
    if (selectedLearningPath) {
      setInSession(true);
    }
  }

  async function handleWebsitePasswordSubmit(password: string) {
    const passwordHash = import.meta.env.VITE_APP_PASSWORD_HASH;

    if (!passwordHash) {
      setWebsiteAuthError('Kein Passwort konfiguriert. Bitte VITE_APP_PASSWORD_HASH in .env.local setzen.');
      return;
    }

    setIsAuthenticating(true);
    setWebsiteAuthError('');

    try {
      const isValid = await websiteAuthService.authenticate(password, passwordHash);

      setIsAuthenticating(false);

      if (isValid) {
        setIsWebsiteAuthenticated(true);
        setWebsiteAuthError('');
      } else {
        setWebsiteAuthError('Das eingegebene Passwort ist nicht korrekt. Bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      setIsAuthenticating(false);
      if (error instanceof Error) {
        setWebsiteAuthError(error.message);
      } else {
        setWebsiteAuthError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }
    }
  }

  // Show website login screen if not authenticated
  if (!isWebsiteAuthenticated) {
    return (
      <WebsiteLoginScreen
        onSubmit={handleWebsitePasswordSubmit}
        errorMessage={websiteAuthError}
        isLoading={isAuthenticating}
      />
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <h1>🧠 MindForge Academy</h1>
        <p>Wird geladen...</p>
      </div>
    );
  }

  // Show dashboard
  if (showDashboard) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Dashboard onClose={() => setShowDashboard(false)} />
      </div>
    );
  }

  if (showSettings) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <SettingsPage onClose={() => setShowSettings(false)} />
      </div>
    );
  }

  // Show session results
  if (completedSession) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <SessionResults
          session={completedSession}
          onClose={handleCloseResults}
          onStartNew={handleStartNewSession}
        />
      </div>
    );
  }

  // Show session configuration
  if (showSessionConfig && selectedLearningPath && selectedTopic) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
        <button
          onClick={cancelSessionConfig}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          ← Zurück
        </button>

        <h1 style={{ marginBottom: '0.5rem' }}>Sitzung konfigurieren</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
          {selectedLearningPath.title}
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
            Anzahl der Fragen
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[5, 10, 15, 20].map((count) => (
              <button
                key={count}
                onClick={() => setSessionConfig({ ...sessionConfig, targetCount: count })}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: sessionConfig.targetCount === count ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                  color: sessionConfig.targetCount === count ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                }}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={sessionConfig.includeReview}
              onChange={(e) => setSessionConfig({ ...sessionConfig, includeReview: e.target.checked })}
              style={{ marginRight: '0.5rem', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
            />
            <span>Wiederholungsfragen einbeziehen</span>
          </label>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', marginLeft: '1.75rem' }}>
            Fragen, die du bereits beantwortet hast und die zur Wiederholung fällig sind
          </p>
        </div>

        <button
          onClick={startPracticeSession}
          style={{
            padding: '1rem 2rem',
            background: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: '500',
            width: '100%',
          }}
        >
          Sitzung starten →
        </button>
      </div>
    );
  }

  // Show practice session
  if (inSession && selectedLearningPath && selectedTopic) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <PracticeSession
          topicId={selectedTopic.id}
          learningPathIds={[selectedLearningPath.id]}
          targetCount={sessionConfig.targetCount}
          includeReview={sessionConfig.includeReview}
          onComplete={handleSessionComplete}
          onCancel={handleSessionCancel}
        />
      </div>
    );
  }

  if (selectedTopic) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <button
          onClick={() => setSelectedTopic(null)}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          ← Zurück zu Themen
        </button>

        <h1>📚 {selectedTopic.title}</h1>

        <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Lernpfade</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {learningPaths.map((path) => (
            <div
              key={path.id}
              style={{
                padding: '1.5rem',
                background: 'var(--color-bg-primary)',
                border: '2px solid var(--color-bg-tertiary)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-bg-tertiary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h3 style={{ marginBottom: '0.5rem' }}>{path.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                {path.description}
              </p>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                <span style={{ marginRight: '1rem' }}>
                  {path.difficulty === 'easy'
                    ? '🟢 Leicht'
                    : path.difficulty === 'medium'
                    ? '🟡 Mittel'
                    : '🔴 Schwer'}
                </span>
                <span>{learningPathTaskCounts[path.id] || path.taskIds?.length || 0} Aufgaben</span>
              </div>
              <button
                onClick={() => showConfigScreen(path)}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: 'var(--color-primary)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Lernpfad starten →
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  async function reseedDatabase(showNotification = true) {
    try {
      await db.topics.clear();
      await db.learningPaths.clear();
      await db.tasks.clear();
      await seedDatabase(db);
      const loadedTopics = await db.topics.toArray();
      setTopics(loadedTopics);
      let storageUsageBytes: number | undefined;
      if (navigator.storage?.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          storageUsageBytes = estimate.usage ?? undefined;
        } catch (error) {
          console.warn('Storage estimate failed', error);
        }
      }
      const detail = {
        lastUpdatedAt: new Date().toISOString(),
        storageUsageBytes,
      };
      window.dispatchEvent(new CustomEvent('app:database:updated', { detail }));
      if (showNotification) {
        alert('✅ Datenbank erfolgreich aktualisiert!');
      }
    } catch (error) {
      console.error('Reseed failed:', error);
      if (showNotification) {
        alert('❌ Fehler beim Aktualisieren der Datenbank');
      }
    }
  }

  async function handleFullReset() {
    try {
      await db.delete();
      localStorage.removeItem('dbVersion');
      localStorage.removeItem('mindforge.app-settings.v1');
      localStorage.removeItem('audioSettings');
      window.location.reload();
    } catch (error) {
      console.error('Reset failed:', error);
      alert('❌ Fehler beim Löschen der Daten');
    }
  }

  // Convert Topic to TopicCardTopic
  function topicToCardTopic(topic: Topic): TopicCardTopic {
    const icon = topic.id === 'test' ? '🎯' : topic.id === 'mathematik' ? '🔢' : topic.id === 'spanisch' ? '🇪🇸' : '🧬';
    const color = topic.id === 'test' ? '#fef3c7' : topic.id === 'mathematik' ? '#dbeafe' : topic.id === 'spanisch' ? '#fef3c7' : '#dcfce7';

    return {
      id: topic.id,
      name: topic.title,
      description: `${topic.learningPathIds.length} Lernpfade`,
      icon,
      color,
    };
  }

  const deploymentVersion = document.querySelector('meta[name="deployment-version"]')?.getAttribute('content') || 'unknown';

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>🧠 MindForge Academy</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            Erweitere dein Wissen, eine Frage nach der anderen
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary, #999)', marginTop: '0.25rem' }}>
            v{deploymentVersion}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={cycleThemeMode}
            title={`Theme wechseln (aktuell: ${themeLabel})`}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--color-primary, #667eea)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            🌓 {themeLabel}
          </button>
          <button
            onClick={() => setShowDashboard(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--color-info)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            ⚙️ Einstellungen
          </button>
        </div>
      </div>

      <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Themen auswählen</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topicToCardTopic(topic)}
            onSelect={(topicId) => {
              const selectedTopic = topics.find(t => t.id === topicId);
              if (selectedTopic) selectTopic(selectedTopic);
            }}
            data-testid={`topic-card-${topic.id}`}
          />
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
