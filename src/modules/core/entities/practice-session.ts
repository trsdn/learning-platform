import { PracticeSession, ValidationError } from '../types/entities';

/**
 * PracticeSession entity for managing learning sessions
 */
export class PracticeSessionEntity implements PracticeSession {
  id: string;
  configuration: {
    topicId: string;
    learningPathIds: string[];
    targetCount: number;
    includeReview: boolean;
    difficultyFilter?: 'easy' | 'medium' | 'hard';
  };
  execution: {
    taskIds: string[];
    completedCount: number;
    correctCount: number;
    status: 'planned' | 'active' | 'paused' | 'completed' | 'abandoned';
    startedAt?: Date;
    completedAt?: Date;
    totalTimeSpent: number;
  };
  results: {
    accuracy: number;
    averageTime: number;
    difficultyDistribution: Record<string, number>;
    improvementAreas: string[];
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(
    data: Omit<PracticeSession, 'createdAt' | 'updatedAt'> & {
      createdAt?: Date;
      updatedAt?: Date;
    }
  ) {
    PracticeSessionEntity.validate(data);

    this.id = data.id;
    this.configuration = { ...data.configuration, learningPathIds: [...data.configuration.learningPathIds] };
    this.execution = {
      taskIds: [...data.execution.taskIds],
      completedCount: data.execution.completedCount,
      correctCount: data.execution.correctCount,
      status: data.execution.status,
      totalTimeSpent: data.execution.totalTimeSpent,
    };
    if (data.execution.startedAt) {
      this.execution.startedAt = new Date(data.execution.startedAt);
    }
    if (data.execution.completedAt) {
      this.execution.completedAt = new Date(data.execution.completedAt);
    }
    this.results = {
      ...data.results,
      difficultyDistribution: { ...data.results.difficultyDistribution },
      improvementAreas: [...data.results.improvementAreas],
    };
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validates practice session data
   */
  static validate(data: Partial<PracticeSession>): void {
    // Target count validation (5-50)
    if (data.configuration?.targetCount !== undefined) {
      if (data.configuration.targetCount < 5 || data.configuration.targetCount > 50) {
        throw new ValidationError('Target count must be between 5 and 50', {
          field: 'targetCount',
          value: data.configuration.targetCount,
        });
      }
    }

    // Status validation
    if (data.execution?.status !== undefined) {
      const validStatuses = ['planned', 'active', 'paused', 'completed', 'abandoned'];
      if (!validStatuses.includes(data.execution.status)) {
        throw new ValidationError('Invalid session status', {
          field: 'status',
          value: data.execution.status,
          validValues: validStatuses,
        });
      }
    }
  }

  /**
   * Creates a new session
   */
  static create(
    id: string,
    topicId: string,
    learningPathIds: string[],
    taskIds: string[],
    config: {
      targetCount: number;
      includeReview: boolean;
      difficultyFilter?: 'easy' | 'medium' | 'hard';
    }
  ): PracticeSessionEntity {
    const configuration: PracticeSession['configuration'] = {
      topicId,
      learningPathIds,
      targetCount: config.targetCount,
      includeReview: config.includeReview,
    };
    if (config.difficultyFilter) {
      configuration.difficultyFilter = config.difficultyFilter;
    }

    return new PracticeSessionEntity({
      id,
      configuration,
      execution: {
        taskIds,
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
    });
  }

  /**
   * Starts the session
   */
  start(): void {
    if (this.execution.status !== 'planned' && this.execution.status !== 'paused') {
      throw new Error('Can only start planned or paused sessions');
    }

    this.execution.status = 'active';
    if (!this.execution.startedAt) {
      this.execution.startedAt = new Date();
    }
    this.updatedAt = new Date();
  }

  /**
   * Pauses the session
   */
  pause(): void {
    if (this.execution.status !== 'active') {
      throw new Error('Can only pause active sessions');
    }

    this.execution.status = 'paused';
    this.updatedAt = new Date();
  }

  /**
   * Resumes the session
   */
  resume(): void {
    if (this.execution.status !== 'paused') {
      throw new Error('Can only resume paused sessions');
    }

    this.execution.status = 'active';
    this.updatedAt = new Date();
  }

  /**
   * Records an answer
   */
  recordAnswer(isCorrect: boolean, timeSpent: number): void {
    if (this.execution.status !== 'active') {
      throw new Error('Session must be active to record answers');
    }

    this.execution.completedCount++;
    if (isCorrect) {
      this.execution.correctCount++;
    }
    this.execution.totalTimeSpent += timeSpent;

    // Recalculate results
    this.updateResults();
    this.updatedAt = new Date();
  }

  /**
   * Completes the session
   */
  complete(): void {
    if (this.execution.status === 'completed' || this.execution.status === 'abandoned') {
      throw new Error('Session already finalized');
    }

    this.execution.status = 'completed';
    this.execution.completedAt = new Date();
    this.updateResults();
    this.updatedAt = new Date();
  }

  /**
   * Abandons the session
   */
  abandon(): void {
    if (this.execution.status === 'completed' || this.execution.status === 'abandoned') {
      throw new Error('Session already finalized');
    }

    this.execution.status = 'abandoned';
    this.updatedAt = new Date();
  }

  /**
   * Updates calculated results
   */
  private updateResults(): void {
    // Calculate accuracy
    if (this.execution.completedCount > 0) {
      this.results.accuracy = (this.execution.correctCount / this.execution.completedCount) * 100;
    }

    // Calculate average time
    if (this.execution.completedCount > 0) {
      this.results.averageTime = this.execution.totalTimeSpent / this.execution.completedCount;
    }
  }

  /**
   * Gets progress percentage
   */
  getProgress(): number {
    return (this.execution.completedCount / this.configuration.targetCount) * 100;
  }

  /**
   * Checks if session is complete
   */
  isComplete(): boolean {
    return this.execution.completedCount >= this.configuration.targetCount;
  }

  /**
   * Gets remaining tasks count
   */
  getRemainingCount(): number {
    return Math.max(0, this.configuration.targetCount - this.execution.completedCount);
  }

  /**
   * Converts to plain object
   */
  toJSON(): PracticeSession {
    const result: PracticeSession = {
      id: this.id,
      configuration: {
        ...this.configuration,
        learningPathIds: [...this.configuration.learningPathIds],
      },
      execution: {
        ...this.execution,
        taskIds: [...this.execution.taskIds],
      },
      results: {
        ...this.results,
        difficultyDistribution: { ...this.results.difficultyDistribution },
        improvementAreas: [...this.results.improvementAreas],
      },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if (this.configuration.difficultyFilter) {
      result.configuration.difficultyFilter = this.configuration.difficultyFilter;
    }
    if (this.execution.startedAt) {
      result.execution.startedAt = this.execution.startedAt;
    }
    if (this.execution.completedAt) {
      result.execution.completedAt = this.execution.completedAt;
    }

    return result;
  }

  /**
   * Creates from plain object
   */
  static fromJSON(data: PracticeSession): PracticeSessionEntity {
    return new PracticeSessionEntity(data);
  }
}