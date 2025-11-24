/**
 * Test factories for creating mock PracticeSession objects
 */

import type { PracticeSession } from '@core/types/services';
import { createMixedTasks } from './task-factory';

/**
 * Create a mock practice session
 */
export function createMockSession(overrides?: Partial<PracticeSession>): PracticeSession {
  const taskIds = ['task-1', 'task-2', 'task-3'];

  return {
    id: 'session-1',
    userId: 'user-1',
    topicId: 'topic-1',
    learningPathIds: ['path-1'],
    execution: {
      taskIds,
      answeredCount: 0,
      correctCount: 0,
      status: 'in-progress',
      startedAt: new Date(),
      completedAt: undefined,
    },
    targetCount: taskIds.length,
    includeReview: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a session with specific number of tasks
 */
export function createSessionWithTasks(taskCount: number): PracticeSession {
  const taskIds = Array.from({ length: taskCount }, (_, i) => `task-${i + 1}`);

  return createMockSession({
    execution: {
      taskIds,
      answeredCount: 0,
      correctCount: 0,
      status: 'in-progress',
      startedAt: new Date(),
      completedAt: undefined,
    },
    targetCount: taskCount,
  });
}

/**
 * Create a partially completed session
 */
export function createPartiallyCompletedSession(
  totalTasks: number,
  answeredTasks: number,
  correctAnswers: number
): PracticeSession {
  const taskIds = Array.from({ length: totalTasks }, (_, i) => `task-${i + 1}`);

  return createMockSession({
    execution: {
      taskIds,
      answeredCount: answeredTasks,
      correctCount: correctAnswers,
      status: 'in-progress',
      startedAt: new Date(),
      completedAt: undefined,
    },
    targetCount: totalTasks,
  });
}

/**
 * Create a completed session
 */
export function createCompletedSession(
  totalTasks: number = 10,
  correctAnswers: number = 7
): PracticeSession {
  const taskIds = Array.from({ length: totalTasks }, (_, i) => `task-${i + 1}`);

  return createMockSession({
    execution: {
      taskIds,
      answeredCount: totalTasks,
      correctCount: correctAnswers,
      status: 'completed',
      startedAt: new Date(Date.now() - 600000), // 10 minutes ago
      completedAt: new Date(),
    },
    targetCount: totalTasks,
  });
}
