/**
 * Tests for PracticeSessionService
 *
 * Tests the service logic including:
 * - #157: Ensure session is active before recording answers
 * - #164: Task filtering by learning path for review tasks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PracticeSessionService } from '../../../src/modules/core/services/practice-session-service';
import type {
  IPracticeSessionRepository,
  ITaskRepository,
  ISpacedRepetitionRepository,
} from '../../../src/modules/storage/types/adapters';
import type { PracticeSession, Task } from '../../../src/modules/core/types/services';
import type { SpacedRepetitionItem } from '../../../src/modules/core/types/entities';

// Mock repositories
function createMockSessionRepo(): IPracticeSessionRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getActive: vi.fn(),
    getRecent: vi.fn(),
  };
}

function createMockTaskRepo(): ITaskRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(),
    getByIds: vi.fn(),
    getByLearningPath: vi.fn(),
    getRandomTasks: vi.fn(),
  };
}

function createMockSpacedRepRepo(): ISpacedRepetitionRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getByTask: vi.fn(),
    getDue: vi.fn(),
    getStats: vi.fn(),
  };
}

// Helper to create a mock session
function createMockSession(
  overrides: Partial<PracticeSession> = {}
): PracticeSession {
  return {
    id: 'session-1',
    configuration: {
      topicId: 'topic-1',
      learningPathIds: ['path-1'],
      targetCount: 10,
      includeReview: false,
    },
    execution: {
      taskIds: ['task-1', 'task-2', 'task-3'],
      completedCount: 0,
      correctCount: 0,
      status: 'planned',
      totalTimeSpent: 0,
    },
    results: {
      accuracy: 0,
      averageTime: 0,
      difficultyDistribution: {},
      improvementAreas: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Helper to create a mock task
function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    learningPathId: 'path-1',
    templateId: 'template-1',
    type: 'multiple-choice',
    content: {
      question: 'Test question?',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
    },
    metadata: {
      difficulty: 'medium',
      tags: [],
      estimatedTime: 30,
      points: 10,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('PracticeSessionService', () => {
  let service: PracticeSessionService;
  let sessionRepo: IPracticeSessionRepository;
  let taskRepo: ITaskRepository;
  let spacedRepRepo: ISpacedRepetitionRepository;

  beforeEach(() => {
    sessionRepo = createMockSessionRepo();
    taskRepo = createMockTaskRepo();
    spacedRepRepo = createMockSpacedRepRepo();
    service = new PracticeSessionService(sessionRepo, taskRepo, spacedRepRepo);
  });

  describe('recordSessionAnswer (#157 - Ensure Session Active)', () => {
    it('should start a planned session before recording answer', async () => {
      const plannedSession = createMockSession({
        execution: {
          taskIds: ['task-1'],
          completedCount: 0,
          correctCount: 0,
          status: 'planned',
          totalTimeSpent: 0,
        },
      });

      vi.mocked(sessionRepo.getById).mockResolvedValue(plannedSession);
      vi.mocked(sessionRepo.update).mockImplementation(async (id, updates) => ({
        ...plannedSession,
        ...updates,
      }));

      await service.recordSessionAnswer('session-1', true, 10);

      // Verify update was called
      expect(sessionRepo.update).toHaveBeenCalled();

      // Get the update call arguments
      const updateCall = vi.mocked(sessionRepo.update).mock.calls[0];
      const updatedSession = updateCall[1] as PracticeSession;

      // Session should be active (not planned) after recording
      expect(updatedSession.execution.status).toBe('active');
      expect(updatedSession.execution.completedCount).toBe(1);
      expect(updatedSession.execution.correctCount).toBe(1);
    });

    it('should resume a paused session before recording answer', async () => {
      const pausedSession = createMockSession({
        execution: {
          taskIds: ['task-1'],
          completedCount: 1,
          correctCount: 1,
          status: 'paused',
          totalTimeSpent: 10,
          startedAt: new Date(),
        },
      });

      vi.mocked(sessionRepo.getById).mockResolvedValue(pausedSession);
      vi.mocked(sessionRepo.update).mockImplementation(async (id, updates) => ({
        ...pausedSession,
        ...updates,
      }));

      await service.recordSessionAnswer('session-1', false, 15);

      const updateCall = vi.mocked(sessionRepo.update).mock.calls[0];
      const updatedSession = updateCall[1] as PracticeSession;

      // Session should be active after resuming
      expect(updatedSession.execution.status).toBe('active');
      expect(updatedSession.execution.completedCount).toBe(2);
      expect(updatedSession.execution.correctCount).toBe(1); // Only 1 correct
    });

    it('should record answer on already active session', async () => {
      const activeSession = createMockSession({
        execution: {
          taskIds: ['task-1', 'task-2'],
          completedCount: 1,
          correctCount: 1,
          status: 'active',
          totalTimeSpent: 10,
          startedAt: new Date(),
        },
      });

      vi.mocked(sessionRepo.getById).mockResolvedValue(activeSession);
      vi.mocked(sessionRepo.update).mockImplementation(async (id, updates) => ({
        ...activeSession,
        ...updates,
      }));

      await service.recordSessionAnswer('session-1', true, 20);

      const updateCall = vi.mocked(sessionRepo.update).mock.calls[0];
      const updatedSession = updateCall[1] as PracticeSession;

      expect(updatedSession.execution.status).toBe('active');
      expect(updatedSession.execution.completedCount).toBe(2);
      expect(updatedSession.execution.correctCount).toBe(2);
      expect(updatedSession.execution.totalTimeSpent).toBe(30);
    });

    it('should auto-complete session when target reached', async () => {
      const almostCompleteSession = createMockSession({
        configuration: {
          topicId: 'topic-1',
          learningPathIds: ['path-1'],
          targetCount: 5,
          includeReview: false,
        },
        execution: {
          taskIds: ['task-1', 'task-2', 'task-3', 'task-4', 'task-5'],
          completedCount: 4,
          correctCount: 3,
          status: 'active',
          totalTimeSpent: 40,
          startedAt: new Date(),
        },
      });

      vi.mocked(sessionRepo.getById).mockResolvedValue(almostCompleteSession);
      vi.mocked(sessionRepo.update).mockImplementation(async (id, updates) => ({
        ...almostCompleteSession,
        ...updates,
      }));

      await service.recordSessionAnswer('session-1', true, 10);

      const updateCall = vi.mocked(sessionRepo.update).mock.calls[0];
      const updatedSession = updateCall[1] as PracticeSession;

      // Should be auto-completed
      expect(updatedSession.execution.status).toBe('completed');
      expect(updatedSession.execution.completedCount).toBe(5);
      expect(updatedSession.execution.completedAt).toBeDefined();
    });

    it('should throw NotFoundError for non-existent session', async () => {
      vi.mocked(sessionRepo.getById).mockResolvedValue(null);

      await expect(
        service.recordSessionAnswer('non-existent', true, 10)
      ).rejects.toThrow('PracticeSession');
    });
  });

  describe('selectTasksForSession (#164 - Learning Path Filter)', () => {
    it('should filter review tasks by learning path', async () => {
      // Mock due items from different learning paths
      const dueItems: SpacedRepetitionItem[] = [
        {
          id: 'sr-1',
          taskId: 'spanish-task-1',
          userId: 'user-1',
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReviewDate: new Date(),
          lastReviewDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'sr-2',
          taskId: 'bio-task-1', // Wrong path
          userId: 'user-1',
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReviewDate: new Date(),
          lastReviewDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'sr-3',
          taskId: 'spanish-task-2',
          userId: 'user-1',
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReviewDate: new Date(),
          lastReviewDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Tasks with their learning paths
      const spanishTask1 = createMockTask({
        id: 'spanish-task-1',
        learningPathId: 'spanish-path',
      });
      const bioTask = createMockTask({
        id: 'bio-task-1',
        learningPathId: 'biology-path', // Different path!
      });
      const spanishTask2 = createMockTask({
        id: 'spanish-task-2',
        learningPathId: 'spanish-path',
      });

      vi.mocked(spacedRepRepo.getDue).mockResolvedValue(dueItems);
      vi.mocked(taskRepo.getById).mockImplementation(async (id) => {
        if (id === 'spanish-task-1') return spanishTask1;
        if (id === 'bio-task-1') return bioTask;
        if (id === 'spanish-task-2') return spanishTask2;
        return null;
      });
      vi.mocked(taskRepo.getRandomTasks).mockResolvedValue([
        createMockTask({ id: 'new-task-1', learningPathId: 'spanish-path' }),
        createMockTask({ id: 'new-task-2', learningPathId: 'spanish-path' }),
        createMockTask({ id: 'new-task-3', learningPathId: 'spanish-path' }),
      ]);
      vi.mocked(sessionRepo.create).mockImplementation(async (session) => session);

      // Create session for Spanish path only
      const session = await service.createSession({
        topicId: 'spanish-topic',
        learningPathIds: ['spanish-path'],
        targetCount: 5,
        includeReview: true,
      });

      // bio-task-1 should NOT be included (wrong learning path)
      expect(session.execution.taskIds).not.toContain('bio-task-1');

      // Spanish tasks should be included
      expect(session.execution.taskIds).toContain('spanish-task-1');
      expect(session.execution.taskIds).toContain('spanish-task-2');
    });

    it('should not include review tasks when includeReview is false', async () => {
      vi.mocked(taskRepo.getRandomTasks).mockResolvedValue([
        createMockTask({ id: 'new-task-1' }),
        createMockTask({ id: 'new-task-2' }),
      ]);
      vi.mocked(sessionRepo.create).mockImplementation(async (session) => session);

      await service.createSession({
        topicId: 'topic-1',
        learningPathIds: ['path-1'],
        targetCount: 5,
        includeReview: false,
      });

      // getDue should not be called when includeReview is false
      expect(spacedRepRepo.getDue).not.toHaveBeenCalled();
    });
  });

  describe('Session Lifecycle', () => {
    it('should complete a session', async () => {
      const activeSession = createMockSession({
        execution: {
          taskIds: ['task-1'],
          completedCount: 5,
          correctCount: 4,
          status: 'active',
          totalTimeSpent: 100,
          startedAt: new Date(),
        },
      });

      vi.mocked(sessionRepo.getById).mockResolvedValue(activeSession);
      vi.mocked(sessionRepo.update).mockImplementation(async (id, updates) => ({
        ...activeSession,
        ...updates,
      }));

      const completed = await service.completeSession('session-1');

      expect(completed.execution.status).toBe('completed');
      expect(completed.execution.completedAt).toBeDefined();
    });

    it('should pause a session', async () => {
      const activeSession = createMockSession({
        execution: {
          taskIds: ['task-1'],
          completedCount: 2,
          correctCount: 1,
          status: 'active',
          totalTimeSpent: 50,
          startedAt: new Date(),
        },
      });

      vi.mocked(sessionRepo.getById).mockResolvedValue(activeSession);
      vi.mocked(sessionRepo.update).mockImplementation(async (id, updates) => ({
        ...activeSession,
        ...updates,
      }));

      await service.pauseSession('session-1');

      const updateCall = vi.mocked(sessionRepo.update).mock.calls[0];
      const updatedSession = updateCall[1] as PracticeSession;
      expect(updatedSession.execution.status).toBe('paused');
    });

    it('should resume a session', async () => {
      const pausedSession = createMockSession({
        execution: {
          taskIds: ['task-1'],
          completedCount: 2,
          correctCount: 1,
          status: 'paused',
          totalTimeSpent: 50,
          startedAt: new Date(),
        },
      });

      vi.mocked(sessionRepo.getById).mockResolvedValue(pausedSession);
      vi.mocked(sessionRepo.update).mockImplementation(async (id, updates) => ({
        ...pausedSession,
        ...updates,
      }));

      await service.resumeSession('session-1');

      const updateCall = vi.mocked(sessionRepo.update).mock.calls[0];
      const updatedSession = updateCall[1] as PracticeSession;
      expect(updatedSession.execution.status).toBe('active');
    });

    it('should abandon a session', async () => {
      const activeSession = createMockSession({
        execution: {
          taskIds: ['task-1'],
          completedCount: 2,
          correctCount: 1,
          status: 'active',
          totalTimeSpent: 50,
          startedAt: new Date(),
        },
      });

      vi.mocked(sessionRepo.getById).mockResolvedValue(activeSession);
      vi.mocked(sessionRepo.update).mockImplementation(async (id, updates) => ({
        ...activeSession,
        ...updates,
      }));

      await service.abandonSession('session-1');

      const updateCall = vi.mocked(sessionRepo.update).mock.calls[0];
      const updatedSession = updateCall[1] as PracticeSession;
      expect(updatedSession.execution.status).toBe('abandoned');
    });
  });
});
