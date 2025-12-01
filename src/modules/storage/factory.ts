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

/**
 * Storage factory for creating repository instances
 */
export class StorageFactory {
  private static topicRepo: TopicRepository | null = null;
  private static learningPathRepo: LearningPathRepository | null = null;
  private static taskRepo: TaskRepository | null = null;
  private static answerHistoryRepo: AnswerHistoryRepository | null = null;
  private static userProgressRepo: UserProgressRepository | null = null;
  private static practiceSessionRepo: PracticeSessionRepository | null = null;
  private static spacedRepetitionRepo: SpacedRepetitionRepository | null = null;

  /**
   * Gets the Topic repository with error handling
   */
  static getTopicRepository(): TopicRepository {
    if (!this.topicRepo) {
      const baseRepo = new TopicRepository();
      this.topicRepo = wrapTopicRepository(baseRepo);
    }
    return this.topicRepo;
  }

  /**
   * Gets the LearningPath repository with error handling
   */
  static getLearningPathRepository(): LearningPathRepository {
    if (!this.learningPathRepo) {
      const baseRepo = new LearningPathRepository();
      this.learningPathRepo = wrapLearningPathRepository(baseRepo);
    }
    return this.learningPathRepo;
  }

  /**
   * Gets the Task repository with error handling
   */
  static getTaskRepository(): TaskRepository {
    if (!this.taskRepo) {
      const baseRepo = new TaskRepository();
      this.taskRepo = wrapTaskRepository(baseRepo);
    }
    return this.taskRepo;
  }

  /**
   * Gets the AnswerHistory repository with error handling
   */
  static getAnswerHistoryRepository(): AnswerHistoryRepository {
    if (!this.answerHistoryRepo) {
      const baseRepo = new AnswerHistoryRepository();
      this.answerHistoryRepo = wrapAnswerHistoryRepository(baseRepo);
    }
    return this.answerHistoryRepo;
  }

  /**
   * Gets the UserProgress repository with error handling
   */
  static getUserProgressRepository(): UserProgressRepository {
    if (!this.userProgressRepo) {
      const baseRepo = new UserProgressRepository();
      this.userProgressRepo = wrapUserProgressRepository(baseRepo);
    }
    return this.userProgressRepo;
  }

  /**
   * Gets the PracticeSession repository with error handling
   */
  static getPracticeSessionRepository(): PracticeSessionRepository {
    if (!this.practiceSessionRepo) {
      const baseRepo = new PracticeSessionRepository();
      this.practiceSessionRepo = wrapPracticeSessionRepository(baseRepo);
    }
    return this.practiceSessionRepo;
  }

  /**
   * Gets the SpacedRepetition repository with error handling
   */
  static getSpacedRepetitionRepository(): SpacedRepetitionRepository {
    if (!this.spacedRepetitionRepo) {
      const baseRepo = new SpacedRepetitionRepository();
      this.spacedRepetitionRepo = wrapSpacedRepetitionRepository(baseRepo);
    }
    return this.spacedRepetitionRepo;
  }

  /**
   * Resets all repository instances (useful for testing)
   */
  static reset(): void {
    this.topicRepo = null;
    this.learningPathRepo = null;
    this.taskRepo = null;
    this.answerHistoryRepo = null;
    this.userProgressRepo = null;
    this.practiceSessionRepo = null;
    this.spacedRepetitionRepo = null;
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