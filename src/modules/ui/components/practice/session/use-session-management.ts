/**
 * Session Management Hook
 *
 * Manages practice session initialization, navigation, and completion.
 */

import { useState, useCallback, useEffect } from 'react';
import type { PracticeSession, Task } from '@core/types/services';
import { PracticeSessionService } from '@core/services/practice-session-service';
import { SpacedRepetitionService } from '@core/services/spaced-repetition-service';
import {
  getPracticeSessionRepository,
  getTaskRepository,
  getSpacedRepetitionRepository,
} from '@storage/factory';

export interface UseSessionManagementProps {
  /** The session ID to initialize */
  sessionId: string;
  /** Callback when session is completed */
  onComplete: () => void;
}

export interface UseSessionManagementReturn {
  /** The current practice session */
  session: PracticeSession | null;
  /** The currently active task */
  currentTask: Task | null;
  /** Current task index (0-based) */
  currentTaskIndex: number;
  /** Whether the session is loading */
  isLoading: boolean;
  /** Whether feedback is being shown for current task */
  showFeedback: boolean;
  /** Whether the current answer is correct */
  isCorrect: boolean;
  /** Time when current task started (milliseconds) */
  startTime: number;
  /** Progress percentage (0-100) */
  progress: number;
  /** Initialize the session */
  initializeSession: () => Promise<void>;
  /** Load the current task */
  loadCurrentTask: () => Promise<void>;
  /** Submit an answer for the current task */
  submitAnswer: (correct: boolean) => Promise<void>;
  /** Navigate to the next task */
  nextTask: () => void;
  /** Complete the session */
  completeSession: () => Promise<void>;
  /** Set feedback visibility */
  setShowFeedback: (show: boolean) => void;
  /** Set whether current answer is correct */
  setIsCorrect: (correct: boolean) => void;
}

/**
 * Hook for managing practice session state and navigation
 */
export function useSessionManagement({
  sessionId,
  onComplete,
}: UseSessionManagementProps): UseSessionManagementReturn {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  /**
   * Initialize the session from the database
   */
  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const sessionRepo = getPracticeSessionRepository();
      const loadedSession = await sessionRepo.getById(sessionId);

      if (!loadedSession) {
        console.error('Session not found:', sessionId);
        onComplete();
        return;
      }

      setSession(loadedSession);
      setCurrentTaskIndex(loadedSession.execution.currentTaskIndex || 0);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      onComplete();
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, onComplete]);

  /**
   * Load the task at the current index
   */
  const loadCurrentTask = useCallback(async () => {
    if (!session || session.execution.taskIds.length === 0) {
      return;
    }

    try {
      setIsLoading(true);
      const taskId = session.execution.taskIds[currentTaskIndex];
      if (!taskId) {
        console.error('No task ID at index', currentTaskIndex);
        return;
      }

      const taskRepo = getTaskRepository();
      const task = await taskRepo.getById(taskId);

      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }

      setCurrentTask(task);
      setShowFeedback(false);
      setIsCorrect(false);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load task:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session, currentTaskIndex]);

  /**
   * Submit an answer and update session/spaced repetition
   */
  const submitAnswer = useCallback(
    async (correct: boolean) => {
      if (!currentTask || !session) return;

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
      const sessionRepo = getPracticeSessionRepository();
      const updatedSession = await sessionRepo.getById(session.id);
      if (updatedSession) {
        setSession(updatedSession);
      }
    },
    [currentTask, session, startTime]
  );

  /**
   * Navigate to the next task or complete the session
   */
  const nextTask = useCallback(() => {
    setShowFeedback(false);

    if (session && currentTaskIndex < session.execution.taskIds.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      completeSession();
    }
  }, [session, currentTaskIndex]);

  /**
   * Complete the session and navigate away
   */
  const completeSession = useCallback(async () => {
    if (!session) return;

    // Prevent double completion (race condition)
    if (
      session.execution.status === 'completed' ||
      session.execution.status === 'abandoned'
    ) {
      onComplete();
      return;
    }

    const sessionService = new PracticeSessionService(
      getPracticeSessionRepository(),
      getTaskRepository(),
      getSpacedRepetitionRepository()
    );

    await sessionService.completeSession(session.id);

    // Wait to ensure the session is saved
    await new Promise((resolve) => setTimeout(resolve, 100));

    onComplete();
  }, [session, onComplete]);

  /**
   * Calculate progress percentage
   */
  const progress =
    session && session.execution.taskIds.length > 0
      ? Math.round(
          ((currentTaskIndex + 1) / session.execution.taskIds.length) * 100
        )
      : 0;

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Load current task when session is first loaded
  useEffect(() => {
    if (session && session.execution.taskIds.length > 0 && currentTaskIndex === 0) {
      loadCurrentTask();
    }
  }, [session, loadCurrentTask]);

  // Load current task when index changes
  useEffect(() => {
    if (session && session.execution.taskIds.length > 0 && currentTaskIndex > 0) {
      loadCurrentTask();
    }
  }, [currentTaskIndex, loadCurrentTask]);

  return {
    session,
    currentTask,
    currentTaskIndex,
    isLoading,
    showFeedback,
    isCorrect,
    startTime,
    progress,
    initializeSession,
    loadCurrentTask,
    submitAnswer,
    nextTask,
    completeSession,
    setShowFeedback,
    setIsCorrect,
  };
}
