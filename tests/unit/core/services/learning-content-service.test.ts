import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LearningContentService } from '@core/services/learning-content-service';
import type { TaskSearchFilters } from '@core/types/services';
import type {
  ITopicRepository,
  ILearningPathRepository,
  ITaskRepository,
} from '@storage/types/adapters';
import {
  createMockTopic,
  createMockLearningPath,
  createMockTask,
  createMockFlashcardTask,
} from '@tests/fixtures';

describe('LearningContentService', () => {
  // Mock repositories
  let mockTopicRepository: ITopicRepository;
  let mockLearningPathRepository: ILearningPathRepository;
  let mockTaskRepository: ITaskRepository;
  let service: LearningContentService;

  // Test data using shared fixtures
  const mockTopic = createMockTopic();
  const mockTopic2 = createMockTopic({
    id: 'topic-2',
    title: 'German Basics',
    description: 'Learn basic German vocabulary',
    learningPathIds: ['path-3'],
    metadata: {
      estimatedHours: 12,
      difficultyLevel: 'beginner',
      prerequisites: [],
    },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  });

  const mockLearningPath = createMockLearningPath();
  const mockLearningPath2 = createMockLearningPath({
    id: 'path-2',
    title: 'Numbers and Counting',
    description: 'Learn numbers in Spanish',
    difficulty: 'medium',
    taskIds: ['task-3'],
    estimatedTime: 45,
    requirements: {
      minimumAccuracy: 0.75,
      requiredTasks: 8,
    },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  });

  const mockTask = createMockTask();
  const mockTask2 = createMockFlashcardTask({ id: 'task-2' });
  const mockTask3 = createMockTask({
    id: 'task-3',
    learningPathId: 'path-2',
    templateId: 'template-3',
    content: {
      question: 'What is uno in English?',
      options: ['One', 'Two', 'Three', 'Four'],
      correctAnswer: 0,
    },
    metadata: {
      difficulty: 'medium',
      tags: ['numbers', 'vocabulary'],
      estimatedTime: 45,
      points: 15,
    },
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  });

  beforeEach(() => {
    // Create mock implementations
    mockTopicRepository = {
      getActive: vi.fn(),
      getById: vi.fn(),
      getByTitle: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockLearningPathRepository = {
      getByTopicId: vi.fn(),
      getById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(),
    };

    mockTaskRepository = {
      getByLearningPathId: vi.fn(),
      getById: vi.fn(),
      search: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(),
    };

    // Instantiate service with mocks
    service = new LearningContentService(
      mockTopicRepository,
      mockLearningPathRepository,
      mockTaskRepository
    );
  });

  describe('Constructor', () => {
    it('should create instance with three repositories', () => {
      expect(service).toBeInstanceOf(LearningContentService);
      expect(service).toBeDefined();
    });

    it('should accept custom repository implementations', () => {
      const customTopicRepo = { ...mockTopicRepository };
      const customPathRepo = { ...mockLearningPathRepository };
      const customTaskRepo = { ...mockTaskRepository };

      const customService = new LearningContentService(
        customTopicRepo,
        customPathRepo,
        customTaskRepo
      );

      expect(customService).toBeInstanceOf(LearningContentService);
    });
  });

  describe('Topic Management', () => {
    describe('getTopics', () => {
      it('should call topicRepository.getActive and return topics array', async () => {
        const mockTopics = [mockTopic, mockTopic2];
        vi.mocked(mockTopicRepository.getActive).mockResolvedValue(mockTopics);

        const result = await service.getTopics();

        expect(mockTopicRepository.getActive).toHaveBeenCalledOnce();
        expect(result).toEqual(mockTopics);
        expect(result).toHaveLength(2);
      });

      it('should return empty array when no active topics exist', async () => {
        vi.mocked(mockTopicRepository.getActive).mockResolvedValue([]);

        const result = await service.getTopics();

        expect(mockTopicRepository.getActive).toHaveBeenCalledOnce();
        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
      });

      it('should propagate repository errors', async () => {
        const error = new Error('Database connection failed');
        vi.mocked(mockTopicRepository.getActive).mockRejectedValue(error);

        await expect(service.getTopics()).rejects.toThrow('Database connection failed');
        expect(mockTopicRepository.getActive).toHaveBeenCalledOnce();
      });
    });

    describe('getTopic', () => {
      it('should call topicRepository.getById with correct id and return topic', async () => {
        vi.mocked(mockTopicRepository.getById).mockResolvedValue(mockTopic);

        const result = await service.getTopic('topic-1');

        expect(mockTopicRepository.getById).toHaveBeenCalledOnce();
        expect(mockTopicRepository.getById).toHaveBeenCalledWith('topic-1');
        expect(result).toEqual(mockTopic);
      });

      it('should return null when topic does not exist', async () => {
        vi.mocked(mockTopicRepository.getById).mockResolvedValue(null);

        const result = await service.getTopic('non-existent-id');

        expect(mockTopicRepository.getById).toHaveBeenCalledWith('non-existent-id');
        expect(result).toBeNull();
      });

      it('should handle special characters in id', async () => {
        const specialId = 'topic-with-special-chars-123!@#';
        vi.mocked(mockTopicRepository.getById).mockResolvedValue(mockTopic);

        await service.getTopic(specialId);

        expect(mockTopicRepository.getById).toHaveBeenCalledWith(specialId);
      });

      it('should propagate repository errors', async () => {
        const error = new Error('Repository error');
        vi.mocked(mockTopicRepository.getById).mockRejectedValue(error);

        await expect(service.getTopic('topic-1')).rejects.toThrow('Repository error');
      });
    });

    describe('getTopicByTitle', () => {
      it('should call topicRepository.getByTitle with correct title and return topic', async () => {
        vi.mocked(mockTopicRepository.getByTitle).mockResolvedValue(mockTopic);

        const result = await service.getTopicByTitle('Spanish Basics');

        expect(mockTopicRepository.getByTitle).toHaveBeenCalledOnce();
        expect(mockTopicRepository.getByTitle).toHaveBeenCalledWith('Spanish Basics');
        expect(result).toEqual(mockTopic);
      });

      it('should return null when topic with title does not exist', async () => {
        vi.mocked(mockTopicRepository.getByTitle).mockResolvedValue(null);

        const result = await service.getTopicByTitle('Non-existent Topic');

        expect(mockTopicRepository.getByTitle).toHaveBeenCalledWith('Non-existent Topic');
        expect(result).toBeNull();
      });

      it('should handle titles with special characters', async () => {
        const specialTitle = 'Topic: Advanced C++ & Algorithms!';
        vi.mocked(mockTopicRepository.getByTitle).mockResolvedValue(mockTopic);

        await service.getTopicByTitle(specialTitle);

        expect(mockTopicRepository.getByTitle).toHaveBeenCalledWith(specialTitle);
      });

      it('should handle empty string title', async () => {
        vi.mocked(mockTopicRepository.getByTitle).mockResolvedValue(null);

        const result = await service.getTopicByTitle('');

        expect(mockTopicRepository.getByTitle).toHaveBeenCalledWith('');
        expect(result).toBeNull();
      });

      it('should propagate repository errors', async () => {
        const error = new Error('Query error');
        vi.mocked(mockTopicRepository.getByTitle).mockRejectedValue(error);

        await expect(service.getTopicByTitle('Spanish Basics')).rejects.toThrow('Query error');
      });
    });
  });

  describe('Learning Path Management', () => {
    describe('getLearningPaths', () => {
      it('should call learningPathRepository.getByTopicId and return paths array', async () => {
        const mockPaths = [mockLearningPath, mockLearningPath2];
        vi.mocked(mockLearningPathRepository.getByTopicId).mockResolvedValue(mockPaths);

        const result = await service.getLearningPaths('topic-1');

        expect(mockLearningPathRepository.getByTopicId).toHaveBeenCalledOnce();
        expect(mockLearningPathRepository.getByTopicId).toHaveBeenCalledWith('topic-1');
        expect(result).toEqual(mockPaths);
        expect(result).toHaveLength(2);
      });

      it('should return empty array when no paths exist for topic', async () => {
        vi.mocked(mockLearningPathRepository.getByTopicId).mockResolvedValue([]);

        const result = await service.getLearningPaths('topic-without-paths');

        expect(mockLearningPathRepository.getByTopicId).toHaveBeenCalledWith('topic-without-paths');
        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
      });

      it('should handle different topic IDs', async () => {
        vi.mocked(mockLearningPathRepository.getByTopicId).mockResolvedValue([mockLearningPath]);

        await service.getLearningPaths('topic-2');

        expect(mockLearningPathRepository.getByTopicId).toHaveBeenCalledWith('topic-2');
      });

      it('should propagate repository errors', async () => {
        const error = new Error('Failed to fetch paths');
        vi.mocked(mockLearningPathRepository.getByTopicId).mockRejectedValue(error);

        await expect(service.getLearningPaths('topic-1')).rejects.toThrow('Failed to fetch paths');
      });
    });

    describe('getLearningPath', () => {
      it('should call learningPathRepository.getById with correct id and return path', async () => {
        vi.mocked(mockLearningPathRepository.getById).mockResolvedValue(mockLearningPath);

        const result = await service.getLearningPath('path-1');

        expect(mockLearningPathRepository.getById).toHaveBeenCalledOnce();
        expect(mockLearningPathRepository.getById).toHaveBeenCalledWith('path-1');
        expect(result).toEqual(mockLearningPath);
      });

      it('should return null when learning path does not exist', async () => {
        vi.mocked(mockLearningPathRepository.getById).mockResolvedValue(null);

        const result = await service.getLearningPath('non-existent-path');

        expect(mockLearningPathRepository.getById).toHaveBeenCalledWith('non-existent-path');
        expect(result).toBeNull();
      });

      it('should handle various path ID formats', async () => {
        const pathId = 'learning-path-uuid-123-abc';
        vi.mocked(mockLearningPathRepository.getById).mockResolvedValue(mockLearningPath);

        await service.getLearningPath(pathId);

        expect(mockLearningPathRepository.getById).toHaveBeenCalledWith(pathId);
      });

      it('should propagate repository errors', async () => {
        const error = new Error('Repository error');
        vi.mocked(mockLearningPathRepository.getById).mockRejectedValue(error);

        await expect(service.getLearningPath('path-1')).rejects.toThrow('Repository error');
      });
    });
  });

  describe('Task Management', () => {
    describe('getTasks', () => {
      it('should call taskRepository.getByLearningPathId and return tasks array', async () => {
        const mockTasks = [mockTask, mockTask2];
        vi.mocked(mockTaskRepository.getByLearningPathId).mockResolvedValue(mockTasks);

        const result = await service.getTasks('path-1');

        expect(mockTaskRepository.getByLearningPathId).toHaveBeenCalledOnce();
        expect(mockTaskRepository.getByLearningPathId).toHaveBeenCalledWith('path-1');
        expect(result).toEqual(mockTasks);
        expect(result).toHaveLength(2);
      });

      it('should return empty array when no tasks exist for learning path', async () => {
        vi.mocked(mockTaskRepository.getByLearningPathId).mockResolvedValue([]);

        const result = await service.getTasks('path-without-tasks');

        expect(mockTaskRepository.getByLearningPathId).toHaveBeenCalledWith('path-without-tasks');
        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
      });

      it('should handle different learning path IDs', async () => {
        vi.mocked(mockTaskRepository.getByLearningPathId).mockResolvedValue([mockTask3]);

        await service.getTasks('path-2');

        expect(mockTaskRepository.getByLearningPathId).toHaveBeenCalledWith('path-2');
      });

      it('should propagate repository errors', async () => {
        const error = new Error('Failed to fetch tasks');
        vi.mocked(mockTaskRepository.getByLearningPathId).mockRejectedValue(error);

        await expect(service.getTasks('path-1')).rejects.toThrow('Failed to fetch tasks');
      });
    });

    describe('getTask', () => {
      it('should call taskRepository.getById with correct id and return task', async () => {
        vi.mocked(mockTaskRepository.getById).mockResolvedValue(mockTask);

        const result = await service.getTask('task-1');

        expect(mockTaskRepository.getById).toHaveBeenCalledOnce();
        expect(mockTaskRepository.getById).toHaveBeenCalledWith('task-1');
        expect(result).toEqual(mockTask);
      });

      it('should return null when task does not exist', async () => {
        vi.mocked(mockTaskRepository.getById).mockResolvedValue(null);

        const result = await service.getTask('non-existent-task');

        expect(mockTaskRepository.getById).toHaveBeenCalledWith('non-existent-task');
        expect(result).toBeNull();
      });

      it('should handle various task ID formats', async () => {
        const taskId = 'task-uuid-456-def';
        vi.mocked(mockTaskRepository.getById).mockResolvedValue(mockTask);

        await service.getTask(taskId);

        expect(mockTaskRepository.getById).toHaveBeenCalledWith(taskId);
      });

      it('should propagate repository errors', async () => {
        const error = new Error('Database error');
        vi.mocked(mockTaskRepository.getById).mockRejectedValue(error);

        await expect(service.getTask('task-1')).rejects.toThrow('Database error');
      });
    });

    describe('searchTasks', () => {
      describe('Query only', () => {
        it('should search tasks with query only and empty filters', async () => {
          const mockSearchResults = [mockTask, mockTask2];
          vi.mocked(mockTaskRepository.search).mockResolvedValue(mockSearchResults);

          const result = await service.searchTasks('greeting', {});

          expect(mockTaskRepository.search).toHaveBeenCalledOnce();
          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'greeting',
          });
          expect(result).toEqual(mockSearchResults);
        });

        it('should search with empty query string', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([]);

          const result = await service.searchTasks('', {});

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: '',
          });
          expect(result).toEqual([]);
        });

        it('should handle special characters in query', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([]);

          await service.searchTasks('¿Cómo estás?', {});

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: '¿Cómo estás?',
          });
        });
      });

      describe('Query + single filter', () => {
        it('should search with topicId filter', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([mockTask]);

          const filters: TaskSearchFilters = { topicId: 'topic-1' };
          await service.searchTasks('spanish', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'spanish',
            topicId: 'topic-1',
          });
        });

        it('should search with learningPathId filter', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([mockTask]);

          const filters: TaskSearchFilters = { learningPathId: 'path-1' };
          await service.searchTasks('greetings', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'greetings',
            learningPathId: 'path-1',
          });
        });

        it('should search with difficulty filter - easy', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([mockTask]);

          const filters: TaskSearchFilters = { difficulty: 'easy' };
          await service.searchTasks('vocabulary', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'vocabulary',
            difficulty: 'easy',
          });
        });

        it('should search with difficulty filter - medium', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([mockTask3]);

          const filters: TaskSearchFilters = { difficulty: 'medium' };
          await service.searchTasks('numbers', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'numbers',
            difficulty: 'medium',
          });
        });

        it('should search with difficulty filter - hard', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([]);

          const filters: TaskSearchFilters = { difficulty: 'hard' };
          await service.searchTasks('advanced', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'advanced',
            difficulty: 'hard',
          });
        });

        it('should search with type filter', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([mockTask]);

          const filters: TaskSearchFilters = { type: 'multiple-choice' };
          await service.searchTasks('quiz', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'quiz',
            type: 'multiple-choice',
          });
        });

        it('should search with tags filter - single tag', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([mockTask, mockTask2]);

          const filters: TaskSearchFilters = { tags: ['greetings'] };
          await service.searchTasks('hello', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'hello',
            tags: ['greetings'],
          });
        });

        it('should search with tags filter - multiple tags', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([mockTask]);

          const filters: TaskSearchFilters = { tags: ['greetings', 'common-phrases'] };
          await service.searchTasks('basic', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'basic',
            tags: ['greetings', 'common-phrases'],
          });
        });

        it('should search with empty tags array', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([]);

          const filters: TaskSearchFilters = { tags: [] };
          await service.searchTasks('test', filters);

          // Empty array is truthy in JavaScript, so it gets included in the query
          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'test',
            tags: [],
          });
        });
      });

      describe('Query + multiple filters', () => {
        it('should search with topicId and difficulty filters', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([mockTask]);

          const filters: TaskSearchFilters = {
            topicId: 'topic-1',
            difficulty: 'easy',
          };
          await service.searchTasks('beginner', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'beginner',
            topicId: 'topic-1',
            difficulty: 'easy',
          });
        });

        it('should search with learningPathId and type filters', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([mockTask2]);

          const filters: TaskSearchFilters = {
            learningPathId: 'path-1',
            type: 'flashcard',
          };
          await service.searchTasks('vocabulary', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'vocabulary',
            learningPathId: 'path-1',
            type: 'flashcard',
          });
        });

        it('should search with difficulty and tags filters', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([mockTask]);

          const filters: TaskSearchFilters = {
            difficulty: 'easy',
            tags: ['greetings', 'vocabulary'],
          };
          await service.searchTasks('basic words', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'basic words',
            difficulty: 'easy',
            tags: ['greetings', 'vocabulary'],
          });
        });

        it('should search with topicId, learningPathId, and difficulty', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([mockTask]);

          const filters: TaskSearchFilters = {
            topicId: 'topic-1',
            learningPathId: 'path-1',
            difficulty: 'easy',
          };
          await service.searchTasks('spanish', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'spanish',
            topicId: 'topic-1',
            learningPathId: 'path-1',
            difficulty: 'easy',
          });
        });
      });

      describe('Query + all filters', () => {
        it('should search with all possible filters provided', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([mockTask]);

          const filters: TaskSearchFilters = {
            topicId: 'topic-1',
            learningPathId: 'path-1',
            difficulty: 'easy',
            type: 'multiple-choice',
            tags: ['greetings', 'common-phrases'],
          };
          await service.searchTasks('comprehensive search', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: 'comprehensive search',
            topicId: 'topic-1',
            learningPathId: 'path-1',
            difficulty: 'easy',
            type: 'multiple-choice',
            tags: ['greetings', 'common-phrases'],
          });
        });

        it('should return search results with all filters applied', async () => {
          const expectedResults = [mockTask];
          vi.mocked(mockTaskRepository.search).mockResolvedValue(expectedResults);

          const filters: TaskSearchFilters = {
            topicId: 'topic-1',
            learningPathId: 'path-1',
            difficulty: 'easy',
            type: 'multiple-choice',
            tags: ['greetings'],
          };
          const result = await service.searchTasks('test', filters);

          expect(result).toEqual(expectedResults);
          expect(result).toHaveLength(1);
        });
      });

      describe('Search query object structure', () => {
        it('should only include filters that are provided (undefined filters excluded)', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([]);

          const filters: TaskSearchFilters = {
            topicId: 'topic-1',
            // Other filters intentionally omitted
          };
          await service.searchTasks('test', filters);

          const expectedQuery = {
            text: 'test',
            topicId: 'topic-1',
          };
          expect(mockTaskRepository.search).toHaveBeenCalledWith(expectedQuery);
        });

        it('should handle falsy values correctly (0, false, empty string)', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([]);

          // Empty string for topicId should still be included if explicitly set
          const filters: TaskSearchFilters = {};
          await service.searchTasks('', filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: '',
          });
        });

        it('should preserve exact query structure without modification', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([]);

          const filters: TaskSearchFilters = {
            difficulty: 'medium',
            tags: ['tag1', 'tag2', 'tag3'],
          };
          const query = 'exact query string';

          await service.searchTasks(query, filters);

          expect(mockTaskRepository.search).toHaveBeenCalledWith({
            text: query,
            difficulty: 'medium',
            tags: ['tag1', 'tag2', 'tag3'],
          });
        });
      });

      describe('Error handling', () => {
        it('should propagate repository search errors', async () => {
          const error = new Error('Search index unavailable');
          vi.mocked(mockTaskRepository.search).mockRejectedValue(error);

          await expect(service.searchTasks('test', {})).rejects.toThrow('Search index unavailable');
        });

        it('should handle empty search results gracefully', async () => {
          vi.mocked(mockTaskRepository.search).mockResolvedValue([]);

          const filters: TaskSearchFilters = {
            topicId: 'topic-1',
            difficulty: 'hard',
            tags: ['non-existent-tag'],
          };
          const result = await service.searchTasks('impossible query', filters);

          expect(result).toEqual([]);
          expect(result).toHaveLength(0);
        });
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle sequential calls to different methods', async () => {
      vi.mocked(mockTopicRepository.getActive).mockResolvedValue([mockTopic]);
      vi.mocked(mockLearningPathRepository.getByTopicId).mockResolvedValue([mockLearningPath]);
      vi.mocked(mockTaskRepository.getByLearningPathId).mockResolvedValue([mockTask, mockTask2]);

      const topics = await service.getTopics();
      const paths = await service.getLearningPaths(topics[0].id);
      const tasks = await service.getTasks(paths[0].id);

      expect(topics).toHaveLength(1);
      expect(paths).toHaveLength(1);
      expect(tasks).toHaveLength(2);
    });

    it('should maintain state independence between calls', async () => {
      vi.mocked(mockTopicRepository.getById).mockResolvedValue(mockTopic);

      const result1 = await service.getTopic('topic-1');
      const result2 = await service.getTopic('topic-1');

      expect(result1).toEqual(mockTopic);
      expect(result2).toEqual(mockTopic);
      expect(mockTopicRepository.getById).toHaveBeenCalledTimes(2);
    });

    it('should handle parallel calls correctly', async () => {
      vi.mocked(mockTopicRepository.getById).mockResolvedValue(mockTopic);
      vi.mocked(mockLearningPathRepository.getById).mockResolvedValue(mockLearningPath);
      vi.mocked(mockTaskRepository.getById).mockResolvedValue(mockTask);

      const [topic, path, task] = await Promise.all([
        service.getTopic('topic-1'),
        service.getLearningPath('path-1'),
        service.getTask('task-1'),
      ]);

      expect(topic).toEqual(mockTopic);
      expect(path).toEqual(mockLearningPath);
      expect(task).toEqual(mockTask);
    });
  });

  describe('Edge cases', () => {
    it('should handle repository returning undefined instead of null', async () => {
      vi.mocked(mockTopicRepository.getById).mockResolvedValue(undefined as unknown as null);

      const result = await service.getTopic('undefined-case');

      expect(result).toBeUndefined();
    });

    it('should handle very long query strings', async () => {
      const longQuery = 'a'.repeat(10000);
      vi.mocked(mockTaskRepository.search).mockResolvedValue([]);

      await service.searchTasks(longQuery, {});

      expect(mockTaskRepository.search).toHaveBeenCalledWith({
        text: longQuery,
      });
    });

    it('should handle very large tag arrays', async () => {
      const largeTags = Array.from({ length: 100 }, (_, i) => `tag-${i}`);
      vi.mocked(mockTaskRepository.search).mockResolvedValue([]);

      const filters: TaskSearchFilters = { tags: largeTags };
      await service.searchTasks('test', filters);

      expect(mockTaskRepository.search).toHaveBeenCalledWith({
        text: 'test',
        tags: largeTags,
      });
    });
  });
});
