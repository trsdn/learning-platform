/**
 * PracticeSessionWrapper Component
 *
 * Wrapper component that creates a practice session and then passes it to PracticeSessionContainer.
 * This maintains backward compatibility with the old API while using the new modular components.
 */

import { useState, useEffect } from 'react';
import { PracticeSessionService } from '@core/services/practice-session-service';
import {
  getPracticeSessionRepository,
  getTaskRepository,
  getSpacedRepetitionRepository,
} from '@storage/factory';
import { PracticeSessionContainer } from './PracticeSessionContainer';

interface PracticeSessionWrapperProps {
  /** The topic ID */
  topicId: string;
  /** Array of learning path IDs */
  learningPathIds: string[];
  /** Target number of tasks (default: 10) */
  targetCount?: number;
  /** Whether to include review tasks (default: true) */
  includeReview?: boolean;
  /** Callback when session completes */
  onComplete: () => void;
  /** Callback when session is cancelled */
  onCancel: () => void;
}

/**
 * Wrapper that creates a session and renders PracticeSessionContainer
 */
export function PracticeSessionWrapper({
  topicId,
  learningPathIds,
  targetCount = 10,
  includeReview = true,
  onComplete,
  onCancel,
}: PracticeSessionWrapperProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createSession() {
      try {
        setIsCreating(true);
        setError(null);

        const sessionService = new PracticeSessionService(
          getPracticeSessionRepository(),
          getTaskRepository(),
          getSpacedRepetitionRepository()
        );

        const newSession = await sessionService.createSession({
          topicId,
          learningPathIds,
          targetCount,
          includeReview,
        });

        setSessionId(newSession.id);
        setIsCreating(false);
      } catch (err) {
        console.error('Failed to create session:', err);
        setError(err instanceof Error ? err.message : 'Failed to create session');
        setIsCreating(false);
      }
    }

    createSession();
  }, [topicId, learningPathIds, targetCount, includeReview]);

  // Show loading state
  if (isCreating) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Sitzung wird erstellt...</p>
      </div>
    );
  }

  // Show error state
  if (error || !sessionId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-error, #ef4444)' }}>
          {error || 'Fehler beim Erstellen der Sitzung'}
        </p>
        <button
          onClick={onCancel}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Zurück
        </button>
      </div>
    );
  }

  // Render the actual session container
  return (
    <PracticeSessionContainer
      sessionId={sessionId}
      onComplete={onComplete}
      onCancel={onCancel}
    />
  );
}
