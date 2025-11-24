/**
 * Test factories for creating mock Task objects for all task types
 */

import type {
  Task,
  ClozeDeletionContent,
  TrueFalseContent,
  OrderingContent,
  MatchingContent,
  MultipleSelectContent,
  SliderContent,
  WordScrambleContent,
  FlashcardContent,
  TextInputContent,
} from '@core/types/services';

/**
 * Base task factory with common properties
 */
function createBaseTask(overrides?: Partial<Task>): Omit<Task, 'type' | 'content'> {
  return {
    id: 'task-1',
    templateId: 'template-1',
    topicId: 'topic-1',
    learningPathId: 'path-1',
    difficultyLevel: 1,
    audioUrl: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Multiple Choice Task Factory
 */
export function createMultipleChoiceTask(overrides?: Partial<Task>): Task {
  return {
    ...createBaseTask(overrides),
    type: 'multiple-choice',
    content: {
      question: 'Was ist die Hauptstadt von Deutschland?',
      options: ['Berlin', 'München', 'Hamburg', 'Köln'],
      correctAnswer: 'Berlin',
      explanation: 'Berlin ist die Hauptstadt von Deutschland.',
    },
    ...overrides,
  } as Task;
}

/**
 * Cloze Deletion Task Factory
 */
export function createClozeDeletionTask(overrides?: Partial<Task>): Task {
  const content: ClozeDeletionContent = {
    text: 'Die Hauptstadt von Deutschland ist {{Berlin}}. Es ist eine {{große}} Stadt.',
    blanks: [
      { correctAnswer: 'Berlin', alternatives: ['berlin'] },
      { correctAnswer: 'große', alternatives: ['grosse', 'große'] },
    ],
  };

  return {
    ...createBaseTask(overrides),
    type: 'cloze-deletion',
    content,
    ...overrides,
  } as Task;
}

/**
 * True/False Task Factory
 */
export function createTrueFalseTask(overrides?: Partial<Task>): Task {
  const content: TrueFalseContent = {
    statement: 'Berlin ist die Hauptstadt von Deutschland.',
    correctAnswer: true,
    explanation: 'Richtig! Berlin ist die Hauptstadt von Deutschland.',
  };

  return {
    ...createBaseTask(overrides),
    type: 'true-false',
    content,
    ...overrides,
  } as Task;
}

/**
 * Ordering Task Factory
 */
export function createOrderingTask(overrides?: Partial<Task>): Task {
  const content: OrderingContent = {
    instruction: 'Ordne die Zahlen von klein nach groß.',
    items: ['eins', 'zwei', 'drei', 'vier'],
    correctOrder: [0, 1, 2, 3],
  };

  return {
    ...createBaseTask(overrides),
    type: 'ordering',
    content,
    ...overrides,
  } as Task;
}

/**
 * Matching Task Factory
 */
export function createMatchingTask(overrides?: Partial<Task>): Task {
  const content: MatchingContent = {
    instruction: 'Verbinde die deutschen Zahlen mit den englischen.',
    pairs: [
      { left: 'eins', right: 'one' },
      { left: 'zwei', right: 'two' },
      { left: 'drei', right: 'three' },
    ],
  };

  return {
    ...createBaseTask(overrides),
    type: 'matching',
    content,
    ...overrides,
  } as Task;
}

/**
 * Multiple Select Task Factory
 */
export function createMultipleSelectTask(overrides?: Partial<Task>): Task {
  const content: MultipleSelectContent = {
    question: 'Welche sind deutsche Städte?',
    options: ['Berlin', 'London', 'München', 'Paris', 'Hamburg'],
    correctAnswers: [0, 2, 4], // Berlin, München, Hamburg
    explanation: 'Berlin, München und Hamburg sind deutsche Städte.',
  };

  return {
    ...createBaseTask(overrides),
    type: 'multiple-select',
    content,
    ...overrides,
  } as Task;
}

/**
 * Slider Task Factory
 */
export function createSliderTask(overrides?: Partial<Task>): Task {
  const content: SliderContent = {
    question: 'Wie viele Bundesländer hat Deutschland?',
    min: 0,
    max: 20,
    correctValue: 16,
    tolerance: 0,
    unit: 'Bundesländer',
  };

  return {
    ...createBaseTask(overrides),
    type: 'slider',
    content,
    ...overrides,
  } as Task;
}

/**
 * Word Scramble Task Factory
 */
export function createWordScrambleTask(overrides?: Partial<Task>): Task {
  const content: WordScrambleContent = {
    scrambledWord: 'LREBNI',
    correctWord: 'BERLIN',
    hint: 'Die Hauptstadt von Deutschland',
  };

  return {
    ...createBaseTask(overrides),
    type: 'word-scramble',
    content,
    ...overrides,
  } as Task;
}

/**
 * Flashcard Task Factory
 */
export function createFlashcardTask(overrides?: Partial<Task>): Task {
  const content: FlashcardContent = {
    front: 'Was ist die Hauptstadt von Deutschland?',
    back: 'Berlin',
  };

  return {
    ...createBaseTask(overrides),
    type: 'flashcard',
    content,
    ...overrides,
  } as Task;
}

/**
 * Text Input Task Factory
 */
export function createTextInputTask(overrides?: Partial<Task>): Task {
  const content: TextInputContent = {
    question: 'Was ist die Hauptstadt von Deutschland?',
    correctAnswer: 'Berlin',
    alternatives: ['berlin'],
    caseSensitive: false,
    hint: 'Es ist eine Stadt im Nordosten',
  };

  return {
    ...createBaseTask(overrides),
    type: 'text-input',
    content,
    ...overrides,
  } as Task;
}

/**
 * Helper to create a task by type name
 */
export function createTaskByType(
  type: Task['type'],
  overrides?: Partial<Task>
): Task {
  switch (type) {
    case 'multiple-choice':
      return createMultipleChoiceTask(overrides);
    case 'cloze-deletion':
      return createClozeDeletionTask(overrides);
    case 'true-false':
      return createTrueFalseTask(overrides);
    case 'ordering':
      return createOrderingTask(overrides);
    case 'matching':
      return createMatchingTask(overrides);
    case 'multiple-select':
      return createMultipleSelectTask(overrides);
    case 'slider':
      return createSliderTask(overrides);
    case 'word-scramble':
      return createWordScrambleTask(overrides);
    case 'flashcard':
      return createFlashcardTask(overrides);
    case 'text-input':
      return createTextInputTask(overrides);
    default:
      throw new Error(`Unknown task type: ${type}`);
  }
}

/**
 * Create multiple tasks of mixed types
 */
export function createMixedTasks(count: number): Task[] {
  const types: Task['type'][] = [
    'multiple-choice',
    'true-false',
    'text-input',
    'cloze-deletion',
    'slider',
  ];

  return Array.from({ length: count }, (_, i) => {
    const type = types[i % types.length]!;
    return createTaskByType(type, {
      id: `task-${i + 1}`,
    });
  });
}
