-- Add 'error-detection' to the tasks.type CHECK constraint
-- This migration adds support for the new error detection task type

-- Drop the existing constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_type_check;

-- Recreate with the new task type included
ALTER TABLE tasks ADD CONSTRAINT tasks_type_check CHECK (type IN (
  'multiple-choice', 'cloze-deletion', 'true-false', 'ordering',
  'matching', 'multiple-select', 'slider', 'word-scramble',
  'flashcard', 'text-input', 'error-detection'
));

-- Add comment for documentation
COMMENT ON COLUMN tasks.type IS 'Task type: multiple-choice, cloze-deletion, true-false, ordering, matching, multiple-select, slider, word-scramble, flashcard, text-input, error-detection';
