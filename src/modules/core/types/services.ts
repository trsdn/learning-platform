/**
 * Core Service Interfaces for Learning Platform
 * These contracts define the boundaries between modules
 */

// Domain Types
export interface Topic {
  id: string;
  title: string;
  description: string;
  learningPathIds: string[];
  isActive: boolean;
  metadata: {
    estimatedHours: number;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    prerequisites: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningPath {
  id: string;
  topicId: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  taskIds: string[];
  estimatedTime: number;
  isActive: boolean;
  requirements: {
    minimumAccuracy: number;
    requiredTasks: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type TaskType = 'multiple-choice' | 'cloze-deletion' | 'true-false' | 'ordering' | 'matching' | 'multiple-select' | 'slider' | 'word-scramble' | 'flashcard';

export interface Task {
  id: string;
  learningPathId: string;
  templateId: string;
  type: TaskType;
  content: MultipleChoiceContent | ClozeDeletionContent | TrueFalseContent | OrderingContent | MatchingContent | MultipleSelectContent | SliderContent | WordScrambleContent | FlashcardContent;
  metadata: {
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    estimatedTime: number;
    points: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MultipleChoiceContent {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  hint?: string;
}

export interface ClozeDeletionContent {
  text: string; // Text with {{blanks}} marked
  blanks: Array<{
    index: number;
    correctAnswer: string;
    alternatives?: string[]; // Alternative correct answers
  }>;
  explanation?: string;
  hint?: string;
}

export interface TrueFalseContent {
  statement: string;
  correctAnswer: boolean;
  requireJustification?: boolean; // If true, user must explain why
  explanation?: string;
  hint?: string;
}

export interface OrderingContent {
  question: string;
  items: string[]; // Items to be ordered
  correctOrder: number[]; // Indices in correct order
  explanation?: string;
  hint?: string;
}

export interface MatchingContent {
  question: string;
  pairs: Array<{
    left: string;
    right: string;
  }>;
  explanation?: string;
  hint?: string;
}

export interface MultipleSelectContent {
  question: string;
  options: string[];
  correctAnswers: number[]; // Array of correct indices
  minRequired?: number; // Minimum selections required
  explanation?: string;
  hint?: string;
}

export interface SliderContent {
  question: string;
  min: number;
  max: number;
  step?: number; // Default: 1
  correctValue: number;
  tolerance?: number; // ±tolerance for correct (default: 0)
  unit?: string; // e.g., "°C", "%", "cm"
  explanation?: string;
  hint?: string;
}

export interface WordScrambleContent {
  question: string;
  scrambledWord: string;
  correctWord: string;
  showLength?: boolean; // Show word length as hint
  explanation?: string;
  hint?: string;
}

export interface FlashcardContent {
  front: string; // The word/phrase shown initially
  back: string; // The translation/answer (hidden until revealed)
  frontLanguage: 'de' | 'es' | 'en'; // Language of front side
  backLanguage: 'de' | 'es' | 'en'; // Language of back side
  explanation?: string; // Optional additional context
  hint?: string; // Optional hint
}

export interface AnswerHistory {
  id: string;
  taskId: string;
  sessionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
  confidence: number;
  metadata: {
    attemptNumber: number;
    hintsUsed: number;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    browserInfo: string;
  };
  timestamp: Date;
}

export interface UserProgress {
  id: string;
  topicId: string;
  learningPathId?: string;
  statistics: {
    completedTasks: number;
    totalTasks: number;
    correctAnswers: number;
    totalAttempts: number;
    accuracyRate: number;
    timeSpent: number;
    streakDays: number;
    masteryLevel: number;
  };
  milestones: {
    firstCompleted: Date;
    lastActivity: Date;
    bestStreak: number;
    totalSessions: number;
  };
  preferences: {
    preferredDifficulty: 'easy' | 'medium' | 'hard';
    preferredSessionLength: number;
    reminderSettings: {
      enabled: boolean;
      frequency: 'daily' | 'weekly';
      time: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeSession {
  id: string;
  configuration: {
    topicId: string;
    learningPathIds: string[];
    targetCount: number;
    includeReview: boolean;
    difficultyFilter?: 'easy' | 'medium' | 'hard';
  };
  execution: {
    taskIds: string[];
    completedCount: number;
    correctCount: number;
    status: 'planned' | 'active' | 'paused' | 'completed' | 'abandoned';
    startedAt?: Date;
    completedAt?: Date;
    totalTimeSpent: number;
  };
  results: {
    accuracy: number;
    averageTime: number;
    difficultyDistribution: Record<string, number>;
    improvementAreas: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SpacedRepetitionItem {
  id: string;
  taskId: string;
  algorithm: {
    interval: number;
    repetition: number;
    efactor: number;
  };
  schedule: {
    nextReview: Date;
    lastReviewed?: Date;
    totalReviews: number;
    consecutiveCorrect: number;
  };
  performance: {
    averageAccuracy: number;
    averageTime: number;
    difficultyRating: number;
    lastGrade: number;
  };
  metadata: {
    introduced: Date;
    graduated: boolean;
    lapseCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Service Interfaces

/**
 * Core domain service for managing topics and learning paths
 */
export interface ILearningContentService {
  // Topic Management
  getTopics(): Promise<Topic[]>;
  getTopic(id: string): Promise<Topic | null>;
  getTopicByTitle(title: string): Promise<Topic | null>;

  // Learning Path Management
  getLearningPaths(topicId: string): Promise<LearningPath[]>;
  getLearningPath(id: string): Promise<LearningPath | null>;

  // Task Management
  getTasks(learningPathId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  searchTasks(query: string, filters: TaskSearchFilters): Promise<Task[]>;
}

export interface TaskSearchFilters {
  topicId?: string;
  learningPathId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  type?: string;
}

/**
 * Spaced repetition algorithm service
 */
export interface ISpacedRepetitionService {
  // Algorithm Management
  getNextTasks(userId: string, count: number): Promise<Task[]>;
  recordAnswer(taskId: string, isCorrect: boolean, grade: number): Promise<void>;
  getRepetitionData(taskId: string): Promise<SpacedRepetitionItem | null>;

  // Review Scheduling
  getTasksDue(userId: string): Promise<Task[]>;
  getReviewSchedule(userId: string, days: number): Promise<ReviewSchedule[]>;
  rescheduleTask(taskId: string, newDate: Date): Promise<void>;
}

export interface ReviewSchedule {
  date: Date;
  taskCount: number;
  estimatedTime: number;
}

/**
 * Practice session management service
 */
export interface IPracticeSessionService {
  // Session Lifecycle
  createSession(config: SessionConfiguration): Promise<PracticeSession>;
  getSession(id: string): Promise<PracticeSession | null>;
  updateSession(id: string, updates: Partial<PracticeSession>): Promise<void>;
  completeSession(id: string): Promise<PracticeSession>;
  pauseSession(id: string): Promise<void>;
  resumeSession(id: string): Promise<void>;
  abandonSession(id: string): Promise<void>;

  // Session Management
  getActiveSessions(userId: string): Promise<PracticeSession[]>;
  getRecentSessions(userId: string, limit: number): Promise<PracticeSession[]>;
}

export interface SessionConfiguration {
  topicId: string;
  learningPathIds: string[];
  targetCount: number;
  includeReview: boolean;
  difficultyFilter?: 'easy' | 'medium' | 'hard';
}

/**
 * User progress tracking service
 */
export interface IProgressTrackingService {
  // Progress Queries
  getTopicProgress(userId: string, topicId: string): Promise<UserProgress | null>;
  getLearningPathProgress(userId: string, learningPathId: string): Promise<UserProgress | null>;
  getAllProgress(userId: string): Promise<UserProgress[]>;

  // Progress Updates
  recordTaskCompletion(userId: string, taskId: string, isCorrect: boolean, timeSpent: number): Promise<void>;
  updateStreakDays(userId: string): Promise<void>;
  recalculateMasteryLevel(userId: string, topicId: string): Promise<number>;

  // Analytics
  getProgressSummary(userId: string): Promise<ProgressSummary>;
  getWeeklyStats(userId: string): Promise<WeeklyStats[]>;
}

export interface ProgressSummary {
  totalTopics: number;
  completedTopics: number;
  totalTasksCompleted: number;
  overallAccuracy: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
}

export interface WeeklyStats {
  week: string; // ISO week string
  tasksCompleted: number;
  accuracy: number;
  timeSpent: number;
  topicsStudied: string[];
}

/**
 * Answer history tracking service
 */
export interface IAnswerHistoryService {
  // Recording Answers
  recordAnswer(answer: Omit<AnswerHistory, 'id' | 'timestamp'>): Promise<AnswerHistory>;

  // Querying History
  getTaskHistory(taskId: string, userId: string): Promise<AnswerHistory[]>;
  getUserHistory(userId: string, limit?: number): Promise<AnswerHistory[]>;
  getSessionHistory(sessionId: string): Promise<AnswerHistory[]>;

  // Analytics
  getAccuracyTrend(userId: string, days: number): Promise<AccuracyTrend[]>;
  getDifficultyAnalysis(userId: string, topicId: string): Promise<DifficultyAnalysis>;
}

export interface AccuracyTrend {
  date: Date;
  accuracy: number;
  taskCount: number;
}

export interface DifficultyAnalysis {
  easy: { total: number; correct: number; accuracy: number };
  medium: { total: number; correct: number; accuracy: number };
  hard: { total: number; correct: number; accuracy: number };
}

// Error Types
export class LearningPlatformError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'LearningPlatformError';
  }
}

export class ValidationError extends LearningPlatformError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends LearningPlatformError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', { resource, id });
    this.name = 'NotFoundError';
  }
}

export class BusinessRuleError extends LearningPlatformError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'BUSINESS_RULE_VIOLATION', context);
    this.name = 'BusinessRuleError';
  }
}