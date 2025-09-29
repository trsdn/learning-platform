import { Task, MultipleChoiceContent, ValidationError } from '../types/entities';

/**
 * Task entity class with validation logic
 */
export class TaskEntity implements Task {
  id: string;
  learningPathId: string;
  templateId: string;
  type: 'multiple-choice';
  content: MultipleChoiceContent;
  metadata: {
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    estimatedTime: number;
    points: number;
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<Task, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
    TaskEntity.validate(data);

    this.id = data.id;
    this.learningPathId = data.learningPathId;
    this.templateId = data.templateId;
    this.type = data.type;
    this.content = { ...data.content, options: [...data.content.options] };
    this.metadata = { ...data.metadata, tags: [...data.metadata.tags] };
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validates task data
   */
  static validate(data: Partial<Task>): void {
    // Question validation (10-1000 characters)
    if (data.content?.question !== undefined) {
      if (data.content.question.length < 10 || data.content.question.length > 1000) {
        throw new ValidationError('Question must be between 10 and 1000 characters', {
          field: 'question',
          length: data.content.question.length,
        });
      }
    }

    // Options validation (2-6 items)
    if (data.content?.options !== undefined) {
      if (data.content.options.length < 2 || data.content.options.length > 6) {
        throw new ValidationError('Options must contain between 2 and 6 items', {
          field: 'options',
          count: data.content.options.length,
        });
      }

      // Each option must be 1-200 characters
      data.content.options.forEach((option, index) => {
        if (option.length < 1 || option.length > 200) {
          throw new ValidationError('Each option must be between 1 and 200 characters', {
            field: `options[${index}]`,
            length: option.length,
          });
        }
      });
    }

    // CorrectAnswer validation (must be valid index)
    if (data.content?.correctAnswer !== undefined && data.content?.options !== undefined) {
      if (
        data.content.correctAnswer < 0 ||
        data.content.correctAnswer >= data.content.options.length
      ) {
        throw new ValidationError('CorrectAnswer must be a valid index in options array', {
          field: 'correctAnswer',
          value: data.content.correctAnswer,
          maxIndex: data.content.options.length - 1,
        });
      }
    }

    // Tags validation (max 10 items, each 1-50 characters)
    if (data.metadata?.tags !== undefined) {
      if (data.metadata.tags.length > 10) {
        throw new ValidationError('Maximum 10 tags allowed', {
          field: 'tags',
          count: data.metadata.tags.length,
        });
      }

      data.metadata.tags.forEach((tag, index) => {
        if (tag.length < 1 || tag.length > 50) {
          throw new ValidationError('Each tag must be between 1 and 50 characters', {
            field: `tags[${index}]`,
            length: tag.length,
          });
        }
      });
    }

    // Difficulty validation
    if (data.metadata?.difficulty !== undefined) {
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(data.metadata.difficulty)) {
        throw new ValidationError('Invalid difficulty level', {
          field: 'difficulty',
          value: data.metadata.difficulty,
          validValues: validDifficulties,
        });
      }
    }
  }

  /**
   * Checks if the answer is correct
   */
  checkAnswer(answer: number): boolean {
    return answer === this.content.correctAnswer;
  }

  /**
   * Gets the correct answer
   */
  getCorrectAnswer(): string {
    return this.content.options[this.content.correctAnswer] ?? '';
  }

  /**
   * Updates the task
   */
  update(updates: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
    TaskEntity.validate(updates);

    if (updates.learningPathId !== undefined) this.learningPathId = updates.learningPathId;
    if (updates.templateId !== undefined) this.templateId = updates.templateId;
    if (updates.type !== undefined) this.type = updates.type;
    if (updates.content !== undefined) {
      this.content = {
        ...this.content,
        ...updates.content,
        options: updates.content.options
          ? [...updates.content.options]
          : this.content.options,
      };
    }
    if (updates.metadata !== undefined) {
      this.metadata = {
        ...this.metadata,
        ...updates.metadata,
        tags: updates.metadata.tags ? [...updates.metadata.tags] : this.metadata.tags,
      };
    }

    this.updatedAt = new Date();
  }

  /**
   * Adds a tag to the task
   */
  addTag(tag: string): void {
    if (tag.length < 1 || tag.length > 50) {
      throw new ValidationError('Tag must be between 1 and 50 characters', {
        field: 'tag',
        length: tag.length,
      });
    }

    if (this.metadata.tags.length >= 10) {
      throw new ValidationError('Maximum 10 tags allowed', {
        field: 'tags',
        count: this.metadata.tags.length,
      });
    }

    if (!this.metadata.tags.includes(tag)) {
      this.metadata.tags.push(tag);
      this.updatedAt = new Date();
    }
  }

  /**
   * Removes a tag from the task
   */
  removeTag(tag: string): void {
    const index = this.metadata.tags.indexOf(tag);
    if (index > -1) {
      this.metadata.tags.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  /**
   * Converts to plain object
   */
  toJSON(): Task {
    return {
      id: this.id,
      learningPathId: this.learningPathId,
      templateId: this.templateId,
      type: this.type,
      content: {
        ...this.content,
        options: [...this.content.options],
      },
      metadata: {
        ...this.metadata,
        tags: [...this.metadata.tags],
      },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Creates a Task entity from plain object
   */
  static fromJSON(data: Task): TaskEntity {
    return new TaskEntity(data);
  }
}