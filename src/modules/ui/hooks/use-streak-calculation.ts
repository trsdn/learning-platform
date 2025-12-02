import { useState, useEffect, useCallback } from 'react';
import { getPracticeSessionRepository } from '@/modules/storage/factory';
import type { PracticeSession } from '@core/types/services';

/**
 * Streak milestone values
 */
export const STREAK_MILESTONES = [7, 14, 30, 60, 100, 180, 365] as const;

/**
 * Type predicate to narrow PracticeSession to one with completedAt
 */
function hasCompletedAt(
  session: PracticeSession
): session is PracticeSession & {
  execution: { completedAt: NonNullable<PracticeSession['execution']['completedAt']> };
} {
  return session.execution.status === 'completed' && session.execution.completedAt != null;
}

export interface StreakData {
  /**
   * Current consecutive days with completed sessions
   */
  currentStreak: number;
  /**
   * Best streak achieved
   */
  bestStreak: number;
  /**
   * Date of last completed session
   */
  lastActivityDate: Date | null;
  /**
   * Whether the streak is still active (session completed today or yesterday)
   */
  isStreakActive: boolean;
  /**
   * Next milestone to reach
   */
  nextMilestone: number;
  /**
   * Progress towards next milestone (0-100)
   */
  progressToNextMilestone: number;
  /**
   * Whether data is still loading
   */
  isLoading: boolean;
  /**
   * Error if loading failed
   */
  error: Error | null;
}

/**
 * Calculate the start of a day (midnight) for a given date.
 * Uses local date components to respect user's timezone.
 */
function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the next milestone after the current streak
 */
function getNextMilestone(currentStreak: number): number {
  for (const milestone of STREAK_MILESTONES) {
    if (milestone > currentStreak) {
      return milestone;
    }
  }
  // If past all milestones, return next 365 multiple
  return Math.ceil((currentStreak + 1) / 365) * 365;
}

/**
 * Calculate streak from completed sessions
 */
function calculateStreakFromSessions(sessions: PracticeSession[]): {
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: Date | null;
  isStreakActive: boolean;
} {
  // Filter only completed sessions with completion dates using type predicate
  const completedSessions = sessions
    .filter(hasCompletedAt)
    .sort(
      (a, b) =>
        new Date(b.execution.completedAt).getTime() -
        new Date(a.execution.completedAt).getTime()
    );

  if (completedSessions.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastActivityDate: null,
      isStreakActive: false,
    };
  }

  // Get unique dates (one session per day counts)
  const uniqueDates = [...new Set(
    completedSessions.map((s) => getDateKey(new Date(s.execution.completedAt)))
  )].sort().reverse();

  const today = getDateKey(new Date());
  const yesterday = getDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

  // Calculate current streak
  let currentStreak = 0;
  const mostRecentDate = uniqueDates[0];
  // Guard: uniqueDates has at least one element since completedSessions.length > 0
  if (!mostRecentDate) {
    return { currentStreak: 0, bestStreak: 0, lastActivityDate: null, isStreakActive: false };
  }
  let checkDate = mostRecentDate === today ? today : yesterday;

  // Only start counting if the last session was today or yesterday
  if (mostRecentDate === today || mostRecentDate === yesterday) {
    for (const dateStr of uniqueDates) {
      if (dateStr === checkDate) {
        currentStreak++;
        // Move to previous day
        const date = new Date(checkDate);
        date.setDate(date.getDate() - 1);
        checkDate = getDateKey(date);
      } else if (dateStr < checkDate) {
        // Gap in streak, stop counting
        break;
      }
    }
  }

  // Calculate best streak (scan through all dates)
  let bestStreak = currentStreak;
  let tempStreak = 1;
  const firstUniqueDate = uniqueDates[0];
  // Guard: uniqueDates has at least one element since completedSessions.length > 0
  if (!firstUniqueDate) {
    return { currentStreak: 0, bestStreak: 0, lastActivityDate: null, isStreakActive: false };
  }
  let prevDate = firstUniqueDate;

  for (let i = 1; i < uniqueDates.length; i++) {
    const currDate = uniqueDates[i];
    if (!currDate) continue;

    const prevDateObj = new Date(prevDate);
    prevDateObj.setDate(prevDateObj.getDate() - 1);
    const expectedPrev = getDateKey(prevDateObj);

    if (currDate === expectedPrev) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
    prevDate = currDate;
  }

  const firstSession = completedSessions[0];
  // Guard: completedSessions has at least one element (checked above)
  if (!firstSession || !firstSession.execution.completedAt) {
    return { currentStreak: 0, bestStreak: 0, lastActivityDate: null, isStreakActive: false };
  }
  const lastActivityDate = new Date(firstSession.execution.completedAt);
  const isStreakActive = firstUniqueDate === today || firstUniqueDate === yesterday;

  return {
    currentStreak,
    bestStreak,
    lastActivityDate,
    isStreakActive,
  };
}

/**
 * Hook to calculate and track user's learning streak
 *
 * @example Basic usage
 * ```tsx
 * const { currentStreak, nextMilestone, progressToNextMilestone } = useStreakCalculation();
 *
 * return (
 *   <div>
 *     <p>🔥 {currentStreak} Tage Streak</p>
 *     <ProgressBar value={progressToNextMilestone} />
 *     <p>Noch {nextMilestone - currentStreak} Tage bis {nextMilestone} Tage!</p>
 *   </div>
 * );
 * ```
 *
 * @example With error handling
 * ```tsx
 * const { currentStreak, isLoading, error } = useStreakCalculation();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return <StreakDisplay currentStreak={currentStreak} />;
 * ```
 */
export function useStreakCalculation(): StreakData {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    bestStreak: 0,
    lastActivityDate: null,
    isStreakActive: false,
    nextMilestone: STREAK_MILESTONES[0],
    progressToNextMilestone: 0,
    isLoading: true,
    error: null,
  });

  const calculateStreak = useCallback(async () => {
    try {
      setStreakData((prev) => ({ ...prev, isLoading: true, error: null }));

      const sessionRepo = getPracticeSessionRepository();
      // Get sessions from the last year for streak calculation
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const sessions = await sessionRepo.getByDateRange(oneYearAgo, new Date());

      const { currentStreak, bestStreak, lastActivityDate, isStreakActive } =
        calculateStreakFromSessions(sessions);

      const nextMilestone = getNextMilestone(currentStreak);
      // Find previous milestone
      let prevMilestone = 0;
      for (let i = 0; i < STREAK_MILESTONES.length; i++) {
        const milestone = STREAK_MILESTONES[i];
        const previousMilestone = i > 0 ? STREAK_MILESTONES[i - 1] : undefined;
        if (milestone === nextMilestone && previousMilestone !== undefined) {
          prevMilestone = previousMilestone;
          break;
        }
      }
      // If past all milestones, calculate based on 365-day cycles
      const lastMilestone = STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
      if (lastMilestone !== undefined && currentStreak >= lastMilestone) {
        prevMilestone = Math.floor(currentStreak / 365) * 365;
      }

      const progressToNextMilestone =
        nextMilestone > prevMilestone
          ? ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100
          : 0;

      setStreakData({
        currentStreak,
        bestStreak,
        lastActivityDate,
        isStreakActive,
        nextMilestone,
        progressToNextMilestone,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setStreakData((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Failed to calculate streak'),
      }));
    }
  }, []);

  useEffect(() => {
    calculateStreak();
  }, [calculateStreak]);

  return streakData;
}

export default useStreakCalculation;
