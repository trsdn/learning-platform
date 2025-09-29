import type {
  ISpacedRepetitionService,
  Task,
  SpacedRepetitionItem,
  ReviewSchedule,
} from '../types/services';
import type { ISpacedRepetitionRepository, ITaskRepository } from '@storage/types/adapters';
import { SpacedRepetitionItemEntity } from '../entities/spaced-repetition-item';
import { NotFoundError } from '../types/entities';

/**
 * Spaced Repetition Service implementing SM-2 algorithm
 */
export class SpacedRepetitionService implements ISpacedRepetitionService {
  constructor(
    private spacedRepRepository: ISpacedRepetitionRepository,
    private taskRepository: ITaskRepository
  ) {}

  /**
   * Gets the next tasks for review based on spaced repetition
   */
  async getNextTasks(_userId: string, count: number): Promise<Task[]> {
    // Get all items due for review
    const dueItems = await this.spacedRepRepository.getDue(new Date());

    // Sort by priority (more lapses = higher priority)
    const sortedItems = dueItems.sort((a, b) => {
      // Prioritize items with more lapses
      if (b.metadata.lapseCount !== a.metadata.lapseCount) {
        return b.metadata.lapseCount - a.metadata.lapseCount;
      }
      // Then by how overdue they are
      return a.schedule.nextReview.getTime() - b.schedule.nextReview.getTime();
    });

    // Get the requested number of items
    const selectedItems = sortedItems.slice(0, count);

    // Fetch the corresponding tasks
    const tasks: Task[] = [];
    for (const item of selectedItems) {
      const task = await this.taskRepository.getById(item.taskId);
      if (task) {
        tasks.push(task);
      }
    }

    return tasks;
  }

  /**
   * Records an answer and updates the spaced repetition data
   */
  async recordAnswer(taskId: string, _isCorrect: boolean, grade: number): Promise<void> {
    // Validate grade
    if (grade < 0 || grade > 5) {
      throw new Error('Grade must be between 0 and 5');
    }

    // Get or create spaced repetition item
    let srItem = await this.spacedRepRepository.getByTaskId(taskId);

    if (!srItem) {
      // Create new item for first review
      const newItem = SpacedRepetitionItemEntity.createNew(
        taskId,
        `sr-${taskId}-${Date.now()}`
      );
      srItem = await this.spacedRepRepository.create(newItem.toJSON());
    }

    // Convert to entity and record answer
    const srEntity = SpacedRepetitionItemEntity.fromJSON(srItem);
    srEntity.recordAnswer(grade, 0); // timeSpent handled separately in answer history

    // Update in repository
    await this.spacedRepRepository.update(srItem.id, srEntity.toJSON());
  }

  /**
   * Gets the spaced repetition data for a task
   */
  async getRepetitionData(taskId: string): Promise<SpacedRepetitionItem | null> {
    return await this.spacedRepRepository.getByTaskId(taskId);
  }

  /**
   * Gets all tasks due for review
   */
  async getTasksDue(_userId: string): Promise<Task[]> {
    const dueItems = await this.spacedRepRepository.getDue(new Date());

    const tasks: Task[] = [];
    for (const item of dueItems) {
      const task = await this.taskRepository.getById(item.taskId);
      if (task) {
        tasks.push(task);
      }
    }

    return tasks;
  }

  /**
   * Gets the review schedule for the next N days
   */
  async getReviewSchedule(_userId: string, days: number): Promise<ReviewSchedule[]> {
    const schedule: ReviewSchedule[] = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      date.setHours(23, 59, 59, 999); // End of day

      const items = await this.spacedRepRepository.getByNextReviewDate(date);

      let estimatedTime = 0;
      for (const item of items) {
        // Use average time or default to 30 seconds per task
        estimatedTime += item.performance.averageTime || 30000;
      }

      schedule.push({
        date,
        taskCount: items.length,
        estimatedTime: Math.round(estimatedTime / 1000), // Convert to seconds
      });
    }

    return schedule;
  }

  /**
   * Manually reschedules a task to a new date
   */
  async rescheduleTask(taskId: string, newDate: Date): Promise<void> {
    const srItem = await this.spacedRepRepository.getByTaskId(taskId);

    if (!srItem) {
      throw new NotFoundError('SpacedRepetitionItem', taskId);
    }

    // Update the next review date
    await this.spacedRepRepository.updateSchedule(srItem.id, {
      ...srItem.schedule,
      nextReview: newDate,
    });
  }

  /**
   * Gets statistics about the spaced repetition system
   */
  async getStatistics(_userId: string): Promise<{
    totalItems: number;
    dueToday: number;
    graduated: number;
    averageInterval: number;
    averageAccuracy: number;
  }> {
    // This would need a custom query or iteration
    // For now, return placeholder
    const allItems = await this.spacedRepRepository.getAll();
    const dueItems = await this.spacedRepRepository.getDue(new Date());

    const graduated = allItems.filter((item) => item.metadata.graduated).length;
    const totalInterval = allItems.reduce((sum, item) => sum + item.algorithm.interval, 0);
    const totalAccuracy = allItems.reduce((sum, item) => sum + item.performance.averageAccuracy, 0);

    return {
      totalItems: allItems.length,
      dueToday: dueItems.length,
      graduated,
      averageInterval: allItems.length > 0 ? totalInterval / allItems.length : 0,
      averageAccuracy: allItems.length > 0 ? totalAccuracy / allItems.length : 0,
    };
  }
}