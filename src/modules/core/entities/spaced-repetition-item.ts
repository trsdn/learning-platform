import { SpacedRepetitionItem, ValidationError } from '../types/entities';

/**
 * SpacedRepetitionItem entity with SM-2 algorithm implementation
 */
export class SpacedRepetitionItemEntity implements SpacedRepetitionItem {
  id: string;
  taskId: string;
  algorithm: {
    interval: number;
    repetition: number;
    efactor: number;
  };
  schedule: {
    nextReview: Date;
    lastReviewed?: Date;
    totalReviews: number;
    consecutiveCorrect: number;
  };
  performance: {
    averageAccuracy: number;
    averageTime: number;
    difficultyRating: number;
    lastGrade: number;
  };
  metadata: {
    introduced: Date;
    graduated: boolean;
    lapseCount: number;
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(
    data: Omit<SpacedRepetitionItem, 'createdAt' | 'updatedAt'> & {
      createdAt?: Date;
      updatedAt?: Date;
    }
  ) {
    SpacedRepetitionItemEntity.validate(data);

    this.id = data.id;
    this.taskId = data.taskId;
    this.algorithm = { ...data.algorithm };
    this.schedule = { ...data.schedule, nextReview: new Date(data.schedule.nextReview) };
    if (data.schedule.lastReviewed) {
      this.schedule.lastReviewed = new Date(data.schedule.lastReviewed);
    }
    this.performance = { ...data.performance };
    this.metadata = { ...data.metadata, introduced: new Date(data.metadata.introduced) };
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validates spaced repetition data
   */
  static validate(data: Partial<SpacedRepetitionItem>): void {
    // Efactor validation (1.3-2.5)
    if (data.algorithm?.efactor !== undefined) {
      if (data.algorithm.efactor < 1.3 || data.algorithm.efactor > 2.5) {
        throw new ValidationError('Efactor must be between 1.3 and 2.5', {
          field: 'efactor',
          value: data.algorithm.efactor,
        });
      }
    }

    // Interval validation (max 365 days)
    if (data.algorithm?.interval !== undefined) {
      if (data.algorithm.interval < 0 || data.algorithm.interval > 365) {
        throw new ValidationError('Interval must be between 0 and 365 days', {
          field: 'interval',
          value: data.algorithm.interval,
        });
      }
    }

    // Grade validation (0-5)
    if (data.performance?.lastGrade !== undefined) {
      if (data.performance.lastGrade < 0 || data.performance.lastGrade > 5) {
        throw new ValidationError('Grade must be between 0 and 5', {
          field: 'lastGrade',
          value: data.performance.lastGrade,
        });
      }
    }

    // Accuracy validation (0-100)
    if (data.performance?.averageAccuracy !== undefined) {
      if (data.performance.averageAccuracy < 0 || data.performance.averageAccuracy > 100) {
        throw new ValidationError('Average accuracy must be between 0 and 100', {
          field: 'averageAccuracy',
          value: data.performance.averageAccuracy,
        });
      }
    }
  }

  /**
   * Creates a new spaced repetition item with default values
   */
  static createNew(taskId: string, id: string): SpacedRepetitionItemEntity {
    return new SpacedRepetitionItemEntity({
      id,
      taskId,
      algorithm: {
        interval: 1,
        repetition: 0,
        efactor: 2.5,
      },
      schedule: {
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        totalReviews: 0,
        consecutiveCorrect: 0,
      },
      performance: {
        averageAccuracy: 0,
        averageTime: 0,
        difficultyRating: 3,
        lastGrade: 0,
      },
      metadata: {
        introduced: new Date(),
        graduated: false,
        lapseCount: 0,
      },
    });
  }

  /**
   * Updates the item after answering with SM-2 algorithm
   * @param grade - Quality of answer (0-5): 0=complete blackout, 5=perfect response
   * @param timeSpent - Time spent on the question in milliseconds
   */
  recordAnswer(grade: number, timeSpent: number): void {
    if (grade < 0 || grade > 5) {
      throw new ValidationError('Grade must be between 0 and 5', {
        field: 'grade',
        value: grade,
      });
    }

    // Update performance metrics
    this.performance.lastGrade = grade;
    this.updateAverageAccuracy(grade >= 3);
    this.updateAverageTime(timeSpent);

    // Update schedule
    this.schedule.totalReviews++;
    this.schedule.lastReviewed = new Date();

    // Apply SM-2 algorithm
    if (grade < 3) {
      // Failed - reset
      this.algorithm.repetition = 0;
      this.algorithm.interval = 1;
      this.schedule.consecutiveCorrect = 0;
      this.metadata.lapseCount++;
      this.metadata.graduated = false;
    } else {
      // Passed - calculate new interval
      this.schedule.consecutiveCorrect++;

      // Calculate new efactor
      // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
      const efactorChange = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
      this.algorithm.efactor = Math.max(1.3, this.algorithm.efactor + efactorChange);
      this.algorithm.efactor = Math.min(2.5, this.algorithm.efactor);

      // Calculate new interval based on repetition count
      if (this.algorithm.repetition === 0) {
        this.algorithm.interval = 1;
      } else if (this.algorithm.repetition === 1) {
        this.algorithm.interval = 6;
      } else {
        this.algorithm.interval = Math.round(this.algorithm.interval * this.algorithm.efactor);
      }

      // Cap at maximum interval
      this.algorithm.interval = Math.min(365, this.algorithm.interval);

      this.algorithm.repetition++;

      // Mark as graduated after 2+ successful reviews
      if (this.algorithm.repetition >= 2) {
        this.metadata.graduated = true;
      }
    }

    // Calculate next review date
    this.schedule.nextReview = new Date(
      Date.now() + this.algorithm.interval * 24 * 60 * 60 * 1000
    );

    this.updatedAt = new Date();
  }

  /**
   * Updates average accuracy
   */
  private updateAverageAccuracy(correct: boolean): void {
    const totalReviews = this.schedule.totalReviews;
    const currentSum = (this.performance.averageAccuracy / 100) * (totalReviews - 1);
    const newSum = currentSum + (correct ? 1 : 0);
    this.performance.averageAccuracy = (newSum / totalReviews) * 100;
  }

  /**
   * Updates average time
   */
  private updateAverageTime(timeSpent: number): void {
    const totalReviews = this.schedule.totalReviews;
    const currentSum = this.performance.averageTime * (totalReviews - 1);
    const newSum = currentSum + timeSpent;
    this.performance.averageTime = newSum / totalReviews;
  }

  /**
   * Checks if the item is due for review
   */
  isDue(): boolean {
    return this.schedule.nextReview.getTime() <= Date.now();
  }

  /**
   * Gets days until next review
   */
  daysUntilReview(): number {
    const diff = this.schedule.nextReview.getTime() - Date.now();
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  }

  /**
   * Converts to plain object
   */
  toJSON(): SpacedRepetitionItem {
    const result: SpacedRepetitionItem = {
      id: this.id,
      taskId: this.taskId,
      algorithm: { ...this.algorithm },
      schedule: {
        nextReview: this.schedule.nextReview,
        totalReviews: this.schedule.totalReviews,
        consecutiveCorrect: this.schedule.consecutiveCorrect,
      },
      performance: { ...this.performance },
      metadata: {
        introduced: this.metadata.introduced,
        graduated: this.metadata.graduated,
        lapseCount: this.metadata.lapseCount,
      },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if (this.schedule.lastReviewed) {
      result.schedule.lastReviewed = this.schedule.lastReviewed;
    }

    return result;
  }

  /**
   * Creates from plain object
   */
  static fromJSON(data: SpacedRepetitionItem): SpacedRepetitionItemEntity {
    return new SpacedRepetitionItemEntity(data);
  }
}