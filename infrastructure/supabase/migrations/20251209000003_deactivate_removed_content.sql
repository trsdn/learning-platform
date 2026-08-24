-- Migration: Allow learning content to be deactivated instead of deleted
-- Created: 2025-12-09
--
-- Content synchronisation only ever upserted the rows present in the current
-- JSON sources, so paths and tasks removed from those sources stayed active and
-- kept being served to learners.
--
-- `topics` and `learning_paths` already carry an `is_active` flag, but `tasks`
-- did not, which made it impossible to retire a task without deleting the row.
-- Deleting is not an option: `user_progress`, `answer_history` and
-- `spaced_repetition` reference tasks and would lose learner history.
--
-- This migration adds the missing flag so the seeding pipeline can deactivate
-- content that no longer exists in the source of truth while keeping every
-- historical reference intact.

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_tasks_is_active ON tasks(is_active);

-- Practice selection always filters on learning path plus active state.
CREATE INDEX IF NOT EXISTS idx_tasks_learning_path_active
  ON tasks(learning_path_id, is_active);

COMMENT ON COLUMN tasks.is_active IS
  'False when the task no longer exists in the canonical content sources. Inactive tasks are never selected for practice but remain readable so learner history stays resolvable.';
