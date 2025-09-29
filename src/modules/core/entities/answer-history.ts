import type { AnswerHistory } from '@core/types/services';
import { ValidationError } from '../types/entities';

/**
 * AnswerHistory entity for tracking user responses
 */
export class AnswerHistoryEntity implements AnswerHistory {
  id: string;
  taskId: string;
  sessionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
  confidence: number;
  metadata: {
    attemptNumber: number;
    hintsUsed: number;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    browserInfo: string;
  };
  timestamp: Date;

  constructor(data: AnswerHistory) {
    AnswerHistoryEntity.validate(data);

    this.id = data.id;
    this.taskId = data.taskId;
    this.sessionId = data.sessionId;
    this.userAnswer = data.userAnswer;
    this.isCorrect = data.isCorrect;
    this.timeSpent = data.timeSpent;
    this.confidence = data.confidence;
    this.metadata = { ...data.metadata };
    this.timestamp = new Date(data.timestamp);
  }

  /**
   * Validates answer history data
   */
  static validate(data: Partial<AnswerHistory>): void {
    // Time spent validation (0-3600 seconds, max 1 hour per task)
    if (data.timeSpent !== undefined) {
      if (data.timeSpent < 0 || data.timeSpent > 3600) {
        throw new ValidationError('Time spent must be between 0 and 3600 seconds', {
          field: 'timeSpent',
          value: data.timeSpent,
        });
      }
    }

    // Confidence validation (1-5 scale)
    if (data.confidence !== undefined) {
      if (data.confidence < 1 || data.confidence > 5) {
        throw new ValidationError('Confidence must be between 1 and 5', {
          field: 'confidence',
          value: data.confidence,
        });
      }
    }
  }

  /**
   * Creates a new answer history record
   */
  static create(
    id: string,
    taskId: string,
    sessionId: string,
    userAnswer: string | string[],
    isCorrect: boolean,
    timeSpent: number,
    confidence: number,
    metadata: AnswerHistory['metadata']
  ): AnswerHistoryEntity {
    return new AnswerHistoryEntity({
      id,
      taskId,
      sessionId,
      userAnswer,
      isCorrect,
      timeSpent,
      confidence,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Gets the time spent in minutes
   */
  getTimeSpentMinutes(): number {
    return Math.round((this.timeSpent / 60) * 10) / 10;
  }

  /**
   * Checks if the answer was quick (less than 10 seconds)
   */
  isQuickAnswer(): boolean {
    return this.timeSpent < 10;
  }

  /**
   * Checks if the answer took a long time (more than 2 minutes)
   */
  isSlowAnswer(): boolean {
    return this.timeSpent > 120;
  }

  /**
   * Gets performance score (0-100) based on correctness, time, and confidence
   */
  getPerformanceScore(): number {
    let score = 0;

    // Correctness (50 points)
    if (this.isCorrect) {
      score += 50;
    }

    // Time efficiency (25 points)
    // Optimal time: 30-90 seconds
    if (this.timeSpent >= 30 && this.timeSpent <= 90) {
      score += 25;
    } else if (this.timeSpent < 30) {
      // Too quick might indicate guessing
      score += 15;
    } else if (this.timeSpent <= 180) {
      // Longer but reasonable
      score += 20;
    } else {
      // Too slow
      score += 10;
    }

    // Confidence (25 points) - scaled from 1-5 to 0-25
    score += ((this.confidence - 1) / 4) * 25;

    return Math.round(score);
  }

  /**
   * Converts to plain object
   */
  toJSON(): AnswerHistory {
    return {
      id: this.id,
      taskId: this.taskId,
      sessionId: this.sessionId,
      userAnswer: this.userAnswer,
      isCorrect: this.isCorrect,
      timeSpent: this.timeSpent,
      confidence: this.confidence,
      metadata: { ...this.metadata },
      timestamp: this.timestamp,
    };
  }

  /**
   * Creates from plain object
   */
  static fromJSON(data: AnswerHistory): AnswerHistoryEntity {
    return new AnswerHistoryEntity(data);
  }
}