/**
 * Shared Test Fixtures for Learning Content
 *
 * Factory functions for creating mock Topic, LearningPath, and Task objects.
 * Use these instead of duplicating mock data across test files.
 *
 * @example
 * import { createMockTopic, createMockTask } from '@tests/fixtures';
 *
 * const topic = createMockTopic({ title: 'Custom Title' });
 * const task = createMockTask({ type: 'flashcard' });
 */

import type { Topic, LearningPath, Task } from '@core/types/services';

/**
 * Create a mock Topic with optional overrides
 */
export function createMockTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: 'topic-1',
    title: 'Spanish Basics',
    description: 'Learn basic Spanish vocabulary',
    learningPathIds: ['path-1', 'path-2'],
    isActive: true,
    metadata: {
      estimatedHours: 10,
      difficultyLevel: 'beginner',
      prerequisites: [],
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create a mock LearningPath with optional overrides
 */
export function createMockLearningPath(overrides: Partial<LearningPath> = {}): LearningPath {
  return {
    id: 'path-1',
    topicId: 'topic-1',
    title: 'Greetings and Introductions',
    description: 'Learn how to greet people in Spanish',
    difficulty: 'easy',
    taskIds: ['task-1', 'task-2'],
    estimatedTime: 30,
    isActive: true,
    requirements: {
      minimumAccuracy: 0.8,
      requiredTasks: 5,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create a mock Task with optional overrides
 * Defaults to multiple-choice type
 */
export function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    learningPathId: 'path-1',
    templateId: 'template-1',
    type: 'multiple-choice',
    content: {
      question: '¿Cómo estás?',
      options: ['Good', 'Bad', 'So-so', 'Great'],
      correctAnswer: 0,
      explanation: 'How are you?',
    },
    metadata: {
      difficulty: 'easy',
      tags: ['greetings', 'common-phrases'],
      estimatedTime: 60,
      points: 10,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create a mock flashcard Task
 */
export function createMockFlashcardTask(overrides: Partial<Task> = {}): Task {
  return createMockTask({
    id: 'flashcard-1',
    type: 'flashcard',
    content: {
      front: 'Hola',
      back: 'Hello',
      frontLanguage: 'es' as const,
      backLanguage: 'en' as const,
    },
    metadata: {
      difficulty: 'easy',
      tags: ['greetings', 'vocabulary'],
      estimatedTime: 30,
      points: 5,
    },
    ...overrides,
  });
}

/**
 * Create a mock true-false Task
 */
export function createMockTrueFalseTask(overrides: Partial<Task> = {}): Task {
  return createMockTask({
    id: 'truefalse-1',
    type: 'true-false',
    content: {
      statement: '"Hola" means "Goodbye" in Spanish',
      correctAnswer: false,
      explanation: '"Hola" means "Hello" in Spanish',
    },
    ...overrides,
  });
}

/**
 * Create multiple mock Topics
 */
export function createMockTopics(count: number = 3): Topic[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTopic({
      id: `topic-${i + 1}`,
      title: `Topic ${i + 1}`,
      description: `Description for topic ${i + 1}`,
      learningPathIds: [`path-${i + 1}-1`, `path-${i + 1}-2`],
    })
  );
}

/**
 * Create multiple mock LearningPaths
 */
export function createMockLearningPaths(count: number = 3, topicId: string = 'topic-1'): LearningPath[] {
  return Array.from({ length: count }, (_, i) =>
    createMockLearningPath({
      id: `path-${i + 1}`,
      topicId,
      title: `Learning Path ${i + 1}`,
      description: `Description for path ${i + 1}`,
      taskIds: [`task-${i + 1}-1`, `task-${i + 1}-2`],
    })
  );
}

/**
 * Create multiple mock Tasks
 */
export function createMockTasks(count: number = 3, learningPathId: string = 'path-1'): Task[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTask({
      id: `task-${i + 1}`,
      learningPathId,
      content: {
        question: `Question ${i + 1}?`,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: i % 4,
      },
    })
  );
}

/**
 * Pre-built fixture sets for common scenarios
 */
export const contentFixtures = {
  // Single items
  topic: createMockTopic(),
  learningPath: createMockLearningPath(),
  task: createMockTask(),
  flashcardTask: createMockFlashcardTask(),
  trueFalseTask: createMockTrueFalseTask(),

  // German content variations
  germanTopic: createMockTopic({
    id: 'topic-german',
    title: 'German Basics',
    description: 'Learn basic German vocabulary',
    learningPathIds: ['path-german-1'],
    metadata: {
      estimatedHours: 12,
      difficultyLevel: 'beginner',
      prerequisites: [],
    },
  }),

  // Inactive content for testing filters
  inactiveTopic: createMockTopic({
    id: 'topic-inactive',
    title: 'Inactive Topic',
    isActive: false,
  }),

  inactiveLearningPath: createMockLearningPath({
    id: 'path-inactive',
    title: 'Inactive Path',
    isActive: false,
  }),

  // Edge cases
  emptyTopic: createMockTopic({
    id: 'topic-empty',
    title: '',
    description: '',
    learningPathIds: [],
  }),

  longTitleTopic: createMockTopic({
    id: 'topic-long',
    title: 'A'.repeat(200),
    description: 'B'.repeat(1000),
  }),
};
