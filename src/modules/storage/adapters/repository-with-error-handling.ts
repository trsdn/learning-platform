/**
 * Repository wrapper that adds error handling and retry logic
 * Wraps existing Supabase repositories with withRetry for resilience
 */

import { withRetry, type RetryOptions } from '../../core/utils/error-handler';

/**
 * Default retry configuration for read operations
 */
const READ_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000,
  timeout: 15000,
};

/**
 * Default retry configuration for write operations
 * More conservative to avoid duplicate writes
 */
const WRITE_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 2,
  baseDelay: 2000,
  maxDelay: 8000,
  timeout: 20000,
};

/**
 * Creates a proxy that wraps all methods of a repository with error handling
 */
function createRepositoryProxy<T extends object>(
  repository: T,
  repositoryName: string
): T {
  return new Proxy(repository, {
    get(target, prop, receiver) {
      const originalMethod = Reflect.get(target, prop, receiver);

      // Only wrap async methods (functions)
      if (typeof originalMethod !== 'function') {
        return originalMethod;
      }

      // Return wrapped method
      return function (this: any, ...args: any[]) {
        const methodName = String(prop);
        const operationName = `${repositoryName}.${methodName}`;

        // Determine if this is a write operation
        const isWriteOperation =
          methodName.startsWith('create') ||
          methodName.startsWith('update') ||
          methodName.startsWith('delete') ||
          methodName.startsWith('upsert') ||
          methodName.startsWith('record') ||
          methodName.startsWith('increment');

        const retryOptions = isWriteOperation ? WRITE_RETRY_OPTIONS : READ_RETRY_OPTIONS;

        // Wrap the method call with retry logic
        return withRetry(
          () => originalMethod.apply(this, args),
          operationName,
          retryOptions
        );
      };
    },
  });
}

/**
 * Wrap TopicRepository with error handling
 */
export function wrapTopicRepository<T extends object>(repository: T, name: string = 'TopicRepository'): T {
  return createRepositoryProxy(repository, name) as T;
}

/**
 * Wrap LearningPathRepository with error handling
 */
export function wrapLearningPathRepository<T extends object>(
  repository: T,
  name: string = 'LearningPathRepository'
): T {
  return createRepositoryProxy(repository, name) as T;
}

/**
 * Wrap TaskRepository with error handling
 */
export function wrapTaskRepository<T extends object>(repository: T, name: string = 'TaskRepository'): T {
  return createRepositoryProxy(repository, name) as T;
}

/**
 * Wrap UserProgressRepository with error handling
 */
export function wrapUserProgressRepository<T extends object>(
  repository: T,
  name: string = 'UserProgressRepository'
): T {
  return createRepositoryProxy(repository, name) as T;
}

/**
 * Wrap PracticeSessionRepository with error handling
 */
export function wrapPracticeSessionRepository<T extends object>(
  repository: T,
  name: string = 'PracticeSessionRepository'
): T {
  return createRepositoryProxy(repository, name) as T;
}

/**
 * Wrap AnswerHistoryRepository with error handling
 */
export function wrapAnswerHistoryRepository<T extends object>(
  repository: T,
  name: string = 'AnswerHistoryRepository'
): T {
  return createRepositoryProxy(repository, name) as T;
}

/**
 * Wrap SpacedRepetitionRepository with error handling
 */
export function wrapSpacedRepetitionRepository<T extends object>(
  repository: T,
  name: string = 'SpacedRepetitionRepository'
): T {
  return createRepositoryProxy(repository, name) as T;
}

/**
 * Generic wrapper for any repository
 */
export function wrapRepository<T extends object>(repository: T, name: string): T {
  return createRepositoryProxy(repository, name) as T;
}
