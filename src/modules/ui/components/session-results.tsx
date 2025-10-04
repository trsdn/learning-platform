import type { PracticeSession } from '@core/types/services';
import { StatCard } from './common/StatCard';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { FeedbackCard } from './common/FeedbackCard';
import { semanticColors, spacing, typography, colors } from '@ui/design-tokens';

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
    performanceColor = colors.success[500];
  } else if (accuracy >= 75) {
    performanceRating = 'Sehr gut!';
    performanceColor = colors.primary[500];
  } else if (accuracy >= 60) {
    performanceRating = 'Gut gemacht!';
    performanceColor = colors.warning[500];
  } else {
    performanceRating = 'Weiter üben!';
    performanceColor = colors.error[500];
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
    <div
      style={{
        padding: spacing[8],
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: spacing[8] }}>
        <div style={{ fontSize: '4rem', marginBottom: spacing[4] }}>🎉</div>
        <h1 style={{ marginBottom: spacing[2] }}>Sitzung abgeschlossen!</h1>
        <p
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: performanceColor,
            margin: 0,
          }}
        >
          {performanceRating}
        </p>
      </div>

      {/* Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: spacing[4],
          marginBottom: spacing[8],
        }}
      >
        <StatCard
          title="Aufgaben bearbeitet"
          value={session.execution.completedCount}
          color={colors.primary[500]}
        />

        <StatCard
          title="Richtige Antworten"
          value={session.execution.correctCount}
          color={colors.success[500]}
        />

        <StatCard
          title="Genauigkeit"
          value={`${Math.round(accuracy)}%`}
          color={performanceColor}
        />

        <StatCard
          title="Ø Zeit pro Aufgabe"
          value={formatTime(averageTime)}
          color={colors.warning[500]}
        />
      </div>

      {/* Total Time */}
      <Card
        padding="medium"
        style={{
          backgroundColor: colors.primary[100],
          marginBottom: spacing[8],
        }}
      >
        <p style={{ margin: 0, fontSize: typography.fontSize.base }}>
          <strong>Gesamtzeit:</strong> {formatTime(session.execution.totalTimeSpent)}
        </p>
      </Card>

      {/* Progress Message */}
      <Card padding="large" style={{ marginBottom: spacing[8] }}>
        <h3 style={{ marginBottom: spacing[2] }}>📈 Dein Fortschritt</h3>
        <p
          style={{
            margin: 0,
            fontSize: typography.fontSize.base,
            color: semanticColors.text.secondary,
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          {accuracy >= 90 && 'Hervorragende Leistung! Du beherrschst dieses Thema sehr gut.'}
          {accuracy >= 75 && accuracy < 90 && 'Sehr gute Arbeit! Du machst große Fortschritte.'}
          {accuracy >= 60 && accuracy < 75 && 'Gute Arbeit! Weiter so, du verbesserst dich stetig.'}
          {accuracy < 60 &&
            'Bleib dran! Übung macht den Meister. Die nächste Sitzung wird noch besser!'}
        </p>
      </Card>

      {/* Spaced Repetition Info */}
      <FeedbackCard variant="success" style={{ marginBottom: spacing[8] }}>
        <h4 style={{ marginBottom: spacing[2] }}>🧠 Spaced Repetition aktiviert</h4>
        <p
          style={{
            margin: 0,
            fontSize: typography.fontSize.sm,
            lineHeight: typography.lineHeight.normal,
          }}
        >
          Deine Antworten wurden gespeichert. Aufgaben, die du nicht sofort beherrscht hast, werden
          dir in optimalen Abständen wieder vorgelegt, um dein Langzeitgedächtnis zu trainieren.
        </p>
      </FeedbackCard>

      {/* Actions */}
      <div style={{ display: 'flex', gap: spacing[4], justifyContent: 'center' }}>
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
