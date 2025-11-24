import { PracticeQuestion, DifficultyLevel, QuestionType } from '../../src/types/practice';

export const createMockQuestion = (
  overrides?: Partial<PracticeQuestion>
): PracticeQuestion => ({
  id: 'q1',
  question: 'What is React?',
  type: 'multiple-choice',
  difficulty: 'intermediate',
  category: 'React',
  options: ['A library', 'A framework', 'A language', 'An IDE'],
  correctAnswer: 'A library',
  explanation: 'React is a JavaScript library for building user interfaces.',
  points: 20,
  timeLimit: 60,
  ...overrides,
});

export const createMockQuestions = (count: number): PracticeQuestion[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockQuestion({
      id: `q${i + 1}`,
      question: `Question ${i + 1}?`,
      options: [`Option A ${i + 1}`, `Option B ${i + 1}`, `Option C ${i + 1}`, `Option D ${i + 1}`],
      correctAnswer: `Option A ${i + 1}`,
    })
  );
};

export const createMockTextQuestion = (
  overrides?: Partial<PracticeQuestion>
): PracticeQuestion => {
  return createMockQuestion({
    type: 'text',
    options: undefined,
    correctAnswer: 'Sample answer',
    ...overrides,
  });
};

export const createMockCodeQuestion = (
  overrides?: Partial<PracticeQuestion>
): PracticeQuestion => {
  return createMockQuestion({
    type: 'code',
    options: undefined,
    language: 'typescript',
    codeSnippet: 'const x = 1;',
    correctAnswer: 'const x = 1;',
    ...overrides,
  });
};

export const createMockQuestionByDifficulty = (
  difficulty: DifficultyLevel,
  overrides?: Partial<PracticeQuestion>
): PracticeQuestion => {
  return createMockQuestion({
    difficulty,
    ...overrides,
  });
};

export const createMockQuestionByType = (
  type: QuestionType,
  overrides?: Partial<PracticeQuestion>
): PracticeQuestion => {
  if (type === 'text') {
    return createMockTextQuestion(overrides);
  }
  if (type === 'code') {
    return createMockCodeQuestion(overrides);
  }
  return createMockQuestion({ type, ...overrides });
};
