import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IconButton } from '@ui/components/common/IconButton';
import { colors } from '@ui/design-tokens';

// Simple test icon component
const TestIcon = () => <span data-testid="test-icon">→</span>;

describe('IconButton', () => {
  describe('Rendering', () => {
    it('should render with icon', () => {
      render(<IconButton icon={<TestIcon />} label="Test" />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<IconButton icon={<TestIcon />} label="Test" className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('should apply custom styles', () => {
      render(<IconButton icon={<TestIcon />} label="Test" style={{ margin: '10px' }} />);
      const button = screen.getByRole('button');
      expect(button.style.margin).toBe('10px');
    });
  });

  describe('Variants', () => {
    it('should render ghost variant by default', () => {
      render(<IconButton icon={<TestIcon />} label="Ghost" />);
      const button = screen.getByRole('button');
      expect(button.style.backgroundColor).toBe(colors.neutral[100]);
    });

    it('should render primary variant', () => {
      render(<IconButton icon={<TestIcon />} label="Primary" variant="primary" />);
      const button = screen.getByRole('button');
      expect(button.style.backgroundColor).toBe(colors.primary[500]);
    });

    it('should render secondary variant', () => {
      render(<IconButton icon={<TestIcon />} label="Secondary" variant="secondary" />);
      const button = screen.getByRole('button');
      expect(button.style.backgroundColor).toBe(colors.neutral[200]);
    });

    it('should render danger variant', () => {
      render(<IconButton icon={<TestIcon />} label="Danger" variant="danger" />);
      const button = screen.getByRole('button');
      expect(button.style.backgroundColor).toBe(colors.error[500]);
    });
  });

  describe('Sizes', () => {
    it('should render medium size by default', () => {
      render(<IconButton icon={<TestIcon />} label="Medium" />);
      const button = screen.getByRole('button');
      expect(button.style.minWidth).toBeTruthy();
      expect(button.style.minHeight).toBeTruthy();
    });

    it('should render small size', () => {
      render(<IconButton icon={<TestIcon />} label="Small" size="small" />);
      const button = screen.getByRole('button');
      expect(button.style.minWidth).toBeTruthy();
      expect(button.style.minHeight).toBeTruthy();
    });

    it('should render large size', () => {
      render(<IconButton icon={<TestIcon />} label="Large" size="large" />);
      const button = screen.getByRole('button');
      expect(button.style.minWidth).toBeTruthy();
      expect(button.style.minHeight).toBeTruthy();
    });
  });

  describe('Label', () => {
    it('should set title attribute from label', () => {
      render(<IconButton icon={<TestIcon />} label="Close dialog" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Close dialog');
    });

    it('should set aria-label from label', () => {
      render(<IconButton icon={<TestIcon />} label="Close dialog" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('should not show label text by default', () => {
      render(<IconButton icon={<TestIcon />} label="Close" />);
      expect(screen.queryByText('Close')).not.toBeInTheDocument();
    });

    it('should show label text when showLabel is true', () => {
      render(<IconButton icon={<TestIcon />} label="Close" showLabel />);
      expect(screen.getByText('Close')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<IconButton icon={<TestIcon />} label="Disabled" disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.style.opacity).toBe('0.6');
    });

    it('should have not-allowed cursor when disabled', () => {
      render(<IconButton icon={<TestIcon />} label="Disabled" disabled />);
      const button = screen.getByRole('button');
      expect(button.style.cursor).toBe('not-allowed');
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<IconButton icon={<TestIcon />} label="Click me" onClick={handleClick} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<IconButton icon={<TestIcon />} label="Click me" disabled onClick={handleClick} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should call onMouseEnter and onMouseLeave', () => {
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();
      render(
        <IconButton
          icon={<TestIcon />}
          label="Hover me"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      );
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
      fireEvent.mouseLeave(button);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('should call onFocus and onBlur', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      render(
        <IconButton
          icon={<TestIcon />}
          label="Focus me"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
      const button = screen.getByRole('button');
      fireEvent.focus(button);
      expect(handleFocus).toHaveBeenCalledTimes(1);
      fireEvent.blur(button);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<IconButton icon={<TestIcon />} label="Accessible" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have aria-label for screen readers', () => {
      render(<IconButton icon={<TestIcon />} label="Delete item" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Delete item');
    });

    it('should have title for tooltip', () => {
      render(<IconButton icon={<TestIcon />} label="Delete item" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Delete item');
    });
  });

  describe('Layout', () => {
    it('should have gap when showLabel is true', () => {
      render(<IconButton icon={<TestIcon />} label="Settings" showLabel />);
      const button = screen.getByRole('button');
      expect(button.style.gap).toBeTruthy();
    });

    it('should not have gap when showLabel is false', () => {
      render(<IconButton icon={<TestIcon />} label="Settings" showLabel={false} />);
      const button = screen.getByRole('button');
      expect(button.style.gap).toBe('0');
    });
  });
});
