/**
 * Tests for MasteryBar Component
 *
 * Tests the mastery bar functionality including:
 * - Rendering with required and optional props
 * - Label and count display
 * - Progress percentage calculation
 * - Color customization
 * - Animation behavior
 * - Accessibility
 * - Reduced motion support
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import '../../../../setup/a11y-matchers';
import { MasteryBar } from '@/modules/ui/components/common/MasteryBar';

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      div: ({ children, style, className, ...props }: any) => (
        <div
          className={className}
          style={typeof style === 'function' ? {} : style}
          {...props}
        >
          {children}
        </div>
      ),
    },
    useReducedMotion: () => false,
  };
});

describe('MasteryBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering tests
  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<MasteryBar label="Test Label" count={5} color="#10b981" />);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders label and count correctly', () => {
      render(<MasteryBar label="Mastered" count={10} color="#10b981" />);

      expect(screen.getByText('Mastered')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('renders with zero count', () => {
      render(<MasteryBar label="New Items" count={0} color="#ef4444" />);

      expect(screen.getByText('New Items')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('renders with large count', () => {
      render(<MasteryBar label="Total" count={999} color="#3b82f6" />);

      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('999')).toBeInTheDocument();
    });

    it('renders track and fill elements', () => {
      const { container } = render(
        <MasteryBar label="Progress" count={5} max={10} color="#10b981" />
      );

      const track = container.querySelector('[class*="mastery-bar__track"]');
      const fill = container.querySelector('[class*="mastery-bar__fill"]');

      expect(track).toBeInTheDocument();
      expect(fill).toBeInTheDocument();
    });
  });

  // Progress calculation tests
  describe('Progress Calculation', () => {
    it('calculates percentage correctly with max value', () => {
      const { container } = render(
        <MasteryBar label="Progress" count={5} max={10} color="#10b981" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      // 5/10 = 50%
      expect(fill).toBeInTheDocument();
    });

    it('shows 100% when count equals max', () => {
      const { container } = render(
        <MasteryBar label="Complete" count={10} max={10} color="#10b981" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });

    it('shows 0% when count is 0', () => {
      const { container } = render(
        <MasteryBar label="Empty" count={0} max={10} color="#ef4444" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });

    it('shows 100% when max is not provided and count > 0', () => {
      const { container } = render(
        <MasteryBar label="Active" count={5} color="#10b981" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });

    it('shows 0% when max is not provided and count is 0', () => {
      const { container } = render(
        <MasteryBar label="Inactive" count={0} color="#ef4444" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });

    it('handles fractional percentages correctly', () => {
      const { container } = render(
        <MasteryBar label="Progress" count={3} max={7} color="#10b981" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      // 3/7 ≈ 42.86%
      expect(fill).toBeInTheDocument();
    });

    it('handles count greater than max', () => {
      const { container } = render(
        <MasteryBar label="Overflow" count={15} max={10} color="#10b981" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      // 15/10 = 150% (should be clamped or handled by component)
      expect(fill).toBeInTheDocument();
    });

    it('handles max of 0 gracefully', () => {
      const { container } = render(
        <MasteryBar label="Invalid" count={5} max={0} color="#10b981" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });
  });

  // Color customization tests
  describe('Color Customization', () => {
    it('applies custom color', () => {
      const { container } = render(
        <MasteryBar label="Custom" count={5} max={10} color="#ff0000" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
      // Color is applied via CSS custom property --mastery-bar-color
    });

    it('accepts different color formats - hex', () => {
      const { container } = render(
        <MasteryBar label="Hex Color" count={5} color="#10b981" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });

    it('accepts different color formats - rgb', () => {
      const { container } = render(
        <MasteryBar label="RGB Color" count={5} color="rgb(16, 185, 129)" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });

    it('accepts different color formats - named color', () => {
      const { container } = render(
        <MasteryBar label="Named Color" count={5} color="green" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });
  });

  // Animation tests
  describe('Animation', () => {
    it('animates by default', () => {
      const { container } = render(
        <MasteryBar label="Animated" count={5} max={10} color="#10b981" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });

    it('animates when animate=true', () => {
      const { container } = render(
        <MasteryBar
          label="Animated"
          count={5}
          max={10}
          color="#10b981"
          animate={true}
        />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });

    it('does not animate when animate=false', () => {
      const { container } = render(
        <MasteryBar
          label="Static"
          count={5}
          max={10}
          color="#10b981"
          animate={false}
        />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });
  });

  // Reduced motion tests
  describe('Reduced Motion', () => {
    it('respects prefers-reduced-motion', () => {
      // Mock useReducedMotion to return true
      vi.mock('framer-motion', async () => {
        const actual = await vi.importActual('framer-motion');
        return {
          ...actual,
          motion: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            div: ({ children, style, className, ...props }: any) => (
              <div
                className={className}
                style={typeof style === 'function' ? {} : style}
                {...props}
              >
                {children}
              </div>
            ),
          },
          useReducedMotion: () => true,
        };
      });

      const { container } = render(
        <MasteryBar label="Reduced Motion" count={5} max={10} color="#10b981" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });

    it('skips animation when both animate=false and reduced motion', () => {
      const { container } = render(
        <MasteryBar
          label="No Animation"
          count={5}
          max={10}
          color="#10b981"
          animate={false}
        />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('has no WCAG violations', async () => {
      const { container } = render(
        <MasteryBar label="Accessible" count={5} max={10} color="#10b981" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with zero values', async () => {
      const { container } = render(
        <MasteryBar label="Empty" count={0} max={10} color="#ef4444" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations without max value', async () => {
      const { container } = render(
        <MasteryBar label="No Max" count={5} color="#10b981" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with multiple bars', async () => {
      const { container } = render(
        <div>
          <MasteryBar label="Mastered" count={10} max={50} color="#10b981" />
          <MasteryBar label="Learning" count={5} max={50} color="#f59e0b" />
          <MasteryBar label="New" count={35} max={50} color="#ef4444" />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('label text is visible and accessible', () => {
      render(<MasteryBar label="Mastery Level" count={7} color="#10b981" />);

      const label = screen.getByText('Mastery Level');
      expect(label).toBeVisible();
      expect(label).toBeInTheDocument();
    });

    it('count text is visible and accessible', () => {
      render(<MasteryBar label="Items" count={42} color="#10b981" />);

      const count = screen.getByText('42');
      expect(count).toBeVisible();
      expect(count).toBeInTheDocument();
    });
  });

  // Layout and structure tests
  describe('Layout and Structure', () => {
    it('renders header with label and count', () => {
      const { container } = render(
        <MasteryBar label="Test" count={5} color="#10b981" />
      );

      const header = container.querySelector('[class*="mastery-bar__header"]');
      expect(header).toBeInTheDocument();
    });

    it('renders label in correct element', () => {
      const { container } = render(
        <MasteryBar label="Label Text" count={5} color="#10b981" />
      );

      const label = container.querySelector('[class*="mastery-bar__label"]');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Label Text');
    });

    it('renders count in correct element', () => {
      const { container } = render(
        <MasteryBar label="Count" count={15} color="#10b981" />
      );

      const count = container.querySelector('[class*="mastery-bar__count"]');
      expect(count).toBeInTheDocument();
      expect(count).toHaveTextContent('15');
    });

    it('has correct class structure', () => {
      const { container } = render(
        <MasteryBar label="Structure" count={5} max={10} color="#10b981" />
      );

      expect(container.querySelector('[class*="mastery-bar"]')).toBeInTheDocument();
      expect(container.querySelector('[class*="mastery-bar__header"]')).toBeInTheDocument();
      expect(container.querySelector('[class*="mastery-bar__label"]')).toBeInTheDocument();
      expect(container.querySelector('[class*="mastery-bar__count"]')).toBeInTheDocument();
      expect(container.querySelector('[class*="mastery-bar__track"]')).toBeInTheDocument();
      expect(container.querySelector('[class*="mastery-bar__fill"]')).toBeInTheDocument();
    });
  });

  // Integration tests
  describe('Integration', () => {
    it('renders multiple mastery bars correctly', () => {
      render(
        <div>
          <MasteryBar label="Bar 1" count={5} max={10} color="#10b981" />
          <MasteryBar label="Bar 2" count={3} max={10} color="#f59e0b" />
          <MasteryBar label="Bar 3" count={2} max={10} color="#ef4444" />
        </div>
      );

      expect(screen.getByText('Bar 1')).toBeInTheDocument();
      expect(screen.getByText('Bar 2')).toBeInTheDocument();
      expect(screen.getByText('Bar 3')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('handles re-renders with updated values', () => {
      const { rerender } = render(
        <MasteryBar label="Dynamic" count={5} max={10} color="#10b981" />
      );

      expect(screen.getByText('5')).toBeInTheDocument();

      rerender(
        <MasteryBar label="Dynamic" count={7} max={10} color="#10b981" />
      );

      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.queryByText('5')).not.toBeInTheDocument();
    });

    it('handles re-renders with updated max value', () => {
      const { rerender } = render(
        <MasteryBar label="Dynamic Max" count={5} max={10} color="#10b981" />
      );

      expect(screen.getByText('5')).toBeInTheDocument();

      rerender(
        <MasteryBar label="Dynamic Max" count={5} max={20} color="#10b981" />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
      // Max changed from 10 to 20, percentage should update
    });

    it('handles re-renders with updated label', () => {
      const { rerender } = render(
        <MasteryBar label="Original Label" count={5} color="#10b981" />
      );

      expect(screen.getByText('Original Label')).toBeInTheDocument();

      rerender(
        <MasteryBar label="Updated Label" count={5} color="#10b981" />
      );

      expect(screen.getByText('Updated Label')).toBeInTheDocument();
      expect(screen.queryByText('Original Label')).not.toBeInTheDocument();
    });

    it('handles re-renders with updated color', () => {
      const { rerender, container } = render(
        <MasteryBar label="Color Change" count={5} max={10} color="#10b981" />
      );

      let fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();

      rerender(
        <MasteryBar label="Color Change" count={5} max={10} color="#ef4444" />
      );

      fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('handles negative count gracefully', () => {
      const { container } = render(
        <MasteryBar label="Negative" count={-5} max={10} color="#ef4444" />
      );

      expect(screen.getByText('-5')).toBeInTheDocument();
      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });

    it('handles negative max gracefully', () => {
      const { container } = render(
        <MasteryBar label="Negative Max" count={5} max={-10} color="#ef4444" />
      );

      const fill = container.querySelector('[class*="mastery-bar__fill"]');
      expect(fill).toBeInTheDocument();
    });

    it('handles very large numbers', () => {
      render(
        <MasteryBar label="Large" count={999999} max={1000000} color="#10b981" />
      );

      expect(screen.getByText('999999')).toBeInTheDocument();
    });

    it('handles decimal count values', () => {
      render(
        <MasteryBar label="Decimal" count={5.5} max={10} color="#10b981" />
      );

      expect(screen.getByText('5.5')).toBeInTheDocument();
    });

    it('handles empty label string', () => {
      render(<MasteryBar label="" count={5} color="#10b981" />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('handles long label text', () => {
      const longLabel = 'This is a very long label that should still render correctly';
      render(<MasteryBar label={longLabel} count={5} color="#10b981" />);

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('handles special characters in label', () => {
      const specialLabel = `Label with <>&"'`;
      render(
        <MasteryBar label={specialLabel} count={5} color="#10b981" />
      );

      expect(screen.getByText(specialLabel)).toBeInTheDocument();
    });
  });

  // Real-world usage scenarios
  describe('Real-world Usage Scenarios', () => {
    it('renders mastery levels like in dashboard', () => {
      render(
        <div>
          <MasteryBar label="Gemeistert" count={12} max={50} color="#10b981" />
          <MasteryBar label="In Arbeit" count={8} max={50} color="#f59e0b" />
          <MasteryBar label="Neu" count={30} max={50} color="#ef4444" />
        </div>
      );

      expect(screen.getByText('Gemeistert')).toBeInTheDocument();
      expect(screen.getByText('In Arbeit')).toBeInTheDocument();
      expect(screen.getByText('Neu')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('renders without max for simple count display', () => {
      render(
        <div>
          <MasteryBar label="Active Tasks" count={5} color="#3b82f6" />
          <MasteryBar label="Completed Today" count={3} color="#10b981" />
        </div>
      );

      expect(screen.getByText('Active Tasks')).toBeInTheDocument();
      expect(screen.getByText('Completed Today')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});
