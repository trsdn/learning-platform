import { Topic, ValidationError } from '../types/entities';

/**
 * Topic entity class with validation logic
 */
export class TopicEntity implements Topic {
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

  constructor(data: Omit<Topic, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    // Validate before assignment
    TopicEntity.validate(data);

    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.learningPathIds = [...data.learningPathIds];
    this.isActive = data.isActive;
    this.metadata = { ...data.metadata, prerequisites: [...data.metadata.prerequisites] };
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validates topic data
   */
  static validate(data: Partial<Topic>): void {
    // Title validation (1-100 characters)
    if (data.title !== undefined) {
      if (data.title.length < 1 || data.title.length > 100) {
        throw new ValidationError('Title must be between 1 and 100 characters', {
          field: 'title',
          value: data.title,
        });
      }
    }

    // Description validation (1-500 characters)
    if (data.description !== undefined) {
      if (data.description.length < 1 || data.description.length > 500) {
        throw new ValidationError('Description must be between 1 and 500 characters', {
          field: 'description',
          value: data.description,
        });
      }
    }

    // EstimatedHours validation (positive, <= 1000)
    if (data.metadata?.estimatedHours !== undefined) {
      if (data.metadata.estimatedHours <= 0 || data.metadata.estimatedHours > 1000) {
        throw new ValidationError('Estimated hours must be between 1 and 1000', {
          field: 'estimatedHours',
          value: data.metadata.estimatedHours,
        });
      }
    }

    // DifficultyLevel validation
    if (data.metadata?.difficultyLevel !== undefined) {
      const validLevels = ['beginner', 'intermediate', 'advanced'];
      if (!validLevels.includes(data.metadata.difficultyLevel)) {
        throw new ValidationError('Invalid difficulty level', {
          field: 'difficultyLevel',
          value: data.metadata.difficultyLevel,
          validValues: validLevels,
        });
      }
    }
  }

  /**
   * Updates the topic and validates changes
   */
  update(updates: Partial<Omit<Topic, 'id' | 'createdAt'>>): void {
    TopicEntity.validate(updates);

    if (updates.title !== undefined) this.title = updates.title;
    if (updates.description !== undefined) this.description = updates.description;
    if (updates.learningPathIds !== undefined) this.learningPathIds = [...updates.learningPathIds];
    if (updates.isActive !== undefined) this.isActive = updates.isActive;
    if (updates.metadata !== undefined) {
      this.metadata = {
        ...this.metadata,
        ...updates.metadata,
        prerequisites: updates.metadata.prerequisites
          ? [...updates.metadata.prerequisites]
          : this.metadata.prerequisites,
      };
    }

    this.updatedAt = new Date();
  }

  /**
   * Adds a learning path to the topic
   */
  addLearningPath(learningPathId: string): void {
    if (!this.learningPathIds.includes(learningPathId)) {
      this.learningPathIds.push(learningPathId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Removes a learning path from the topic
   */
  removeLearningPath(learningPathId: string): void {
    const index = this.learningPathIds.indexOf(learningPathId);
    if (index > -1) {
      this.learningPathIds.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  /**
   * Converts to plain object
   */
  toJSON(): Topic {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      learningPathIds: [...this.learningPathIds],
      isActive: this.isActive,
      metadata: {
        ...this.metadata,
        prerequisites: [...this.metadata.prerequisites],
      },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Creates a Topic entity from plain object
   */
  static fromJSON(data: Topic): TopicEntity {
    return new TopicEntity(data);
  }
}