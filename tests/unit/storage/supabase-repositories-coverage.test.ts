/**
 * Focused Coverage Tests for Supabase Repository Adapters
 *
 * This file targets specific uncovered branches to improve coverage to 80%+
 * Focus: Update method conditional branches and null data handling
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TopicRepository,
  LearningPathRepository,
  TaskRepository,
  PracticeSessionRepository,
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

// Mock logger
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
  const chain: Record<string, any> = {};

  const makeChainablePromise = (promise: Promise<any>) => {
    return Object.assign(promise, chain);
  };

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

describe('TopicRepository - Update Conditional Branches', () => {
  let repository: TopicRepository;

  beforeEach(() => {
    repository = new TopicRepository();
    vi.clearAllMocks();
  });

  it('should update only description when other fields undefined', async () => {
    const updates = { description: 'New description' };
    const mockUpdated = {
      id: 'topic-1',
      title: 'Original Title',
      description: 'New description',
      learning_path_ids: [],
      metadata: {},
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-04T00:00:00Z',
    };

    const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
    vi.mocked(supabase.from).mockReturnValue(mockChain);

    await repository.update('topic-1', updates);

    expect(mockChain.update).toHaveBeenCalledWith({ description: 'New description' });
  });

  it('should update only learningPathIds when other fields undefined', async () => {
    const updates = { learningPathIds: ['path-1'] };
    const mockUpdated = {
      id: 'topic-1',
      title: 'Title',
      description: 'Desc',
      learning_path_ids: ['path-1'],
      metadata: {},
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-04T00:00:00Z',
    };

    const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
    vi.mocked(supabase.from).mockReturnValue(mockChain);

    await repository.update('topic-1', updates);

    expect(mockChain.update).toHaveBeenCalledWith({ learning_path_ids: ['path-1'] });
  });

  it('should update only metadata when other fields undefined', async () => {
    const updates = { metadata: { new: 'data' } };
    const mockUpdated = {
      id: 'topic-1',
      title: 'Title',
      description: 'Desc',
      learning_path_ids: [],
      metadata: { new: 'data' },
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-04T00:00:00Z',
    };

    const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
    vi.mocked(supabase.from).mockReturnValue(mockChain);

    await repository.update('topic-1', updates);

    expect(mockChain.update).toHaveBeenCalledWith({ metadata: { new: 'data' } });
  });
});

describe('LearningPathRepository - Update Conditional Branches', () => {
  let repository: LearningPathRepository;

  beforeEach(() => {
    repository = new LearningPathRepository();
    vi.clearAllMocks();
  });

  it('should update only description when other fields undefined', async () => {
    const updates = { description: 'New description' };
    const mockUpdated = {
      id: 'path-1',
      topic_id: 'topic-1',
      title: 'Title',
      description: 'New description',
      difficulty: 'easy',
      task_ids: [],
      estimated_time: 1800,
      requirements: {},
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-04T00:00:00Z',
    };

    const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
    vi.mocked(supabase.from).mockReturnValue(mockChain);

    await repository.update('path-1', updates);

    expect(mockChain.update).toHaveBeenCalledWith({ description: 'New description' });
  });
});

describe('TaskRepository - Conditional Branches', () => {
  let repository: TaskRepository;

  beforeEach(() => {
    repository = new TaskRepository();
    vi.clearAllMocks();
  });

  describe('getByLearningPathIds - empty array', () => {
    it('should return empty array when learningPathIds is empty', async () => {
      const tasks = await repository.getByLearningPathIds([]);
      expect(tasks).toEqual([]);
    });
  });

  describe('getByTags - empty array', () => {
    it('should return empty array when tags is empty', async () => {
      const tasks = await repository.getByTags([]);
      expect(tasks).toEqual([]);
    });
  });

  describe('deleteMany - empty array', () => {
    it('should not call database when ids is empty', async () => {
      await repository.deleteMany([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('update - individual field conditionals', () => {
    it('should only update content when provided', async () => {
      const updates = { content: { question: 'Q?' } };
      const mockUpdated = {
        id: 'task-1',
        learning_path_id: 'path-1',
        template_id: 'template-1',
        type: 'multiple-choice',
        content: { question: 'Q?' },
        metadata: {},
        has_audio: false,
        audio_url: null,
        language: null,
        ipa: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.update('task-1', updates);

      const updateCall = mockChain.update.mock.calls[0][0];
      expect(updateCall).toHaveProperty('content');
      expect(Object.keys(updateCall)).toHaveLength(1);
    });

    it('should only update metadata when provided', async () => {
      const updates = { metadata: { difficulty: 'hard' } };
      const mockUpdated = {
        id: 'task-1',
        learning_path_id: 'path-1',
        template_id: 'template-1',
        type: 'multiple-choice',
        content: {},
        metadata: { difficulty: 'hard' },
        has_audio: false,
        audio_url: null,
        language: null,
        ipa: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.update('task-1', updates);

      const updateCall = mockChain.update.mock.calls[0][0];
      expect(updateCall).toHaveProperty('metadata');
      expect(Object.keys(updateCall)).toHaveLength(1);
    });
  });

  describe('getRandomTasks - filter conditionals', () => {
    it('should not apply learningPathIds filter when empty', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          learning_path_id: 'path-1',
          template_id: 'template-1',
          type: 'multiple-choice',
          content: {},
          metadata: {},
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

      await repository.getRandomTasks(10, { learningPathIds: [] });

      // Should not call .in() when array is empty
      expect(mockChain.in).not.toHaveBeenCalled();
    });

    it('should not apply excludeIds filter when empty', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          learning_path_id: 'path-1',
          template_id: 'template-1',
          type: 'multiple-choice',
          content: {},
          metadata: {},
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

      await repository.getRandomTasks(10, { excludeIds: [] });

      // Should not call .not() when array is empty
      expect(mockChain.not).not.toHaveBeenCalled();
    });
  });

  describe('search - filter conditionals', () => {
    it('should not apply tags filter when empty', async () => {
      const mockTasks: any[] = [];
      const mockChain = createSupabaseMock({ data: mockTasks, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.search({ tags: [] });

      // Should not call .contains() when tags array is empty
      expect(mockChain.contains).not.toHaveBeenCalled();
    });

    it('should not apply offset when not provided', async () => {
      const mockTasks: any[] = [];
      const mockChain = createSupabaseMock({ data: mockTasks, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.search({ limit: 10 });

      // Should not call .range() when offset is not provided
      expect(mockChain.range).not.toHaveBeenCalled();
    });
  });
});

describe('PracticeSessionRepository - Conditional Branches', () => {
  let repository: PracticeSessionRepository;

  beforeEach(() => {
    repository = new PracticeSessionRepository();
    vi.clearAllMocks();
    vi.mocked(getCurrentUserId).mockResolvedValue('test-user-id');
  });

  describe('update - configuration conditional', () => {
    it('should not update learning_path_id when learningPathIds is empty', async () => {
      const updates = {
        configuration: {
          topicId: 'topic-1',
          learningPathIds: [],
          targetCount: 20,
          includeReview: true,
        },
      };

      const mockUpdated = {
        id: 'session-1',
        user_id: 'test-user-id',
        learning_path_id: 'original-path',
        task_ids: [],
        execution: {},
        progress: null,
        configuration: updates.configuration,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.update('session-1', updates);

      const updateCall = mockChain.update.mock.calls[0][0];
      expect(updateCall).not.toHaveProperty('learning_path_id');
    });
  });
});

describe('SpacedRepetitionRepository - Conditional Branches', () => {
  let repository: SpacedRepetitionRepository;

  beforeEach(() => {
    repository = new SpacedRepetitionRepository();
    vi.clearAllMocks();
    vi.mocked(getCurrentUserId).mockResolvedValue('test-user-id');
  });

  describe('getDueItems - limit conditional', () => {
    it('should not apply limit when not provided', async () => {
      const mockItems = [
        {
          id: 'item-1',
          user_id: 'test-user-id',
          task_id: 'task-1',
          schedule: {
            nextReview: new Date().toISOString(),
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
          },
          algorithm: {},
          performance: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-04T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockItems, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.getDueItems();

      // Should not call .limit() when limit is not provided
      expect(mockChain.limit).not.toHaveBeenCalled();
    });

    it('should apply limit when provided', async () => {
      const mockItems = [
        {
          id: 'item-1',
          user_id: 'test-user-id',
          task_id: 'task-1',
          schedule: {
            nextReview: new Date().toISOString(),
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
          },
          algorithm: {},
          performance: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-04T00:00:00Z',
        },
      ];

      const mockChain = createSupabaseMock({ data: mockItems, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.getDueItems(5);

      expect(mockChain.limit).toHaveBeenCalledWith(5);
    });
  });

  describe('update - individual field conditionals', () => {
    it('should only update schedule when provided', async () => {
      const updates = {
        schedule: {
          nextReview: new Date(),
          interval: 2,
          easeFactor: 2.6,
          repetitions: 1,
        },
      };

      const mockUpdated = {
        id: 'item-1',
        user_id: 'test-user-id',
        task_id: 'task-1',
        schedule: updates.schedule,
        algorithm: {},
        performance: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.update('item-1', updates);

      const updateCall = mockChain.update.mock.calls[0][0];
      expect(updateCall).toHaveProperty('schedule');
      expect(updateCall).not.toHaveProperty('algorithm');
      expect(updateCall).not.toHaveProperty('performance');
    });

    it('should only update algorithm when provided', async () => {
      const updates = {
        algorithm: {
          name: 'SM-2',
          version: '2.0',
          parameters: {},
        },
      };

      const mockUpdated = {
        id: 'item-1',
        user_id: 'test-user-id',
        task_id: 'task-1',
        schedule: {},
        algorithm: updates.algorithm,
        performance: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.update('item-1', updates);

      const updateCall = mockChain.update.mock.calls[0][0];
      expect(updateCall).toHaveProperty('algorithm');
      expect(updateCall).not.toHaveProperty('schedule');
      expect(updateCall).not.toHaveProperty('performance');
    });

    it('should only update performance when provided', async () => {
      const updates = {
        performance: {
          totalReviews: 10,
          correctReviews: 9,
          averageScore: 0.9,
          lastScore: 1.0,
        },
      };

      const mockUpdated = {
        id: 'item-1',
        user_id: 'test-user-id',
        task_id: 'task-1',
        schedule: {},
        algorithm: {},
        performance: updates.performance,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
      };

      const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain);

      await repository.update('item-1', updates);

      const updateCall = mockChain.update.mock.calls[0][0];
      expect(updateCall).toHaveProperty('performance');
      expect(updateCall).not.toHaveProperty('schedule');
      expect(updateCall).not.toHaveProperty('algorithm');
    });
  });
});
