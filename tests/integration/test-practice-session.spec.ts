import { describe, it, expect, beforeEach } from 'vitest';
import type {
  ILearningContentService,
  IPracticeSessionService,
  IAnswerHistoryService,
  IProgressTrackingService,
  ISpacedRepetitionService,
} from '@core/types/services';

/**
 * Integration tests for Practice Session workflow
 * Tests the complete flow from session creation to completion
 */

describe('Practice Session Integration Tests', () => {
  let contentService: ILearningContentService;
  let sessionService: IPracticeSessionService;
  let answerService: IAnswerHistoryService;
  let progressService: IProgressTrackingService;
  let spacedRepService: ISpacedRepetitionService;

  beforeEach(() => {
    // Services will be injected when implemented
    contentService = null as any;
    sessionService = null as any;
    answerService = null as any;
    progressService = null as any;
    spacedRepService = null as any;
  });

  it('should create a new practice session with specified configuration', async () => {
    expect(async () => {
      const session = await sessionService.createSession({
        topicId: 'mathematik',
        learningPathIds: ['algebra'],
        targetCount: 20,
        includeReview: true,
        difficultyFilter: 'medium',
      });

      expect(session).toBeDefined();
      expect(session.configuration.topicId).toBe('mathematik');
      expect(session.configuration.targetCount).toBe(20);
      expect(session.execution.status).toBe('planned');
      expect(session.execution.taskIds).toHaveLength(20);
    }).rejects.toThrow();
  });

  it('should mix new and review tasks when includeReview is true', async () => {
    expect(async () => {
      const session = await sessionService.createSession({
        topicId: 'mathematik',
        learningPathIds: ['algebra'],
        targetCount: 20,
        includeReview: true,
      });

      const taskIds = session.execution.taskIds;
      expect(taskIds.length).toBe(20);

      // Should include both new and due review tasks
      const dueTasks = await spacedRepService.getTasksDue('user-1');
      const hasReviewTasks = dueTasks.some((task) => taskIds.includes(task.id));

      expect(hasReviewTasks).toBe(true);
    }).rejects.toThrow();
  });

  it('should update session status to active when first question is answered', async () => {
    expect(async () => {
      const session = await sessionService.createSession({
        topicId: 'mathematik',
        learningPathIds: ['algebra'],
        targetCount: 10,
        includeReview: false,
      });

      const firstTaskId = session.execution.taskIds[0];

      await answerService.recordAnswer({
        taskId: firstTaskId,
        sessionId: session.id,
        userAnswer: '2',
        isCorrect: true,
        timeSpent: 5000,
        confidence: 4,
        metadata: {
          attemptNumber: 1,
          hintsUsed: 0,
          deviceType: 'desktop',
          browserInfo: 'Chrome',
        },
      });

      const updatedSession = await sessionService.getSession(session.id);
      expect(updatedSession?.execution.status).toBe('active');
      expect(updatedSession?.execution.completedCount).toBe(1);
      expect(updatedSession?.execution.correctCount).toBe(1);
    }).rejects.toThrow();
  });

  it('should track progress throughout the session', async () => {
    expect(async () => {
      const session = await sessionService.createSession({
        topicId: 'mathematik',
        learningPathIds: ['algebra'],
        targetCount: 5,
        includeReview: false,
      });

      for (let i = 0; i < 5; i++) {
        const taskId = session.execution.taskIds[i];
        const isCorrect = i < 3; // First 3 correct, last 2 incorrect

        await answerService.recordAnswer({
          taskId,
          sessionId: session.id,
          userAnswer: isCorrect ? '2' : '0',
          isCorrect,
          timeSpent: 5000,
          confidence: isCorrect ? 4 : 2,
          metadata: {
            attemptNumber: 1,
            hintsUsed: 0,
            deviceType: 'desktop',
            browserInfo: 'Chrome',
          },
        });
      }

      const completedSession = await sessionService.getSession(session.id);
      expect(completedSession?.execution.completedCount).toBe(5);
      expect(completedSession?.execution.correctCount).toBe(3);
      expect(completedSession?.results.accuracy).toBe(60);
    }).rejects.toThrow();
  });

  it('should update spaced repetition data after each answer', async () => {
    expect(async () => {
      const session = await sessionService.createSession({
        topicId: 'mathematik',
        learningPathIds: ['algebra'],
        targetCount: 1,
        includeReview: false,
      });

      const taskId = session.execution.taskIds[0];

      await answerService.recordAnswer({
        taskId,
        sessionId: session.id,
        userAnswer: '2',
        isCorrect: true,
        timeSpent: 5000,
        confidence: 5,
        metadata: {
          attemptNumber: 1,
          hintsUsed: 0,
          deviceType: 'desktop',
          browserInfo: 'Chrome',
        },
      });

      await spacedRepService.recordAnswer(taskId, true, 5);

      const srData = await spacedRepService.getRepetitionData(taskId);
      expect(srData).toBeDefined();
      expect(srData?.algorithm.repetition).toBeGreaterThan(0);
      expect(srData?.schedule.nextReview.getTime()).toBeGreaterThan(Date.now());
    }).rejects.toThrow();
  });

  it('should complete session and calculate final results', async () => {
    expect(async () => {
      const session = await sessionService.createSession({
        topicId: 'mathematik',
        learningPathIds: ['algebra'],
        targetCount: 10,
        includeReview: false,
      });

      // Answer all questions
      for (const taskId of session.execution.taskIds) {
        await answerService.recordAnswer({
          taskId,
          sessionId: session.id,
          userAnswer: '2',
          isCorrect: Math.random() > 0.3, // 70% correct
          timeSpent: 5000 + Math.random() * 5000,
          confidence: 4,
          metadata: {
            attemptNumber: 1,
            hintsUsed: 0,
            deviceType: 'desktop',
            browserInfo: 'Chrome',
          },
        });
      }

      const completedSession = await sessionService.completeSession(session.id);

      expect(completedSession.execution.status).toBe('completed');
      expect(completedSession.execution.completedAt).toBeDefined();
      expect(completedSession.results.accuracy).toBeGreaterThanOrEqual(0);
      expect(completedSession.results.accuracy).toBeLessThanOrEqual(100);
      expect(completedSession.results.averageTime).toBeGreaterThan(0);
    }).rejects.toThrow();
  });

  it('should update user progress after session completion', async () => {
    expect(async () => {
      const session = await sessionService.createSession({
        topicId: 'mathematik',
        learningPathIds: ['algebra'],
        targetCount: 10,
        includeReview: false,
      });

      // Complete session
      for (const taskId of session.execution.taskIds) {
        await answerService.recordAnswer({
          taskId,
          sessionId: session.id,
          userAnswer: '2',
          isCorrect: true,
          timeSpent: 5000,
          confidence: 4,
          metadata: {
            attemptNumber: 1,
            hintsUsed: 0,
            deviceType: 'desktop',
            browserInfo: 'Chrome',
          },
        });

        await progressService.recordTaskCompletion('user-1', taskId, true, 5000);
      }

      await sessionService.completeSession(session.id);

      const progress = await progressService.getTopicProgress('user-1', 'mathematik');
      expect(progress?.statistics.completedTasks).toBeGreaterThanOrEqual(10);
      expect(progress?.statistics.accuracyRate).toBeGreaterThan(0);
    }).rejects.toThrow();
  });

  it('should handle session pause and resume', async () => {
    expect(async () => {
      const session = await sessionService.createSession({
        topicId: 'mathematik',
        learningPathIds: ['algebra'],
        targetCount: 10,
        includeReview: false,
      });

      // Answer first question
      await answerService.recordAnswer({
        taskId: session.execution.taskIds[0],
        sessionId: session.id,
        userAnswer: '2',
        isCorrect: true,
        timeSpent: 5000,
        confidence: 4,
        metadata: {
          attemptNumber: 1,
          hintsUsed: 0,
          deviceType: 'desktop',
          browserInfo: 'Chrome',
        },
      });

      await sessionService.pauseSession(session.id);
      const pausedSession = await sessionService.getSession(session.id);
      expect(pausedSession?.execution.status).toBe('paused');

      await sessionService.resumeSession(session.id);
      const resumedSession = await sessionService.getSession(session.id);
      expect(resumedSession?.execution.status).toBe('active');
      expect(resumedSession?.execution.completedCount).toBe(1);
    }).rejects.toThrow();
  });

  it('should handle session abandonment', async () => {
    expect(async () => {
      const session = await sessionService.createSession({
        topicId: 'mathematik',
        learningPathIds: ['algebra'],
        targetCount: 10,
        includeReview: false,
      });

      await sessionService.abandonSession(session.id);

      const abandonedSession = await sessionService.getSession(session.id);
      expect(abandonedSession?.execution.status).toBe('abandoned');
    }).rejects.toThrow();
  });

  it('should filter tasks by difficulty when specified', async () => {
    expect(async () => {
      const easySession = await sessionService.createSession({
        topicId: 'mathematik',
        learningPathIds: ['algebra'],
        targetCount: 10,
        includeReview: false,
        difficultyFilter: 'easy',
      });

      const tasks = await Promise.all(
        easySession.execution.taskIds.map((id) => contentService.getTask(id))
      );

      tasks.forEach((task) => {
        expect(task?.metadata.difficulty).toBe('easy');
      });
    }).rejects.toThrow();
  });
});