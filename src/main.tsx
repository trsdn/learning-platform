import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {
  getTopicRepository,
  getLearningPathRepository,
  getTaskRepository,
  getPracticeSessionRepository,
} from './modules/storage/factory';
import type { Topic, LearningPath, Task, PracticeSession as IPracticeSession } from './modules/core/types/services';
import { PracticeSession } from './modules/ui/components/practice-session';
import { SessionResults } from './modules/ui/components/session-results';
import { Dashboard } from './modules/ui/components/dashboard';
import { TopicCard, type TopicCardTopic } from './modules/ui/components/TopicCard';
import { SettingsPage } from './modules/ui/components/settings/SettingsPage';
import { AdminPage, type AdminTab } from './modules/ui/components/admin/AdminPage';
import { AuthProvider, useAuth } from './modules/ui/contexts/auth-context';
import { AuthModal } from './modules/ui/components/auth/auth-modal';
import { settingsService } from '@core/services/settings-service';
import type { ThemeMode, AppSettings } from '@core/entities/app-settings';
import { ErrorBoundary, ConnectionStatusIndicator, ErrorMessage } from './modules/ui/components/error';
import { handleComponentError, type StructuredError } from './modules/core/utils/error-handler';
import { checkSupabaseConnection, ConnectionStatus } from './modules/core/utils/connection-health';
import './modules/ui/styles/variables.css';
import './modules/ui/styles/global.css';
import './modules/ui/styles/utilities.css';
import './modules/ui/components/auth/auth-modal.css';
import './index.css';

/**
 * German Learning Platform with Spaced Repetition
 */

if (typeof window !== 'undefined') {
  settingsService.load();
}

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
      console.log('🚀 Deployment Version:', deploymentVersion, 'Build Time:', buildTime);

      // Check connection before loading data
      console.log('Checking Supabase connection...');
      const healthCheck = await checkSupabaseConnection();

      if (healthCheck.status === ConnectionStatus.DISCONNECTED) {
        throw healthCheck.error || new Error('Unable to connect to database');
      }

      if (healthCheck.status === ConnectionStatus.DEGRADED) {
        console.warn('⚠️ Slow connection detected. Latency:', healthCheck.latency, 'ms');
      } else {
        console.log('✅ Connection healthy. Latency:', healthCheck.latency, 'ms');
      }

      // Load topics from Supabase (with automatic retry via wrapper)
      const topicRepo = getTopicRepository();
      const loadedTopics = await topicRepo.getAll();
      console.log(`Loaded ${loadedTopics.length} topics from Supabase`);

      setTopics(loadedTopics);
      setIsLoading(false);
    } catch (error: any) {
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
    console.log(`Loading learning paths for topic ${topic.id}:`, paths);

    // Sort by createdAt (latest first)
    paths.sort((a: LearningPath, b: LearningPath) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Get actual task counts from database
    const taskCounts: Record<string, number> = {};
    for (const path of paths) {
      const tasks = await taskRepo.getByLearningPathId(path.id);
      taskCounts[path.id] = tasks.length;
      console.log(`Learning path "${path.title}" (${path.id}): ${tasks.length} tasks in DB, taskIds array length: ${path.taskIds?.length || 0}`);
      console.log('Task IDs:', tasks.map((t: Task) => t.id));
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠 MindForge Academy</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '500px' }}>
          Erweitere dein Wissen, eine Frage nach der anderen
        </p>
        <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
          Bitte melden Sie sich an, um fortzufahren
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
        >
          🔑 Anmelden
        </button>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
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

  // Show error if initialization failed
  if (initError) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
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

  // Show admin panel
  if (showAdmin) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
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
      // With Supabase, data is managed in the cloud by admins
      // This function is kept for compatibility with event handlers
      console.log('Reseed not needed with Supabase - data is managed in the cloud');

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
  }

  async function handleFullReset() {
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
  }

  // Convert Topic to TopicCardTopic
  function topicToCardTopic(topic: Topic): TopicCardTopic {
    const icon = topic.id === 'test' ? '🎯' : topic.id === 'mathematik' ? '🔢' : topic.id === 'spanisch' ? '🇪🇸' : topic.id === 'englisch' ? '🇬🇧' : '🧬';
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

  // Show auth modal if not authenticated (and not in loading state)
  if (!authLoading && !isAuthenticated && showAuthModal) {
    return (
      <div>
        <AuthModal onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>🧠 MindForge Academy</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            Erweitere dein Wissen, eine Frage nach der anderen
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary, #999)', marginTop: '0.25rem' }}>
            v{deploymentVersion}
            {isAuthenticated && user && (
              <span style={{ marginLeft: '0.5rem' }}>| 👤 {user.email}</span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isAuthenticated && (
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--color-success)',
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
              🔑 Anmelden
            </button>
          )}
          {isAuthenticated && (
            <button
              onClick={() => signOut()}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--color-secondary)',
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
              👋 Abmelden
            </button>
          )}
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
          <button
            onClick={() => setShowAdmin(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--color-secondary)',
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
            title="Keyboard shortcut: Ctrl+Shift+A"
          >
            🔧 Admin
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
