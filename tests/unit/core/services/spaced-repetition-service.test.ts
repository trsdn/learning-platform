import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpacedRepetitionService } from '@core/services/spaced-repetition-service';
import { NotFoundError } from '@core/types/entities';
import type { SpacedRepetitionItem } from '@core/types/services';
import type { ISpacedRepetitionRepository, ITaskRepository } from '@storage/types/adapters';
import { createMockTask, createMockFlashcardTask } from '@tests/fixtures';

// Helper to create mock SpacedRepetitionItem
function createMockSRItem(overrides: Partial<SpacedRepetitionItem> = {}): SpacedRepetitionItem {
  const now = new Date();
  return {
    id: 'sr-item-1',
    taskId: 'task-1',
    algorithm: {
      interval: 1,
      repetition: 0,
      efactor: 2.5,
    },
    schedule: {
      nextReview: new Date(now.getTime() - 1000), // Due in the past
      totalReviews: 0,
      consecutiveCorrect: 0,
    },
    performance: {
      averageAccuracy: 0,
      averageTime: 30000,
      difficultyRating: 3,
      lastGrade: 0,
    },
    metadata: {
      introduced: now,
      graduated: false,
      lapseCount: 0,
    },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('SpacedRepetitionService', () => {
  // Mock repositories
  let mockSpacedRepRepository: ISpacedRepetitionRepository;
  let mockTaskRepository: ITaskRepository;
  let service: SpacedRepetitionService;

  // Test data
  const mockTask = createMockTask();
  const mockTask2 = createMockFlashcardTask({ id: 'task-2' });
  const mockTask3 = createMockTask({ id: 'task-3' });

  beforeEach(() => {
    // Create mock implementations
    mockSpacedRepRepository = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      createMany: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
      exists: vi.fn(),
      getByTaskId: vi.fn(),
      getDue: vi.fn(),
      getByNextReviewDate: vi.fn(),
      updateAlgorithmData: vi.fn(),
      updateSchedule: vi.fn(),
      updatePerformance: vi.fn(),
      getReviewCalendar: vi.fn(),
    };

    mockTaskRepository = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      createMany: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
      exists: vi.fn(),
      getByLearningPathId: vi.fn(),
      getByLearningPathIds: vi.fn(),
      getByType: vi.fn(),
      getByDifficulty: vi.fn(),
      getByTags: vi.fn(),
      search: vi.fn(),
      getRandomTasks: vi.fn(),
    };

    // Instantiate service with mocks
    service = new SpacedRepetitionService(mockSpacedRepRepository, mockTaskRepository);
  });

  describe('Constructor', () => {
    it('should create instance with two repositories', () => {
      expect(service).toBeInstanceOf(SpacedRepetitionService);
      expect(service).toBeDefined();
    });

    it('should accept custom repository implementations', () => {
      const customSpacedRepRepo = { ...mockSpacedRepRepository };
      const customTaskRepo = { ...mockTaskRepository };

      const customService = new SpacedRepetitionService(customSpacedRepRepo, customTaskRepo);

      expect(customService).toBeInstanceOf(SpacedRepetitionService);
    });
  });

  describe('getNextTasks', () => {
    it('should return empty array when no due items exist', async () => {
      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([]);

      const result = await service.getNextTasks('user-1', 5);

      expect(mockSpacedRepRepository.getDue).toHaveBeenCalledOnce();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return tasks for due items up to requested count', async () => {
      const srItem1 = createMockSRItem({ id: 'sr-1', taskId: 'task-1' });
      const srItem2 = createMockSRItem({ id: 'sr-2', taskId: 'task-2' });

      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([srItem1, srItem2]);
      vi.mocked(mockTaskRepository.getById)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce(mockTask2);

      const result = await service.getNextTasks('user-1', 5);

      expect(mockSpacedRepRepository.getDue).toHaveBeenCalledOnce();
      expect(mockTaskRepository.getById).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result).toEqual([mockTask, mockTask2]);
    });

    it('should limit results to requested count', async () => {
      const srItems = [
        createMockSRItem({ id: 'sr-1', taskId: 'task-1' }),
        createMockSRItem({ id: 'sr-2', taskId: 'task-2' }),
        createMockSRItem({ id: 'sr-3', taskId: 'task-3' }),
      ];

      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue(srItems);
      vi.mocked(mockTaskRepository.getById)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce(mockTask2);

      const result = await service.getNextTasks('user-1', 2);

      expect(mockTaskRepository.getById).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('should prioritize items with more lapses', async () => {
      const now = new Date();
      const srItemHighLapse = createMockSRItem({
        id: 'sr-high-lapse',
        taskId: 'task-2',
        metadata: { introduced: now, graduated: false, lapseCount: 5 },
        schedule: { nextReview: now, totalReviews: 0, consecutiveCorrect: 0 },
      });
      const srItemLowLapse = createMockSRItem({
        id: 'sr-low-lapse',
        taskId: 'task-1',
        metadata: { introduced: now, graduated: false, lapseCount: 1 },
        schedule: { nextReview: now, totalReviews: 0, consecutiveCorrect: 0 },
      });

      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([srItemLowLapse, srItemHighLapse]);
      vi.mocked(mockTaskRepository.getById)
        .mockImplementation(async (id) => {
          if (id === 'task-1') return mockTask;
          if (id === 'task-2') return mockTask2;
          return null;
        });

      const result = await service.getNextTasks('user-1', 10);

      // Higher lapse count should come first
      expect(result[0]).toEqual(mockTask2);
      expect(result[1]).toEqual(mockTask);
    });

    it('should sort by overdue time when lapse counts are equal', async () => {
      const now = new Date();
      const moreOverdue = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const lessOverdue = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago

      const srItemMoreOverdue = createMockSRItem({
        id: 'sr-more-overdue',
        taskId: 'task-1',
        metadata: { introduced: now, graduated: false, lapseCount: 0 },
        schedule: { nextReview: moreOverdue, totalReviews: 0, consecutiveCorrect: 0 },
      });
      const srItemLessOverdue = createMockSRItem({
        id: 'sr-less-overdue',
        taskId: 'task-2',
        metadata: { introduced: now, graduated: false, lapseCount: 0 },
        schedule: { nextReview: lessOverdue, totalReviews: 0, consecutiveCorrect: 0 },
      });

      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([srItemLessOverdue, srItemMoreOverdue]);
      vi.mocked(mockTaskRepository.getById)
        .mockImplementation(async (id) => {
          if (id === 'task-1') return mockTask;
          if (id === 'task-2') return mockTask2;
          return null;
        });

      const result = await service.getNextTasks('user-1', 10);

      // More overdue should come first
      expect(result[0]).toEqual(mockTask);
      expect(result[1]).toEqual(mockTask2);
    });

    it('should skip items where task is not found', async () => {
      const srItem1 = createMockSRItem({ id: 'sr-1', taskId: 'task-1' });
      const srItemMissing = createMockSRItem({ id: 'sr-missing', taskId: 'missing-task' });
      const srItem3 = createMockSRItem({ id: 'sr-3', taskId: 'task-3' });

      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([srItem1, srItemMissing, srItem3]);
      vi.mocked(mockTaskRepository.getById)
        .mockImplementation(async (id) => {
          if (id === 'task-1') return mockTask;
          if (id === 'task-3') return mockTask3;
          return null; // missing-task returns null
        });

      const result = await service.getNextTasks('user-1', 10);

      expect(result).toHaveLength(2);
      expect(result).toEqual([mockTask, mockTask3]);
    });

    it('should handle count of zero', async () => {
      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([
        createMockSRItem({ id: 'sr-1', taskId: 'task-1' }),
      ]);

      const result = await service.getNextTasks('user-1', 0);

      expect(result).toHaveLength(0);
      expect(mockTaskRepository.getById).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed');
      vi.mocked(mockSpacedRepRepository.getDue).mockRejectedValue(error);

      await expect(service.getNextTasks('user-1', 5)).rejects.toThrow('Database connection failed');
    });
  });

  describe('recordAnswer', () => {
    describe('Grade validation', () => {
      it('should throw error for grade below 0', async () => {
        await expect(service.recordAnswer('task-1', true, -1)).rejects.toThrow(
          'Grade must be between 0 and 5'
        );
      });

      it('should throw error for grade above 5', async () => {
        await expect(service.recordAnswer('task-1', true, 6)).rejects.toThrow(
          'Grade must be between 0 and 5'
        );
      });

      it('should accept grade 0', async () => {
        vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(createMockSRItem());
        vi.mocked(mockSpacedRepRepository.update).mockResolvedValue(createMockSRItem());

        await expect(service.recordAnswer('task-1', false, 0)).resolves.not.toThrow();
      });

      it('should accept grade 5', async () => {
        vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(createMockSRItem());
        vi.mocked(mockSpacedRepRepository.update).mockResolvedValue(createMockSRItem());

        await expect(service.recordAnswer('task-1', true, 5)).resolves.not.toThrow();
      });

      it('should accept grade 3 (passing threshold)', async () => {
        vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(createMockSRItem());
        vi.mocked(mockSpacedRepRepository.update).mockResolvedValue(createMockSRItem());

        await expect(service.recordAnswer('task-1', true, 3)).resolves.not.toThrow();
      });
    });

    describe('New item creation', () => {
      it('should create new SR item for first review', async () => {
        vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(null);
        vi.mocked(mockSpacedRepRepository.create).mockImplementation(async (item) => ({
          ...item,
          id: 'new-sr-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        }) as SpacedRepetitionItem);
        vi.mocked(mockSpacedRepRepository.update).mockResolvedValue(createMockSRItem());

        await service.recordAnswer('task-new', true, 4);

        expect(mockSpacedRepRepository.getByTaskId).toHaveBeenCalledWith('task-new');
        expect(mockSpacedRepRepository.create).toHaveBeenCalledOnce();
        expect(mockSpacedRepRepository.update).toHaveBeenCalledOnce();
      });

      it('should generate unique ID for new SR item', async () => {
        vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(null);
        vi.mocked(mockSpacedRepRepository.create).mockImplementation(async (item) => ({
          ...item,
          createdAt: new Date(),
          updatedAt: new Date(),
        }) as SpacedRepetitionItem);
        vi.mocked(mockSpacedRepRepository.update).mockResolvedValue(createMockSRItem());

        await service.recordAnswer('task-new', true, 4);

        const createCall = vi.mocked(mockSpacedRepRepository.create).mock.calls[0][0];
        expect(createCall.id).toMatch(/^sr-task-new-\d+$/);
      });
    });

    describe('Existing item update', () => {
      it('should update existing SR item', async () => {
        const existingSRItem = createMockSRItem({ id: 'existing-sr', taskId: 'task-1' });
        vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(existingSRItem);
        vi.mocked(mockSpacedRepRepository.update).mockResolvedValue(existingSRItem);

        await service.recordAnswer('task-1', true, 4);

        expect(mockSpacedRepRepository.create).not.toHaveBeenCalled();
        expect(mockSpacedRepRepository.update).toHaveBeenCalledWith(
          'existing-sr',
          expect.any(Object)
        );
      });

      it('should pass grade to entity recordAnswer method', async () => {
        const existingSRItem = createMockSRItem({ id: 'existing-sr', taskId: 'task-1' });
        vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(existingSRItem);
        vi.mocked(mockSpacedRepRepository.update).mockResolvedValue(existingSRItem);

        await service.recordAnswer('task-1', true, 5);

        const updateCall = vi.mocked(mockSpacedRepRepository.update).mock.calls[0][1];
        expect(updateCall.performance.lastGrade).toBe(5);
      });
    });

    describe('SM-2 algorithm integration', () => {
      it('should increment repetition count for passing grade', async () => {
        const existingSRItem = createMockSRItem({
          algorithm: { interval: 1, repetition: 0, efactor: 2.5 },
        });
        vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(existingSRItem);
        vi.mocked(mockSpacedRepRepository.update).mockResolvedValue(existingSRItem);

        await service.recordAnswer('task-1', true, 4);

        const updateCall = vi.mocked(mockSpacedRepRepository.update).mock.calls[0][1];
        expect(updateCall.algorithm.repetition).toBe(1);
      });

      it('should reset repetition count for failing grade', async () => {
        const existingSRItem = createMockSRItem({
          algorithm: { interval: 6, repetition: 2, efactor: 2.5 },
        });
        vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(existingSRItem);
        vi.mocked(mockSpacedRepRepository.update).mockResolvedValue(existingSRItem);

        await service.recordAnswer('task-1', false, 2);

        const updateCall = vi.mocked(mockSpacedRepRepository.update).mock.calls[0][1];
        expect(updateCall.algorithm.repetition).toBe(0);
        expect(updateCall.algorithm.interval).toBe(1);
      });

      it('should increase lapse count for failing grade', async () => {
        const existingSRItem = createMockSRItem({
          metadata: { introduced: new Date(), graduated: true, lapseCount: 2 },
        });
        vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(existingSRItem);
        vi.mocked(mockSpacedRepRepository.update).mockResolvedValue(existingSRItem);

        await service.recordAnswer('task-1', false, 1);

        const updateCall = vi.mocked(mockSpacedRepRepository.update).mock.calls[0][1];
        expect(updateCall.metadata.lapseCount).toBe(3);
        expect(updateCall.metadata.graduated).toBe(false);
      });
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Update failed');
      vi.mocked(mockSpacedRepRepository.getByTaskId).mockRejectedValue(error);

      await expect(service.recordAnswer('task-1', true, 4)).rejects.toThrow('Update failed');
    });
  });

  describe('getRepetitionData', () => {
    it('should return SR item for existing task', async () => {
      const srItem = createMockSRItem({ taskId: 'task-1' });
      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(srItem);

      const result = await service.getRepetitionData('task-1');

      expect(mockSpacedRepRepository.getByTaskId).toHaveBeenCalledWith('task-1');
      expect(result).toEqual(srItem);
    });

    it('should return null for non-existent task', async () => {
      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(null);

      const result = await service.getRepetitionData('non-existent-task');

      expect(mockSpacedRepRepository.getByTaskId).toHaveBeenCalledWith('non-existent-task');
      expect(result).toBeNull();
    });

    it('should handle various task ID formats', async () => {
      const specialId = 'task-uuid-123-abc-def';
      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(createMockSRItem());

      await service.getRepetitionData(specialId);

      expect(mockSpacedRepRepository.getByTaskId).toHaveBeenCalledWith(specialId);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Repository error');
      vi.mocked(mockSpacedRepRepository.getByTaskId).mockRejectedValue(error);

      await expect(service.getRepetitionData('task-1')).rejects.toThrow('Repository error');
    });
  });

  describe('getTasksDue', () => {
    it('should return empty array when no due items', async () => {
      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([]);

      const result = await service.getTasksDue('user-1');

      expect(mockSpacedRepRepository.getDue).toHaveBeenCalledOnce();
      expect(result).toEqual([]);
    });

    it('should return tasks for all due items', async () => {
      const srItem1 = createMockSRItem({ id: 'sr-1', taskId: 'task-1' });
      const srItem2 = createMockSRItem({ id: 'sr-2', taskId: 'task-2' });

      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([srItem1, srItem2]);
      vi.mocked(mockTaskRepository.getById)
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce(mockTask2);

      const result = await service.getTasksDue('user-1');

      expect(result).toHaveLength(2);
      expect(result).toEqual([mockTask, mockTask2]);
    });

    it('should skip items where task is not found', async () => {
      const srItem1 = createMockSRItem({ id: 'sr-1', taskId: 'task-1' });
      const srItemMissing = createMockSRItem({ id: 'sr-missing', taskId: 'missing-task' });

      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([srItem1, srItemMissing]);
      vi.mocked(mockTaskRepository.getById)
        .mockImplementation(async (id) => {
          if (id === 'task-1') return mockTask;
          return null;
        });

      const result = await service.getTasksDue('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockTask);
    });

    it('should call getDue with current date', async () => {
      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([]);

      const beforeCall = new Date();
      await service.getTasksDue('user-1');
      const afterCall = new Date();

      const callDate = vi.mocked(mockSpacedRepRepository.getDue).mock.calls[0][0];
      expect(callDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(callDate.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Failed to fetch due items');
      vi.mocked(mockSpacedRepRepository.getDue).mockRejectedValue(error);

      await expect(service.getTasksDue('user-1')).rejects.toThrow('Failed to fetch due items');
    });
  });

  describe('getReviewSchedule', () => {
    it('should return schedule for requested number of days', async () => {
      vi.mocked(mockSpacedRepRepository.getByNextReviewDate).mockResolvedValue([]);

      const result = await service.getReviewSchedule('user-1', 7);

      expect(mockSpacedRepRepository.getByNextReviewDate).toHaveBeenCalledTimes(7);
      expect(result).toHaveLength(7);
    });

    it('should return empty schedule for 0 days', async () => {
      const result = await service.getReviewSchedule('user-1', 0);

      expect(mockSpacedRepRepository.getByNextReviewDate).not.toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });

    it('should calculate correct task count per day', async () => {
      const srItems = [
        createMockSRItem({ id: 'sr-1' }),
        createMockSRItem({ id: 'sr-2' }),
        createMockSRItem({ id: 'sr-3' }),
      ];

      vi.mocked(mockSpacedRepRepository.getByNextReviewDate)
        .mockResolvedValueOnce(srItems) // Day 1: 3 items
        .mockResolvedValueOnce([srItems[0]]) // Day 2: 1 item
        .mockResolvedValueOnce([]); // Day 3: 0 items

      const result = await service.getReviewSchedule('user-1', 3);

      expect(result[0].taskCount).toBe(3);
      expect(result[1].taskCount).toBe(1);
      expect(result[2].taskCount).toBe(0);
    });

    it('should calculate estimated time from average times', async () => {
      const srItems = [
        createMockSRItem({ id: 'sr-1', performance: { averageAccuracy: 80, averageTime: 30000, difficultyRating: 3, lastGrade: 4 } }),
        createMockSRItem({ id: 'sr-2', performance: { averageAccuracy: 90, averageTime: 20000, difficultyRating: 2, lastGrade: 5 } }),
      ];

      vi.mocked(mockSpacedRepRepository.getByNextReviewDate).mockResolvedValue(srItems);

      const result = await service.getReviewSchedule('user-1', 1);

      // 30000 + 20000 = 50000ms = 50 seconds
      expect(result[0].estimatedTime).toBe(50);
    });

    it('should use default time when averageTime is 0', async () => {
      const srItem = createMockSRItem({
        performance: { averageAccuracy: 0, averageTime: 0, difficultyRating: 3, lastGrade: 0 },
      });

      vi.mocked(mockSpacedRepRepository.getByNextReviewDate).mockResolvedValue([srItem]);

      const result = await service.getReviewSchedule('user-1', 1);

      // Default is 30000ms = 30 seconds
      expect(result[0].estimatedTime).toBe(30);
    });

    it('should set date to end of each day', async () => {
      vi.mocked(mockSpacedRepRepository.getByNextReviewDate).mockResolvedValue([]);

      const result = await service.getReviewSchedule('user-1', 3);

      result.forEach((schedule) => {
        expect(schedule.date.getHours()).toBe(23);
        expect(schedule.date.getMinutes()).toBe(59);
        expect(schedule.date.getSeconds()).toBe(59);
        expect(schedule.date.getMilliseconds()).toBe(999);
      });
    });

    it('should return consecutive days', async () => {
      vi.mocked(mockSpacedRepRepository.getByNextReviewDate).mockResolvedValue([]);

      const result = await service.getReviewSchedule('user-1', 5);

      for (let i = 1; i < result.length; i++) {
        const prevDate = new Date(result[i - 1].date);
        const currDate = new Date(result[i].date);
        prevDate.setHours(0, 0, 0, 0);
        currDate.setHours(0, 0, 0, 0);

        const dayDiff = (currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000);
        expect(dayDiff).toBe(1);
      }
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Failed to fetch schedule');
      vi.mocked(mockSpacedRepRepository.getByNextReviewDate).mockRejectedValue(error);

      await expect(service.getReviewSchedule('user-1', 7)).rejects.toThrow('Failed to fetch schedule');
    });
  });

  describe('rescheduleTask', () => {
    it('should reschedule existing task to new date', async () => {
      const existingSRItem = createMockSRItem({ id: 'sr-1', taskId: 'task-1' });
      const newDate = new Date('2025-01-15');

      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(existingSRItem);
      vi.mocked(mockSpacedRepRepository.updateSchedule).mockResolvedValue(undefined);

      await service.rescheduleTask('task-1', newDate);

      expect(mockSpacedRepRepository.getByTaskId).toHaveBeenCalledWith('task-1');
      expect(mockSpacedRepRepository.updateSchedule).toHaveBeenCalledWith(
        'sr-1',
        expect.objectContaining({ nextReview: newDate })
      );
    });

    it('should preserve other schedule fields when rescheduling', async () => {
      const existingSRItem = createMockSRItem({
        id: 'sr-1',
        taskId: 'task-1',
        schedule: {
          nextReview: new Date('2025-01-01'),
          lastReviewed: new Date('2024-12-25'),
          totalReviews: 5,
          consecutiveCorrect: 3,
        },
      });
      const newDate = new Date('2025-01-20');

      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(existingSRItem);
      vi.mocked(mockSpacedRepRepository.updateSchedule).mockResolvedValue(undefined);

      await service.rescheduleTask('task-1', newDate);

      const updateCall = vi.mocked(mockSpacedRepRepository.updateSchedule).mock.calls[0][1];
      expect(updateCall.totalReviews).toBe(5);
      expect(updateCall.consecutiveCorrect).toBe(3);
      expect(updateCall.nextReview).toEqual(newDate);
    });

    it('should throw NotFoundError for non-existent task', async () => {
      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(null);

      await expect(service.rescheduleTask('non-existent', new Date())).rejects.toThrow(NotFoundError);
      await expect(service.rescheduleTask('non-existent', new Date())).rejects.toThrow(
        'SpacedRepetitionItem with id non-existent not found'
      );
    });

    it('should handle various date formats', async () => {
      const existingSRItem = createMockSRItem({ id: 'sr-1', taskId: 'task-1' });
      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(existingSRItem);
      vi.mocked(mockSpacedRepRepository.updateSchedule).mockResolvedValue(undefined);

      const dateFromString = new Date('2025-06-15T10:30:00Z');
      await service.rescheduleTask('task-1', dateFromString);

      const updateCall = vi.mocked(mockSpacedRepRepository.updateSchedule).mock.calls[0][1];
      expect(updateCall.nextReview).toEqual(dateFromString);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Update failed');
      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(createMockSRItem());
      vi.mocked(mockSpacedRepRepository.updateSchedule).mockRejectedValue(error);

      await expect(service.rescheduleTask('task-1', new Date())).rejects.toThrow('Update failed');
    });
  });

  describe('getStatistics', () => {
    it('should return statistics for all items', async () => {
      const allItems = [
        createMockSRItem({
          id: 'sr-1',
          algorithm: { interval: 10, repetition: 3, efactor: 2.3 },
          performance: { averageAccuracy: 80, averageTime: 25000, difficultyRating: 3, lastGrade: 4 },
          metadata: { introduced: new Date(), graduated: true, lapseCount: 0 },
        }),
        createMockSRItem({
          id: 'sr-2',
          algorithm: { interval: 5, repetition: 1, efactor: 2.1 },
          performance: { averageAccuracy: 60, averageTime: 35000, difficultyRating: 4, lastGrade: 3 },
          metadata: { introduced: new Date(), graduated: false, lapseCount: 2 },
        }),
      ];
      const dueItems = [allItems[1]];

      vi.mocked(mockSpacedRepRepository.getAll).mockResolvedValue(allItems);
      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue(dueItems);

      const result = await service.getStatistics('user-1');

      expect(result.totalItems).toBe(2);
      expect(result.dueToday).toBe(1);
      expect(result.graduated).toBe(1);
      expect(result.averageInterval).toBe(7.5); // (10 + 5) / 2
      expect(result.averageAccuracy).toBe(70); // (80 + 60) / 2
    });

    it('should return zero averages for empty collection', async () => {
      vi.mocked(mockSpacedRepRepository.getAll).mockResolvedValue([]);
      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([]);

      const result = await service.getStatistics('user-1');

      expect(result.totalItems).toBe(0);
      expect(result.dueToday).toBe(0);
      expect(result.graduated).toBe(0);
      expect(result.averageInterval).toBe(0);
      expect(result.averageAccuracy).toBe(0);
    });

    it('should count only graduated items', async () => {
      const allItems = [
        createMockSRItem({ id: 'sr-1', metadata: { introduced: new Date(), graduated: true, lapseCount: 0 } }),
        createMockSRItem({ id: 'sr-2', metadata: { introduced: new Date(), graduated: false, lapseCount: 1 } }),
        createMockSRItem({ id: 'sr-3', metadata: { introduced: new Date(), graduated: true, lapseCount: 0 } }),
        createMockSRItem({ id: 'sr-4', metadata: { introduced: new Date(), graduated: false, lapseCount: 3 } }),
      ];

      vi.mocked(mockSpacedRepRepository.getAll).mockResolvedValue(allItems);
      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([]);

      const result = await service.getStatistics('user-1');

      expect(result.graduated).toBe(2);
    });

    it('should calculate correct due today count', async () => {
      const allItems = [
        createMockSRItem({ id: 'sr-1' }),
        createMockSRItem({ id: 'sr-2' }),
        createMockSRItem({ id: 'sr-3' }),
      ];
      const dueItems = [allItems[0], allItems[2]];

      vi.mocked(mockSpacedRepRepository.getAll).mockResolvedValue(allItems);
      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue(dueItems);

      const result = await service.getStatistics('user-1');

      expect(result.dueToday).toBe(2);
    });

    it('should call getDue with current date', async () => {
      vi.mocked(mockSpacedRepRepository.getAll).mockResolvedValue([]);
      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([]);

      const beforeCall = new Date();
      await service.getStatistics('user-1');
      const afterCall = new Date();

      const callDate = vi.mocked(mockSpacedRepRepository.getDue).mock.calls[0][0];
      expect(callDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(callDate.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it('should propagate repository errors from getAll', async () => {
      const error = new Error('Failed to fetch all items');
      vi.mocked(mockSpacedRepRepository.getAll).mockRejectedValue(error);

      await expect(service.getStatistics('user-1')).rejects.toThrow('Failed to fetch all items');
    });

    it('should propagate repository errors from getDue', async () => {
      const error = new Error('Failed to fetch due items');
      vi.mocked(mockSpacedRepRepository.getAll).mockResolvedValue([]);
      vi.mocked(mockSpacedRepRepository.getDue).mockRejectedValue(error);

      await expect(service.getStatistics('user-1')).rejects.toThrow('Failed to fetch due items');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle sequential calls to different methods', async () => {
      const srItem = createMockSRItem({ id: 'sr-1', taskId: 'task-1' });

      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(srItem);
      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([srItem]);
      vi.mocked(mockTaskRepository.getById).mockResolvedValue(mockTask);

      const repData = await service.getRepetitionData('task-1');
      const dueTasks = await service.getTasksDue('user-1');

      expect(repData).toEqual(srItem);
      expect(dueTasks).toHaveLength(1);
    });

    it('should maintain state independence between calls', async () => {
      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(createMockSRItem());

      const result1 = await service.getRepetitionData('task-1');
      const result2 = await service.getRepetitionData('task-1');

      expect(result1).toEqual(result2);
      expect(mockSpacedRepRepository.getByTaskId).toHaveBeenCalledTimes(2);
    });

    it('should handle parallel calls correctly', async () => {
      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(createMockSRItem());
      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue([]);
      vi.mocked(mockSpacedRepRepository.getAll).mockResolvedValue([]);

      const [repData, dueTasks, stats] = await Promise.all([
        service.getRepetitionData('task-1'),
        service.getTasksDue('user-1'),
        service.getStatistics('user-1'),
      ]);

      expect(repData).toBeDefined();
      expect(dueTasks).toEqual([]);
      expect(stats.totalItems).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle very large number of items', async () => {
      const largeItemList = Array.from({ length: 1000 }, (_, i) =>
        createMockSRItem({
          id: `sr-${i}`,
          taskId: `task-${i}`,
          algorithm: { interval: i % 365, repetition: i % 10, efactor: 1.3 + (i % 12) * 0.1 },
          performance: { averageAccuracy: i % 100, averageTime: 20000 + i * 100, difficultyRating: 3, lastGrade: i % 6 },
        })
      );

      vi.mocked(mockSpacedRepRepository.getAll).mockResolvedValue(largeItemList);
      vi.mocked(mockSpacedRepRepository.getDue).mockResolvedValue(largeItemList.slice(0, 100));

      const result = await service.getStatistics('user-1');

      expect(result.totalItems).toBe(1000);
      expect(result.dueToday).toBe(100);
    });

    it('should handle special characters in task IDs', async () => {
      const specialId = 'task-with-special-chars-@#$%^&*()';
      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(null);

      const result = await service.getRepetitionData(specialId);

      expect(mockSpacedRepRepository.getByTaskId).toHaveBeenCalledWith(specialId);
      expect(result).toBeNull();
    });

    it('should handle repository returning undefined instead of null', async () => {
      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(
        undefined as unknown as null
      );

      const result = await service.getRepetitionData('undefined-case');

      expect(result).toBeUndefined();
    });

    it('should handle items with extreme efactor values', async () => {
      const itemWithMinEfactor = createMockSRItem({
        algorithm: { interval: 1, repetition: 0, efactor: 1.3 },
      });

      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(itemWithMinEfactor);
      vi.mocked(mockSpacedRepRepository.update).mockResolvedValue(itemWithMinEfactor);

      await expect(service.recordAnswer('task-1', true, 4)).resolves.not.toThrow();
    });

    it('should handle items with maximum interval', async () => {
      const itemWithMaxInterval = createMockSRItem({
        algorithm: { interval: 365, repetition: 50, efactor: 2.5 },
      });

      vi.mocked(mockSpacedRepRepository.getByTaskId).mockResolvedValue(itemWithMaxInterval);
      vi.mocked(mockSpacedRepRepository.update).mockResolvedValue(itemWithMaxInterval);

      await service.recordAnswer('task-1', true, 5);

      const updateCall = vi.mocked(mockSpacedRepRepository.update).mock.calls[0][1];
      // Interval should be capped at 365
      expect(updateCall.algorithm.interval).toBeLessThanOrEqual(365);
    });
  });
});
