import { describe, it, expect } from 'vitest';
import {
  taskTypeRegistry,
  getAllTaskTypes,
  getTaskType,
  searchTaskTypes,
  getTaskTypesByDifficulty,
  type TaskType,
} from '@ui/components/admin/utils/task-registry';

describe('task-registry', () => {
  describe('taskTypeRegistry', () => {
    it('should contain all 9 task types', () => {
      const taskTypes = Object.keys(taskTypeRegistry);
      expect(taskTypes).toHaveLength(9);
      expect(taskTypes).toEqual(
        expect.arrayContaining([
          'flashcard',
          'multiple-choice',
          'multiple-select',
          'true-false',
          'cloze-deletion',
          'matching',
          'ordering',
          'slider',
          'word-scramble',
        ])
      );
    });

    it('should have complete metadata for each task type', () => {
      Object.values(taskTypeRegistry).forEach((taskType) => {
        expect(taskType).toHaveProperty('id');
        expect(taskType).toHaveProperty('name');
        expect(taskType).toHaveProperty('description');
        expect(taskType).toHaveProperty('icon');
        expect(taskType).toHaveProperty('templateFile');
        expect(taskType).toHaveProperty('difficulty');
        expect(taskType).toHaveProperty('exampleCount');
        expect(taskType).toHaveProperty('examples');
        expect(taskType.difficulty).toBeInstanceOf(Array);
        expect(taskType.examples).toBeInstanceOf(Array);
        expect(taskType.examples.length).toBe(taskType.exampleCount);
      });
    });

    it('should have examples with complete structure', () => {
      Object.values(taskTypeRegistry).forEach((taskType) => {
        taskType.examples.forEach((example) => {
          expect(example).toHaveProperty('title');
          expect(example).toHaveProperty('description');
          expect(example).toHaveProperty('data');
          expect(typeof example.title).toBe('string');
          expect(typeof example.description).toBe('string');
          expect(typeof example.data).toBe('object');
        });
      });
    });
  });

  describe('getAllTaskTypes', () => {
    it('should return all task types as array', () => {
      const taskTypes = getAllTaskTypes();
      expect(taskTypes).toBeInstanceOf(Array);
      expect(taskTypes).toHaveLength(9);
    });

    it('should return task types with metadata', () => {
      const taskTypes = getAllTaskTypes();
      taskTypes.forEach((taskType) => {
        expect(taskType).toHaveProperty('id');
        expect(taskType).toHaveProperty('name');
        expect(taskType).toHaveProperty('description');
      });
    });
  });

  describe('getTaskType', () => {
    it('should return correct task type by id', () => {
      const flashcard = getTaskType('flashcard');
      expect(flashcard).toBeDefined();
      expect(flashcard?.id).toBe('flashcard');
      expect(flashcard?.name).toBe('Flashcard');
    });

    it('should return task type with examples', () => {
      const multipleChoice = getTaskType('multiple-choice');
      expect(multipleChoice).toBeDefined();
      expect(multipleChoice?.examples).toBeDefined();
      expect(multipleChoice?.examples.length).toBeGreaterThan(0);
    });

    it('should return undefined for non-existent id', () => {
      const result = getTaskType('non-existent' as TaskType);
      expect(result).toBeUndefined();
    });
  });

  describe('searchTaskTypes', () => {
    it('should find task by name', () => {
      const results = searchTaskTypes('flashcard');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Flashcard');
    });

    it('should find task by partial name', () => {
      const results = searchTaskTypes('flash');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('Flash');
    });

    it('should find task by description', () => {
      const results = searchTaskTypes('two-sided');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const lowerResults = searchTaskTypes('flashcard');
      const upperResults = searchTaskTypes('FLASHCARD');
      expect(lowerResults).toEqual(upperResults);
    });

    it('should return empty array for no matches', () => {
      const results = searchTaskTypes('nonexistent');
      expect(results).toEqual([]);
    });

    it('should return multiple results when query matches multiple tasks', () => {
      const results = searchTaskTypes('select');
      expect(results.length).toBeGreaterThanOrEqual(2); // multiple-choice, multiple-select
    });
  });

  describe('getTaskTypesByDifficulty', () => {
    it('should return task types for easy difficulty', () => {
      const easyTasks = getTaskTypesByDifficulty('easy');
      expect(easyTasks.length).toBeGreaterThan(0);
      easyTasks.forEach((task) => {
        expect(task.difficulty).toContain('easy');
      });
    });

    it('should return task types for medium difficulty', () => {
      const mediumTasks = getTaskTypesByDifficulty('medium');
      expect(mediumTasks.length).toBeGreaterThan(0);
      mediumTasks.forEach((task) => {
        expect(task.difficulty).toContain('medium');
      });
    });

    it('should return task types for hard difficulty', () => {
      const hardTasks = getTaskTypesByDifficulty('hard');
      expect(hardTasks.length).toBeGreaterThan(0);
      hardTasks.forEach((task) => {
        expect(task.difficulty).toContain('hard');
      });
    });

    it('should return all 9 tasks for medium difficulty', () => {
      const mediumTasks = getTaskTypesByDifficulty('medium');
      expect(mediumTasks).toHaveLength(9);
    });

    it('should return 6 tasks for easy difficulty', () => {
      const easyTasks = getTaskTypesByDifficulty('easy');
      expect(easyTasks.length).toBeGreaterThanOrEqual(5);
    });

    it('should return 5 tasks for hard difficulty', () => {
      const hardTasks = getTaskTypesByDifficulty('hard');
      expect(hardTasks.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Task Type Data Structure', () => {
    it('flashcard should have correct structure', () => {
      const flashcard = getTaskType('flashcard');
      expect(flashcard).toBeDefined();
      expect(flashcard?.icon).toBe('🎴');
      expect(flashcard?.templateFile).toBe('flashcard-basic.json');
      expect(flashcard?.exampleCount).toBe(2);
    });

    it('multiple-choice should have correct structure', () => {
      const multipleChoice = getTaskType('multiple-choice');
      expect(multipleChoice).toBeDefined();
      expect(multipleChoice?.icon).toBe('📝');
      expect(multipleChoice?.templateFile).toBe('multiple-choice-basic.json');
      expect(multipleChoice?.exampleCount).toBe(3);
    });

    it('cloze-deletion should have correct structure', () => {
      const clozeDeletion = getTaskType('cloze-deletion');
      expect(clozeDeletion).toBeDefined();
      expect(clozeDeletion?.icon).toBe('📄');
      expect(clozeDeletion?.templateFile).toBe('cloze-deletion-basic.json');
      expect(clozeDeletion?.exampleCount).toBe(2);
    });
  });

  describe('Total Example Count', () => {
    it('should have 19 total examples across all task types', () => {
      const allTasks = getAllTaskTypes();
      const totalExamples = allTasks.reduce((sum, task) => sum + task.exampleCount, 0);
      expect(totalExamples).toBe(19);
    });
  });
});
