import type {
  IPracticeSessionService,
  PracticeSession,
  SessionConfiguration,
} from '../types/services';
import type {
  IPracticeSessionRepository,
  ITaskRepository,
  ISpacedRepetitionRepository,
} from '@storage/types/adapters';
import { PracticeSessionEntity } from '../entities/practice-session';
import { NotFoundError } from '../types/entities';
import { logger } from '@/utils/logger';

/**
 * Practice Session Service for managing learning sessions
 */
export class PracticeSessionService implements IPracticeSessionService {
  constructor(
    private sessionRepository: IPracticeSessionRepository,
    private taskRepository: ITaskRepository,
    private spacedRepRepository: ISpacedRepetitionRepository
  ) {}

  /**
   * Creates a new practice session
   */
  async createSession(config: SessionConfiguration): Promise<PracticeSession> {
    // Get tasks for the session
    const taskIds = await this.selectTasksForSession(config);

    // Create session entity
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sessionConfig: {
      targetCount: number;
      includeReview: boolean;
      difficultyFilter?: 'easy' | 'medium' | 'hard';
    } = {
      targetCount: config.targetCount,
      includeReview: config.includeReview,
    };
    if (config.difficultyFilter) {
      sessionConfig.difficultyFilter = config.difficultyFilter;
    }

    const sessionEntity = PracticeSessionEntity.create(
      sessionId,
      config.topicId,
      config.learningPathIds,
      taskIds,
      sessionConfig
    );

    // Save to repository
    return await this.sessionRepository.create(sessionEntity.toJSON());
  }

  /**
   * Gets a session by ID
   */
  async getSession(id: string): Promise<PracticeSession | null> {
    return await this.sessionRepository.getById(id);
  }

  /**
   * Updates a session
   */
  async updateSession(id: string, updates: Partial<PracticeSession>): Promise<void> {
    await this.sessionRepository.update(id, updates);
  }

  /**
   * Completes a session
   */
  async completeSession(id: string): Promise<PracticeSession> {
    const session = await this.sessionRepository.getById(id);
    if (!session) {
      throw new NotFoundError('PracticeSession', id);
    }

    const sessionEntity = PracticeSessionEntity.fromJSON(session);
    sessionEntity.complete();

    return await this.sessionRepository.update(id, sessionEntity.toJSON());
  }

  /**
   * Pauses a session
   */
  async pauseSession(id: string): Promise<void> {
    const session = await this.sessionRepository.getById(id);
    if (!session) {
      throw new NotFoundError('PracticeSession', id);
    }

    const sessionEntity = PracticeSessionEntity.fromJSON(session);
    sessionEntity.pause();

    await this.sessionRepository.update(id, sessionEntity.toJSON());
  }

  /**
   * Resumes a session
   */
  async resumeSession(id: string): Promise<void> {
    const session = await this.sessionRepository.getById(id);
    if (!session) {
      throw new NotFoundError('PracticeSession', id);
    }

    const sessionEntity = PracticeSessionEntity.fromJSON(session);
    sessionEntity.resume();

    await this.sessionRepository.update(id, sessionEntity.toJSON());
  }

  /**
   * Abandons a session
   */
  async abandonSession(id: string): Promise<void> {
    const session = await this.sessionRepository.getById(id);
    if (!session) {
      throw new NotFoundError('PracticeSession', id);
    }

    const sessionEntity = PracticeSessionEntity.fromJSON(session);
    sessionEntity.abandon();

    await this.sessionRepository.update(id, sessionEntity.toJSON());
  }

  /**
   * Gets active sessions for a user
   */
  async getActiveSessions(userId: string): Promise<PracticeSession[]> {
    return await this.sessionRepository.getActive(userId);
  }

  /**
   * Gets recent sessions for a user
   */
  async getRecentSessions(userId: string, limit: number): Promise<PracticeSession[]> {
    return await this.sessionRepository.getRecent(userId, limit);
  }

  /**
   * Records an answer in the session
   */
  async recordSessionAnswer(
    sessionId: string,
    isCorrect: boolean,
    timeSpent: number
  ): Promise<void> {
    const session = await this.sessionRepository.getById(sessionId);
    if (!session) {
      throw new NotFoundError('PracticeSession', sessionId);
    }

    const sessionEntity = PracticeSessionEntity.fromJSON(session);

    // Start session if it's still planned
    if (sessionEntity.execution.status === 'planned') {
      sessionEntity.start();
    }

    sessionEntity.recordAnswer(isCorrect, timeSpent);

    // Auto-complete if target reached
    if (sessionEntity.isComplete()) {
      sessionEntity.complete();
    }

    await this.sessionRepository.update(sessionId, sessionEntity.toJSON());
  }

  /**
   * Selects tasks for the session based on configuration
   */
  private async selectTasksForSession(config: SessionConfiguration): Promise<string[]> {
    const selectedTaskIds: string[] = [];
    let remainingCount = config.targetCount;

    logger.debug(`Selecting tasks: targetCount=${config.targetCount}, learningPaths=${config.learningPathIds.join(',')}`);

    // Get review tasks if requested
    if (config.includeReview && remainingCount > 0) {
      const dueItems = await this.spacedRepRepository.getDue(new Date());
      const reviewTaskIds = dueItems
        .slice(0, Math.min(dueItems.length, Math.ceil(config.targetCount * 0.3))) // 30% review
        .map((item) => item.taskId);

      logger.debug(`Review tasks found: ${reviewTaskIds.length}`);
      selectedTaskIds.push(...reviewTaskIds);
      remainingCount -= reviewTaskIds.length;
    }

    // Get new tasks from learning paths
    if (remainingCount > 0) {
      const filters: {
        learningPathIds: string[];
        excludeIds: string[];
        difficulty?: 'easy' | 'medium' | 'hard';
      } = {
        learningPathIds: config.learningPathIds,
        excludeIds: selectedTaskIds,
      };
      if (config.difficultyFilter) {
        filters.difficulty = config.difficultyFilter;
      }

      logger.debug(`Requesting ${remainingCount} new tasks with filters:`, filters);
      const newTasks = await this.taskRepository.getRandomTasks(remainingCount, filters);
      logger.debug(`Got ${newTasks.length} tasks:`, newTasks.map(t => t.id));

      selectedTaskIds.push(...newTasks.map((task) => task.id));
    }

    logger.debug(`Total selected tasks: ${selectedTaskIds.length}`);
    return selectedTaskIds;
  }
}