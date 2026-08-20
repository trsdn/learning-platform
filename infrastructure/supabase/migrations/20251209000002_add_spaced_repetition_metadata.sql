-- =====================================================
-- MindForge Academy - Persist spaced repetition metadata
-- Migration: 20251209000002
-- Description: The spaced_repetition table stored schedule, algorithm and
--   performance, but not metadata. The repository therefore invented
--   `introduced: now(), graduated: false, lapseCount: 0` on every read, so
--   graduation state and lapse counts were silently reset. See issue #228.
-- =====================================================

ALTER TABLE spaced_repetition
  ADD COLUMN IF NOT EXISTS metadata JSONB
  DEFAULT '{"introduced": null, "graduated": false, "lapseCount": 0}'::jsonb;

-- Existing rows have no recorded introduction date. The row's creation time is
-- the closest truthful value, so backfill it rather than leaving it null.
UPDATE spaced_repetition
SET metadata = jsonb_set(
  COALESCE(metadata, '{"graduated": false, "lapseCount": 0}'::jsonb),
  '{introduced}',
  to_jsonb(created_at)
)
WHERE metadata IS NULL OR metadata->>'introduced' IS NULL;
