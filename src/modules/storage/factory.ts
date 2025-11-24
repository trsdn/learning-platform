import {
  TopicRepository,
  LearningPathRepository,
  TaskRepository,
  AnswerHistoryRepository,
  UserProgressRepository,
  PracticeSessionRepository,
  SpacedRepetitionRepository,
} from './adapters/supabase-repositories';
import {
  wrapTopicRepository,
  wrapLearningPathRepository,
  wrapTaskRepository,
  wrapAnswerHistoryRepository,
  wrapUserProgressRepository,
  wrapPracticeSessionRepository,
  wrapSpacedRepetitionRepository,
} from './adapters/repository-with-error-handling';
import type {
  ITopicRepository,
  ILearningPathRepository,
  ITaskRepository,
  IAnswerHistoryRepository,
  IUserProgressRepository,
  IPracticeSessionRepository,
  ISpacedRepetitionRepository,
} from './types/adapters';

/**
 * Storage factory for creating repository instances
 */
export class StorageFactory {
  private static topicRepo: ITopicRepository;
  private static learningPathRepo: ILearningPathRepository;
  private static taskRepo: ITaskRepository;
  private static answerHistoryRepo: IAnswerHistoryRepository;
  private static userProgressRepo: IUserProgressRepository;
  private static practiceSessionRepo: IPracticeSessionRepository;
  private static spacedRepetitionRepo: ISpacedRepetitionRepository;

  /**
   * Gets the Topic repository with error handling
   */
  static getTopicRepository(): any {
    if (!this.topicRepo) {
      const baseRepo = new TopicRepository();
      this.topicRepo = wrapTopicRepository(baseRepo) as any;
    }
    return this.topicRepo;
  }

  /**
   * Gets the LearningPath repository with error handling
   */
  static getLearningPathRepository(): any {
    if (!this.learningPathRepo) {
      const baseRepo = new LearningPathRepository();
      this.learningPathRepo = wrapLearningPathRepository(baseRepo) as any;
    }
    return this.learningPathRepo;
  }

  /**
   * Gets the Task repository with error handling
   */
  static getTaskRepository(): any {
    if (!this.taskRepo) {
      const baseRepo = new TaskRepository();
      this.taskRepo = wrapTaskRepository(baseRepo) as any;
    }
    return this.taskRepo;
  }

  /**
   * Gets the AnswerHistory repository with error handling
   */
  static getAnswerHistoryRepository(): any {
    if (!this.answerHistoryRepo) {
      const baseRepo = new AnswerHistoryRepository();
      this.answerHistoryRepo = wrapAnswerHistoryRepository(baseRepo) as any;
    }
    return this.answerHistoryRepo;
  }

  /**
   * Gets the UserProgress repository with error handling
   */
  static getUserProgressRepository(): any {
    if (!this.userProgressRepo) {
      const baseRepo = new UserProgressRepository();
      this.userProgressRepo = wrapUserProgressRepository(baseRepo) as any;
    }
    return this.userProgressRepo;
  }

  /**
   * Gets the PracticeSession repository with error handling
   */
  static getPracticeSessionRepository(): any {
    if (!this.practiceSessionRepo) {
      const baseRepo = new PracticeSessionRepository();
      this.practiceSessionRepo = wrapPracticeSessionRepository(baseRepo) as any;
    }
    return this.practiceSessionRepo;
  }

  /**
   * Gets the SpacedRepetition repository with error handling
   */
  static getSpacedRepetitionRepository(): any {
    if (!this.spacedRepetitionRepo) {
      const baseRepo = new SpacedRepetitionRepository();
      this.spacedRepetitionRepo = wrapSpacedRepetitionRepository(baseRepo) as any;
    }
    return this.spacedRepetitionRepo;
  }

  /**
   * Resets all repository instances (useful for testing)
   */
  static reset(): void {
    this.topicRepo = null as any;
    this.learningPathRepo = null as any;
    this.taskRepo = null as any;
    this.answerHistoryRepo = null as any;
    this.userProgressRepo = null as any;
    this.practiceSessionRepo = null as any;
    this.spacedRepetitionRepo = null as any;
  }
}

/**
 * Convenience functions for getting repositories
 */
export const getTopicRepository = () => StorageFactory.getTopicRepository();
export const getLearningPathRepository = () => StorageFactory.getLearningPathRepository();
export const getTaskRepository = () => StorageFactory.getTaskRepository();
export const getAnswerHistoryRepository = () => StorageFactory.getAnswerHistoryRepository();
export const getUserProgressRepository = () => StorageFactory.getUserProgressRepository();
export const getPracticeSessionRepository = () => StorageFactory.getPracticeSessionRepository();
export const getSpacedRepetitionRepository = () => StorageFactory.getSpacedRepetitionRepository();