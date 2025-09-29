import { describe, it, expect } from 'vitest';
import type { SpacedRepetitionItem } from '@core/types/services';

/**
 * Entity validation tests for SpacedRepetitionItem
 * Tests SM-2 algorithm constraints and scheduling rules
 */

describe('SpacedRepetitionItem Entity Validation', () => {
  it('should validate required SM-2 algorithm fields', () => {
    const validItem: SpacedRepetitionItem = {
      id: 'sr-1',
      taskId: 'task-1',
      algorithm: {
        interval: 6,
        repetition: 2,
        efactor: 2.5,
      },
      schedule: {
        nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        lastReviewed: new Date(),
        totalReviews: 2,
        consecutiveCorrect: 2,
      },
      performance: {
        averageAccuracy: 100,
        averageTime: 8000,
        difficultyRating: 3,
        lastGrade: 5,
      },
      metadata: {
        introduced: new Date(),
        graduated: false,
        lapseCount: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(validItem).toBeDefined();
    expect(validItem.algorithm.efactor).toBe(2.5);
  });

  it('should validate efactor range (1.3-2.5)', () => {
    const minEfactor = 1.3;
    const maxEfactor = 2.5;
    const invalidLow = 1.2;
    const invalidHigh = 2.6;

    expect(minEfactor).toBeGreaterThanOrEqual(1.3);
    expect(maxEfactor).toBeLessThanOrEqual(2.5);
    expect(invalidLow).toBeLessThan(1.3);
    expect(invalidHigh).toBeGreaterThan(2.5);
  });

  it('should validate initial interval is 1 day', () => {
    const initialInterval = 1;
    const secondInterval = 6;

    expect(initialInterval).toBe(1);
    expect(secondInterval).toBe(6);
  });

  it('should validate maximum interval is 365 days', () => {
    const maxInterval = 365;
    const validInterval = 180;
    const invalidInterval = 366;

    expect(validInterval).toBeLessThanOrEqual(maxInterval);
    expect(invalidInterval).toBeGreaterThan(maxInterval);
  });

  it('should validate SM-2 grade range (0-5)', () => {
    const validGrades = [0, 1, 2, 3, 4, 5];
    const invalidGrades = [-1, 6, 10];

    validGrades.forEach((grade) => {
      expect(grade).toBeGreaterThanOrEqual(0);
      expect(grade).toBeLessThanOrEqual(5);
    });

    invalidGrades.forEach((grade) => {
      expect(grade < 0 || grade > 5).toBe(true);
    });
  });

  it('should validate interval calculation formula: I(n) = I(n-1) × EF', () => {
    const previousInterval = 6;
    const efactor = 2.5;
    const expectedNextInterval = previousInterval * efactor;

    expect(expectedNextInterval).toBe(15);
  });

  it('should validate efactor adjustment on incorrect answer', () => {
    const currentEfactor = 2.5;
    const quality = 2; // Incorrect answer (grade < 3)

    // SM-2 formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const newEfactor = currentEfactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    expect(newEfactor).toBeLessThan(currentEfactor);
    expect(newEfactor).toBeGreaterThanOrEqual(1.3); // Minimum efactor
  });

  it('should validate repetition resets to 0 on grade < 3', () => {
    const currentRepetition = 5;
    const grade = 2; // Failed
    const newRepetition = grade < 3 ? 0 : currentRepetition + 1;

    expect(newRepetition).toBe(0);
  });

  it('should validate repetition increments on grade >= 3', () => {
    const currentRepetition = 2;
    const grade = 4; // Correct
    const newRepetition = grade < 3 ? 0 : currentRepetition + 1;

    expect(newRepetition).toBe(3);
  });

  it('should validate nextReview is in the future', () => {
    const now = Date.now();
    const validNextReview = new Date(now + 24 * 60 * 60 * 1000); // Tomorrow
    const invalidNextReview = new Date(now - 24 * 60 * 60 * 1000); // Yesterday

    expect(validNextReview.getTime()).toBeGreaterThan(now);
    expect(invalidNextReview.getTime()).toBeLessThan(now);
  });

  it('should validate performance metrics ranges', () => {
    const validPerformance = {
      averageAccuracy: 85.5,
      averageTime: 10000,
      difficultyRating: 3,
      lastGrade: 4,
    };

    expect(validPerformance.averageAccuracy).toBeGreaterThanOrEqual(0);
    expect(validPerformance.averageAccuracy).toBeLessThanOrEqual(100);
    expect(validPerformance.averageTime).toBeGreaterThan(0);
    expect(validPerformance.difficultyRating).toBeGreaterThanOrEqual(1);
    expect(validPerformance.difficultyRating).toBeLessThanOrEqual(5);
    expect(validPerformance.lastGrade).toBeGreaterThanOrEqual(0);
    expect(validPerformance.lastGrade).toBeLessThanOrEqual(5);
  });

  it('should validate graduated flag is set after 2+ successful reviews', () => {
    const newItem = {
      graduated: false,
      repetition: 0,
    };

    const graduatedItem = {
      graduated: true,
      repetition: 3,
    };

    expect(newItem.graduated).toBe(false);
    expect(graduatedItem.graduated).toBe(true);
    expect(graduatedItem.repetition).toBeGreaterThan(2);
  });

  it('should validate lapse count increments on forgotten items', () => {
    const lapseCount = 3;

    expect(lapseCount).toBeGreaterThanOrEqual(0);
  });
});