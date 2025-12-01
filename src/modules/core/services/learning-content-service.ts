import type {
  ILearningContentService,
  Task,
  Topic,
  LearningPath,
  TaskSearchFilters,
} from '../types/services';
import type {
  ITopicRepository,
  ILearningPathRepository,
  ITaskRepository,
} from '@storage/types/adapters';

/**
 * Learning Content Service for managing topics, paths, and tasks
 */
export class LearningContentService implements ILearningContentService {
  constructor(
    private topicRepository: ITopicRepository,
    private learningPathRepository: ILearningPathRepository,
    private taskRepository: ITaskRepository
  ) {}

  // Topic Management
  async getTopics(): Promise<Topic[]> {
    return await this.topicRepository.getActive();
  }

  async getTopic(id: string): Promise<Topic | null> {
    return await this.topicRepository.getById(id);
  }

  async getTopicByTitle(title: string): Promise<Topic | null> {
    return await this.topicRepository.getByTitle(title);
  }

  // Learning Path Management
  async getLearningPaths(topicId: string): Promise<LearningPath[]> {
    return await this.learningPathRepository.getByTopicId(topicId);
  }

  async getLearningPath(id: string): Promise<LearningPath | null> {
    return await this.learningPathRepository.getById(id);
  }

  // Task Management
  async getTasks(learningPathId: string): Promise<Task[]> {
    return await this.taskRepository.getByLearningPathId(learningPathId);
  }

  async getTask(id: string): Promise<Task | null> {
    return await this.taskRepository.getById(id);
  }

  async searchTasks(query: string, filters: TaskSearchFilters): Promise<Task[]> {
    const searchQuery: {
      text: string;
      topicId?: string;
      learningPathId?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
      type?: string;
      tags?: string[];
    } = { text: query };

    if (filters.topicId) searchQuery.topicId = filters.topicId;
    if (filters.learningPathId) searchQuery.learningPathId = filters.learningPathId;
    if (filters.difficulty) searchQuery.difficulty = filters.difficulty;
    if (filters.type) searchQuery.type = filters.type;
    if (filters.tags) searchQuery.tags = filters.tags;

    return await this.taskRepository.search(searchQuery);
  }
}