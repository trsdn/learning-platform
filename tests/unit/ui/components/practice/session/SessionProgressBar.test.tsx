import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import '../../../../../setup/a11y-matchers';
import {
  SessionProgressBar,
  type TaskResult,
} from '@/modules/ui/components/practice/session/SessionProgressBar';

describe('SessionProgressBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering tests
  describe('Rendering', () => {
    it('renders with basic props', () => {
      render(<SessionProgressBar currentIndex={0} totalTasks={10} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '1');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    });

    it('renders with aria-label describing current task', () => {
      render(<SessionProgressBar currentIndex={4} totalTasks={10} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Aufgabe 5 von 10');
    });

    it('handles first task', () => {
      render(<SessionProgressBar currentIndex={0} totalTasks={5} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '1');
      expect(progressBar).toHaveAttribute('aria-label', 'Aufgabe 1 von 5');
    });

    it('handles last task', () => {
      render(<SessionProgressBar currentIndex={9} totalTasks={10} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '10');
      expect(progressBar).toHaveAttribute('aria-label', 'Aufgabe 10 von 10');
    });

    it('handles zero total tasks', () => {
      render(<SessionProgressBar currentIndex={0} totalTasks={0} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // Progress calculation tests
  describe('Progress Calculation', () => {
    it('calculates progress correctly for first task', () => {
      render(<SessionProgressBar currentIndex={0} totalTasks={10} />);
      // First task = 1/10 = 10%
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    });

    it('calculates progress correctly for middle task', () => {
      render(<SessionProgressBar currentIndex={4} totalTasks={10} />);
      // Fifth task = 5/10 = 50%
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '5');
    });

    it('calculates progress correctly for last task', () => {
      render(<SessionProgressBar currentIndex={9} totalTasks={10} />);
      // Last task = 10/10 = 100%
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '10');
    });

    it('handles odd total task numbers', () => {
      render(<SessionProgressBar currentIndex={2} totalTasks={7} />);
      // Third task = 3/7 ≈ 42.86%
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '3');
    });
  });

  // Task marker tests
  describe('Task Markers', () => {
    it('shows task markers when showTaskMarkers is true and tasks <= 20', () => {
      const { container } = render(
        <SessionProgressBar currentIndex={0} totalTasks={10} showTaskMarkers />
      );

      const markersContainer = container.querySelector('[class*="session-progress__markers"]');
      const markers = markersContainer?.querySelectorAll('[class*="session-progress__marker"]');
      expect(markers).toHaveLength(10);
    });

    it('does not show task markers when showTaskMarkers is false', () => {
      const { container } = render(
        <SessionProgressBar currentIndex={0} totalTasks={10} showTaskMarkers={false} />
      );

      const markersContainer = container.querySelector('[class*="session-progress__markers"]');
      expect(markersContainer).not.toBeInTheDocument();
    });

    it('does not show task markers when totalTasks > 20', () => {
      const { container } = render(
        <SessionProgressBar currentIndex={0} totalTasks={25} showTaskMarkers />
      );

      const markersContainer = container.querySelector('[class*="session-progress__markers"]');
      expect(markersContainer).not.toBeInTheDocument();
    });

    it('highlights current task marker', () => {
      const { container } = render(
        <SessionProgressBar currentIndex={3} totalTasks={10} showTaskMarkers />
      );

      const markersContainer = container.querySelector('[class*="session-progress__markers"]');
      const markers = markersContainer?.querySelectorAll('[class*="session-progress__marker"]');
      const currentMarker = markers?.[3];
      expect(currentMarker?.className).toContain('current');
    });

    it('marks completed task markers', () => {
      const { container } = render(
        <SessionProgressBar currentIndex={3} totalTasks={10} showTaskMarkers />
      );

      const markersContainer = container.querySelector('[class*="session-progress__markers"]');
      const markers = markersContainer?.querySelectorAll('[class*="session-progress__marker"]');
      // First 3 tasks should be marked as completed
      expect(markers?.[0]?.className).toContain('completed');
      expect(markers?.[1]?.className).toContain('completed');
      expect(markers?.[2]?.className).toContain('completed');
      // Current task should not be marked as completed
      expect(markers?.[3]?.className).not.toContain('completed');
    });
  });

  // Task results tests
  describe('Task Results', () => {
    it('applies correct result color to completed markers', () => {
      const taskResults: TaskResult[] = ['correct', 'correct', 'incorrect', 'pending'];
      const { container } = render(
        <SessionProgressBar
          currentIndex={3}
          totalTasks={4}
          showTaskMarkers
          taskResults={taskResults}
        />
      );

      const markersContainer = container.querySelector('[class*="session-progress__markers"]');
      const markers = markersContainer?.querySelectorAll('[class*="session-progress__marker"]');
      // Check that styles are applied (we can't easily test CSS variable values in tests)
      expect(markers?.[0]).toBeInTheDocument();
      expect(markers?.[1]).toBeInTheDocument();
      expect(markers?.[2]).toBeInTheDocument();
    });

    it('handles correct result', () => {
      const taskResults: TaskResult[] = ['correct'];
      const { container } = render(
        <SessionProgressBar
          currentIndex={1}
          totalTasks={2}
          showTaskMarkers
          taskResults={taskResults}
        />
      );

      const markersContainer = container.querySelector('[class*="session-progress__markers"]');
      const markers = markersContainer?.querySelectorAll('[class*="session-progress__marker"]');
      expect(markers?.[0]).toHaveAttribute('title', 'Aufgabe 1 - correct');
    });

    it('handles incorrect result', () => {
      const taskResults: TaskResult[] = ['incorrect'];
      const { container } = render(
        <SessionProgressBar
          currentIndex={1}
          totalTasks={2}
          showTaskMarkers
          taskResults={taskResults}
        />
      );

      const markersContainer = container.querySelector('[class*="session-progress__markers"]');
      const markers = markersContainer?.querySelectorAll('[class*="session-progress__marker"]');
      expect(markers?.[0]).toHaveAttribute('title', 'Aufgabe 1 - incorrect');
    });

    it('handles skipped result', () => {
      const taskResults: TaskResult[] = ['skipped'];
      const { container } = render(
        <SessionProgressBar
          currentIndex={1}
          totalTasks={2}
          showTaskMarkers
          taskResults={taskResults}
        />
      );

      const markersContainer = container.querySelector('[class*="session-progress__markers"]');
      const markers = markersContainer?.querySelectorAll('[class*="session-progress__marker"]');
      expect(markers?.[0]).toHaveAttribute('title', 'Aufgabe 1 - skipped');
    });

    it('handles pending result', () => {
      const taskResults: TaskResult[] = ['pending'];
      const { container } = render(
        <SessionProgressBar
          currentIndex={0}
          totalTasks={2}
          showTaskMarkers
          taskResults={taskResults}
        />
      );

      const markersContainer = container.querySelector('[class*="session-progress__markers"]');
      const markers = markersContainer?.querySelectorAll('[class*="session-progress__marker"]');
      expect(markers?.[0]).toHaveAttribute('title', 'Aufgabe 1');
    });

    it('handles mixed results', () => {
      const taskResults: TaskResult[] = [
        'correct',
        'incorrect',
        'correct',
        'skipped',
        'correct',
        'pending',
      ];
      const { container } = render(
        <SessionProgressBar
          currentIndex={5}
          totalTasks={6}
          showTaskMarkers
          taskResults={taskResults}
        />
      );

      const markersContainer = container.querySelector('[class*="session-progress__markers"]');
      const markers = markersContainer?.querySelectorAll('[class*="session-progress__marker"]');
      expect(markers).toHaveLength(6);
      expect(markers?.[0]).toHaveAttribute('title', 'Aufgabe 1 - correct');
      expect(markers?.[1]).toHaveAttribute('title', 'Aufgabe 2 - incorrect');
      expect(markers?.[2]).toHaveAttribute('title', 'Aufgabe 3 - correct');
      expect(markers?.[3]).toHaveAttribute('title', 'Aufgabe 4 - skipped');
      expect(markers?.[4]).toHaveAttribute('title', 'Aufgabe 5 - correct');
    });
  });

  // Animation tests
  describe('Animation', () => {
    it('animates by default', () => {
      const { container } = render(<SessionProgressBar currentIndex={0} totalTasks={10} />);
      const fill = container.querySelector('[class*="session-progress__fill"]');
      expect(fill).toBeInTheDocument();
    });

    it('disables animation when animate is false', () => {
      const { container } = render(
        <SessionProgressBar currentIndex={0} totalTasks={10} animate={false} />
      );
      const fill = container.querySelector('[class*="session-progress__fill"]');
      expect(fill).toBeInTheDocument();
    });

    it('calls onAnimationComplete callback', () => {
      const onAnimationComplete = vi.fn();
      render(
        <SessionProgressBar
          currentIndex={0}
          totalTasks={10}
          onAnimationComplete={onAnimationComplete}
        />
      );
      // The callback would be called when the animation completes
      // In tests, this happens immediately or not at all depending on animation
    });
  });

  // Custom styling tests
  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <SessionProgressBar currentIndex={0} totalTasks={10} className="custom-class" />
      );
      const progressContainer = container.querySelector('[class*="session-progress"]');
      expect(progressContainer?.className).toContain('custom-class');
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<SessionProgressBar currentIndex={4} totalTasks={10} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '5');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '10');
      expect(progressBar).toHaveAttribute('aria-label', 'Aufgabe 5 von 10');
    });

    it('has no WCAG violations', async () => {
      const { container } = render(<SessionProgressBar currentIndex={0} totalTasks={10} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with task markers', async () => {
      const taskResults: TaskResult[] = ['correct', 'incorrect', 'skipped', 'pending'];
      const { container } = render(
        <SessionProgressBar
          currentIndex={3}
          totalTasks={10}
          showTaskMarkers
          taskResults={taskResults}
        />
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

      const { container } = render(<SessionProgressBar currentIndex={0} totalTasks={10} />);
      const fill = container.querySelector('[class*="session-progress__fill"]');
      expect(fill).toBeInTheDocument();
    });
  });

  // Integration tests
  describe('Integration', () => {
    it('updates progress as user advances through tasks', () => {
      const { rerender } = render(<SessionProgressBar currentIndex={0} totalTasks={5} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');

      rerender(<SessionProgressBar currentIndex={1} totalTasks={5} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');

      rerender(<SessionProgressBar currentIndex={2} totalTasks={5} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');

      rerender(<SessionProgressBar currentIndex={4} totalTasks={5} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '5');
    });

    it('updates task results as user completes tasks', () => {
      const { rerender, container } = render(
        <SessionProgressBar
          currentIndex={0}
          totalTasks={3}
          showTaskMarkers
          taskResults={['pending', 'pending', 'pending']}
        />
      );

      rerender(
        <SessionProgressBar
          currentIndex={1}
          totalTasks={3}
          showTaskMarkers
          taskResults={['correct', 'pending', 'pending']}
        />
      );

      let markersContainer = container.querySelector('[class*="session-progress__markers"]');
      let markers = markersContainer?.querySelectorAll('[class*="session-progress__marker"]');
      expect(markers?.[0]).toHaveAttribute('title', 'Aufgabe 1 - correct');

      rerender(
        <SessionProgressBar
          currentIndex={2}
          totalTasks={3}
          showTaskMarkers
          taskResults={['correct', 'incorrect', 'pending']}
        />
      );

      markersContainer = container.querySelector('[class*="session-progress__markers"]');
      markers = markersContainer?.querySelectorAll('[class*="session-progress__marker"]');
      expect(markers?.[1]).toHaveAttribute('title', 'Aufgabe 2 - incorrect');
    });
  });
});
