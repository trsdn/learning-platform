/**
 * Supabase Repository Implementation Tests
 *
 * These tests verify that Supabase repository implementations correctly
 * implement the repository interfaces and handle data transformations.
 */

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

// Mock the entire Supabase client module
vi.mock('@/modules/storage/supabase-client', () => {
  const mockSupabase = {
    from: vi.fn(),
  };

  return {
    supabase: mockSupabase,
    getCurrentUserId: vi.fn(() => 'test-user-id'),
  };
});

import { supabase } from '@/modules/storage/supabase-client';

/**
 * Helper to create chainable Supabase query mock
 */
function createSupabaseMock(resolveWith: unknown) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolveWith),
  };

  // Methods that end the chain should return the result
  chain.select.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.upsert.mockReturnValue(chain);
  chain.delete.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.neq.mockReturnValue(chain);
  chain.in.mockReturnValue(chain);
  chain.gte.mockReturnValue(chain);
  chain.lte.mockReturnValue(chain);
  chain.lt.mockReturnValue(chain);
  chain.order.mockResolvedValue(resolveWith);
  chain.limit.mockReturnValue(chain);

  return chain;
}

describe('TopicRepository Implementation', () => {
  let repository: TopicRepository;

  beforeEach(() => {
    repository = new TopicRepository();
    vi.clearAllMocks();
  });

  it('should implement getAll method', async () => {
    const mockTopics = [
      {
        id: 'math',
        title: 'Mathematik',
        description: 'Math topics',
        learning_path_ids: ['path1'],
        metadata: {},
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const mockChain = createSupabaseMock({ data: mockTopics, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const topics = await repository.getAll();

    expect(supabase.from).toHaveBeenCalledWith('topics');
    expect(topics).toHaveLength(1);
    expect(topics[0].id).toBe('math');
    expect(topics[0].title).toBe('Mathematik');
  });

  it('should implement getById method', async () => {
    const mockTopic = {
      id: 'math',
      title: 'Mathematik',
      description: 'Math topics',
      learning_path_ids: ['path1'],
      metadata: {},
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockChain = createSupabaseMock({ data: mockTopic, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const topic = await repository.getById('math');

    expect(topic).toBeDefined();
    expect(topic?.id).toBe('math');
  });

  it('should return null for non-existent topic', async () => {
    const mockChain = createSupabaseMock({
      data: null,
      error: { code: 'PGRST116' },
    });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const topic = await repository.getById('non-existent');

    expect(topic).toBeNull();
  });

  it('should implement create method', async () => {
    const newTopic = {
      id: 'biology',
      title: 'Biologie',
      description: 'Biology topics',
      learningPathIds: [],
      isActive: true,
      metadata: {
        estimatedHours: 20,
        difficultyLevel: 'beginner',
        prerequisites: [],
      },
    };

    const mockCreatedTopic = {
      ...newTopic,
      learning_path_ids: newTopic.learningPathIds,
      is_active: newTopic.isActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockChain = createSupabaseMock({ data: mockCreatedTopic, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const created = await repository.create(newTopic);

    expect(created.id).toBe('biology');
    expect(created.title).toBe('Biologie');
  });

  it('should implement update method', async () => {
    const mockUpdatedTopic = {
      id: 'math',
      title: 'Updated Math',
      description: 'Math topics',
      learning_path_ids: [],
      metadata: {},
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockChain = createSupabaseMock({ data: mockUpdatedTopic, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const updated = await repository.update('math', { title: 'Updated Math' });

    expect(updated.title).toBe('Updated Math');
  });

  it('should implement delete method', async () => {
    const mockChain = createSupabaseMock({ error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    await expect(repository.delete('math')).resolves.not.toThrow();
  });
});

describe('LearningPathRepository Implementation', () => {
  let repository: LearningPathRepository;

  beforeEach(() => {
    repository = new LearningPathRepository();
    vi.clearAllMocks();
  });

  it('should implement getAll method', async () => {
    const mockPaths = [
      {
        id: 'path1',
        topic_id: 'math',
        title: 'Algebra Basics',
        description: 'Learn algebra',
        difficulty: 'easy',
        task_ids: ['task1'],
        estimated_time: 30,
        requirements: {},
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const mockChain = createSupabaseMock({ data: mockPaths, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const paths = await repository.getAll();

    expect(paths).toHaveLength(1);
    expect(paths[0].id).toBe('path1');
  });

  it('should implement getByTopicId method', async () => {
    const mockPaths = [
      {
        id: 'path1',
        topic_id: 'math',
        title: 'Algebra Basics',
        description: 'Learn algebra',
        difficulty: 'easy',
        task_ids: ['task1'],
        estimated_time: 30,
        requirements: {},
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const mockChain = createSupabaseMock({ data: mockPaths, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const paths = await repository.getByTopicId('math');

    expect(paths).toHaveLength(1);
    expect(paths[0].topicId).toBe('math');
  });
});

describe('TaskRepository Implementation', () => {
  let repository: TaskRepository;

  beforeEach(() => {
    repository = new TaskRepository();
    vi.clearAllMocks();
  });

  it('should implement getByLearningPathId method', async () => {
    const mockTasks = [
      {
        id: 'task1',
        learning_path_id: 'path1',
        template_id: null,
        type: 'multiple-choice',
        content: { question: 'Test?', options: ['A', 'B'], correctAnswer: 0 },
        metadata: { difficulty: 'easy', tags: [], estimatedTime: 60, points: 10 },
        has_audio: false,
        audio_url: null,
        language: null,
        ipa: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const mockChain = createSupabaseMock({ data: mockTasks, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const tasks = await repository.getByLearningPathId('path1');

    expect(tasks).toHaveLength(1);
    expect(tasks[0].learningPathId).toBe('path1');
  });

  it('should implement getAll method', async () => {
    const mockTasks = [
      {
        id: 'task1',
        learning_path_id: 'path1',
        template_id: null,
        type: 'multiple-choice',
        content: {},
        metadata: { difficulty: 'easy', tags: [], estimatedTime: 60, points: 10 },
        has_audio: false,
        audio_url: null,
        language: null,
        ipa: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const mockChain = createSupabaseMock({ data: mockTasks, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const tasks = await repository.getAll();

    expect(tasks).toHaveLength(1);
  });
});

describe('UserProgressRepository Implementation', () => {
  let repository: UserProgressRepository;

  beforeEach(() => {
    repository = new UserProgressRepository();
    vi.clearAllMocks();
  });

  it('should implement getByLearningPathId method', async () => {
    const mockProgress = {
      id: 'progress1',
      user_id: 'user1',
      topic_id: 'math',
      learning_path_id: 'path1',
      statistics: {
        tasksCompleted: 10,
        correctAnswers: 8,
        incorrectAnswers: 2,
        totalTime: 600000,
        averageAccuracy: 80,
        streak: 5,
      },
      milestones: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockChain = createSupabaseMock({ data: mockProgress, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const progress = await repository.getByLearningPathId('path1');

    expect(progress).toBeDefined();
    expect(progress?.learningPathId).toBe('path1');
  });

  it('should implement upsert method for progress', async () => {
    const progressUpdate = {
      topicId: 'math',
      learningPathId: 'path1',
      statistics: {
        tasksCompleted: 5,
        correctAnswers: 4,
        incorrectAnswers: 1,
        totalTime: 300000,
        averageAccuracy: 80,
        streak: 3,
      },
      milestones: {
        firstTaskCompleted: new Date(),
        lastActivity: new Date(),
        achievements: [],
      },
    };

    const mockUpserted = {
      id: 'progress1',
      user_id: 'test-user-id',
      topic_id: progressUpdate.topicId,
      learning_path_id: progressUpdate.learningPathId,
      statistics: progressUpdate.statistics,
      milestones: progressUpdate.milestones,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockChain = createSupabaseMock({ data: mockUpserted, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const upserted = await repository.upsert(progressUpdate);

    expect(upserted.id).toBe('progress1');
    expect(upserted.learningPathId).toBe('path1');
  });
});

describe('PracticeSessionRepository Implementation', () => {
  let repository: PracticeSessionRepository;

  beforeEach(() => {
    repository = new PracticeSessionRepository();
    vi.clearAllMocks();
  });

  it('should implement getById method', async () => {
    const mockSession = {
      id: 'session1',
      user_id: 'user1',
      learning_path_id: 'path1',
      task_ids: ['task1', 'task2'],
      execution: {
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        completedAt: null,
        pausedAt: null,
      },
      progress: {
        currentTaskIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
        totalTasks: 2,
      },
      configuration: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockChain = createSupabaseMock({ data: mockSession, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const session = await repository.getById('session1');

    expect(session).toBeDefined();
    expect(session?.id).toBe('session1');
  });

  it('should implement update method', async () => {
    const updates = {
      execution: {
        taskIds: ['task1', 'task2'],
        completedCount: 1,
        correctCount: 1,
        status: 'active' as const,
        totalTimeSpent: 120,
      },
    };

    const mockUpdated = {
      id: 'session1',
      user_id: 'test-user-id',
      learning_path_id: 'path1',
      task_ids: updates.execution.taskIds,
      execution: updates.execution,
      configuration: {
        topicId: 'math',
        learningPathIds: ['path1'],
        targetCount: 2,
        includeReview: false,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockChain = createSupabaseMock({ data: mockUpdated, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const updated = await repository.update('session1', updates);

    expect(updated.execution.completedCount).toBe(1);
    expect(updated.execution.status).toBe('active');
  });
});

describe('AnswerHistoryRepository Implementation', () => {
  let repository: AnswerHistoryRepository;

  beforeEach(() => {
    repository = new AnswerHistoryRepository();
    vi.clearAllMocks();
  });

  it('should implement getByTaskId method', async () => {
    const mockAnswers = [
      {
        id: 'answer1',
        user_id: 'user1',
        task_id: 'task1',
        session_id: null,
        timestamp: new Date().toISOString(),
        is_correct: true,
        user_answer: { selected: 0 },
        correct_answer: { selected: 0 },
        time_taken_ms: 5000,
        created_at: new Date().toISOString(),
      },
    ];

    const mockChain = createSupabaseMock({ data: mockAnswers, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const answers = await repository.getByTaskId('user1', 'task1');

    expect(answers).toHaveLength(1);
    expect(answers[0].taskId).toBe('task1');
  });

  it('should implement getBySessionId method', async () => {
    const mockAnswers = [
      {
        id: 'answer1',
        user_id: 'user1',
        task_id: 'task1',
        session_id: 'session1',
        timestamp: new Date().toISOString(),
        is_correct: true,
        user_answer: { selected: 0 },
        correct_answer: { selected: 0 },
        time_taken_ms: 5000,
        created_at: new Date().toISOString(),
      },
    ];

    const mockChain = createSupabaseMock({ data: mockAnswers, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const answers = await repository.getBySessionId('user1', 'session1');

    expect(answers).toHaveLength(1);
    expect(answers[0].sessionId).toBe('session1');
  });
});

describe('SpacedRepetitionRepository Implementation', () => {
  let repository: SpacedRepetitionRepository;

  beforeEach(() => {
    repository = new SpacedRepetitionRepository();
    vi.clearAllMocks();
  });

  it('should implement getByTaskId method', async () => {
    const mockItem = {
      id: 'sr1',
      user_id: 'user1',
      task_id: 'task1',
      schedule: {
        nextReview: new Date().toISOString(),
        lastReviewDate: new Date().toISOString(),
      },
      algorithm: {
        interval: 1,
        easeFactor: 2.5,
        repetitionCount: 1,
      },
      performance: {
        reviewCount: 1,
        correctCount: 1,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockChain = createSupabaseMock({ data: mockItem, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const item = await repository.getByTaskId('task1');

    expect(item).toBeDefined();
    expect(item?.taskId).toBe('task1');
  });

  it('should implement upsert method', async () => {
    const item = {
      taskId: 'task1',
      schedule: {
        nextReview: new Date(),
        lastReviewDate: new Date(),
      },
      algorithm: {
        interval: 6,
        easeFactor: 2.6,
        repetitionCount: 1,
      },
      performance: {
        reviewCount: 1,
        correctCount: 1,
      },
    };

    const mockUpserted = {
      id: 'sr1',
      user_id: 'test-user-id',
      task_id: item.taskId,
      schedule: {
        nextReview: item.schedule.nextReview.toISOString(),
        lastReviewDate: item.schedule.lastReviewDate?.toISOString(),
      },
      algorithm: item.algorithm,
      performance: item.performance,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockChain = createSupabaseMock({ data: mockUpserted, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const upserted = await repository.upsert(item);

    expect(upserted.id).toBe('sr1');
    expect(upserted.taskId).toBe('task1');
  });

  it('should implement getDue method', async () => {
    const now = new Date();
    const mockItems = [
      {
        id: 'sr1',
        user_id: 'user1',
        task_id: 'task1',
        schedule: {
          nextReview: new Date(now.getTime() - 86400000).toISOString(),
          lastReviewDate: new Date(now.getTime() - 172800000).toISOString(),
        },
        algorithm: {
          interval: 1,
          easeFactor: 2.5,
          repetitionCount: 1,
        },
        performance: {
          reviewCount: 1,
          correctCount: 1,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const mockChain = createSupabaseMock({ data: mockItems, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

    const dueItems = await repository.getDue(now);

    expect(dueItems).toHaveLength(1);
    expect(new Date(dueItems[0].schedule.nextReview).getTime()).toBeLessThanOrEqual(
      now.getTime()
    );
  });

  describe('schedule date mapping', () => {
    const buildRow = (
      schedule: unknown,
      createdAt = new Date('2025-01-01T10:00:00.000Z'),
      metadata: unknown = undefined
    ) => ({
      id: 'sr1',
      user_id: 'test-user-id',
      task_id: 'task1',
      schedule,
      algorithm: { interval: 1, repetition: 1, efactor: 2.5 },
      performance: {
        averageAccuracy: 1,
        averageTime: 1000,
        difficultyRating: 1,
        lastGrade: 5,
      },
      metadata,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    });

    it('revives JSON dates into Date instances', async () => {
      const nextReview = new Date('2025-06-01T08:00:00.000Z');
      const lastReviewed = new Date('2025-05-25T08:00:00.000Z');
      const row = buildRow({
        nextReview: nextReview.toISOString(),
        lastReviewed: lastReviewed.toISOString(),
        totalReviews: 3,
        consecutiveCorrect: 2,
      });

      const mockChain = createSupabaseMock({ data: row, error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

      const item = await repository.getByTaskId('task1');

      expect(item?.schedule.nextReview).toBeInstanceOf(Date);
      expect(item?.schedule.nextReview.getTime()).toBe(nextReview.getTime());
      expect(item?.schedule.lastReviewed).toBeInstanceOf(Date);
      expect(item?.schedule.lastReviewed?.getTime()).toBe(lastReviewed.getTime());
      expect(item?.schedule.totalReviews).toBe(3);
      expect(item?.schedule.consecutiveCorrect).toBe(2);
    });

    it('treats a row without a review date as due since creation', async () => {
      const createdAt = new Date('2025-01-01T10:00:00.000Z');
      const row = buildRow({ nextReview: null, lastReviewDate: null }, createdAt);

      const mockChain = createSupabaseMock({ data: row, error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

      const item = await repository.getByTaskId('task1');

      expect(item?.schedule.nextReview).toBeInstanceOf(Date);
      expect(item?.schedule.nextReview.getTime()).toBe(createdAt.getTime());
      expect(item?.schedule.lastReviewed).toBeUndefined();
      expect(item?.schedule.totalReviews).toBe(0);
    });

    it('builds a review calendar without throwing on serialized dates', async () => {
      const rows = [
        buildRow({ nextReview: '2025-06-01T08:00:00.000Z', totalReviews: 1 }),
        buildRow({ nextReview: '2025-06-01T20:00:00.000Z', totalReviews: 1 }),
        buildRow({ nextReview: '2025-06-02T08:00:00.000Z', totalReviews: 1 }),
      ];

      const mockChain = createSupabaseMock({ data: rows, error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

      const calendar = await repository.getReviewCalendar(
        new Date('2025-06-01T00:00:00.000Z'),
        new Date('2025-06-03T00:00:00.000Z')
      );

      expect(calendar).toHaveLength(2);
      expect(calendar[0]?.taskCount).toBe(2);
      expect(calendar[1]?.taskCount).toBe(1);
    });

    it('queries a whole day range for getByNextReviewDate', async () => {
      const mockChain = createSupabaseMock({ data: [], error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

      await repository.getByNextReviewDate(new Date('2025-06-01T13:45:00.000Z'));

      expect(mockChain.gte).toHaveBeenCalledWith(
        'schedule->>nextReview',
        '2025-06-01T00:00:00.000Z'
      );
      expect(mockChain.lt).toHaveBeenCalledWith(
        'schedule->>nextReview',
        '2025-06-02T00:00:00.000Z'
      );
    });
  });

  describe('metadata persistence', () => {
    const introduced = new Date('2025-02-01T09:00:00.000Z');
    const createdAt = new Date('2025-01-01T10:00:00.000Z');

    const buildRow = (metadata: unknown) => ({
      id: 'sr1',
      user_id: 'test-user-id',
      task_id: 'task1',
      schedule: { nextReview: '2025-06-01T08:00:00.000Z', totalReviews: 4, consecutiveCorrect: 2 },
      algorithm: { interval: 1, repetition: 1, efactor: 2.5 },
      performance: {
        averageAccuracy: 1,
        averageTime: 1000,
        difficultyRating: 1,
        lastGrade: 5,
      },
      metadata,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    });

    it('reads back stored graduation state and lapse count', async () => {
      const row = buildRow({
        introduced: introduced.toISOString(),
        graduated: true,
        lapseCount: 3,
      });

      const mockChain = createSupabaseMock({ data: row, error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

      const item = await repository.getByTaskId('task1');

      expect(item?.metadata.graduated).toBe(true);
      expect(item?.metadata.lapseCount).toBe(3);
      expect(item?.metadata.introduced).toBeInstanceOf(Date);
      expect(item?.metadata.introduced.getTime()).toBe(introduced.getTime());
    });

    it('falls back to the creation date for rows without metadata', async () => {
      const mockChain = createSupabaseMock({ data: buildRow(null), error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

      const item = await repository.getByTaskId('task1');

      expect(item?.metadata.introduced.getTime()).toBe(createdAt.getTime());
      expect(item?.metadata.graduated).toBe(false);
      expect(item?.metadata.lapseCount).toBe(0);
    });

    it('writes metadata when upserting an item', async () => {
      const mockChain = createSupabaseMock({
        data: buildRow({ introduced: introduced.toISOString(), graduated: true, lapseCount: 2 }),
        error: null,
      });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);

      await repository.upsert({
        taskId: 'task1',
        schedule: {
          nextReview: new Date('2025-06-01T08:00:00.000Z'),
          totalReviews: 4,
          consecutiveCorrect: 2,
        },
        algorithm: { interval: 1, repetition: 1, efactor: 2.5 },
        performance: {
          averageAccuracy: 1,
          averageTime: 1000,
          difficultyRating: 1,
          lastGrade: 5,
        },
        metadata: { introduced, graduated: true, lapseCount: 2 },
      });

      expect(mockChain.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            introduced: introduced.toISOString(),
            graduated: true,
            lapseCount: 2,
          },
        }),
        expect.anything()
      );
    });
  });
});
