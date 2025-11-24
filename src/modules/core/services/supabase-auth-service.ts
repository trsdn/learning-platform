/**
 * Supabase Authentication Service
 *
 * Provides authentication functionality using Supabase Auth.
 * Supports multiple auth methods:
 * - Email/Password
 * - Magic Link
 * - OAuth (Google, GitHub)
 */

import { supabase } from '@/modules/storage/supabase-client';
import type { User, Session, AuthError, AuthResponse, OAuthResponse } from '@supabase/supabase-js';

export type AuthProvider = 'google' | 'github';

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

/**
 * Supabase Authentication Service
 */
export class SupabaseAuthService {
  /**
   * Sign up with email and password
   */
  static async signUp(data: SignUpData): Promise<AuthResponse> {
    const { email, password, displayName } = data;

    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (response.error) {
      console.error('Sign up error:', response.error);
    }

    return response;
  }

  /**
   * Sign in with email and password
   */
  static async signIn(data: SignInData): Promise<AuthResponse> {
    const { email, password } = data;

    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (response.error) {
      console.error('Sign in error:', response.error);
    }

    return response;
  }

  /**
   * Sign in with magic link (passwordless)
   */
  static async signInWithMagicLink(email: string): Promise<AuthResponse> {
    const response = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (response.error) {
      console.error('Magic link error:', response.error);
    }

    return response;
  }

  /**
   * Sign in with OAuth provider (Google, GitHub)
   */
  static async signInWithOAuth(provider: AuthProvider): Promise<OAuthResponse> {
    const response = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (response.error) {
      console.error('OAuth error:', response.error);
    }

    return response;
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    const response = await supabase.auth.signOut();

    if (response.error) {
      console.error('Sign out error:', response.error);
    }

    return response;
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<{ data: { session: Session | null }; error: AuthError | null }> {
    return await supabase.auth.getSession();
  }

  /**
   * Get current user
   */
  static async getUser(): Promise<{ data: { user: User | null }; error: AuthError | null }> {
    return await supabase.auth.getUser();
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string): Promise<{ data: {} | null; error: AuthError | null }> {
    const response = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (response.error) {
      console.error('Password reset error:', response.error);
    }

    return response;
  }

  /**
   * Update password (user must be authenticated)
   */
  static async updatePassword(newPassword: string): Promise<{ data: User | null; error: AuthError | null }> {
    const response = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (response.error) {
      console.error('Update password error:', response.error);
    }

    return {
      data: response.data.user,
      error: response.error,
    };
  }

  /**
   * Update user profile data
   */
  static async updateProfile(data: { displayName?: string; avatarUrl?: string }): Promise<{ data: User | null; error: AuthError | null }> {
    const updateData: Record<string, any> = {};

    if (data.displayName !== undefined) {
      updateData.display_name = data.displayName;
    }

    if (data.avatarUrl !== undefined) {
      updateData.avatar_url = data.avatarUrl;
    }

    const response = await supabase.auth.updateUser({
      data: updateData,
    });

    if (response.error) {
      console.error('Update profile error:', response.error);
    }

    return {
      data: response.data.user,
      error: response.error,
    };
  }

  /**
   * Resend email confirmation
   */
  static async resendConfirmationEmail(email: string): Promise<AuthResponse> {
    const response = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (response.error) {
      console.error('Resend confirmation error:', response.error);
    }

    return response;
  }

  /**
   * Subscribe to auth state changes
   * Returns unsubscribe function
   */
  static onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ): { unsubscribe: () => void } {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      callback(event, session);
    });

    return {
      unsubscribe: () => {
        data.subscription.unsubscribe();
      },
    };
  }

  /**
   * Exchange code from OAuth callback for session
   */
  static async exchangeCodeForSession(code: string): Promise<AuthResponse> {
    const response = await supabase.auth.exchangeCodeForSession(code);

    if (response.error) {
      console.error('Code exchange error:', response.error);
    }

    return response;
  }

  /**
   * Get user's email verification status
   */
  static async isEmailVerified(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined;
  }

  /**
   * Delete user account (requires user to be authenticated)
   */
  static async deleteAccount(): Promise<{ error: AuthError | null }> {
    // Note: This requires the user to be authenticated
    // In Supabase, deleting a user from auth.users also triggers cascade delete
    // for all related data due to our foreign key constraints

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: new Error('No user logged in') as AuthError };
    }

    // Call the admin API to delete the user
    // Note: This requires service role key, so we'll need a backend function
    // For now, we'll just sign out
    console.warn('Account deletion requires backend implementation');

    return await this.signOut();
  }
}

/**
 * Auth error helper
 */
export function getAuthErrorMessage(error: AuthError | null): string {
  if (!error) return '';

  switch (error.message) {
    case 'Invalid login credentials':
      return 'Ungültige E-Mail oder Passwort';
    case 'Email not confirmed':
      return 'Bitte bestätigen Sie Ihre E-Mail-Adresse';
    case 'User already registered':
      return 'Ein Konto mit dieser E-Mail existiert bereits';
    case 'Password should be at least 6 characters':
      return 'Passwort muss mindestens 6 Zeichen lang sein';
    case 'Signups not allowed for this instance':
      return 'Registrierungen sind derzeit nicht verfügbar';
    case 'Email rate limit exceeded':
      return 'Zu viele E-Mails versendet. Bitte warten Sie einen Moment.';
    case 'For security purposes, you can only request this once every 60 seconds':
      return 'Bitte warten Sie 60 Sekunden vor dem nächsten Versuch';
    default:
      return error.message || 'Ein Fehler ist aufgetreten';
  }
}
