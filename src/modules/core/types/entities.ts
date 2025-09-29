/**
 * Core entity type definitions
 * Re-exports from services for convenience
 */

export type {
  Topic,
  LearningPath,
  Task,
  MultipleChoiceContent,
  AnswerHistory,
  UserProgress,
  PracticeSession,
  SpacedRepetitionItem,
  TaskSearchFilters,
  ReviewSchedule,
  SessionConfiguration,
  ProgressSummary,
  WeeklyStats,
  AccuracyTrend,
  DifficultyAnalysis,
} from './services';

export {
  LearningPlatformError,
  ValidationError,
  NotFoundError,
  BusinessRuleError,
} from './services';