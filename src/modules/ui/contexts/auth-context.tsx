/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application.
 * Automatically manages auth state changes and user sessions.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { SupabaseAuthService, type SignUpData, type SignInData, type AuthProvider } from '@/modules/core/services/supabase-auth-service';

interface AuthContextValue {
  // State
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Methods
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (data: SignInData) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: AuthProvider) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    SupabaseAuthService.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { unsubscribe } = SupabaseAuthService.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle specific events
      if (event === 'SIGNED_IN') {
        console.log('✅ User signed in:', session?.user?.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
      } else if (event === 'USER_UPDATED') {
        console.log('📝 User updated');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Sign up with email/password
  const signUp = useCallback(async (data: SignUpData) => {
    try {
      const response = await SupabaseAuthService.signUp(data);

      if (response.error) {
        return { error: response.error };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    }
  }, []);

  // Sign in with email/password
  const signIn = useCallback(async (data: SignInData) => {
    try {
      const response = await SupabaseAuthService.signIn(data);

      if (response.error) {
        return { error: response.error };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error };
    }
  }, []);

  // Sign in with magic link
  const signInWithMagicLink = useCallback(async (email: string) => {
    try {
      const response = await SupabaseAuthService.signInWithMagicLink(email);

      if (response.error) {
        return { error: response.error };
      }

      return { error: null };
    } catch (error) {
      console.error('Magic link error:', error);
      return { error: error as Error };
    }
  }, []);

  // Sign in with OAuth
  const signInWithOAuth = useCallback(async (provider: AuthProvider) => {
    try {
      const response = await SupabaseAuthService.signInWithOAuth(provider);

      if (response.error) {
        return { error: response.error };
      }

      // OAuth redirects, so we won't get here normally
      return { error: null };
    } catch (error) {
      console.error('OAuth error:', error);
      return { error: error as Error };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await SupabaseAuthService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const response = await SupabaseAuthService.resetPassword(email);

      if (response.error) {
        return { error: response.error };
      }

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as Error };
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const response = await SupabaseAuthService.updatePassword(newPassword);

      if (response.error) {
        return { error: response.error };
      }

      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: error as Error };
    }
  }, []);

  // Resend confirmation email
  const resendConfirmationEmail = useCallback(async (email: string) => {
    try {
      const response = await SupabaseAuthService.resendConfirmationEmail(email);

      if (response.error) {
        return { error: response.error };
      }

      return { error: null };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return { error: error as Error };
    }
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithMagicLink,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 *
 * Access authentication state and methods from any component.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, signIn, signOut } = useAuth();
 *
 *   if (!user) {
 *     return <button onClick={() => signIn(...)}>Sign In</button>;
 *   }
 *
 *   return <button onClick={signOut}>Sign Out</button>;
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
