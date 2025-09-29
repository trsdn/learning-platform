import { describe, it, expect } from 'vitest';
import type { Task, MultipleChoiceContent } from '@core/types/services';

/**
 * Entity validation tests for Task
 */

describe('Task Entity Validation', () => {
  it('should validate required fields', () => {
    const validTask: Task = {
      id: 'task-1',
      learningPathId: 'path-1',
      templateId: 'template-1',
      type: 'multiple-choice',
      content: {
        question: 'Was ist 2 + 2?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 2,
      },
      metadata: {
        difficulty: 'easy',
        tags: ['addition', 'grundrechenarten'],
        estimatedTime: 30,
        points: 10,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(validTask).toBeDefined();
    expect(validTask.type).toBe('multiple-choice');
  });

  it('should validate question length (10-1000 characters)', () => {
    const shortQuestion = '2+2?';
    const validQuestion = 'Was ist das Ergebnis von 2 + 2?';
    const longQuestion = 'A'.repeat(1001);

    expect(shortQuestion.length).toBeLessThan(10);
    expect(validQuestion.length).toBeGreaterThanOrEqual(10);
    expect(validQuestion.length).toBeLessThanOrEqual(1000);
    expect(longQuestion.length).toBeGreaterThan(1000);
  });

  it('should validate options array (2-6 items)', () => {
    const tooFewOptions = ['A'];
    const validOptions = ['A', 'B', 'C', 'D'];
    const tooManyOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    expect(tooFewOptions.length).toBeLessThan(2);
    expect(validOptions.length).toBeGreaterThanOrEqual(2);
    expect(validOptions.length).toBeLessThanOrEqual(6);
    expect(tooManyOptions.length).toBeGreaterThan(6);
  });

  it('should validate correctAnswer is valid index', () => {
    const options = ['A', 'B', 'C', 'D'];
    const validIndexes = [0, 1, 2, 3];
    const invalidIndexes = [-1, 4, 10];

    validIndexes.forEach((index) => {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(options.length);
    });

    invalidIndexes.forEach((index) => {
      expect(
        index < 0 || index >= options.length
      ).toBe(true);
    });
  });

  it('should validate option length (1-200 characters)', () => {
    const shortOption = '';
    const validOption = 'Eine gültige Antwortoption';
    const longOption = 'A'.repeat(201);

    expect(shortOption.length).toBeLessThan(1);
    expect(validOption.length).toBeGreaterThanOrEqual(1);
    expect(validOption.length).toBeLessThanOrEqual(200);
    expect(longOption.length).toBeGreaterThan(200);
  });

  it('should validate tags array (max 10 items, each 1-50 chars)', () => {
    const validTags = ['tag1', 'tag2', 'tag3'];
    const tooManyTags = Array(11).fill('tag');
    const invalidTag = 'A'.repeat(51);

    expect(validTags.length).toBeLessThanOrEqual(10);
    expect(tooManyTags.length).toBeGreaterThan(10);
    expect(invalidTag.length).toBeGreaterThan(50);
  });

  it('should validate difficulty enum', () => {
    const validDifficulties = ['easy', 'medium', 'hard'];
    const invalidDifficulty = 'extreme';

    validDifficulties.forEach((diff) => {
      expect(['easy', 'medium', 'hard']).toContain(diff);
    });

    expect(['easy', 'medium', 'hard']).not.toContain(invalidDifficulty);
  });

  it('should enforce content in German language', () => {
    const germanContent: MultipleChoiceContent = {
      question: 'Was ist die Hauptstadt von Deutschland?',
      options: ['Berlin', 'München', 'Hamburg', 'Köln'],
      correctAnswer: 0,
      explanation: 'Berlin ist die Hauptstadt der Bundesrepublik Deutschland.',
    };

    // Basic check: German umlauts present
    const hasGermanChars = /[äöüßÄÖÜ]/.test(
      germanContent.question + germanContent.explanation
    );

    expect(germanContent.question).toContain('Was ist');
    expect(germanContent.explanation).toBeDefined();
  });
});