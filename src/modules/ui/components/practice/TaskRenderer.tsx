/**
 * TaskRenderer Component
 *
 * Dynamically renders the appropriate task component based on task type.
 */

import { Suspense, lazy } from 'react';
import type { Task } from '@core/types/services';
import type { AudioConfig } from '@storage/template-loader';

// Lazy load task components for code splitting
const MultipleChoiceTask = lazy(() =>
  import('./tasks/MultipleChoice').then((mod) => ({
    default: mod.MultipleChoiceTask,
  }))
);

const TrueFalseTask = lazy(() =>
  import('./tasks/TrueFalse').then((mod) => ({
    default: mod.TrueFalseTask,
  }))
);

const TextInputTask = lazy(() =>
  import('./tasks/TextInput').then((mod) => ({
    default: mod.TextInputTask,
  }))
);

const SliderTask = lazy(() =>
  import('./tasks/Slider').then((mod) => ({
    default: mod.SliderTask,
  }))
);

const MultipleSelectTask = lazy(() =>
  import('./tasks/MultipleSelect').then((mod) => ({
    default: mod.MultipleSelectTask,
  }))
);

const WordScrambleTask = lazy(() =>
  import('./tasks/WordScramble').then((mod) => ({
    default: mod.WordScrambleTask,
  }))
);

const FlashcardTask = lazy(() =>
  import('./tasks/Flashcard').then((mod) => ({
    default: mod.FlashcardTask,
  }))
);

const ClozeDeletionTask = lazy(() =>
  import('./tasks/ClozeDeletion').then((mod) => ({
    default: mod.ClozeDeletionTask,
  }))
);

const OrderingTask = lazy(() =>
  import('./tasks/Ordering').then((mod) => ({
    default: mod.OrderingTask,
  }))
);

const MatchingTask = lazy(() =>
  import('./tasks/Matching').then((mod) => ({
    default: mod.MatchingTask,
  }))
);

const ErrorDetectionTask = lazy(() =>
  import('./tasks/ErrorDetection').then((mod) => ({
    default: mod.ErrorDetectionTask,
  }))
);

export interface TaskRendererProps {
  /** The task to render */
  task: Task | null;
  /** Whether to show feedback */
  showFeedback: boolean;
  /** Whether the answer is correct */
  isCorrect: boolean;
  /** Audio configuration */
  audioConfig: AudioConfig | null;
  /** Callback when answer state changes */
  onAnswerChange?: (canSubmit: boolean) => void;
  /** Additional props passed to specific task types */
  [key: string]: unknown;
}

/**
 * Renders the appropriate task component based on task type
 */
export function TaskRenderer({
  task,
  showFeedback,
  isCorrect,
  audioConfig,
  onAnswerChange,
  ...additionalProps
}: TaskRendererProps) {
  if (!task) {
    return <div>Keine Aufgabe geladen</div>;
  }

  const commonProps = {
    task,
    showFeedback,
    isCorrect,
    audioConfig,
    ...(onAnswerChange && { onAnswerChange }),
    ...additionalProps,
  };

  return (
    <Suspense fallback={<div>Aufgabe wird geladen...</div>}>
      {task.type === 'multiple-choice' && <MultipleChoiceTask {...commonProps} />}
      {task.type === 'true-false' && <TrueFalseTask {...commonProps} />}
      {task.type === 'text-input' && <TextInputTask {...commonProps} />}
      {task.type === 'slider' && <SliderTask {...commonProps} />}
      {task.type === 'multiple-select' && <MultipleSelectTask {...commonProps} />}
      {task.type === 'word-scramble' && <WordScrambleTask {...commonProps} />}
      {task.type === 'flashcard' && <FlashcardTask {...commonProps} />}
      {task.type === 'cloze-deletion' && <ClozeDeletionTask {...commonProps} />}
      {task.type === 'ordering' && <OrderingTask {...commonProps} />}
      {task.type === 'matching' && <MatchingTask {...commonProps} />}
      {task.type === 'error-detection' && <ErrorDetectionTask {...commonProps} />}
      {/* Handle unknown task types */}
      {![
        'multiple-choice',
        'true-false',
        'text-input',
        'slider',
        'multiple-select',
        'word-scramble',
        'flashcard',
        'cloze-deletion',
        'ordering',
        'matching',
        'error-detection',
      ].includes(task.type) && <div>Unbekannter Aufgabentyp: {task.type}</div>}
    </Suspense>
  );
}
