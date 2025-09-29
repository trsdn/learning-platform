import type {
  IInMemoryAdapter,
  ITopicRepository,
  ILearningPathRepository,
  ITaskRepository,
  IAnswerHistoryRepository,
  IUserProgressRepository,
  IPracticeSessionRepository,
  ISpacedRepetitionRepository,
  SeedData,
  StorageState,
  SyncItem,
} from '../types/adapters';
import type { Topic, LearningPath } from '@core/types/services';

/**
 * In-Memory Storage Adapter for testing
 * Implements all repository interfaces using Map data structures
 */
export class InMemoryAdapter implements IInMemoryAdapter {
  private state: StorageState = {
    topics: new Map(),
    learningPaths: new Map(),
    tasks: new Map(),
    answerHistory: new Map(),
    userProgress: new Map(),
    practiceSessions: new Map(),
    spacedRepetition: new Map(),
    syncQueue: new Map(),
  };

  // Repository instances
  public readonly topics: ITopicRepository;
  public readonly learningPaths: ILearningPathRepository;
  public readonly tasks: ITaskRepository;
  public readonly answerHistory: IAnswerHistoryRepository;
  public readonly userProgress: IUserProgressRepository;
  public readonly practiceSessions: IPracticeSessionRepository;
  public readonly spacedRepetition: ISpacedRepetitionRepository;

  constructor() {
    // Initialize repositories with reference to state
    this.topics = this.createTopicRepository();
    this.learningPaths = this.createLearningPathRepository();
    this.tasks = this.createTaskRepository();
    this.answerHistory = this.createAnswerHistoryRepository();
    this.userProgress = this.createUserProgressRepository();
    this.practiceSessions = this.createPracticeSessionRepository();
    this.spacedRepetition = this.createSpacedRepetitionRepository();
  }

  // IStorageAdapter methods
  async transaction<T>(callback: (adapter: IInMemoryAdapter) => Promise<T>): Promise<T> {
    // In-memory adapter doesn't need real transactions
    return await callback(this);
  }

  async initialize(): Promise<void> {
    // No initialization needed for in-memory
  }

  async close(): Promise<void> {
    // No cleanup needed
  }

  async clear(): Promise<void> {
    this.state.topics.clear();
    this.state.learningPaths.clear();
    this.state.tasks.clear();
    this.state.answerHistory.clear();
    this.state.userProgress.clear();
    this.state.practiceSessions.clear();
    this.state.spacedRepetition.clear();
    this.state.syncQueue.clear();
  }

  async backup(): Promise<Blob> {
    const data = {
      topics: Array.from(this.state.topics.entries()),
      learningPaths: Array.from(this.state.learningPaths.entries()),
      tasks: Array.from(this.state.tasks.entries()),
      answerHistory: Array.from(this.state.answerHistory.entries()),
      userProgress: Array.from(this.state.userProgress.entries()),
      practiceSessions: Array.from(this.state.practiceSessions.entries()),
      spacedRepetition: Array.from(this.state.spacedRepetition.entries()),
    };
    return new Blob([JSON.stringify(data)], { type: 'application/json' });
  }

  async restore(backup: Blob): Promise<void> {
    const text = await backup.text();
    const data = JSON.parse(text);

    this.state.topics = new Map(data.topics);
    this.state.learningPaths = new Map(data.learningPaths);
    this.state.tasks = new Map(data.tasks);
    this.state.answerHistory = new Map(data.answerHistory);
    this.state.userProgress = new Map(data.userProgress);
    this.state.practiceSessions = new Map(data.practiceSessions);
    this.state.spacedRepetition = new Map(data.spacedRepetition);
  }

  async getPendingSync(): Promise<SyncItem[]> {
    return Array.from(this.state.syncQueue.values());
  }

  async markSynced(items: SyncItem[]): Promise<void> {
    items.forEach((item) => this.state.syncQueue.delete(item.id));
  }

  async addToSyncQueue(item: Omit<SyncItem, 'id' | 'timestamp'>): Promise<void> {
    const syncItem: SyncItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      retryCount: 0,
    };
    this.state.syncQueue.set(syncItem.id, syncItem);
  }

  // IInMemoryAdapter specific methods
  reset(): void {
    this.state = {
      topics: new Map(),
      learningPaths: new Map(),
      tasks: new Map(),
      answerHistory: new Map(),
      userProgress: new Map(),
      practiceSessions: new Map(),
      spacedRepetition: new Map(),
      syncQueue: new Map(),
    };
  }

  async seed(data: SeedData): Promise<void> {
    if (data.topics) {
      data.topics.forEach((topic) => this.state.topics.set(topic.id, topic));
    }
    if (data.learningPaths) {
      data.learningPaths.forEach((path) => this.state.learningPaths.set(path.id, path));
    }
    if (data.tasks) {
      data.tasks.forEach((task) => this.state.tasks.set(task.id, task));
    }
    if (data.answerHistory) {
      data.answerHistory.forEach((answer) => this.state.answerHistory.set(answer.id, answer));
    }
    if (data.userProgress) {
      data.userProgress.forEach((progress) => this.state.userProgress.set(progress.id, progress));
    }
    if (data.practiceSessions) {
      data.practiceSessions.forEach((session) =>
        this.state.practiceSessions.set(session.id, session)
      );
    }
    if (data.spacedRepetition) {
      data.spacedRepetition.forEach((sr) => this.state.spacedRepetition.set(sr.id, sr));
    }
  }

  getState(): StorageState {
    return this.state;
  }

  setState(state: StorageState): void {
    this.state = state;
  }

  // Repository factory methods (simplified implementations)
  private createTopicRepository(): ITopicRepository {
    return {
      create: async (entity) => {
        const topic: Topic = {
          ...entity,
          id: `topic-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.state.topics.set(topic.id, topic);
        return topic;
      },
      getById: async (id) => this.state.topics.get(id) || null,
      update: async (id, updates) => {
        const existing = this.state.topics.get(id);
        if (!existing) throw new Error('Topic not found');
        const updated = { ...existing, ...updates, updatedAt: new Date() };
        this.state.topics.set(id, updated);
        return updated;
      },
      delete: async (id) => {
        this.state.topics.delete(id);
      },
      createMany: async (entities) => {
        return entities.map((entity) => {
          const topic: Topic = {
            ...entity,
            id: `topic-${Date.now()}-${Math.random()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          this.state.topics.set(topic.id, topic);
          return topic;
        });
      },
      updateMany: async (updates) => {
        updates.forEach(({ id, data }) => {
          const existing = this.state.topics.get(id);
          if (existing) {
            this.state.topics.set(id, { ...existing, ...data, updatedAt: new Date() });
          }
        });
      },
      deleteMany: async (ids) => {
        ids.forEach((id) => this.state.topics.delete(id));
      },
      getAll: async () => Array.from(this.state.topics.values()),
      count: async () => this.state.topics.size,
      exists: async (id) => this.state.topics.has(id),
      getByTitle: async (title) => {
        return Array.from(this.state.topics.values()).find((t) => t.title === title) || null;
      },
      getActive: async () => {
        return Array.from(this.state.topics.values()).filter((t) => t.isActive);
      },
      search: async (query) => {
        return Array.from(this.state.topics.values()).filter((t) =>
          t.title.toLowerCase().includes(query.toLowerCase())
        );
      },
    };
  }

  private createLearningPathRepository(): ILearningPathRepository {
    // Similar implementation pattern as topics
    return {
      create: async (entity) => {
        const path: LearningPath = {
          ...entity,
          id: `path-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.state.learningPaths.set(path.id, path);
        return path;
      },
      getById: async (id) => this.state.learningPaths.get(id) || null,
      update: async (id, updates) => {
        const existing = this.state.learningPaths.get(id);
        if (!existing) throw new Error('Learning path not found');
        const updated = { ...existing, ...updates, updatedAt: new Date() };
        this.state.learningPaths.set(id, updated);
        return updated;
      },
      delete: async (id) => {
        this.state.learningPaths.delete(id);
      },
      createMany: async (entities) =>
        entities.map((e) => {
          const p: LearningPath = {
            ...e,
            id: `path-${Date.now()}-${Math.random()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          this.state.learningPaths.set(p.id, p);
          return p;
        }),
      updateMany: async (updates) => {
        updates.forEach(({ id, data }) => {
          const e = this.state.learningPaths.get(id);
          if (e) this.state.learningPaths.set(id, { ...e, ...data, updatedAt: new Date() });
        });
      },
      deleteMany: async (ids) => ids.forEach((id) => this.state.learningPaths.delete(id)),
      getAll: async () => Array.from(this.state.learningPaths.values()),
      count: async () => this.state.learningPaths.size,
      exists: async (id) => this.state.learningPaths.has(id),
      getByTopicId: async (topicId) =>
        Array.from(this.state.learningPaths.values()).filter((p) => p.topicId === topicId),
      getByDifficulty: async (difficulty) =>
        Array.from(this.state.learningPaths.values()).filter((p) => p.difficulty === difficulty),
      getActive: async () =>
        Array.from(this.state.learningPaths.values()).filter((p) => p.isActive),
      searchByTitle: async (query) =>
        Array.from(this.state.learningPaths.values()).filter((p) =>
          p.title.toLowerCase().includes(query.toLowerCase())
        ),
    };
  }

  // Simplified implementations for other repositories
  private createTaskRepository(): ITaskRepository {
    return {} as ITaskRepository; // Placeholder
  }

  private createAnswerHistoryRepository(): IAnswerHistoryRepository {
    return {} as IAnswerHistoryRepository; // Placeholder
  }

  private createUserProgressRepository(): IUserProgressRepository {
    return {} as IUserProgressRepository; // Placeholder
  }

  private createPracticeSessionRepository(): IPracticeSessionRepository {
    return {} as IPracticeSessionRepository; // Placeholder
  }

  private createSpacedRepetitionRepository(): ISpacedRepetitionRepository {
    return {} as ISpacedRepetitionRepository; // Placeholder
  }
}