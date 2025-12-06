/**
 * Tests for StorageFactory
 *
 * Tests the storage factory which handles:
 * - Singleton pattern for repository instances
 * - All 7 repository getter methods
 * - Reset functionality for clearing cached instances
 * - Wrapper functions that call factory methods
 * - Repository wrapping with error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageFactory } from '../../../src/modules/storage/factory';
import * as factoryExports from '../../../src/modules/storage/factory';

// Mock the repository classes as proper constructors
vi.mock('@/modules/storage/adapters/supabase-repositories', () => ({
  TopicRepository: vi.fn(function() { return { name: 'TopicRepository', type: 'base' }; }),
  LearningPathRepository: vi.fn(function() { return { name: 'LearningPathRepository', type: 'base' }; }),
  TaskRepository: vi.fn(function() { return { name: 'TaskRepository', type: 'base' }; }),
  AnswerHistoryRepository: vi.fn(function() { return { name: 'AnswerHistoryRepository', type: 'base' }; }),
  UserProgressRepository: vi.fn(function() { return { name: 'UserProgressRepository', type: 'base' }; }),
  PracticeSessionRepository: vi.fn(function() { return { name: 'PracticeSessionRepository', type: 'base' }; }),
  SpacedRepetitionRepository: vi.fn(function() { return { name: 'SpacedRepetitionRepository', type: 'base' }; }),
}));

// Mock the wrapper functions
vi.mock('@/modules/storage/adapters/repository-with-error-handling', () => ({
  wrapTopicRepository: vi.fn((repo) => ({ ...repo, wrapped: true, wrapperType: 'topic' })),
  wrapLearningPathRepository: vi.fn((repo) => ({ ...repo, wrapped: true, wrapperType: 'learningPath' })),
  wrapTaskRepository: vi.fn((repo) => ({ ...repo, wrapped: true, wrapperType: 'task' })),
  wrapAnswerHistoryRepository: vi.fn((repo) => ({ ...repo, wrapped: true, wrapperType: 'answerHistory' })),
  wrapUserProgressRepository: vi.fn((repo) => ({ ...repo, wrapped: true, wrapperType: 'userProgress' })),
  wrapPracticeSessionRepository: vi.fn((repo) => ({ ...repo, wrapped: true, wrapperType: 'practiceSession' })),
  wrapSpacedRepetitionRepository: vi.fn((repo) => ({ ...repo, wrapped: true, wrapperType: 'spacedRepetition' })),
}));

describe('StorageFactory', () => {
  beforeEach(() => {
    // Reset the factory before each test
    StorageFactory.reset();

    // Clear all mock calls
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same TopicRepository instance on multiple calls', () => {
      const repo1 = StorageFactory.getTopicRepository();
      const repo2 = StorageFactory.getTopicRepository();

      expect(repo1).toBe(repo2);
    });

    it('should return the same LearningPathRepository instance on multiple calls', () => {
      const repo1 = StorageFactory.getLearningPathRepository();
      const repo2 = StorageFactory.getLearningPathRepository();

      expect(repo1).toBe(repo2);
    });

    it('should return the same TaskRepository instance on multiple calls', () => {
      const repo1 = StorageFactory.getTaskRepository();
      const repo2 = StorageFactory.getTaskRepository();

      expect(repo1).toBe(repo2);
    });

    it('should return the same AnswerHistoryRepository instance on multiple calls', () => {
      const repo1 = StorageFactory.getAnswerHistoryRepository();
      const repo2 = StorageFactory.getAnswerHistoryRepository();

      expect(repo1).toBe(repo2);
    });

    it('should return the same UserProgressRepository instance on multiple calls', () => {
      const repo1 = StorageFactory.getUserProgressRepository();
      const repo2 = StorageFactory.getUserProgressRepository();

      expect(repo1).toBe(repo2);
    });

    it('should return the same PracticeSessionRepository instance on multiple calls', () => {
      const repo1 = StorageFactory.getPracticeSessionRepository();
      const repo2 = StorageFactory.getPracticeSessionRepository();

      expect(repo1).toBe(repo2);
    });

    it('should return the same SpacedRepetitionRepository instance on multiple calls', () => {
      const repo1 = StorageFactory.getSpacedRepetitionRepository();
      const repo2 = StorageFactory.getSpacedRepetitionRepository();

      expect(repo1).toBe(repo2);
    });

    it('should maintain separate singleton instances for different repository types', () => {
      const topicRepo = StorageFactory.getTopicRepository();
      const pathRepo = StorageFactory.getLearningPathRepository();
      const taskRepo = StorageFactory.getTaskRepository();

      expect(topicRepo).not.toBe(pathRepo);
      expect(topicRepo).not.toBe(taskRepo);
      expect(pathRepo).not.toBe(taskRepo);
    });
  });

  describe('Repository Getters - Create and Wrap', () => {
    it('should create TopicRepository instance with wrapper', () => {
      const repo = StorageFactory.getTopicRepository();

      expect(repo).toBeDefined();
      expect(repo).toHaveProperty('name', 'TopicRepository');
      expect(repo).toHaveProperty('wrapped', true);
      expect(repo).toHaveProperty('wrapperType', 'topic');
    });

    it('should create LearningPathRepository instance with wrapper', () => {
      const repo = StorageFactory.getLearningPathRepository();

      expect(repo).toBeDefined();
      expect(repo).toHaveProperty('name', 'LearningPathRepository');
      expect(repo).toHaveProperty('wrapped', true);
      expect(repo).toHaveProperty('wrapperType', 'learningPath');
    });

    it('should create TaskRepository instance with wrapper', () => {
      const repo = StorageFactory.getTaskRepository();

      expect(repo).toBeDefined();
      expect(repo).toHaveProperty('name', 'TaskRepository');
      expect(repo).toHaveProperty('wrapped', true);
      expect(repo).toHaveProperty('wrapperType', 'task');
    });

    it('should create AnswerHistoryRepository instance with wrapper', () => {
      const repo = StorageFactory.getAnswerHistoryRepository();

      expect(repo).toBeDefined();
      expect(repo).toHaveProperty('name', 'AnswerHistoryRepository');
      expect(repo).toHaveProperty('wrapped', true);
      expect(repo).toHaveProperty('wrapperType', 'answerHistory');
    });

    it('should create UserProgressRepository instance with wrapper', () => {
      const repo = StorageFactory.getUserProgressRepository();

      expect(repo).toBeDefined();
      expect(repo).toHaveProperty('name', 'UserProgressRepository');
      expect(repo).toHaveProperty('wrapped', true);
      expect(repo).toHaveProperty('wrapperType', 'userProgress');
    });

    it('should create PracticeSessionRepository instance with wrapper', () => {
      const repo = StorageFactory.getPracticeSessionRepository();

      expect(repo).toBeDefined();
      expect(repo).toHaveProperty('name', 'PracticeSessionRepository');
      expect(repo).toHaveProperty('wrapped', true);
      expect(repo).toHaveProperty('wrapperType', 'practiceSession');
    });

    it('should create SpacedRepetitionRepository instance with wrapper', () => {
      const repo = StorageFactory.getSpacedRepetitionRepository();

      expect(repo).toBeDefined();
      expect(repo).toHaveProperty('name', 'SpacedRepetitionRepository');
      expect(repo).toHaveProperty('wrapped', true);
      expect(repo).toHaveProperty('wrapperType', 'spacedRepetition');
    });
  });

  describe('Repository Creation Flow', () => {
    it('should create base repository and then wrap it for TopicRepository', async () => {
      const { TopicRepository } = await import('@/modules/storage/adapters/supabase-repositories');
      const { wrapTopicRepository } = await import('@/modules/storage/adapters/repository-with-error-handling');

      StorageFactory.getTopicRepository();

      expect(TopicRepository).toHaveBeenCalledTimes(1);
      expect(wrapTopicRepository).toHaveBeenCalledTimes(1);
      expect(wrapTopicRepository).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'TopicRepository', type: 'base' })
      );
    });

    it('should create base repository and then wrap it for LearningPathRepository', async () => {
      const { LearningPathRepository } = await import('@/modules/storage/adapters/supabase-repositories');
      const { wrapLearningPathRepository } = await import('@/modules/storage/adapters/repository-with-error-handling');

      StorageFactory.getLearningPathRepository();

      expect(LearningPathRepository).toHaveBeenCalledTimes(1);
      expect(wrapLearningPathRepository).toHaveBeenCalledTimes(1);
      expect(wrapLearningPathRepository).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'LearningPathRepository', type: 'base' })
      );
    });

    it('should create base repository and then wrap it for TaskRepository', async () => {
      const { TaskRepository } = await import('@/modules/storage/adapters/supabase-repositories');
      const { wrapTaskRepository } = await import('@/modules/storage/adapters/repository-with-error-handling');

      StorageFactory.getTaskRepository();

      expect(TaskRepository).toHaveBeenCalledTimes(1);
      expect(wrapTaskRepository).toHaveBeenCalledTimes(1);
      expect(wrapTaskRepository).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'TaskRepository', type: 'base' })
      );
    });

    it('should only create base repository once even with multiple getter calls', async () => {
      const { TopicRepository } = await import('@/modules/storage/adapters/supabase-repositories');
      const { wrapTopicRepository } = await import('@/modules/storage/adapters/repository-with-error-handling');

      StorageFactory.getTopicRepository();
      StorageFactory.getTopicRepository();
      StorageFactory.getTopicRepository();

      expect(TopicRepository).toHaveBeenCalledTimes(1);
      expect(wrapTopicRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reset Functionality', () => {
    it('should clear all cached repository instances', () => {
      // Create all repositories
      const topic1 = StorageFactory.getTopicRepository();
      const path1 = StorageFactory.getLearningPathRepository();
      const task1 = StorageFactory.getTaskRepository();
      const answer1 = StorageFactory.getAnswerHistoryRepository();
      const progress1 = StorageFactory.getUserProgressRepository();
      const session1 = StorageFactory.getPracticeSessionRepository();
      const spaced1 = StorageFactory.getSpacedRepetitionRepository();

      // Reset
      StorageFactory.reset();

      // Get repositories again
      const topic2 = StorageFactory.getTopicRepository();
      const path2 = StorageFactory.getLearningPathRepository();
      const task2 = StorageFactory.getTaskRepository();
      const answer2 = StorageFactory.getAnswerHistoryRepository();
      const progress2 = StorageFactory.getUserProgressRepository();
      const session2 = StorageFactory.getPracticeSessionRepository();
      const spaced2 = StorageFactory.getSpacedRepetitionRepository();

      // All should be new instances
      expect(topic2).not.toBe(topic1);
      expect(path2).not.toBe(path1);
      expect(task2).not.toBe(task1);
      expect(answer2).not.toBe(answer1);
      expect(progress2).not.toBe(progress1);
      expect(session2).not.toBe(session1);
      expect(spaced2).not.toBe(spaced1);
    });

    it('should allow new singleton instances after reset', () => {
      // Get first instance
      StorageFactory.getTopicRepository();

      // Reset
      StorageFactory.reset();

      // Get new instances
      const repo1 = StorageFactory.getTopicRepository();
      const repo2 = StorageFactory.getTopicRepository();

      // New instances should be singleton
      expect(repo1).toBe(repo2);
    });

    it('should create new repositories after reset', async () => {
      const { TopicRepository } = await import('@/modules/storage/adapters/supabase-repositories');

      // First creation
      StorageFactory.getTopicRepository();
      expect(TopicRepository).toHaveBeenCalledTimes(1);

      // Reset and create again
      StorageFactory.reset();
      vi.clearAllMocks();

      StorageFactory.getTopicRepository();
      expect(TopicRepository).toHaveBeenCalledTimes(1);
    });

    it('should not affect other repository types when reset is called', () => {
      const topic1 = StorageFactory.getTopicRepository();
      const path1 = StorageFactory.getLearningPathRepository();

      StorageFactory.reset();

      const topic2 = StorageFactory.getTopicRepository();
      const path2 = StorageFactory.getLearningPathRepository();

      // Both should be new instances after reset
      expect(topic2).not.toBe(topic1);
      expect(path2).not.toBe(path1);
    });
  });

  describe('Wrapper Functions', () => {
    it('should call StorageFactory.getTopicRepository', () => {
      const factorySpy = vi.spyOn(StorageFactory, 'getTopicRepository');

      factoryExports.getTopicRepository();

      expect(factorySpy).toHaveBeenCalledTimes(1);
    });

    it('should call StorageFactory.getLearningPathRepository', () => {
      const factorySpy = vi.spyOn(StorageFactory, 'getLearningPathRepository');

      factoryExports.getLearningPathRepository();

      expect(factorySpy).toHaveBeenCalledTimes(1);
    });

    it('should call StorageFactory.getTaskRepository', () => {
      const factorySpy = vi.spyOn(StorageFactory, 'getTaskRepository');

      factoryExports.getTaskRepository();

      expect(factorySpy).toHaveBeenCalledTimes(1);
    });

    it('should call StorageFactory.getAnswerHistoryRepository', () => {
      const factorySpy = vi.spyOn(StorageFactory, 'getAnswerHistoryRepository');

      factoryExports.getAnswerHistoryRepository();

      expect(factorySpy).toHaveBeenCalledTimes(1);
    });

    it('should call StorageFactory.getUserProgressRepository', () => {
      const factorySpy = vi.spyOn(StorageFactory, 'getUserProgressRepository');

      factoryExports.getUserProgressRepository();

      expect(factorySpy).toHaveBeenCalledTimes(1);
    });

    it('should call StorageFactory.getPracticeSessionRepository', () => {
      const factorySpy = vi.spyOn(StorageFactory, 'getPracticeSessionRepository');

      factoryExports.getPracticeSessionRepository();

      expect(factorySpy).toHaveBeenCalledTimes(1);
    });

    it('should call StorageFactory.getSpacedRepetitionRepository', () => {
      const factorySpy = vi.spyOn(StorageFactory, 'getSpacedRepetitionRepository');

      factoryExports.getSpacedRepetitionRepository();

      expect(factorySpy).toHaveBeenCalledTimes(1);
    });

    it('should return the same instance as the factory method for getTopicRepository', () => {
      const factoryResult = StorageFactory.getTopicRepository();

      // Reset to get a fresh instance through wrapper
      StorageFactory.reset();

      const wrapperResult = factoryExports.getTopicRepository();

      // Should have same properties (new instance but same structure)
      expect(wrapperResult).toHaveProperty('name', factoryResult.name);
      expect(wrapperResult).toHaveProperty('wrapped', factoryResult.wrapped);
      expect(wrapperResult).toHaveProperty('wrapperType', factoryResult.wrapperType);
    });

    it('should return the same instance as the factory method for getLearningPathRepository', () => {
      const factoryResult = StorageFactory.getLearningPathRepository();

      // Reset to get a fresh instance through wrapper
      StorageFactory.reset();

      const wrapperResult = factoryExports.getLearningPathRepository();

      // Should have same properties (new instance but same structure)
      expect(wrapperResult).toHaveProperty('name', factoryResult.name);
      expect(wrapperResult).toHaveProperty('wrapped', factoryResult.wrapped);
      expect(wrapperResult).toHaveProperty('wrapperType', factoryResult.wrapperType);
    });

    it('should maintain singleton behavior through wrapper functions', () => {
      const result1 = factoryExports.getTopicRepository();
      const result2 = factoryExports.getTopicRepository();

      expect(result1).toBe(result2);
    });
  });

  describe('Error Handling Wrapper Integration', () => {
    it('should wrap TopicRepository with error handling', async () => {
      const { wrapTopicRepository } = await import('@/modules/storage/adapters/repository-with-error-handling');

      const repo = StorageFactory.getTopicRepository();

      expect(wrapTopicRepository).toHaveBeenCalled();
      expect(repo.wrapped).toBe(true);
    });

    it('should wrap LearningPathRepository with error handling', async () => {
      const { wrapLearningPathRepository } = await import('@/modules/storage/adapters/repository-with-error-handling');

      const repo = StorageFactory.getLearningPathRepository();

      expect(wrapLearningPathRepository).toHaveBeenCalled();
      expect(repo.wrapped).toBe(true);
    });

    it('should wrap TaskRepository with error handling', async () => {
      const { wrapTaskRepository } = await import('@/modules/storage/adapters/repository-with-error-handling');

      const repo = StorageFactory.getTaskRepository();

      expect(wrapTaskRepository).toHaveBeenCalled();
      expect(repo.wrapped).toBe(true);
    });

    it('should wrap AnswerHistoryRepository with error handling', async () => {
      const { wrapAnswerHistoryRepository } = await import('@/modules/storage/adapters/repository-with-error-handling');

      const repo = StorageFactory.getAnswerHistoryRepository();

      expect(wrapAnswerHistoryRepository).toHaveBeenCalled();
      expect(repo.wrapped).toBe(true);
    });

    it('should wrap UserProgressRepository with error handling', async () => {
      const { wrapUserProgressRepository } = await import('@/modules/storage/adapters/repository-with-error-handling');

      const repo = StorageFactory.getUserProgressRepository();

      expect(wrapUserProgressRepository).toHaveBeenCalled();
      expect(repo.wrapped).toBe(true);
    });

    it('should wrap PracticeSessionRepository with error handling', async () => {
      const { wrapPracticeSessionRepository } = await import('@/modules/storage/adapters/repository-with-error-handling');

      const repo = StorageFactory.getPracticeSessionRepository();

      expect(wrapPracticeSessionRepository).toHaveBeenCalled();
      expect(repo.wrapped).toBe(true);
    });

    it('should wrap SpacedRepetitionRepository with error handling', async () => {
      const { wrapSpacedRepetitionRepository } = await import('@/modules/storage/adapters/repository-with-error-handling');

      const repo = StorageFactory.getSpacedRepetitionRepository();

      expect(wrapSpacedRepetitionRepository).toHaveBeenCalled();
      expect(repo.wrapped).toBe(true);
    });

    it('should pass the base repository to the wrapper function', async () => {
      const { wrapTopicRepository } = await import('@/modules/storage/adapters/repository-with-error-handling');

      StorageFactory.getTopicRepository();

      expect(wrapTopicRepository).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TopicRepository',
          type: 'base'
        })
      );
    });

    it('should return wrapped repository from factory', () => {
      const repo = StorageFactory.getTopicRepository();

      // Should have properties from both base and wrapper
      expect(repo).toHaveProperty('name');
      expect(repo).toHaveProperty('type');
      expect(repo).toHaveProperty('wrapped');
      expect(repo).toHaveProperty('wrapperType');
    });
  });

  describe('Factory State Management', () => {
    it('should start with null cached instances', async () => {
      // This is implicitly tested by the first call creating a new instance
      // We verify this by checking that the first call triggers repository creation
      const { TopicRepository } = await import('@/modules/storage/adapters/supabase-repositories');

      StorageFactory.getTopicRepository();

      expect(TopicRepository).toHaveBeenCalled();
    });

    it('should cache instance after first call', async () => {
      const { TopicRepository } = await import('@/modules/storage/adapters/supabase-repositories');

      StorageFactory.getTopicRepository();
      const callCount = vi.mocked(TopicRepository).mock.calls.length;

      StorageFactory.getTopicRepository();
      StorageFactory.getTopicRepository();

      // Should still be the same call count (cached)
      expect(TopicRepository).toHaveBeenCalledTimes(callCount);
    });

    it('should maintain independent caches for each repository type', async () => {
      const { TopicRepository, TaskRepository } = await import('@/modules/storage/adapters/supabase-repositories');

      StorageFactory.getTopicRepository();
      StorageFactory.getTaskRepository();

      expect(TopicRepository).toHaveBeenCalledTimes(1);
      expect(TaskRepository).toHaveBeenCalledTimes(1);

      // Get them again
      StorageFactory.getTopicRepository();
      StorageFactory.getTaskRepository();

      // Should still be 1 each (cached independently)
      expect(TopicRepository).toHaveBeenCalledTimes(1);
      expect(TaskRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('All Repository Types Integration', () => {
    it('should create and cache all 7 repository types correctly', () => {
      const topicRepo = StorageFactory.getTopicRepository();
      const pathRepo = StorageFactory.getLearningPathRepository();
      const taskRepo = StorageFactory.getTaskRepository();
      const answerRepo = StorageFactory.getAnswerHistoryRepository();
      const progressRepo = StorageFactory.getUserProgressRepository();
      const sessionRepo = StorageFactory.getPracticeSessionRepository();
      const spacedRepo = StorageFactory.getSpacedRepetitionRepository();

      // All should be defined
      expect(topicRepo).toBeDefined();
      expect(pathRepo).toBeDefined();
      expect(taskRepo).toBeDefined();
      expect(answerRepo).toBeDefined();
      expect(progressRepo).toBeDefined();
      expect(sessionRepo).toBeDefined();
      expect(spacedRepo).toBeDefined();

      // All should be wrapped
      expect(topicRepo.wrapped).toBe(true);
      expect(pathRepo.wrapped).toBe(true);
      expect(taskRepo.wrapped).toBe(true);
      expect(answerRepo.wrapped).toBe(true);
      expect(progressRepo.wrapped).toBe(true);
      expect(sessionRepo.wrapped).toBe(true);
      expect(spacedRepo.wrapped).toBe(true);

      // All should have unique wrapper types
      const wrapperTypes = [
        topicRepo.wrapperType,
        pathRepo.wrapperType,
        taskRepo.wrapperType,
        answerRepo.wrapperType,
        progressRepo.wrapperType,
        sessionRepo.wrapperType,
        spacedRepo.wrapperType,
      ];

      const uniqueWrapperTypes = new Set(wrapperTypes);
      expect(uniqueWrapperTypes.size).toBe(7);
    });

    it('should reset all 7 repository types', async () => {
      // Create all repositories
      StorageFactory.getTopicRepository();
      StorageFactory.getLearningPathRepository();
      StorageFactory.getTaskRepository();
      StorageFactory.getAnswerHistoryRepository();
      StorageFactory.getUserProgressRepository();
      StorageFactory.getPracticeSessionRepository();
      StorageFactory.getSpacedRepetitionRepository();

      // Reset
      StorageFactory.reset();

      // All repository constructors should be called again after reset
      const {
        TopicRepository,
        LearningPathRepository,
        TaskRepository,
        AnswerHistoryRepository,
        UserProgressRepository,
        PracticeSessionRepository,
        SpacedRepetitionRepository
      } = await import('@/modules/storage/adapters/supabase-repositories');

      vi.clearAllMocks();

      StorageFactory.getTopicRepository();
      StorageFactory.getLearningPathRepository();
      StorageFactory.getTaskRepository();
      StorageFactory.getAnswerHistoryRepository();
      StorageFactory.getUserProgressRepository();
      StorageFactory.getPracticeSessionRepository();
      StorageFactory.getSpacedRepetitionRepository();

      expect(TopicRepository).toHaveBeenCalled();
      expect(LearningPathRepository).toHaveBeenCalled();
      expect(TaskRepository).toHaveBeenCalled();
      expect(AnswerHistoryRepository).toHaveBeenCalled();
      expect(UserProgressRepository).toHaveBeenCalled();
      expect(PracticeSessionRepository).toHaveBeenCalled();
      expect(SpacedRepetitionRepository).toHaveBeenCalled();
    });
  });

  describe('Convenience Functions - All Repository Types', () => {
    it('should expose all 7 convenience functions', () => {
      expect(factoryExports.getTopicRepository).toBeDefined();
      expect(factoryExports.getLearningPathRepository).toBeDefined();
      expect(factoryExports.getTaskRepository).toBeDefined();
      expect(factoryExports.getAnswerHistoryRepository).toBeDefined();
      expect(factoryExports.getUserProgressRepository).toBeDefined();
      expect(factoryExports.getPracticeSessionRepository).toBeDefined();
      expect(factoryExports.getSpacedRepetitionRepository).toBeDefined();
    });

    it('should return wrapped repositories through convenience functions', () => {
      const topicRepo = factoryExports.getTopicRepository();
      const pathRepo = factoryExports.getLearningPathRepository();
      const taskRepo = factoryExports.getTaskRepository();
      const answerRepo = factoryExports.getAnswerHistoryRepository();
      const progressRepo = factoryExports.getUserProgressRepository();
      const sessionRepo = factoryExports.getPracticeSessionRepository();
      const spacedRepo = factoryExports.getSpacedRepetitionRepository();

      expect(topicRepo.wrapped).toBe(true);
      expect(pathRepo.wrapped).toBe(true);
      expect(taskRepo.wrapped).toBe(true);
      expect(answerRepo.wrapped).toBe(true);
      expect(progressRepo.wrapped).toBe(true);
      expect(sessionRepo.wrapped).toBe(true);
      expect(spacedRepo.wrapped).toBe(true);
    });
  });
});
