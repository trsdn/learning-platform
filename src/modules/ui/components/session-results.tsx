import type { PracticeSession } from '@core/types/services';
import { StatCard } from './common/StatCard';
import { Button } from './common/Button';
import { Card } from './common/Card';
import styles from './session-results.module.css';

interface Props {
  session: PracticeSession;
  onClose: () => void;
  onStartNew: () => void;
}

export function SessionResults({ session, onClose, onStartNew }: Props) {
  const accuracy = session.results.accuracy;
  const averageTime = Math.round(session.results.averageTime);

  // Calculate performance rating
  let performanceRating = '';
  let performanceColor = '';
  if (accuracy >= 90) {
    performanceRating = 'Ausgezeichnet!';
    performanceColor = 'var(--color-success)';
  } else if (accuracy >= 75) {
    performanceRating = 'Sehr gut!';
    performanceColor = 'var(--color-primary)';
  } else if (accuracy >= 60) {
    performanceRating = 'Gut gemacht!';
    performanceColor = 'var(--color-warning)';
  } else {
    performanceRating = 'Weiter üben!';
    performanceColor = 'var(--color-error)';
  }

  // Format time
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')} min`;
    }
    return `${secs} sek`;
  }

  return (
    <div className={styles['session-results']}>
      {/* Header */}
      <div className={styles['session-results__header']}>
        <div className={styles['session-results__emoji']}>🎉</div>
        <h1 className={styles['session-results__title']}>Sitzung abgeschlossen!</h1>
        <p
          className={styles['session-results__rating']}
          // eslint-disable-next-line no-restricted-syntax -- Dynamic color based on performance
          style={{ color: performanceColor }}
        >
          {performanceRating}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className={styles['session-results__stats']}>
        <StatCard
          title="Aufgaben bearbeitet"
          value={session.execution.completedCount}
          color="var(--color-primary)"
        />

        <StatCard
          title="Richtige Antworten"
          value={session.execution.correctCount}
          color="var(--color-success)"
        />

        <StatCard
          title="Genauigkeit"
          value={`${Math.round(accuracy)}%`}
          color={performanceColor}
        />

        <StatCard
          title="Ø Zeit pro Aufgabe"
          value={formatTime(averageTime)}
          color="var(--color-warning)"
        />
      </div>

      {/* Total Time */}
      <Card
        padding="medium"
        className={styles['session-results__time-card']}
      >
        <p className={styles['session-results__time-text']}>
          <strong>Gesamtzeit:</strong> {formatTime(session.execution.totalTimeSpent)}
        </p>
      </Card>

      {/* Progress Message */}
      <Card padding="large" className={styles['session-results__progress-card']}>
        <h3 className={styles['session-results__progress-title']}>📈 Dein Fortschritt</h3>
        <p className={styles['session-results__progress-text']}>
          {accuracy >= 90 && 'Hervorragende Leistung! Du beherrschst dieses Thema sehr gut.'}
          {accuracy >= 75 && accuracy < 90 && 'Sehr gute Arbeit! Du machst große Fortschritte.'}
          {accuracy >= 60 && accuracy < 75 && 'Gute Arbeit! Weiter so, du verbesserst dich stetig.'}
          {accuracy < 60 &&
            'Bleib dran! Übung macht den Meister. Die nächste Sitzung wird noch besser!'}
        </p>
      </Card>

      {/* Actions */}
      <div className={styles['session-results__actions']}>
        <Button onClick={onStartNew} variant="primary">
          Neue Sitzung starten
        </Button>
        <Button onClick={onClose} variant="secondary">
          Zurück zur Übersicht
        </Button>
      </div>
    </div>
  );
}
