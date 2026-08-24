/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application.
 * Automatically manages auth state changes and user sessions.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { SupabaseAuthService, type SignUpData, type SignInData, type AuthProvider } from '@/modules/core/services/supabase-auth-service';
import { logger } from '@/utils/logger';

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

  // Password recovery
  isPasswordRecovery: boolean;
  /** Leaves recovery mode and ends the recovery session. */
  exitPasswordRecovery: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Detects whether the current page was opened from a password recovery link.
 *
 * Supabase fires `PASSWORD_RECOVERY` while parsing the link, but that can happen
 * before this provider subscribes, so the URL is inspected as well. Recovery
 * links carry `type=recovery` in the hash (implicit flow) or the query string
 * (PKCE flow), and `resetPassword()` sends users to `/auth/reset-password`.
 */
function detectRecoveryFromUrl(): boolean {
  if (typeof window === 'undefined') return false;

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(window.location.search);

  return (
    hashParams.get('type') === 'recovery' ||
    queryParams.get('type') === 'recovery' ||
    window.location.pathname.endsWith('/auth/reset-password')
  );
}

/**
 * Removes recovery tokens and the recovery path from the address bar so a
 * reload does not drop the user back into the recovery screen.
 */
function clearRecoveryUrl(): void {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;

  const base = window.location.pathname.endsWith('/auth/reset-password')
    ? window.location.pathname.replace(/\/auth\/reset-password$/, '/')
    : window.location.pathname;

  window.history.replaceState(null, '', base);
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(detectRecoveryFromUrl);

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
      logger.debug('Auth event:', event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle specific events
      if (event === 'SIGNED_IN') {
        logger.debug('User signed in:', session?.user?.email);
      } else if (event === 'SIGNED_OUT') {
        logger.debug('User signed out');
        setIsPasswordRecovery(false);
      } else if (event === 'TOKEN_REFRESHED') {
        logger.debug('Token refreshed');
      } else if (event === 'USER_UPDATED') {
        logger.debug('User updated');
      } else if (event === 'PASSWORD_RECOVERY') {
        // The session is only meant for choosing a new password, so the app
        // must show the recovery form instead of the normal authenticated UI.
        logger.debug('Password recovery started');
        setIsPasswordRecovery(true);
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
      logger.error('Sign up error:', error);
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
      logger.error('Sign in error:', error);
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
      logger.error('Magic link error:', error);
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
      logger.error('OAuth error:', error);
      return { error: error as Error };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await SupabaseAuthService.signOut();
    } catch (error) {
      logger.error('Sign out error:', error);
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
      logger.error('Reset password error:', error);
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

      // The recovery session has served its purpose once the password changed.
      setIsPasswordRecovery(false);
      clearRecoveryUrl();

      return { error: null };
    } catch (error) {
      logger.error('Update password error:', error);
      return { error: error as Error };
    }
  }, []);

  // Leave recovery mode without changing the password
  const exitPasswordRecovery = useCallback(async () => {
    // A recovery link is a single-purpose credential delivered by email, and
    // Supabase exchanges it for a full session before the new password is
    // ever set. Dismissing the form must therefore end that session: keeping
    // it would let anyone who opens the link -- a forwarded mail, a shared
    // device, a replay from history -- close the dialog and land in the
    // authenticated app without knowing the password.
    await signOut();
    setIsPasswordRecovery(false);
    clearRecoveryUrl();
  }, [signOut]);

  // Resend confirmation email
  const resendConfirmationEmail = useCallback(async (email: string) => {
    try {
      const response = await SupabaseAuthService.resendConfirmationEmail(email);

      if (response.error) {
        return { error: response.error };
      }

      return { error: null };
    } catch (error) {
      logger.error('Resend confirmation error:', error);
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
    isPasswordRecovery,
    exitPasswordRecovery,
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
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
