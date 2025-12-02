import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStreakCalculation } from '@/modules/ui/hooks/use-streak-calculation';
import { getPracticeSessionRepository } from '@/modules/storage/factory';
import type { PracticeSession } from '@core/types/services';

// Mock the storage factory
vi.mock('@/modules/storage/factory', () => ({
  getPracticeSessionRepository: vi.fn(),
}));

describe('useStreakCalculation', () => {
  const mockGetByDateRange = vi.fn();
  const mockSessionRepo = {
    getByDateRange: mockGetByDateRange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPracticeSessionRepository).mockReturnValue(
      mockSessionRepo as ReturnType<typeof getPracticeSessionRepository>
    );
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // Helper function to create a mock completed session
  const createCompletedSession = (daysAgo: number): PracticeSession => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(12, 0, 0, 0);

    return {
      id: `session-${daysAgo}`,
      topicId: 'topic-1',
      learningPathId: 'path-1',
      execution: {
        status: 'completed',
        completedAt: date.toISOString(),
        startedAt: date.toISOString(),
      },
      results: {
        tasks: [],
      },
    } as PracticeSession;
  };

  // Initial state tests
  describe('Initial State', () => {
    it('starts with loading state', () => {
      mockGetByDateRange.mockResolvedValue([]);

      const { result } = renderHook(() => useStreakCalculation());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('initializes with zero streak values', () => {
      mockGetByDateRange.mockResolvedValue([]);

      const { result } = renderHook(() => useStreakCalculation());

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.bestStreak).toBe(0);
      expect(result.current.isStreakActive).toBe(false);
    });

    it('initializes with first milestone', () => {
      mockGetByDateRange.mockResolvedValue([]);

      const { result } = renderHook(() => useStreakCalculation());

      expect(result.current.nextMilestone).toBe(7);
      expect(result.current.progressToNextMilestone).toBe(0);
    });
  });

  // Streak calculation tests
  describe('Streak Calculation', () => {
    it('calculates streak for today only', async () => {
      const sessions = [createCompletedSession(0)]; // Today
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(1);
      expect(result.current.bestStreak).toBe(1);
      expect(result.current.isStreakActive).toBe(true);
    });

    it('calculates streak for consecutive days including today', async () => {
      const sessions = [
        createCompletedSession(0), // Today
        createCompletedSession(1), // Yesterday
        createCompletedSession(2), // 2 days ago
      ];
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(3);
      expect(result.current.bestStreak).toBe(3);
      expect(result.current.isStreakActive).toBe(true);
    });

    it('calculates streak when last session was yesterday', async () => {
      const sessions = [
        createCompletedSession(1), // Yesterday
        createCompletedSession(2), // 2 days ago
        createCompletedSession(3), // 3 days ago
      ];
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(3);
      expect(result.current.bestStreak).toBe(3);
      expect(result.current.isStreakActive).toBe(true);
    });

    it('resets streak when last session was 2+ days ago', async () => {
      const sessions = [
        createCompletedSession(2), // 2 days ago
        createCompletedSession(3), // 3 days ago
      ];
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.bestStreak).toBe(2);
      expect(result.current.isStreakActive).toBe(false);
    });

    it('handles gap in streak', async () => {
      const sessions = [
        createCompletedSession(0), // Today
        createCompletedSession(1), // Yesterday
        // Gap here
        createCompletedSession(3), // 3 days ago
        createCompletedSession(4), // 4 days ago
      ];
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(2);
      expect(result.current.bestStreak).toBe(2);
      expect(result.current.isStreakActive).toBe(true);
    });

    it('calculates best streak from historical data', async () => {
      const sessions = [
        createCompletedSession(0), // Today
        createCompletedSession(1), // Yesterday
        // Gap
        createCompletedSession(5), // 5 days ago
        createCompletedSession(6), // 6 days ago
        createCompletedSession(7), // 7 days ago
        createCompletedSession(8), // 8 days ago
      ];
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(2);
      expect(result.current.bestStreak).toBe(4); // The 4-day streak from 5-8 days ago
      expect(result.current.isStreakActive).toBe(true);
    });

    it('handles multiple sessions on same day', async () => {
      const today = new Date();
      const sessions = [
        {
          ...createCompletedSession(0),
          id: 'session-today-1',
          execution: {
            status: 'completed' as const,
            completedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
            startedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
          },
        },
        {
          ...createCompletedSession(0),
          id: 'session-today-2',
          execution: {
            status: 'completed' as const,
            completedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0).toISOString(),
            startedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0).toISOString(),
          },
        },
        createCompletedSession(1), // Yesterday
      ];
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Multiple sessions on same day should count as one day
      expect(result.current.currentStreak).toBe(2);
      expect(result.current.isStreakActive).toBe(true);
    });
  });

  // Milestone calculation tests
  describe('Milestone Calculation', () => {
    it('calculates progress to first milestone (7 days)', async () => {
      const sessions = [
        createCompletedSession(0),
        createCompletedSession(1),
        createCompletedSession(2),
      ];
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(3);
      expect(result.current.nextMilestone).toBe(7);
      // Progress: (3 - 0) / (7 - 0) * 100 = 42.86%
      expect(result.current.progressToNextMilestone).toBeCloseTo(42.86, 1);
    });

    it('calculates progress to second milestone (14 days)', async () => {
      const sessions = Array.from({ length: 10 }, (_, i) => createCompletedSession(i));
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(10);
      expect(result.current.nextMilestone).toBe(14);
      // Progress: (10 - 7) / (14 - 7) * 100 = 42.86%
      expect(result.current.progressToNextMilestone).toBeCloseTo(42.86, 1);
    });

    it('calculates progress to third milestone (30 days)', async () => {
      const sessions = Array.from({ length: 20 }, (_, i) => createCompletedSession(i));
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(20);
      expect(result.current.nextMilestone).toBe(30);
      // Progress: (20 - 14) / (30 - 14) * 100 = 37.5%
      expect(result.current.progressToNextMilestone).toBeCloseTo(37.5, 1);
    });

    it('handles reaching a milestone', async () => {
      const sessions = Array.from({ length: 7 }, (_, i) => createCompletedSession(i));
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(7);
      expect(result.current.nextMilestone).toBe(14);
      expect(result.current.progressToNextMilestone).toBe(0);
    });

    it('handles very high streaks beyond defined milestones', async () => {
      const sessions = Array.from({ length: 400 }, (_, i) => createCompletedSession(i));
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(400);
      // Next milestone should be the next 365 multiple
      expect(result.current.nextMilestone).toBe(730);
    });
  });

  // Last activity date tests
  describe('Last Activity Date', () => {
    it('sets last activity date to most recent session', async () => {
      const sessions = [
        createCompletedSession(0),
        createCompletedSession(1),
        createCompletedSession(2),
      ];
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.lastActivityDate).toBeInstanceOf(Date);
      // Should be today's date
      const today = new Date();
      expect(result.current.lastActivityDate?.getDate()).toBe(today.getDate());
    });

    it('sets last activity date to null when no sessions', async () => {
      mockGetByDateRange.mockResolvedValue([]);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.lastActivityDate).toBe(null);
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('handles repository errors', async () => {
      const error = new Error('Database connection failed');
      mockGetByDateRange.mockRejectedValue(error);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Database connection failed');
      expect(result.current.currentStreak).toBe(0);
      expect(result.current.bestStreak).toBe(0);
    });

    it('wraps non-Error objects in Error', async () => {
      mockGetByDateRange.mockRejectedValue('String error');

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Failed to calculate streak');
    });

  });

  // Filtering tests
  describe('Session Filtering', () => {
    it('ignores incomplete sessions', async () => {
      const sessions = [
        createCompletedSession(0),
        {
          ...createCompletedSession(1),
          execution: {
            status: 'in_progress' as const,
            startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      ];
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should only count today's completed session
      expect(result.current.currentStreak).toBe(1);
    });

    it('ignores sessions without completion date', async () => {
      const sessions = [
        createCompletedSession(0),
        {
          ...createCompletedSession(1),
          execution: {
            status: 'completed' as const,
            startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            completedAt: undefined as unknown as string,
          },
        },
      ];
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should only count today's completed session
      expect(result.current.currentStreak).toBe(1);
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('handles empty session array', async () => {
      mockGetByDateRange.mockResolvedValue([]);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.bestStreak).toBe(0);
      expect(result.current.lastActivityDate).toBe(null);
      expect(result.current.isStreakActive).toBe(false);
      expect(result.current.nextMilestone).toBe(7);
      expect(result.current.progressToNextMilestone).toBe(0);
    });

    it('handles very long streaks', async () => {
      // Create a 100-day streak
      const sessions = Array.from({ length: 100 }, (_, i) => createCompletedSession(i));
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(100);
      expect(result.current.bestStreak).toBe(100);
      expect(result.current.nextMilestone).toBe(180);
    });

    it('handles sessions with same timestamp', async () => {
      const sameDate = new Date();
      const sessions = [
        {
          ...createCompletedSession(0),
          id: 'session-1',
          execution: {
            status: 'completed' as const,
            completedAt: sameDate.toISOString(),
            startedAt: sameDate.toISOString(),
          },
        },
        {
          ...createCompletedSession(0),
          id: 'session-2',
          execution: {
            status: 'completed' as const,
            completedAt: sameDate.toISOString(),
            startedAt: sameDate.toISOString(),
          },
        },
      ];
      mockGetByDateRange.mockResolvedValue(sessions);

      const { result } = renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should count as single day
      expect(result.current.currentStreak).toBe(1);
    });
  });

  // Date range tests
  describe('Date Range', () => {
    it('requests sessions from last year', async () => {
      mockGetByDateRange.mockResolvedValue([]);

      renderHook(() => useStreakCalculation());

      await waitFor(() => {
        expect(mockGetByDateRange).toHaveBeenCalled();
      });

      const [startDate, endDate] = mockGetByDateRange.mock.calls[0];

      // Start date should be approximately one year ago
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      expect(startDate.getFullYear()).toBe(oneYearAgo.getFullYear());
      expect(endDate.getFullYear()).toBe(new Date().getFullYear());
    });
  });
});
