/**
 * Comprehensive Unit Tests for Supabase Repository Adapters
 *
 * Tests all 7 repository classes with complete coverage of:
 * - CRUD operations
 * - Error handling (PGRST116, authentication, general errors)
 * - Data mapping between database and domain models
 * - Special query methods (search, filtering, bulk operations)
 * - Date serialization and JSON type handling
 *
 * Target: 75%+ coverage (currently at 16.8%)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TopicRepository,
  LearningPathRepository,
  TaskRepository,
  UserProgressRepository,
  PracticeSessionRepository,
  AnswerHistoryRepository,
  SpacedRepetitionRepository,
} from '@/modules/storage/adapters/supabase-repositories';

// Mock the Supabase client module
vi.mock('@/modules/storage/supabase-client', () => {
  const mockSupabase = {
    from: vi.fn(),
  };

  return {
    supabase: mockSupabase,
    getCurrentUserId: vi.fn(() => 'test-user-id'),
  };
});

// Mock logger to avoid console output during tests
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { supabase, getCurrentUserId } from '@/modules/storage/supabase-client';

/**
 * Helper to create chainable Supabase query mock
 */
function createSupabaseMock(resolveWith: unknown): Record<string, any> {
  const chain: Record<string, any> = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    in: vi.fn(),
    not: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    contains: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    range: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };

  // All methods return the chain for chaining
  Object.keys(chain).forEach((key) => {
    if (key === 'single' || key === 'maybeSingle') {
      chain[key].mockResolvedValue(resolveWith);
    } else {
      chain[key].mockReturnValue(chain);
    }
  });

  // Make select, insert, update, delete, order, limit also resolvable (for when they're terminal)
  chain.select.mockResolvedValue = (value: unknown) => {
    chain.select.mockReturnValue(Promise.resolve(value));
    return chain.select;
  };
  chain.insert.mockResolvedValue = (value: unknown) => {
    chain.insert.mockReturnValue(Promise.resolve(value));
    return chain.insert;
  };
  chain.update.mockResolvedValue = (value: unknown) => {
    chain.update.mockReturnValue(Promise.resolve(value));
    return chain.update;
  };
  chain.delete.mockResolvedValue = (value: unknown) => {
    chain.delete.mockReturnValue(Promise.resolve(value));
    return chain.delete;
  };
  chain.order.mockResolvedValue = (value: unknown) => {
    chain.order.mockReturnValue(Promise.resolve(value));
    return chain.order;
  };
  chain.limit.mockResolvedValue = (value: unknown) => {
    chain.limit.mockReturnValue(Promise.resolve(value));
    return chain.limit;
  };
  chain.upsert.mockResolvedValue = (value: unknown) => {
    chain.upsert.mockReturnValue(Promise.resolve(value));
    return chain.upsert;
  };

  // Some methods can be both chainable and terminal - use a promise that has chain methods
  const makeChainablePromise = (promise: Promise<any>) => {
    return Object.assign(promise, chain);
  };

  // Redefine methods to return chainable promises
  chain.select = vi.fn(() => makeChainablePromise(Promise.resolve(resolveWith)));
  chain.insert = vi.fn(() => makeChainablePromise(Promise.resolve(resolveWith)));
  chain.update = vi.fn(() => makeChainablePromise(Promise.resolve(resolveWith)));
  chain.delete = vi.fn(() => makeChainablePromise(Promise.resolve(resolveWith)));
  chain.upsert = vi.fn(() => makeChainablePromise(Promise.resolve(resolveWith)));
  chain.order = vi.fn(() => makeChainablePromise(Promise.resolve(resolveWith)));
  chain.limit = vi.fn(() => makeChainablePromise(Promise.resolve(resolveWith)));
  chain.eq = vi.fn(() => chain);
  chain.neq = vi.fn(() => chain);
  chain.in = vi.fn(() => chain);
  chain.not = vi.fn(() => chain);
  chain.gte = vi.fn(() => chain);
  chain.lte = vi.fn(() => chain);
  chain.contains = vi.fn(() => chain);
  chain.range = vi.fn(() => chain);
  chain.single = vi.fn(() => Promise.resolve(resolveWith));
  chain.maybeSingle = vi.fn(() => Promise.resolve(resolveWith));

  return chain;
}

describe('TopicRepository', () => {
  let repository: TopicRepository;

  beforeEach(() => {
    repository = new TopicRepository();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all active topics ordered by title', async () => {
      const mockTopics = [
        {
          id: 'topic-1',
          title: 'Math',
          description: 'Mathematics topics',
          learning_path_ids: ['path-1', 'path-2'],
          metadata: { estimatedHours: 20, difficultyLevel: 'beginner', prerequisites: [] },
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockTopics, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const topics = await repository.getAll();

      expect(supabase.from).toHaveBeenCalledWith('topics');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('is_active', true);
      expect(mockChain.order).toHaveBeenCalledWith('title');
      expect(topics).toHaveLength(1);
      expect(topics[0].id).toBe('topic-1');
      expect(topics[0].learningPathIds).toEqual(['path-1', 'path-2']);
    });

    it('should handle empty results', async () => {
      const mockChain = createSupabaseMock({ data: [], error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const topics = await repository.getAll();

      expect(topics).toEqual([]);
    });

    it('should throw error on database failure', async () => {
      const mockError = { message: 'Database connection failed', code: 'DB_ERROR' };
      const mockChain = createSupabaseMock({ data: null, error: mockError });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await expect(repository.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should fetch topic by ID', async () => {
      const mockTopic = {
        id: 'topic-1',
        title: 'Biology',
        description: 'Biology topics',
        learning_path_ids: [],
        metadata: { estimatedHours: 15, difficultyLevel: 'intermediate', prerequisites: ['topic-0'] },
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockTopic, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const topic = await repository.getById('topic-1');

      expect(mockChain.single).toHaveBeenCalled();
      expect(topic).not.toBeNull();
      expect(topic?.id).toBe('topic-1');
      expect(topic?.metadata.difficultyLevel).toBe('intermediate');
    });

    it('should return null for PGRST116 error (not found)', async () => {
      const mockChain = createSupabaseMock({ data: null, error: { code: 'PGRST116' } });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const topic = await repository.getById('non-existent');

      expect(topic).toBeNull();
    });

    it('should throw error on other database errors', async () => {
      const mockError = { message: 'Permission denied', code: 'PGRST301' };
      const mockChain = createSupabaseMock({ data: null, error: mockError });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await expect(repository.getById('topic-1')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create new topic', async () => {
      const newTopic = {
        id: 'topic-new',
        title: 'Chemistry',
        description: 'Chemistry topics',
        learningPathIds: ['path-3'],
        metadata: { estimatedHours: 25, difficultyLevel: 'advanced' as const, prerequisites: ['topic-1'] },
        isActive: true,
      };

      const mockCreated = {
        ...newTopic,
        learning_path_ids: newTopic.learningPathIds,
        is_active: newTopic.isActive,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockCreated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const created = await repository.create(newTopic);

      expect(mockChain.insert).toHaveBeenCalledWith({
        id: newTopic.id,
        title: newTopic.title,
        description: newTopic.description,
        learning_path_ids: newTopic.learningPathIds,
        metadata: newTopic.metadata,
        is_active: newTopic.isActive,
      });
      expect(created.id).toBe('topic-new');
      expect(created.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('update', () => {
    it('should update topic with partial data', async () => {
      const updates = { title: 'Updated Math', isActive: false };
      const mockUpdated = {
        id: 'topic-1',
        title: 'Updated Math',
        description: 'Original description',
        learning_path_ids: [],
        metadata: {},
        is_active: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const updated = await repository.update('topic-1', updates);

      expect(mockChain.update).toHaveBeenCalledWith({
        title: 'Updated Math',
        is_active: false,
      });
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'topic-1');
      expect(updated.title).toBe('Updated Math');
      expect(updated.isActive).toBe(false);
    });

    it('should handle updating all fields', async () => {
      const updates = {
        title: 'New Title',
        description: 'New Description',
        learningPathIds: ['new-path'],
        metadata: { estimatedHours: 30, difficultyLevel: 'beginner' as const, prerequisites: [] },
        isActive: true,
      };

      const mockUpdated = {
        id: 'topic-1',
        title: updates.title,
        description: updates.description,
        learning_path_ids: updates.learningPathIds,
        metadata: updates.metadata,
        is_active: updates.isActive,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const updated = await repository.update('topic-1', updates);

      expect(updated.title).toBe('New Title');
      expect(updated.learningPathIds).toEqual(['new-path']);
    });
  });

  describe('delete', () => {
    it('should delete topic', async () => {
      const mockChain = createSupabaseMock({ error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.delete('topic-1');

      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'topic-1');
    });

    it('should throw error on delete failure', async () => {
      const mockError = { message: 'Foreign key constraint', code: 'FK_ERROR' };
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockRejectedValue(mockError),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await expect(repository.delete('topic-1')).rejects.toThrow();
    });
  });

  describe('count', () => {
    it('should count active topics', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 42, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const count = await repository.count();

      expect(mockChain.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(count).toBe(42);
    });


    it('should return 0 when count is null', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const count = await repository.count();

      expect(count).toBe(0);
    });
  });

  describe('mapFromDb', () => {
    it('should handle null learning_path_ids', async () => {
      const mockTopic = {
        id: 'topic-1',
        title: 'Test',
        description: 'Test',
        learning_path_ids: null,
        metadata: {},
        is_active: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockTopic, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const topic = await repository.getById('topic-1');

      expect(topic?.learningPathIds).toEqual([]);
      expect(topic?.isActive).toBe(true);
    });
  });
});

describe('LearningPathRepository', () => {
  let repository: LearningPathRepository;

  beforeEach(() => {
    repository = new LearningPathRepository();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all active learning paths', async () => {
      const mockPaths = [
        {
          id: 'path-1',
          topic_id: 'topic-1',
          title: 'Algebra Basics',
          description: 'Learn basic algebra',
          difficulty: 'easy',
          task_ids: ['task-1', 'task-2'],
          estimated_time: 1800,
          requirements: { minimumAccuracy: 70, requiredTasks: 5 },
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockPaths, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const paths = await repository.getAll();

      expect(supabase.from).toHaveBeenCalledWith('learning_paths');
      expect(mockChain.eq).toHaveBeenCalledWith('is_active', true);
      expect(paths).toHaveLength(1);
      expect(paths[0].difficulty).toBe('easy');
    });
  });

  describe('getById', () => {
    it('should fetch learning path by ID', async () => {
      const mockPath = {
        id: 'path-1',
        topic_id: 'topic-1',
        title: 'Advanced Calculus',
        description: 'Calculus course',
        difficulty: 'hard',
        task_ids: ['task-1'],
        estimated_time: 3600,
        requirements: { minimumAccuracy: 80, requiredTasks: 10 },
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockPath, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const path = await repository.getById('path-1');

      expect(path?.difficulty).toBe('hard');
      expect(path?.estimatedTime).toBe(3600);
    });

    it('should return null for PGRST116 error', async () => {
      const mockChain = createSupabaseMock({ data: null, error: { code: 'PGRST116' } });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const path = await repository.getById('non-existent');

      expect(path).toBeNull();
    });
  });

  describe('getByTopicId', () => {
    it('should fetch learning paths by topic ID', async () => {
      const mockPaths = [
        {
          id: 'path-1',
          topic_id: 'topic-math',
          title: 'Path 1',
          description: 'Description 1',
          difficulty: 'easy',
          task_ids: [],
          estimated_time: 1800,
          requirements: { minimumAccuracy: 70, requiredTasks: 5 },
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
        {
          id: 'path-2',
          topic_id: 'topic-math',
          title: 'Path 2',
          description: 'Description 2',
          difficulty: 'medium',
          task_ids: [],
          estimated_time: 2400,
          requirements: { minimumAccuracy: 75, requiredTasks: 7 },
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockPaths, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const paths = await repository.getByTopicId('topic-math');

      expect(mockChain.eq).toHaveBeenCalledWith('topic_id', 'topic-math');
      expect(paths).toHaveLength(2);
      expect(paths.every(p => p.topicId === 'topic-math')).toBe(true);
    });
  });

  describe('create', () => {
    it('should create new learning path', async () => {
      const newPath = {
        id: 'path-new',
        topicId: 'topic-1',
        title: 'New Path',
        description: 'New description',
        difficulty: 'medium' as const,
        taskIds: ['task-1'],
        estimatedTime: 2000,
        requirements: { minimumAccuracy: 75, requiredTasks: 8 },
        isActive: true,
      };

      const mockCreated = {
        ...newPath,
        topic_id: newPath.topicId,
        task_ids: newPath.taskIds,
        estimated_time: newPath.estimatedTime,
        is_active: newPath.isActive,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockCreated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const created = await repository.create(newPath);

      expect(created.id).toBe('path-new');
      expect(created.difficulty).toBe('medium');
    });
  });

  describe('update', () => {
    it('should update learning path', async () => {
      const updates = { title: 'Updated Title', difficulty: 'hard' as const };
      const mockUpdated = {
        id: 'path-1',
        topic_id: 'topic-1',
        title: 'Updated Title',
        description: 'Original',
        difficulty: 'hard',
        task_ids: [],
        estimated_time: 1800,
        requirements: {},
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const updated = await repository.update('path-1', updates);

      expect(updated.title).toBe('Updated Title');
      expect(updated.difficulty).toBe('hard');
    });
  });

  describe('delete', () => {
    it('should delete learning path', async () => {
      const mockChain = createSupabaseMock({ error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.delete('path-1');

      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'path-1');
    });
  });
});

describe('TaskRepository', () => {
  let repository: TaskRepository;

  beforeEach(() => {
    repository = new TaskRepository();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all tasks', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          learning_path_id: 'path-1',
          template_id: 'template-1',
          type: 'multiple-choice',
          content: { question: 'What is 2+2?', options: ['3', '4', '5'], correctAnswer: 1 },
          metadata: { difficulty: 'easy', tags: ['math'], estimatedTime: 60, points: 10 },
          has_audio: false,
          audio_url: null,
          language: null,
          ipa: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockTasks, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const tasks = await repository.getAll();

      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(tasks).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should fetch task by ID', async () => {
      const mockTask = {
        id: 'task-1',
        learning_path_id: 'path-1',
        template_id: 'template-1',
        type: 'true-false',
        content: { statement: 'The earth is flat', correctAnswer: false },
        metadata: { difficulty: 'easy', tags: ['science'], estimatedTime: 30, points: 5 },
        has_audio: true,
        audio_url: '/audio/question.mp3',
        language: 'English',
        ipa: '[ˈɜːθ]',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockTask, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const task = await repository.getById('task-1');

      expect(task?.hasAudio).toBe(true);
      expect(task?.audioUrl).toBe('/audio/question.mp3');
      expect(task?.language).toBe('English');
    });

    it('should return null for PGRST116 error', async () => {
      const mockChain = createSupabaseMock({ data: null, error: { code: 'PGRST116' } });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const task = await repository.getById('non-existent');

      expect(task).toBeNull();
    });
  });

  describe('getByLearningPathId', () => {
    it('should fetch tasks by learning path ID', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          learning_path_id: 'path-1',
          template_id: null,
          type: 'multiple-choice',
          content: {},
          metadata: { difficulty: 'easy', tags: [], estimatedTime: 60, points: 10 },
          has_audio: false,
          audio_url: null,
          language: null,
          ipa: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockTasks, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const tasks = await repository.getByLearningPathId('path-1');

      expect(mockChain.eq).toHaveBeenCalledWith('learning_path_id', 'path-1');
      expect(tasks).toHaveLength(1);
    });
  });

  describe('getByIds', () => {
    it('should fetch tasks by multiple IDs', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          learning_path_id: 'path-1',
          template_id: null,
          type: 'multiple-choice',
          content: {},
          metadata: { difficulty: 'easy', tags: [], estimatedTime: 60, points: 10 },
          has_audio: false,
          audio_url: null,
          language: null,
          ipa: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockTasks, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const tasks = await repository.getByIds(['task-1', 'task-2']);

      expect(mockChain.in).toHaveBeenCalledWith('id', ['task-1', 'task-2']);
      expect(tasks).toHaveLength(1);
    });

    it('should return empty array for empty IDs', async () => {
      const tasks = await repository.getByIds([]);

      expect(tasks).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create new task', async () => {
      const newTask = {
        id: 'task-new',
        learningPathId: 'path-1',
        templateId: 'template-1',
        type: 'flashcard' as const,
        content: { front: 'Hello', back: 'Hola', frontLanguage: 'en', backLanguage: 'es' },
        metadata: { difficulty: 'easy' as const, tags: ['vocab'], estimatedTime: 45, points: 5 },
        hasAudio: true,
        audioUrl: '/audio/hello.mp3',
        language: 'Spanish',
        ipa: null,
      };

      const mockCreated = {
        ...newTask,
        learning_path_id: newTask.learningPathId,
        template_id: newTask.templateId,
        has_audio: newTask.hasAudio,
        audio_url: newTask.audioUrl,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockCreated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const created = await repository.create(newTask);

      expect(created.id).toBe('task-new');
      expect(created.hasAudio).toBe(true);
    });
  });

  describe('createMany', () => {
    it('should create multiple tasks', async () => {
      const newTasks = [
        {
          id: 'task-1',
          learningPathId: 'path-1',
          templateId: 'template-1',
          type: 'multiple-choice' as const,
          content: {},
          metadata: { difficulty: 'easy' as const, tags: [], estimatedTime: 60, points: 10 },
        },
        {
          id: 'task-2',
          learningPathId: 'path-1',
          templateId: 'template-1',
          type: 'true-false' as const,
          content: {},
          metadata: { difficulty: 'medium' as const, tags: [], estimatedTime: 45, points: 8 },
        },
      ];

      const mockCreated = newTasks.map(task => ({
        ...task,
        learning_path_id: task.learningPathId,
        template_id: task.templateId,
        has_audio: false,
        audio_url: null,
        language: null,
        ipa: null,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      }));

      const mockChain = createSupabaseMock({ data: mockCreated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const created = await repository.createMany(newTasks);

      expect(created).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update task', async () => {
      const updates = {
        hasAudio: true,
        audioUrl: '/audio/new.mp3',
        metadata: { difficulty: 'hard' as const, tags: ['advanced'], estimatedTime: 120, points: 20 },
      };

      const mockUpdated = {
        id: 'task-1',
        learning_path_id: 'path-1',
        template_id: 'template-1',
        type: 'multiple-choice',
        content: {},
        metadata: updates.metadata,
        has_audio: true,
        audio_url: '/audio/new.mp3',
        language: null,
        ipa: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const updated = await repository.update('task-1', updates);

      expect(updated.hasAudio).toBe(true);
      expect(updated.metadata.difficulty).toBe('hard');
    });
  });

  describe('delete', () => {
    it('should delete task', async () => {
      const mockChain = createSupabaseMock({ error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.delete('task-1');

      expect(mockChain.delete).toHaveBeenCalled();
    });
  });

  describe('getRandomTasks', () => {
    it('should fetch random tasks with filters', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          learning_path_id: 'path-1',
          template_id: null,
          type: 'multiple-choice',
          content: {},
          metadata: { difficulty: 'easy', tags: [], estimatedTime: 60, points: 10 },
          has_audio: false,
          audio_url: null,
          language: null,
          ipa: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
        {
          id: 'task-2',
          learning_path_id: 'path-1',
          template_id: null,
          type: 'true-false',
          content: {},
          metadata: { difficulty: 'easy', tags: [], estimatedTime: 30, points: 5 },
          has_audio: false,
          audio_url: null,
          language: null,
          ipa: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockTasks, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const tasks = await repository.getRandomTasks(2, {
        learningPathIds: ['path-1'],
        difficulty: 'easy',
        deterministic: true,
      });

      expect(mockChain.in).toHaveBeenCalledWith('learning_path_id', ['path-1']);
      expect(tasks).toHaveLength(2);
    });

    it('should handle repetition when count exceeds available tasks', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          learning_path_id: 'path-1',
          template_id: null,
          type: 'multiple-choice',
          content: {},
          metadata: { difficulty: 'easy', tags: [], estimatedTime: 60, points: 10 },
          has_audio: false,
          audio_url: null,
          language: null,
          ipa: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockTasks, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const tasks = await repository.getRandomTasks(5, { deterministic: true });

      expect(tasks).toHaveLength(5);
      expect(tasks[0].id).toBe('task-1');
      expect(tasks[1].id).toBe('task-1'); // Repeated
    });

    it('should return empty array when no tasks available', async () => {
      const mockChain = createSupabaseMock({ data: [], error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const tasks = await repository.getRandomTasks(5);

      expect(tasks).toEqual([]);
    });

    it('should exclude specified task IDs', async () => {
      const mockTasks = [
        {
          id: 'task-2',
          learning_path_id: 'path-1',
          template_id: null,
          type: 'multiple-choice',
          content: {},
          metadata: { difficulty: 'easy', tags: [], estimatedTime: 60, points: 10 },
          has_audio: false,
          audio_url: null,
          language: null,
          ipa: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockTasks, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.getRandomTasks(1, { excludeIds: ['task-1'] });

      expect(mockChain.not).toHaveBeenCalledWith('id', 'in', '(task-1)');
    });
  });

  describe('count', () => {
    it('should count all tasks', async () => {
      const mockChain = createSupabaseMock({ count: 100, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const count = await repository.count();

      expect(count).toBe(100);
    });
  });

  describe('getByType', () => {
    it('should fetch tasks by type', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          learning_path_id: 'path-1',
          template_id: null,
          type: 'flashcard',
          content: {},
          metadata: { difficulty: 'easy', tags: [], estimatedTime: 60, points: 10 },
          has_audio: false,
          audio_url: null,
          language: null,
          ipa: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockTasks, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const _tasks = await repository.getByType('flashcard');

      expect(mockChain.eq).toHaveBeenCalledWith('type', 'flashcard');
    });
  });

  describe('getByDifficulty', () => {
    it('should fetch tasks by difficulty', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          learning_path_id: 'path-1',
          template_id: null,
          type: 'multiple-choice',
          content: {},
          metadata: { difficulty: 'hard', tags: [], estimatedTime: 120, points: 20 },
          has_audio: false,
          audio_url: null,
          language: null,
          ipa: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockTasks, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const _tasks = await repository.getByDifficulty('hard');

      expect(mockChain.eq).toHaveBeenCalledWith('metadata->>difficulty', 'hard');
    });
  });

  describe('getByTags', () => {
    it('should fetch tasks by tags', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          learning_path_id: 'path-1',
          template_id: null,
          type: 'multiple-choice',
          content: {},
          metadata: { difficulty: 'easy', tags: ['math', 'algebra'], estimatedTime: 60, points: 10 },
          has_audio: false,
          audio_url: null,
          language: null,
          ipa: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockTasks, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const _tasks = await repository.getByTags(['math']);

      expect(mockChain.contains).toHaveBeenCalledWith('metadata->tags', ['math']);
    });

    it('should return empty array for empty tags', async () => {
      const tasks = await repository.getByTags([]);

      expect(tasks).toEqual([]);
    });
  });

  describe('search', () => {
    it('should search tasks with all filters', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          learning_path_id: 'path-1',
          template_id: null,
          type: 'multiple-choice',
          content: {},
          metadata: { difficulty: 'easy', tags: ['math'], estimatedTime: 60, points: 10 },
          has_audio: false,
          audio_url: null,
          language: null,
          ipa: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockTasks, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const _tasks = await repository.search({
        learningPathId: 'path-1',
        type: 'multiple-choice',
        difficulty: 'easy',
        tags: ['math'],
        limit: 10,
        offset: 5,
      });

      expect(mockChain.eq).toHaveBeenCalledWith('learning_path_id', 'path-1');
      expect(mockChain.eq).toHaveBeenCalledWith('type', 'multiple-choice');
      expect(mockChain.eq).toHaveBeenCalledWith('metadata->>difficulty', 'easy');
      expect(mockChain.limit).toHaveBeenCalledWith(10);
      expect(mockChain.range).toHaveBeenCalledWith(5, 14);
    });

    it('should search with pagination', async () => {
      const mockChain = createSupabaseMock({ data: [], error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.search({ limit: 20, offset: 40 });

      expect(mockChain.range).toHaveBeenCalledWith(40, 59);
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple tasks', async () => {
      const mockChain = createSupabaseMock({ error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.deleteMany(['task-1', 'task-2']);

      expect(mockChain.in).toHaveBeenCalledWith('id', ['task-1', 'task-2']);
    });

    it('should not call database for empty array', async () => {
      await repository.deleteMany([]);

      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    it('should return true if task exists', async () => {
      const mockTask = {
        id: 'task-1',
        learning_path_id: 'path-1',
        template_id: null,
        type: 'multiple-choice',
        content: {},
        metadata: { difficulty: 'easy', tags: [], estimatedTime: 60, points: 10 },
        has_audio: false,
        audio_url: null,
        language: null,
        ipa: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockTask, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const exists = await repository.exists('task-1');

      expect(exists).toBe(true);
    });

    it('should return false if task does not exist', async () => {
      const mockChain = createSupabaseMock({ data: null, error: { code: 'PGRST116' } });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const exists = await repository.exists('non-existent');

      expect(exists).toBe(false);
    });
  });
});

describe('UserProgressRepository', () => {
  let repository: UserProgressRepository;

  beforeEach(() => {
    repository = new UserProgressRepository();
    vi.clearAllMocks();
    vi.mocked(getCurrentUserId).mockResolvedValue('test-user-id');
  });

  describe('getAll', () => {
    it('should fetch all progress for current user', async () => {
      const mockProgress = [
        {
          id: 'progress-1',
          user_id: 'test-user-id',
          topic_id: 'topic-1',
          learning_path_id: 'path-1',
          statistics: { tasksCompleted: 10, correctAnswers: 8, incorrectAnswers: 2, totalTime: 600000, averageAccuracy: 80, streak: 5 },
          milestones: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockProgress, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const progress = await repository.getAll();

      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(progress).toHaveLength(1);
    });

    it('should throw error if user not authenticated', async () => {
      vi.mocked(getCurrentUserId).mockResolvedValue(null);

      await expect(repository.getAll()).rejects.toThrow('User not authenticated');
    });
  });

  describe('getByLearningPathId', () => {
    it('should fetch progress by learning path ID', async () => {
      const mockProgress = {
        id: 'progress-1',
        user_id: 'test-user-id',
        topic_id: 'topic-1',
        learning_path_id: 'path-1',
        statistics: { tasksCompleted: 5, correctAnswers: 4, incorrectAnswers: 1, totalTime: 300000, averageAccuracy: 80, streak: 3 },
        milestones: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockProgress, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const progress = await repository.getByLearningPathId('path-1');

      expect(mockChain.eq).toHaveBeenCalledWith('learning_path_id', 'path-1');
      expect(progress?.learningPathId).toBe('path-1');
    });

    it('should return null for PGRST116 error', async () => {
      const mockChain = createSupabaseMock({ data: null, error: { code: 'PGRST116' } });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const progress = await repository.getByLearningPathId('non-existent');

      expect(progress).toBeNull();
    });

    it('should throw error if user not authenticated', async () => {
      vi.mocked(getCurrentUserId).mockResolvedValue(null);

      await expect(repository.getByLearningPathId('path-1')).rejects.toThrow('User not authenticated');
    });
  });

  describe('getByTopicId', () => {
    it('should fetch progress by topic ID', async () => {
      const mockProgress = [
        {
          id: 'progress-1',
          user_id: 'test-user-id',
          topic_id: 'topic-1',
          learning_path_id: 'path-1',
          statistics: {},
          milestones: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockProgress, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const progress = await repository.getByTopicId('topic-1');

      expect(mockChain.eq).toHaveBeenCalledWith('topic_id', 'topic-1');
      expect(progress).toHaveLength(1);
    });
  });

  describe('upsert', () => {
    it('should upsert progress', async () => {
      const newProgress = {
        topicId: 'topic-1',
        learningPathId: 'path-1',
        statistics: { tasksCompleted: 15, correctAnswers: 12, incorrectAnswers: 3, totalTime: 900000, averageAccuracy: 80, streak: 8 },
        milestones: { firstTaskCompleted: new Date(), lastActivity: new Date(), achievements: [] },
      };

      const mockUpserted = {
        id: 'progress-1',
        user_id: 'test-user-id',
        topic_id: newProgress.topicId,
        learning_path_id: newProgress.learningPathId,
        statistics: newProgress.statistics,
        milestones: newProgress.milestones,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpserted, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const upserted = await repository.upsert(newProgress);

      expect(mockChain.upsert).toHaveBeenCalled();
      expect(upserted.statistics.tasksCompleted).toBe(15);
    });

    it('should throw error if user not authenticated', async () => {
      vi.mocked(getCurrentUserId).mockResolvedValue(null);

      await expect(repository.upsert({
        topicId: 'topic-1',
        learningPathId: 'path-1',
        statistics: { tasksCompleted: 0, correctAnswers: 0, incorrectAnswers: 0, totalTime: 0, averageAccuracy: 0, streak: 0 },
        milestones: {},
      })).rejects.toThrow('User not authenticated');
    });
  });

  describe('delete', () => {
    it('should delete progress', async () => {
      const mockChain = createSupabaseMock({ error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.delete('path-1');

      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('learning_path_id', 'path-1');
    });
  });
});

describe('PracticeSessionRepository', () => {
  let repository: PracticeSessionRepository;

  beforeEach(() => {
    repository = new PracticeSessionRepository();
    vi.clearAllMocks();
    vi.mocked(getCurrentUserId).mockResolvedValue('test-user-id');
  });

  describe('getAll', () => {
    it('should fetch all sessions for current user', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          user_id: 'test-user-id',
          learning_path_id: 'path-1',
          task_ids: ['task-1', 'task-2'],
          execution: { taskIds: ['task-1', 'task-2'], completedCount: 1, correctCount: 1, status: 'active', totalTimeSpent: 60 },
          progress: null,
          configuration: { topicId: 'topic-1', learningPathIds: ['path-1'], targetCount: 2, includeReview: false },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockSessions, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const sessions = await repository.getAll();

      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(sessions).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should fetch session by ID', async () => {
      const mockSession = {
        id: 'session-1',
        user_id: 'test-user-id',
        learning_path_id: 'path-1',
        task_ids: ['task-1'],
        execution: { taskIds: ['task-1'], completedCount: 0, correctCount: 0, status: 'planned', totalTimeSpent: 0 },
        progress: null,
        configuration: { topicId: 'topic-1', learningPathIds: ['path-1'], targetCount: 1, includeReview: false },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockSession, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const session = await repository.getById('session-1');

      expect(mockChain.eq).toHaveBeenCalledWith('id', 'session-1');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(session?.id).toBe('session-1');
    });

    it('should return null for PGRST116 error', async () => {
      const mockChain = createSupabaseMock({ data: null, error: { code: 'PGRST116' } });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const session = await repository.getById('non-existent');

      expect(session).toBeNull();
    });
  });

  describe('getActiveSession', () => {
    it('should fetch active session with maybeSingle', async () => {
      const mockSession = {
        id: 'session-1',
        user_id: 'test-user-id',
        learning_path_id: 'path-1',
        task_ids: ['task-1'],
        execution: { taskIds: ['task-1'], completedCount: 0, correctCount: 0, status: 'active', totalTimeSpent: 0 },
        progress: null,
        configuration: { topicId: 'topic-1', learningPathIds: ['path-1'], targetCount: 1, includeReview: false },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockSession, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const session = await repository.getActiveSession('path-1');

      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockChain.eq).toHaveBeenCalledWith('learning_path_id', 'path-1');
      expect(mockChain.in).toHaveBeenCalledWith('execution->>status', ['planned', 'active', 'paused']);
      expect(mockChain.maybeSingle).toHaveBeenCalled();
      expect(session?.execution.status).toBe('active');
    });

    it('should return null when no active session', async () => {
      const mockChain = createSupabaseMock({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const session = await repository.getActiveSession('path-1');

      expect(session).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new session with date serialization', async () => {
      const newSession = {
        execution: {
          taskIds: ['task-1', 'task-2'],
          completedCount: 0,
          correctCount: 0,
          status: 'planned' as const,
          totalTimeSpent: 0,
          startedAt: new Date('2024-01-01T10:00:00Z'),
          completedAt: new Date('2024-01-01T11:00:00Z'),
        },
        configuration: {
          topicId: 'topic-1',
          learningPathIds: ['path-1'],
          targetCount: 2,
          includeReview: false,
        },
      };

      const mockCreated = {
        id: 'session-new',
        user_id: 'test-user-id',
        learning_path_id: 'path-1',
        task_ids: newSession.execution.taskIds,
        execution: {
          ...newSession.execution,
          startedAt: newSession.execution.startedAt?.toISOString(),
          completedAt: newSession.execution.completedAt?.toISOString(),
        },
        progress: null,
        configuration: newSession.configuration,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockCreated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const created = await repository.create(newSession);

      expect(created.id).toBe('session-new');
    });
  });

  describe('update', () => {
    it('should update session with date serialization', async () => {
      const updates = {
        execution: {
          taskIds: ['task-1', 'task-2'],
          completedCount: 2,
          correctCount: 1,
          status: 'completed' as const,
          totalTimeSpent: 120,
          startedAt: new Date('2024-01-01T10:00:00Z'),
          completedAt: new Date('2024-01-01T11:00:00Z'),
        },
      };

      const mockUpdated = {
        id: 'session-1',
        user_id: 'test-user-id',
        learning_path_id: 'path-1',
        task_ids: updates.execution.taskIds,
        execution: {
          ...updates.execution,
          startedAt: updates.execution.startedAt?.toISOString(),
          completedAt: updates.execution.completedAt?.toISOString(),
        },
        progress: null,
        configuration: { topicId: 'topic-1', learningPathIds: ['path-1'], targetCount: 2, includeReview: false },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T12:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const updated = await repository.update('session-1', updates);

      expect(updated.execution.status).toBe('completed');
    });
  });

  describe('updateStatus', () => {
    it('should update session status', async () => {
      const existingSession = {
        id: 'session-1',
        user_id: 'test-user-id',
        learning_path_id: 'path-1',
        task_ids: ['task-1'],
        execution: { taskIds: ['task-1'], completedCount: 0, correctCount: 0, status: 'active', totalTimeSpent: 0, startedAt: new Date('2024-01-01T10:00:00Z') },
        progress: null,
        configuration: { topicId: 'topic-1', learningPathIds: ['path-1'], targetCount: 1, includeReview: false },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain1 = createSupabaseMock({ data: existingSession, error: null });
      const mockChain2 = createSupabaseMock({ data: existingSession, error: null });
      vi.mocked(supabase.from).mockReturnValueOnce(mockChain1).mockReturnValueOnce(mockChain2);

      await repository.updateStatus('session-1', 'completed');

      expect(mockChain2.update).toHaveBeenCalled();
    });

    it('should set completedAt when status is completed', async () => {
      const existingSession = {
        id: 'session-1',
        user_id: 'test-user-id',
        learning_path_id: 'path-1',
        task_ids: ['task-1'],
        execution: { taskIds: ['task-1'], completedCount: 1, correctCount: 1, status: 'active', totalTimeSpent: 60, startedAt: new Date('2024-01-01T10:00:00Z') },
        progress: null,
        configuration: { topicId: 'topic-1', learningPathIds: ['path-1'], targetCount: 1, includeReview: false },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain1 = createSupabaseMock({ data: existingSession, error: null });
      const mockChain2 = createSupabaseMock({ data: existingSession, error: null });
      vi.mocked(supabase.from).mockReturnValueOnce(mockChain1).mockReturnValueOnce(mockChain2);

      await repository.updateStatus('session-1', 'completed');

      const updateCall = mockChain2.update.mock.calls[0][0] as any;
      expect(updateCall.execution.status).toBe('completed');
      expect(updateCall.execution.completedAt).toBeDefined();
    });
  });

  describe('incrementProgress', () => {
    it('should increment progress correctly', async () => {
      const existingSession = {
        id: 'session-1',
        user_id: 'test-user-id',
        learning_path_id: 'path-1',
        task_ids: ['task-1', 'task-2'],
        execution: { taskIds: ['task-1', 'task-2'], completedCount: 0, correctCount: 0, status: 'active', totalTimeSpent: 0, startedAt: new Date('2024-01-01T10:00:00Z') },
        progress: null,
        configuration: { topicId: 'topic-1', learningPathIds: ['path-1'], targetCount: 2, includeReview: false },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain1 = createSupabaseMock({ data: existingSession, error: null });
      const mockChain2 = createSupabaseMock({ data: existingSession, error: null });
      vi.mocked(supabase.from).mockReturnValueOnce(mockChain1).mockReturnValueOnce(mockChain2);

      await repository.incrementProgress('session-1', true, 30);

      const updateCall = mockChain2.update.mock.calls[0][0] as any;
      expect(updateCall.execution.completedCount).toBe(1);
      expect(updateCall.execution.correctCount).toBe(1);
      expect(updateCall.execution.totalTimeSpent).toBe(30);
    });

    it('should increment incorrectly answered tasks', async () => {
      const existingSession = {
        id: 'session-1',
        user_id: 'test-user-id',
        learning_path_id: 'path-1',
        task_ids: ['task-1'],
        execution: { taskIds: ['task-1'], completedCount: 1, correctCount: 1, status: 'active', totalTimeSpent: 30, startedAt: new Date('2024-01-01T10:00:00Z') },
        progress: null,
        configuration: { topicId: 'topic-1', learningPathIds: ['path-1'], targetCount: 2, includeReview: false },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain1 = createSupabaseMock({ data: existingSession, error: null });
      const mockChain2 = createSupabaseMock({ data: existingSession, error: null });
      vi.mocked(supabase.from).mockReturnValueOnce(mockChain1).mockReturnValueOnce(mockChain2);

      await repository.incrementProgress('session-1', false, 45);

      const updateCall = mockChain2.update.mock.calls[0][0] as any;
      expect(updateCall.execution.completedCount).toBe(2);
      expect(updateCall.execution.correctCount).toBe(1); // Not incremented
      expect(updateCall.execution.totalTimeSpent).toBe(75);
    });
  });

  describe('getByStatus', () => {
    it('should fetch sessions by status', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          user_id: 'test-user-id',
          learning_path_id: 'path-1',
          task_ids: ['task-1'],
          execution: { taskIds: ['task-1'], completedCount: 1, correctCount: 1, status: 'completed', totalTimeSpent: 60 },
          progress: null,
          configuration: { topicId: 'topic-1', learningPathIds: ['path-1'], targetCount: 1, includeReview: false },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockSessions, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const _sessions = await repository.getByStatus('completed');

      expect(mockChain.eq).toHaveBeenCalledWith('execution->>status', 'completed');
    });
  });

  describe('delete', () => {
    it('should delete session', async () => {
      const mockChain = createSupabaseMock({ error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.delete('session-1');

      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'session-1');
    });
  });

  describe('count', () => {
    it('should count sessions', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 25, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const count = await repository.count();

      expect(count).toBe(25);
    });
  });

  describe('exists', () => {
    it('should return true if session exists', async () => {
      const mockSession = {
        id: 'session-1',
        user_id: 'test-user-id',
        learning_path_id: 'path-1',
        task_ids: ['task-1'],
        execution: { taskIds: ['task-1'], completedCount: 0, correctCount: 0, status: 'planned', totalTimeSpent: 0 },
        progress: null,
        configuration: { topicId: 'topic-1', learningPathIds: ['path-1'], targetCount: 1, includeReview: false },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockSession, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const exists = await repository.exists('session-1');

      expect(exists).toBe(true);
    });
  });
});

describe('AnswerHistoryRepository', () => {
  let repository: AnswerHistoryRepository;

  beforeEach(() => {
    repository = new AnswerHistoryRepository();
    vi.clearAllMocks();
    vi.mocked(getCurrentUserId).mockResolvedValue('test-user-id');
  });

  describe('getAll', () => {
    it('should fetch all answers for current user', async () => {
      const mockAnswers = [
        {
          id: 'answer-1',
          user_id: 'test-user-id',
          task_id: 'task-1',
          session_id: 'session-1',
          timestamp: '2024-01-01T10:00:00Z',
          is_correct: true,
          user_answer: 'option A',
          correct_answer: null,
          time_taken_ms: 5000,
          created_at: '2024-01-01T10:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockAnswers, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const answers = await repository.getAll();

      expect(mockChain.limit).toHaveBeenCalledWith(1000);
      expect(answers).toHaveLength(1);
    });
  });

  describe('getBySessionId', () => {
    it('should fetch answers by session ID', async () => {
      const mockAnswers = [
        {
          id: 'answer-1',
          user_id: 'test-user-id',
          task_id: 'task-1',
          session_id: 'session-1',
          timestamp: '2024-01-01T10:00:00Z',
          is_correct: true,
          user_answer: 'correct',
          correct_answer: null,
          time_taken_ms: 5000,
          created_at: '2024-01-01T10:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockAnswers, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const answers = await repository.getBySessionId('session-1');

      expect(mockChain.eq).toHaveBeenCalledWith('session_id', 'session-1');
      expect(answers).toHaveLength(1);
    });
  });

  describe('getByTaskId', () => {
    it('should fetch answers by task ID', async () => {
      const mockAnswers = [
        {
          id: 'answer-1',
          user_id: 'test-user-id',
          task_id: 'task-1',
          session_id: 'session-1',
          timestamp: '2024-01-01T10:00:00Z',
          is_correct: false,
          user_answer: 'wrong',
          correct_answer: null,
          time_taken_ms: 3000,
          created_at: '2024-01-01T10:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockAnswers, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const answers = await repository.getByTaskId('task-1');

      expect(mockChain.eq).toHaveBeenCalledWith('task_id', 'task-1');
      expect(answers).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create answer with string user_answer', async () => {
      const newAnswer = {
        taskId: 'task-1',
        sessionId: 'session-1',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        isCorrect: true,
        userAnswer: 'option A',
        timeSpent: 5000,
        confidence: 0.8,
        metadata: { attemptNumber: 1, hintsUsed: 0, deviceType: 'desktop', browserInfo: 'Chrome' },
      };

      const mockCreated = {
        id: 'answer-new',
        user_id: 'test-user-id',
        task_id: newAnswer.taskId,
        session_id: newAnswer.sessionId,
        timestamp: newAnswer.timestamp.toISOString(),
        is_correct: newAnswer.isCorrect,
        user_answer: newAnswer.userAnswer,
        correct_answer: null,
        time_taken_ms: newAnswer.timeSpent,
        created_at: '2024-01-01T10:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockCreated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const created = await repository.create(newAnswer);

      expect(created.id).toBe('answer-new');
      expect(created.userAnswer).toBe('option A');
    });

    it('should create answer with array user_answer', async () => {
      const newAnswer = {
        taskId: 'task-1',
        sessionId: 'session-1',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        isCorrect: true,
        userAnswer: ['option A', 'option B'],
        timeSpent: 5000,
        confidence: 0.8,
        metadata: { attemptNumber: 1, hintsUsed: 0, deviceType: 'mobile', browserInfo: 'Safari' },
      };

      const mockCreated = {
        id: 'answer-new',
        user_id: 'test-user-id',
        task_id: newAnswer.taskId,
        session_id: newAnswer.sessionId,
        timestamp: newAnswer.timestamp.toISOString(),
        is_correct: newAnswer.isCorrect,
        user_answer: newAnswer.userAnswer,
        correct_answer: null,
        time_taken_ms: newAnswer.timeSpent,
        created_at: '2024-01-01T10:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockCreated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const created = await repository.create(newAnswer);

      expect(created.userAnswer).toEqual(['option A', 'option B']);
    });
  });

  describe('createMany', () => {
    it('should create multiple answers', async () => {
      const newAnswers = [
        {
          taskId: 'task-1',
          sessionId: 'session-1',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          isCorrect: true,
          userAnswer: 'A',
          timeSpent: 3000,
          confidence: 0.9,
          metadata: { attemptNumber: 1, hintsUsed: 0, deviceType: 'desktop', browserInfo: '' },
        },
        {
          taskId: 'task-2',
          sessionId: 'session-1',
          timestamp: new Date('2024-01-01T10:05:00Z'),
          isCorrect: false,
          userAnswer: 'B',
          timeSpent: 5000,
          confidence: 0.5,
          metadata: { attemptNumber: 1, hintsUsed: 1, deviceType: 'desktop', browserInfo: '' },
        },
      ];

      const mockCreated = newAnswers.map((answer, index) => ({
        id: `answer-${index + 1}`,
        user_id: 'test-user-id',
        task_id: answer.taskId,
        session_id: answer.sessionId,
        timestamp: answer.timestamp.toISOString(),
        is_correct: answer.isCorrect,
        user_answer: answer.userAnswer,
        correct_answer: null,
        time_taken_ms: answer.timeSpent,
        created_at: '2024-01-01T10:00:00Z',
      }));

      const mockChain = createSupabaseMock({ data: mockCreated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const created = await repository.createMany(newAnswers);

      expect(created).toHaveLength(2);
    });
  });

  describe('delete', () => {
    it('should delete answer', async () => {
      const mockChain = createSupabaseMock({ error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.delete('answer-1');

      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'answer-1');
    });
  });

  describe('mapFromDb', () => {
    it('should handle string user_answer', async () => {
      const mockAnswer = {
        id: 'answer-1',
        user_id: 'test-user-id',
        task_id: 'task-1',
        session_id: 'session-1',
        timestamp: '2024-01-01T10:00:00Z',
        is_correct: true,
        user_answer: 'string answer',
        correct_answer: null,
        time_taken_ms: 5000,
        created_at: '2024-01-01T10:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: [mockAnswer], error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const answers = await repository.getAll();

      expect(answers[0].userAnswer).toBe('string answer');
    });

    it('should handle array user_answer', async () => {
      const mockAnswer = {
        id: 'answer-1',
        user_id: 'test-user-id',
        task_id: 'task-1',
        session_id: 'session-1',
        timestamp: '2024-01-01T10:00:00Z',
        is_correct: true,
        user_answer: ['option 1', 'option 2'],
        correct_answer: null,
        time_taken_ms: 5000,
        created_at: '2024-01-01T10:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: [mockAnswer], error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const answers = await repository.getAll();

      expect(answers[0].userAnswer).toEqual(['option 1', 'option 2']);
    });

    it('should handle null user_answer', async () => {
      const mockAnswer = {
        id: 'answer-1',
        user_id: 'test-user-id',
        task_id: 'task-1',
        session_id: null,
        timestamp: '2024-01-01T10:00:00Z',
        is_correct: false,
        user_answer: null,
        correct_answer: null,
        time_taken_ms: null,
        created_at: '2024-01-01T10:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: [mockAnswer], error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const answers = await repository.getAll();

      expect(answers[0].userAnswer).toBe('');
      expect(answers[0].timeSpent).toBe(0);
    });
  });
});

describe('SpacedRepetitionRepository', () => {
  let repository: SpacedRepetitionRepository;

  beforeEach(() => {
    repository = new SpacedRepetitionRepository();
    vi.clearAllMocks();
    vi.mocked(getCurrentUserId).mockResolvedValue('test-user-id');
  });

  describe('getAll', () => {
    it('should fetch all SRS items for current user', async () => {
      const mockItems = [
        {
          id: 'sr-1',
          user_id: 'test-user-id',
          task_id: 'task-1',
          schedule: { nextReview: new Date('2024-01-05T00:00:00Z'), lastReviewed: new Date('2024-01-01T00:00:00Z') },
          algorithm: { interval: 4, easeFactor: 2.5, repetitionCount: 2 },
          performance: { reviewCount: 2, correctCount: 2 },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const items = await repository.getAll();

      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(items).toHaveLength(1);
    });
  });

  describe('getByTaskId', () => {
    it('should fetch SRS item by task ID', async () => {
      const mockItem = {
        id: 'sr-1',
        user_id: 'test-user-id',
        task_id: 'task-1',
        schedule: { nextReview: new Date('2024-01-05T00:00:00Z'), lastReviewed: new Date('2024-01-01T00:00:00Z') },
        algorithm: { interval: 4, easeFactor: 2.5, repetitionCount: 2 },
        performance: { reviewCount: 2, correctCount: 2 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockItem, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const item = await repository.getByTaskId('task-1');

      expect(mockChain.eq).toHaveBeenCalledWith('task_id', 'task-1');
      expect(item?.taskId).toBe('task-1');
    });

    it('should return null for PGRST116 error', async () => {
      const mockChain = createSupabaseMock({ data: null, error: { code: 'PGRST116' } });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const item = await repository.getByTaskId('non-existent');

      expect(item).toBeNull();
    });
  });

  describe('getDueItems', () => {
    it('should fetch due items with limit', async () => {
      const now = new Date();
      const mockItems = [
        {
          id: 'sr-1',
          user_id: 'test-user-id',
          task_id: 'task-1',
          schedule: { nextReview: new Date(now.getTime() - 86400000).toISOString(), lastReviewed: new Date(now.getTime() - 172800000).toISOString() },
          algorithm: { interval: 1, easeFactor: 2.5, repetitionCount: 1 },
          performance: { reviewCount: 1, correctCount: 1 },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockItems, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const items = await repository.getDueItems(10);

      expect(mockChain.lte).toHaveBeenCalled();
      expect(mockChain.limit).toHaveBeenCalledWith(10);
      expect(items).toHaveLength(1);
    });

    it('should fetch all due items without limit', async () => {
      const mockItems = [
        {
          id: 'sr-1',
          user_id: 'test-user-id',
          task_id: 'task-1',
          schedule: { nextReview: '2024-01-01T00:00:00Z', lastReviewed: '2023-12-31T00:00:00Z' },
          algorithm: { interval: 1, easeFactor: 2.5, repetitionCount: 1 },
          performance: { reviewCount: 1, correctCount: 1 },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockItems, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const _items = await repository.getDueItems();

      expect(mockChain.limit).not.toHaveBeenCalled();
    });
  });

  describe('getDue', () => {
    it('should fetch items due by date', async () => {
      const dueDate = new Date('2024-01-05T00:00:00Z');
      const mockItems = [
        {
          id: 'sr-1',
          user_id: 'test-user-id',
          task_id: 'task-1',
          schedule: { nextReview: new Date('2024-01-05T00:00:00Z'), lastReviewed: new Date('2024-01-01T00:00:00Z') },
          algorithm: { interval: 4, easeFactor: 2.5, repetitionCount: 2 },
          performance: { reviewCount: 2, correctCount: 2 },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockItems, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const items = await repository.getDue(dueDate);

      expect(mockChain.lte).toHaveBeenCalledWith('schedule->>nextReview', dueDate.toISOString());
      expect(items).toHaveLength(1);
    });
  });

  describe('upsert', () => {
    it('should upsert SRS item with date serialization', async () => {
      const newItem = {
        taskId: 'task-1',
        schedule: {
          nextReview: new Date('2024-01-10T00:00:00Z'),
          lastReviewed: new Date('2024-01-05T00:00:00Z'),
        },
        algorithm: { interval: 5, easeFactor: 2.6, repetitionCount: 3 },
        performance: { reviewCount: 3, correctCount: 3 },
      };

      const mockUpserted = {
        id: 'sr-new',
        user_id: 'test-user-id',
        task_id: newItem.taskId,
        schedule: {
          nextReview: newItem.schedule.nextReview.toISOString(),
          lastReviewed: newItem.schedule.lastReviewed?.toISOString(),
        },
        algorithm: newItem.algorithm,
        performance: newItem.performance,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-05T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpserted, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const upserted = await repository.upsert(newItem);

      expect(upserted.id).toBe('sr-new');
      expect(upserted.taskId).toBe('task-1');
    });
  });

  describe('create', () => {
    it('should create SRS item', async () => {
      const newItem = {
        taskId: 'task-1',
        schedule: {
          nextReview: new Date('2024-01-10T00:00:00Z'),
          lastReviewed: new Date('2024-01-05T00:00:00Z'),
        },
        algorithm: { interval: 1, easeFactor: 2.5, repetitionCount: 1 },
        performance: { reviewCount: 1, correctCount: 1 },
      };

      const mockCreated = {
        id: 'sr-new',
        user_id: 'test-user-id',
        task_id: newItem.taskId,
        schedule: {
          nextReview: newItem.schedule.nextReview.toISOString(),
          lastReviewed: newItem.schedule.lastReviewed?.toISOString(),
        },
        algorithm: newItem.algorithm,
        performance: newItem.performance,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockCreated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const created = await repository.create(newItem);

      expect(created.id).toBe('sr-new');
    });
  });

  describe('update', () => {
    it('should update SRS item', async () => {
      const updates = {
        schedule: {
          nextReview: new Date('2024-01-15T00:00:00Z'),
          lastReviewed: new Date('2024-01-10T00:00:00Z'),
        },
        algorithm: { interval: 10, easeFactor: 2.7, repetitionCount: 4 },
      };

      const mockUpdated = {
        id: 'sr-1',
        user_id: 'test-user-id',
        task_id: 'task-1',
        schedule: {
          nextReview: updates.schedule.nextReview.toISOString(),
          lastReviewed: updates.schedule.lastReviewed?.toISOString(),
        },
        algorithm: updates.algorithm,
        performance: { reviewCount: 4, correctCount: 4 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-10T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const updated = await repository.update('sr-1', updates);

      expect(updated.algorithm.interval).toBe(10);
    });
  });

  describe('getByNextReviewDate', () => {
    it('should fetch items by exact next review date', async () => {
      const reviewDate = new Date('2024-01-10T00:00:00Z');
      const mockItems = [
        {
          id: 'sr-1',
          user_id: 'test-user-id',
          task_id: 'task-1',
          schedule: { nextReview: new Date('2024-01-10'), lastReviewed: new Date('2024-01-05T00:00:00Z') },
          algorithm: { interval: 5, easeFactor: 2.5, repetitionCount: 2 },
          performance: { reviewCount: 2, correctCount: 2 },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-05T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockItems, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const items = await repository.getByNextReviewDate(reviewDate);

      expect(mockChain.eq).toHaveBeenCalledWith('schedule->>nextReview', '2024-01-10');
      expect(items).toHaveLength(1);
    });
  });

  describe('getReviewCalendar', () => {
    it('should generate review calendar', async () => {
      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');

      const mockItems = [
        {
          id: 'sr-1',
          user_id: 'test-user-id',
          task_id: 'task-1',
          schedule: { nextReview: new Date('2024-01-10T00:00:00Z'), lastReviewed: new Date('2024-01-05T00:00:00Z') },
          algorithm: { interval: 5, easeFactor: 2.5, repetitionCount: 2 },
          performance: { reviewCount: 2, correctCount: 2 },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-05T00:00:00Z',
        },
        {
          id: 'sr-2',
          user_id: 'test-user-id',
          task_id: 'task-2',
          schedule: { nextReview: new Date('2024-01-10T00:00:00Z'), lastReviewed: new Date('2024-01-05T00:00:00Z') },
          algorithm: { interval: 5, easeFactor: 2.5, repetitionCount: 2 },
          performance: { reviewCount: 2, correctCount: 2 },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-05T00:00:00Z',
        },
        {
          id: 'sr-3',
          user_id: 'test-user-id',
          task_id: 'task-3',
          schedule: { nextReview: new Date('2024-01-15T00:00:00Z'), lastReviewed: new Date('2024-01-10T00:00:00Z') },
          algorithm: { interval: 5, easeFactor: 2.5, repetitionCount: 2 },
          performance: { reviewCount: 2, correctCount: 2 },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-10T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockItems, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const calendar = await repository.getReviewCalendar(startDate, endDate);

      expect(mockChain.gte).toHaveBeenCalledWith('schedule->>nextReview', startDate.toISOString());
      expect(mockChain.lte).toHaveBeenCalledWith('schedule->>nextReview', endDate.toISOString());
      expect(calendar).toHaveLength(2); // Two different dates
      expect(calendar[0].taskCount).toBeGreaterThan(0);
      expect(calendar[0].estimatedTime).toBeGreaterThan(0);
    });
  });

  describe('delete', () => {
    it('should delete SRS item', async () => {
      const mockChain = createSupabaseMock({ error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.delete('task-1');

      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('task_id', 'task-1');
    });
  });

  describe('count', () => {
    it('should count SRS items', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 50, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const count = await repository.count();

      expect(count).toBe(50);
    });
  });

  describe('exists', () => {
    it('should return true if item exists', async () => {
      const mockItem = {
        id: 'sr-1',
        user_id: 'test-user-id',
        task_id: 'task-1',
        schedule: { nextReview: new Date('2024-01-10T00:00:00Z'), lastReviewed: new Date('2024-01-05T00:00:00Z') },
        algorithm: { interval: 5, easeFactor: 2.5, repetitionCount: 2 },
        performance: { reviewCount: 2, correctCount: 2 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-05T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockItem, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const exists = await repository.exists('sr-1');

      expect(exists).toBe(true);
    });

    it('should return false if item does not exist', async () => {
      const mockChain = createSupabaseMock({ data: null, error: { code: 'PGRST116' } });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      const exists = await repository.exists('non-existent');

      expect(exists).toBe(false);
    });
  });
});
