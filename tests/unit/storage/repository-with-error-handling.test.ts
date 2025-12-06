/**
 * Tests for repository-with-error-handling
 *
 * Tests the repository wrapper that adds error handling and retry logic
 * to repository methods using Proxy pattern.
 *
 * Coverage targets:
 * - All 7 wrapper functions (wrapTopicRepository, wrapLearningPathRepository, etc.)
 * - Proxy wrapping behavior - methods get wrapped with retry logic
 * - Read vs write operation detection
 * - READ_RETRY_OPTIONS applied to read operations
 * - WRITE_RETRY_OPTIONS applied to write operations
 * - Non-function properties are not wrapped
 * - Error propagation from withRetry
 * - Generic wrapRepository function
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  wrapTopicRepository,
  wrapLearningPathRepository,
  wrapTaskRepository,
  wrapUserProgressRepository,
  wrapPracticeSessionRepository,
  wrapAnswerHistoryRepository,
  wrapSpacedRepetitionRepository,
  wrapRepository,
} from '../../../src/modules/storage/adapters/repository-with-error-handling';

// Mock the error-handler module
// The mock withRetry needs to actually execute and return the result of the function
vi.mock('../../../src/modules/core/utils/error-handler', () => ({
  withRetry: vi.fn(async (fn, _operationName, _opts) => await fn()),
}));

// Import after mocking
import { withRetry } from '../../../src/modules/core/utils/error-handler';

describe('repository-with-error-handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore the mock implementation after clearing
    vi.mocked(withRetry).mockImplementation(async (fn, _operationName, _opts) => await fn());
  });

  describe('Proxy Wrapping Behavior', () => {
    it('should wrap function methods with retry logic', async () => {
      const mockRepository = {
        getAll: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }]),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');
      await wrapped.getAll();

      expect(withRetry).toHaveBeenCalledTimes(1);
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
    });

    it('should not wrap non-function properties', () => {
      const mockRepository = {
        name: 'TestRepository',
        version: 1,
        config: { timeout: 5000 },
        getAll: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      // Non-function properties should be accessible without wrapping
      expect(wrapped.name).toBe('TestRepository');
      expect(wrapped.version).toBe(1);
      expect(wrapped.config).toEqual({ timeout: 5000 });

      // withRetry should not be called for property access
      expect(withRetry).not.toHaveBeenCalled();
    });

    it('should preserve method context when calling wrapped methods', async () => {
      const mockRepository = {
        value: 'test-value',
        getValue: vi.fn(function (this: { value: string }) {
          return Promise.resolve(this.value);
        }),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');
      const result = await wrapped.getValue();

      expect(result).toBe('test-value');
    });

    it('should pass all arguments to wrapped methods', async () => {
      const mockRepository = {
        create: vi.fn().mockResolvedValue({ id: '1' }),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');
      const testData = { name: 'Test', value: 123 };
      await wrapped.create(testData, { validate: true });

      expect(mockRepository.create).toHaveBeenCalledWith(testData, { validate: true });
    });
  });

  describe('Read vs Write Operation Detection', () => {
    it('should detect read operations correctly', async () => {
      const mockRepository = {
        getAll: vi.fn().mockResolvedValue([]),
        getById: vi.fn().mockResolvedValue(null),
        find: vi.fn().mockResolvedValue([]),
        search: vi.fn().mockResolvedValue([]),
        query: vi.fn().mockResolvedValue([]),
        list: vi.fn().mockResolvedValue([]),
        fetch: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      await wrapped.getAll();
      await wrapped.getById('1');
      await wrapped.find({});
      await wrapped.search('query');
      await wrapped.query({});
      await wrapped.list();
      await wrapped.fetch();

      // Verify all read operations use READ_RETRY_OPTIONS
      expect(withRetry).toHaveBeenCalledTimes(7);

      // Check that READ_RETRY_OPTIONS were used (maxRetries: 3)
      const calls = vi.mocked(withRetry).mock.calls;
      calls.forEach((call) => {
        const options = call[2];
        expect(options).toEqual({
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 5000,
          timeout: 15000,
        });
      });
    });

    it('should detect write operations starting with "create"', async () => {
      const mockRepository = {
        create: vi.fn().mockResolvedValue({ id: '1' }),
        createMany: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      await wrapped.create({ name: 'Test' });
      await wrapped.createMany([]);

      expect(withRetry).toHaveBeenCalledTimes(2);

      // Check that WRITE_RETRY_OPTIONS were used (maxRetries: 2)
      const calls = vi.mocked(withRetry).mock.calls;
      calls.forEach((call) => {
        const options = call[2];
        expect(options).toEqual({
          maxRetries: 2,
          baseDelay: 2000,
          maxDelay: 8000,
          timeout: 20000,
        });
      });
    });

    it('should detect write operations starting with "update"', async () => {
      const mockRepository = {
        update: vi.fn().mockResolvedValue({ id: '1' }),
        updateMany: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      await wrapped.update('1', { name: 'Updated' });
      await wrapped.updateMany([]);

      expect(withRetry).toHaveBeenCalledTimes(2);

      // Verify WRITE_RETRY_OPTIONS
      const calls = vi.mocked(withRetry).mock.calls;
      calls.forEach((call) => {
        const options = call[2];
        expect(options?.maxRetries).toBe(2);
        expect(options?.baseDelay).toBe(2000);
      });
    });

    it('should detect write operations starting with "delete"', async () => {
      const mockRepository = {
        delete: vi.fn().mockResolvedValue(undefined),
        deleteMany: vi.fn().mockResolvedValue({ count: 5 }),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      await wrapped.delete('1');
      await wrapped.deleteMany(['1', '2']);

      expect(withRetry).toHaveBeenCalledTimes(2);

      // Verify WRITE_RETRY_OPTIONS
      const calls = vi.mocked(withRetry).mock.calls;
      calls.forEach((call) => {
        const options = call[2];
        expect(options?.maxRetries).toBe(2);
      });
    });

    it('should detect write operations starting with "upsert"', async () => {
      const mockRepository = {
        upsert: vi.fn().mockResolvedValue({ id: '1' }),
        upsertMany: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      await wrapped.upsert({ id: '1', name: 'Test' });
      await wrapped.upsertMany([]);

      expect(withRetry).toHaveBeenCalledTimes(2);

      // Verify WRITE_RETRY_OPTIONS
      const calls = vi.mocked(withRetry).mock.calls;
      calls.forEach((call) => {
        const options = call[2];
        expect(options?.maxRetries).toBe(2);
      });
    });

    it('should detect write operations starting with "record"', async () => {
      const mockRepository = {
        recordAnswer: vi.fn().mockResolvedValue({ id: '1' }),
        recordProgress: vi.fn().mockResolvedValue({ id: '1' }),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      await wrapped.recordAnswer({});
      await wrapped.recordProgress({});

      expect(withRetry).toHaveBeenCalledTimes(2);

      // Verify WRITE_RETRY_OPTIONS
      const calls = vi.mocked(withRetry).mock.calls;
      calls.forEach((call) => {
        const options = call[2];
        expect(options?.maxRetries).toBe(2);
      });
    });

    it('should detect write operations starting with "increment"', async () => {
      const mockRepository = {
        incrementCounter: vi.fn().mockResolvedValue({ count: 1 }),
        incrementViews: vi.fn().mockResolvedValue({ views: 10 }),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      await wrapped.incrementCounter('id1');
      await wrapped.incrementViews('id2');

      expect(withRetry).toHaveBeenCalledTimes(2);

      // Verify WRITE_RETRY_OPTIONS
      const calls = vi.mocked(withRetry).mock.calls;
      calls.forEach((call) => {
        const options = call[2];
        expect(options?.maxRetries).toBe(2);
      });
    });
  });

  describe('Operation Name Generation', () => {
    it('should generate correct operation names for withRetry', async () => {
      const mockRepository = {
        getAll: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: '1' }),
      };

      const wrapped = wrapRepository(mockRepository, 'UserRepository');

      await wrapped.getAll();
      await wrapped.create({});

      expect(withRetry).toHaveBeenCalledTimes(2);

      const calls = vi.mocked(withRetry).mock.calls;
      expect(calls[0]![1]).toBe('UserRepository.getAll');
      expect(calls[1]![1]).toBe('UserRepository.create');
    });
  });

  describe('Error Propagation', () => {
    it('should propagate errors from withRetry', async () => {
      const testError = new Error('Database connection failed');

      vi.mocked(withRetry).mockRejectedValueOnce(testError);

      const mockRepository = {
        getAll: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      await expect(wrapped.getAll()).rejects.toThrow('Database connection failed');
    });

    it('should propagate errors even when original method would succeed', async () => {
      const testError = new Error('Retry logic error');

      vi.mocked(withRetry).mockRejectedValueOnce(testError);

      const mockRepository = {
        create: vi.fn().mockResolvedValue({ id: '1' }),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      await expect(wrapped.create({})).rejects.toThrow('Retry logic error');
    });
  });

  describe('wrapTopicRepository', () => {
    it('should wrap repository with default name "TopicRepository"', async () => {
      const mockRepository = {
        getAll: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapTopicRepository(mockRepository);
      await wrapped.getAll();

      expect(withRetry).toHaveBeenCalledTimes(1);
      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('TopicRepository.getAll');
    });

    it('should allow custom repository name', async () => {
      const mockRepository = {
        getAll: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapTopicRepository(mockRepository, 'CustomTopicRepo');
      await wrapped.getAll();

      expect(withRetry).toHaveBeenCalledTimes(1);
      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('CustomTopicRepo.getAll');
    });

    it('should wrap both read and write operations', async () => {
      const mockRepository = {
        getById: vi.fn().mockResolvedValue({ id: '1' }),
        create: vi.fn().mockResolvedValue({ id: '2' }),
        update: vi.fn().mockResolvedValue({ id: '1' }),
        delete: vi.fn().mockResolvedValue(undefined),
      };

      const wrapped = wrapTopicRepository(mockRepository);

      await wrapped.getById('1');
      await wrapped.create({});
      await wrapped.update('1', {});
      await wrapped.delete('1');

      expect(withRetry).toHaveBeenCalledTimes(4);

      // Verify correct retry options
      const calls = vi.mocked(withRetry).mock.calls;
      expect(calls[0]![2]?.maxRetries).toBe(3); // read
      expect(calls[1]![2]?.maxRetries).toBe(2); // write
      expect(calls[2]![2]?.maxRetries).toBe(2); // write
      expect(calls[3]![2]?.maxRetries).toBe(2); // write
    });
  });

  describe('wrapLearningPathRepository', () => {
    it('should wrap repository with default name "LearningPathRepository"', async () => {
      const mockRepository = {
        getAll: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapLearningPathRepository(mockRepository);
      await wrapped.getAll();

      expect(withRetry).toHaveBeenCalledTimes(1);
      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('LearningPathRepository.getAll');
    });

    it('should allow custom repository name', async () => {
      const mockRepository = {
        find: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapLearningPathRepository(mockRepository, 'PathRepo');
      await wrapped.find({});

      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('PathRepo.find');
    });
  });

  describe('wrapTaskRepository', () => {
    it('should wrap repository with default name "TaskRepository"', async () => {
      const mockRepository = {
        getAll: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapTaskRepository(mockRepository);
      await wrapped.getAll();

      expect(withRetry).toHaveBeenCalledTimes(1);
      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('TaskRepository.getAll');
    });

    it('should allow custom repository name', async () => {
      const mockRepository = {
        create: vi.fn().mockResolvedValue({ id: '1' }),
      };

      const wrapped = wrapTaskRepository(mockRepository, 'TaskRepo');
      await wrapped.create({});

      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('TaskRepo.create');
    });
  });

  describe('wrapUserProgressRepository', () => {
    it('should wrap repository with default name "UserProgressRepository"', async () => {
      const mockRepository = {
        getAll: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapUserProgressRepository(mockRepository);
      await wrapped.getAll();

      expect(withRetry).toHaveBeenCalledTimes(1);
      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('UserProgressRepository.getAll');
    });

    it('should allow custom repository name', async () => {
      const mockRepository = {
        update: vi.fn().mockResolvedValue({ id: '1' }),
      };

      const wrapped = wrapUserProgressRepository(mockRepository, 'ProgressRepo');
      await wrapped.update('1', {});

      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('ProgressRepo.update');
    });
  });

  describe('wrapPracticeSessionRepository', () => {
    it('should wrap repository with default name "PracticeSessionRepository"', async () => {
      const mockRepository = {
        getAll: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapPracticeSessionRepository(mockRepository);
      await wrapped.getAll();

      expect(withRetry).toHaveBeenCalledTimes(1);
      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('PracticeSessionRepository.getAll');
    });

    it('should allow custom repository name', async () => {
      const mockRepository = {
        create: vi.fn().mockResolvedValue({ id: '1' }),
      };

      const wrapped = wrapPracticeSessionRepository(mockRepository, 'SessionRepo');
      await wrapped.create({});

      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('SessionRepo.create');
    });
  });

  describe('wrapAnswerHistoryRepository', () => {
    it('should wrap repository with default name "AnswerHistoryRepository"', async () => {
      const mockRepository = {
        getAll: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapAnswerHistoryRepository(mockRepository);
      await wrapped.getAll();

      expect(withRetry).toHaveBeenCalledTimes(1);
      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('AnswerHistoryRepository.getAll');
    });

    it('should allow custom repository name', async () => {
      const mockRepository = {
        recordAnswer: vi.fn().mockResolvedValue({ id: '1' }),
      };

      const wrapped = wrapAnswerHistoryRepository(mockRepository, 'HistoryRepo');
      await wrapped.recordAnswer({});

      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('HistoryRepo.recordAnswer');
    });
  });

  describe('wrapSpacedRepetitionRepository', () => {
    it('should wrap repository with default name "SpacedRepetitionRepository"', async () => {
      const mockRepository = {
        getAll: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapSpacedRepetitionRepository(mockRepository);
      await wrapped.getAll();

      expect(withRetry).toHaveBeenCalledTimes(1);
      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('SpacedRepetitionRepository.getAll');
    });

    it('should allow custom repository name', async () => {
      const mockRepository = {
        update: vi.fn().mockResolvedValue({ id: '1' }),
      };

      const wrapped = wrapSpacedRepetitionRepository(mockRepository, 'SRRepo');
      await wrapped.update('1', {});

      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('SRRepo.update');
    });
  });

  describe('wrapRepository (Generic Wrapper)', () => {
    it('should wrap any repository with custom name', async () => {
      const mockRepository = {
        customMethod: vi.fn().mockResolvedValue('result'),
      };

      const wrapped = wrapRepository(mockRepository, 'CustomRepository');
      await wrapped.customMethod();

      expect(withRetry).toHaveBeenCalledTimes(1);
      const call = vi.mocked(withRetry).mock.calls[0]!;
      expect(call[1]).toBe('CustomRepository.customMethod');
    });

    it('should handle repositories with mixed method types', async () => {
      const mockRepository = {
        // Read operations
        getAll: vi.fn().mockResolvedValue([]),
        findById: vi.fn().mockResolvedValue(null),
        search: vi.fn().mockResolvedValue([]),
        // Write operations
        create: vi.fn().mockResolvedValue({ id: '1' }),
        update: vi.fn().mockResolvedValue({ id: '1' }),
        delete: vi.fn().mockResolvedValue(undefined),
        upsert: vi.fn().mockResolvedValue({ id: '1' }),
        // Properties
        name: 'TestRepo',
        version: 1,
      };

      const wrapped = wrapRepository(mockRepository, 'MixedRepository');

      // Test read operations
      await wrapped.getAll();
      await wrapped.findById('1');
      await wrapped.search('query');

      // Test write operations
      await wrapped.create({});
      await wrapped.update('1', {});
      await wrapped.delete('1');
      await wrapped.upsert({});

      // Test properties
      expect(wrapped.name).toBe('TestRepo');
      expect(wrapped.version).toBe(1);

      // Should have called withRetry 7 times (only for methods)
      expect(withRetry).toHaveBeenCalledTimes(7);

      // Verify correct options for each type
      const calls = vi.mocked(withRetry).mock.calls;
      // First 3 are read operations
      expect(calls[0]![2]?.maxRetries).toBe(3);
      expect(calls[1]![2]?.maxRetries).toBe(3);
      expect(calls[2]![2]?.maxRetries).toBe(3);
      // Last 4 are write operations
      expect(calls[3]![2]?.maxRetries).toBe(2);
      expect(calls[4]![2]?.maxRetries).toBe(2);
      expect(calls[5]![2]?.maxRetries).toBe(2);
      expect(calls[6]![2]?.maxRetries).toBe(2);
    });

    it('should preserve return values from methods', async () => {
      const mockData = { id: '1', name: 'Test Item' };
      const mockRepository = {
        getById: vi.fn().mockResolvedValue(mockData),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');
      const result = await wrapped.getById('1');

      expect(result).toEqual(mockData);
    });

    it('should handle void return types', async () => {
      const mockRepository = {
        delete: vi.fn().mockResolvedValue(undefined),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');
      const result = await wrapped.delete('1');

      expect(result).toBeUndefined();
    });

    it('should handle methods that throw errors', async () => {
      const testError = new Error('Method execution failed');

      vi.mocked(withRetry).mockImplementation(async (fn) => {
        await fn();
      });

      const mockRepository = {
        create: vi.fn().mockRejectedValue(testError),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      await expect(wrapped.create({})).rejects.toThrow('Method execution failed');
    });

    it('should handle repositories with no methods', () => {
      const mockRepository = {
        name: 'ConfigRepo',
        settings: { timeout: 5000 },
      };

      const wrapped = wrapRepository(mockRepository, 'ConfigRepository');

      expect(wrapped.name).toBe('ConfigRepo');
      expect(wrapped.settings).toEqual({ timeout: 5000 });
      expect(withRetry).not.toHaveBeenCalled();
    });
  });

  describe('Type Safety', () => {
    it('should preserve repository type information', async () => {
      interface TestRepository {
        getAll(): Promise<Array<{ id: string }>>;
        create(data: { name: string }): Promise<{ id: string }>;
      }

      const mockRepository: TestRepository = {
        getAll: vi.fn().mockResolvedValue([{ id: '1' }]),
        create: vi.fn().mockResolvedValue({ id: '2' }),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      // Type assertions to verify type preservation
      const allItems = await wrapped.getAll();
      expect(allItems).toEqual([{ id: '1' }]);

      const newItem = await wrapped.create({ name: 'Test' });
      expect(newItem).toEqual({ id: '2' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle methods with no arguments', async () => {
      const mockRepository = {
        reset: vi.fn().mockResolvedValue(undefined),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');
      await wrapped.reset();

      expect(withRetry).toHaveBeenCalledTimes(1);
      expect(mockRepository.reset).toHaveBeenCalledWith();
    });

    it('should handle methods with many arguments', async () => {
      const mockRepository = {
        complexOperation: vi.fn().mockResolvedValue({ success: true }),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');
      await wrapped.complexOperation('arg1', 'arg2', { option: true }, [1, 2, 3], null);

      expect(mockRepository.complexOperation).toHaveBeenCalledWith(
        'arg1',
        'arg2',
        { option: true },
        [1, 2, 3],
        null
      );
    });

    it('should handle symbol properties', () => {
      const testSymbol = Symbol('test');
      const mockRepository = {
        [testSymbol]: 'symbol-value',
        getAll: vi.fn().mockResolvedValue([]),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      expect(wrapped[testSymbol]).toBe('symbol-value');
    });

    it('should handle null and undefined return values', async () => {
      const mockRepository = {
        findOptional: vi.fn().mockResolvedValue(null),
        getOptional: vi.fn().mockResolvedValue(undefined),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');

      const nullResult = await wrapped.findOptional('id');
      const undefinedResult = await wrapped.getOptional('id');

      expect(nullResult).toBeNull();
      expect(undefinedResult).toBeUndefined();
    });

    it('should handle async methods that return promises', async () => {
      const mockRepository = {
        asyncMethod: vi.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return { success: true };
        }),
      };

      const wrapped = wrapRepository(mockRepository, 'TestRepository');
      const result = await wrapped.asyncMethod();

      expect(result).toEqual({ success: true });
    });
  });
});
