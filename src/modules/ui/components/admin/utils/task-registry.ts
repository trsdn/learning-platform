/**
 * Task Type Registry for Admin Showcase
 *
 * Provides metadata and sample data for all task types in the system
 */

export type TaskType =
  | 'flashcard'
  | 'multiple-choice'
  | 'multiple-select'
  | 'true-false'
  | 'cloze-deletion'
  | 'matching'
  | 'ordering'
  | 'slider'
  | 'word-scramble';

export interface TaskTypeMeta {
  id: TaskType;
  name: string;
  description: string;
  icon: string;
  templateFile: string;
  difficulty: string[];
  exampleCount: number;
  examples: TaskExample[];
}

export interface TaskExample {
  title: string;
  description: string;
  data: Record<string, unknown>;
}

/**
 * Complete registry of all task types with examples
 */
export const taskTypeRegistry: Record<TaskType, TaskTypeMeta> = {
  flashcard: {
    id: 'flashcard',
    name: 'Flashcard',
    description: 'Two-sided card with question on front, answer on back',
    icon: '🎴',
    templateFile: 'flashcard-basic.json',
    difficulty: ['easy', 'medium'],
    exampleCount: 2,
    examples: [
      {
        title: 'German Vocabulary',
        description: 'Basic word translation flashcard',
        data: {
          front: 'Was bedeutet "Haus" auf Englisch?',
          back: 'House',
          hint: 'Es ist ein Gebäude',
        },
      },
      {
        title: 'Math Formula',
        description: 'Mathematical concept flashcard',
        data: {
          front: 'Was ist die Formel für die Fläche eines Kreises?',
          back: 'A = πr²',
          hint: 'Enthält Pi und den Radius',
        },
      },
    ],
  },

  'multiple-choice': {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    description: 'Question with 2-6 options, exactly one correct answer',
    icon: '📝',
    templateFile: 'multiple-choice-basic.json',
    difficulty: ['easy', 'medium', 'hard'],
    exampleCount: 3,
    examples: [
      {
        title: 'Simple Math',
        description: 'Basic arithmetic question',
        data: {
          question: 'Was ist 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
          explanation: '2 + 2 = 4',
          hint: 'Zähle auf deinen Fingern',
        },
      },
      {
        title: 'Biology',
        description: 'Scientific knowledge question',
        data: {
          question: 'Was ist das größte Organ des menschlichen Körpers?',
          options: ['Herz', 'Leber', 'Haut', 'Gehirn'],
          correctAnswer: 2,
          explanation: 'Die Haut ist das größte Organ und bedeckt den gesamten Körper.',
        },
      },
      {
        title: 'History',
        description: 'Historical fact question',
        data: {
          question: 'In welchem Jahr fiel die Berliner Mauer?',
          options: ['1987', '1988', '1989', '1990'],
          correctAnswer: 2,
          explanation: 'Die Berliner Mauer fiel am 9. November 1989.',
        },
      },
    ],
  },

  'multiple-select': {
    id: 'multiple-select',
    name: 'Multiple Select',
    description: 'Question with multiple correct answers to select',
    icon: '☑️',
    templateFile: 'multiple-select-basic.json',
    difficulty: ['medium', 'hard'],
    exampleCount: 2,
    examples: [
      {
        title: 'Primary Colors',
        description: 'Select all primary colors',
        data: {
          question: 'Welche der folgenden Farben sind Primärfarben?',
          options: ['Rot', 'Grün', 'Blau', 'Gelb', 'Orange'],
          correctAnswers: [0, 2, 3],
          explanation: 'Die Primärfarben sind Rot, Blau und Gelb.',
        },
      },
      {
        title: 'Even Numbers',
        description: 'Identify even numbers',
        data: {
          question: 'Welche Zahlen sind gerade?',
          options: ['2', '3', '4', '5', '6', '7', '8'],
          correctAnswers: [0, 2, 4, 6],
          explanation: 'Gerade Zahlen sind durch 2 teilbar ohne Rest.',
        },
      },
    ],
  },

  'true-false': {
    id: 'true-false',
    name: 'True/False',
    description: 'Statement that must be judged as true or false',
    icon: '✓✗',
    templateFile: 'true-false-basic.json',
    difficulty: ['easy', 'medium'],
    exampleCount: 2,
    examples: [
      {
        title: 'Science Fact',
        description: 'Verify scientific statement',
        data: {
          statement: 'Wasser kocht bei 100°C auf Meereshöhe.',
          correctAnswer: true,
          explanation: 'Bei normalem Luftdruck (auf Meereshöhe) kocht Wasser bei 100°C.',
        },
      },
      {
        title: 'Geography',
        description: 'Geographic fact verification',
        data: {
          statement: 'Paris ist die Hauptstadt von Italien.',
          correctAnswer: false,
          explanation: 'Paris ist die Hauptstadt von Frankreich. Rom ist die Hauptstadt von Italien.',
        },
      },
    ],
  },

  'cloze-deletion': {
    id: 'cloze-deletion',
    name: 'Cloze Deletion',
    description: 'Fill in the blank(s) in a sentence',
    icon: '📄',
    templateFile: 'cloze-deletion-basic.json',
    difficulty: ['easy', 'medium', 'hard'],
    exampleCount: 2,
    examples: [
      {
        title: 'Grammar Practice',
        description: 'Fill in missing verb',
        data: {
          text: 'Ich ___ gerne Musik.',
          blanks: [
            {
              position: 0,
              acceptedAnswers: ['höre', 'hoere'],
              caseSensitive: false,
            },
          ],
          hint: 'Verb in der ersten Person Singular',
        },
      },
      {
        title: 'Science',
        description: 'Complete scientific fact',
        data: {
          text: 'Die ___ dreht sich um die ___.',
          blanks: [
            { position: 0, acceptedAnswers: ['Erde'], caseSensitive: false },
            { position: 1, acceptedAnswers: ['Sonne'], caseSensitive: false },
          ],
        },
      },
    ],
  },

  matching: {
    id: 'matching',
    name: 'Matching',
    description: 'Match items from left column to right column',
    icon: '🔗',
    templateFile: 'matching-basic.json',
    difficulty: ['medium', 'hard'],
    exampleCount: 2,
    examples: [
      {
        title: 'Capitals',
        description: 'Match countries to their capitals',
        data: {
          question: 'Ordne die Länder ihren Hauptstädten zu:',
          pairs: [
            { left: 'Deutschland', right: 'Berlin' },
            { left: 'Frankreich', right: 'Paris' },
            { left: 'Spanien', right: 'Madrid' },
            { left: 'Italien', right: 'Rom' },
          ],
        },
      },
      {
        title: 'Animals',
        description: 'Match animals to their sounds',
        data: {
          question: 'Welches Tier macht welches Geräusch?',
          pairs: [
            { left: 'Hund', right: 'Bellt' },
            { left: 'Katze', right: 'Miaut' },
            { left: 'Vogel', right: 'Zwitschert' },
          ],
        },
      },
    ],
  },

  ordering: {
    id: 'ordering',
    name: 'Ordering',
    description: 'Arrange items in correct order',
    icon: '🔢',
    templateFile: 'ordering-basic.json',
    difficulty: ['medium', 'hard'],
    exampleCount: 2,
    examples: [
      {
        title: 'Months',
        description: 'Order months chronologically',
        data: {
          question: 'Ordne die Monate in der richtigen Reihenfolge:',
          items: ['März', 'Januar', 'Februar', 'April'],
          correctOrder: [1, 2, 0, 3],
        },
      },
      {
        title: 'Historical Events',
        description: 'Order events by date',
        data: {
          question: 'Ordne die Ereignisse chronologisch:',
          items: [
            '2. Weltkrieg endet',
            'Berliner Mauer fällt',
            '1. Weltkrieg beginnt',
            'Deutsche Wiedervereinigung',
          ],
          correctOrder: [2, 0, 1, 3],
        },
      },
    ],
  },

  slider: {
    id: 'slider',
    name: 'Slider',
    description: 'Select a value on a continuous scale',
    icon: '🎚️',
    templateFile: 'slider-basic.json',
    difficulty: ['easy', 'medium'],
    exampleCount: 2,
    examples: [
      {
        title: 'Temperature',
        description: 'Estimate temperature value',
        data: {
          question: 'Bei welcher Temperatur kocht Wasser?',
          min: 0,
          max: 200,
          correctValue: 100,
          unit: '°C',
          tolerance: 5,
        },
      },
      {
        title: 'Percentage',
        description: 'Estimate percentage value',
        data: {
          question: 'Wie viel Prozent der Erdoberfläche sind mit Wasser bedeckt?',
          min: 0,
          max: 100,
          correctValue: 71,
          unit: '%',
          tolerance: 5,
        },
      },
    ],
  },

  'word-scramble': {
    id: 'word-scramble',
    name: 'Word Scramble',
    description: 'Unscramble letters to form the correct word',
    icon: '🔤',
    templateFile: 'word-scramble-basic.json',
    difficulty: ['easy', 'medium'],
    exampleCount: 2,
    examples: [
      {
        title: 'German Word',
        description: 'Unscramble to form German word',
        data: {
          scrambled: 'SAUH',
          correctAnswer: 'HAUS',
          hint: 'Ein Gebäude, in dem Menschen wohnen',
        },
      },
      {
        title: 'English Word',
        description: 'Unscramble to form English word',
        data: {
          scrambled: 'LPAPE',
          correctAnswer: 'APPLE',
          hint: 'A red or green fruit',
        },
      },
    ],
  },
};

/**
 * Get all task types
 */
export function getAllTaskTypes(): TaskTypeMeta[] {
  return Object.values(taskTypeRegistry);
}

/**
 * Get task type by ID
 */
export function getTaskType(id: TaskType): TaskTypeMeta | undefined {
  return taskTypeRegistry[id];
}

/**
 * Search task types by name or description
 */
export function searchTaskTypes(query: string): TaskTypeMeta[] {
  const lowerQuery = query.toLowerCase();
  return getAllTaskTypes().filter(
    (task) =>
      task.name.toLowerCase().includes(lowerQuery) ||
      task.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get task types by difficulty
 */
export function getTaskTypesByDifficulty(difficulty: string): TaskTypeMeta[] {
  return getAllTaskTypes().filter((task) => task.difficulty.includes(difficulty));
}
