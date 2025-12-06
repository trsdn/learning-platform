/**
 * Tests for AnswerHistoryEntity
 *
 * Tests the answer history entity including:
 * - Constructor and validation
 * - Static validate method (timeSpent, confidence)
 * - Static create factory method
 * - Time conversion and analysis methods
 * - Performance score calculation
 * - Serialization and deserialization
 */

import { describe, it, expect } from 'vitest';
import { AnswerHistoryEntity } from '../../../../src/modules/core/entities/answer-history';
import { ValidationError } from '../../../../src/modules/core/types/entities';
import type { AnswerHistory } from '../../../../src/modules/core/types/services';

describe('AnswerHistoryEntity', () => {
  const createValidAnswerData = (): AnswerHistory => ({
    id: 'answer-1',
    taskId: 'task-1',
    sessionId: 'session-1',
    userAnswer: 'Answer A',
    isCorrect: true,
    timeSpent: 45,
    confidence: 4,
    metadata: {
      attemptNumber: 1,
      hintsUsed: 0,
      deviceType: 'desktop',
      browserInfo: 'Chrome 120.0',
    },
    timestamp: new Date('2025-01-15T10:00:00Z'),
  });

  describe('Constructor', () => {
    it('should create answer history with valid data', () => {
      const data = createValidAnswerData();
      const answer = new AnswerHistoryEntity(data);

      expect(answer.id).toBe('answer-1');
      expect(answer.taskId).toBe('task-1');
      expect(answer.sessionId).toBe('session-1');
      expect(answer.userAnswer).toBe('Answer A');
      expect(answer.isCorrect).toBe(true);
      expect(answer.timeSpent).toBe(45);
      expect(answer.confidence).toBe(4);
      expect(answer.metadata.attemptNumber).toBe(1);
      expect(answer.metadata.hintsUsed).toBe(0);
      expect(answer.metadata.deviceType).toBe('desktop');
      expect(answer.metadata.browserInfo).toBe('Chrome 120.0');
      expect(answer.timestamp).toBeInstanceOf(Date);
    });

    it('should create answer history with array userAnswer', () => {
      const data = createValidAnswerData();
      data.userAnswer = ['Answer A', 'Answer B'];
      const answer = new AnswerHistoryEntity(data);

      expect(answer.userAnswer).toEqual(['Answer A', 'Answer B']);
    });

    it('should deep copy metadata', () => {
      const data = createValidAnswerData();
      const answer = new AnswerHistoryEntity(data);

      data.metadata.hintsUsed = 5;

      expect(answer.metadata.hintsUsed).toBe(0);
    });

    it('should convert timestamp to Date object', () => {
      const data = createValidAnswerData();
      const answer = new AnswerHistoryEntity(data);

      expect(answer.timestamp).toBeInstanceOf(Date);
      expect(answer.timestamp.toISOString()).toBe('2025-01-15T10:00:00.000Z');
    });
  });

  describe('Static validate method', () => {
    describe('timeSpent validation', () => {
      it('should accept valid timeSpent values', () => {
        expect(() => AnswerHistoryEntity.validate({ timeSpent: 0 })).not.toThrow();
        expect(() => AnswerHistoryEntity.validate({ timeSpent: 1 })).not.toThrow();
        expect(() => AnswerHistoryEntity.validate({ timeSpent: 100 })).not.toThrow();
        expect(() => AnswerHistoryEntity.validate({ timeSpent: 1800 })).not.toThrow();
        expect(() => AnswerHistoryEntity.validate({ timeSpent: 3600 })).not.toThrow();
      });

      it('should reject negative timeSpent', () => {
        expect(() => AnswerHistoryEntity.validate({ timeSpent: -1 })).toThrow(
          ValidationError
        );
        expect(() => AnswerHistoryEntity.validate({ timeSpent: -1 })).toThrow(
          'Time spent must be between 0 and 3600 seconds'
        );
      });

      it('should reject timeSpent above 3600 seconds (1 hour)', () => {
        expect(() => AnswerHistoryEntity.validate({ timeSpent: 3601 })).toThrow(
          ValidationError
        );
        expect(() => AnswerHistoryEntity.validate({ timeSpent: 3601 })).toThrow(
          'Time spent must be between 0 and 3600 seconds'
        );
      });

      it('should include field and value in validation error', () => {
        try {
          AnswerHistoryEntity.validate({ timeSpent: -5 });
          expect.fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          if (error instanceof ValidationError) {
            expect(error.context?.field).toBe('timeSpent');
            expect(error.context?.value).toBe(-5);
          }
        }
      });

      it('should allow undefined timeSpent', () => {
        expect(() => AnswerHistoryEntity.validate({})).not.toThrow();
        expect(() => AnswerHistoryEntity.validate({ timeSpent: undefined })).not.toThrow();
      });
    });

    describe('confidence validation', () => {
      it('should accept valid confidence values (1-5)', () => {
        expect(() => AnswerHistoryEntity.validate({ confidence: 1 })).not.toThrow();
        expect(() => AnswerHistoryEntity.validate({ confidence: 2 })).not.toThrow();
        expect(() => AnswerHistoryEntity.validate({ confidence: 3 })).not.toThrow();
        expect(() => AnswerHistoryEntity.validate({ confidence: 4 })).not.toThrow();
        expect(() => AnswerHistoryEntity.validate({ confidence: 5 })).not.toThrow();
      });

      it('should reject confidence below 1', () => {
        expect(() => AnswerHistoryEntity.validate({ confidence: 0 })).toThrow(
          ValidationError
        );
        expect(() => AnswerHistoryEntity.validate({ confidence: 0 })).toThrow(
          'Confidence must be between 1 and 5'
        );
      });

      it('should reject confidence above 5', () => {
        expect(() => AnswerHistoryEntity.validate({ confidence: 6 })).toThrow(
          ValidationError
        );
        expect(() => AnswerHistoryEntity.validate({ confidence: 6 })).toThrow(
          'Confidence must be between 1 and 5'
        );
      });

      it('should include field and value in validation error', () => {
        try {
          AnswerHistoryEntity.validate({ confidence: 10 });
          expect.fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          if (error instanceof ValidationError) {
            expect(error.context?.field).toBe('confidence');
            expect(error.context?.value).toBe(10);
          }
        }
      });

      it('should allow undefined confidence', () => {
        expect(() => AnswerHistoryEntity.validate({})).not.toThrow();
        expect(() => AnswerHistoryEntity.validate({ confidence: undefined })).not.toThrow();
      });
    });

    describe('combined validation', () => {
      it('should validate both timeSpent and confidence together', () => {
        expect(() =>
          AnswerHistoryEntity.validate({ timeSpent: 100, confidence: 3 })
        ).not.toThrow();
      });

      it('should throw on first validation error', () => {
        expect(() =>
          AnswerHistoryEntity.validate({ timeSpent: -1, confidence: 10 })
        ).toThrow('Time spent must be between 0 and 3600 seconds');
      });
    });
  });

  describe('Static create factory method', () => {
    it('should create answer history with factory method', () => {
      const answer = AnswerHistoryEntity.create(
        'answer-1',
        'task-1',
        'session-1',
        'Answer A',
        true,
        45,
        4,
        {
          attemptNumber: 1,
          hintsUsed: 0,
          deviceType: 'desktop',
          browserInfo: 'Chrome 120.0',
        }
      );

      expect(answer.id).toBe('answer-1');
      expect(answer.taskId).toBe('task-1');
      expect(answer.sessionId).toBe('session-1');
      expect(answer.userAnswer).toBe('Answer A');
      expect(answer.isCorrect).toBe(true);
      expect(answer.timeSpent).toBe(45);
      expect(answer.confidence).toBe(4);
      expect(answer.metadata.attemptNumber).toBe(1);
      expect(answer.timestamp).toBeInstanceOf(Date);
    });

    it('should create answer with array userAnswer', () => {
      const answer = AnswerHistoryEntity.create(
        'answer-1',
        'task-1',
        'session-1',
        ['Answer A', 'Answer B'],
        true,
        45,
        4,
        {
          attemptNumber: 1,
          hintsUsed: 0,
          deviceType: 'mobile',
          browserInfo: 'Safari 17.0',
        }
      );

      expect(answer.userAnswer).toEqual(['Answer A', 'Answer B']);
      expect(answer.metadata.deviceType).toBe('mobile');
    });

    it('should set timestamp to current time', () => {
      const beforeCreate = new Date();
      const answer = AnswerHistoryEntity.create(
        'answer-1',
        'task-1',
        'session-1',
        'Answer A',
        true,
        45,
        4,
        {
          attemptNumber: 1,
          hintsUsed: 0,
          deviceType: 'tablet',
          browserInfo: 'Firefox 121.0',
        }
      );
      const afterCreate = new Date();

      expect(answer.timestamp.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(answer.timestamp.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should validate data when creating', () => {
      expect(() =>
        AnswerHistoryEntity.create(
          'answer-1',
          'task-1',
          'session-1',
          'Answer A',
          true,
          -10, // Invalid timeSpent
          4,
          {
            attemptNumber: 1,
            hintsUsed: 0,
            deviceType: 'desktop',
            browserInfo: 'Chrome 120.0',
          }
        )
      ).toThrow(ValidationError);
    });
  });

  describe('getTimeSpentMinutes method', () => {
    it('should convert timeSpent to minutes with 1 decimal place', () => {
      const answer1 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 60
      });
      expect(answer1.getTimeSpentMinutes()).toBe(1.0);

      const answer2 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 90
      });
      expect(answer2.getTimeSpentMinutes()).toBe(1.5);

      const answer3 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 120
      });
      expect(answer3.getTimeSpentMinutes()).toBe(2.0);
    });

    it('should round to 1 decimal place', () => {
      const answer1 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 45
      });
      expect(answer1.getTimeSpentMinutes()).toBe(0.8); // 0.75 -> 0.8

      const answer2 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 33
      });
      expect(answer2.getTimeSpentMinutes()).toBe(0.6); // 0.55 -> 0.6
    });

    it('should handle zero timeSpent', () => {
      const answer = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 0
      });
      expect(answer.getTimeSpentMinutes()).toBe(0);
    });

    it('should handle edge cases', () => {
      const answer1 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 1
      });
      expect(answer1.getTimeSpentMinutes()).toBe(0.0);

      const answer2 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 3600
      });
      expect(answer2.getTimeSpentMinutes()).toBe(60.0);
    });
  });

  describe('isQuickAnswer method', () => {
    it('should return true for answers less than 10 seconds', () => {
      const answer1 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 0
      });
      expect(answer1.isQuickAnswer()).toBe(true);

      const answer2 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 5
      });
      expect(answer2.isQuickAnswer()).toBe(true);

      const answer3 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 9
      });
      expect(answer3.isQuickAnswer()).toBe(true);
    });

    it('should return false for answers 10 seconds or more', () => {
      const answer1 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 10
      });
      expect(answer1.isQuickAnswer()).toBe(false);

      const answer2 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 11
      });
      expect(answer2.isQuickAnswer()).toBe(false);

      const answer3 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 100
      });
      expect(answer3.isQuickAnswer()).toBe(false);
    });

    it('should test boundary at 10 seconds threshold', () => {
      const quickAnswer = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 9.9
      });
      expect(quickAnswer.isQuickAnswer()).toBe(true);

      const notQuickAnswer = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 10.0
      });
      expect(notQuickAnswer.isQuickAnswer()).toBe(false);
    });
  });

  describe('isSlowAnswer method', () => {
    it('should return true for answers more than 120 seconds (2 minutes)', () => {
      const answer1 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 121
      });
      expect(answer1.isSlowAnswer()).toBe(true);

      const answer2 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 200
      });
      expect(answer2.isSlowAnswer()).toBe(true);

      const answer3 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 3600
      });
      expect(answer3.isSlowAnswer()).toBe(true);
    });

    it('should return false for answers 120 seconds or less', () => {
      const answer1 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 0
      });
      expect(answer1.isSlowAnswer()).toBe(false);

      const answer2 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 60
      });
      expect(answer2.isSlowAnswer()).toBe(false);

      const answer3 = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 120
      });
      expect(answer3.isSlowAnswer()).toBe(false);
    });

    it('should test boundary at 120 seconds threshold', () => {
      const notSlowAnswer = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 120
      });
      expect(notSlowAnswer.isSlowAnswer()).toBe(false);

      const slowAnswer = new AnswerHistoryEntity({
        ...createValidAnswerData(),
        timeSpent: 121
      });
      expect(slowAnswer.isSlowAnswer()).toBe(true);
    });
  });

  describe('getPerformanceScore method', () => {
    describe('correctness component (50 points)', () => {
      it('should give 50 points for correct answer', () => {
        const answer = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: true,
          timeSpent: 60, // 25 points (optimal range)
          confidence: 1, // 0 points
        });
        expect(answer.getPerformanceScore()).toBe(75); // 50 + 25 + 0
      });

      it('should give 0 points for incorrect answer', () => {
        const answer = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 60, // 25 points (optimal range)
          confidence: 5, // 25 points
        });
        expect(answer.getPerformanceScore()).toBe(50); // 0 + 25 + 25
      });
    });

    describe('time efficiency component (25 points)', () => {
      it('should give 25 points for optimal time (30-90 seconds)', () => {
        const answer1 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false, // 0 points
          timeSpent: 30,
          confidence: 1, // 0 points
        });
        expect(answer1.getPerformanceScore()).toBe(25); // 0 + 25 + 0

        const answer2 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 60,
          confidence: 1,
        });
        expect(answer2.getPerformanceScore()).toBe(25);

        const answer3 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 90,
          confidence: 1,
        });
        expect(answer3.getPerformanceScore()).toBe(25);
      });

      it('should give 15 points for too quick (< 30 seconds)', () => {
        const answer1 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 0,
          confidence: 1,
        });
        expect(answer1.getPerformanceScore()).toBe(15);

        const answer2 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 29,
          confidence: 1,
        });
        expect(answer2.getPerformanceScore()).toBe(15);
      });

      it('should give 20 points for longer but reasonable (91-180 seconds)', () => {
        const answer1 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 91,
          confidence: 1,
        });
        expect(answer1.getPerformanceScore()).toBe(20);

        const answer2 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 150,
          confidence: 1,
        });
        expect(answer2.getPerformanceScore()).toBe(20);

        const answer3 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 180,
          confidence: 1,
        });
        expect(answer3.getPerformanceScore()).toBe(20);
      });

      it('should give 10 points for too slow (> 180 seconds)', () => {
        const answer1 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 181,
          confidence: 1,
        });
        expect(answer1.getPerformanceScore()).toBe(10);

        const answer2 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 3600,
          confidence: 1,
        });
        expect(answer2.getPerformanceScore()).toBe(10);
      });
    });

    describe('confidence component (25 points)', () => {
      it('should scale confidence 1-5 to 0-25 points', () => {
        const answer1 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 200, // 10 points
          confidence: 1,
        });
        expect(answer1.getPerformanceScore()).toBe(10); // 0 + 10 + 0

        const answer2 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 200,
          confidence: 2,
        });
        expect(answer2.getPerformanceScore()).toBe(16); // 0 + 10 + 6.25 rounded

        const answer3 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 200,
          confidence: 3,
        });
        expect(answer3.getPerformanceScore()).toBe(23); // 0 + 10 + 12.5 rounded

        const answer4 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 200,
          confidence: 4,
        });
        expect(answer4.getPerformanceScore()).toBe(29); // 0 + 10 + 18.75 rounded

        const answer5 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 200,
          confidence: 5,
        });
        expect(answer5.getPerformanceScore()).toBe(35); // 0 + 10 + 25
      });
    });

    describe('combined scoring scenarios', () => {
      it('should calculate perfect score (100 points)', () => {
        const answer = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: true, // 50
          timeSpent: 60, // 25 (optimal)
          confidence: 5, // 25
        });
        expect(answer.getPerformanceScore()).toBe(100);
      });

      it('should calculate minimum score (10 points)', () => {
        const answer = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false, // 0
          timeSpent: 200, // 10 (too slow)
          confidence: 1, // 0
        });
        expect(answer.getPerformanceScore()).toBe(10);
      });

      it('should calculate mid-range score', () => {
        const answer = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: true, // 50
          timeSpent: 150, // 20 (longer but reasonable)
          confidence: 3, // 12.5 -> 13 rounded
        });
        expect(answer.getPerformanceScore()).toBe(83); // 50 + 20 + 13
      });

      it('should round final score to integer', () => {
        const answer = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: true, // 50
          timeSpent: 20, // 15 (too quick)
          confidence: 2, // 6.25
        });
        expect(answer.getPerformanceScore()).toBe(71); // 50 + 15 + 6.25 = 71.25 -> 71
      });
    });

    describe('edge cases and boundary testing', () => {
      it('should handle time boundary at 30 seconds', () => {
        const answer1 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 29,
          confidence: 1,
        });
        expect(answer1.getPerformanceScore()).toBe(15); // Quick

        const answer2 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 30,
          confidence: 1,
        });
        expect(answer2.getPerformanceScore()).toBe(25); // Optimal
      });

      it('should handle time boundary at 90 seconds', () => {
        const answer1 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 90,
          confidence: 1,
        });
        expect(answer1.getPerformanceScore()).toBe(25); // Optimal

        const answer2 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 91,
          confidence: 1,
        });
        expect(answer2.getPerformanceScore()).toBe(20); // Longer
      });

      it('should handle time boundary at 180 seconds', () => {
        const answer1 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 180,
          confidence: 1,
        });
        expect(answer1.getPerformanceScore()).toBe(20); // Longer

        const answer2 = new AnswerHistoryEntity({
          ...createValidAnswerData(),
          isCorrect: false,
          timeSpent: 181,
          confidence: 1,
        });
        expect(answer2.getPerformanceScore()).toBe(10); // Too slow
      });
    });
  });

  describe('Serialization', () => {
    describe('toJSON method', () => {
      it('should convert entity to plain object', () => {
        const data = createValidAnswerData();
        const answer = new AnswerHistoryEntity(data);
        const json = answer.toJSON();

        expect(json.id).toBe('answer-1');
        expect(json.taskId).toBe('task-1');
        expect(json.sessionId).toBe('session-1');
        expect(json.userAnswer).toBe('Answer A');
        expect(json.isCorrect).toBe(true);
        expect(json.timeSpent).toBe(45);
        expect(json.confidence).toBe(4);
        expect(json.metadata.attemptNumber).toBe(1);
        expect(json.metadata.hintsUsed).toBe(0);
        expect(json.metadata.deviceType).toBe('desktop');
        expect(json.metadata.browserInfo).toBe('Chrome 120.0');
        expect(json.timestamp).toBeInstanceOf(Date);
      });

      it('should deep copy metadata in toJSON', () => {
        const answer = new AnswerHistoryEntity(createValidAnswerData());
        const json = answer.toJSON();

        json.metadata.hintsUsed = 10;

        expect(answer.metadata.hintsUsed).toBe(0);
      });

      it('should preserve array userAnswer', () => {
        const data = createValidAnswerData();
        data.userAnswer = ['Answer A', 'Answer B'];
        const answer = new AnswerHistoryEntity(data);
        const json = answer.toJSON();

        expect(json.userAnswer).toEqual(['Answer A', 'Answer B']);
      });
    });

    describe('fromJSON method', () => {
      it('should create entity from plain object', () => {
        const data = createValidAnswerData();
        const answer = AnswerHistoryEntity.fromJSON(data);

        expect(answer).toBeInstanceOf(AnswerHistoryEntity);
        expect(answer.id).toBe('answer-1');
        expect(answer.taskId).toBe('task-1');
        expect(answer.sessionId).toBe('session-1');
        expect(answer.userAnswer).toBe('Answer A');
        expect(answer.isCorrect).toBe(true);
        expect(answer.timeSpent).toBe(45);
        expect(answer.confidence).toBe(4);
      });

      it('should validate data when creating from JSON', () => {
        const data = createValidAnswerData();
        data.timeSpent = 5000; // Invalid

        expect(() => AnswerHistoryEntity.fromJSON(data)).toThrow(ValidationError);
      });
    });

    describe('round-trip serialization', () => {
      it('should preserve all data through serialize/deserialize cycle', () => {
        const original = new AnswerHistoryEntity(createValidAnswerData());
        const json = original.toJSON();
        const restored = AnswerHistoryEntity.fromJSON(json);

        expect(restored.id).toBe(original.id);
        expect(restored.taskId).toBe(original.taskId);
        expect(restored.sessionId).toBe(original.sessionId);
        expect(restored.userAnswer).toBe(original.userAnswer);
        expect(restored.isCorrect).toBe(original.isCorrect);
        expect(restored.timeSpent).toBe(original.timeSpent);
        expect(restored.confidence).toBe(original.confidence);
        expect(restored.metadata).toEqual(original.metadata);
        expect(restored.timestamp.getTime()).toBe(original.timestamp.getTime());
      });

      it('should preserve array userAnswer through round-trip', () => {
        const data = createValidAnswerData();
        data.userAnswer = ['Answer A', 'Answer B', 'Answer C'];
        const original = new AnswerHistoryEntity(data);
        const json = original.toJSON();
        const restored = AnswerHistoryEntity.fromJSON(json);

        expect(restored.userAnswer).toEqual(['Answer A', 'Answer B', 'Answer C']);
      });

      it('should preserve all device types through round-trip', () => {
        const deviceTypes: Array<'mobile' | 'desktop' | 'tablet'> = [
          'mobile',
          'desktop',
          'tablet',
        ];

        deviceTypes.forEach((deviceType) => {
          const data = createValidAnswerData();
          data.metadata.deviceType = deviceType;
          const original = new AnswerHistoryEntity(data);
          const json = original.toJSON();
          const restored = AnswerHistoryEntity.fromJSON(json);

          expect(restored.metadata.deviceType).toBe(deviceType);
        });
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete answer workflow', () => {
      // Create answer
      const answer = AnswerHistoryEntity.create(
        'answer-1',
        'task-1',
        'session-1',
        'Answer A',
        true,
        75,
        4,
        {
          attemptNumber: 1,
          hintsUsed: 0,
          deviceType: 'desktop',
          browserInfo: 'Chrome 120.0',
        }
      );

      // Check time analysis
      expect(answer.getTimeSpentMinutes()).toBe(1.3);
      expect(answer.isQuickAnswer()).toBe(false);
      expect(answer.isSlowAnswer()).toBe(false);

      // Check performance
      const score = answer.getPerformanceScore();
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);

      // Serialize and restore
      const json = answer.toJSON();
      const restored = AnswerHistoryEntity.fromJSON(json);
      expect(restored.getPerformanceScore()).toBe(score);
    });

    it('should handle incorrect quick answer with low confidence', () => {
      const answer = AnswerHistoryEntity.create(
        'answer-2',
        'task-2',
        'session-1',
        'Wrong answer',
        false,
        5,
        1,
        {
          attemptNumber: 1,
          hintsUsed: 0,
          deviceType: 'mobile',
          browserInfo: 'Safari 17.0',
        }
      );

      expect(answer.isQuickAnswer()).toBe(true);
      expect(answer.isCorrect).toBe(false);
      expect(answer.confidence).toBe(1);

      // Low score: 0 (incorrect) + 15 (quick) + 0 (low confidence)
      expect(answer.getPerformanceScore()).toBe(15);
    });

    it('should handle correct slow answer with high confidence', () => {
      const answer = AnswerHistoryEntity.create(
        'answer-3',
        'task-3',
        'session-1',
        'Correct answer',
        true,
        250,
        5,
        {
          attemptNumber: 2,
          hintsUsed: 1,
          deviceType: 'tablet',
          browserInfo: 'Firefox 121.0',
        }
      );

      expect(answer.isSlowAnswer()).toBe(true);
      expect(answer.isCorrect).toBe(true);
      expect(answer.confidence).toBe(5);

      // Score: 50 (correct) + 10 (slow) + 25 (high confidence)
      expect(answer.getPerformanceScore()).toBe(85);
    });
  });
});
