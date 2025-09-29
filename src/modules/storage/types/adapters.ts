/**
 * Storage Adapter Interfaces for Learning Platform
 * These contracts define the storage layer boundaries
 */

import type {
  Topic,
  LearningPath,
  Task,
  AnswerHistory,
  UserProgress,
  PracticeSession,
  SpacedRepetitionItem
} from '@core/types/services';

// Base Repository Interface
export interface IRepository<T> {
  // Basic CRUD operations
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  getById(id: string): Promise<T | null>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;

  // Bulk operations
  createMany(entities: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]>;
  updateMany(updates: Array<{ id: string; data: Partial<T> }>): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;

  // Query operations
  getAll(): Promise<T[]>;
  count(): Promise<number>;
  exists(id: string): Promise<boolean>;
}

// Specialized Repository Interfaces

export interface ITopicRepository extends IRepository<Topic> {
  getByTitle(title: string): Promise<Topic | null>;
  getActive(): Promise<Topic[]>;
  search(query: string): Promise<Topic[]>;
}

export interface ILearningPathRepository extends IRepository<LearningPath> {
  getByTopicId(topicId: string): Promise<LearningPath[]>;
  getByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<LearningPath[]>;
  getActive(): Promise<LearningPath[]>;
  searchByTitle(query: string): Promise<LearningPath[]>;
}

export interface ITaskRepository extends IRepository<Task> {
  getByLearningPathId(learningPathId: string): Promise<Task[]>;
  getByLearningPathIds(learningPathIds: string[]): Promise<Task[]>;
  getByType(type: string): Promise<Task[]>;
  getByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<Task[]>;
  getByTags(tags: string[]): Promise<Task[]>;
  search(query: TaskSearchQuery): Promise<Task[]>;
  getRandomTasks(count: number, filters?: TaskFilters): Promise<Task[]>;
}

export interface TaskSearchQuery {
  text?: string;
  topicId?: string;
  learningPathId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface TaskFilters {
  topicId?: string;
  learningPathIds?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: string;
  tags?: string[];
  excludeIds?: string[];
}

export interface IAnswerHistoryRepository extends IRepository<AnswerHistory> {
  getByTaskId(taskId: string): Promise<AnswerHistory[]>;
  getBySessionId(sessionId: string): Promise<AnswerHistory[]>;
  getByUserId(userId: string, limit?: number): Promise<AnswerHistory[]>;
  getByDateRange(startDate: Date, endDate: Date): Promise<AnswerHistory[]>;
  getCorrectAnswers(taskId: string): Promise<AnswerHistory[]>;
  getIncorrectAnswers(taskId: string): Promise<AnswerHistory[]>;
  getAccuracyForPeriod(userId: string, startDate: Date, endDate: Date): Promise<number>;
}

export interface IUserProgressRepository extends IRepository<UserProgress> {
  getByTopicId(topicId: string): Promise<UserProgress | null>;
  getByLearningPathId(learningPathId: string): Promise<UserProgress | null>;
  getByUserId(userId: string): Promise<UserProgress[]>;
  updateStatistics(id: string, stats: Partial<UserProgress['statistics']>): Promise<void>;
  incrementTaskCount(id: string, correct: boolean): Promise<void>;
  updateStreak(id: string, streakDays: number): Promise<void>;
}

export interface IPracticeSessionRepository extends IRepository<PracticeSession> {
  getByStatus(status: PracticeSession['execution']['status']): Promise<PracticeSession[]>;
  getByUserId(userId: string): Promise<PracticeSession[]>;
  getActive(userId: string): Promise<PracticeSession[]>;
  getRecent(userId: string, limit: number): Promise<PracticeSession[]>;
  getByDateRange(startDate: Date, endDate: Date): Promise<PracticeSession[]>;
  updateStatus(id: string, status: PracticeSession['execution']['status']): Promise<void>;
  incrementProgress(id: string, correct: boolean, timeSpent: number): Promise<void>;
}

export interface ISpacedRepetitionRepository extends IRepository<SpacedRepetitionItem> {
  getByTaskId(taskId: string): Promise<SpacedRepetitionItem | null>;
  getDue(beforeDate: Date): Promise<SpacedRepetitionItem[]>;
  getByNextReviewDate(date: Date): Promise<SpacedRepetitionItem[]>;
  updateAlgorithmData(id: string, algorithm: SpacedRepetitionItem['algorithm']): Promise<void>;
  updateSchedule(id: string, schedule: SpacedRepetitionItem['schedule']): Promise<void>;
  updatePerformance(id: string, performance: SpacedRepetitionItem['performance']): Promise<void>;
  getReviewCalendar(startDate: Date, endDate: Date): Promise<ReviewCalendarEntry[]>;
}

export interface ReviewCalendarEntry {
  date: Date;
  taskCount: number;
  estimatedTime: number;
}

// Storage Adapter Interface
export interface IStorageAdapter {
  // Repository access
  topics: ITopicRepository;
  learningPaths: ILearningPathRepository;
  tasks: ITaskRepository;
  answerHistory: IAnswerHistoryRepository;
  userProgress: IUserProgressRepository;
  practiceSessions: IPracticeSessionRepository;
  spacedRepetition: ISpacedRepetitionRepository;

  // Transaction management
  transaction<T>(callback: (adapter: IStorageAdapter) => Promise<T>): Promise<T>;

  // Database management
  initialize(): Promise<void>;
  close(): Promise<void>;
  clear(): Promise<void>;
  backup(): Promise<Blob>;
  restore(backup: Blob): Promise<void>;

  // Sync management
  getPendingSync(): Promise<SyncItem[]>;
  markSynced(items: SyncItem[]): Promise<void>;
  addToSyncQueue(item: Omit<SyncItem, 'id' | 'timestamp'>): Promise<void>;
}

export interface SyncItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  tableName: string;
  recordId: string;
  data?: any;
  timestamp: Date;
  retryCount: number;
}

// Specific Adapter Implementations

/**
 * IndexedDB Storage Adapter
 */
export interface IIndexedDBAdapter extends IStorageAdapter {
  // IndexedDB specific operations
  getDatabase(): IDBDatabase;
  getVersion(): number;
  migrate(oldVersion: number, newVersion: number): Promise<void>;

  // Performance optimizations
  bulkImport(tableName: string, data: any[]): Promise<void>;
  createIndexes(tableName: string, indexes: IndexDefinition[]): Promise<void>;
  optimize(): Promise<void>;
  getStats(): Promise<DatabaseStats>;
}

export interface IndexDefinition {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
  multiEntry?: boolean;
}

export interface DatabaseStats {
  totalSize: number;
  tableStats: Record<string, {
    recordCount: number;
    size: number;
    indexes: string[];
  }>;
}

/**
 * In-Memory Storage Adapter (for testing)
 */
export interface IInMemoryAdapter extends IStorageAdapter {
  // In-memory specific operations
  reset(): void;
  seed(data: SeedData): Promise<void>;
  getState(): StorageState;
  setState(state: StorageState): void;
}

export interface SeedData {
  topics?: Topic[];
  learningPaths?: LearningPath[];
  tasks?: Task[];
  answerHistory?: AnswerHistory[];
  userProgress?: UserProgress[];
  practiceSessions?: PracticeSession[];
  spacedRepetition?: SpacedRepetitionItem[];
}

export interface StorageState {
  topics: Map<string, Topic>;
  learningPaths: Map<string, LearningPath>;
  tasks: Map<string, Task>;
  answerHistory: Map<string, AnswerHistory>;
  userProgress: Map<string, UserProgress>;
  practiceSessions: Map<string, PracticeSession>;
  spacedRepetition: Map<string, SpacedRepetitionItem>;
  syncQueue: Map<string, SyncItem>;
}

/**
 * Local Storage Adapter (for settings and lightweight data)
 */
export interface ILocalStorageAdapter {
  // Basic operations
  setItem<T>(key: string, value: T): void;
  getItem<T>(key: string): T | null;
  removeItem(key: string): void;
  clear(): void;

  // Typed accessors
  getUserPreferences(): UserPreferences | null;
  setUserPreferences(preferences: UserPreferences): void;
  getAppSettings(): AppSettings | null;
  setAppSettings(settings: AppSettings): void;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  defaultSessionLength: number;
  reminderSettings: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    time: string;
  };
  difficultyPreference: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

export interface AppSettings {
  version: string;
  firstLaunch: Date;
  lastSync: Date;
  offlineMode: boolean;
  debugMode: boolean;
  telemetryEnabled: boolean;
}

// Storage Factory Interface
export interface IStorageFactory {
  createIndexedDBAdapter(): Promise<IIndexedDBAdapter>;
  createInMemoryAdapter(): IInMemoryAdapter;
  createLocalStorageAdapter(): ILocalStorageAdapter;

  // Configuration
  configure(config: StorageConfig): void;
  getConfig(): StorageConfig;
}

export interface StorageConfig {
  databaseName: string;
  version: number;
  stores: StoreConfig[];
  indexes: Record<string, IndexDefinition[]>;

  // Performance settings
  cacheSize: number;
  batchSize: number;
  syncInterval: number;

  // Migration settings
  migrationCallbacks: Record<number, (adapter: IStorageAdapter) => Promise<void>>;
}

export interface StoreConfig {
  name: string;
  keyPath: string;
  autoIncrement?: boolean;
  indexes?: IndexDefinition[];
}

// Error Types for Storage Layer
export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class ConnectionError extends StorageError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONNECTION_ERROR', context);
    this.name = 'ConnectionError';
  }
}

export class TransactionError extends StorageError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'TRANSACTION_ERROR', context);
    this.name = 'TransactionError';
  }
}

export class MigrationError extends StorageError {
  constructor(message: string, fromVersion: number, toVersion: number) {
    super(message, 'MIGRATION_ERROR', { fromVersion, toVersion });
    this.name = 'MigrationError';
  }
}

export class QuotaExceededError extends StorageError {
  constructor(requestedSize: number, availableSize: number) {
    super('Storage quota exceeded', 'QUOTA_EXCEEDED', { requestedSize, availableSize });
    this.name = 'QuotaExceededError';
  }
}