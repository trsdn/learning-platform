import { useEffect, useState } from 'react';
import { db } from '@storage/database';
import type { PracticeSession } from '@core/types/services';
import { StatCard } from './common/StatCard';
import { Card } from './common/Card';

interface DashboardStats {
  totalSessions: number;
  completedSessions: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracyRate: number;
  averageSessionTime: number;
  currentStreak: number;
  totalStudyTime: number;
  topicProgress: Array<{
    topicId: string;
    topicName: string;
    sessionsCompleted: number;
    accuracy: number;
    tasksReviewed: number;
  }>;
  recentSessions: PracticeSession[];
  upcomingReviews: number;
  masteryLevels: {
    mastered: number;
    learning: number;
    new: number;
  };
}

interface DashboardProps {
  onClose: () => void;
}

export function Dashboard({ onClose }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    try {
      // Load all sessions
      const allSessions = await db.practiceSessions.toArray();
      const completedSessions = allSessions.filter((s) => s.execution.status === 'completed');

      // Load topics for names
      const topics = await db.topics.toArray();
      const topicMap = new Map(topics.map((t) => [t.id, t]));

      // Load spaced repetition items for mastery levels
      const srItems = await db.spacedRepetition.toArray();

      // Calculate overall stats
      const totalQuestions = completedSessions.reduce(
        (sum, s) => sum + (s.execution?.completedCount || 0),
        0
      );
      const correctAnswers = completedSessions.reduce(
        (sum, s) => sum + (s.execution?.correctCount || 0),
        0
      );
      const accuracyRate = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      const totalStudyTime = completedSessions.reduce((sum, s) => {
        if (s.execution.startedAt && s.execution.completedAt) {
          return (
            sum +
            (new Date(s.execution.completedAt).getTime() -
              new Date(s.execution.startedAt).getTime()) /
              1000
          );
        }
        return sum;
      }, 0);

      const averageSessionTime =
        completedSessions.length > 0 ? totalStudyTime / completedSessions.length : 0;

      // Calculate topic progress
      const topicStatsMap = new Map<
        string,
        { sessions: number; correct: number; total: number }
      >();

      for (const session of completedSessions) {
        const topicId = session.configuration.topicId;
        if (!topicStatsMap.has(topicId)) {
          topicStatsMap.set(topicId, { sessions: 0, correct: 0, total: 0 });
        }
        const topicStats = topicStatsMap.get(topicId)!;
        topicStats.sessions++;
        topicStats.correct += session.execution?.correctCount || 0;
        topicStats.total += session.execution?.completedCount || 0;
      }

      const topicProgress = Array.from(topicStatsMap.entries()).map(
        ([topicId, data]) => ({
          topicId,
          topicName: topicMap.get(topicId)?.title || topicId,
          sessionsCompleted: data.sessions,
          accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
          tasksReviewed: data.total,
        })
      );

      // Calculate mastery levels
      const now = new Date();
      const mastered = srItems.filter((item) => item.algorithm.efactor >= 2.5).length;
      const learning = srItems.filter(
        (item) => item.algorithm.efactor < 2.5 && item.algorithm.repetition > 0
      ).length;
      const newItems = srItems.filter((item) => item.algorithm.repetition === 0).length;

      // Upcoming reviews
      const upcomingReviews = srItems.filter(
        (item) => new Date(item.schedule.nextReview) <= now
      ).length;

      // Recent sessions (last 5)
      const recentSessions = completedSessions
        .sort((a, b) => {
          const aTime = a.execution.completedAt
            ? new Date(a.execution.completedAt).getTime()
            : 0;
          const bTime = b.execution.completedAt
            ? new Date(b.execution.completedAt).getTime()
            : 0;
          return bTime - aTime;
        })
        .slice(0, 5);

      setStats({
        totalSessions: allSessions.length,
        completedSessions: completedSessions.length,
        totalQuestions,
        correctAnswers,
        accuracyRate,
        averageSessionTime,
        currentStreak: 0, // TODO: Calculate from session dates
        totalStudyTime,
        topicProgress,
        recentSessions,
        upcomingReviews,
        masteryLevels: {
          mastered,
          learning,
          new: newItems,
        },
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <h1>📊 Dashboard</h1>
        <p>Lade Statistiken...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <button
          onClick={onClose}
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
        <h1>📊 Dashboard</h1>
        <p>Keine Daten verfügbar.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={onClose}
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
        <h1 style={{ margin: 0 }}>📊 Lern-Dashboard</h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Deine Fortschritte und Statistiken im Überblick
        </p>
      </div>

      {/* Key Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          title="Gesamt Sitzungen"
          value={stats.completedSessions.toString()}
          subtitle={`von ${stats.totalSessions} gestartet`}
          color="#3b82f6"
        />
        <StatCard
          title="Genauigkeit"
          value={`${Math.round(stats.accuracyRate)}%`}
          subtitle={`${stats.correctAnswers}/${stats.totalQuestions} richtig`}
          color="#10b981"
        />
        <StatCard
          title="Lernzeit"
          value={formatTime(stats.totalStudyTime)}
          subtitle={`Ø ${formatTime(stats.averageSessionTime)} pro Sitzung`}
          color="#f59e0b"
        />
        <StatCard
          title="Anstehende Wiederholungen"
          value={stats.upcomingReviews.toString()}
          subtitle="bereit zum Üben"
          color="#8b5cf6"
        />
      </div>

      {/* Mastery Levels */}
      <Card padding="medium" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>🎯 Beherrschungsniveau</h2>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <MasteryBar
            label="Gemeistert"
            count={stats.masteryLevels.mastered}
            color="#10b981"
          />
          <MasteryBar
            label="In Arbeit"
            count={stats.masteryLevels.learning}
            color="#f59e0b"
          />
          <MasteryBar
            label="Neu"
            count={stats.masteryLevels.new}
            color="#6b7280"
          />
        </div>
      </Card>

      {/* Topic Progress */}
      {stats.topicProgress.length > 0 && (
        <Card padding="medium" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0 }}>📚 Fortschritt nach Thema</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {stats.topicProgress.map((topic) => (
              <div key={topic.topicId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500' }}>{topic.topicName}</span>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {topic.sessionsCompleted} Sitzungen • {Math.round(topic.accuracy)}% genau
                  </span>
                </div>
                <div style={{ background: '#f3f4f6', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      background: topic.accuracy >= 75 ? '#10b981' : topic.accuracy >= 50 ? '#f59e0b' : '#ef4444',
                      height: '100%',
                      width: `${topic.accuracy}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  {topic.tasksReviewed} Aufgaben bearbeitet
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Sessions */}
      {stats.recentSessions.length > 0 && (
        <Card padding="medium">
          <h2 style={{ marginTop: 0 }}>🕐 Letzte Sitzungen</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {stats.recentSessions.map((session) => (
              <div
                key={session.id}
                style={{
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: '500' }}>{session.configuration.topicId}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {session.execution.completedAt && formatDate(session.execution.completedAt)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '500', color: session.results.accuracy >= 75 ? '#10b981' : '#f59e0b' }}>
                    {Math.round(session.results.accuracy)}%
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {session.execution.correctCount}/{session.execution.completedCount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

interface MasteryBarProps {
  label: string;
  count: number;
  color: string;
}

function MasteryBar({ label, count, color }: MasteryBarProps) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{count}</span>
      </div>
      <div style={{ background: '#f3f4f6', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
        <div
          style={{
            background: color,
            height: '100%',
            width: count > 0 ? '100%' : '0%',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}