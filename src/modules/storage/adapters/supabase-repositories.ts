/**
 * Supabase Repository Adapters
 *
 * Implementation of all repository interfaces using Supabase client.
 * Provides CRUD operations and specialized queries for each domain entity.
 */

import { supabase, getCurrentUserId } from '@/modules/storage/supabase-client';
import type { Database, Json } from '@/modules/storage/database.types';
import type {
  Topic,
  LearningPath,
  Task,
  UserProgress,
  PracticeSession,
  AnswerHistory,
  SpacedRepetitionItem,
} from '@/modules/core/types/services';
import type {
  IPracticeSessionRepository,
  ISpacedRepetitionRepository,
  ITaskRepository,
  TaskSearchQuery,
} from '@/modules/storage/types/adapters';
import { logger } from '@/utils/logger';

// Type aliases for Supabase table types
type DbTopic = Database['public']['Tables']['topics']['Row'];
type DbLearningPath = Database['public']['Tables']['learning_paths']['Row'];
type DbTask = Database['public']['Tables']['tasks']['Row'];
type DbUserProgress = Database['public']['Tables']['user_progress']['Row'];
type DbPracticeSession = Database['public']['Tables']['practice_sessions']['Row'];
type DbAnswerHistory = Database['public']['Tables']['answer_history']['Row'];
type DbSpacedRepetition = Database['public']['Tables']['spaced_repetition']['Row'];

// Type definitions for JSON fields stored in the database
type TopicMetadata = Topic['metadata'];
type LearningPathRequirements = LearningPath['requirements'];
type TaskContent = Task['content'];
type TaskMetadata = Task['metadata'];
type UserProgressStatistics = UserProgress['statistics'];
type UserProgressMilestones = UserProgress['milestones'];
type PracticeSessionExecution = PracticeSession['execution'];
type PracticeSessionConfiguration = PracticeSession['configuration'];
type SpacedRepetitionSchedule = SpacedRepetitionItem['schedule'];
type SpacedRepetitionAlgorithm = SpacedRepetitionItem['algorithm'];
type SpacedRepetitionPerformance = SpacedRepetitionItem['performance'];

/**
 * Topic Repository - Manages learning topics
 */
export class TopicRepository {
  /**
   * Get all active topics
   */
  async getAll(): Promise<Topic[]> {
    const { data, error} = await supabase
      .from('topics')
      .select('*')
      .eq('is_active', true)
      .order('title');

    if (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Get topic by ID
   */
  async getById(id: string): Promise<Topic | null> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching topic:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Create new topic
   */
  async create(topic: Omit<Topic, 'createdAt' | 'updatedAt'>): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .insert({
        id: topic.id,
        title: topic.title,
        description: topic.description,
        learning_path_ids: topic.learningPathIds,
        metadata: topic.metadata,
        is_active: topic.isActive,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating topic:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Update topic
   */
  async update(id: string, updates: Partial<Topic>): Promise<Topic> {
    const dbUpdates: Partial<{
      title: string;
      description: string;
      learning_path_ids: string[];
      metadata: TopicMetadata;
      is_active: boolean;
    }> = {};

    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.learningPathIds !== undefined) dbUpdates.learning_path_ids = updates.learningPathIds;
    if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('topics')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating topic:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Delete topic
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  }

  /**
   * Count all active topics
   */
  async count(): Promise<number> {
    const { count, error } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) {
      console.error('Error counting topics:', error);
      throw error;
    }

    return count ?? 0;
  }

  /**
   * Map database row to domain model
   */
  private mapFromDb(row: DbTopic): Topic {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      learningPathIds: row.learning_path_ids ?? [],
      metadata: row.metadata as TopicMetadata,
      isActive: row.is_active ?? true,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

/**
 * Learning Path Repository - Manages learning paths
 */
export class LearningPathRepository {
  /**
   * Get all active learning paths
   */
  async getAll(): Promise<LearningPath[]> {
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('is_active', true)
      .order('title');

    if (error) {
      console.error('Error fetching learning paths:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Get learning path by ID
   */
  async getById(id: string): Promise<LearningPath | null> {
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching learning path:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Get learning paths by topic ID
   */
  async getByTopicId(topicId: string): Promise<LearningPath[]> {
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('topic_id', topicId)
      .eq('is_active', true)
      .order('title');

    if (error) {
      console.error('Error fetching learning paths by topic:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Create new learning path
   */
  async create(learningPath: Omit<LearningPath, 'createdAt' | 'updatedAt'>): Promise<LearningPath> {
    const { data, error } = await supabase
      .from('learning_paths')
      .insert({
        id: learningPath.id,
        topic_id: learningPath.topicId,
        title: learningPath.title,
        description: learningPath.description,
        difficulty: learningPath.difficulty,
        task_ids: learningPath.taskIds,
        estimated_time: learningPath.estimatedTime,
        requirements: learningPath.requirements,
        is_active: learningPath.isActive,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating learning path:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Update learning path
   */
  async update(id: string, updates: Partial<LearningPath>): Promise<LearningPath> {
    const dbUpdates: Partial<{
      title: string;
      description: string;
      difficulty: string;
      task_ids: string[];
      estimated_time: number;
      requirements: LearningPathRequirements;
      is_active: boolean;
    }> = {};

    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
    if (updates.taskIds !== undefined) dbUpdates.task_ids = updates.taskIds;
    if (updates.estimatedTime !== undefined) dbUpdates.estimated_time = updates.estimatedTime;
    if (updates.requirements !== undefined) dbUpdates.requirements = updates.requirements;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('learning_paths')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating learning path:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Delete learning path
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('learning_paths')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting learning path:', error);
      throw error;
    }
  }

  /**
   * Map database row to domain model
   */
  private mapFromDb(row: DbLearningPath): LearningPath {
    return {
      id: row.id,
      topicId: row.topic_id,
      title: row.title,
      description: row.description,
      difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
      taskIds: row.task_ids ?? [],
      estimatedTime: row.estimated_time,
      requirements: row.requirements as LearningPathRequirements,
      isActive: row.is_active ?? true,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

/**
 * Task Repository - Manages learning tasks
 */
export class TaskRepository implements ITaskRepository {
  /**
   * Get all tasks
   */
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at');

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Get task by ID
   */
  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching task:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Get tasks by learning path ID
   */
  async getByLearningPathId(learningPathId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('learning_path_id', learningPathId)
      .order('created_at');

    if (error) {
      console.error('Error fetching tasks by learning path:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Get tasks by IDs (bulk fetch)
   */
  async getByIds(ids: string[]): Promise<Task[]> {
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .in('id', ids);

    if (error) {
      console.error('Error fetching tasks by IDs:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Create new task
   */
  async create(task: Omit<Task, 'createdAt' | 'updatedAt'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        id: task.id,
        learning_path_id: task.learningPathId,
        template_id: task.templateId || null,
        type: task.type,
        content: task.content as unknown as Json,
        metadata: task.metadata as unknown as Json,
        has_audio: task.hasAudio || false,
        audio_url: task.audioUrl || null,
        language: task.language || null,
        ipa: task.ipa || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Bulk create tasks
   */
  async createMany(tasks: Omit<Task, 'createdAt' | 'updatedAt'>[]): Promise<Task[]> {
    const inserts = tasks.map(task => ({
      id: task.id,
      learning_path_id: task.learningPathId,
      template_id: task.templateId || null,
      type: task.type,
      content: task.content as unknown as Json,
      metadata: task.metadata as unknown as Json,
      has_audio: task.hasAudio || false,
      audio_url: task.audioUrl || null,
      language: task.language || null,
      ipa: task.ipa || null,
    }));

    const { data, error } = await supabase
      .from('tasks')
      .insert(inserts)
      .select();

    if (error) {
      console.error('Error creating tasks:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Update task
   */
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const dbUpdates: Partial<{
      content: Json;
      metadata: Json;
      has_audio: boolean;
      audio_url: string | null;
      language: string | null;
      ipa: string | null;
    }> = {};

    if (updates.content !== undefined) dbUpdates.content = updates.content as unknown as Json;
    if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata as unknown as Json;
    if (updates.hasAudio !== undefined) dbUpdates.has_audio = updates.hasAudio;
    if (updates.audioUrl !== undefined) dbUpdates.audio_url = updates.audioUrl;
    if (updates.language !== undefined) dbUpdates.language = updates.language;
    if (updates.ipa !== undefined) dbUpdates.ipa = updates.ipa;

    const { data, error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Delete task
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Get random tasks with filters
   */
  async getRandomTasks(
    count: number,
    filters?: {
      learningPathIds?: string[];
      difficulty?: string;
      excludeIds?: string[];
      deterministic?: boolean;
    }
  ): Promise<Task[]> {
    logger.debug(`[TaskRepository] getRandomTasks called: count=${count}, filters=`, filters);

    let query = supabase.from('tasks').select('*');

    // Apply learning path filter
    if (filters?.learningPathIds && filters.learningPathIds.length > 0) {
      query = query.in('learning_path_id', filters.learningPathIds);
    }

    // Apply difficulty filter
    if (filters?.difficulty) {
      query = query.eq('metadata->>difficulty', filters.difficulty);
    }

    // Apply exclude IDs filter
    if (filters?.excludeIds && filters.excludeIds.length > 0) {
      query = query.not('id', 'in', `(${filters.excludeIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching random tasks:', error);
      throw error;
    }

    const tasks = (data || []).map(row => this.mapFromDb(row));
    logger.debug(`[TaskRepository] Found ${tasks.length} tasks`);

    // Either shuffle or sort deterministically (by ID) based on filter flag
    const orderedTasks = filters?.deterministic
      ? tasks.sort((a, b) => a.id.localeCompare(b.id))
      : tasks.sort(() => Math.random() - 0.5);

    // Return up to count tasks (with repetition if needed)
    const result: Task[] = [];
    if (orderedTasks.length === 0) {
      logger.debug(`[TaskRepository] No tasks available!`);
      return result;
    }

    for (let i = 0; i < count; i++) {
      const task = orderedTasks[i % orderedTasks.length];
      if (task) {
        result.push(task);
      }
    }

    logger.debug(`[TaskRepository] Returning ${result.length} random tasks`);
    return result;
  }

  /**
   * Count all tasks
   */
  async count(): Promise<number> {
    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error counting tasks:', error);
      throw error;
    }

    return count ?? 0;
  }

  /**
   * Get tasks by multiple learning path IDs
   */
  async getByLearningPathIds(learningPathIds: string[]): Promise<Task[]> {
    if (learningPathIds.length === 0) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .in('learning_path_id', learningPathIds)
      .order('created_at');

    if (error) {
      console.error('Error fetching tasks by learning path IDs:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Get tasks by type
   */
  async getByType(type: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('type', type)
      .order('created_at');

    if (error) {
      console.error('Error fetching tasks by type:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Get tasks by difficulty
   */
  async getByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('metadata->>difficulty', difficulty)
      .order('created_at');

    if (error) {
      console.error('Error fetching tasks by difficulty:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Get tasks by tags
   */
  async getByTags(tags: string[]): Promise<Task[]> {
    if (tags.length === 0) return [];

    // Note: This assumes tags are stored as a JSON array in metadata
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .contains('metadata->tags', tags)
      .order('created_at');

    if (error) {
      console.error('Error fetching tasks by tags:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Search tasks
   */
  async search(query: TaskSearchQuery): Promise<Task[]> {
    let supabaseQuery = supabase.from('tasks').select('*');

    if (query.learningPathId) {
      supabaseQuery = supabaseQuery.eq('learning_path_id', query.learningPathId);
    }

    if (query.type) {
      supabaseQuery = supabaseQuery.eq('type', query.type);
    }

    if (query.difficulty) {
      supabaseQuery = supabaseQuery.eq('metadata->>difficulty', query.difficulty);
    }

    if (query.tags && query.tags.length > 0) {
      supabaseQuery = supabaseQuery.contains('metadata->tags', query.tags);
    }

    supabaseQuery = supabaseQuery.order('created_at');

    if (query.limit) {
      supabaseQuery = supabaseQuery.limit(query.limit);
    }

    if (query.offset) {
      supabaseQuery = supabaseQuery.range(query.offset, query.offset + (query.limit || 100) - 1);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Error searching tasks:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Update many tasks
   */
  async updateMany(updates: Array<{ id: string; data: Partial<Task> }>): Promise<void> {
    // Execute updates sequentially
    for (const { id, data } of updates) {
      await this.update(id, data);
    }
  }

  /**
   * Delete many tasks
   */
  async deleteMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting tasks:', error);
      throw error;
    }
  }

  /**
   * Check if task exists
   */
  async exists(id: string): Promise<boolean> {
    const task = await this.getById(id);
    return task !== null;
  }

  /**
   * Map database row to domain model
   */
  private mapFromDb(row: DbTask): Task {
    const result: Task = {
      id: row.id,
      learningPathId: row.learning_path_id,
      templateId: row.template_id ?? '',
      type: row.type as Task['type'],
      content: row.content as unknown as TaskContent,
      metadata: row.metadata as unknown as TaskMetadata,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    if (row.has_audio !== null) result.hasAudio = row.has_audio;
    if (row.audio_url !== null) result.audioUrl = row.audio_url;
    if (row.language !== null) result.language = row.language;
    if (row.ipa !== null) result.ipa = row.ipa;

    return result;
  }
}

/**
 * User Progress Repository - Manages user learning progress
 */
export class UserProgressRepository {
  /**
   * Get all progress for current user
   */
  async getAll(): Promise<UserProgress[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Get progress by learning path ID
   */
  async getByLearningPathId(learningPathId: string): Promise<UserProgress | null> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('learning_path_id', learningPathId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching user progress:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Get progress by topic ID
   */
  async getByTopicId(topicId: string): Promise<UserProgress[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user progress by topic:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Create or update progress (upsert)
   */
  async upsert(progress: Omit<UserProgress, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProgress> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        topic_id: progress.topicId ?? '',
        learning_path_id: progress.learningPathId ?? '',
        statistics: progress.statistics as unknown as Json,
        milestones: progress.milestones as unknown as Json,
      }, {
        onConflict: 'user_id,learning_path_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user progress:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Delete progress
   */
  async delete(learningPathId: string): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId)
      .eq('learning_path_id', learningPathId);

    if (error) {
      console.error('Error deleting user progress:', error);
      throw error;
    }
  }

  /**
   * Map database row to domain model
   */
  private mapFromDb(row: DbUserProgress): UserProgress {
    return {
      id: row.id,
      topicId: row.topic_id,
      learningPathId: row.learning_path_id,
      statistics: row.statistics as unknown as UserProgressStatistics,
      milestones: row.milestones as unknown as UserProgressMilestones,
      preferences: {
        preferredDifficulty: 'medium',
        preferredSessionLength: 20,
        reminderSettings: {
          enabled: false,
          frequency: 'daily',
          time: '09:00',
        },
      },
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

/**
 * Practice Session Repository - Manages practice sessions
 */
export class PracticeSessionRepository implements IPracticeSessionRepository {
  /**
   * Get all sessions for current user
   */
  async getAll(): Promise<PracticeSession[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching practice sessions:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Get session by ID
   */
  async getById(id: string): Promise<PracticeSession | null> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching practice session:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Get sessions by learning path
   */
  async getByLearningPathId(learningPathId: string): Promise<PracticeSession[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('learning_path_id', learningPathId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions by learning path:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Get active session for learning path
   */
  async getActiveSession(learningPathId: string): Promise<PracticeSession | null> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('learning_path_id', learningPathId)
      .in('execution->>status', ['planned', 'active', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active session:', error);
      throw error;
    }

    return data ? this.mapFromDb(data) : null;
  }

  /**
   * Create new session
   */
  async create(session: Omit<PracticeSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<PracticeSession> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Serialize execution dates to ISO strings for Json compatibility
    const executionData = {
      ...session.execution,
      startedAt: session.execution.startedAt?.toISOString(),
      completedAt: session.execution.completedAt?.toISOString(),
    };

    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: userId,
        learning_path_id: session.configuration.learningPathIds[0] ?? '',
        task_ids: session.execution.taskIds,
        execution: executionData as unknown as Json,
        progress: null,
        configuration: session.configuration as unknown as Json,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating practice session:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Update session
   */
  async update(id: string, updates: Partial<PracticeSession>): Promise<PracticeSession> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const dbUpdates: Partial<{
      execution: Json;
      configuration: Json;
      task_ids: string[];
      learning_path_id: string;
    }> = {};

    if (updates.execution !== undefined) {
      // Serialize execution dates to ISO strings for Json compatibility
      const executionData = {
        ...updates.execution,
        startedAt: updates.execution.startedAt?.toISOString(),
        completedAt: updates.execution.completedAt?.toISOString(),
      };
      dbUpdates.execution = executionData as unknown as Json;
      dbUpdates.task_ids = updates.execution.taskIds;
    }
    if (updates.configuration !== undefined) {
      dbUpdates.configuration = updates.configuration as unknown as Json;
      const firstLearningPathId = updates.configuration.learningPathIds?.[0];
      if (firstLearningPathId !== undefined) {
        dbUpdates.learning_path_id = firstLearningPathId;
      }
    }

    const { data, error } = await supabase
      .from('practice_sessions')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating practice session:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Delete session
   */
  async delete(id: string): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('practice_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting practice session:', error);
      throw error;
    }
  }

  /**
   * Get sessions by status
   */
  async getByStatus(status: PracticeSession['execution']['status']): Promise<PracticeSession[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('execution->>status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions by status:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Get sessions by user ID
   */
  async getByUserId(userId: string): Promise<PracticeSession[]> {
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions by user:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Get active sessions for user
   */
  async getActive(userId: string): Promise<PracticeSession[]> {
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .in('execution->>status', ['planned', 'active', 'paused'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active sessions:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Get recent sessions for user
   */
  async getRecent(userId: string, limit: number): Promise<PracticeSession[]> {
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent sessions:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Get sessions by date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<PracticeSession[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions by date range:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Update session status
   */
  async updateStatus(id: string, status: PracticeSession['execution']['status']): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // First get the current execution data
    const session = await this.getById(id);
    if (!session) throw new Error('Session not found');

    const updatedExecution = {
      ...session.execution,
      status,
      ...(status === 'completed' && { completedAt: new Date().toISOString() }),
      startedAt: session.execution.startedAt?.toISOString(),
    };

    const { error } = await supabase
      .from('practice_sessions')
      .update({ execution: updatedExecution as unknown as Json })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  }

  /**
   * Increment progress
   */
  async incrementProgress(id: string, correct: boolean, timeSpent: number): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // First get the current execution data
    const session = await this.getById(id);
    if (!session) throw new Error('Session not found');

    const updatedExecution = {
      ...session.execution,
      completedCount: session.execution.completedCount + 1,
      correctCount: session.execution.correctCount + (correct ? 1 : 0),
      totalTimeSpent: session.execution.totalTimeSpent + timeSpent,
      startedAt: session.execution.startedAt?.toISOString(),
      completedAt: session.execution.completedAt?.toISOString(),
    };

    const { error } = await supabase
      .from('practice_sessions')
      .update({ execution: updatedExecution as unknown as Json })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error incrementing session progress:', error);
      throw error;
    }
  }

  /**
   * Get completed sessions (recent completed sessions)
   */
  async getCompleted(limit: number): Promise<PracticeSession[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('execution->>status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching completed sessions:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Create many sessions
   */
  async createMany(sessions: Omit<PracticeSession, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<PracticeSession[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const inserts = sessions.map(session => {
      // Serialize execution dates to ISO strings for Json compatibility
      const executionData = {
        ...session.execution,
        startedAt: session.execution.startedAt?.toISOString(),
        completedAt: session.execution.completedAt?.toISOString(),
      };

      return {
        user_id: userId,
        learning_path_id: session.configuration.learningPathIds[0] ?? '',
        task_ids: session.execution.taskIds,
        execution: executionData as unknown as Json,
        progress: null,
        configuration: session.configuration as unknown as Json,
      };
    });

    const { data, error } = await supabase
      .from('practice_sessions')
      .insert(inserts)
      .select();

    if (error) {
      console.error('Error creating practice sessions:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Update many sessions
   */
  async updateMany(updates: Array<{ id: string; data: Partial<PracticeSession> }>): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Execute updates sequentially (Supabase doesn't support bulk updates easily)
    for (const { id, data } of updates) {
      await this.update(id, data);
    }
  }

  /**
   * Delete many sessions
   */
  async deleteMany(ids: string[]): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('practice_sessions')
      .delete()
      .in('id', ids)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting practice sessions:', error);
      throw error;
    }
  }

  /**
   * Count sessions
   */
  async count(): Promise<number> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { count, error } = await supabase
      .from('practice_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error counting practice sessions:', error);
      throw error;
    }

    return count || 0;
  }

  /**
   * Check if session exists
   */
  async exists(id: string): Promise<boolean> {
    const session = await this.getById(id);
    return session !== null;
  }

  /**
   * Map database row to domain model
   */
  private mapFromDb(row: DbPracticeSession): PracticeSession {
    const execution = (row.execution as unknown as PracticeSessionExecution) || {
      taskIds: row.task_ids,
      completedCount: 0,
      correctCount: 0,
      status: 'planned' as const,
      totalTimeSpent: 0,
    };
    const configuration = (row.configuration as unknown as PracticeSessionConfiguration) || {
      topicId: '',
      learningPathIds: [row.learning_path_id],
      targetCount: row.task_ids.length,
      includeReview: false,
    };

    // Compute results from execution data
    const completedCount = execution.completedCount || 0;
    const correctCount = execution.correctCount || 0;
    const totalTimeSpent = execution.totalTimeSpent || 0;

    const results = {
      accuracy: completedCount > 0 ? (correctCount / completedCount) * 100 : 0,
      averageTime: completedCount > 0 ? totalTimeSpent / completedCount : 0,
      difficultyDistribution: {},
      improvementAreas: [],
    };

    return {
      id: row.id,
      execution,
      configuration,
      results,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

/**
 * Answer History Repository - Manages answer records
 */
export class AnswerHistoryRepository {
  /**
   * Get all answers for current user
   */
  async getAll(): Promise<AnswerHistory[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('answer_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Error fetching answer history:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Get answers by session ID
   */
  async getBySessionId(sessionId: string): Promise<AnswerHistory[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('answer_history')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('timestamp');

    if (error) {
      console.error('Error fetching answers by session:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Get answers by task ID
   */
  async getByTaskId(taskId: string): Promise<AnswerHistory[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('answer_history')
      .select('*')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching answers by task:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Create new answer record
   */
  async create(answer: Omit<AnswerHistory, 'id'>): Promise<AnswerHistory> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('answer_history')
      .insert({
        user_id: userId,
        task_id: answer.taskId,
        session_id: answer.sessionId || null,
        timestamp: answer.timestamp.toISOString(),
        is_correct: answer.isCorrect,
        user_answer: answer.userAnswer,
        correct_answer: null,
        time_taken_ms: answer.timeSpent || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating answer:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Bulk create answers
   */
  async createMany(answers: Omit<AnswerHistory, 'id'>[]): Promise<AnswerHistory[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const inserts = answers.map(answer => ({
      user_id: userId,
      task_id: answer.taskId,
      session_id: answer.sessionId || null,
      timestamp: answer.timestamp.toISOString(),
      is_correct: answer.isCorrect,
      user_answer: answer.userAnswer,
      correct_answer: null,
      time_taken_ms: answer.timeSpent || null,
    }));

    const { data, error } = await supabase
      .from('answer_history')
      .insert(inserts)
      .select();

    if (error) {
      console.error('Error creating answers:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Delete answer
   */
  async delete(id: string): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('answer_history')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting answer:', error);
      throw error;
    }
  }

  /**
   * Map database row to domain model
   */
  private mapFromDb(row: DbAnswerHistory): AnswerHistory {
    let userAnswer: string | string[] = '';

    if (row.user_answer !== null) {
      if (typeof row.user_answer === 'string') {
        userAnswer = row.user_answer;
      } else if (Array.isArray(row.user_answer)) {
        // Convert Json[] to string[]
        userAnswer = row.user_answer.map(item => String(item));
      }
    }

    return {
      id: row.id,
      taskId: row.task_id,
      sessionId: row.session_id ?? '',
      timestamp: new Date(row.timestamp),
      isCorrect: row.is_correct,
      userAnswer,
      timeSpent: row.time_taken_ms ?? 0,
      confidence: 0.5,
      metadata: {
        attemptNumber: 1,
        hintsUsed: 0,
        deviceType: 'desktop',
        browserInfo: '',
      },
    };
  }
}

/**
 * Spaced Repetition Repository - Manages SRS data
 */
export class SpacedRepetitionRepository implements ISpacedRepetitionRepository {
  /**
   * Get all SRS items for current user
   */
  async getAll(): Promise<SpacedRepetitionItem[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('spaced_repetition')
      .select('*')
      .eq('user_id', userId)
      .order('schedule->>nextReview');

    if (error) {
      console.error('Error fetching SRS items:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Get SRS item by task ID
   */
  async getByTaskId(taskId: string): Promise<SpacedRepetitionItem | null> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('spaced_repetition')
      .select('*')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching SRS item:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Get due items (for review)
   */
  async getDueItems(limit?: number): Promise<SpacedRepetitionItem[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    let query = supabase
      .from('spaced_repetition')
      .select('*')
      .eq('user_id', userId)
      .lte('schedule->>nextReview', new Date().toISOString())
      .order('schedule->>nextReview');

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching due SRS items:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Get due items by date (alias for getDueItems for compatibility)
   */
  async getDue(date: Date): Promise<SpacedRepetitionItem[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('spaced_repetition')
      .select('*')
      .eq('user_id', userId)
      .lte('schedule->>nextReview', date.toISOString())
      .order('schedule->>nextReview');

    if (error) {
      console.error('Error fetching due SRS items:', error);
      throw error;
    }

    return (data || []).map(row => this.mapFromDb(row));
  }

  /**
   * Create or update SRS item (upsert)
   */
  async upsert(item: Omit<SpacedRepetitionItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<SpacedRepetitionItem> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Serialize schedule dates to ISO strings for Json compatibility
    const scheduleData = {
      ...item.schedule,
      nextReview: item.schedule.nextReview.toISOString(),
      lastReviewed: item.schedule.lastReviewed?.toISOString(),
    };

    const { data, error } = await supabase
      .from('spaced_repetition')
      .upsert({
        user_id: userId,
        task_id: item.taskId,
        schedule: scheduleData as unknown as Json,
        algorithm: item.algorithm as unknown as Json,
        performance: item.performance as unknown as Json,
      }, {
        onConflict: 'user_id,task_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting SRS item:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Delete SRS item
   */
  async delete(taskId: string): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('spaced_repetition')
      .delete()
      .eq('user_id', userId)
      .eq('task_id', taskId);

    if (error) {
      console.error('Error deleting SRS item:', error);
      throw error;
    }
  }

  /**
   * Get by ID (required by IRepository)
   */
  async getById(id: string): Promise<SpacedRepetitionItem | null> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('spaced_repetition')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching SRS item by ID:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Create new SRS item
   */
  async create(item: Omit<SpacedRepetitionItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<SpacedRepetitionItem> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Serialize schedule dates to ISO strings for Json compatibility
    const scheduleData = {
      ...item.schedule,
      nextReview: item.schedule.nextReview.toISOString(),
      lastReviewed: item.schedule.lastReviewed?.toISOString(),
    };

    const { data, error } = await supabase
      .from('spaced_repetition')
      .insert({
        user_id: userId,
        task_id: item.taskId,
        schedule: scheduleData as unknown as Json,
        algorithm: item.algorithm as unknown as Json,
        performance: item.performance as unknown as Json,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating SRS item:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Update SRS item
   */
  async update(id: string, updates: Partial<SpacedRepetitionItem>): Promise<SpacedRepetitionItem> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const dbUpdates: Partial<{
      schedule: Json;
      algorithm: Json;
      performance: Json;
    }> = {};

    if (updates.schedule !== undefined) {
      // Serialize schedule dates to ISO strings for Json compatibility
      const scheduleData = {
        ...updates.schedule,
        nextReview: updates.schedule.nextReview.toISOString(),
        lastReviewed: updates.schedule.lastReviewed?.toISOString(),
      };
      dbUpdates.schedule = scheduleData as unknown as Json;
    }
    if (updates.algorithm !== undefined) {
      dbUpdates.algorithm = updates.algorithm as unknown as Json;
    }
    if (updates.performance !== undefined) {
      dbUpdates.performance = updates.performance as unknown as Json;
    }

    const { data, error } = await supabase
      .from('spaced_repetition')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating SRS item:', error);
      throw error;
    }

    return this.mapFromDb(data);
  }

  /**
   * Get items by next review date
   */
  async getByNextReviewDate(date: Date): Promise<SpacedRepetitionItem[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const dateString = date.toISOString().split('T')[0];
    if (!dateString) throw new Error('Invalid date format');

    const { data, error } = await supabase
      .from('spaced_repetition')
      .select('*')
      .eq('user_id', userId)
      .eq('schedule->>nextReview', dateString)
      .order('schedule->>nextReview');

    if (error) {
      console.error('Error fetching SRS items by next review date:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Update algorithm data
   */
  async updateAlgorithmData(id: string, algorithm: SpacedRepetitionItem['algorithm']): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('spaced_repetition')
      .update({ algorithm: algorithm as unknown as Json })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating algorithm data:', error);
      throw error;
    }
  }

  /**
   * Update schedule
   */
  async updateSchedule(id: string, schedule: SpacedRepetitionItem['schedule']): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Serialize schedule dates to ISO strings for Json compatibility
    const scheduleData = {
      ...schedule,
      nextReview: schedule.nextReview.toISOString(),
      lastReviewed: schedule.lastReviewed?.toISOString(),
    };

    const { error } = await supabase
      .from('spaced_repetition')
      .update({ schedule: scheduleData as unknown as Json })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  /**
   * Update performance
   */
  async updatePerformance(id: string, performance: SpacedRepetitionItem['performance']): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('spaced_repetition')
      .update({ performance: performance as unknown as Json })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating performance:', error);
      throw error;
    }
  }

  /**
   * Get review calendar
   */
  async getReviewCalendar(startDate: Date, endDate: Date): Promise<Array<{ date: Date; taskCount: number; estimatedTime: number }>> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('spaced_repetition')
      .select('*')
      .eq('user_id', userId)
      .gte('schedule->>nextReview', startDate.toISOString())
      .lte('schedule->>nextReview', endDate.toISOString())
      .order('schedule->>nextReview');

    if (error) {
      console.error('Error fetching review calendar:', error);
      throw error;
    }

    // Group by date
    const calendar = new Map<string, { date: Date; taskCount: number; estimatedTime: number }>();

    for (const row of data || []) {
      const item = this.mapFromDb(row);
      const dateKey = item.schedule.nextReview.toISOString().split('T')[0] ?? '';

      if (!calendar.has(dateKey)) {
        calendar.set(dateKey, {
          date: new Date(dateKey),
          taskCount: 0,
          estimatedTime: 0,
        });
      }

      const entry = calendar.get(dateKey);
      if (entry) {
        entry.taskCount++;
        entry.estimatedTime += 60000; // Assume 1 minute per task
      }
    }

    return Array.from(calendar.values());
  }

  /**
   * Create many SRS items
   */
  async createMany(items: Omit<SpacedRepetitionItem, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<SpacedRepetitionItem[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const inserts = items.map(item => {
      // Serialize schedule dates to ISO strings for Json compatibility
      const scheduleData = {
        ...item.schedule,
        nextReview: item.schedule.nextReview.toISOString(),
        lastReviewed: item.schedule.lastReviewed?.toISOString(),
      };

      return {
        user_id: userId,
        task_id: item.taskId,
        schedule: scheduleData as unknown as Json,
        algorithm: item.algorithm as unknown as Json,
        performance: item.performance as unknown as Json,
      };
    });

    const { data, error } = await supabase
      .from('spaced_repetition')
      .insert(inserts)
      .select();

    if (error) {
      console.error('Error creating SRS items:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Update many SRS items
   */
  async updateMany(updates: Array<{ id: string; data: Partial<SpacedRepetitionItem> }>): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Execute updates sequentially
    for (const { id, data } of updates) {
      await this.update(id, data);
    }
  }

  /**
   * Delete many SRS items
   */
  async deleteMany(ids: string[]): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('spaced_repetition')
      .delete()
      .in('id', ids)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting SRS items:', error);
      throw error;
    }
  }

  /**
   * Count SRS items
   */
  async count(): Promise<number> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { count, error } = await supabase
      .from('spaced_repetition')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error counting SRS items:', error);
      throw error;
    }

    return count || 0;
  }

  /**
   * Check if SRS item exists
   */
  async exists(id: string): Promise<boolean> {
    const item = await this.getById(id);
    return item !== null;
  }

  /**
   * Map database row to domain model
   */
  private mapFromDb(row: DbSpacedRepetition): SpacedRepetitionItem {
    return {
      id: row.id,
      taskId: row.task_id,
      schedule: row.schedule as unknown as SpacedRepetitionSchedule,
      algorithm: row.algorithm as unknown as SpacedRepetitionAlgorithm,
      performance: row.performance as unknown as SpacedRepetitionPerformance,
      metadata: {
        introduced: new Date(),
        graduated: false,
        lapseCount: 0,
      },
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
