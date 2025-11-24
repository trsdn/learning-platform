-- =====================================================
-- MindForge Academy - Initial Supabase Schema
-- Migration: 20250123000001
-- Description: Complete database schema for learning platform
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES & SETTINGS
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  theme JSONB DEFAULT '{"mode": "system", "fontScale": 1.0, "animationsEnabled": true, "reducedMotion": false}'::jsonb,
  audio JSONB DEFAULT '{"autoPlayEnabled": true, "autoPlayRepeats": 2, "autoPlayDelayMs": 800, "soundEffectsEnabled": true, "soundEffectsVolume": 0.7, "successChimeEnabled": true, "playbackRate": 1.0}'::jsonb,
  learning JSONB DEFAULT '{"algorithm": "adaptive", "dailyGoal": 20, "sessionSize": 10, "repeatDifficultTasks": true, "randomizeOrder": true}'::jsonb,
  notifications JSONB DEFAULT '{"dailyReminderEnabled": false, "dailyReminderTime": "18:00", "dailyReminderMessage": "Zeit zum Lernen! 📚", "streakWarningEnabled": true, "weeklyReportEnabled": false}'::jsonb,
  interaction JSONB DEFAULT '{"vibrationsEnabled": true, "vibrationOnCorrect": true, "vibrationOnIncorrect": false, "vibrationOnSessionComplete": true, "confettiEnabled": true, "confettiStyle": "colorful", "confettiIntensity": "medium", "wakeLockEnabled": false, "keyboardShortcutsEnabled": true}'::jsonb,
  ai JSONB DEFAULT '{"explanationsEnabled": false, "explanationDepth": "medium", "includeExamples": true, "showLearningTips": true, "trainingOptIn": false, "dailyUsageLimit": 100, "usageToday": 0}'::jsonb,
  privacy JSONB DEFAULT '{"dataStorageMode": "cloud", "analyticsEnabled": true, "errorReportsEnabled": true, "betaFeaturesEnabled": false}'::jsonb,
  language JSONB DEFAULT '{"interfaceLanguage": "de", "timezone": "Europe/Berlin", "dateFormat": "DD.MM.YYYY"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- LEARNING CONTENT
-- =====================================================

-- Topics table
CREATE TABLE topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  learning_path_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Learning paths table
CREATE TABLE learning_paths (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  task_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  estimated_time INTEGER NOT NULL DEFAULT 30,
  requirements JSONB DEFAULT '{"minimumAccuracy": 70, "requiredTasks": 10}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_paths_topic_id ON learning_paths(topic_id);
CREATE INDEX idx_learning_paths_difficulty ON learning_paths(difficulty);
CREATE INDEX idx_learning_paths_is_active ON learning_paths(is_active);

-- Tasks table
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  learning_path_id TEXT NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  template_id TEXT,
  type TEXT NOT NULL CHECK (type IN (
    'multiple-choice', 'cloze-deletion', 'true-false', 'ordering',
    'matching', 'multiple-select', 'slider', 'word-scramble',
    'flashcard', 'text-input'
  )),
  content JSONB NOT NULL,
  metadata JSONB DEFAULT '{"difficulty": "medium", "tags": [], "estimatedTime": 60, "points": 10}'::jsonb,
  has_audio BOOLEAN DEFAULT false,
  audio_url TEXT,
  language TEXT,
  ipa TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_learning_path_id ON tasks(learning_path_id);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_has_audio ON tasks(has_audio);
CREATE INDEX idx_tasks_metadata_difficulty ON tasks((metadata->>'difficulty'));

-- =====================================================
-- USER PROGRESS & SESSIONS
-- =====================================================

-- User progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  learning_path_id TEXT NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  statistics JSONB DEFAULT '{"tasksCompleted": 0, "correctAnswers": 0, "incorrectAnswers": 0, "totalTime": 0, "averageAccuracy": 0, "streak": 0}'::jsonb,
  milestones JSONB DEFAULT '{"firstTaskCompleted": null, "lastActivity": null, "achievements": []}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, learning_path_id)
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_learning_path_id ON user_progress(learning_path_id);
CREATE INDEX idx_user_progress_topic_id ON user_progress(topic_id);

-- Practice sessions table
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  learning_path_id TEXT NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  task_ids TEXT[] NOT NULL,
  execution JSONB DEFAULT '{"status": "planned", "startedAt": null, "completedAt": null, "pausedAt": null}'::jsonb,
  progress JSONB DEFAULT '{"currentTaskIndex": 0, "correctCount": 0, "incorrectCount": 0, "totalTasks": 0}'::jsonb,
  configuration JSONB DEFAULT '{"targetCount": 10, "includeReview": true, "algorithm": "adaptive"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_learning_path_id ON practice_sessions(learning_path_id);
CREATE INDEX idx_practice_sessions_status ON practice_sessions((execution->>'status'));
CREATE INDEX idx_practice_sessions_created_at ON practice_sessions(created_at DESC);

-- Answer history table
CREATE TABLE answer_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  session_id UUID REFERENCES practice_sessions(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_correct BOOLEAN NOT NULL,
  user_answer JSONB,
  correct_answer JSONB,
  time_taken_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_answer_history_user_id ON answer_history(user_id);
CREATE INDEX idx_answer_history_task_id ON answer_history(task_id);
CREATE INDEX idx_answer_history_session_id ON answer_history(session_id);
CREATE INDEX idx_answer_history_timestamp ON answer_history(timestamp DESC);
CREATE INDEX idx_answer_history_is_correct ON answer_history(is_correct);

-- Spaced repetition table
CREATE TABLE spaced_repetition (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  schedule JSONB DEFAULT '{"nextReview": null, "lastReviewDate": null}'::jsonb,
  algorithm JSONB DEFAULT '{"interval": 1, "easeFactor": 2.5, "repetitionCount": 0}'::jsonb,
  performance JSONB DEFAULT '{"reviewCount": 0, "correctCount": 0}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

CREATE INDEX idx_spaced_repetition_user_id ON spaced_repetition(user_id);
CREATE INDEX idx_spaced_repetition_task_id ON spaced_repetition(task_id);
CREATE INDEX idx_spaced_repetition_next_review ON spaced_repetition((schedule->>'nextReview'));

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practice_sessions_updated_at BEFORE UPDATE ON practice_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaced_repetition_updated_at BEFORE UPDATE ON spaced_repetition
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaced_repetition ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Topics policies (public read, admin write)
CREATE POLICY "Topics are viewable by everyone"
  ON topics FOR SELECT
  USING (true);

-- Learning paths policies (public read, admin write)
CREATE POLICY "Learning paths are viewable by everyone"
  ON learning_paths FOR SELECT
  USING (true);

-- Tasks policies (public read, admin write)
CREATE POLICY "Tasks are viewable by everyone"
  ON tasks FOR SELECT
  USING (true);

-- User progress policies
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON user_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Practice sessions policies
CREATE POLICY "Users can view their own sessions"
  ON practice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON practice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON practice_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON practice_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Answer history policies
CREATE POLICY "Users can view their own answer history"
  ON answer_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own answers"
  ON answer_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Spaced repetition policies
CREATE POLICY "Users can view their own spaced repetition data"
  ON spaced_repetition FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spaced repetition data"
  ON spaced_repetition FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spaced repetition data"
  ON spaced_repetition FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spaced repetition data"
  ON spaced_repetition FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS FOR COMMON QUERIES
-- =====================================================

-- Get user's learning progress summary
CREATE OR REPLACE FUNCTION get_user_progress_summary(p_user_id UUID)
RETURNS TABLE (
  total_paths INTEGER,
  completed_paths INTEGER,
  total_tasks_completed INTEGER,
  total_correct_answers INTEGER,
  overall_accuracy NUMERIC
) AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
