import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { db } from './modules/storage/database';
import { seedDatabase } from './modules/storage/seed-data';
import type { Topic, LearningPath, PracticeSession as IPracticeSession } from './modules/core/types/services';
import { PracticeSession } from './modules/ui/components/practice-session';
import { SessionResults } from './modules/ui/components/session-results';
import { Dashboard } from './modules/ui/components/dashboard';
import './index.css';

/**
 * German Learning Platform with Spaced Repetition
 */

function App() {
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
  const initStarted = useRef(false);

  useEffect(() => {
    if (!initStarted.current) {
      initStarted.current = true;
      initializeApp();
    }
  }, []);

  async function initializeApp() {
    try {
      // Check if database has data
      const topicCount = await db.topics.count();
      const taskCount = await db.tasks.count();

      console.log(`Database status: ${topicCount} topics, ${taskCount} tasks`);

      if (topicCount === 0 || taskCount === 0) {
        console.log('Database empty or incomplete, seeding...');
        await seedDatabase(db);
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
            background: '#e5e7eb',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          ← Zurück
        </button>

        <h1 style={{ marginBottom: '0.5rem' }}>Sitzung konfigurieren</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
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
                  background: sessionConfig.targetCount === count ? '#3b82f6' : '#f3f4f6',
                  color: sessionConfig.targetCount === count ? 'white' : '#374151',
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
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem', marginLeft: '1.75rem' }}>
            Fragen, die du bereits beantwortet hast und die zur Wiederholung fällig sind
          </p>
        </div>

        <button
          onClick={startPracticeSession}
          style={{
            padding: '1rem 2rem',
            background: '#3b82f6',
            color: 'white',
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
            background: '#e5e7eb',
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
                background: '#ffffff',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h3 style={{ marginBottom: '0.5rem' }}>{path.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
                {path.description}
              </p>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
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
                  background: '#3b82f6',
                  color: 'white',
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

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>🧠 MindForge Academy</h1>
          <p style={{ fontSize: '1.1rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Level up your brain, one question at a time
          </p>
        </div>
        <button
          onClick={() => setShowDashboard(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
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
          <div
            key={topic.id}
            onClick={() => selectTopic(topic)}
            style={{
              padding: '2rem',
              background: topic.id === 'mathematik' ? '#dbeafe' : '#dcfce7',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: '2px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <h2 style={{ marginBottom: '0.5rem' }}>
              {topic.id === 'mathematik' ? '🔢' : '🧬'} {topic.title}
            </h2>
            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
              {topic.learningPathIds.length} Lernpfade
            </div>
          </div>
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