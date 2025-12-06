/**
 * Tests for SupabaseAuthService
 *
 * Comprehensive unit tests for the Supabase authentication service
 * covering all authentication methods and error handling scenarios.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SupabaseAuthService, getAuthErrorMessage } from '@/modules/core/services/supabase-auth-service';
import type { AuthError, AuthResponse, OAuthResponse, User, Session } from '@supabase/supabase-js';

// Mock the supabase client
vi.mock('@/modules/storage/supabase-client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOtp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      resend: vi.fn(),
      onAuthStateChange: vi.fn(),
      exchangeCodeForSession: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { supabase } from '@/modules/storage/supabase-client';
import { logger } from '@/utils/logger';

describe('SupabaseAuthService', () => {
  // Mock window.location.origin
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.location
    delete (window as { location?: Location }).location;
    window.location = {
      ...originalLocation,
      origin: 'http://localhost:3000',
    };

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.restoreAllMocks();
  });

  describe('signUp', () => {
    it('should sign up user with valid data', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { display_name: 'test' },
      };

      const mockResponse: AuthResponse = {
        data: {
          user: mockUser as User,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signUp({
        email: 'test@example.com',
        password: 'password123', // pragma: allowlist secret
        displayName: 'test',
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123', // pragma: allowlist secret
        options: {
          data: {
            display_name: 'test',
          },
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      });

      expect(result).toEqual(mockResponse);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should default displayName to email prefix when not provided', async () => {
      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockResponse);

      await SupabaseAuthService.signUp({
        email: 'testuser@example.com',
        password: 'password123', // pragma: allowlist secret
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'testuser@example.com',
        password: 'password123', // pragma: allowlist secret
        options: {
          data: {
            display_name: 'testuser',
          },
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      });
    });

    it('should set emailRedirectTo correctly', async () => {
      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockResponse);

      window.location.origin = 'https://example.com';

      await SupabaseAuthService.signUp({
        email: 'test@example.com',
        password: 'password123', // pragma: allowlist secret
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            emailRedirectTo: 'https://example.com/auth/callback',
          }),
        })
      );
    });

    it('should handle sign up errors', async () => {
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'User already registered',
        status: 400,
      };

      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: mockError,
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signUp({
        email: 'test@example.com',
        password: 'password123', // pragma: allowlist secret
      });

      expect(result.error).toEqual(mockError);
      expect(console.error).toHaveBeenCalledWith('Sign up error:', mockError);
    });

    it('should include custom metadata in signup options', async () => {
      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockResponse);

      await SupabaseAuthService.signUp({
        email: 'test@example.com',
        password: 'password123', // pragma: allowlist secret
        displayName: 'Custom Name',
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            data: {
              display_name: 'Custom Name',
            },
          }),
        })
      );
    });
  });

  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockSession: Partial<Session> = {
        access_token: 'token-123',
        user: mockUser as User,
      };

      const mockResponse: AuthResponse = {
        data: {
          user: mockUser as User,
          session: mockSession as Session,
        },
        error: null,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signIn({
        email: 'test@example.com',
        password: 'password123', // pragma: allowlist secret
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123', // pragma: allowlist secret
      });

      expect(result).toEqual(mockResponse);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle sign in errors', async () => {
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Invalid login credentials',
        status: 400,
      };

      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: mockError,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signIn({
        email: 'test@example.com',
        password: 'wrongpassword', // pragma: allowlist secret
      });

      expect(result.error).toEqual(mockError);
      expect(console.error).toHaveBeenCalledWith('Sign in error:', mockError);
    });
  });

  describe('signInWithMagicLink', () => {
    it('should send magic link to email', async () => {
      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signInWithMagicLink('test@example.com');

      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      });

      expect(result).toEqual(mockResponse);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should set correct redirectUrl for magic link', async () => {
      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue(mockResponse);

      window.location.origin = 'https://app.example.com';

      await SupabaseAuthService.signInWithMagicLink('test@example.com');

      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            emailRedirectTo: 'https://app.example.com/auth/callback',
          }),
        })
      );
    });

    it('should handle magic link errors', async () => {
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Email rate limit exceeded',
        status: 429,
      };

      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: mockError,
      };

      vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signInWithMagicLink('test@example.com');

      expect(result.error).toEqual(mockError);
      expect(console.error).toHaveBeenCalledWith('Magic link error:', mockError);
    });
  });

  describe('signInWithOAuth', () => {
    it('should sign in with Google provider', async () => {
      const mockResponse: OAuthResponse = {
        data: {
          provider: 'google',
          url: 'https://accounts.google.com/o/oauth2/v2/auth',
        },
        error: null,
      };

      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signInWithOAuth('google');

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });

      expect(result).toEqual(mockResponse);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should sign in with GitHub provider', async () => {
      const mockResponse: OAuthResponse = {
        data: {
          provider: 'github',
          url: 'https://github.com/login/oauth/authorize',
        },
        error: null,
      };

      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signInWithOAuth('github');

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });

      expect(result).toEqual(mockResponse);
    });

    it('should set correct redirectUrl for OAuth', async () => {
      const mockResponse: OAuthResponse = {
        data: {
          provider: 'google',
          url: 'https://accounts.google.com/o/oauth2/v2/auth',
        },
        error: null,
      };

      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue(mockResponse);

      window.location.origin = 'https://production.com';

      await SupabaseAuthService.signInWithOAuth('google');

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            redirectTo: 'https://production.com/auth/callback',
          }),
        })
      );
    });

    it('should handle OAuth errors', async () => {
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'OAuth provider error',
        status: 500,
      };

      const mockResponse: OAuthResponse = {
        data: {
          provider: 'google',
          url: null,
        },
        error: mockError,
      };

      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signInWithOAuth('google');

      expect(result.error).toEqual(mockError);
      expect(console.error).toHaveBeenCalledWith('OAuth error:', mockError);
    });
  });

  describe('signOut', () => {
    it('should sign out current user successfully', async () => {
      const mockResponse = { error: null };

      vi.mocked(supabase.auth.signOut).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Sign out failed',
        status: 500,
      };

      const mockResponse = { error: mockError };

      vi.mocked(supabase.auth.signOut).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.signOut();

      expect(result.error).toEqual(mockError);
      expect(console.error).toHaveBeenCalledWith('Sign out error:', mockError);
    });
  });

  describe('getSession', () => {
    it('should return current session', async () => {
      const mockSession: Partial<Session> = {
        access_token: 'token-123',
        user: { id: 'user-123', email: 'test@example.com' } as User,
      };

      const mockResponse = {
        data: { session: mockSession as Session },
        error: null,
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.getSession();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should return null session when not authenticated', async () => {
      const mockResponse = {
        data: { session: null },
        error: null,
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.getSession();

      expect(result.data.session).toBeNull();
    });

    it('should handle getSession errors', async () => {
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Session error',
        status: 500,
      };

      const mockResponse = {
        data: { session: null },
        error: mockError,
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.getSession();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('getUser', () => {
    it('should return current user', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' },
      };

      const mockResponse = {
        data: { user: mockUser as User },
        error: null,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.getUser();

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should return null user when not authenticated', async () => {
      const mockResponse = {
        data: { user: null },
        error: null,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.getUser();

      expect(result.data.user).toBeNull();
    });

    it('should handle getUser errors', async () => {
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'User error',
        status: 500,
      };

      const mockResponse = {
        data: { user: null },
        error: mockError,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.getUser();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when session exists', async () => {
      const mockSession: Partial<Session> = {
        access_token: 'token-123',
        user: { id: 'user-123' } as User,
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as Session },
        error: null,
      });

      const result = await SupabaseAuthService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when session is null', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await SupabaseAuthService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when getSession has error', async () => {
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Session error',
        status: 500,
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const result = await SupabaseAuthService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      const mockResponse = {
        data: {},
        error: null,
      };

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.resetPassword('test@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'http://localhost:3000/auth/reset-password',
        }
      );

      expect(result).toEqual(mockResponse);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should use correct redirectTo URL for password reset', async () => {
      const mockResponse = {
        data: {},
        error: null,
      };

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue(mockResponse);

      window.location.origin = 'https://secure.example.com';

      await SupabaseAuthService.resetPassword('test@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: 'https://secure.example.com/auth/reset-password',
        })
      );
    });

    it('should handle password reset errors', async () => {
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Email rate limit exceeded',
        status: 429,
      };

      const mockResponse = {
        data: null,
        error: mockError,
      };

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.resetPassword('test@example.com');

      expect(result.error).toEqual(mockError);
      expect(console.error).toHaveBeenCalledWith('Password reset error:', mockError);
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockResponse: AuthResponse = {
        data: {
          user: mockUser as User,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.updateUser).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.updatePassword('newpassword123');

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123', // pragma: allowlist secret
      });

      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle password update errors', async () => {
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Password should be at least 6 characters',
        status: 400,
      };

      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: mockError,
      };

      vi.mocked(supabase.auth.updateUser).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.updatePassword('123');

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
      expect(console.error).toHaveBeenCalledWith('Update password error:', mockError);
    });

    it('should return user data on successful password update', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
        updated_at: new Date().toISOString(),
      };

      const mockResponse: AuthResponse = {
        data: {
          user: mockUser as User,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.updateUser).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.updatePassword('securepassword123');

      expect(result.data).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update display name', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { display_name: 'New Name' },
      };

      const mockResponse: AuthResponse = {
        data: {
          user: mockUser as User,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.updateUser).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.updateProfile({
        displayName: 'New Name',
      });

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: {
          display_name: 'New Name',
        },
      });

      expect(result.data).toEqual(mockUser);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should update avatar URL', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { avatar_url: 'https://example.com/avatar.jpg' },
      };

      const mockResponse: AuthResponse = {
        data: {
          user: mockUser as User,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.updateUser).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.updateProfile({
        avatarUrl: 'https://example.com/avatar.jpg',
      });

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: {
          avatar_url: 'https://example.com/avatar.jpg',
        },
      });

      expect(result.data).toEqual(mockUser);
    });

    it('should update both displayName and avatarUrl', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          display_name: 'Full Name',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      };

      const mockResponse: AuthResponse = {
        data: {
          user: mockUser as User,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.updateUser).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.updateProfile({
        displayName: 'Full Name',
        avatarUrl: 'https://example.com/avatar.jpg',
      });

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: {
          display_name: 'Full Name',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      });

      expect(result.data).toEqual(mockUser);
    });

    it('should map displayName to display_name', async () => {
      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.updateUser).mockResolvedValue(mockResponse);

      await SupabaseAuthService.updateProfile({
        displayName: 'Test Name',
      });

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: expect.objectContaining({
          display_name: 'Test Name',
        }),
      });
    });

    it('should map avatarUrl to avatar_url', async () => {
      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.updateUser).mockResolvedValue(mockResponse);

      await SupabaseAuthService.updateProfile({
        avatarUrl: 'https://example.com/pic.jpg',
      });

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: expect.objectContaining({
          avatar_url: 'https://example.com/pic.jpg',
        }),
      });
    });

    it('should handle profile update errors', async () => {
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Update failed',
        status: 500,
      };

      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: mockError,
      };

      vi.mocked(supabase.auth.updateUser).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.updateProfile({
        displayName: 'New Name',
      });

      expect(result.error).toEqual(mockError);
      expect(console.error).toHaveBeenCalledWith('Update profile error:', mockError);
    });

    it('should handle empty profile update', async () => {
      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.updateUser).mockResolvedValue(mockResponse);

      await SupabaseAuthService.updateProfile({});

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: {},
      });
    });
  });

  describe('resendConfirmationEmail', () => {
    it('should resend confirmation email', async () => {
      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.resend).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.resendConfirmationEmail('test@example.com');

      expect(supabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      });

      expect(result).toEqual(mockResponse);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should use correct type for resend', async () => {
      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.resend).mockResolvedValue(mockResponse);

      await SupabaseAuthService.resendConfirmationEmail('test@example.com');

      expect(supabase.auth.resend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'signup',
        })
      );
    });

    it('should set correct redirectUrl for resend', async () => {
      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: null,
      };

      vi.mocked(supabase.auth.resend).mockResolvedValue(mockResponse);

      window.location.origin = 'https://app.example.com';

      await SupabaseAuthService.resendConfirmationEmail('test@example.com');

      expect(supabase.auth.resend).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            emailRedirectTo: 'https://app.example.com/auth/callback',
          }),
        })
      );
    });

    it('should handle resend confirmation errors', async () => {
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'For security purposes, you can only request this once every 60 seconds',
        status: 429,
      };

      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: mockError,
      };

      vi.mocked(supabase.auth.resend).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.resendConfirmationEmail('test@example.com');

      expect(result.error).toEqual(mockError);
      expect(console.error).toHaveBeenCalledWith('Resend confirmation error:', mockError);
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const mockUnsubscribe = vi.fn();
      const mockSubscription = {
        subscription: {
          unsubscribe: mockUnsubscribe,
        },
      };

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: mockSubscription,
      } as never);

      const callback = vi.fn();
      const { unsubscribe } = SupabaseAuthService.onAuthStateChange(callback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(expect.any(Function));

      // Call the unsubscribe function
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should call callback on auth state change', () => {
      let authCallback: ((event: string, session: Session | null) => void) | null = null;

      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb) => {
        authCallback = cb;
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        } as never;
      });

      const callback = vi.fn();
      SupabaseAuthService.onAuthStateChange(callback);

      // Simulate auth state change
      const mockSession: Partial<Session> = {
        access_token: 'token-123',
        user: { id: 'user-123', email: 'test@example.com' } as User,
      };

      authCallback?.('SIGNED_IN', mockSession as Session);

      expect(callback).toHaveBeenCalledWith('SIGNED_IN', mockSession);
    });

    it('should log auth state changes', () => {
      let authCallback: ((event: string, session: Session | null) => void) | null = null;

      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb) => {
        authCallback = cb;
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        } as never;
      });

      const callback = vi.fn();
      SupabaseAuthService.onAuthStateChange(callback);

      const mockSession: Partial<Session> = {
        access_token: 'token-123',
        user: { id: 'user-123', email: 'test@example.com' } as User,
      };

      authCallback?.('SIGNED_IN', mockSession as Session);

      expect(logger.debug).toHaveBeenCalledWith(
        'Auth state changed:',
        'SIGNED_IN',
        'test@example.com'
      );
    });

    it('should return unsubscribe function', () => {
      const mockUnsubscribe = vi.fn();
      const mockSubscription = {
        subscription: {
          unsubscribe: mockUnsubscribe,
        },
      };

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: mockSubscription,
      } as never);

      const callback = vi.fn();
      const result = SupabaseAuthService.onAuthStateChange(callback);

      expect(result).toHaveProperty('unsubscribe');
      expect(typeof result.unsubscribe).toBe('function');
    });
  });

  describe('exchangeCodeForSession', () => {
    it('should exchange OAuth code for session', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockSession: Partial<Session> = {
        access_token: 'token-123',
        user: mockUser as User,
      };

      const mockResponse: AuthResponse = {
        data: {
          user: mockUser as User,
          session: mockSession as Session,
        },
        error: null,
      };

      vi.mocked(supabase.auth.exchangeCodeForSession).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.exchangeCodeForSession('oauth-code-123');

      expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('oauth-code-123');
      expect(result).toEqual(mockResponse);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle code exchange errors', async () => {
      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Invalid code',
        status: 400,
      };

      const mockResponse: AuthResponse = {
        data: {
          user: null,
          session: null,
        },
        error: mockError,
      };

      vi.mocked(supabase.auth.exchangeCodeForSession).mockResolvedValue(mockResponse);

      const result = await SupabaseAuthService.exchangeCodeForSession('invalid-code');

      expect(result.error).toEqual(mockError);
      expect(console.error).toHaveBeenCalledWith('Code exchange error:', mockError);
    });
  });

  describe('isEmailVerified', () => {
    it('should return true when email is confirmed', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00.000Z',
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as User },
        error: null,
      });

      const result = await SupabaseAuthService.isEmailVerified();

      expect(result).toBe(true);
    });

    it('should return false when email_confirmed_at is null', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: null,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as User },
        error: null,
      });

      const result = await SupabaseAuthService.isEmailVerified();

      expect(result).toBe(false);
    });

    it('should return false when email_confirmed_at is undefined', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: undefined,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as User },
        error: null,
      });

      const result = await SupabaseAuthService.isEmailVerified();

      expect(result).toBe(false);
    });

    it('should return false when user is null', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await SupabaseAuthService.isEmailVerified();

      expect(result).toBe(false);
    });
  });

  describe('deleteAccount', () => {
    it('should log warning about backend implementation', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as User },
        error: null,
      });

      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      await SupabaseAuthService.deleteAccount();

      expect(logger.warn).toHaveBeenCalledWith('Account deletion requires backend implementation');
    });

    it('should sign out user when deleting account', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as User },
        error: null,
      });

      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      const result = await SupabaseAuthService.deleteAccount();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('should return error when no user is logged in', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await SupabaseAuthService.deleteAccount();

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe('No user logged in');
      expect(supabase.auth.signOut).not.toHaveBeenCalled();
    });

    it('should handle sign out errors during account deletion', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockError: AuthError = {
        name: 'AuthError',
        message: 'Sign out failed',
        status: 500,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as User },
        error: null,
      });

      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: mockError });

      const result = await SupabaseAuthService.deleteAccount();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('getAuthErrorMessage', () => {
    it('should return empty string for null error', () => {
      const result = getAuthErrorMessage(null);
      expect(result).toBe('');
    });

    it('should translate "Invalid login credentials" to German', () => {
      const error: AuthError = {
        name: 'AuthError',
        message: 'Invalid login credentials',
        status: 400,
      };

      const result = getAuthErrorMessage(error);
      expect(result).toBe('Ungültige E-Mail oder Passwort');
    });

    it('should translate "Email not confirmed" to German', () => {
      const error: AuthError = {
        name: 'AuthError',
        message: 'Email not confirmed',
        status: 400,
      };

      const result = getAuthErrorMessage(error);
      expect(result).toBe('Bitte bestätigen Sie Ihre E-Mail-Adresse');
    });

    it('should translate "User already registered" to German', () => {
      const error: AuthError = {
        name: 'AuthError',
        message: 'User already registered',
        status: 400,
      };

      const result = getAuthErrorMessage(error);
      expect(result).toBe('Ein Konto mit dieser E-Mail existiert bereits');
    });

    it('should translate "Password should be at least 6 characters" to German', () => {
      const error: AuthError = {
        name: 'AuthError',
        message: 'Password should be at least 6 characters',
        status: 400,
      };

      const result = getAuthErrorMessage(error);
      expect(result).toBe('Passwort muss mindestens 6 Zeichen lang sein');
    });

    it('should translate "Signups not allowed for this instance" to German', () => {
      const error: AuthError = {
        name: 'AuthError',
        message: 'Signups not allowed for this instance',
        status: 403,
      };

      const result = getAuthErrorMessage(error);
      expect(result).toBe('Registrierungen sind derzeit nicht verfügbar');
    });

    it('should translate "Email rate limit exceeded" to German', () => {
      const error: AuthError = {
        name: 'AuthError',
        message: 'Email rate limit exceeded',
        status: 429,
      };

      const result = getAuthErrorMessage(error);
      expect(result).toBe('Zu viele E-Mails versendet. Bitte warten Sie einen Moment.');
    });

    it('should translate rate limit message to German', () => {
      const error: AuthError = {
        name: 'AuthError',
        message: 'For security purposes, you can only request this once every 60 seconds',
        status: 429,
      };

      const result = getAuthErrorMessage(error);
      expect(result).toBe('Bitte warten Sie 60 Sekunden vor dem nächsten Versuch');
    });

    it('should return error message for unknown errors', () => {
      const error: AuthError = {
        name: 'AuthError',
        message: 'Some unknown error occurred',
        status: 500,
      };

      const result = getAuthErrorMessage(error);
      expect(result).toBe('Some unknown error occurred');
    });

    it('should return default message when error has no message', () => {
      const error: AuthError = {
        name: 'AuthError',
        message: '',
        status: 500,
      };

      const result = getAuthErrorMessage(error);
      expect(result).toBe('Ein Fehler ist aufgetreten');
    });
  });
});
