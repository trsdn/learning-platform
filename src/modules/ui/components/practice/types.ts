/**
 * Shared types for Practice Session components
 *
 * This file contains type definitions used across the practice session
 * refactored components.
 */

// Import Task type from core
import type { Task } from '@core/types/services';
import type { AudioConfig } from '@storage/template-loader';

// Re-export core types
export type {
  Task,
  PracticeSession,
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

export type { AudioConfig };

/**
 * Props for the main PracticeSession container
 */
export interface PracticeSessionProps {
  topicId: string;
  learningPathIds: string[];
  targetCount?: number;
  includeReview?: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * Common props for all task type components
 */
export interface BaseTaskProps {
  task: Task;
  showFeedback: boolean;
  isCorrect: boolean;
  onSubmit: (correct: boolean) => void;
  audioConfig: AudioConfig | null;
}

/**
 * Answer submission result
 */
export interface SubmissionResult {
  correct: boolean;
  timeSpent: number;
}

/**
 * Task validation interface - each task type implements this
 */
export interface TaskValidator {
  canSubmit: () => boolean;
  checkAnswer: () => boolean;
  resetState: () => void;
}

/**
 * Keyboard shortcut configuration for a task type
 */
export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  condition?: () => boolean;
}

/**
 * Session navigation state
 */
export interface NavigationState {
  currentIndex: number;
  totalTasks: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastTask: boolean;
}

/**
 * Audio playback state (simplified from hook)
 */
export interface AudioPlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  autoPlayUnlocked: boolean;
}
