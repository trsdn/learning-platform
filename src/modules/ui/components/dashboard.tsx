import { useEffect, useState } from 'react';
import { db } from '@storage/database';
import type { PracticeSession } from '@core/types/services';
import { StatCard } from './common/StatCard';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { MasteryBar } from './common/MasteryBar';
import { colors } from '@ui/design-tokens';
import styles from './dashboard.module.css';

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
      <div className={styles['dashboard__empty']} style={{ textAlign: 'center' }}>
        <h1>📊 Dashboard</h1>
        <p>Lade Statistiken...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles['dashboard__empty']}>
        <Button variant="secondary" onClick={onClose} className={styles['dashboard__back-button']}>
          ← Zurück
        </Button>
        <h1>📊 Dashboard</h1>
        <p>Keine Daten verfügbar.</p>
      </div>
    );
  }

  return (
    <div className={styles['dashboard']}>
      {/* Header */}
      <div className={styles['dashboard__header']}>
        <Button variant="secondary" onClick={onClose} className={styles['dashboard__back-button']}>
          ← Zurück
        </Button>
        <h1 className={styles['dashboard__title']}>📊 Lern-Dashboard</h1>
        <p className={styles['dashboard__subtitle']}>
          Deine Fortschritte und Statistiken im Überblick
        </p>
      </div>

      {/* Key Metrics */}
      <div className={styles['dashboard__metrics']}>
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
      <Card padding="medium" className={styles['dashboard__mastery-card']}>
        <h2 className={styles['dashboard__mastery-title']}>🎯 Beherrschungsniveau</h2>
        <div className={styles['dashboard__mastery-bars']}>
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
          <MasteryBar label="Neu" count={stats.masteryLevels.new} color={colors.primary[500]} />
        </div>
      </Card>

      {/* Topic Progress */}
      {stats.topicProgress.length > 0 && (
        <Card padding="medium" className={styles['dashboard__topic-card']}>
          <h2 className={styles['dashboard__topic-title']}>📚 Fortschritt nach Thema</h2>
          <div className={styles['dashboard__topic-grid']}>
            {stats.topicProgress.map((topic) => (
              <div key={topic.topicId} className={styles['dashboard__topic-item']}>
                <div className={styles['dashboard__topic-header']}>
                  <span className={styles['dashboard__topic-name']}>
                    {topic.topicName}
                  </span>
                  <span className={styles['dashboard__topic-meta']}>
                    {topic.sessionsCompleted} Sitzungen • {Math.round(topic.accuracy)}% genau
                  </span>
                </div>
                <div className={styles['dashboard__topic-bar-container']}>
                  <div
                    className={styles['dashboard__topic-bar-fill']}
                    style={{
                      background:
                        topic.accuracy >= 75
                          ? colors.success[500]
                          : topic.accuracy >= 50
                          ? colors.warning[500]
                          : colors.error[500],
                      width: `${topic.accuracy}%`,
                    }}
                  />
                </div>
                <div className={styles['dashboard__topic-stats']}>
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
          <h2 className={styles['dashboard__sessions-title']}>🕐 Letzte Sitzungen</h2>
          <div className={styles['dashboard__sessions-list']}>
            {stats.recentSessions.map((session) => (
              <div
                key={session.id}
                className={styles['dashboard__session-item']}
              >
                <div className={styles['dashboard__session-left']}>
                  <div className={styles['dashboard__session-topic']}>
                    {session.configuration.topicId}
                  </div>
                  <div className={styles['dashboard__session-date']}>
                    {session.execution.completedAt && formatDate(session.execution.completedAt)}
                  </div>
                </div>
                <div className={styles['dashboard__session-right']}>
                  <div
                    className={styles['dashboard__session-accuracy']}
                    style={{
                      color:
                        session.results.accuracy >= 75
                          ? colors.success[500]
                          : colors.warning[500],
                    }}
                  >
                    {Math.round(session.results.accuracy)}%
                  </div>
                  <div className={styles['dashboard__session-stats']}>
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