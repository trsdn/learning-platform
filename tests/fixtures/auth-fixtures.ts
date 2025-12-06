/**
 * Shared Test Fixtures for Authentication
 *
 * Factory functions for creating mock User, Session, AuthError, and AuthResponse objects.
 * Use these instead of duplicating mock data across test files.
 *
 * @example
 * import { createMockUser, createMockAuthResponse } from '@tests/fixtures';
 *
 * const user = createMockUser({ email: 'custom@example.com' });
 * const response = createMockAuthResponse({ error: createMockAuthError() });
 */

import type {
  User,
  Session,
  AuthError,
  AuthResponse,
  OAuthResponse,
  UserMetadata,
} from '@supabase/supabase-js';

/**
 * Create mock user metadata
 */
export function createMockUserMetadata(overrides: Partial<UserMetadata> = {}): UserMetadata {
  return {
    display_name: 'Test User',
    avatar_url: 'https://example.com/avatar.png',
    ...overrides,
  };
}

/**
 * Create a mock User with optional overrides
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    phone: '',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: createMockUserMetadata(),
    aud: 'authenticated',
    role: 'authenticated',
    ...overrides,
  } as User;
}

/**
 * Create a mock Session with optional overrides
 */
export function createMockSession(overrides: Partial<Session> = {}): Session {
  const user = createMockUser(overrides.user ? overrides.user as Partial<User> : {});
  return {
    access_token: 'mock-access-token-12345',
    refresh_token: 'mock-refresh-token-67890',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
    ...overrides,
    // Ensure user is properly set even if overrides has user
    ...(overrides.user ? { user: { ...user, ...overrides.user } } : {}),
  } as Session;
}

/**
 * Create a mock AuthError with optional overrides
 */
export function createMockAuthError(
  message: string = 'Authentication failed',
  status: number = 401,
  code: string = 'auth_error'
): AuthError {
  return {
    message,
    status,
    name: 'AuthError',
    code,
    __isAuthError: true,
  } as AuthError;
}

/**
 * Create a successful AuthResponse
 */
export function createMockAuthResponse(overrides: {
  user?: Partial<User> | null;
  session?: Partial<Session> | null;
  error?: AuthError | null;
} = {}): AuthResponse {
  const { user, session, error } = overrides;

  if (error) {
    return {
      data: { user: null, session: null },
      error,
    };
  }

  return {
    data: {
      user: user === null ? null : createMockUser(user || {}),
      session: session === null ? null : createMockSession(session || {}),
    },
    error: null,
  };
}

/**
 * Create a successful signup response (no session yet - email confirmation pending)
 */
export function createMockSignupResponse(userOverrides: Partial<User> = {}): AuthResponse {
  return createMockAuthResponse({
    user: userOverrides,
    session: null,
  });
}

/**
 * Create an error AuthResponse
 */
export function createMockAuthErrorResponse(
  message: string = 'Authentication failed',
  status: number = 401,
  code: string = 'auth_error'
): AuthResponse {
  return createMockAuthResponse({
    error: createMockAuthError(message, status, code),
  });
}

/**
 * Create a mock OAuthResponse for OAuth sign-in
 */
export function createMockOAuthResponse(
  url: string = 'https://accounts.google.com/oauth/authorize',
  provider: string = 'google'
): OAuthResponse {
  return {
    data: {
      url,
      provider: provider as 'google' | 'github' | 'azure',
    },
    error: null,
  };
}

/**
 * Create a mock OAuthResponse with error
 */
export function createMockOAuthErrorResponse(
  message: string = 'OAuth failed',
  status: number = 400
): OAuthResponse {
  return {
    data: { url: null, provider: 'google' as const },
    error: createMockAuthError(message, status, 'oauth_error'),
  };
}

/**
 * Common auth error scenarios
 */
export const authErrors = {
  invalidCredentials: createMockAuthError(
    'Invalid login credentials',
    400,
    'invalid_credentials'
  ),
  emailNotConfirmed: createMockAuthError(
    'Email not confirmed',
    400,
    'email_not_confirmed'
  ),
  userNotFound: createMockAuthError(
    'User not found',
    404,
    'user_not_found'
  ),
  sessionExpired: createMockAuthError(
    'Session has expired',
    401,
    'session_expired'
  ),
  rateLimited: createMockAuthError(
    'Too many requests',
    429,
    'rate_limit_exceeded'
  ),
  weakPassword: createMockAuthError(
    'Password should be at least 6 characters',
    400,
    'weak_password'
  ),
  emailAlreadyRegistered: createMockAuthError(
    'User already registered',
    400,
    'user_already_exists'
  ),
  invalidEmail: createMockAuthError(
    'Invalid email format',
    400,
    'invalid_email'
  ),
};

/**
 * Pre-built fixture sets for common scenarios
 */
export const authFixtures = {
  // Users
  user: createMockUser(),
  unconfirmedUser: createMockUser({
    email_confirmed_at: undefined,
  }),
  adminUser: createMockUser({
    id: 'admin-123',
    email: 'admin@example.com',
    user_metadata: createMockUserMetadata({ display_name: 'Admin User' }),
    role: 'service_role',
  }),

  // Sessions
  session: createMockSession(),
  expiredSession: createMockSession({
    expires_at: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
  }),

  // Responses
  successResponse: createMockAuthResponse(),
  signupResponse: createMockSignupResponse(),
  errorResponse: createMockAuthErrorResponse(),

  // OAuth
  googleOAuth: createMockOAuthResponse('https://accounts.google.com/oauth', 'google'),
  githubOAuth: createMockOAuthResponse('https://github.com/login/oauth', 'github'),
};

/**
 * Test credentials (marked for allowlist)
 */
export const testCredentials = {
  validEmail: 'test@example.com',
  validPassword: 'password123', // pragma: allowlist secret
  weakPassword: '123', // pragma: allowlist secret
  invalidEmail: 'not-an-email',
};
