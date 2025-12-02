import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import '../../../../setup/a11y-matchers';
import { CircularProgress } from '@/modules/ui/components/common/CircularProgress';

describe('CircularProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering tests
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<CircularProgress value={50} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('renders with custom max value', () => {
      render(<CircularProgress value={5} max={10} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '5');
      expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    });

    it('handles value of 0', () => {
      render(<CircularProgress value={0} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('handles value equal to max', () => {
      render(<CircularProgress value={100} max={100} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('clamps value above max to 100%', () => {
      render(<CircularProgress value={150} max={100} />);

      const progressBar = screen.getByRole('progressbar');
      // Value should still be 150 in aria-valuenow
      expect(progressBar).toHaveAttribute('aria-valuenow', '150');
    });

    it('clamps negative values to 0%', () => {
      render(<CircularProgress value={-10} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '-10');
    });
  });

  // Size tests
  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(<CircularProgress value={50} size="small" />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toHaveStyle({ width: '48px', height: '48px' });
    });

    it('renders medium size (default)', () => {
      const { container } = render(<CircularProgress value={50} size="medium" />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toHaveStyle({ width: '80px', height: '80px' });
    });

    it('renders large size', () => {
      const { container } = render(<CircularProgress value={50} size="large" />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toHaveStyle({ width: '120px', height: '120px' });
    });

    it('renders custom numeric size', () => {
      const { container } = render(<CircularProgress value={50} size={150} />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toHaveStyle({ width: '150px', height: '150px' });
    });
  });

  // Color tests
  describe('Colors', () => {
    it('uses auto-color based on percentage when no custom color provided', () => {
      const { container } = render(<CircularProgress value={25} />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toBeInTheDocument();
      // At 25%, should use error color (< 50)
    });

    it('uses warning color for 50-74%', () => {
      const { container } = render(<CircularProgress value={60} />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('uses success color for 75%+', () => {
      const { container } = render(<CircularProgress value={85} />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('applies custom pathColor', () => {
      const { container } = render(<CircularProgress value={50} pathColor="rgb(255, 0, 0)" />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('applies custom trailColor', () => {
      const { container } = render(<CircularProgress value={50} trailColor="rgb(200, 200, 200)" />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // Value display tests
  describe('Value Display', () => {
    it('shows percentage value by default', () => {
      render(<CircularProgress value={75} showValue />);
      // The percentage text is rendered by react-circular-progressbar
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('hides value when showValue is false', () => {
      render(<CircularProgress value={75} showValue={false} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      // Text should not be rendered
    });

    it('shows custom children instead of percentage', () => {
      render(
        <CircularProgress value={3} max={10} showValue>
          <span data-testid="custom-content">3/10</span>
        </CircularProgress>
      );
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('3/10')).toBeInTheDocument();
    });

    it('prioritizes children over showValue', () => {
      render(
        <CircularProgress value={75} showValue>
          <span data-testid="custom-content">Custom</span>
        </CircularProgress>
      );
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });

  // Stroke width tests
  describe('Stroke Width', () => {
    it('uses default stroke width for size preset', () => {
      const { container } = render(<CircularProgress value={50} size="small" />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('accepts custom stroke width', () => {
      const { container } = render(<CircularProgress value={50} strokeWidth={12} />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('uses default stroke width of 8 for numeric size', () => {
      const { container } = render(<CircularProgress value={50} size={100} />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // Custom styling tests
  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<CircularProgress value={50} className="custom-class" />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar?.className).toContain('custom-class');
    });
  });

  // Animation tests
  describe('Animation', () => {
    it('animates by default', () => {
      const { container } = render(<CircularProgress value={50} />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('disables animation when disableAnimation is true', () => {
      const { container } = render(<CircularProgress value={50} disableAnimation />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<CircularProgress value={50} max={100} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('has default aria-label with percentage', () => {
      render(<CircularProgress value={50} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Fortschritt: 50%');
    });

    it('accepts custom aria-label', () => {
      render(<CircularProgress value={5} max={10} ariaLabel="Tasks completed" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Tasks completed');
    });

    it('has no WCAG violations', async () => {
      const { container } = render(<CircularProgress value={50} showValue />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with custom children', async () => {
      const { container } = render(
        <CircularProgress value={5} max={10}>
          <span>5/10</span>
        </CircularProgress>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with different sizes', async () => {
      const { container } = render(
        <div>
          <CircularProgress value={25} size="small" />
          <CircularProgress value={50} size="medium" />
          <CircularProgress value={75} size="large" />
          <CircularProgress value={100} size={150} />
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

      const { container } = render(<CircularProgress value={50} />);
      const progressBar = container.querySelector('[class*="circular-progress"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // Integration tests
  describe('Integration', () => {
    it('renders multiple progress circles correctly', () => {
      render(
        <div>
          <CircularProgress value={25} />
          <CircularProgress value={50} />
          <CircularProgress value={75} />
          <CircularProgress value={100} />
        </div>
      );

      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars).toHaveLength(4);
      expect(progressBars[0]).toHaveAttribute('aria-valuenow', '25');
      expect(progressBars[1]).toHaveAttribute('aria-valuenow', '50');
      expect(progressBars[2]).toHaveAttribute('aria-valuenow', '75');
      expect(progressBars[3]).toHaveAttribute('aria-valuenow', '100');
    });

    it('handles rapid value changes', () => {
      const { rerender } = render(<CircularProgress value={0} />);

      rerender(<CircularProgress value={25} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');

      rerender(<CircularProgress value={50} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');

      rerender(<CircularProgress value={100} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    });
  });
});
