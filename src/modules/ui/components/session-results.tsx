import type { PracticeSession } from '@core/types/services';

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
    performanceColor = '#10b981';
  } else if (accuracy >= 75) {
    performanceRating = 'Sehr gut!';
    performanceColor = '#3b82f6';
  } else if (accuracy >= 60) {
    performanceRating = 'Gut gemacht!';
    performanceColor = '#f59e0b';
  } else {
    performanceRating = 'Weiter üben!';
    performanceColor = '#ef4444';
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
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ marginBottom: '0.5rem' }}>Sitzung abgeschlossen!</h1>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: performanceColor, margin: 0 }}>
          {performanceRating}
        </p>
      </div>

      {/* Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
          }}
        >
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {session.execution.completedCount}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Aufgaben bearbeitet</div>
        </div>

        <div
          style={{
            background: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
          }}
        >
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>
            {session.execution.correctCount}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Richtige Antworten</div>
        </div>

        <div
          style={{
            background: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
          }}
        >
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: performanceColor }}>
            {Math.round(accuracy)}%
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Genauigkeit</div>
        </div>

        <div
          style={{
            background: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
          }}
        >
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {formatTime(averageTime)}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Ø Zeit pro Aufgabe</div>
        </div>
      </div>

      {/* Total Time */}
      <div
        style={{
          background: '#dbeafe',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.95rem' }}>
          <strong>Gesamtzeit:</strong> {formatTime(session.execution.totalTimeSpent)}
        </p>
      </div>

      {/* Progress Message */}
      <div
        style={{
          background: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
        }}
      >
        <h3 style={{ marginBottom: '0.5rem' }}>📈 Dein Fortschritt</h3>
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#6b7280', lineHeight: '1.6' }}>
          {accuracy >= 90 && 'Hervorragende Leistung! Du beherrschst dieses Thema sehr gut.'}
          {accuracy >= 75 && accuracy < 90 && 'Sehr gute Arbeit! Du machst große Fortschritte.'}
          {accuracy >= 60 && accuracy < 75 && 'Gute Arbeit! Weiter so, du verbesserst dich stetig.'}
          {accuracy < 60 &&
            'Bleib dran! Übung macht den Meister. Die nächste Sitzung wird noch besser!'}
        </p>
      </div>

      {/* Spaced Repetition Info */}
      <div
        style={{
          background: '#dcfce7',
          border: '2px solid #86efac',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
        }}
      >
        <h4 style={{ marginBottom: '0.5rem' }}>🧠 Spaced Repetition aktiviert</h4>
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
          Deine Antworten wurden gespeichert. Aufgaben, die du nicht sofort beherrscht hast, werden
          dir in optimalen Abständen wieder vorgelegt, um dein Langzeitgedächtnis zu trainieren.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={onStartNew}
          style={{
            padding: '1rem 2rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
          }}
        >
          Neue Sitzung starten
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '1rem 2rem',
            background: '#e5e7eb',
            color: '#374151',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
          }}
        >
          Zurück zur Übersicht
        </button>
      </div>
    </div>
  );
}