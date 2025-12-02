import type { Meta, StoryObj } from '@storybook/react';

import { StatCard } from './common/StatCard';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { MasteryBar } from './common/MasteryBar';
import { colors } from '@ui/design-tokens';

// Since Dashboard loads data from repositories, we create a mock version for Storybook
// that displays the UI without the data fetching logic

const meta = {
  title: 'Features/Dashboard',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type RenderStory = StoryObj<Meta>;

// Mock Dashboard component for Storybook
interface MockDashboardStats {
  completedSessions: number;
  totalSessions: number;
  accuracyRate: number;
  correctAnswers: number;
  totalQuestions: number;
  totalStudyTime: number;
  averageSessionTime: number;
  upcomingReviews: number;
  masteryLevels: {
    mastered: number;
    learning: number;
    new: number;
  };
  topicProgress: Array<{
    topicId: string;
    topicName: string;
    sessionsCompleted: number;
    accuracy: number;
    tasksReviewed: number;
  }>;
  recentSessions: Array<{
    id: string;
    topicId: string;
    completedAt: string;
    accuracy: number;
    correctCount: number;
    completedCount: number;
  }>;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

const MockDashboard = ({
  stats,
  onClose,
  isLoading = false,
}: {
  stats: MockDashboardStats | null;
  onClose: () => void;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Dashboard</h1>
        <p>Lade Statistiken...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Button variant="secondary" onClick={onClose}>
          Zurück
        </Button>
        <h1>Dashboard</h1>
        <p>Keine Daten verfügbar.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Button variant="secondary" onClick={onClose} style={{ marginBottom: '1rem' }}>
           Zurück
        </Button>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>Lern-Dashboard</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Deine Fortschritte und Statistiken im Überblick
        </p>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <StatCard
          title="Gesamt Sitzungen"
          value={stats.completedSessions.toString()}
          subtitle={`von ${stats.totalSessions} gestartet`}
          color={colors.primary[500]}
        />
        <StatCard
          title="Genauigkeit"
          value={`${Math.round(stats.accuracyRate)}%`}
          subtitle={`${stats.correctAnswers}/${stats.totalQuestions} richtig`}
          color={colors.success[500]}
        />
        <StatCard
          title="Lernzeit"
          value={formatTime(stats.totalStudyTime)}
          subtitle={`Ø ${formatTime(stats.averageSessionTime)} pro Sitzung`}
          color={colors.warning[500]}
        />
        <StatCard
          title="Anstehende Wiederholungen"
          value={stats.upcomingReviews.toString()}
          subtitle="bereit zum Üben"
          color={colors.info[500]}
        />
      </div>

      {/* Mastery Levels */}
      <Card padding="medium" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 1rem 0' }}>Beherrschungsniveau</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <MasteryBar
            label="Gemeistert"
            count={stats.masteryLevels.mastered}
            color={colors.success[500]}
          />
          <MasteryBar
            label="In Arbeit"
            count={stats.masteryLevels.learning}
            color={colors.warning[500]}
          />
          <MasteryBar
            label="Neu"
            count={stats.masteryLevels.new}
            color={colors.primary[500]}
          />
        </div>
      </Card>

      {/* Topic Progress */}
      {stats.topicProgress.length > 0 && (
        <Card padding="medium" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem 0' }}>Fortschritt nach Thema</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.topicProgress.map((topic) => (
              <div key={topic.topicId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: '500' }}>{topic.topicName}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {topic.sessionsCompleted} Sitzungen • {Math.round(topic.accuracy)}%
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'var(--border-color)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${topic.accuracy}%`,
                    background: topic.accuracy >= 75 ? colors.success[500] :
                               topic.accuracy >= 50 ? colors.warning[500] : colors.error[500],
                    borderRadius: '4px',
                  }} />
                </div>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {topic.tasksReviewed} Aufgaben bearbeitet
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Sessions */}
      {stats.recentSessions.length > 0 && (
        <Card padding="medium">
          <h2 style={{ margin: '0 0 1rem 0' }}>Letzte Sitzungen</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentSessions.map((session) => (
              <div
                key={session.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'var(--background-color)',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: '500' }}>{session.topicId}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(session.completedAt).toLocaleDateString('de-DE')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontWeight: '600',
                    color: session.accuracy >= 75 ? colors.success[500] : colors.warning[500],
                  }}>
                    {Math.round(session.accuracy)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {session.correctCount}/{session.completedCount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Mock data sets
const fullStats: MockDashboardStats = {
  completedSessions: 42,
  totalSessions: 45,
  accuracyRate: 78,
  correctAnswers: 312,
  totalQuestions: 400,
  totalStudyTime: 18000, // 5 hours
  averageSessionTime: 428, // ~7 min
  upcomingReviews: 15,
  masteryLevels: {
    mastered: 45,
    learning: 30,
    new: 25,
  },
  topicProgress: [
    { topicId: 'german-articles', topicName: 'German Articles', sessionsCompleted: 15, accuracy: 85, tasksReviewed: 150 },
    { topicId: 'german-verbs', topicName: 'German Verbs', sessionsCompleted: 12, accuracy: 72, tasksReviewed: 120 },
    { topicId: 'german-nouns', topicName: 'German Nouns', sessionsCompleted: 10, accuracy: 68, tasksReviewed: 100 },
    { topicId: 'german-phrases', topicName: 'German Phrases', sessionsCompleted: 5, accuracy: 90, tasksReviewed: 30 },
  ],
  recentSessions: [
    { id: '1', topicId: 'German Articles', completedAt: '2024-01-15', accuracy: 90, correctCount: 9, completedCount: 10 },
    { id: '2', topicId: 'German Verbs', completedAt: '2024-01-14', accuracy: 70, correctCount: 7, completedCount: 10 },
    { id: '3', topicId: 'German Nouns', completedAt: '2024-01-13', accuracy: 80, correctCount: 8, completedCount: 10 },
    { id: '4', topicId: 'German Phrases', completedAt: '2024-01-12', accuracy: 100, correctCount: 10, completedCount: 10 },
    { id: '5', topicId: 'German Articles', completedAt: '2024-01-11', accuracy: 60, correctCount: 6, completedCount: 10 },
  ],
};

const newUserStats: MockDashboardStats = {
  completedSessions: 2,
  totalSessions: 3,
  accuracyRate: 65,
  correctAnswers: 13,
  totalQuestions: 20,
  totalStudyTime: 600, // 10 min
  averageSessionTime: 300, // 5 min
  upcomingReviews: 3,
  masteryLevels: {
    mastered: 0,
    learning: 5,
    new: 15,
  },
  topicProgress: [
    { topicId: 'german-basics', topicName: 'German Basics', sessionsCompleted: 2, accuracy: 65, tasksReviewed: 20 },
  ],
  recentSessions: [
    { id: '1', topicId: 'German Basics', completedAt: '2024-01-15', accuracy: 70, correctCount: 7, completedCount: 10 },
    { id: '2', topicId: 'German Basics', completedAt: '2024-01-14', accuracy: 60, correctCount: 6, completedCount: 10 },
  ],
};

const expertUserStats: MockDashboardStats = {
  completedSessions: 150,
  totalSessions: 150,
  accuracyRate: 94,
  correctAnswers: 1410,
  totalQuestions: 1500,
  totalStudyTime: 72000, // 20 hours
  averageSessionTime: 480, // 8 min
  upcomingReviews: 45,
  masteryLevels: {
    mastered: 180,
    learning: 15,
    new: 5,
  },
  topicProgress: [
    { topicId: 'german-articles', topicName: 'German Articles', sessionsCompleted: 40, accuracy: 98, tasksReviewed: 400 },
    { topicId: 'german-verbs', topicName: 'German Verbs', sessionsCompleted: 35, accuracy: 95, tasksReviewed: 350 },
    { topicId: 'german-nouns', topicName: 'German Nouns', sessionsCompleted: 30, accuracy: 92, tasksReviewed: 300 },
    { topicId: 'german-phrases', topicName: 'German Phrases', sessionsCompleted: 25, accuracy: 96, tasksReviewed: 250 },
    { topicId: 'german-grammar', topicName: 'German Grammar', sessionsCompleted: 20, accuracy: 88, tasksReviewed: 200 },
  ],
  recentSessions: [
    { id: '1', topicId: 'German Grammar', completedAt: '2024-01-15', accuracy: 90, correctCount: 9, completedCount: 10 },
    { id: '2', topicId: 'German Verbs', completedAt: '2024-01-15', accuracy: 100, correctCount: 10, completedCount: 10 },
    { id: '3', topicId: 'German Articles', completedAt: '2024-01-14', accuracy: 100, correctCount: 10, completedCount: 10 },
    { id: '4', topicId: 'German Nouns', completedAt: '2024-01-14', accuracy: 90, correctCount: 9, completedCount: 10 },
    { id: '5', topicId: 'German Phrases', completedAt: '2024-01-13', accuracy: 100, correctCount: 10, completedCount: 10 },
  ],
};

// Stories
export const Default: RenderStory = {
  render: () => (
    <MockDashboard
      stats={fullStats}
      onClose={() => console.log('Close dashboard')}
    />
  ),
};

export const NewUser: RenderStory = {
  render: () => (
    <MockDashboard
      stats={newUserStats}
      onClose={() => console.log('Close dashboard')}
    />
  ),
};

export const ExpertUser: RenderStory = {
  render: () => (
    <MockDashboard
      stats={expertUserStats}
      onClose={() => console.log('Close dashboard')}
    />
  ),
};

export const Loading: RenderStory = {
  render: () => (
    <MockDashboard
      stats={null}
      onClose={() => console.log('Close dashboard')}
      isLoading={true}
    />
  ),
};

export const NoData: RenderStory = {
  render: () => (
    <MockDashboard
      stats={null}
      onClose={() => console.log('Close dashboard')}
      isLoading={false}
    />
  ),
};
