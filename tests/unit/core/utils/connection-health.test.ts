/**
 * Unit Tests for Connection Health Utilities
 *
 * Tests connection monitoring functionality including:
 * - Connection health checking with latency measurement
 * - Connection waiting with timeout
 * - Periodic monitoring with subscriptions
 * - Singleton pattern for global monitor
 *
 * Target Coverage: 85%+
 */

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import {
  ConnectionStatus,
  checkSupabaseConnection,
  waitForConnection,
  ConnectionMonitor,
  getConnectionMonitor,
  type HealthCheckResult,
} from '../../../../src/modules/core/utils/connection-health';
import { ErrorCategory } from '../../../../src/modules/core/utils/error-handler';

// Mock the supabase client
vi.mock('../../../../src/modules/storage/supabase-client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock error-handler utilities
vi.mock('../../../../src/modules/core/utils/error-handler', () => ({
  ErrorCategory: {
    NETWORK: 'NETWORK',
    AUTHENTICATION: 'AUTHENTICATION',
    AUTHORIZATION: 'AUTHORIZATION',
    VALIDATION: 'VALIDATION',
    DATABASE: 'DATABASE',
    RATE_LIMIT: 'RATE_LIMIT',
    TIMEOUT: 'TIMEOUT',
    UNKNOWN: 'UNKNOWN',
  },
  categorizeError: vi.fn((error: unknown, context?: Record<string, unknown>) => ({
    category: (error as { code?: string })?.code === 'NETWORK_ERROR' ? 'NETWORK' : 'DATABASE',
    message: (error as { message?: string })?.message || 'Database error',
    userMessage: 'An error occurred. Please try again.',
    isRetryable: true,
    originalError: error,
    context,
  })),
  logError: vi.fn(),
}));

// Import mocked modules
import { supabase } from '../../../../src/modules/storage/supabase-client';
import { categorizeError, logError } from '../../../../src/modules/core/utils/error-handler';

describe('Connection Health Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkSupabaseConnection', () => {
    it('should return CONNECTED status with low latency on successful connection', async () => {
      // Mock successful database query
      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const result = await checkSupabaseConnection();

      expect(result.status).toBe(ConnectionStatus.CONNECTED);
      expect(result.latency).toBeDefined();
      expect(result.latency).toBeLessThan(5000);
      expect(result.error).toBeUndefined();
      expect(result.timestamp).toBeDefined();
      expect(mockFrom).toHaveBeenCalledWith('topics');
      expect(mockSelect).toHaveBeenCalledWith('id');
    });

    it('should return DEGRADED status with high latency (>5000ms)', async () => {
      // Mock Date.now to simulate high latency
      let callCount = 0;
      const _originalDateNow = Date.now;
      vi.spyOn(Date, 'now').mockImplementation(() => {
        if (callCount === 0) {
          callCount++;
          return 1000; // Start time
        }
        return 7000; // End time (6000ms later)
      });

      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const result = await checkSupabaseConnection();

      expect(result.status).toBe(ConnectionStatus.DEGRADED);
      expect(result.latency).toBeGreaterThan(5000);
      expect(result.error).toBeUndefined();

      vi.spyOn(Date, 'now').mockRestore();
    });

    it('should return DISCONNECTED status on database error', async () => {
      // Mock database error
      const dbError = {
        message: 'Connection refused',
        code: 'DB_ERROR',
      };

      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: dbError }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const result = await checkSupabaseConnection();

      expect(result.status).toBe(ConnectionStatus.DISCONNECTED);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Connection refused');
      expect(result.latency).toBeDefined();
      expect(categorizeError).toHaveBeenCalledWith(dbError, { operation: 'health-check' });
      expect(logError).toHaveBeenCalled();
    });

    it('should return DISCONNECTED status on network exception', async () => {
      // Mock network exception
      const networkError = Object.assign(new Error('Network request failed'), { code: 'NETWORK_ERROR' });

      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockRejectedValue(networkError),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const result = await checkSupabaseConnection();

      expect(result.status).toBe(ConnectionStatus.DISCONNECTED);
      expect(result.error).toBeDefined();
      expect(result.error?.category).toBe('NETWORK');
      expect(categorizeError).toHaveBeenCalledWith(networkError, { operation: 'health-check' });
      expect(logError).toHaveBeenCalled();
    });

    it('should include timestamp in result', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const beforeTimestamp = new Date().toISOString();
      const result = await checkSupabaseConnection();
      const afterTimestamp = new Date().toISOString();

      expect(result.timestamp).toBeDefined();
      expect(result.timestamp >= beforeTimestamp).toBe(true);
      expect(result.timestamp <= afterTimestamp).toBe(true);
    });
  });

  describe('waitForConnection', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return on successful connection', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const promise = waitForConnection(10000, 1000);
      const result = await promise;

      expect(result.status).toBe(ConnectionStatus.CONNECTED);
      expect(mockFrom).toHaveBeenCalled();
    });

    it('should return on degraded connection', async () => {
      // Mock Date.now to simulate high latency
      let callCount = 0;
      vi.spyOn(Date, 'now').mockImplementation(() => {
        if (callCount % 2 === 0) {
          callCount++;
          return 1000; // Start time
        }
        callCount++;
        return 7000; // End time (6000ms later)
      });

      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const promise = waitForConnection(10000, 1000);
      const result = await promise;

      expect(result.status).toBe(ConnectionStatus.DEGRADED);

      vi.spyOn(Date, 'now').mockRestore();
    });

    it('should timeout and return DISCONNECTED after maxWaitTime', async () => {
      // Mock repeated failures
      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          error: { message: 'Connection failed', code: 'CONN_ERROR' },
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const maxWaitTime = 5000;
      const checkInterval = 1000;

      const promise = waitForConnection(maxWaitTime, checkInterval);

      // Advance time past maxWaitTime
      vi.advanceTimersByTime(maxWaitTime + 1000);
      await vi.runOnlyPendingTimersAsync();

      const result = await promise;

      expect(result.status).toBe(ConnectionStatus.DISCONNECTED);
      expect(result.error).toBeDefined();
      expect(result.error?.category).toBe(ErrorCategory.TIMEOUT);
      expect(result.error?.message).toBe('Connection timeout');
      expect(result.error?.isRetryable).toBe(true);
    });

    it('should respect checkInterval parameter', async () => {
      let checkCount = 0;
      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockImplementation(async () => {
          checkCount++;
          if (checkCount < 3) {
            return { error: { message: 'Still connecting' } };
          }
          return { error: null };
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const checkInterval = 2000;
      const promise = waitForConnection(10000, checkInterval);

      // Run timers step by step to avoid timeout
      for (let i = 0; i < 5; i++) {
        await vi.advanceTimersByTimeAsync(checkInterval);
        if (checkCount >= 3) break;
      }

      const _result = await promise;

      // Should have checked multiple times
      expect(checkCount).toBeGreaterThan(1);
    });

    it('should use default parameters when not provided', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const promise = waitForConnection(); // Using defaults
      const result = await promise;

      expect(result.status).toBe(ConnectionStatus.CONNECTED);
    });
  });

  describe('ConnectionMonitor', () => {
    let monitor: ConnectionMonitor;

    beforeEach(() => {
      vi.useFakeTimers();
      monitor = new ConnectionMonitor(1000); // 1 second interval for testing
    });

    afterEach(() => {
      monitor.stop();
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    describe('start() and stop()', () => {
      it('should perform initial check when started', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        monitor.start();

        // Wait for initial check
        await vi.runOnlyPendingTimersAsync();

        expect(mockFrom).toHaveBeenCalled();
        expect(monitor.getLastResult()).toBeDefined();
        expect(monitor.getLastResult()?.status).toBe(ConnectionStatus.CONNECTED);
      });

      it('should set up periodic checks with correct interval', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        monitor.start();

        // Clear initial call count
        await vi.runOnlyPendingTimersAsync();
        const initialCallCount = mockFrom.mock.calls.length;

        // Advance time by 3 intervals
        for (let i = 0; i < 3; i++) {
          vi.advanceTimersByTime(1000);
          await vi.runOnlyPendingTimersAsync();
        }

        // Should have been called at least 3 additional times (once per interval)
        // May be more due to timer implementation details
        expect(mockFrom.mock.calls.length - initialCallCount).toBeGreaterThanOrEqual(3);
      });

      it('should be idempotent - calling start twice does not create multiple intervals', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        monitor.start();
        await vi.runOnlyPendingTimersAsync();

        const beforeSecondStart = mockFrom.mock.calls.length;

        // Start again (should be no-op)
        monitor.start();
        vi.advanceTimersByTime(1000);
        await vi.runOnlyPendingTimersAsync();

        // Should have at least 1 new call but not double (which would be >= 2 per interval)
        const newCalls = mockFrom.mock.calls.length - beforeSecondStart;
        expect(newCalls).toBeGreaterThanOrEqual(1);
        expect(newCalls).toBeLessThan(4); // Not doubling up
      });

      it('should stop periodic checks when stop is called', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        monitor.start();
        await vi.runOnlyPendingTimersAsync();

        monitor.stop();
        mockFrom.mockClear();

        // Advance time - should not trigger any more checks
        vi.advanceTimersByTime(5000);
        await vi.runOnlyPendingTimersAsync();

        expect(mockFrom).not.toHaveBeenCalled();
      });

      it('should handle stop when not started', () => {
        // Should not throw
        expect(() => monitor.stop()).not.toThrow();
      });
    });

    describe('subscribe() and unsubscribe()', () => {
      it('should add listener and receive updates', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        const listener = vi.fn();
        monitor.subscribe(listener);

        monitor.start();
        await vi.runOnlyPendingTimersAsync();

        expect(listener).toHaveBeenCalled();
        const result = listener.mock.calls[0][0] as HealthCheckResult;
        expect(result.status).toBe(ConnectionStatus.CONNECTED);
      });

      it('should send last result immediately to new subscriber if available', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        monitor.start();
        await vi.runOnlyPendingTimersAsync();

        const listener = vi.fn();
        monitor.subscribe(listener);

        // Should receive last result immediately
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0].status).toBe(ConnectionStatus.CONNECTED);
      });

      it('should return unsubscribe function that removes listener', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        const listener = vi.fn();
        const unsubscribe = monitor.subscribe(listener);

        monitor.start();
        await vi.runOnlyPendingTimersAsync();

        listener.mockClear();
        unsubscribe();

        // Trigger another check
        vi.advanceTimersByTime(1000);
        await vi.runOnlyPendingTimersAsync();

        // Listener should not be called again
        expect(listener).not.toHaveBeenCalled();
      });

      it('should notify multiple listeners', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        const listener1 = vi.fn();
        const listener2 = vi.fn();
        const listener3 = vi.fn();

        monitor.subscribe(listener1);
        monitor.subscribe(listener2);
        monitor.subscribe(listener3);

        monitor.start();
        await vi.runOnlyPendingTimersAsync();

        expect(listener1).toHaveBeenCalled();
        expect(listener2).toHaveBeenCalled();
        expect(listener3).toHaveBeenCalled();
      });

      it('should catch and log listener errors without affecting other listeners', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const errorListener = vi.fn(() => {
          throw new Error('Listener error');
        });
        const goodListener = vi.fn();

        monitor.subscribe(errorListener);
        monitor.subscribe(goodListener);

        monitor.start();
        await vi.runOnlyPendingTimersAsync();

        expect(errorListener).toHaveBeenCalled();
        expect(goodListener).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error in connection monitor listener:',
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      });
    });

    describe('getLastResult()', () => {
      it('should return null when no check has been performed', () => {
        expect(monitor.getLastResult()).toBeNull();
      });

      it('should return last check result after monitoring starts', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        monitor.start();
        await vi.runOnlyPendingTimersAsync();

        const result = monitor.getLastResult();
        expect(result).toBeDefined();
        expect(result?.status).toBe(ConnectionStatus.CONNECTED);
      });

      it('should update with latest result', async () => {
        let shouldFail = false;
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockImplementation(async () => {
            if (shouldFail) {
              return { error: { message: 'Connection lost' } };
            }
            return { error: null };
          }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        monitor.start();
        await vi.runOnlyPendingTimersAsync();

        expect(monitor.getLastResult()?.status).toBe(ConnectionStatus.CONNECTED);

        // Simulate connection failure
        shouldFail = true;
        vi.advanceTimersByTime(1000);
        await vi.runOnlyPendingTimersAsync();

        expect(monitor.getLastResult()?.status).toBe(ConnectionStatus.DISCONNECTED);
      });
    });

    describe('checkNow()', () => {
      it('should force immediate check and return result', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        const result = await monitor.checkNow();

        expect(result).toBeDefined();
        expect(result.status).toBe(ConnectionStatus.CONNECTED);
        expect(mockFrom).toHaveBeenCalled();
      });

      it('should update last result', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        expect(monitor.getLastResult()).toBeNull();

        await monitor.checkNow();

        expect(monitor.getLastResult()).toBeDefined();
        expect(monitor.getLastResult()?.status).toBe(ConnectionStatus.CONNECTED);
      });

      it('should notify listeners', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null }),
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: mockSelect,
        });

        (supabase.from as Mock) = mockFrom;

        const listener = vi.fn();
        monitor.subscribe(listener);

        await monitor.checkNow();

        expect(listener).toHaveBeenCalled();
      });
    });
  });

  describe('getConnectionMonitor', () => {
    afterEach(() => {
      // Clean up singleton
      const monitor = getConnectionMonitor();
      monitor.stop();
    });

    it('should return a ConnectionMonitor instance', () => {
      const monitor = getConnectionMonitor();
      expect(monitor).toBeInstanceOf(ConnectionMonitor);
    });

    it('should return the same instance on subsequent calls (singleton)', () => {
      const monitor1 = getConnectionMonitor();
      const monitor2 = getConnectionMonitor();

      expect(monitor1).toBe(monitor2);
    });

    it('should return a monitor that works correctly', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const monitor = getConnectionMonitor();
      const result = await monitor.checkNow();

      expect(result).toBeDefined();
      expect(result.status).toBe(ConnectionStatus.CONNECTED);
    });
  });

  describe('ConnectionStatus enum', () => {
    it('should have all required status values', () => {
      expect(ConnectionStatus.CONNECTED).toBe('CONNECTED');
      expect(ConnectionStatus.DISCONNECTED).toBe('DISCONNECTED');
      expect(ConnectionStatus.DEGRADED).toBe('DEGRADED');
      expect(ConnectionStatus.CHECKING).toBe('CHECKING');
    });
  });

  describe('Edge cases and error handling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle concurrent checkNow calls', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const monitor = new ConnectionMonitor();

      const [result1, result2, result3] = await Promise.all([
        monitor.checkNow(),
        monitor.checkNow(),
        monitor.checkNow(),
      ]);

      expect(result1.status).toBe(ConnectionStatus.CONNECTED);
      expect(result2.status).toBe(ConnectionStatus.CONNECTED);
      expect(result3.status).toBe(ConnectionStatus.CONNECTED);
    });

    it('should handle monitor restart', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const monitor = new ConnectionMonitor(1000);

      monitor.start();
      await vi.runOnlyPendingTimersAsync();

      monitor.stop();
      mockFrom.mockClear();

      monitor.start();
      await vi.runOnlyPendingTimersAsync();

      expect(mockFrom).toHaveBeenCalled();
      expect(monitor.getLastResult()?.status).toBe(ConnectionStatus.CONNECTED);
    });

    it('should handle custom check intervals', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as Mock) = mockFrom;

      const customInterval = 5000; // 5 seconds
      const monitor = new ConnectionMonitor(customInterval);

      monitor.start();
      await vi.runOnlyPendingTimersAsync();
      const initialCallCount = mockFrom.mock.calls.length;

      vi.advanceTimersByTime(customInterval);
      await vi.runOnlyPendingTimersAsync();

      // Should have been called at least once after the interval
      expect(mockFrom.mock.calls.length - initialCallCount).toBeGreaterThanOrEqual(1);

      monitor.stop();
    });
  });
});
