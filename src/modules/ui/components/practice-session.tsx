import { useState, useEffect } from 'react';
import type { Task, PracticeSession } from '@core/types/services';
import { db } from '@storage/database';
import { PracticeSessionService } from '@core/services/practice-session-service';
import { SpacedRepetitionService } from '@core/services/spaced-repetition-service';
import {
  getPracticeSessionRepository,
  getTaskRepository,
  getSpacedRepetitionRepository,
} from '@storage/factory';

interface Props {
  topicId: string;
  learningPathIds: string[];
  onComplete: () => void;
  onCancel: () => void;
}

export function PracticeSession({ topicId, learningPathIds, onComplete, onCancel }: Props) {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Initialize session
  useEffect(() => {
    initializeSession();
  }, []);

  // Load current task
  useEffect(() => {
    if (session && session.execution.taskIds.length > 0) {
      loadCurrentTask();
    }
  }, [session, currentTaskIndex]);

  async function initializeSession() {
    const sessionService = new PracticeSessionService(
      getPracticeSessionRepository(),
      getTaskRepository(),
      getSpacedRepetitionRepository()
    );

    const newSession = await sessionService.createSession({
      topicId,
      learningPathIds,
      targetCount: 10,
      includeReview: true,
    });

    setSession(newSession);
  }

  async function loadCurrentTask() {
    if (!session || currentTaskIndex >= session.execution.taskIds.length) return;

    const taskId = session.execution.taskIds[currentTaskIndex];
    if (!taskId) return;

    const task = await db.tasks.get(taskId);
    if (task) {
      setCurrentTask(task);
      setStartTime(Date.now());
    }
  }

  async function handleAnswerSubmit() {
    if (selectedAnswer === null || !currentTask || !session) return;

    const correct = selectedAnswer === currentTask.content.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Calculate time spent
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    // Record answer in session
    const sessionService = new PracticeSessionService(
      getPracticeSessionRepository(),
      getTaskRepository(),
      getSpacedRepetitionRepository()
    );

    await sessionService.recordSessionAnswer(session.id, correct, timeSpent);

    // Update spaced repetition
    const spacedRepService = new SpacedRepetitionService(
      getSpacedRepetitionRepository(),
      getTaskRepository()
    );

    // Convert boolean to grade (0-5 scale)
    const grade = correct ? 4 : 2;
    await spacedRepService.recordAnswer(currentTask.id, correct, grade);

    // Update session state
    const updatedSession = await db.practiceSessions.get(session.id);
    if (updatedSession) {
      setSession(updatedSession);
    }
  }

  function handleNextTask() {
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (session && currentTaskIndex < session.execution.taskIds.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      handleComplete();
    }
  }

  async function handleComplete() {
    if (!session) return;

    const sessionService = new PracticeSessionService(
      getPracticeSessionRepository(),
      getTaskRepository(),
      getSpacedRepetitionRepository()
    );

    await sessionService.completeSession(session.id);
    onComplete();
  }

  if (!session || !currentTask) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Wird geladen...</p>
      </div>
    );
  }

  const progress = ((currentTaskIndex + 1) / session.execution.taskIds.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Header - compact */}
      <div style={{ marginBottom: '1rem', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Übungssitzung</h2>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {currentTaskIndex + 1}/{session.execution.taskIds.length}
            </span>
          </div>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              background: '#e5e7eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Abbrechen
          </button>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            background: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: '#3b82f6',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Question - main content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          minHeight: 0,
        }}
      >
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', lineHeight: '1.4' }}>
          {currentTask.content.question}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minHeight: 0 }}>
          {currentTask.content.options.map((option, index) => {
            let backgroundColor = '#ffffff';
            let borderColor = '#d1d5db';

            if (showFeedback) {
              if (index === currentTask.content.correctAnswer) {
                backgroundColor = '#dcfce7';
                borderColor = '#86efac';
              } else if (index === selectedAnswer && !isCorrect) {
                backgroundColor = '#fee2e2';
                borderColor = '#fca5a5';
              }
            } else if (selectedAnswer === index) {
              backgroundColor = '#dbeafe';
              borderColor = '#3b82f6';
            }

            return (
              <button
                key={index}
                onClick={() => !showFeedback && setSelectedAnswer(index)}
                disabled={showFeedback}
                style={{
                  padding: '0.875rem',
                  background: backgroundColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: '6px',
                  cursor: showFeedback ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback - compact */}
      {showFeedback && (
        <div
          style={{
            background: isCorrect ? '#dcfce7' : '#fee2e2',
            border: `2px solid ${isCorrect ? '#86efac' : '#fca5a5'}`,
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            flexShrink: 0,
          }}
        >
          <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
            {isCorrect ? '✅ Richtig!' : '❌ Nicht ganz richtig'}
          </h4>
          {currentTask.content.explanation && (
            <p style={{ margin: 0, fontSize: '0.875rem' }}>{currentTask.content.explanation}</p>
          )}
        </div>
      )}

      {/* Actions and Statistics - combined footer */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Action button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {!showFeedback ? (
            <button
              onClick={handleAnswerSubmit}
              disabled={selectedAnswer === null}
              style={{
                padding: '0.875rem 2rem',
                background: selectedAnswer !== null ? '#3b82f6' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                fontWeight: '500',
              }}
            >
              Antwort überprüfen
            </button>
          ) : (
            <button
              onClick={handleNextTask}
              style={{
                padding: '0.875rem 2rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
              }}
            >
              {currentTaskIndex < session.execution.taskIds.length - 1
                ? 'Nächste Aufgabe →'
                : 'Sitzung beenden'}
            </button>
          )}
        </div>

        {/* Compact statistics */}
        <div
          style={{
            padding: '0.75rem',
            background: '#f9fafb',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-around',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {session.execution.completedCount}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.25rem' }}>
              beantwortet
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
              {session.execution.correctCount}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.25rem' }}>
              richtig
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {session.execution.completedCount > 0
                ? Math.round((session.execution.correctCount / session.execution.completedCount) * 100)
                : 0}%
            </span>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.25rem' }}>
              genau
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}