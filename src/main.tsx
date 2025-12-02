import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {
  getTopicRepository,
  getLearningPathRepository,
  getTaskRepository,
  getPracticeSessionRepository,
} from './modules/storage/factory';
import type { Topic, LearningPath, Task, PracticeSession as IPracticeSession } from './modules/core/types/services';
import { PracticeSessionWrapper } from './modules/ui/components/practice/PracticeSessionWrapper';
import { SessionResults } from './modules/ui/components/session-results';
import { Dashboard } from './modules/ui/components/dashboard';
import { TopicCard, type TopicCardTopic } from './modules/ui/components/TopicCard';
import { LearningPathCard } from './modules/ui/components/LearningPathCard';
import { SettingsPage } from './modules/ui/components/settings/SettingsPage';
import { AdminPage, type AdminTab } from './modules/ui/components/admin/AdminPage';
import { AuthProvider, useAuth } from './modules/ui/contexts/auth-context';
import { AuthModal } from './modules/ui/components/auth/auth-modal';
import { settingsService } from '@core/services/settings-service';
import type { ThemeMode, AppSettings } from '@core/entities/app-settings';
import { ErrorBoundary, ConnectionStatusIndicator, ErrorMessage } from './modules/ui/components/error';
import { handleComponentError, type StructuredError } from './modules/core/utils/error-handler';
import { checkSupabaseConnection, ConnectionStatus } from './modules/core/utils/connection-health';
import { logger } from '@/utils/logger';
import './modules/ui/styles/variables.css';
import './modules/ui/styles/global.css';
import './modules/ui/styles/utilities.css';
import './modules/ui/components/auth/auth-modal.css';
import './index.css';
import styles from './styles/main-fallback.module.css';

/**
 * German Learning Platform with Spaced Repetition
 */

if (typeof window !== 'undefined') {
  settingsService.load();
}

// eslint-disable-next-line react-refresh/only-export-components
function AppContent() {
  // Supabase authentication
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('components');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [initError, setInitError] = useState<StructuredError | null>(null);
  const initStarted = useRef(false);

  useEffect(() => {
    if (!initStarted.current) {
      initStarted.current = true;
      initializeApp();
    }
  }, []);

  useEffect(() => {
    // Event listeners for reseed/reset are attached after the handlers are
    // declared further below to avoid using callbacks before declaration.
  }, []);

  // Define reseed and reset handlers as stable callbacks so they can be
  // safely referenced from event listeners without causing exhaustive-deps warnings.
  const reseedDatabase = React.useCallback(async (showNotification = true) => {
    try {
      // With Supabase, data is managed in the cloud by admins
      // This function is kept for compatibility with event handlers
      logger.debug('Reseed not needed with Supabase - data is managed in the cloud');

      // Reload topics from Supabase
      const topicRepo = getTopicRepository();
      const loadedTopics = await topicRepo.getAll();
      setTopics(loadedTopics);

      const detail = {
        lastUpdatedAt: new Date().toISOString(),
      };
      window.dispatchEvent(new CustomEvent('app:database:updated', { detail }));

      if (showNotification) {
        alert('✅ Daten erfolgreich aktualisiert!');
      }
    } catch (error) {
      console.error('Reload failed:', error);
      if (showNotification) {
        alert('❌ Fehler beim Aktualisieren der Daten');
      }
    }
  }, [setTopics]);

  const handleFullReset = React.useCallback(async () => {
    try {
      // With Supabase, we only clear local settings
      localStorage.removeItem('mindforge.app-settings.v1');
      localStorage.removeItem('audioSettings');

      // Sign out the user (this will trigger re-authentication)
      await signOut();

      if (window.confirm('App-Einstellungen wurden zurückgesetzt. Seite neu laden?')) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Reset failed:', error);
      alert('❌ Fehler beim Zurücksetzen der Einstellungen');
    }
  }, [signOut]);

  // Attach event listeners now that reseedDatabase and handleFullReset are
  // declared as stable callbacks.
  useEffect(() => {
    const handleReseedEvent = (_event: Event) => {
      reseedDatabase(true).catch((error) => logger.error('Reseed event failed', error));
    };
    const handleResetEvent = (_event: Event) => {
      handleFullReset().catch((error) => logger.error('Reset event failed', error));
    };

    window.addEventListener('app:database:reseed', handleReseedEvent);
    window.addEventListener('app:database:reset', handleResetEvent);

    return () => {
      window.removeEventListener('app:database:reseed', handleReseedEvent);
      window.removeEventListener('app:database:reset', handleResetEvent);
    };
  }, [reseedDatabase, handleFullReset]);

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

  // Admin panel keyboard shortcut (Ctrl+Shift+A / Cmd+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setShowAdmin(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Admin panel hash fragment support (#admin, #admin/components, #admin/tasks)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#admin')) {
        setShowAdmin(true);
        if (hash === '#admin/tasks') {
          setAdminTab('tasks');
        } else {
          setAdminTab('components');
        }
      }
    };
    handleHashChange(); // Check on mount
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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
      setInitError(null);

      // Log deployment version
      const deploymentVersion = document.querySelector('meta[name="deployment-version"]')?.getAttribute('content');
      const buildTime = document.querySelector('meta[name="deployment-version"]')?.getAttribute('data-build-time');
      logger.debug('Deployment Version:', deploymentVersion, 'Build Time:', buildTime);

      // Check connection before loading data
      logger.debug('Checking Supabase connection...');
      const healthCheck = await checkSupabaseConnection();

      if (healthCheck.status === ConnectionStatus.DISCONNECTED) {
        throw healthCheck.error || new Error('Unable to connect to database');
      }

      if (healthCheck.status === ConnectionStatus.DEGRADED) {
        logger.warn('Slow connection detected. Latency:', healthCheck.latency, 'ms');
      } else {
        logger.debug('Connection healthy. Latency:', healthCheck.latency, 'ms');
      }

      // Load topics from Supabase (with automatic retry via wrapper)
      const topicRepo = getTopicRepository();
      const loadedTopics = await topicRepo.getAll();
      logger.debug(`Loaded ${loadedTopics.length} topics from Supabase`);

      setTopics(loadedTopics);
      setIsLoading(false);
    } catch (error: unknown) {
      const structuredError = handleComponentError(error, 'initializeApp');
      setInitError(structuredError);
      setIsLoading(false);
    }
  }

  async function selectTopic(topic: Topic) {
    setSelectedTopic(topic);

    // Load learning paths for this topic
    const learningPathRepo = getLearningPathRepository();
    const taskRepo = getTaskRepository();

    const paths = await learningPathRepo.getByTopicId(topic.id);
    logger.debug(`Loading learning paths for topic ${topic.id}:`, paths);

    // Sort by createdAt (latest first)
    paths.sort((a: LearningPath, b: LearningPath) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Get actual task counts from database
    const taskCounts: Record<string, number> = {};
    for (const path of paths) {
      const tasks = await taskRepo.getByLearningPathId(path.id);
      taskCounts[path.id] = tasks.length;
      logger.debug(`Learning path "${path.title}" (${path.id}): ${tasks.length} tasks in DB, taskIds array length: ${path.taskIds?.length || 0}`);
      logger.debug('Task IDs:', tasks.map((t: Task) => t.id));
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
      const sessionRepo = getPracticeSessionRepository();
      const sessions = await sessionRepo.getCompleted(1);

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

  // Show Supabase login if not authenticated (required for all users)
  if (!authLoading && !isAuthenticated) {
    return (
      <div className={styles.authContainer}>
        <h1 className={styles.authTitle}>🧠 MindForge Academy</h1>
        <p className={styles.authSubtitle}>
          Erweitere dein Wissen, eine Frage nach der anderen
        </p>
        <p className={styles.authPrompt}>
          Bitte melden Sie sich an, um fortzufahren
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className={styles.authButton}
        >
          🔑 Anmelden
        </button>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <h1>🧠 MindForge Academy</h1>
        <p>Wird geladen...</p>
      </div>
    );
  }

  // Show error if initialization failed
  if (initError) {
    return (
      <div className={styles.errorContainer}>
        <h1>🧠 MindForge Academy</h1>
        <ErrorMessage
          error={initError}
          onRetry={() => {
            setInitError(null);
            setIsLoading(true);
            initializeApp();
          }}
          showDetails={true}
        />
      </div>
    );
  }

  // Show dashboard
  if (showDashboard) {
    return (
      <div className={styles.pageWrapper}>
        <Dashboard onClose={() => setShowDashboard(false)} />
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className={styles.pageWrapper}>
        <SettingsPage onClose={() => setShowSettings(false)} />
      </div>
    );
  }

  // Show admin panel
  if (showAdmin) {
    return (
      <div className={styles.pageWrapper}>
        <AdminPage
          activeTab={adminTab}
          onTabChange={setAdminTab}
          onClose={() => {
            setShowAdmin(false);
            window.location.hash = '';
          }}
        />
      </div>
    );
  }

  // Show session results
  if (completedSession) {
    return (
      <div className={styles.pageWrapper}>
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
      <div className={styles.sessionConfigContainer}>
        <button
          onClick={cancelSessionConfig}
          className={styles.backButton}
        >
          ← Zurück
        </button>

        <h1 className={styles.sessionConfigTitle}>Sitzung konfigurieren</h1>
        <p className={styles.sessionConfigSubtitle}>
          {selectedLearningPath.title}
        </p>

        <div className={styles.sessionConfigSection}>
          <label className={styles.sessionConfigLabel}>
            Anzahl der Fragen
          </label>
          <div className={styles.sessionConfigButtonGroup}>
            {[5, 10, 15, 20].map((count) => (
              <button
                key={count}
                onClick={() => setSessionConfig({ ...sessionConfig, targetCount: count })}
                className={`${styles.sessionConfigCountButton} ${sessionConfig.targetCount === count ? styles.active : ''}`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sessionConfigSection}>
          <label className={styles.sessionConfigCheckboxLabel}>
            <input
              type="checkbox"
              checked={sessionConfig.includeReview}
              onChange={(e) => setSessionConfig({ ...sessionConfig, includeReview: e.target.checked })}
              className={styles.sessionConfigCheckbox}
            />
            <span>Wiederholungsfragen einbeziehen</span>
          </label>
          <p className={styles.sessionConfigCheckboxDescription}>
            Fragen, die du bereits beantwortet hast und die zur Wiederholung fällig sind
          </p>
        </div>

        <button
          onClick={startPracticeSession}
          className={styles.sessionStartButton}
        >
          Sitzung starten →
        </button>
      </div>
    );
  }

  // Show practice session
  if (inSession && selectedLearningPath && selectedTopic) {
    return (
      <div className={styles.pageWrapper}>
        <PracticeSessionWrapper
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
      <div className={styles.learningPathContainer}>
        <button
          onClick={() => setSelectedTopic(null)}
          className={styles.backButton}
        >
          ← Zurück zu Themen
        </button>

        <h1>📚 {selectedTopic.title}</h1>

        <h2 className={styles.learningPathTitle}>Lernpfade</h2>
        <div className={styles.learningPathGrid}>
          {learningPaths.map((path, index) => (
            <LearningPathCard
              key={path.id}
              learningPath={path}
              taskCount={learningPathTaskCounts[path.id] || path.taskIds?.length || 0}
              onSelect={() => showConfigScreen(path)}
              animationIndex={index}
            />
          ))}
        </div>
      </div>
    );
  }

  

  // Convert Topic to TopicCardTopic
  function topicToCardTopic(topic: Topic): TopicCardTopic {
    const icon = topic.id === 'test' ? '🎯' : topic.id === 'mathematik' ? '🔢' : topic.id === 'spanisch' ? '🇪🇸' : topic.id === 'englisch' ? '🇬🇧' : '🧬';
    const color = topic.id === 'test' ? '#fef3c7' : topic.id === 'mathematik' ? '#dbeafe' : topic.id === 'spanisch' ? '#fef3c7' : '#dcfce7';

    return {
      id: topic.id,
      name: topic.title,
      description: `${topic.learningPathIds?.length || 0} Lernpfade`,
      icon,
      color,
    };
  }

  const deploymentVersion = document.querySelector('meta[name="deployment-version"]')?.getAttribute('content') || 'unknown';

  // Show auth modal if not authenticated (and not in loading state)
  if (!authLoading && !isAuthenticated && showAuthModal) {
    return (
      <div>
        <AuthModal onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <div className={styles.mainHeader}>
        <div>
          <h1>🧠 MindForge Academy</h1>
          <p className={styles.mainHeaderTitle}>
            Erweitere dein Wissen, eine Frage nach der anderen
          </p>
          <p className={styles.mainHeaderVersion}>
            v{deploymentVersion}
            {isAuthenticated && user && (
              <span className={styles.mainHeaderUserInfo}>| 👤 {user.email}</span>
            )}
          </p>
        </div>
        <div className={styles.mainHeaderActions}>
          {!isAuthenticated && (
            <button
              onClick={() => setShowAuthModal(true)}
              className={`${styles.mainActionButton} ${styles.loginButton}`}
            >
              🔑 Anmelden
            </button>
          )}
          {isAuthenticated && (
            <button
              onClick={() => signOut()}
              className={`${styles.mainActionButton} ${styles.logoutButton}`}
            >
              👋 Abmelden
            </button>
          )}
          <button
            onClick={cycleThemeMode}
            title={`Theme wechseln (aktuell: ${themeLabel})`}
            className={`${styles.mainActionButton} ${styles.themeButton}`}
          >
            🌓 {themeLabel}
          </button>
          <button
            onClick={() => setShowDashboard(true)}
            className={`${styles.mainActionButton} ${styles.dashboardButton}`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className={`${styles.mainActionButton} ${styles.settingsButton}`}
          >
            ⚙️ Einstellungen
          </button>
          <button
            onClick={() => setShowAdmin(true)}
            className={`${styles.mainActionButton} ${styles.adminButton}`}
            title="Keyboard shortcut: Ctrl+Shift+A"
          >
            🔧 Admin
          </button>
        </div>
      </div>

      <h2 className={styles.topicsHeading}>Themen auswählen</h2>
      <div className={styles.topicsGrid}>
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

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  return (
    <ErrorBoundary showDetails={true}>
      <AuthProvider>
        <AppContent />
        <ConnectionStatusIndicator position="top-right" showWhenConnected={false} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
