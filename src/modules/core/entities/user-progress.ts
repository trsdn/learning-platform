import type { UserProgress } from '@core/types/services';
import { ValidationError } from '../types/entities';

/**
 * UserProgress entity for tracking learning progress and statistics
 */
export class UserProgressEntity implements UserProgress {
  id: string;
  topicId: string;
  learningPathId?: string;
  statistics: {
    completedTasks: number;
    totalTasks: number;
    correctAnswers: number;
    totalAttempts: number;
    accuracyRate: number;
    timeSpent: number;
    streakDays: number;
    masteryLevel: number;
  };
  milestones: {
    firstCompleted: Date;
    lastActivity: Date;
    bestStreak: number;
    totalSessions: number;
  };
  preferences: {
    preferredDifficulty: 'easy' | 'medium' | 'hard';
    preferredSessionLength: number;
    reminderSettings: {
      enabled: boolean;
      frequency: 'daily' | 'weekly';
      time: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(data: UserProgress) {
    UserProgressEntity.validate(data);

    this.id = data.id;
    this.topicId = data.topicId;
    if (data.learningPathId) {
      this.learningPathId = data.learningPathId;
    }
    this.statistics = { ...data.statistics };
    this.milestones = {
      firstCompleted: new Date(data.milestones.firstCompleted),
      lastActivity: new Date(data.milestones.lastActivity),
      bestStreak: data.milestones.bestStreak,
      totalSessions: data.milestones.totalSessions,
    };
    this.preferences = {
      preferredDifficulty: data.preferences.preferredDifficulty,
      preferredSessionLength: data.preferences.preferredSessionLength,
      reminderSettings: { ...data.preferences.reminderSettings },
    };
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
  }

  /**
   * Validates user progress data
   */
  static validate(data: Partial<UserProgress>): void {
    // Statistics validation
    if (data.statistics) {
      const fields = [
        'totalTasks',
        'completedTasks',
        'correctAnswers',
        'totalAttempts',
        'timeSpent',
        'streakDays',
      ];
      for (const field of fields) {
        const value = data.statistics[field as keyof typeof data.statistics];
        if (value !== undefined && typeof value === 'number' && value < 0) {
          throw new ValidationError(`${field} must be non-negative`, {
            field,
            value,
          });
        }
      }

      // Accuracy and mastery must be 0-100
      if (
        data.statistics.accuracyRate !== undefined &&
        (data.statistics.accuracyRate < 0 || data.statistics.accuracyRate > 100)
      ) {
        throw new ValidationError('Accuracy rate must be between 0 and 100', {
          field: 'accuracyRate',
          value: data.statistics.accuracyRate,
        });
      }

      if (
        data.statistics.masteryLevel !== undefined &&
        (data.statistics.masteryLevel < 0 || data.statistics.masteryLevel > 100)
      ) {
        throw new ValidationError('Mastery level must be between 0 and 100', {
          field: 'masteryLevel',
          value: data.statistics.masteryLevel,
        });
      }
    }
  }

  /**
   * Creates a new user progress record
   */
  static create(id: string, topicId: string, learningPathId?: string): UserProgressEntity {
    const data: UserProgress = {
      id,
      topicId,
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
    if (learningPathId) {
      data.learningPathId = learningPathId;
    }
    return new UserProgressEntity(data);
  }

  /**
   * Records a task attempt
   */
  recordAttempt(isCorrect: boolean, timeSpent: number): void {
    this.statistics.totalAttempts++;
    if (isCorrect) {
      this.statistics.correctAnswers++;
      if (this.statistics.completedTasks === 0) {
        this.milestones.firstCompleted = new Date();
      }
      this.statistics.completedTasks++;
    }

    this.statistics.timeSpent += timeSpent;
    this.recalculateAccuracy();
    this.milestones.lastActivity = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Recalculates accuracy rate
   */
  private recalculateAccuracy(): void {
    if (this.statistics.totalAttempts > 0) {
      this.statistics.accuracyRate =
        (this.statistics.correctAnswers / this.statistics.totalAttempts) * 100;
    }
  }

  /**
   * Updates streak
   */
  updateStreak(days: number): void {
    this.statistics.streakDays = days;
    if (days > this.milestones.bestStreak) {
      this.milestones.bestStreak = days;
    }
    this.updatedAt = new Date();
  }

  /**
   * Increments session count
   */
  incrementSessionCount(): void {
    this.milestones.totalSessions++;
    this.milestones.lastActivity = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Gets completion percentage
   */
  getCompletionPercentage(): number {
    if (this.statistics.totalTasks === 0) return 0;
    return (this.statistics.completedTasks / this.statistics.totalTasks) * 100;
  }

  /**
   * Converts to plain object
   */
  toJSON(): UserProgress {
    const result: UserProgress = {
      id: this.id,
      topicId: this.topicId,
      statistics: { ...this.statistics },
      milestones: {
        firstCompleted: this.milestones.firstCompleted,
        lastActivity: this.milestones.lastActivity,
        bestStreak: this.milestones.bestStreak,
        totalSessions: this.milestones.totalSessions,
      },
      preferences: {
        preferredDifficulty: this.preferences.preferredDifficulty,
        preferredSessionLength: this.preferences.preferredSessionLength,
        reminderSettings: { ...this.preferences.reminderSettings },
      },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
    if (this.learningPathId) {
      result.learningPathId = this.learningPathId;
    }
    return result;
  }

  /**
   * Creates from plain object
   */
  static fromJSON(data: UserProgress): UserProgressEntity {
    return new UserProgressEntity(data);
  }
}