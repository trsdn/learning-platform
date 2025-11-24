/**
 * Supabase Repository Adapters
 *
 * Implementation of all repository interfaces using Supabase client.
 * Provides CRUD operations and specialized queries for each domain entity.
 */

import { supabase, getCurrentUserId } from '@/modules/storage/supabase-client';
import type { Database } from '@/modules/storage/database.types';
import type {
  Topic,
  LearningPath,
  Task,
  UserProgress,
  PracticeSession,
  AnswerHistory,
  SpacedRepetitionItem,
} from '@/modules/core/types/services';

// Type aliases for Supabase table types
type DbTopic = Database['public']['Tables']['topics']['Row'];
type DbLearningPath = Database['public']['Tables']['learning_paths']['Row'];
type DbTask = Database['public']['Tables']['tasks']['Row'];
type DbUserProgress = Database['public']['Tables']['user_progress']['Row'];
type DbPracticeSession = Database['public']['Tables']['practice_sessions']['Row'];
type DbAnswerHistory = Database['public']['Tables']['answer_history']['Row'];
type DbSpacedRepetition = Database['public']['Tables']['spaced_repetition']['Row'];

/**
 * Topic Repository - Manages learning topics
 */
export class TopicRepository {
  /**
   * Get all active topics
   */
  async getAll(): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('is_active', true)
      .order('title');

    if (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
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
        metadata: topic.metadata as any,
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
    const dbUpdates: any = {};

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
      metadata: row.metadata as any,
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

    return (data || []).map(this.mapFromDb);
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

    return (data || []).map(this.mapFromDb);
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
        requirements: learningPath.requirements as any,
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
    const dbUpdates: any = {};

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
      requirements: row.requirements as any,
      isActive: row.is_active ?? true,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

/**
 * Task Repository - Manages learning tasks
 */
export class TaskRepository {
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

    return (data || []).map(this.mapFromDb);
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

    return (data || []).map(this.mapFromDb);
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

    return (data || []).map(this.mapFromDb);
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
        content: task.content as any,
        metadata: task.metadata as any,
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
      content: task.content as any,
      metadata: task.metadata as any,
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

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Update task
   */
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const dbUpdates: any = {};

    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;
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
    }
  ): Promise<Task[]> {
    console.log(`[TaskRepository] getRandomTasks called: count=${count}, filters=`, filters);

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

    const tasks = (data || []).map(this.mapFromDb);
    console.log(`[TaskRepository] Found ${tasks.length} tasks`);

    // Shuffle tasks
    const shuffled = tasks.sort(() => Math.random() - 0.5);

    // Return up to count tasks (with repetition if needed)
    const result: Task[] = [];
    if (shuffled.length === 0) {
      console.log(`[TaskRepository] No tasks available!`);
      return result;
    }

    for (let i = 0; i < count; i++) {
      const task = shuffled[i % shuffled.length];
      if (task) {
        result.push(task);
      }
    }

    console.log(`[TaskRepository] Returning ${result.length} random tasks`);
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
   * Map database row to domain model
   */
  private mapFromDb(row: DbTask): Task {
    const result: Task = {
      id: row.id,
      learningPathId: row.learning_path_id,
      templateId: row.template_id ?? '',
      type: row.type as any,
      content: row.content as any,
      metadata: row.metadata as any,
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

    return (data || []).map(this.mapFromDb);
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

    return (data || []).map(this.mapFromDb);
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
        statistics: progress.statistics as any,
        milestones: progress.milestones as any,
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
      statistics: row.statistics as any,
      milestones: row.milestones as any,
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
export class PracticeSessionRepository {
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

    return (data || []).map(this.mapFromDb);
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

    return (data || []).map(this.mapFromDb);
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

    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: userId,
        learning_path_id: session.configuration.learningPathIds[0] ?? '',
        task_ids: session.execution.taskIds,
        execution: session.execution as any,
        progress: null,
        configuration: session.configuration as any,
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

    const dbUpdates: any = {};

    if (updates.execution !== undefined) {
      dbUpdates.execution = updates.execution;
      dbUpdates.task_ids = updates.execution.taskIds;
    }
    if (updates.configuration !== undefined) {
      dbUpdates.configuration = updates.configuration;
      if (updates.configuration.learningPathIds && updates.configuration.learningPathIds.length > 0) {
        dbUpdates.learning_path_id = updates.configuration.learningPathIds[0];
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
   * Map database row to domain model
   */
  private mapFromDb(row: DbPracticeSession): PracticeSession {
    const execution = (row.execution as any) || {
      taskIds: row.task_ids,
      completedCount: 0,
      correctCount: 0,
      status: 'planned',
      totalTimeSpent: 0,
    };
    const configuration = (row.configuration as any) || {
      topicId: '',
      learningPathIds: [row.learning_path_id],
      targetCount: row.task_ids.length,
      includeReview: false,
    };
    const results = {
      accuracy: 0,
      averageTime: 0,
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

    return (data || []).map(this.mapFromDb);
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

    return (data || []).map(this.mapFromDb);
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

    return (data || []).map(this.mapFromDb);
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
        user_answer: answer.userAnswer as any,
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
      user_answer: answer.userAnswer as any,
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

    return (data || []).map(this.mapFromDb);
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
export class SpacedRepetitionRepository {
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

    return (data || []).map(this.mapFromDb);
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

    return (data || []).map(this.mapFromDb);
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

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Create or update SRS item (upsert)
   */
  async upsert(item: Omit<SpacedRepetitionItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<SpacedRepetitionItem> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('spaced_repetition')
      .upsert({
        user_id: userId,
        task_id: item.taskId,
        schedule: item.schedule as any,
        algorithm: item.algorithm as any,
        performance: item.performance as any,
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
   * Map database row to domain model
   */
  private mapFromDb(row: DbSpacedRepetition): SpacedRepetitionItem {
    return {
      id: row.id,
      taskId: row.task_id,
      schedule: row.schedule as any,
      algorithm: row.algorithm as any,
      performance: row.performance as any,
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
