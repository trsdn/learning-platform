/**
 * Tests for TopicEntity
 *
 * Tests the core topic logic including:
 * - Constructor and validation
 * - Static validate method (title, description, estimatedHours, difficultyLevel)
 * - update method with partial updates and validation
 * - addLearningPath method with duplicate handling
 * - removeLearningPath method
 * - toJSON method with proper array copying
 * - fromJSON static method
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TopicEntity } from '../../../../src/modules/core/entities/topic';
import { ValidationError } from '../../../../src/modules/core/types/entities';

describe('TopicEntity', () => {
  describe('Constructor and Validation', () => {
    it('should create a topic with valid data', () => {
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'JavaScript Basics',
        description: 'Learn the fundamentals of JavaScript programming',
        learningPathIds: ['path-1', 'path-2'],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: ['prereq-1'],
        },
      });

      expect(topic.id).toBe('topic-1');
      expect(topic.title).toBe('JavaScript Basics');
      expect(topic.description).toBe('Learn the fundamentals of JavaScript programming');
      expect(topic.learningPathIds).toEqual(['path-1', 'path-2']);
      expect(topic.isActive).toBe(true);
      expect(topic.metadata.estimatedHours).toBe(10);
      expect(topic.metadata.difficultyLevel).toBe('beginner');
      expect(topic.metadata.prerequisites).toEqual(['prereq-1']);
      expect(topic.createdAt).toBeInstanceOf(Date);
      expect(topic.updatedAt).toBeInstanceOf(Date);
    });

    it('should create topic with custom dates', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 5,
          difficultyLevel: 'intermediate',
          prerequisites: [],
        },
        createdAt,
        updatedAt,
      });

      expect(topic.createdAt).toBe(createdAt);
      expect(topic.updatedAt).toBe(updatedAt);
    });

    it('should copy learningPathIds array during construction', () => {
      const learningPathIds = ['path-1', 'path-2'];
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds,
        isActive: true,
        metadata: {
          estimatedHours: 5,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });

      // Modify original array
      learningPathIds.push('path-3');

      // Topic should not be affected
      expect(topic.learningPathIds).toEqual(['path-1', 'path-2']);
    });

    it('should copy prerequisites array during construction', () => {
      const prerequisites = ['prereq-1'];
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 5,
          difficultyLevel: 'beginner',
          prerequisites,
        },
      });

      // Modify original array
      prerequisites.push('prereq-2');

      // Topic should not be affected
      expect(topic.metadata.prerequisites).toEqual(['prereq-1']);
    });

    it('should throw ValidationError for invalid title during construction', () => {
      expect(() => {
        new TopicEntity({
          id: 'topic-1',
          title: '',
          description: 'Test description',
          learningPathIds: [],
          isActive: true,
          metadata: {
            estimatedHours: 5,
            difficultyLevel: 'beginner',
            prerequisites: [],
          },
        });
      }).toThrow(ValidationError);
    });
  });

  describe('Static validate method - title validation', () => {
    it('should accept valid title length (1 character)', () => {
      expect(() => {
        TopicEntity.validate({ title: 'A' });
      }).not.toThrow();
    });

    it('should accept valid title length (100 characters)', () => {
      const title = 'A'.repeat(100);
      expect(() => {
        TopicEntity.validate({ title });
      }).not.toThrow();
    });

    it('should accept valid title length (50 characters)', () => {
      const title = 'A'.repeat(50);
      expect(() => {
        TopicEntity.validate({ title });
      }).not.toThrow();
    });

    it('should throw ValidationError for empty title', () => {
      expect(() => {
        TopicEntity.validate({ title: '' });
      }).toThrow(ValidationError);

      try {
        TopicEntity.validate({ title: '' });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Title must be between 1 and 100 characters');
        expect((error as ValidationError).context?.field).toBe('title');
        expect((error as ValidationError).context?.value).toBe('');
      }
    });

    it('should throw ValidationError for title exceeding 100 characters', () => {
      const title = 'A'.repeat(101);

      expect(() => {
        TopicEntity.validate({ title });
      }).toThrow(ValidationError);

      try {
        TopicEntity.validate({ title });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Title must be between 1 and 100 characters');
        expect((error as ValidationError).context?.field).toBe('title');
        expect((error as ValidationError).context?.value).toBe(title);
      }
    });
  });

  describe('Static validate method - description validation', () => {
    it('should accept valid description length (1 character)', () => {
      expect(() => {
        TopicEntity.validate({ description: 'A' });
      }).not.toThrow();
    });

    it('should accept valid description length (500 characters)', () => {
      const description = 'A'.repeat(500);
      expect(() => {
        TopicEntity.validate({ description });
      }).not.toThrow();
    });

    it('should accept valid description length (250 characters)', () => {
      const description = 'A'.repeat(250);
      expect(() => {
        TopicEntity.validate({ description });
      }).not.toThrow();
    });

    it('should throw ValidationError for empty description', () => {
      expect(() => {
        TopicEntity.validate({ description: '' });
      }).toThrow(ValidationError);

      try {
        TopicEntity.validate({ description: '' });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Description must be between 1 and 500 characters');
        expect((error as ValidationError).context?.field).toBe('description');
        expect((error as ValidationError).context?.value).toBe('');
      }
    });

    it('should throw ValidationError for description exceeding 500 characters', () => {
      const description = 'A'.repeat(501);

      expect(() => {
        TopicEntity.validate({ description });
      }).toThrow(ValidationError);

      try {
        TopicEntity.validate({ description });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Description must be between 1 and 500 characters');
        expect((error as ValidationError).context?.field).toBe('description');
        expect((error as ValidationError).context?.value).toBe(description);
      }
    });
  });

  describe('Static validate method - estimatedHours validation', () => {
    it('should accept valid estimatedHours (1)', () => {
      expect(() => {
        TopicEntity.validate({ metadata: { estimatedHours: 1 } });
      }).not.toThrow();
    });

    it('should accept valid estimatedHours (1000)', () => {
      expect(() => {
        TopicEntity.validate({ metadata: { estimatedHours: 1000 } });
      }).not.toThrow();
    });

    it('should accept valid estimatedHours (500)', () => {
      expect(() => {
        TopicEntity.validate({ metadata: { estimatedHours: 500 } });
      }).not.toThrow();
    });

    it('should throw ValidationError for estimatedHours = 0', () => {
      expect(() => {
        TopicEntity.validate({ metadata: { estimatedHours: 0 } });
      }).toThrow(ValidationError);

      try {
        TopicEntity.validate({ metadata: { estimatedHours: 0 } });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Estimated hours must be between 1 and 1000');
        expect((error as ValidationError).context?.field).toBe('estimatedHours');
        expect((error as ValidationError).context?.value).toBe(0);
      }
    });

    it('should throw ValidationError for negative estimatedHours', () => {
      expect(() => {
        TopicEntity.validate({ metadata: { estimatedHours: -5 } });
      }).toThrow(ValidationError);

      try {
        TopicEntity.validate({ metadata: { estimatedHours: -5 } });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Estimated hours must be between 1 and 1000');
        expect((error as ValidationError).context?.field).toBe('estimatedHours');
        expect((error as ValidationError).context?.value).toBe(-5);
      }
    });

    it('should throw ValidationError for estimatedHours exceeding 1000', () => {
      expect(() => {
        TopicEntity.validate({ metadata: { estimatedHours: 1001 } });
      }).toThrow(ValidationError);

      try {
        TopicEntity.validate({ metadata: { estimatedHours: 1001 } });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Estimated hours must be between 1 and 1000');
        expect((error as ValidationError).context?.field).toBe('estimatedHours');
        expect((error as ValidationError).context?.value).toBe(1001);
      }
    });
  });

  describe('Static validate method - difficultyLevel validation', () => {
    it('should accept valid difficulty level: beginner', () => {
      expect(() => {
        TopicEntity.validate({ metadata: { difficultyLevel: 'beginner' } });
      }).not.toThrow();
    });

    it('should accept valid difficulty level: intermediate', () => {
      expect(() => {
        TopicEntity.validate({ metadata: { difficultyLevel: 'intermediate' } });
      }).not.toThrow();
    });

    it('should accept valid difficulty level: advanced', () => {
      expect(() => {
        TopicEntity.validate({ metadata: { difficultyLevel: 'advanced' } });
      }).not.toThrow();
    });

    it('should throw ValidationError for invalid difficulty level', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        TopicEntity.validate({ metadata: { difficultyLevel: 'expert' as any } });
      }).toThrow(ValidationError);

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        TopicEntity.validate({ metadata: { difficultyLevel: 'expert' as any } });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Invalid difficulty level');
        expect((error as ValidationError).context?.field).toBe('difficultyLevel');
        expect((error as ValidationError).context?.value).toBe('expert');
        expect((error as ValidationError).context?.validValues).toEqual(['beginner', 'intermediate', 'advanced']);
      }
    });
  });

  describe('update method', () => {
    let topic: TopicEntity;

    beforeEach(() => {
      topic = new TopicEntity({
        id: 'topic-1',
        title: 'Original Title',
        description: 'Original description',
        learningPathIds: ['path-1'],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: ['prereq-1'],
        },
      });
    });

    it('should update title', () => {
      const oldUpdatedAt = topic.updatedAt;

      topic.update({ title: 'Updated Title' });

      expect(topic.title).toBe('Updated Title');
      expect(topic.updatedAt).not.toBe(oldUpdatedAt);
    });

    it('should update description', () => {
      topic.update({ description: 'Updated description' });

      expect(topic.description).toBe('Updated description');
    });

    it('should update learningPathIds', () => {
      topic.update({ learningPathIds: ['path-2', 'path-3'] });

      expect(topic.learningPathIds).toEqual(['path-2', 'path-3']);
    });

    it('should copy learningPathIds array during update', () => {
      const newPaths = ['path-2', 'path-3'];
      topic.update({ learningPathIds: newPaths });

      // Modify original array
      newPaths.push('path-4');

      // Topic should not be affected
      expect(topic.learningPathIds).toEqual(['path-2', 'path-3']);
    });

    it('should update isActive', () => {
      expect(topic.isActive).toBe(true);

      topic.update({ isActive: false });

      expect(topic.isActive).toBe(false);
    });

    it('should update metadata.estimatedHours', () => {
      topic.update({ metadata: { estimatedHours: 20 } });

      expect(topic.metadata.estimatedHours).toBe(20);
      expect(topic.metadata.difficultyLevel).toBe('beginner'); // unchanged
      expect(topic.metadata.prerequisites).toEqual(['prereq-1']); // unchanged
    });

    it('should update metadata.difficultyLevel', () => {
      topic.update({ metadata: { difficultyLevel: 'advanced' } });

      expect(topic.metadata.difficultyLevel).toBe('advanced');
      expect(topic.metadata.estimatedHours).toBe(10); // unchanged
      expect(topic.metadata.prerequisites).toEqual(['prereq-1']); // unchanged
    });

    it('should update metadata.prerequisites', () => {
      topic.update({ metadata: { prerequisites: ['prereq-2', 'prereq-3'] } });

      expect(topic.metadata.prerequisites).toEqual(['prereq-2', 'prereq-3']);
      expect(topic.metadata.estimatedHours).toBe(10); // unchanged
      expect(topic.metadata.difficultyLevel).toBe('beginner'); // unchanged
    });

    it('should copy prerequisites array during update', () => {
      const newPrereqs = ['prereq-2', 'prereq-3'];
      topic.update({ metadata: { prerequisites: newPrereqs } });

      // Modify original array
      newPrereqs.push('prereq-4');

      // Topic should not be affected
      expect(topic.metadata.prerequisites).toEqual(['prereq-2', 'prereq-3']);
    });

    it('should update multiple fields at once', () => {
      topic.update({
        title: 'New Title',
        description: 'New description',
        isActive: false,
        metadata: {
          estimatedHours: 50,
          difficultyLevel: 'intermediate',
          prerequisites: ['prereq-new'],
        },
      });

      expect(topic.title).toBe('New Title');
      expect(topic.description).toBe('New description');
      expect(topic.isActive).toBe(false);
      expect(topic.metadata.estimatedHours).toBe(50);
      expect(topic.metadata.difficultyLevel).toBe('intermediate');
      expect(topic.metadata.prerequisites).toEqual(['prereq-new']);
    });

    it('should update partial metadata fields', () => {
      topic.update({ metadata: { estimatedHours: 25 } });

      expect(topic.metadata.estimatedHours).toBe(25);
      expect(topic.metadata.difficultyLevel).toBe('beginner');
      expect(topic.metadata.prerequisites).toEqual(['prereq-1']);
    });

    it('should not update prerequisites if not provided in metadata update', () => {
      const originalPrereqs = topic.metadata.prerequisites;

      topic.update({ metadata: { estimatedHours: 30 } });

      expect(topic.metadata.prerequisites).toBe(originalPrereqs);
    });

    it('should update updatedAt timestamp', () => {
      const oldUpdatedAt = topic.updatedAt;

      // Wait a small amount to ensure timestamp difference
      topic.update({ title: 'Updated Title' });

      expect(topic.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should throw ValidationError for invalid title', () => {
      expect(() => {
        topic.update({ title: '' });
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid description', () => {
      expect(() => {
        topic.update({ description: 'A'.repeat(501) });
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid estimatedHours', () => {
      expect(() => {
        topic.update({ metadata: { estimatedHours: 0 } });
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid difficultyLevel', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        topic.update({ metadata: { difficultyLevel: 'invalid' as any } });
      }).toThrow(ValidationError);
    });

    it('should not modify topic if validation fails', () => {
      const originalTitle = topic.title;

      try {
        topic.update({ title: '' });
      } catch (error) {
        // Expected error
      }

      expect(topic.title).toBe(originalTitle);
    });
  });

  describe('addLearningPath method', () => {
    let topic: TopicEntity;

    beforeEach(() => {
      topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: ['path-1'],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });
    });

    it('should add a new learning path', () => {
      topic.addLearningPath('path-2');

      expect(topic.learningPathIds).toEqual(['path-1', 'path-2']);
    });

    it('should update updatedAt when adding a learning path', () => {
      const oldUpdatedAt = topic.updatedAt;

      topic.addLearningPath('path-2');

      expect(topic.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should not add duplicate learning path', () => {
      topic.addLearningPath('path-1');

      expect(topic.learningPathIds).toEqual(['path-1']);
    });

    it('should not update updatedAt when adding duplicate learning path', () => {
      const oldUpdatedAt = topic.updatedAt;

      topic.addLearningPath('path-1');

      expect(topic.updatedAt).toBe(oldUpdatedAt);
    });

    it('should add multiple learning paths', () => {
      topic.addLearningPath('path-2');
      topic.addLearningPath('path-3');
      topic.addLearningPath('path-4');

      expect(topic.learningPathIds).toEqual(['path-1', 'path-2', 'path-3', 'path-4']);
    });

    it('should handle adding to empty learningPathIds', () => {
      const emptyTopic = new TopicEntity({
        id: 'topic-2',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });

      emptyTopic.addLearningPath('path-1');

      expect(emptyTopic.learningPathIds).toEqual(['path-1']);
    });
  });

  describe('removeLearningPath method', () => {
    let topic: TopicEntity;

    beforeEach(() => {
      topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: ['path-1', 'path-2', 'path-3'],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });
    });

    it('should remove an existing learning path', () => {
      topic.removeLearningPath('path-2');

      expect(topic.learningPathIds).toEqual(['path-1', 'path-3']);
    });

    it('should update updatedAt when removing a learning path', () => {
      const oldUpdatedAt = topic.updatedAt;

      topic.removeLearningPath('path-2');

      expect(topic.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should not error when removing non-existent learning path', () => {
      expect(() => {
        topic.removeLearningPath('path-999');
      }).not.toThrow();

      expect(topic.learningPathIds).toEqual(['path-1', 'path-2', 'path-3']);
    });

    it('should not update updatedAt when removing non-existent learning path', () => {
      const oldUpdatedAt = topic.updatedAt;

      topic.removeLearningPath('path-999');

      expect(topic.updatedAt).toBe(oldUpdatedAt);
    });

    it('should remove first learning path', () => {
      topic.removeLearningPath('path-1');

      expect(topic.learningPathIds).toEqual(['path-2', 'path-3']);
    });

    it('should remove last learning path', () => {
      topic.removeLearningPath('path-3');

      expect(topic.learningPathIds).toEqual(['path-1', 'path-2']);
    });

    it('should remove all learning paths', () => {
      topic.removeLearningPath('path-1');
      topic.removeLearningPath('path-2');
      topic.removeLearningPath('path-3');

      expect(topic.learningPathIds).toEqual([]);
    });

    it('should handle removing from empty learningPathIds', () => {
      const emptyTopic = new TopicEntity({
        id: 'topic-2',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });

      expect(() => {
        emptyTopic.removeLearningPath('path-1');
      }).not.toThrow();

      expect(emptyTopic.learningPathIds).toEqual([]);
    });
  });

  describe('toJSON method', () => {
    it('should convert topic to plain object', () => {
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: ['path-1', 'path-2'],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: ['prereq-1'],
        },
      });

      const json = topic.toJSON();

      expect(json).toEqual({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: ['path-1', 'path-2'],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: ['prereq-1'],
        },
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
      });
    });

    it('should copy learningPathIds array in toJSON', () => {
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: ['path-1', 'path-2'],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });

      const json = topic.toJSON();

      // Modify returned array
      json.learningPathIds.push('path-3');

      // Original topic should not be affected
      expect(topic.learningPathIds).toEqual(['path-1', 'path-2']);
    });

    it('should copy prerequisites array in toJSON', () => {
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: ['prereq-1'],
        },
      });

      const json = topic.toJSON();

      // Modify returned array
      json.metadata.prerequisites.push('prereq-2');

      // Original topic should not be affected
      expect(topic.metadata.prerequisites).toEqual(['prereq-1']);
    });

    it('should include all fields in JSON output', () => {
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: ['path-1'],
        isActive: false,
        metadata: {
          estimatedHours: 100,
          difficultyLevel: 'advanced',
          prerequisites: ['prereq-1', 'prereq-2'],
        },
      });

      const json = topic.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('title');
      expect(json).toHaveProperty('description');
      expect(json).toHaveProperty('learningPathIds');
      expect(json).toHaveProperty('isActive');
      expect(json).toHaveProperty('metadata');
      expect(json.metadata).toHaveProperty('estimatedHours');
      expect(json.metadata).toHaveProperty('difficultyLevel');
      expect(json.metadata).toHaveProperty('prerequisites');
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
    });
  });

  describe('fromJSON static method', () => {
    it('should create TopicEntity from JSON data', () => {
      const jsonData = {
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: ['path-1', 'path-2'],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner' as const,
          prerequisites: ['prereq-1'],
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const topic = TopicEntity.fromJSON(jsonData);

      expect(topic).toBeInstanceOf(TopicEntity);
      expect(topic.id).toBe('topic-1');
      expect(topic.title).toBe('Test Topic');
      expect(topic.description).toBe('Test description');
      expect(topic.learningPathIds).toEqual(['path-1', 'path-2']);
      expect(topic.isActive).toBe(true);
      expect(topic.metadata.estimatedHours).toBe(10);
      expect(topic.metadata.difficultyLevel).toBe('beginner');
      expect(topic.metadata.prerequisites).toEqual(['prereq-1']);
      expect(topic.createdAt).toEqual(new Date('2024-01-01'));
      expect(topic.updatedAt).toEqual(new Date('2024-01-02'));
    });

    it('should validate data when creating from JSON', () => {
      const invalidJsonData = {
        id: 'topic-1',
        title: '',
        description: 'Test description',
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner' as const,
          prerequisites: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => {
        TopicEntity.fromJSON(invalidJsonData);
      }).toThrow(ValidationError);
    });
  });

  describe('Serialization and Deserialization', () => {
    it('should serialize and deserialize correctly', () => {
      const original = new TopicEntity({
        id: 'topic-1',
        title: 'JavaScript Advanced',
        description: 'Learn advanced JavaScript concepts and patterns',
        learningPathIds: ['path-1', 'path-2', 'path-3'],
        isActive: true,
        metadata: {
          estimatedHours: 50,
          difficultyLevel: 'advanced',
          prerequisites: ['prereq-1', 'prereq-2'],
        },
      });

      const json = original.toJSON();
      const restored = TopicEntity.fromJSON(json);

      expect(restored.id).toBe(original.id);
      expect(restored.title).toBe(original.title);
      expect(restored.description).toBe(original.description);
      expect(restored.learningPathIds).toEqual(original.learningPathIds);
      expect(restored.isActive).toBe(original.isActive);
      expect(restored.metadata.estimatedHours).toBe(original.metadata.estimatedHours);
      expect(restored.metadata.difficultyLevel).toBe(original.metadata.difficultyLevel);
      expect(restored.metadata.prerequisites).toEqual(original.metadata.prerequisites);
      expect(restored.createdAt).toEqual(original.createdAt);
      expect(restored.updatedAt).toEqual(original.updatedAt);
    });

    it('should maintain data integrity after multiple serializations', () => {
      const original = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: ['path-1'],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'intermediate',
          prerequisites: ['prereq-1'],
        },
      });

      const json1 = original.toJSON();
      const restored1 = TopicEntity.fromJSON(json1);
      const json2 = restored1.toJSON();
      const restored2 = TopicEntity.fromJSON(json2);

      expect(restored2.id).toBe(original.id);
      expect(restored2.title).toBe(original.title);
      expect(restored2.learningPathIds).toEqual(original.learningPathIds);
      expect(restored2.metadata.prerequisites).toEqual(original.metadata.prerequisites);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty learningPathIds array', () => {
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });

      expect(topic.learningPathIds).toEqual([]);
    });

    it('should handle empty prerequisites array', () => {
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });

      expect(topic.metadata.prerequisites).toEqual([]);
    });

    it('should handle minimum valid estimatedHours (1)', () => {
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 1,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });

      expect(topic.metadata.estimatedHours).toBe(1);
    });

    it('should handle maximum valid estimatedHours (1000)', () => {
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 1000,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });

      expect(topic.metadata.estimatedHours).toBe(1000);
    });

    it('should handle all difficulty levels', () => {
      const levels: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];

      levels.forEach(level => {
        const topic = new TopicEntity({
          id: 'topic-1',
          title: 'Test Topic',
          description: 'Test description',
          learningPathIds: [],
          isActive: true,
          metadata: {
            estimatedHours: 10,
            difficultyLevel: level,
            prerequisites: [],
          },
        });

        expect(topic.metadata.difficultyLevel).toBe(level);
      });
    });

    it('should handle isActive = false', () => {
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'Test description',
        learningPathIds: [],
        isActive: false,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });

      expect(topic.isActive).toBe(false);
    });

    it('should handle minimum valid title length (1 character)', () => {
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'A',
        description: 'Test description',
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });

      expect(topic.title).toBe('A');
    });

    it('should handle maximum valid title length (100 characters)', () => {
      const title = 'A'.repeat(100);
      const topic = new TopicEntity({
        id: 'topic-1',
        title,
        description: 'Test description',
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });

      expect(topic.title).toBe(title);
      expect(topic.title.length).toBe(100);
    });

    it('should handle minimum valid description length (1 character)', () => {
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description: 'A',
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });

      expect(topic.description).toBe('A');
    });

    it('should handle maximum valid description length (500 characters)', () => {
      const description = 'A'.repeat(500);
      const topic = new TopicEntity({
        id: 'topic-1',
        title: 'Test Topic',
        description,
        learningPathIds: [],
        isActive: true,
        metadata: {
          estimatedHours: 10,
          difficultyLevel: 'beginner',
          prerequisites: [],
        },
      });

      expect(topic.description).toBe(description);
      expect(topic.description.length).toBe(500);
    });
  });
});
