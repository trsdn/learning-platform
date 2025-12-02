import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import '../../../../setup/a11y-matchers';
import { StreakDisplay } from '@/modules/ui/components/common/StreakDisplay';

describe('StreakDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering tests
  describe('Rendering', () => {
    it('renders with required props', () => {
      render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
        />
      );

      expect(screen.getByText('5 Tage')).toBeInTheDocument();
      expect(screen.getByText('Tagesstreak')).toBeInTheDocument();
    });

    it('shows current streak with singular form for 1 day', () => {
      render(
        <StreakDisplay currentStreak={1} bestStreak={5} nextMilestone={7} progressToMilestone={14} />
      );

      expect(screen.getByText('1 Tag')).toBeInTheDocument();
    });

    it('shows current streak with plural form for multiple days', () => {
      render(
        <StreakDisplay
          currentStreak={15}
          bestStreak={20}
          nextMilestone={30}
          progressToMilestone={50}
        />
      );

      expect(screen.getByText('15 Tage')).toBeInTheDocument();
    });

    it('shows best streak when higher than current', () => {
      render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={20}
          nextMilestone={7}
          progressToMilestone={71}
        />
      );

      expect(screen.getByText(/Bester: 20 Tage/)).toBeInTheDocument();
    });

    it('does not show best streak when equal to current', () => {
      render(
        <StreakDisplay
          currentStreak={20}
          bestStreak={20}
          nextMilestone={30}
          progressToMilestone={0}
        />
      );

      expect(screen.queryByText(/Bester:/)).not.toBeInTheDocument();
    });

    it('does not show best streak when lower than current', () => {
      render(
        <StreakDisplay
          currentStreak={25}
          bestStreak={20}
          nextMilestone={30}
          progressToMilestone={50}
        />
      );

      expect(screen.queryByText(/Bester:/)).not.toBeInTheDocument();
    });
  });

  // Milestone progress tests
  describe('Milestone Progress', () => {
    it('shows milestone progress by default', () => {
      const { container } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          showMilestoneProgress
        />
      );

      const progress = container.querySelector('[class*="circular-progress"]');
      expect(progress).toBeInTheDocument();
    });

    it('hides milestone progress when showMilestoneProgress is false', () => {
      const { container } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          showMilestoneProgress={false}
        />
      );

      const progress = container.querySelector('[class*="circular-progress"]');
      expect(progress).not.toBeInTheDocument();
    });

    it('shows days until milestone with singular form', () => {
      render(
        <StreakDisplay
          currentStreak={6}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={86}
          showMilestoneProgress
        />
      );

      expect(screen.getByText(/Noch 1 Tag bis 7 Tage!/)).toBeInTheDocument();
    });

    it('shows days until milestone with plural form', () => {
      render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          showMilestoneProgress
        />
      );

      expect(screen.getByText(/Noch 2 Tage bis 7 Tage!/)).toBeInTheDocument();
    });

    it('does not show milestone text when milestone is reached', () => {
      render(
        <StreakDisplay
          currentStreak={7}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={100}
          showMilestoneProgress
        />
      );

      expect(screen.queryByText(/Noch.*bis/)).not.toBeInTheDocument();
    });
  });

  // Streak active state tests
  describe('Streak Active State', () => {
    it('renders as active by default', () => {
      const { container } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          isStreakActive
        />
      );

      const display = container.querySelector('[class*="streak-display"]');
      expect(display?.className).not.toContain('inactive');
    });

    it('renders as inactive when isStreakActive is false', () => {
      const { container } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          isStreakActive={false}
        />
      );

      const display = container.querySelector('[class*="streak-display"]');
      expect(display?.className).toContain('inactive');
    });

    it('shows inactive message for zero streak', () => {
      render(
        <StreakDisplay
          currentStreak={0}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={0}
          isStreakActive={false}
        />
      );

      expect(screen.getByText('Starte heute deinen Streak!')).toBeInTheDocument();
    });

    it('shows continue message for inactive streak with progress', () => {
      render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          isStreakActive={false}
        />
      );

      expect(screen.getByText('Lerne heute um deinen Streak fortzusetzen!')).toBeInTheDocument();
    });

    it('does not show inactive messages when streak is active', () => {
      render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          isStreakActive={true}
        />
      );

      expect(screen.queryByText(/Starte heute/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Lerne heute/)).not.toBeInTheDocument();
    });
  });

  // Size tests
  describe('Sizes', () => {
    it('renders compact size', () => {
      const { container } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          size="compact"
        />
      );

      const display = container.querySelector('[class*="streak-display"]');
      expect(display?.className).toContain('compact');
    });

    it('renders standard size (default)', () => {
      const { container } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          size="standard"
        />
      );

      const display = container.querySelector('[class*="streak-display"]');
      expect(display?.className).toContain('standard');
    });

    it('renders large size', () => {
      const { container } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          size="large"
        />
      );

      const display = container.querySelector('[class*="streak-display"]');
      expect(display?.className).toContain('large');
    });
  });

  // Fire emoji animation tests
  describe('Fire Emoji', () => {
    it('renders fire emoji', () => {
      render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
        />
      );

      expect(screen.getByText('🔥')).toBeInTheDocument();
    });

    it('renders fire emoji inside circular progress when showing milestone', () => {
      render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          showMilestoneProgress
        />
      );

      const fire = screen.getByText('🔥');
      expect(fire.className).toMatch(/streak-display__fire/);
    });

    it('renders larger fire emoji when not showing milestone progress', () => {
      render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          showMilestoneProgress={false}
        />
      );

      const fire = screen.getByText('🔥');
      expect(fire.className).toMatch(/streak-display__fire-large/);
    });
  });

  // Custom styling tests
  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          className="custom-class"
        />
      );

      const display = container.querySelector('[class*="streak-display"]');
      expect(display?.className).toContain('custom-class');
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('has no WCAG violations', async () => {
      const { container } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with inactive state', async () => {
      const { container } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          isStreakActive={false}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with zero streak', async () => {
      const { container } = render(
        <StreakDisplay
          currentStreak={0}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={0}
          isStreakActive={false}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations without milestone progress', async () => {
      const { container } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          showMilestoneProgress={false}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with all sizes', async () => {
      const { container } = render(
        <div>
          <StreakDisplay
            currentStreak={5}
            bestStreak={10}
            nextMilestone={7}
            progressToMilestone={71}
            size="compact"
          />
          <StreakDisplay
            currentStreak={5}
            bestStreak={10}
            nextMilestone={7}
            progressToMilestone={71}
            size="standard"
          />
          <StreakDisplay
            currentStreak={5}
            bestStreak={10}
            nextMilestone={7}
            progressToMilestone={71}
            size="large"
          />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // Reduced motion tests
  describe('Reduced Motion', () => {
    it('respects prefers-reduced-motion', () => {
      // Mock useReducedMotion hook
      vi.mock('framer-motion', async () => {
        const actual = await vi.importActual('framer-motion');
        return {
          ...actual,
          useReducedMotion: () => true,
        };
      });

      const { container } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
        />
      );
      const display = container.querySelector('[class*="streak-display"]');
      expect(display).toBeInTheDocument();
    });
  });

  // Integration tests
  describe('Integration', () => {
    it('updates display when streak increases', () => {
      const { rerender } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
        />
      );
      expect(screen.getByText('5 Tage')).toBeInTheDocument();

      rerender(
        <StreakDisplay
          currentStreak={6}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={86}
        />
      );
      expect(screen.getByText('6 Tage')).toBeInTheDocument();
    });

    it('updates best streak when current exceeds it', () => {
      const { rerender } = render(
        <StreakDisplay
          currentStreak={9}
          bestStreak={10}
          nextMilestone={14}
          progressToMilestone={64}
        />
      );
      expect(screen.getByText(/Bester: 10 Tage/)).toBeInTheDocument();

      rerender(
        <StreakDisplay
          currentStreak={11}
          bestStreak={11}
          nextMilestone={14}
          progressToMilestone={79}
        />
      );
      expect(screen.queryByText(/Bester:/)).not.toBeInTheDocument();
    });

    it('transitions between active and inactive states', () => {
      const { rerender, container } = render(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          isStreakActive={true}
        />
      );

      let display = container.querySelector('[class*="streak-display"]');
      expect(display?.className).not.toContain('inactive');

      rerender(
        <StreakDisplay
          currentStreak={5}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={71}
          isStreakActive={false}
        />
      );

      display = container.querySelector('[class*="streak-display"]');
      expect(display?.className).toContain('inactive');
    });

    it('handles reaching milestone', () => {
      const { rerender } = render(
        <StreakDisplay
          currentStreak={6}
          bestStreak={10}
          nextMilestone={7}
          progressToMilestone={86}
          showMilestoneProgress
        />
      );
      expect(screen.getByText(/Noch 1 Tag bis 7 Tage!/)).toBeInTheDocument();

      rerender(
        <StreakDisplay
          currentStreak={7}
          bestStreak={10}
          nextMilestone={14}
          progressToMilestone={0}
          showMilestoneProgress
        />
      );
      expect(screen.getByText(/Noch 7 Tage bis 14 Tage!/)).toBeInTheDocument();
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('handles very high streak numbers', () => {
      render(
        <StreakDisplay
          currentStreak={365}
          bestStreak={365}
          nextMilestone={730}
          progressToMilestone={50}
        />
      );

      expect(screen.getByText('365 Tage')).toBeInTheDocument();
    });

    it('handles zero values', () => {
      render(
        <StreakDisplay
          currentStreak={0}
          bestStreak={0}
          nextMilestone={7}
          progressToMilestone={0}
        />
      );

      expect(screen.getByText('0 Tage')).toBeInTheDocument();
    });
  });
});
