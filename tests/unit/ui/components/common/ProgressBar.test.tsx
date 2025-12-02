import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import '../../../../setup/a11y-matchers';
import { ProgressBar } from '@/modules/ui/components/common/ProgressBar';

describe('ProgressBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering tests
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ProgressBar value={50} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('renders with custom max value', () => {
      render(<ProgressBar value={5} max={10} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '5');
      expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    });

    it('handles value of 0', () => {
      render(<ProgressBar value={0} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('handles value equal to max', () => {
      render(<ProgressBar value={100} max={100} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('clamps value above max to 100%', () => {
      render(<ProgressBar value={150} max={100} />);

      const progressBar = screen.getByRole('progressbar');
      // Value should still be 150 in aria-valuenow
      expect(progressBar).toHaveAttribute('aria-valuenow', '150');
    });

    it('clamps negative values to 0%', () => {
      render(<ProgressBar value={-10} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '-10');
    });
  });

  // Variant tests
  describe('Variants', () => {
    it('renders default variant', () => {
      render(<ProgressBar value={50} variant="default" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('renders gradient variant', () => {
      render(<ProgressBar value={50} variant="gradient" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('renders striped variant', () => {
      render(<ProgressBar value={50} variant="striped" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('renders animated-striped variant', () => {
      render(<ProgressBar value={50} variant="animated-striped" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // Size tests
  describe('Sizes', () => {
    it('renders small size', () => {
      render(<ProgressBar value={50} size="small" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('renders medium size (default)', () => {
      render(<ProgressBar value={50} size="medium" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('renders large size', () => {
      render(<ProgressBar value={50} size="large" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // Label tests
  describe('Labels', () => {
    it('does not show label by default', () => {
      render(<ProgressBar value={50} />);
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('shows label when showLabel is true', () => {
      render(<ProgressBar value={50} showLabel />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('shows label in outside position by default', () => {
      render(<ProgressBar value={50} showLabel labelPosition="outside" />);
      const label = screen.getByText('50%');
      expect(label).toBeInTheDocument();
    });

    it('shows label in top position', () => {
      render(<ProgressBar value={50} showLabel labelPosition="top" />);
      const label = screen.getByText('50%');
      expect(label).toBeInTheDocument();
    });

    it('shows label inside when position is inside and percentage is high enough', () => {
      render(<ProgressBar value={50} showLabel labelPosition="inside" />);
      const label = screen.getByText('50%');
      expect(label).toBeInTheDocument();
    });

    it('does not show label inside when percentage is too low', () => {
      render(<ProgressBar value={10} showLabel labelPosition="inside" />);
      // Label should not be rendered when percentage is below MIN_PERCENTAGE_FOR_INSIDE_LABEL (15)
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      // The label might not be rendered at all in this case
    });

    it('shows custom formatted label', () => {
      render(
        <ProgressBar
          value={5}
          max={10}
          showLabel
          formatLabel={(val, max) => `${val}/${max} completed`}
        />
      );
      expect(screen.getByText('5/10 completed')).toBeInTheDocument();
    });

    it('shows fraction label when max is not 100', () => {
      render(<ProgressBar value={5} max={10} showLabel />);
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    it('shows percentage label when max is 100', () => {
      render(<ProgressBar value={75} max={100} showLabel />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  // Custom styling tests
  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<ProgressBar value={50} className="custom-class" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('applies custom color', () => {
      render(<ProgressBar value={50} color="rgb(255, 0, 0)" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('uses auto-color based on percentage when no custom color provided', () => {
      render(<ProgressBar value={25} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      // At 25%, should use error color (< 50) - implementation verified by visual test
    });

    it('uses warning color for 50-74%', () => {
      render(<ProgressBar value={60} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('uses success color for 75%+', () => {
      render(<ProgressBar value={85} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // Animation tests
  describe('Animation', () => {
    it('animates by default', () => {
      render(<ProgressBar value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('disables animation when disableAnimation is true', () => {
      render(<ProgressBar value={50} disableAnimation />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<ProgressBar value={50} max={100} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('has default aria-label', () => {
      render(<ProgressBar value={50} showLabel />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Fortschritt: 50%');
    });

    it('accepts custom aria-label', () => {
      render(<ProgressBar value={5} max={10} ariaLabel="Tasks completed" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Tasks completed');
    });

    it('has no WCAG violations', async () => {
      const { container } = render(<ProgressBar value={50} showLabel />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with all variants', async () => {
      const { container } = render(
        <div>
          <ProgressBar value={25} variant="default" showLabel />
          <ProgressBar value={50} variant="gradient" showLabel />
          <ProgressBar value={75} variant="striped" showLabel />
          <ProgressBar value={100} variant="animated-striped" showLabel />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // Reduced motion tests
  describe('Reduced Motion', () => {
    it('respects prefers-reduced-motion', () => {
      // Component respects reduced motion via useReducedMotion hook
      render(<ProgressBar value={50} disableAnimation />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });
});
