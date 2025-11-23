/**
 * Database Types - Generated from Supabase Schema
 *
 * This file will be generated using Supabase CLI:
 * npx supabase gen types typescript --project-id <project-id> > src/modules/storage/database.types.ts
 *
 * For now, this is a placeholder with basic structure.
 * TODO: Run the generation command after Supabase project is created.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: Json
          audio: Json
          learning: Json
          notifications: Json
          interaction: Json
          ai: Json
          privacy: Json
          language: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: Json
          audio?: Json
          learning?: Json
          notifications?: Json
          interaction?: Json
          ai?: Json
          privacy?: Json
          language?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: Json
          audio?: Json
          learning?: Json
          notifications?: Json
          interaction?: Json
          ai?: Json
          privacy?: Json
          language?: Json
          created_at?: string
          updated_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          title: string
          description: string
          learning_path_ids: string[]
          metadata: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          description: string
          learning_path_ids?: string[]
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          learning_path_ids?: string[]
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      learning_paths: {
        Row: {
          id: string
          topic_id: string
          title: string
          description: string
          difficulty: string
          task_ids: string[]
          estimated_time: number
          requirements: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          topic_id: string
          title: string
          description: string
          difficulty: string
          task_ids?: string[]
          estimated_time?: number
          requirements?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          title?: string
          description?: string
          difficulty?: string
          task_ids?: string[]
          estimated_time?: number
          requirements?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          learning_path_id: string
          template_id: string | null
          type: string
          content: Json
          metadata: Json
          has_audio: boolean
          audio_url: string | null
          language: string | null
          ipa: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          learning_path_id: string
          template_id?: string | null
          type: string
          content: Json
          metadata?: Json
          has_audio?: boolean
          audio_url?: string | null
          language?: string | null
          ipa?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          learning_path_id?: string
          template_id?: string | null
          type?: string
          content?: Json
          metadata?: Json
          has_audio?: boolean
          audio_url?: string | null
          language?: string | null
          ipa?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          learning_path_id: string
          statistics: Json
          milestones: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          learning_path_id: string
          statistics?: Json
          milestones?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          learning_path_id?: string
          statistics?: Json
          milestones?: Json
          created_at?: string
          updated_at?: string
        }
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          learning_path_id: string
          task_ids: string[]
          execution: Json
          progress: Json
          configuration: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          learning_path_id: string
          task_ids: string[]
          execution?: Json
          progress?: Json
          configuration?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          learning_path_id?: string
          task_ids?: string[]
          execution?: Json
          progress?: Json
          configuration?: Json
          created_at?: string
          updated_at?: string
        }
      }
      answer_history: {
        Row: {
          id: string
          user_id: string
          task_id: string
          session_id: string | null
          timestamp: string
          is_correct: boolean
          user_answer: Json | null
          correct_answer: Json | null
          time_taken_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          session_id?: string | null
          timestamp?: string
          is_correct: boolean
          user_answer?: Json | null
          correct_answer?: Json | null
          time_taken_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          session_id?: string | null
          timestamp?: string
          is_correct?: boolean
          user_answer?: Json | null
          correct_answer?: Json | null
          time_taken_ms?: number | null
          created_at?: string
        }
      }
      spaced_repetition: {
        Row: {
          id: string
          user_id: string
          task_id: string
          schedule: Json
          algorithm: Json
          performance: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          schedule?: Json
          algorithm?: Json
          performance?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          schedule?: Json
          algorithm?: Json
          performance?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_progress_summary: {
        Args: { p_user_id: string }
        Returns: {
          total_paths: number
          completed_paths: number
          total_tasks_completed: number
          total_correct_answers: number
          overall_accuracy: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
