import Dexie, { Table } from 'dexie';
import type {
  Topic,
  LearningPath,
  Task,
  AnswerHistory,
  UserProgress,
  PracticeSession,
  SpacedRepetitionItem,
} from '@core/types/services';

/**
 * IndexedDB database schema using Dexie
 */
export class LearningPlatformDB extends Dexie {
  // Tables
  topics!: Table<Topic, string>;
  learningPaths!: Table<LearningPath, string>;
  tasks!: Table<Task, string>;
  answerHistory!: Table<AnswerHistory, string>;
  userProgress!: Table<UserProgress, string>;
  practiceSessions!: Table<PracticeSession, string>;
  spacedRepetition!: Table<SpacedRepetitionItem, string>;

  constructor() {
    super('LearningPlatformDB');

    this.version(1).stores({
      topics: 'id, title, isActive, createdAt',
      learningPaths: 'id, topicId, difficulty, isActive, createdAt',
      tasks: 'id, learningPathId, type, *metadata.tags, metadata.difficulty, createdAt',
      answerHistory: 'id, taskId, sessionId, timestamp, isCorrect',
      userProgress: 'id, topicId, learningPathId, *milestones.lastActivity',
      practiceSessions: 'id, execution.status, execution.startedAt, execution.completedAt, createdAt',
      spacedRepetition: 'id, taskId, schedule.nextReview, algorithm.interval, createdAt',
    });
  }
}

// Create singleton instance
export const db = new LearningPlatformDB();