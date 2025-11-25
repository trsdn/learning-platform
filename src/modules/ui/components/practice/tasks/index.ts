/**
 * Tasks Module
 *
 * Exports all task types and their hooks.
 */

// MultipleChoice
export { MultipleChoiceTask, useMultipleChoice } from './MultipleChoice';
export type { UseMultipleChoiceReturn } from './MultipleChoice';

// TrueFalse
export { TrueFalseTask, useTrueFalse } from './TrueFalse';
export type { UseTrueFalseReturn } from './TrueFalse';

// TextInput
export { TextInputTask, useTextInput } from './TextInput';
export type { UseTextInputReturn } from './TextInput';

// Slider
export { SliderTask, useSlider } from './Slider';
export type { UseSliderReturn } from './Slider';

// MultipleSelect
export { MultipleSelectTask, useMultipleSelect } from './MultipleSelect';
export type { UseMultipleSelectReturn } from './MultipleSelect';

// WordScramble
export { WordScrambleTask, useWordScramble } from './WordScramble';
export type { UseWordScrambleReturn } from './WordScramble';

// Flashcard
export { FlashcardTask, useFlashcard } from './Flashcard';
export type { UseFlashcardReturn } from './Flashcard';

// ClozeDeletion
export { ClozeDeletionTask, useClozeDeletion } from './ClozeDeletion';
export type { UseClozeDeletionReturn } from './ClozeDeletion';

// Ordering
export { OrderingTask, useOrdering } from './Ordering';
export type { UseOrderingReturn } from './Ordering';

// Matching
export { MatchingTask, useMatching } from './Matching';
export type { UseMatchingReturn } from './Matching';
