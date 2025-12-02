import { useState, useEffect, useCallback } from 'react';
import { getPracticeSessionRepository } from '@/modules/storage/factory';
import type { PracticeSession } from '@core/types/services';

/**
 * Streak milestone values
 */
export const STREAK_MILESTONES = [7, 14, 30, 60, 100, 180, 365] as const;

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
 * Calculate the start of a day (midnight) for a given date
 */
function getDateKey(date: Date): string {
  const isoString = date.toISOString();
  const datePart = isoString.split('T')[0];
  return datePart ?? isoString.substring(0, 10);
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
  // Filter only completed sessions with completion dates
  const completedSessions = sessions
    .filter((s) => s.execution.status === 'completed' && s.execution.completedAt)
    .sort(
      (a, b) =>
        new Date(b.execution.completedAt!).getTime() -
        new Date(a.execution.completedAt!).getTime()
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
    completedSessions.map((s) => getDateKey(new Date(s.execution.completedAt!)))
  )].sort().reverse();

  const today = getDateKey(new Date());
  const yesterday = getDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = uniqueDates[0] === today ? today : yesterday;

  // Only start counting if the last session was today or yesterday
  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
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
  let prevDate = uniqueDates[0]!; // Safe: we checked completedSessions.length > 0

  for (let i = 1; i < uniqueDates.length; i++) {
    const currDate = uniqueDates[i]!;
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

  const firstSession = completedSessions[0]!;
  const lastActivityDate = new Date(firstSession.execution.completedAt!);
  const firstDate = uniqueDates[0]!;
  const isStreakActive = firstDate === today || firstDate === yesterday;

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
 * @example
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
        if (STREAK_MILESTONES[i] === nextMilestone && i > 0) {
          prevMilestone = STREAK_MILESTONES[i - 1]!;
          break;
        }
      }
      // If past all milestones, calculate based on 365-day cycles
      if (currentStreak >= STREAK_MILESTONES[STREAK_MILESTONES.length - 1]!) {
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
