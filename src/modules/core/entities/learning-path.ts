import { LearningPath, ValidationError } from '../types/entities';

/**
 * LearningPath entity for managing structured learning sequences
 */
export class LearningPathEntity implements LearningPath {
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
    prerequisitePaths?: string[];
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(
    data: Omit<LearningPath, 'createdAt' | 'updatedAt'> & {
      createdAt?: Date;
      updatedAt?: Date;
    }
  ) {
    LearningPathEntity.validate(data);

    this.id = data.id;
    this.topicId = data.topicId;
    this.title = data.title;
    this.description = data.description;
    this.difficulty = data.difficulty;
    this.taskIds = [...data.taskIds];
    this.estimatedTime = data.estimatedTime;
    this.isActive = data.isActive;
    this.requirements = {
      minimumAccuracy: data.requirements.minimumAccuracy,
      requiredTasks: data.requirements.requiredTasks,
    };
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validates learning path data
   */
  static validate(data: Partial<LearningPath>): void {
    // Title validation (1-200 chars)
    if (data.title !== undefined) {
      if (data.title.length < 1 || data.title.length > 200) {
        throw new ValidationError('Title must be between 1 and 200 characters', {
          field: 'title',
          value: data.title,
        });
      }
    }

    // Description validation (1-1000 chars)
    if (data.description !== undefined) {
      if (data.description.length < 1 || data.description.length > 1000) {
        throw new ValidationError('Description must be between 1 and 1000 characters', {
          field: 'description',
          value: data.description,
        });
      }
    }

    // Difficulty validation
    if (data.difficulty !== undefined) {
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(data.difficulty)) {
        throw new ValidationError('Invalid difficulty level', {
          field: 'difficulty',
          value: data.difficulty,
          validValues: validDifficulties,
        });
      }
    }

    // Task IDs validation (at least 1 task)
    if (data.taskIds !== undefined) {
      if (data.taskIds.length < 1) {
        throw new ValidationError('Learning path must have at least one task', {
          field: 'taskIds',
          value: data.taskIds.length,
        });
      }
    }

    // Estimated time validation (1-300 minutes)
    if (data.estimatedTime !== undefined) {
      if (data.estimatedTime < 1 || data.estimatedTime > 300) {
        throw new ValidationError('Estimated time must be between 1 and 300 minutes', {
          field: 'estimatedTime',
          value: data.estimatedTime,
        });
      }
    }

    // Requirements validation
    if (data.requirements !== undefined) {
      // Minimum accuracy (0-100)
      if (
        data.requirements.minimumAccuracy !== undefined &&
        (data.requirements.minimumAccuracy < 0 || data.requirements.minimumAccuracy > 100)
      ) {
        throw new ValidationError('Minimum accuracy must be between 0 and 100', {
          field: 'minimumAccuracy',
          value: data.requirements.minimumAccuracy,
        });
      }

      // Required tasks (at least 1)
      if (data.requirements.requiredTasks !== undefined && data.requirements.requiredTasks < 1) {
        throw new ValidationError('Required tasks must be at least 1', {
          field: 'requiredTasks',
          value: data.requirements.requiredTasks,
        });
      }
    }
  }

  /**
   * Creates a new learning path
   */
  static create(
    id: string,
    topicId: string,
    title: string,
    description: string,
    difficulty: 'easy' | 'medium' | 'hard',
    estimatedTime: number,
    requirements: {
      minimumAccuracy: number;
      requiredTasks: number;
    }
  ): LearningPathEntity {
    return new LearningPathEntity({
      id,
      topicId,
      title,
      description,
      difficulty,
      taskIds: [],
      estimatedTime,
      isActive: true,
      requirements,
    });
  }

  /**
   * Updates the learning path
   */
  update(updates: Partial<Omit<LearningPath, 'id' | 'topicId' | 'createdAt'>>): void {
    LearningPathEntity.validate(updates);

    if (updates.title !== undefined) this.title = updates.title;
    if (updates.description !== undefined) this.description = updates.description;
    if (updates.difficulty !== undefined) this.difficulty = updates.difficulty;
    if (updates.taskIds !== undefined) this.taskIds = [...updates.taskIds];
    if (updates.estimatedTime !== undefined) this.estimatedTime = updates.estimatedTime;
    if (updates.isActive !== undefined) this.isActive = updates.isActive;
    if (updates.requirements !== undefined) {
      this.requirements = {
        minimumAccuracy: updates.requirements.minimumAccuracy,
        requiredTasks: updates.requirements.requiredTasks,
      };
    }

    this.updatedAt = new Date();
  }

  /**
   * Adds a task to the learning path
   */
  addTask(taskId: string): void {
    if (!this.taskIds.includes(taskId)) {
      this.taskIds.push(taskId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Removes a task from the learning path
   */
  removeTask(taskId: string): void {
    const index = this.taskIds.indexOf(taskId);
    if (index > -1) {
      this.taskIds.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  /**
   * Reorders tasks in the learning path
   */
  reorderTasks(newOrder: string[]): void {
    if (newOrder.length !== this.taskIds.length) {
      throw new ValidationError('New order must contain all existing tasks', {
        field: 'taskIds',
        value: newOrder.length,
      });
    }

    // Verify all task IDs are present
    const missingTasks = this.taskIds.filter((id) => !newOrder.includes(id));
    if (missingTasks.length > 0) {
      throw new ValidationError('New order is missing tasks', {
        field: 'taskIds',
        value: missingTasks,
      });
    }

    this.taskIds = [...newOrder];
    this.updatedAt = new Date();
  }

  /**
   * Activates the learning path
   */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Deactivates the learning path
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Converts to plain object
   */
  toJSON(): LearningPath {
    const result: LearningPath = {
      id: this.id,
      topicId: this.topicId,
      title: this.title,
      description: this.description,
      difficulty: this.difficulty,
      taskIds: [...this.taskIds],
      estimatedTime: this.estimatedTime,
      isActive: this.isActive,
      requirements: {
        minimumAccuracy: this.requirements.minimumAccuracy,
        requiredTasks: this.requirements.requiredTasks,
      },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    return result;
  }

  /**
   * Creates from plain object
   */
  static fromJSON(data: LearningPath): LearningPathEntity {
    return new LearningPathEntity(data);
  }
}