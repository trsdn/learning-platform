import React, { useEffect, useState } from 'react';
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
  const [selectedLearningPath, setSelectedLearningPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inSession, setInSession] = useState(false);
  const [completedSession, setCompletedSession] = useState<IPracticeSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initializeApp();
    }
  }, [isInitialized]);

  async function initializeApp() {
    try {
      // Check if database has data
      const topicCount = await db.topics.count();

      if (topicCount === 0) {
        console.log('Seeding database with sample data...');
        await seedDatabase(db);
      }

      // Load topics
      const loadedTopics = await db.topics.toArray();
      setTopics(loadedTopics);
      setIsLoading(false);
      setIsInitialized(true);
    } catch (error: any) {
      console.error('Failed to initialize app:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        failures: error?.failures,
        stack: error?.stack,
      });
      setIsLoading(false);
      setIsInitialized(true);
    }
  }

  async function selectTopic(topic: Topic) {
    setSelectedTopic(topic);
    const paths = await db.learningPaths.where('topicId').equals(topic.id).toArray();
    setLearningPaths(paths);
  }

  function startPracticeSession(learningPath: LearningPath) {
    setSelectedLearningPath(learningPath);
    setInSession(true);
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
        <h1>🎓 Lernplattform</h1>
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

  // Show practice session
  if (inSession && selectedLearningPath && selectedTopic) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <PracticeSession
          topicId={selectedTopic.id}
          learningPathIds={[selectedLearningPath.id]}
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
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>{selectedTopic.description}</p>

        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            <span style={{ marginRight: '1.5rem' }}>
              ⏱️ {selectedTopic.metadata.estimatedHours} Stunden
            </span>
            <span>
              📊 Niveau:{' '}
              {selectedTopic.metadata.difficultyLevel === 'beginner'
                ? 'Anfänger'
                : selectedTopic.metadata.difficultyLevel === 'intermediate'
                ? 'Fortgeschritten'
                : 'Experte'}
            </span>
          </div>
        </div>

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
                <span>{path.taskIds.length} Aufgaben</span>
              </div>
              <button
                onClick={() => startPracticeSession(path)}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>🎓 Deutsche Lernplattform</h1>
          <p style={{ fontSize: '1.1rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Lernen mit Spaced Repetition Algorithmus
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

      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#dcfce7',
          borderRadius: '8px',
          border: '2px solid #86efac',
        }}
      >
        <h3 style={{ marginBottom: '0.5rem' }}>✅ System Bereit</h3>
        <ul style={{ fontSize: '0.9rem', lineHeight: '1.8', marginLeft: '1.5rem' }}>
          <li>SM-2 Spaced Repetition Algorithmus implementiert</li>
          <li>IndexedDB mit Dexie.js konfiguriert</li>
          <li>{topics.length} Themen geladen</li>
          <li>PWA Service Worker aktiv</li>
        </ul>
      </div>

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Themen auswählen</h2>
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
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.8 }}>
              {topic.description}
            </p>
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