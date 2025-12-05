/**
 * Tests for PracticeSessionEntity
 *
 * Tests the core session logic including:
 * - #157: Session stats (accuracy, averageTime) computation from execution data
 * - Session status transitions (planned -> active -> completed)
 * - recordAnswer functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PracticeSessionEntity } from '../../../src/modules/core/entities/practice-session';

describe('PracticeSessionEntity', () => {
  describe('Session Creation', () => {
    it('should create a new session with initial state', () => {
      const session = PracticeSessionEntity.create(
        'session-1',
        'topic-1',
        ['path-1'],
        ['task-1', 'task-2', 'task-3'],
        { targetCount: 10, includeReview: true }
      );

      expect(session.id).toBe('session-1');
      expect(session.configuration.topicId).toBe('topic-1');
      expect(session.configuration.learningPathIds).toEqual(['path-1']);
      expect(session.execution.taskIds).toEqual(['task-1', 'task-2', 'task-3']);
      expect(session.execution.status).toBe('planned');
      expect(session.execution.completedCount).toBe(0);
      expect(session.execution.correctCount).toBe(0);
      expect(session.execution.totalTimeSpent).toBe(0);
      expect(session.results.accuracy).toBe(0);
      expect(session.results.averageTime).toBe(0);
    });

    it('should create session with difficulty filter', () => {
      const session = PracticeSessionEntity.create(
        'session-1',
        'topic-1',
        ['path-1'],
        ['task-1'],
        { targetCount: 10, includeReview: false, difficultyFilter: 'medium' }
      );

      expect(session.configuration.difficultyFilter).toBe('medium');
    });
  });

  describe('Session Status Transitions', () => {
    let session: PracticeSessionEntity;

    beforeEach(() => {
      session = PracticeSessionEntity.create(
        'session-1',
        'topic-1',
        ['path-1'],
        ['task-1', 'task-2'],
        { targetCount: 5, includeReview: false }
      );
    });

    it('should start a planned session', () => {
      expect(session.execution.status).toBe('planned');

      session.start();

      expect(session.execution.status).toBe('active');
      expect(session.execution.startedAt).toBeDefined();
    });

    it('should pause an active session', () => {
      session.start();
      expect(session.execution.status).toBe('active');

      session.pause();

      expect(session.execution.status).toBe('paused');
    });

    it('should resume a paused session', () => {
      session.start();
      session.pause();
      expect(session.execution.status).toBe('paused');

      session.resume();

      expect(session.execution.status).toBe('active');
    });

    it('should start a paused session', () => {
      session.start();
      session.pause();
      expect(session.execution.status).toBe('paused');

      session.start();

      expect(session.execution.status).toBe('active');
    });

    it('should complete a session', () => {
      session.start();
      session.recordAnswer(true, 10);

      session.complete();

      expect(session.execution.status).toBe('completed');
      expect(session.execution.completedAt).toBeDefined();
    });

    it('should abandon a session', () => {
      session.start();

      session.abandon();

      expect(session.execution.status).toBe('abandoned');
    });

    it('should throw when starting a completed session', () => {
      session.start();
      session.complete();

      expect(() => session.start()).toThrow();
    });

    it('should throw when completing an already completed session', () => {
      session.start();
      session.complete();

      expect(() => session.complete()).toThrow('Session already finalized');
    });
  });

  describe('Record Answer (#157 - Session Stats)', () => {
    let session: PracticeSessionEntity;

    beforeEach(() => {
      session = PracticeSessionEntity.create(
        'session-1',
        'topic-1',
        ['path-1'],
        ['task-1', 'task-2', 'task-3', 'task-4', 'task-5'],
        { targetCount: 5, includeReview: false }
      );
      session.start();
    });

    it('should throw when recording answer on non-active session', () => {
      const plannedSession = PracticeSessionEntity.create(
        'session-2',
        'topic-1',
        ['path-1'],
        ['task-1'],
        { targetCount: 5, includeReview: false }
      );

      expect(() => plannedSession.recordAnswer(true, 10)).toThrow(
        'Session must be active to record answers'
      );
    });

    it('should increment completedCount on recording answer', () => {
      expect(session.execution.completedCount).toBe(0);

      session.recordAnswer(true, 10);

      expect(session.execution.completedCount).toBe(1);
    });

    it('should increment correctCount only for correct answers', () => {
      session.recordAnswer(true, 10);
      expect(session.execution.correctCount).toBe(1);

      session.recordAnswer(false, 10);
      expect(session.execution.correctCount).toBe(1);

      session.recordAnswer(true, 10);
      expect(session.execution.correctCount).toBe(2);
    });

    it('should accumulate totalTimeSpent', () => {
      session.recordAnswer(true, 10);
      expect(session.execution.totalTimeSpent).toBe(10);

      session.recordAnswer(false, 5);
      expect(session.execution.totalTimeSpent).toBe(15);

      session.recordAnswer(true, 15);
      expect(session.execution.totalTimeSpent).toBe(30);
    });

    it('should calculate accuracy correctly', () => {
      // 1/1 = 100%
      session.recordAnswer(true, 10);
      expect(session.results.accuracy).toBe(100);

      // 1/2 = 50%
      session.recordAnswer(false, 10);
      expect(session.results.accuracy).toBe(50);

      // 2/3 = 66.67%
      session.recordAnswer(true, 10);
      expect(session.results.accuracy).toBeCloseTo(66.67, 1);

      // 3/4 = 75%
      session.recordAnswer(true, 10);
      expect(session.results.accuracy).toBe(75);
    });

    it('should calculate averageTime correctly', () => {
      // 10/1 = 10
      session.recordAnswer(true, 10);
      expect(session.results.averageTime).toBe(10);

      // 30/2 = 15
      session.recordAnswer(true, 20);
      expect(session.results.averageTime).toBe(15);

      // 45/3 = 15
      session.recordAnswer(true, 15);
      expect(session.results.averageTime).toBe(15);

      // 50/4 = 12.5
      session.recordAnswer(true, 5);
      expect(session.results.averageTime).toBe(12.5);
    });

    it('should update results after complete()', () => {
      session.recordAnswer(true, 10);
      session.recordAnswer(false, 20);
      session.recordAnswer(true, 30);

      session.complete();

      // 2/3 correct = 66.67%
      expect(session.results.accuracy).toBeCloseTo(66.67, 1);
      // 60/3 = 20 seconds average
      expect(session.results.averageTime).toBe(20);
    });
  });

  describe('Progress Tracking', () => {
    let session: PracticeSessionEntity;

    beforeEach(() => {
      session = PracticeSessionEntity.create(
        'session-1',
        'topic-1',
        ['path-1'],
        ['task-1', 'task-2', 'task-3', 'task-4', 'task-5'],
        { targetCount: 5, includeReview: false }
      );
      session.start();
    });

    it('should calculate progress percentage', () => {
      expect(session.getProgress()).toBe(0);

      session.recordAnswer(true, 10);
      expect(session.getProgress()).toBe(20); // 1/5 = 20%

      session.recordAnswer(true, 10);
      expect(session.getProgress()).toBe(40); // 2/5 = 40%

      session.recordAnswer(true, 10);
      expect(session.getProgress()).toBe(60); // 3/5 = 60%
    });

    it('should detect when session is complete', () => {
      expect(session.isComplete()).toBe(false);

      for (let i = 0; i < 5; i++) {
        session.recordAnswer(true, 10);
      }

      expect(session.isComplete()).toBe(true);
    });

    it('should calculate remaining tasks count', () => {
      expect(session.getRemainingCount()).toBe(5);

      session.recordAnswer(true, 10);
      expect(session.getRemainingCount()).toBe(4);

      session.recordAnswer(true, 10);
      expect(session.getRemainingCount()).toBe(3);
    });
  });

  describe('Serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const session = PracticeSessionEntity.create(
        'session-1',
        'topic-1',
        ['path-1', 'path-2'],
        ['task-1', 'task-2'],
        { targetCount: 10, includeReview: true, difficultyFilter: 'hard' }
      );
      session.start();
      session.recordAnswer(true, 15);
      session.recordAnswer(false, 10);

      const json = session.toJSON();
      const restored = PracticeSessionEntity.fromJSON(json);

      expect(restored.id).toBe(session.id);
      expect(restored.configuration.topicId).toBe(session.configuration.topicId);
      expect(restored.configuration.learningPathIds).toEqual(
        session.configuration.learningPathIds
      );
      expect(restored.configuration.difficultyFilter).toBe(
        session.configuration.difficultyFilter
      );
      expect(restored.execution.completedCount).toBe(
        session.execution.completedCount
      );
      expect(restored.execution.correctCount).toBe(session.execution.correctCount);
      expect(restored.execution.totalTimeSpent).toBe(
        session.execution.totalTimeSpent
      );
      expect(restored.results.accuracy).toBe(session.results.accuracy);
      expect(restored.results.averageTime).toBe(session.results.averageTime);
    });
  });

  describe('Validation', () => {
    it('should reject target count below 5', () => {
      expect(() =>
        PracticeSessionEntity.create(
          'session-1',
          'topic-1',
          ['path-1'],
          ['task-1'],
          { targetCount: 3, includeReview: false }
        )
      ).toThrow('Target count must be between 5 and 50');
    });

    it('should reject target count above 50', () => {
      expect(() =>
        PracticeSessionEntity.create(
          'session-1',
          'topic-1',
          ['path-1'],
          ['task-1'],
          { targetCount: 100, includeReview: false }
        )
      ).toThrow('Target count must be between 5 and 50');
    });
  });
});
