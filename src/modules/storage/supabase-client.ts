/**
 * Supabase Client Singleton
 *
 * Provides a single instance of the Supabase client for the application.
 * This client is configured with the project URL and anon key from environment variables.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. ' +
    'Please check your .env.local file or Vercel environment variables.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY environment variable. ' +
    'Please check your .env.local file or Vercel environment variables.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    `Invalid VITE_SUPABASE_URL: ${supabaseUrl}. ` +
    'Must be a valid URL (e.g., https://your-project.supabase.co)'
  );
}

/**
 * Supabase client instance
 *
 * Configured with:
 * - TypeScript types from database schema
 * - Auto-refresh for auth tokens
 * - Persistent sessions across page reloads
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // For OAuth redirects
      storage: window.localStorage, // Store auth tokens in localStorage
    },
  }
);

/**
 * Helper function to check if the client is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

/**
 * Helper function to get the current user ID (if authenticated)
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
};

/**
 * Helper function to check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};
