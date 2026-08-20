-- =====================================================
-- MindForge Academy - Restrict profile and progress access
-- Migration: 20251209000001
-- Description: Closes two data-exposure defects in the initial schema.
--   * profiles: the SELECT policy used USING (true), so every authenticated
--     user (and anon, via the public API) could read every other user's
--     email address. See issue #233.
--   * get_user_progress_summary(): SECURITY DEFINER bypasses RLS, but the
--     function never checked who was calling it, so any caller could read
--     any user's learning progress by passing another user id. See #234.
-- =====================================================

-- =====================================================
-- 1. Profiles are only visible to their owner (#233)
-- =====================================================

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- =====================================================
-- 2. Progress summary only ever returns the caller's data (#234)
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_progress_summary(p_user_id UUID)
RETURNS TABLE (
  total_paths INTEGER,
  completed_paths INTEGER,
  total_tasks_completed INTEGER,
  total_correct_answers INTEGER,
  overall_accuracy NUMERIC
) AS $$
BEGIN
  -- The function is SECURITY DEFINER and therefore bypasses RLS on
  -- user_progress. Callers may only ask for their own summary.
  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'permission denied for function get_user_progress_summary'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(DISTINCT learning_path_id)::INTEGER AS total_paths,
    COUNT(DISTINCT learning_path_id) FILTER (
      WHERE (statistics->>'tasksCompleted')::INTEGER >=
            (SELECT (requirements->>'requiredTasks')::INTEGER
             FROM learning_paths
             WHERE id = user_progress.learning_path_id)
    )::INTEGER AS completed_paths,
    SUM((statistics->>'tasksCompleted')::INTEGER)::INTEGER AS total_tasks_completed,
    SUM((statistics->>'correctAnswers')::INTEGER)::INTEGER AS total_correct_answers,
    CASE
      WHEN SUM((statistics->>'tasksCompleted')::INTEGER) > 0
      THEN ROUND(
        100.0 * SUM((statistics->>'correctAnswers')::INTEGER) /
        SUM((statistics->>'tasksCompleted')::INTEGER),
        2
      )
      ELSE 0
    END AS overall_accuracy
  FROM user_progress
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Only signed-in users may call it; anonymous API keys must not.
REVOKE ALL ON FUNCTION get_user_progress_summary(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_user_progress_summary(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION get_user_progress_summary(UUID) TO authenticated;

-- =====================================================
-- 3. Pin the search_path of the remaining SECURITY DEFINER function
-- =====================================================
-- handle_new_user() runs with the definer's privileges on every signup. A
-- mutable search_path lets a caller-controlled schema shadow the objects it
-- references, so pin it here as well.
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
