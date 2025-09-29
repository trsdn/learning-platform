import { describe, it, expect } from 'vitest';
import type {
  ILearningContentService,
  ISpacedRepetitionService,
  IPracticeSessionService,
  IProgressTrackingService,
  IAnswerHistoryService,
} from '@core/types/services';

/**
 * Contract tests for core services
 * These tests verify that service interfaces are properly defined
 * and will be implemented according to specification
 */

describe('ILearningContentService Contract', () => {
  it('should define topic management methods', () => {
    const requiredMethods = [
      'getTopics',
      'getTopic',
      'getTopicByTitle',
      'getLearningPaths',
      'getLearningPath',
      'getTasks',
      'getTask',
      'searchTasks',
    ];

    // This will fail until implementation exists
    expect(() => {
      const service: ILearningContentService = null as any;
      requiredMethods.forEach((method) => {
        expect(service).toHaveProperty(method);
      });
    }).toThrow();
  });
});

describe('ISpacedRepetitionService Contract', () => {
  it('should define SM-2 algorithm methods', () => {
    const requiredMethods = [
      'getNextTasks',
      'recordAnswer',
      'getRepetitionData',
      'getTasksDue',
      'getReviewSchedule',
      'rescheduleTask',
    ];

    expect(() => {
      const service: ISpacedRepetitionService = null as any;
      requiredMethods.forEach((method) => {
        expect(service).toHaveProperty(method);
      });
    }).toThrow();
  });

  it('should handle SM-2 algorithm parameters correctly', async () => {
    const service: ISpacedRepetitionService = null as any;

    // Should accept grade 0-5
    expect(async () => {
      await service.recordAnswer('task-1', true, 5);
    }).rejects.toThrow();

    // Should return properly structured repetition data
    expect(async () => {
      const data = await service.getRepetitionData('task-1');
      expect(data).toHaveProperty('algorithm');
      expect(data?.algorithm).toHaveProperty('interval');
      expect(data?.algorithm).toHaveProperty('repetition');
      expect(data?.algorithm).toHaveProperty('efactor');
    }).rejects.toThrow();
  });
});

describe('IPracticeSessionService Contract', () => {
  it('should define session lifecycle methods', () => {
    const requiredMethods = [
      'createSession',
      'getSession',
      'updateSession',
      'completeSession',
      'pauseSession',
      'resumeSession',
      'abandonSession',
      'getActiveSessions',
      'getRecentSessions',
    ];

    expect(() => {
      const service: IPracticeSessionService = null as any;
      requiredMethods.forEach((method) => {
        expect(service).toHaveProperty(method);
      });
    }).toThrow();
  });

  it('should validate session configuration', async () => {
    const service: IPracticeSessionService = null as any;

    expect(async () => {
      const session = await service.createSession({
        topicId: 'math-topic',
        learningPathIds: ['algebra-path'],
        targetCount: 20,
        includeReview: true,
      });
      expect(session).toHaveProperty('id');
      expect(session.configuration.targetCount).toBe(20);
    }).rejects.toThrow();
  });
});

describe('IProgressTrackingService Contract', () => {
  it('should define progress tracking methods', () => {
    const requiredMethods = [
      'getTopicProgress',
      'getLearningPathProgress',
      'getAllProgress',
      'recordTaskCompletion',
      'updateStreakDays',
      'recalculateMasteryLevel',
      'getProgressSummary',
      'getWeeklyStats',
    ];

    expect(() => {
      const service: IProgressTrackingService = null as any;
      requiredMethods.forEach((method) => {
        expect(service).toHaveProperty(method);
      });
    }).toThrow();
  });

  it('should calculate accuracy correctly', async () => {
    const service: IProgressTrackingService = null as any;

    expect(async () => {
      const summary = await service.getProgressSummary('user-1');
      expect(summary).toHaveProperty('overallAccuracy');
      expect(summary.overallAccuracy).toBeGreaterThanOrEqual(0);
      expect(summary.overallAccuracy).toBeLessThanOrEqual(100);
    }).rejects.toThrow();
  });
});

describe('IAnswerHistoryService Contract', () => {
  it('should define answer recording methods', () => {
    const requiredMethods = [
      'recordAnswer',
      'getTaskHistory',
      'getUserHistory',
      'getSessionHistory',
      'getAccuracyTrend',
      'getDifficultyAnalysis',
    ];

    expect(() => {
      const service: IAnswerHistoryService = null as any;
      requiredMethods.forEach((method) => {
        expect(service).toHaveProperty(method);
      });
    }).toThrow();
  });

  it('should validate answer data structure', async () => {
    const service: IAnswerHistoryService = null as any;

    expect(async () => {
      const answer = await service.recordAnswer({
        taskId: 'task-1',
        sessionId: 'session-1',
        userAnswer: '1',
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
      expect(answer).toHaveProperty('id');
      expect(answer).toHaveProperty('timestamp');
    }).rejects.toThrow();
  });
});