import { db } from './database';
import {
  TopicRepository,
  LearningPathRepository,
  TaskRepository,
  AnswerHistoryRepository,
  UserProgressRepository,
  PracticeSessionRepository,
  SpacedRepetitionRepository,
} from './adapters/repositories-simple';
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
   * Gets the Topic repository
   */
  static getTopicRepository(): any {
    if (!this.topicRepo) {
      this.topicRepo = new TopicRepository(db.topics) as any;
    }
    return this.topicRepo;
  }

  /**
   * Gets the LearningPath repository
   */
  static getLearningPathRepository(): any {
    if (!this.learningPathRepo) {
      this.learningPathRepo = new LearningPathRepository(db.learningPaths) as any;
    }
    return this.learningPathRepo;
  }

  /**
   * Gets the Task repository
   */
  static getTaskRepository(): any {
    if (!this.taskRepo) {
      this.taskRepo = new TaskRepository(db.tasks) as any;
    }
    return this.taskRepo;
  }

  /**
   * Gets the AnswerHistory repository
   */
  static getAnswerHistoryRepository(): any {
    if (!this.answerHistoryRepo) {
      this.answerHistoryRepo = new AnswerHistoryRepository(db.answerHistory) as any;
    }
    return this.answerHistoryRepo;
  }

  /**
   * Gets the UserProgress repository
   */
  static getUserProgressRepository(): any {
    if (!this.userProgressRepo) {
      this.userProgressRepo = new UserProgressRepository(db.userProgress) as any;
    }
    return this.userProgressRepo;
  }

  /**
   * Gets the PracticeSession repository
   */
  static getPracticeSessionRepository(): any {
    if (!this.practiceSessionRepo) {
      this.practiceSessionRepo = new PracticeSessionRepository(db.practiceSessions) as any;
    }
    return this.practiceSessionRepo;
  }

  /**
   * Gets the SpacedRepetition repository
   */
  static getSpacedRepetitionRepository(): any {
    if (!this.spacedRepetitionRepo) {
      this.spacedRepetitionRepo = new SpacedRepetitionRepository(db.spacedRepetition) as any;
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