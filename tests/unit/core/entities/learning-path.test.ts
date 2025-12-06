/**
 * Tests for LearningPathEntity
 *
 * Tests the core learning path logic including:
 * - Constructor and validation
 * - Static validate method (title, description, difficulty, taskIds, estimatedTime, requirements)
 * - Static create factory method
 * - update method with partial updates and validation
 * - addTask and removeTask methods with duplicate handling
 * - reorderTasks method with validation
 * - activate and deactivate methods
 * - toJSON and fromJSON serialization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LearningPathEntity } from '../../../../src/modules/core/entities/learning-path';
import { ValidationError } from '../../../../src/modules/core/types/entities';

describe('LearningPathEntity', () => {
  describe('Constructor and Validation', () => {
    it('should create a learning path with valid data', () => {
      const data = {
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Introduction to Math',
        description: 'Learn the basics of mathematics',
        difficulty: 'easy' as const,
        taskIds: ['task-1', 'task-2'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 2,
        },
      };

      const path = new LearningPathEntity(data);

      expect(path.id).toBe(data.id);
      expect(path.topicId).toBe(data.topicId);
      expect(path.title).toBe(data.title);
      expect(path.description).toBe(data.description);
      expect(path.difficulty).toBe(data.difficulty);
      expect(path.taskIds).toEqual(data.taskIds);
      expect(path.estimatedTime).toBe(data.estimatedTime);
      expect(path.isActive).toBe(data.isActive);
      expect(path.requirements.minimumAccuracy).toBe(data.requirements.minimumAccuracy);
      expect(path.requirements.requiredTasks).toBe(data.requirements.requiredTasks);
      expect(path.createdAt).toBeInstanceOf(Date);
      expect(path.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a learning path with custom timestamps', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Introduction to Math',
        description: 'Learn the basics of mathematics',
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
        createdAt,
        updatedAt,
      });

      expect(path.createdAt).toBe(createdAt);
      expect(path.updatedAt).toBe(updatedAt);
    });

    it('should create a copy of taskIds array to prevent mutations', () => {
      const taskIds = ['task-1', 'task-2'];
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Test Description',
        difficulty: 'easy',
        taskIds,
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      taskIds.push('task-3');
      expect(path.taskIds).toEqual(['task-1', 'task-2']);
    });

    it('should throw validation error for invalid data', () => {
      expect(() =>
        new LearningPathEntity({
          id: 'path-1',
          topicId: 'topic-1',
          title: '', // Invalid: empty title
          description: 'Test Description',
          difficulty: 'easy',
          taskIds: ['task-1'],
          estimatedTime: 30,
          isActive: true,
          requirements: {
            minimumAccuracy: 80,
            requiredTasks: 1,
          },
        })
      ).toThrow(ValidationError);
    });
  });

  describe('Static validate method', () => {
    describe('title validation', () => {
      it('should accept valid titles (1-200 chars)', () => {
        expect(() =>
          LearningPathEntity.validate({ title: 'A' })
        ).not.toThrow();

        expect(() =>
          LearningPathEntity.validate({ title: 'Valid Title' })
        ).not.toThrow();

        expect(() =>
          LearningPathEntity.validate({ title: 'x'.repeat(200) })
        ).not.toThrow();
      });

      it('should reject empty title', () => {
        expect(() =>
          LearningPathEntity.validate({ title: '' })
        ).toThrow('Title must be between 1 and 200 characters');
      });

      it('should reject title longer than 200 characters', () => {
        expect(() =>
          LearningPathEntity.validate({ title: 'x'.repeat(201) })
        ).toThrow('Title must be between 1 and 200 characters');
      });
    });

    describe('description validation', () => {
      it('should accept valid descriptions (1-1000 chars)', () => {
        expect(() =>
          LearningPathEntity.validate({ description: 'A' })
        ).not.toThrow();

        expect(() =>
          LearningPathEntity.validate({ description: 'Valid description with more content' })
        ).not.toThrow();

        expect(() =>
          LearningPathEntity.validate({ description: 'x'.repeat(1000) })
        ).not.toThrow();
      });

      it('should reject empty description', () => {
        expect(() =>
          LearningPathEntity.validate({ description: '' })
        ).toThrow('Description must be between 1 and 1000 characters');
      });

      it('should reject description longer than 1000 characters', () => {
        expect(() =>
          LearningPathEntity.validate({ description: 'x'.repeat(1001) })
        ).toThrow('Description must be between 1 and 1000 characters');
      });
    });

    describe('difficulty validation', () => {
      it('should accept valid difficulty levels', () => {
        expect(() =>
          LearningPathEntity.validate({ difficulty: 'easy' })
        ).not.toThrow();

        expect(() =>
          LearningPathEntity.validate({ difficulty: 'medium' })
        ).not.toThrow();

        expect(() =>
          LearningPathEntity.validate({ difficulty: 'hard' })
        ).not.toThrow();
      });

      it('should reject invalid difficulty level', () => {
        expect(() =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          LearningPathEntity.validate({ difficulty: 'extreme' as any })
        ).toThrow('Invalid difficulty level');
      });
    });

    describe('taskIds validation', () => {
      it('should accept taskIds with at least 1 task', () => {
        expect(() =>
          LearningPathEntity.validate({ taskIds: ['task-1'] })
        ).not.toThrow();

        expect(() =>
          LearningPathEntity.validate({ taskIds: ['task-1', 'task-2', 'task-3'] })
        ).not.toThrow();
      });

      it('should reject empty taskIds array', () => {
        expect(() =>
          LearningPathEntity.validate({ taskIds: [] })
        ).toThrow('Learning path must have at least one task');
      });
    });

    describe('estimatedTime validation', () => {
      it('should accept valid estimated time (1-300 minutes)', () => {
        expect(() =>
          LearningPathEntity.validate({ estimatedTime: 1 })
        ).not.toThrow();

        expect(() =>
          LearningPathEntity.validate({ estimatedTime: 150 })
        ).not.toThrow();

        expect(() =>
          LearningPathEntity.validate({ estimatedTime: 300 })
        ).not.toThrow();
      });

      it('should reject estimated time less than 1', () => {
        expect(() =>
          LearningPathEntity.validate({ estimatedTime: 0 })
        ).toThrow('Estimated time must be between 1 and 300 minutes');
      });

      it('should reject estimated time greater than 300', () => {
        expect(() =>
          LearningPathEntity.validate({ estimatedTime: 301 })
        ).toThrow('Estimated time must be between 1 and 300 minutes');
      });
    });

    describe('requirements validation', () => {
      it('should accept valid minimumAccuracy (0-100)', () => {
        expect(() =>
          LearningPathEntity.validate({
            requirements: { minimumAccuracy: 0, requiredTasks: 1 },
          })
        ).not.toThrow();

        expect(() =>
          LearningPathEntity.validate({
            requirements: { minimumAccuracy: 50, requiredTasks: 1 },
          })
        ).not.toThrow();

        expect(() =>
          LearningPathEntity.validate({
            requirements: { minimumAccuracy: 100, requiredTasks: 1 },
          })
        ).not.toThrow();
      });

      it('should reject minimumAccuracy below 0', () => {
        expect(() =>
          LearningPathEntity.validate({
            requirements: { minimumAccuracy: -1, requiredTasks: 1 },
          })
        ).toThrow('Minimum accuracy must be between 0 and 100');
      });

      it('should reject minimumAccuracy above 100', () => {
        expect(() =>
          LearningPathEntity.validate({
            requirements: { minimumAccuracy: 101, requiredTasks: 1 },
          })
        ).toThrow('Minimum accuracy must be between 0 and 100');
      });

      it('should accept valid requiredTasks (at least 1)', () => {
        expect(() =>
          LearningPathEntity.validate({
            requirements: { minimumAccuracy: 80, requiredTasks: 1 },
          })
        ).not.toThrow();

        expect(() =>
          LearningPathEntity.validate({
            requirements: { minimumAccuracy: 80, requiredTasks: 10 },
          })
        ).not.toThrow();
      });

      it('should reject requiredTasks less than 1', () => {
        expect(() =>
          LearningPathEntity.validate({
            requirements: { minimumAccuracy: 80, requiredTasks: 0 },
          })
        ).toThrow('Required tasks must be at least 1');
      });
    });

    it('should allow partial validation (undefined fields are skipped)', () => {
      expect(() =>
        LearningPathEntity.validate({ title: 'Valid Title' })
      ).not.toThrow();

      expect(() =>
        LearningPathEntity.validate({ estimatedTime: 60 })
      ).not.toThrow();

      expect(() =>
        LearningPathEntity.validate({})
      ).not.toThrow();
    });
  });

  describe('Static create factory method', () => {
    it('should throw validation error when creating with empty taskIds', () => {
      // The create method passes empty taskIds array which violates validation
      expect(() =>
        LearningPathEntity.create(
          'path-1',
          'topic-1',
          'Introduction to Math',
          'Learn the basics of mathematics',
          'easy',
          30,
          { minimumAccuracy: 80, requiredTasks: 2 }
        )
      ).toThrow('Learning path must have at least one task');
    });

    it('should throw validation error for invalid title', () => {
      expect(() =>
        LearningPathEntity.create(
          'path-1',
          'topic-1',
          '', // Invalid: empty title
          'Description',
          'easy',
          30,
          { minimumAccuracy: 80, requiredTasks: 1 }
        )
      ).toThrow(ValidationError);
    });

    it('should throw validation error for invalid estimatedTime', () => {
      expect(() =>
        LearningPathEntity.create(
          'path-1',
          'topic-1',
          'Valid Title',
          'Description',
          'easy',
          500, // Invalid: > 300
          { minimumAccuracy: 80, requiredTasks: 1 }
        )
      ).toThrow(ValidationError);
    });
  });

  describe('update method', () => {
    let path: LearningPathEntity;

    beforeEach(() => {
      path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Original Title',
        description: 'Original Description',
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 2,
        },
      });
    });

    it('should update title', () => {
      path.update({ title: 'New Title' });

      expect(path.title).toBe('New Title');
    });

    it('should update description', () => {
      path.update({ description: 'New Description' });

      expect(path.description).toBe('New Description');
    });

    it('should update difficulty', () => {
      path.update({ difficulty: 'hard' });

      expect(path.difficulty).toBe('hard');
    });

    it('should update taskIds', () => {
      path.update({ taskIds: ['task-1', 'task-2', 'task-3'] });

      expect(path.taskIds).toEqual(['task-1', 'task-2', 'task-3']);
    });

    it('should update estimatedTime', () => {
      path.update({ estimatedTime: 60 });

      expect(path.estimatedTime).toBe(60);
    });

    it('should update isActive', () => {
      expect(path.isActive).toBe(true);

      path.update({ isActive: false });

      expect(path.isActive).toBe(false);
    });

    it('should update requirements', () => {
      path.update({
        requirements: { minimumAccuracy: 90, requiredTasks: 3 },
      });

      expect(path.requirements.minimumAccuracy).toBe(90);
      expect(path.requirements.requiredTasks).toBe(3);
    });

    it('should update multiple fields at once', () => {
      path.update({
        title: 'Updated Title',
        description: 'Updated Description',
        difficulty: 'medium',
        estimatedTime: 45,
      });

      expect(path.title).toBe('Updated Title');
      expect(path.description).toBe('Updated Description');
      expect(path.difficulty).toBe('medium');
      expect(path.estimatedTime).toBe(45);
    });

    it('should validate updates', () => {
      expect(() =>
        path.update({ title: '' })
      ).toThrow('Title must be between 1 and 200 characters');

      expect(() =>
        path.update({ estimatedTime: 500 })
      ).toThrow('Estimated time must be between 1 and 300 minutes');

      expect(() =>
        path.update({
          requirements: { minimumAccuracy: 150, requiredTasks: 1 },
        })
      ).toThrow('Minimum accuracy must be between 0 and 100');
    });

    it('should not update id', () => {
      // @ts-expect-error - Testing runtime behavior
      path.update({ id: 'new-id' });

      expect(path.id).toBe('path-1');
    });

    it('should not update topicId', () => {
      // @ts-expect-error - Testing runtime behavior
      path.update({ topicId: 'new-topic' });

      expect(path.topicId).toBe('topic-1');
    });

    it('should not update createdAt', () => {
      const originalCreatedAt = path.createdAt;

      // @ts-expect-error - Testing runtime behavior
      path.update({ createdAt: new Date() });

      expect(path.createdAt).toBe(originalCreatedAt);
    });

    it('should update updatedAt timestamp', () => {
      const oldUpdatedAt = path.updatedAt;

      path.update({ title: 'New Title' });
      expect(path.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should create a copy of taskIds array in update', () => {
      const newTaskIds = ['task-1', 'task-2'];
      path.update({ taskIds: newTaskIds });

      newTaskIds.push('task-3');
      expect(path.taskIds).toEqual(['task-1', 'task-2']);
    });
  });

  describe('addTask method', () => {
    let path: LearningPathEntity;

    beforeEach(() => {
      path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-0'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });
    });

    it('should add a new task', () => {
      expect(path.taskIds).toEqual(['task-0']);

      path.addTask('task-1');

      expect(path.taskIds).toEqual(['task-0', 'task-1']);
    });

    it('should add multiple tasks', () => {
      path.addTask('task-1');
      path.addTask('task-2');
      path.addTask('task-3');

      expect(path.taskIds).toEqual(['task-0', 'task-1', 'task-2', 'task-3']);
    });

    it('should not add duplicate tasks', () => {
      path.addTask('task-1');
      path.addTask('task-1');
      path.addTask('task-1');

      expect(path.taskIds).toEqual(['task-0', 'task-1']);
    });

    it('should update updatedAt when adding a new task', () => {
      const oldUpdatedAt = path.updatedAt;

      path.addTask('task-1');
      expect(path.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should not update updatedAt when adding duplicate task', () => {
      path.addTask('task-1');
      const updatedAt = path.updatedAt;

      path.addTask('task-1');
      expect(path.updatedAt).toBe(updatedAt);
    });
  });

  describe('removeTask method', () => {
    let path: LearningPathEntity;

    beforeEach(() => {
      path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-1', 'task-2', 'task-3'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });
    });

    it('should remove an existing task', () => {
      expect(path.taskIds).toEqual(['task-1', 'task-2', 'task-3']);

      path.removeTask('task-2');

      expect(path.taskIds).toEqual(['task-1', 'task-3']);
    });

    it('should remove multiple tasks', () => {
      path.removeTask('task-1');
      path.removeTask('task-3');

      expect(path.taskIds).toEqual(['task-2']);
    });

    it('should handle removing non-existent task', () => {
      path.removeTask('task-99');

      expect(path.taskIds).toEqual(['task-1', 'task-2', 'task-3']);
    });

    it('should update updatedAt when removing a task', () => {
      const oldUpdatedAt = path.updatedAt;

      path.removeTask('task-1');
      expect(path.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should not update updatedAt when removing non-existent task', () => {
      const updatedAt = path.updatedAt;

      path.removeTask('task-99');
      expect(path.updatedAt).toBe(updatedAt);
    });
  });

  describe('reorderTasks method', () => {
    let path: LearningPathEntity;

    beforeEach(() => {
      path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-1', 'task-2', 'task-3'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });
    });

    it('should reorder tasks', () => {
      expect(path.taskIds).toEqual(['task-1', 'task-2', 'task-3']);

      path.reorderTasks(['task-3', 'task-1', 'task-2']);

      expect(path.taskIds).toEqual(['task-3', 'task-1', 'task-2']);
    });

    it('should update updatedAt when reordering', () => {
      const oldUpdatedAt = path.updatedAt;

      path.reorderTasks(['task-2', 'task-3', 'task-1']);
      expect(path.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should throw error if new order has different length', () => {
      expect(() =>
        path.reorderTasks(['task-1', 'task-2'])
      ).toThrow('New order must contain all existing tasks');

      expect(() =>
        path.reorderTasks(['task-1', 'task-2', 'task-3', 'task-4'])
      ).toThrow('New order must contain all existing tasks');
    });

    it('should throw error if new order is missing tasks', () => {
      expect(() =>
        path.reorderTasks(['task-1', 'task-2', 'task-4'])
      ).toThrow('New order is missing tasks');
    });

    it('should accept same order as current', () => {
      const currentOrder = [...path.taskIds];

      path.reorderTasks(currentOrder);

      expect(path.taskIds).toEqual(currentOrder);
    });

    it('should create a copy of the new order array', () => {
      const newOrder = ['task-2', 'task-3', 'task-1'];
      path.reorderTasks(newOrder);

      newOrder.push('task-4');
      expect(path.taskIds).toEqual(['task-2', 'task-3', 'task-1']);
    });
  });

  describe('activate method', () => {
    it('should activate an inactive path', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 30,
        isActive: false,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      expect(path.isActive).toBe(false);

      path.activate();

      expect(path.isActive).toBe(true);
    });

    it('should update updatedAt when activating', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 30,
        isActive: false,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      const oldUpdatedAt = path.updatedAt;

      path.activate();
      expect(path.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should activate already active path without error', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      expect(path.isActive).toBe(true);

      path.activate();

      expect(path.isActive).toBe(true);
    });
  });

  describe('deactivate method', () => {
    it('should deactivate an active path', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      expect(path.isActive).toBe(true);

      path.deactivate();

      expect(path.isActive).toBe(false);
    });

    it('should update updatedAt when deactivating', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      const oldUpdatedAt = path.updatedAt;

      path.deactivate();
      expect(path.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should deactivate already inactive path without error', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 30,
        isActive: false,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      expect(path.isActive).toBe(false);

      path.deactivate();

      expect(path.isActive).toBe(false);
    });
  });

  describe('toJSON and fromJSON serialization', () => {
    it('should serialize to JSON', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Test Description',
        difficulty: 'medium',
        taskIds: ['task-1', 'task-2'],
        estimatedTime: 45,
        isActive: true,
        requirements: {
          minimumAccuracy: 85,
          requiredTasks: 2,
        },
      });

      const json = path.toJSON();

      expect(json.id).toBe('path-1');
      expect(json.topicId).toBe('topic-1');
      expect(json.title).toBe('Test Path');
      expect(json.description).toBe('Test Description');
      expect(json.difficulty).toBe('medium');
      expect(json.taskIds).toEqual(['task-1', 'task-2']);
      expect(json.estimatedTime).toBe(45);
      expect(json.isActive).toBe(true);
      expect(json.requirements.minimumAccuracy).toBe(85);
      expect(json.requirements.requiredTasks).toBe(2);
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });

    it('should deserialize from JSON', () => {
      const jsonData = {
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Test Description',
        difficulty: 'hard' as const,
        taskIds: ['task-1', 'task-2', 'task-3'],
        estimatedTime: 60,
        isActive: false,
        requirements: {
          minimumAccuracy: 90,
          requiredTasks: 3,
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const path = LearningPathEntity.fromJSON(jsonData);

      expect(path.id).toBe(jsonData.id);
      expect(path.topicId).toBe(jsonData.topicId);
      expect(path.title).toBe(jsonData.title);
      expect(path.description).toBe(jsonData.description);
      expect(path.difficulty).toBe(jsonData.difficulty);
      expect(path.taskIds).toEqual(jsonData.taskIds);
      expect(path.estimatedTime).toBe(jsonData.estimatedTime);
      expect(path.isActive).toBe(jsonData.isActive);
      expect(path.requirements.minimumAccuracy).toBe(jsonData.requirements.minimumAccuracy);
      expect(path.requirements.requiredTasks).toBe(jsonData.requirements.requiredTasks);
      expect(path.createdAt).toEqual(jsonData.createdAt);
      expect(path.updatedAt).toEqual(jsonData.updatedAt);
    });

    it('should round-trip serialize and deserialize correctly', () => {
      const original = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Test Description',
        difficulty: 'easy',
        taskIds: ['task-1', 'task-2'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 2,
        },
      });

      const json = original.toJSON();
      const restored = LearningPathEntity.fromJSON(json);

      expect(restored.id).toBe(original.id);
      expect(restored.topicId).toBe(original.topicId);
      expect(restored.title).toBe(original.title);
      expect(restored.description).toBe(original.description);
      expect(restored.difficulty).toBe(original.difficulty);
      expect(restored.taskIds).toEqual(original.taskIds);
      expect(restored.estimatedTime).toBe(original.estimatedTime);
      expect(restored.isActive).toBe(original.isActive);
      expect(restored.requirements.minimumAccuracy).toBe(original.requirements.minimumAccuracy);
      expect(restored.requirements.requiredTasks).toBe(original.requirements.requiredTasks);
      expect(restored.createdAt).toEqual(original.createdAt);
      expect(restored.updatedAt).toEqual(original.updatedAt);
    });

    it('should create independent copies in toJSON', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-1', 'task-2'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      const json = path.toJSON();
      json.taskIds.push('task-3');

      expect(path.taskIds).toEqual(['task-1', 'task-2']);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle minimum valid values', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'A', // Minimum length title (1 char)
        description: 'B', // Minimum length description (1 char)
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 1, // Minimum estimated time
        isActive: true,
        requirements: {
          minimumAccuracy: 0,
          requiredTasks: 1,
        },
      });

      expect(path.title).toBe('A');
      expect(path.description).toBe('B');
      expect(path.estimatedTime).toBe(1);
      expect(path.requirements.minimumAccuracy).toBe(0);
      expect(path.requirements.requiredTasks).toBe(1);
    });

    it('should handle maximum valid values', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'x'.repeat(200), // Maximum length title (200 chars)
        description: 'y'.repeat(1000), // Maximum length description (1000 chars)
        difficulty: 'hard',
        taskIds: ['task-1'],
        estimatedTime: 300, // Maximum estimated time
        isActive: true,
        requirements: {
          minimumAccuracy: 100,
          requiredTasks: 999,
        },
      });

      expect(path.title.length).toBe(200);
      expect(path.description.length).toBe(1000);
      expect(path.estimatedTime).toBe(300);
      expect(path.requirements.minimumAccuracy).toBe(100);
      expect(path.requirements.requiredTasks).toBe(999);
    });

    it('should handle path with single task', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Single Task Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      expect(path.taskIds).toEqual(['task-1']);

      path.removeTask('task-1');
      expect(path.taskIds).toEqual([]);
    });

    it('should handle path with many tasks', () => {
      const manyTasks = Array.from({ length: 100 }, (_, i) => `task-${i + 1}`);

      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Many Tasks Path',
        description: 'Description',
        difficulty: 'hard',
        taskIds: manyTasks,
        estimatedTime: 300,
        isActive: true,
        requirements: {
          minimumAccuracy: 90,
          requiredTasks: 50,
        },
      });

      expect(path.taskIds.length).toBe(100);
    });

    it('should handle rapid updates', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      for (let i = 0; i < 100; i++) {
        path.update({ title: `Title ${i}` });
      }

      expect(path.title).toBe('Title 99');
    });

    it('should handle multiple task operations', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      // Add tasks
      for (let i = 2; i <= 10; i++) {
        path.addTask(`task-${i}`);
      }
      expect(path.taskIds.length).toBe(10);

      // Remove some tasks
      path.removeTask('task-2');
      path.removeTask('task-5');
      path.removeTask('task-8');
      expect(path.taskIds.length).toBe(7);

      // Reorder remaining tasks
      const reordered = ['task-10', 'task-1', 'task-3', 'task-4', 'task-6', 'task-7', 'task-9'];
      path.reorderTasks(reordered);
      expect(path.taskIds).toEqual(reordered);
    });
  });

  describe('Immutability and Data Integrity', () => {
    it('should expose taskIds array (NOTE: entity does not prevent external mutations)', () => {
      // This test documents the current behavior - the entity exposes the internal array
      // In a more robust implementation, taskIds getter would return a copy
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Test Path',
        description: 'Description',
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      path.addTask('task-2');
      const taskIds = path.taskIds;

      // Currently allows mutation (documented behavior)
      taskIds.push('task-3');
      expect(path.taskIds).toEqual(['task-1', 'task-2', 'task-3']);
    });

    it('should maintain consistency after failed update', () => {
      const path = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Original Title',
        description: 'Original Description',
        difficulty: 'easy',
        taskIds: ['task-1'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      const originalTitle = path.title;
      const originalEstimatedTime = path.estimatedTime;

      try {
        path.update({ title: 'New Title', estimatedTime: 500 }); // Invalid estimatedTime
      } catch (error) {
        // Update should fail
      }

      // Original values should be preserved
      expect(path.title).toBe(originalTitle);
      expect(path.estimatedTime).toBe(originalEstimatedTime);
    });

    it('should maintain independent state between instances', () => {
      const path1 = new LearningPathEntity({
        id: 'path-1',
        topicId: 'topic-1',
        title: 'Path 1',
        description: 'Description 1',
        difficulty: 'easy',
        taskIds: ['task-0'],
        estimatedTime: 30,
        isActive: true,
        requirements: {
          minimumAccuracy: 80,
          requiredTasks: 1,
        },
      });

      const path2 = new LearningPathEntity({
        id: 'path-2',
        topicId: 'topic-2',
        title: 'Path 2',
        description: 'Description 2',
        difficulty: 'hard',
        taskIds: ['task-a'],
        estimatedTime: 60,
        isActive: true,
        requirements: {
          minimumAccuracy: 90,
          requiredTasks: 2,
        },
      });

      path1.addTask('task-1');
      path2.addTask('task-2');

      expect(path1.taskIds).toEqual(['task-0', 'task-1']);
      expect(path2.taskIds).toEqual(['task-a', 'task-2']);
    });
  });
});
