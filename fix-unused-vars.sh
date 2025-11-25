#!/bin/bash

# Fix unused variables by prefixing with underscore

cd "$(dirname "$0")"

# Fix ClozeDeletionTask.tsx
sed -i '' 's/  isCorrect,$/  _isCorrect,/' src/modules/ui/components/practice/tasks/ClozeDeletion/ClozeDeletionTask.tsx
sed -i '' 's/  audioConfig,$/  _audioConfig,/' src/modules/ui/components/practice/tasks/ClozeDeletion/ClozeDeletionTask.tsx

# Fix use-cloze-deletion.ts
sed -i '' 's/  showFeedback,$/  _showFeedback,/' src/modules/ui/components/practice/tasks/ClozeDeletion/use-cloze-deletion.ts

# Fix FlashcardTask.tsx
sed -i '' 's/  isCorrect,$/  _isCorrect,/' src/modules/ui/components/practice/tasks/Flashcard/FlashcardTask.tsx
sed -i '' 's/const { revealed, known, reveal, markKnown, markUnknown } = useFlashcard(/const { revealed, known: _known, reveal, markKnown, markUnknown } = useFlashcard(/' src/modules/ui/components/practice/tasks/Flashcard/FlashcardTask.tsx

# Fix use-flashcard.ts
sed -i '' 's/import type { Task, FlashcardContent } from/import type { Task } from/' src/modules/ui/components/practice/tasks/Flashcard/use-flashcard.ts
sed -i '' 's/  showFeedback,$/  _showFeedback,/' src/modules/ui/components/practice/tasks/Flashcard/use-flashcard.ts

# Fix MatchingTask.tsx
sed -i '' 's/  audioConfig,$/  _audioConfig,/' src/modules/ui/components/practice/tasks/Matching/MatchingTask.tsx

# Fix use-matching.ts
sed -i '' 's/  showFeedback,$/  _showFeedback,/' src/modules/ui/components/practice/tasks/Matching/use-matching.ts

# Fix MultipleChoiceTask.tsx
sed -i '' 's/  audioConfig,$/  _audioConfig,/' src/modules/ui/components/practice/tasks/MultipleChoice/MultipleChoiceTask.tsx

# Fix MultipleSelectTask.tsx
sed -i '' 's/  isCorrect,$/  _isCorrect,/' src/modules/ui/components/practice/tasks/MultipleSelect/MultipleSelectTask.tsx
sed -i '' 's/  audioConfig,$/  _audioConfig,/' src/modules/ui/components/practice/tasks/MultipleSelect/MultipleSelectTask.tsx

# Fix OrderingTask.tsx
sed -i '' 's/  audioConfig,$/  _audioConfig,/' src/modules/ui/components/practice/tasks/Ordering/OrderingTask.tsx

# Fix use-ordering.ts
sed -i '' 's/  showFeedback,$/  _showFeedback,/' src/modules/ui/components/practice/tasks/Ordering/use-ordering.ts

# Fix SliderTask.tsx
sed -i '' 's/  isCorrect,$/  _isCorrect,/' src/modules/ui/components/practice/tasks/Slider/SliderTask.tsx
sed -i '' 's/  audioConfig,$/  _audioConfig,/' src/modules/ui/components/practice/tasks/Slider/SliderTask.tsx

# Fix use-slider.ts
sed -i '' 's/  showFeedback,$/  _showFeedback,/' src/modules/ui/components/practice/tasks/Slider/use-slider.ts

# Fix TextInputTask.tsx
sed -i '' 's/  audioConfig,$/  _audioConfig,/' src/modules/ui/components/practice/tasks/TextInput/TextInputTask.tsx

# Fix use-text-input.ts
sed -i '' 's/  showFeedback,$/  _showFeedback,/' src/modules/ui/components/practice/tasks/TextInput/use-text-input.ts

# Fix TrueFalseTask.tsx
sed -i '' 's/  audioConfig,$/  _audioConfig,/' src/modules/ui/components/practice/tasks/TrueFalse/TrueFalseTask.tsx

# Fix use-true-false.ts
sed -i '' 's/  showFeedback,$/  _showFeedback,/' src/modules/ui/components/practice/tasks/TrueFalse/use-true-false.ts

# Fix WordScrambleTask.tsx
sed -i '' 's/  audioConfig,$/  _audioConfig,/' src/modules/ui/components/practice/tasks/WordScramble/WordScrambleTask.tsx

# Fix use-word-scramble.ts
sed -i '' 's/  showFeedback,$/  _showFeedback,/' src/modules/ui/components/practice/tasks/WordScramble/use-word-scramble.ts

echo "Fixed all unused variables"
