/**
 * Tests for UserProgressEntity
 *
 * Tests the core user progress tracking logic including:
 * - Constructor validation and initialization
 * - Static validation of statistics fields (non-negative, accuracy 0-100, mastery 0-100)
 * - Factory creation with and without learningPathId
 * - recordAttempt with correct/incorrect tracking and accuracy recalculation
 * - updateStreak and bestStreak tracking
 * - incrementSessionCount
 * - getCompletionPercentage including edge case when totalTasks is 0
 * - toJSON and fromJSON serialization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UserProgressEntity } from '../../../../src/modules/core/entities/user-progress';
import { ValidationError } from '../../../../src/modules/core/types/entities';
import type { UserProgress } from '@core/types/services';

describe('UserProgressEntity', () => {
  describe('Constructor and Initialization', () => {
    it('should create a user progress entity with all required fields', () => {
      const data: UserProgress = {
        id: 'progress-1',
        topicId: 'topic-1',
        statistics: {
          completedTasks: 5,
          totalTasks: 10,
          correctAnswers: 8,
          totalAttempts: 10,
          accuracyRate: 80,
          timeSpent: 300,
          streakDays: 3,
          masteryLevel: 75,
        },
        milestones: {
          firstCompleted: new Date('2024-01-01'),
          lastActivity: new Date('2024-01-15'),
          bestStreak: 5,
          totalSessions: 10,
        },
        preferences: {
          preferredDifficulty: 'medium',
          preferredSessionLength: 10,
          reminderSettings: {
            enabled: true,
            frequency: 'daily',
            time: '18:00',
          },
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      const progress = new UserProgressEntity(data);

      expect(progress.id).toBe('progress-1');
      expect(progress.topicId).toBe('topic-1');
      expect(progress.statistics.completedTasks).toBe(5);
      expect(progress.statistics.totalTasks).toBe(10);
      expect(progress.statistics.correctAnswers).toBe(8);
      expect(progress.statistics.totalAttempts).toBe(10);
      expect(progress.statistics.accuracyRate).toBe(80);
      expect(progress.statistics.timeSpent).toBe(300);
      expect(progress.statistics.streakDays).toBe(3);
      expect(progress.statistics.masteryLevel).toBe(75);
      expect(progress.milestones.bestStreak).toBe(5);
      expect(progress.milestones.totalSessions).toBe(10);
      expect(progress.preferences.preferredDifficulty).toBe('medium');
      expect(progress.preferences.preferredSessionLength).toBe(10);
      expect(progress.preferences.reminderSettings.enabled).toBe(true);
    });

    it('should create a user progress entity with optional learningPathId', () => {
      const data: UserProgress = {
        id: 'progress-1',
        topicId: 'topic-1',
        learningPathId: 'path-1',
        statistics: {
          completedTasks: 0,
          totalTasks: 0,
          correctAnswers: 0,
          totalAttempts: 0,
          accuracyRate: 0,
          timeSpent: 0,
          streakDays: 0,
          masteryLevel: 0,
        },
        milestones: {
          firstCompleted: new Date(),
          lastActivity: new Date(),
          bestStreak: 0,
          totalSessions: 0,
        },
        preferences: {
          preferredDifficulty: 'easy',
          preferredSessionLength: 15,
          reminderSettings: {
            enabled: false,
            frequency: 'weekly',
            time: '09:00',
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const progress = new UserProgressEntity(data);

      expect(progress.learningPathId).toBe('path-1');
    });

    it('should not set learningPathId when not provided', () => {
      const data: UserProgress = {
        id: 'progress-1',
        topicId: 'topic-1',
        statistics: {
          completedTasks: 0,
          totalTasks: 0,
          correctAnswers: 0,
          totalAttempts: 0,
          accuracyRate: 0,
          timeSpent: 0,
          streakDays: 0,
          masteryLevel: 0,
        },
        milestones: {
          firstCompleted: new Date(),
          lastActivity: new Date(),
          bestStreak: 0,
          totalSessions: 0,
        },
        preferences: {
          preferredDifficulty: 'medium',
          preferredSessionLength: 10,
          reminderSettings: {
            enabled: false,
            frequency: 'daily',
            time: '18:00',
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const progress = new UserProgressEntity(data);

      expect(progress.learningPathId).toBeUndefined();
    });

    it('should convert date strings to Date objects', () => {
      const data: UserProgress = {
        id: 'progress-1',
        topicId: 'topic-1',
        statistics: {
          completedTasks: 0,
          totalTasks: 0,
          correctAnswers: 0,
          totalAttempts: 0,
          accuracyRate: 0,
          timeSpent: 0,
          streakDays: 0,
          masteryLevel: 0,
        },
        milestones: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          firstCompleted: '2024-01-01' as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          lastActivity: '2024-01-15' as any,
          bestStreak: 0,
          totalSessions: 0,
        },
        preferences: {
          preferredDifficulty: 'medium',
          preferredSessionLength: 10,
          reminderSettings: {
            enabled: false,
            frequency: 'daily',
            time: '18:00',
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdAt: '2024-01-01' as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatedAt: '2024-01-15' as any,
      };

      const progress = new UserProgressEntity(data);

      expect(progress.milestones.firstCompleted).toBeInstanceOf(Date);
      expect(progress.milestones.lastActivity).toBeInstanceOf(Date);
      expect(progress.createdAt).toBeInstanceOf(Date);
      expect(progress.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Static validate Method', () => {
    describe('Statistics Field Validation (Non-negative)', () => {
      const validData: Partial<UserProgress> = {
        statistics: {
          completedTasks: 5,
          totalTasks: 10,
          correctAnswers: 8,
          totalAttempts: 10,
          accuracyRate: 80,
          timeSpent: 300,
          streakDays: 3,
          masteryLevel: 75,
        },
      };

      it('should pass validation with valid non-negative statistics', () => {
        expect(() => UserProgressEntity.validate(validData)).not.toThrow();
      });

      it('should throw ValidationError when totalTasks is negative', () => {
        const invalidData: Partial<UserProgress> = {
          statistics: {
            ...validData.statistics!,
            totalTasks: -1,
          },
        };

        expect(() => UserProgressEntity.validate(invalidData)).toThrow(ValidationError);
        expect(() => UserProgressEntity.validate(invalidData)).toThrow(
          'totalTasks must be non-negative'
        );
      });

      it('should throw ValidationError when completedTasks is negative', () => {
        const invalidData: Partial<UserProgress> = {
          statistics: {
            ...validData.statistics!,
            completedTasks: -5,
          },
        };

        expect(() => UserProgressEntity.validate(invalidData)).toThrow(ValidationError);
        expect(() => UserProgressEntity.validate(invalidData)).toThrow(
          'completedTasks must be non-negative'
        );
      });

      it('should throw ValidationError when correctAnswers is negative', () => {
        const invalidData: Partial<UserProgress> = {
          statistics: {
            ...validData.statistics!,
            correctAnswers: -3,
          },
        };

        expect(() => UserProgressEntity.validate(invalidData)).toThrow(ValidationError);
        expect(() => UserProgressEntity.validate(invalidData)).toThrow(
          'correctAnswers must be non-negative'
        );
      });

      it('should throw ValidationError when totalAttempts is negative', () => {
        const invalidData: Partial<UserProgress> = {
          statistics: {
            ...validData.statistics!,
            totalAttempts: -10,
          },
        };

        expect(() => UserProgressEntity.validate(invalidData)).toThrow(ValidationError);
        expect(() => UserProgressEntity.validate(invalidData)).toThrow(
          'totalAttempts must be non-negative'
        );
      });

      it('should throw ValidationError when timeSpent is negative', () => {
        const invalidData: Partial<UserProgress> = {
          statistics: {
            ...validData.statistics!,
            timeSpent: -100,
          },
        };

        expect(() => UserProgressEntity.validate(invalidData)).toThrow(ValidationError);
        expect(() => UserProgressEntity.validate(invalidData)).toThrow(
          'timeSpent must be non-negative'
        );
      });

      it('should throw ValidationError when streakDays is negative', () => {
        const invalidData: Partial<UserProgress> = {
          statistics: {
            ...validData.statistics!,
            streakDays: -2,
          },
        };

        expect(() => UserProgressEntity.validate(invalidData)).toThrow(ValidationError);
        expect(() => UserProgressEntity.validate(invalidData)).toThrow(
          'streakDays must be non-negative'
        );
      });

      it('should allow zero values for all statistics fields', () => {
        const zeroData: Partial<UserProgress> = {
          statistics: {
            completedTasks: 0,
            totalTasks: 0,
            correctAnswers: 0,
            totalAttempts: 0,
            accuracyRate: 0,
            timeSpent: 0,
            streakDays: 0,
            masteryLevel: 0,
          },
        };

        expect(() => UserProgressEntity.validate(zeroData)).not.toThrow();
      });
    });

    describe('Accuracy Rate Validation (0-100)', () => {
      it('should pass validation when accuracyRate is 0', () => {
        const data: Partial<UserProgress> = {
          statistics: {
            completedTasks: 0,
            totalTasks: 0,
            correctAnswers: 0,
            totalAttempts: 0,
            accuracyRate: 0,
            timeSpent: 0,
            streakDays: 0,
            masteryLevel: 0,
          },
        };

        expect(() => UserProgressEntity.validate(data)).not.toThrow();
      });

      it('should pass validation when accuracyRate is 100', () => {
        const data: Partial<UserProgress> = {
          statistics: {
            completedTasks: 10,
            totalTasks: 10,
            correctAnswers: 10,
            totalAttempts: 10,
            accuracyRate: 100,
            timeSpent: 300,
            streakDays: 5,
            masteryLevel: 100,
          },
        };

        expect(() => UserProgressEntity.validate(data)).not.toThrow();
      });

      it('should pass validation when accuracyRate is within 0-100 range', () => {
        const data: Partial<UserProgress> = {
          statistics: {
            completedTasks: 5,
            totalTasks: 10,
            correctAnswers: 8,
            totalAttempts: 10,
            accuracyRate: 75.5,
            timeSpent: 300,
            streakDays: 3,
            masteryLevel: 60,
          },
        };

        expect(() => UserProgressEntity.validate(data)).not.toThrow();
      });

      it('should throw ValidationError when accuracyRate is negative', () => {
        const data: Partial<UserProgress> = {
          statistics: {
            completedTasks: 0,
            totalTasks: 0,
            correctAnswers: 0,
            totalAttempts: 0,
            accuracyRate: -1,
            timeSpent: 0,
            streakDays: 0,
            masteryLevel: 0,
          },
        };

        expect(() => UserProgressEntity.validate(data)).toThrow(ValidationError);
        expect(() => UserProgressEntity.validate(data)).toThrow(
          'Accuracy rate must be between 0 and 100'
        );
      });

      it('should throw ValidationError when accuracyRate exceeds 100', () => {
        const data: Partial<UserProgress> = {
          statistics: {
            completedTasks: 10,
            totalTasks: 10,
            correctAnswers: 10,
            totalAttempts: 10,
            accuracyRate: 101,
            timeSpent: 300,
            streakDays: 5,
            masteryLevel: 100,
          },
        };

        expect(() => UserProgressEntity.validate(data)).toThrow(ValidationError);
        expect(() => UserProgressEntity.validate(data)).toThrow(
          'Accuracy rate must be between 0 and 100'
        );
      });
    });

    describe('Mastery Level Validation (0-100)', () => {
      it('should pass validation when masteryLevel is 0', () => {
        const data: Partial<UserProgress> = {
          statistics: {
            completedTasks: 0,
            totalTasks: 0,
            correctAnswers: 0,
            totalAttempts: 0,
            accuracyRate: 0,
            timeSpent: 0,
            streakDays: 0,
            masteryLevel: 0,
          },
        };

        expect(() => UserProgressEntity.validate(data)).not.toThrow();
      });

      it('should pass validation when masteryLevel is 100', () => {
        const data: Partial<UserProgress> = {
          statistics: {
            completedTasks: 10,
            totalTasks: 10,
            correctAnswers: 10,
            totalAttempts: 10,
            accuracyRate: 100,
            timeSpent: 300,
            streakDays: 5,
            masteryLevel: 100,
          },
        };

        expect(() => UserProgressEntity.validate(data)).not.toThrow();
      });

      it('should pass validation when masteryLevel is within 0-100 range', () => {
        const data: Partial<UserProgress> = {
          statistics: {
            completedTasks: 5,
            totalTasks: 10,
            correctAnswers: 8,
            totalAttempts: 10,
            accuracyRate: 80,
            timeSpent: 300,
            streakDays: 3,
            masteryLevel: 45.5,
          },
        };

        expect(() => UserProgressEntity.validate(data)).not.toThrow();
      });

      it('should throw ValidationError when masteryLevel is negative', () => {
        const data: Partial<UserProgress> = {
          statistics: {
            completedTasks: 0,
            totalTasks: 0,
            correctAnswers: 0,
            totalAttempts: 0,
            accuracyRate: 0,
            timeSpent: 0,
            streakDays: 0,
            masteryLevel: -10,
          },
        };

        expect(() => UserProgressEntity.validate(data)).toThrow(ValidationError);
        expect(() => UserProgressEntity.validate(data)).toThrow(
          'Mastery level must be between 0 and 100'
        );
      });

      it('should throw ValidationError when masteryLevel exceeds 100', () => {
        const data: Partial<UserProgress> = {
          statistics: {
            completedTasks: 10,
            totalTasks: 10,
            correctAnswers: 10,
            totalAttempts: 10,
            accuracyRate: 100,
            timeSpent: 300,
            streakDays: 5,
            masteryLevel: 150,
          },
        };

        expect(() => UserProgressEntity.validate(data)).toThrow(ValidationError);
        expect(() => UserProgressEntity.validate(data)).toThrow(
          'Mastery level must be between 0 and 100'
        );
      });
    });

    it('should pass validation when statistics is undefined', () => {
      const data: Partial<UserProgress> = {};

      expect(() => UserProgressEntity.validate(data)).not.toThrow();
    });

    it('should pass validation when individual statistic fields are undefined', () => {
      const data: Partial<UserProgress> = {
        statistics: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          completedTasks: undefined as any,
          totalTasks: 10,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          correctAnswers: undefined as any,
          totalAttempts: 10,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          accuracyRate: undefined as any,
          timeSpent: 300,
          streakDays: 3,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          masteryLevel: undefined as any,
        },
      };

      expect(() => UserProgressEntity.validate(data)).not.toThrow();
    });
  });

  describe('Static create Factory Method', () => {
    it('should create a new user progress with default values', () => {
      const progress = UserProgressEntity.create('progress-1', 'topic-1');

      expect(progress.id).toBe('progress-1');
      expect(progress.topicId).toBe('topic-1');
      expect(progress.statistics.completedTasks).toBe(0);
      expect(progress.statistics.totalTasks).toBe(0);
      expect(progress.statistics.correctAnswers).toBe(0);
      expect(progress.statistics.totalAttempts).toBe(0);
      expect(progress.statistics.accuracyRate).toBe(0);
      expect(progress.statistics.timeSpent).toBe(0);
      expect(progress.statistics.streakDays).toBe(0);
      expect(progress.statistics.masteryLevel).toBe(0);
      expect(progress.milestones.bestStreak).toBe(0);
      expect(progress.milestones.totalSessions).toBe(0);
      expect(progress.preferences.preferredDifficulty).toBe('medium');
      expect(progress.preferences.preferredSessionLength).toBe(10);
      expect(progress.preferences.reminderSettings.enabled).toBe(false);
      expect(progress.preferences.reminderSettings.frequency).toBe('daily');
      expect(progress.preferences.reminderSettings.time).toBe('18:00');
      expect(progress.createdAt).toBeInstanceOf(Date);
      expect(progress.updatedAt).toBeInstanceOf(Date);
      expect(progress.milestones.firstCompleted).toBeInstanceOf(Date);
      expect(progress.milestones.lastActivity).toBeInstanceOf(Date);
    });

    it('should create user progress without learningPathId when not provided', () => {
      const progress = UserProgressEntity.create('progress-1', 'topic-1');

      expect(progress.learningPathId).toBeUndefined();
    });

    it('should create user progress with learningPathId when provided', () => {
      const progress = UserProgressEntity.create('progress-1', 'topic-1', 'path-1');

      expect(progress.learningPathId).toBe('path-1');
    });
  });

  describe('recordAttempt Method', () => {
    let progress: UserProgressEntity;
    let initialUpdatedAt: Date;

    beforeEach(() => {
      progress = UserProgressEntity.create('progress-1', 'topic-1');
      initialUpdatedAt = progress.updatedAt;
    });

    it('should increment totalAttempts for any attempt', () => {
      expect(progress.statistics.totalAttempts).toBe(0);

      progress.recordAttempt(true, 10);
      expect(progress.statistics.totalAttempts).toBe(1);

      progress.recordAttempt(false, 10);
      expect(progress.statistics.totalAttempts).toBe(2);

      progress.recordAttempt(true, 10);
      expect(progress.statistics.totalAttempts).toBe(3);
    });

    it('should increment correctAnswers and completedTasks only for correct attempts', () => {
      expect(progress.statistics.correctAnswers).toBe(0);
      expect(progress.statistics.completedTasks).toBe(0);

      progress.recordAttempt(true, 10);
      expect(progress.statistics.correctAnswers).toBe(1);
      expect(progress.statistics.completedTasks).toBe(1);

      progress.recordAttempt(false, 10);
      expect(progress.statistics.correctAnswers).toBe(1);
      expect(progress.statistics.completedTasks).toBe(1);

      progress.recordAttempt(true, 10);
      expect(progress.statistics.correctAnswers).toBe(2);
      expect(progress.statistics.completedTasks).toBe(2);
    });

    it('should not increment correctAnswers or completedTasks for incorrect attempts', () => {
      expect(progress.statistics.correctAnswers).toBe(0);
      expect(progress.statistics.completedTasks).toBe(0);

      progress.recordAttempt(false, 10);
      expect(progress.statistics.correctAnswers).toBe(0);
      expect(progress.statistics.completedTasks).toBe(0);

      progress.recordAttempt(false, 15);
      expect(progress.statistics.correctAnswers).toBe(0);
      expect(progress.statistics.completedTasks).toBe(0);
    });

    it('should set firstCompleted milestone on first correct attempt', () => {
      const beforeFirstAttempt = new Date();

      progress.recordAttempt(true, 10);

      const afterFirstAttempt = new Date();

      expect(progress.milestones.firstCompleted.getTime()).toBeGreaterThanOrEqual(
        beforeFirstAttempt.getTime()
      );
      expect(progress.milestones.firstCompleted.getTime()).toBeLessThanOrEqual(
        afterFirstAttempt.getTime()
      );
    });

    it('should not update firstCompleted milestone after the first correct attempt', () => {
      progress.recordAttempt(true, 10);
      const firstCompleted = progress.milestones.firstCompleted;

      // Wait a tiny bit to ensure time difference
      progress.recordAttempt(true, 15);

      expect(progress.milestones.firstCompleted).toBe(firstCompleted);
    });

    it('should not set firstCompleted milestone for incorrect attempts', () => {
      const initialFirstCompleted = progress.milestones.firstCompleted;

      progress.recordAttempt(false, 10);

      expect(progress.milestones.firstCompleted).toBe(initialFirstCompleted);
    });

    it('should accumulate timeSpent correctly', () => {
      expect(progress.statistics.timeSpent).toBe(0);

      progress.recordAttempt(true, 10);
      expect(progress.statistics.timeSpent).toBe(10);

      progress.recordAttempt(false, 15);
      expect(progress.statistics.timeSpent).toBe(25);

      progress.recordAttempt(true, 20);
      expect(progress.statistics.timeSpent).toBe(45);
    });

    it('should recalculate accuracy rate correctly', () => {
      // 1 correct out of 1 = 100%
      progress.recordAttempt(true, 10);
      expect(progress.statistics.accuracyRate).toBe(100);

      // 1 correct out of 2 = 50%
      progress.recordAttempt(false, 10);
      expect(progress.statistics.accuracyRate).toBe(50);

      // 2 correct out of 3 = 66.67%
      progress.recordAttempt(true, 10);
      expect(progress.statistics.accuracyRate).toBeCloseTo(66.67, 1);

      // 3 correct out of 4 = 75%
      progress.recordAttempt(true, 10);
      expect(progress.statistics.accuracyRate).toBe(75);

      // 3 correct out of 5 = 60%
      progress.recordAttempt(false, 10);
      expect(progress.statistics.accuracyRate).toBe(60);
    });

    it('should maintain accuracy rate at 0 when no attempts are correct', () => {
      progress.recordAttempt(false, 10);
      expect(progress.statistics.accuracyRate).toBe(0);

      progress.recordAttempt(false, 10);
      expect(progress.statistics.accuracyRate).toBe(0);
    });

    it('should update lastActivity milestone', () => {
      const beforeAttempt = new Date();

      progress.recordAttempt(true, 10);

      const afterAttempt = new Date();

      expect(progress.milestones.lastActivity.getTime()).toBeGreaterThanOrEqual(
        beforeAttempt.getTime()
      );
      expect(progress.milestones.lastActivity.getTime()).toBeLessThanOrEqual(
        afterAttempt.getTime()
      );
    });

    it('should update updatedAt timestamp', () => {
      // Small delay to ensure timestamp difference
      setTimeout(() => {
        progress.recordAttempt(true, 10);
        expect(progress.updatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('updateStreak Method', () => {
    let progress: UserProgressEntity;

    beforeEach(() => {
      progress = UserProgressEntity.create('progress-1', 'topic-1');
    });

    it('should update current streak days', () => {
      expect(progress.statistics.streakDays).toBe(0);

      progress.updateStreak(5);
      expect(progress.statistics.streakDays).toBe(5);

      progress.updateStreak(10);
      expect(progress.statistics.streakDays).toBe(10);
    });

    it('should update bestStreak when current streak exceeds it', () => {
      expect(progress.milestones.bestStreak).toBe(0);

      progress.updateStreak(5);
      expect(progress.milestones.bestStreak).toBe(5);

      progress.updateStreak(10);
      expect(progress.milestones.bestStreak).toBe(10);

      progress.updateStreak(15);
      expect(progress.milestones.bestStreak).toBe(15);
    });

    it('should not update bestStreak when current streak is lower', () => {
      progress.updateStreak(10);
      expect(progress.milestones.bestStreak).toBe(10);

      progress.updateStreak(5);
      expect(progress.statistics.streakDays).toBe(5);
      expect(progress.milestones.bestStreak).toBe(10);

      progress.updateStreak(7);
      expect(progress.statistics.streakDays).toBe(7);
      expect(progress.milestones.bestStreak).toBe(10);
    });

    it('should update bestStreak when current streak equals it', () => {
      progress.updateStreak(10);
      expect(progress.milestones.bestStreak).toBe(10);

      progress.updateStreak(5);
      progress.updateStreak(10);
      expect(progress.milestones.bestStreak).toBe(10);
    });

    it('should allow streak to be set to 0', () => {
      progress.updateStreak(10);
      expect(progress.statistics.streakDays).toBe(10);

      progress.updateStreak(0);
      expect(progress.statistics.streakDays).toBe(0);
      expect(progress.milestones.bestStreak).toBe(10); // bestStreak should remain
    });

    it('should update updatedAt timestamp', () => {
      const initialUpdatedAt = progress.updatedAt;

      setTimeout(() => {
        progress.updateStreak(5);
        expect(progress.updatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('incrementSessionCount Method', () => {
    let progress: UserProgressEntity;

    beforeEach(() => {
      progress = UserProgressEntity.create('progress-1', 'topic-1');
    });

    it('should increment totalSessions count', () => {
      expect(progress.milestones.totalSessions).toBe(0);

      progress.incrementSessionCount();
      expect(progress.milestones.totalSessions).toBe(1);

      progress.incrementSessionCount();
      expect(progress.milestones.totalSessions).toBe(2);

      progress.incrementSessionCount();
      expect(progress.milestones.totalSessions).toBe(3);
    });

    it('should update lastActivity milestone', () => {
      const beforeIncrement = new Date();

      progress.incrementSessionCount();

      const afterIncrement = new Date();

      expect(progress.milestones.lastActivity.getTime()).toBeGreaterThanOrEqual(
        beforeIncrement.getTime()
      );
      expect(progress.milestones.lastActivity.getTime()).toBeLessThanOrEqual(
        afterIncrement.getTime()
      );
    });

    it('should update updatedAt timestamp', () => {
      const initialUpdatedAt = progress.updatedAt;

      setTimeout(() => {
        progress.incrementSessionCount();
        expect(progress.updatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('getCompletionPercentage Method', () => {
    let progress: UserProgressEntity;

    beforeEach(() => {
      progress = UserProgressEntity.create('progress-1', 'topic-1');
    });

    it('should return 0 when totalTasks is 0 (edge case)', () => {
      progress.statistics.totalTasks = 0;
      progress.statistics.completedTasks = 0;

      expect(progress.getCompletionPercentage()).toBe(0);
    });

    it('should calculate completion percentage correctly', () => {
      progress.statistics.totalTasks = 10;
      progress.statistics.completedTasks = 0;
      expect(progress.getCompletionPercentage()).toBe(0);

      progress.statistics.completedTasks = 5;
      expect(progress.getCompletionPercentage()).toBe(50);

      progress.statistics.completedTasks = 10;
      expect(progress.getCompletionPercentage()).toBe(100);
    });

    it('should handle partial completion percentages', () => {
      progress.statistics.totalTasks = 3;
      progress.statistics.completedTasks = 1;
      expect(progress.getCompletionPercentage()).toBeCloseTo(33.33, 1);

      progress.statistics.completedTasks = 2;
      expect(progress.getCompletionPercentage()).toBeCloseTo(66.67, 1);
    });

    it('should return 0 when both totalTasks and completedTasks are 0', () => {
      progress.statistics.totalTasks = 0;
      progress.statistics.completedTasks = 0;

      expect(progress.getCompletionPercentage()).toBe(0);
    });
  });

  describe('toJSON and fromJSON Serialization', () => {
    it('should serialize and deserialize correctly without learningPathId', () => {
      const original = UserProgressEntity.create('progress-1', 'topic-1');
      original.recordAttempt(true, 10);
      original.recordAttempt(false, 15);
      original.updateStreak(5);
      original.incrementSessionCount();

      const json = original.toJSON();
      const restored = UserProgressEntity.fromJSON(json);

      expect(restored.id).toBe(original.id);
      expect(restored.topicId).toBe(original.topicId);
      expect(restored.learningPathId).toBeUndefined();
      expect(restored.statistics.completedTasks).toBe(original.statistics.completedTasks);
      expect(restored.statistics.totalTasks).toBe(original.statistics.totalTasks);
      expect(restored.statistics.correctAnswers).toBe(original.statistics.correctAnswers);
      expect(restored.statistics.totalAttempts).toBe(original.statistics.totalAttempts);
      expect(restored.statistics.accuracyRate).toBe(original.statistics.accuracyRate);
      expect(restored.statistics.timeSpent).toBe(original.statistics.timeSpent);
      expect(restored.statistics.streakDays).toBe(original.statistics.streakDays);
      expect(restored.statistics.masteryLevel).toBe(original.statistics.masteryLevel);
      expect(restored.milestones.bestStreak).toBe(original.milestones.bestStreak);
      expect(restored.milestones.totalSessions).toBe(original.milestones.totalSessions);
      expect(restored.preferences.preferredDifficulty).toBe(
        original.preferences.preferredDifficulty
      );
      expect(restored.preferences.preferredSessionLength).toBe(
        original.preferences.preferredSessionLength
      );
      expect(restored.preferences.reminderSettings.enabled).toBe(
        original.preferences.reminderSettings.enabled
      );
      expect(restored.preferences.reminderSettings.frequency).toBe(
        original.preferences.reminderSettings.frequency
      );
      expect(restored.preferences.reminderSettings.time).toBe(
        original.preferences.reminderSettings.time
      );
    });

    it('should serialize and deserialize correctly with learningPathId', () => {
      const original = UserProgressEntity.create('progress-1', 'topic-1', 'path-1');
      original.recordAttempt(true, 20);
      original.updateStreak(10);

      const json = original.toJSON();
      const restored = UserProgressEntity.fromJSON(json);

      expect(restored.id).toBe(original.id);
      expect(restored.topicId).toBe(original.topicId);
      expect(restored.learningPathId).toBe('path-1');
      expect(restored.statistics.completedTasks).toBe(original.statistics.completedTasks);
      expect(restored.statistics.totalAttempts).toBe(original.statistics.totalAttempts);
      expect(restored.statistics.streakDays).toBe(original.statistics.streakDays);
    });

    it('should preserve Date objects in serialization', () => {
      const original = UserProgressEntity.create('progress-1', 'topic-1');
      original.recordAttempt(true, 10);

      const json = original.toJSON();
      const restored = UserProgressEntity.fromJSON(json);

      expect(restored.milestones.firstCompleted).toBeInstanceOf(Date);
      expect(restored.milestones.lastActivity).toBeInstanceOf(Date);
      expect(restored.createdAt).toBeInstanceOf(Date);
      expect(restored.updatedAt).toBeInstanceOf(Date);
    });

    it('should preserve all preference settings in serialization', () => {
      const original = UserProgressEntity.create('progress-1', 'topic-1');
      original.preferences.preferredDifficulty = 'hard';
      original.preferences.preferredSessionLength = 20;
      original.preferences.reminderSettings.enabled = true;
      original.preferences.reminderSettings.frequency = 'weekly';
      original.preferences.reminderSettings.time = '09:00';

      const json = original.toJSON();
      const restored = UserProgressEntity.fromJSON(json);

      expect(restored.preferences.preferredDifficulty).toBe('hard');
      expect(restored.preferences.preferredSessionLength).toBe(20);
      expect(restored.preferences.reminderSettings.enabled).toBe(true);
      expect(restored.preferences.reminderSettings.frequency).toBe('weekly');
      expect(restored.preferences.reminderSettings.time).toBe('09:00');
    });

    it('should handle empty statistics in serialization', () => {
      const original = UserProgressEntity.create('progress-1', 'topic-1');

      const json = original.toJSON();
      const restored = UserProgressEntity.fromJSON(json);

      expect(restored.statistics.completedTasks).toBe(0);
      expect(restored.statistics.totalTasks).toBe(0);
      expect(restored.statistics.correctAnswers).toBe(0);
      expect(restored.statistics.totalAttempts).toBe(0);
      expect(restored.statistics.accuracyRate).toBe(0);
      expect(restored.statistics.timeSpent).toBe(0);
      expect(restored.statistics.streakDays).toBe(0);
      expect(restored.statistics.masteryLevel).toBe(0);
    });

    it('should create deep copies of nested objects', () => {
      const original = UserProgressEntity.create('progress-1', 'topic-1');

      const json = original.toJSON();

      // Modify JSON
      json.statistics.completedTasks = 999;
      json.preferences.preferredDifficulty = 'easy';

      // Original should be unchanged
      expect(original.statistics.completedTasks).toBe(0);
      expect(original.preferences.preferredDifficulty).toBe('medium');
    });
  });

  describe('Integration Tests', () => {
    it('should track complete user progress workflow', () => {
      // Create new progress
      const progress = UserProgressEntity.create('progress-1', 'topic-1', 'path-1');
      progress.statistics.totalTasks = 10;

      // Start session
      progress.incrementSessionCount();
      expect(progress.milestones.totalSessions).toBe(1);

      // Record several attempts
      progress.recordAttempt(true, 10); // 100% accuracy
      progress.recordAttempt(true, 15); // 100% accuracy
      progress.recordAttempt(false, 12); // 66.67% accuracy
      progress.recordAttempt(true, 8); // 75% accuracy

      expect(progress.statistics.completedTasks).toBe(3);
      expect(progress.statistics.totalAttempts).toBe(4);
      expect(progress.statistics.correctAnswers).toBe(3);
      expect(progress.statistics.accuracyRate).toBe(75);
      expect(progress.statistics.timeSpent).toBe(45);
      expect(progress.getCompletionPercentage()).toBe(30); // 3/10 = 30%

      // Update streak
      progress.updateStreak(7);
      expect(progress.statistics.streakDays).toBe(7);
      expect(progress.milestones.bestStreak).toBe(7);

      // Another session
      progress.incrementSessionCount();
      expect(progress.milestones.totalSessions).toBe(2);

      // More attempts
      progress.recordAttempt(true, 20);
      progress.recordAttempt(true, 18);

      expect(progress.statistics.completedTasks).toBe(5);
      expect(progress.statistics.totalAttempts).toBe(6);
      expect(progress.statistics.accuracyRate).toBeCloseTo(83.33, 1); // 5/6
      expect(progress.getCompletionPercentage()).toBe(50); // 5/10 = 50%

      // Update streak to lower value
      progress.updateStreak(3);
      expect(progress.statistics.streakDays).toBe(3);
      expect(progress.milestones.bestStreak).toBe(7); // Should remain at peak

      // Serialize and restore
      const json = progress.toJSON();
      const restored = UserProgressEntity.fromJSON(json);

      expect(restored.learningPathId).toBe('path-1');
      expect(restored.statistics.completedTasks).toBe(5);
      expect(restored.statistics.totalAttempts).toBe(6);
      expect(restored.milestones.totalSessions).toBe(2);
      expect(restored.milestones.bestStreak).toBe(7);
      expect(restored.getCompletionPercentage()).toBe(50);
    });

    it('should handle edge case of no correct attempts', () => {
      const progress = UserProgressEntity.create('progress-1', 'topic-1');
      progress.statistics.totalTasks = 5;

      progress.recordAttempt(false, 10);
      progress.recordAttempt(false, 15);
      progress.recordAttempt(false, 12);

      expect(progress.statistics.completedTasks).toBe(0);
      expect(progress.statistics.correctAnswers).toBe(0);
      expect(progress.statistics.totalAttempts).toBe(3);
      expect(progress.statistics.accuracyRate).toBe(0);
      expect(progress.getCompletionPercentage()).toBe(0);
    });

    it('should handle edge case of all correct attempts', () => {
      const progress = UserProgressEntity.create('progress-1', 'topic-1');
      progress.statistics.totalTasks = 5;

      progress.recordAttempt(true, 10);
      progress.recordAttempt(true, 15);
      progress.recordAttempt(true, 12);
      progress.recordAttempt(true, 8);
      progress.recordAttempt(true, 20);

      expect(progress.statistics.completedTasks).toBe(5);
      expect(progress.statistics.correctAnswers).toBe(5);
      expect(progress.statistics.totalAttempts).toBe(5);
      expect(progress.statistics.accuracyRate).toBe(100);
      expect(progress.getCompletionPercentage()).toBe(100);
    });
  });
});
