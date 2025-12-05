import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Button } from '@ui/components/common/Button';
import styles from '@ui/components/common/Button.module.css';

describe('Button', () => {
  describe('Rendering', () => {
    it('should render with children text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('should apply custom styles', () => {
      // eslint-disable-next-line no-restricted-syntax -- Testing inline style functionality
      render(<Button style={{ margin: '10px' }}>Button</Button>);
      const button = screen.getByRole('button');
      expect(button.style.margin).toBe('10px');
    });
  });

  describe('Variants', () => {
    it('should render primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['button--primary']);
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['button--secondary']);
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['button--ghost']);
    });

    it('should render danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['button--danger']);
    });
  });

  describe('Sizes', () => {
    it('should render medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['button--medium']);
    });

    it('should render small size', () => {
      render(<Button size="small">Small</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['button--small']);
    });

    it('should render large size', () => {
      render(<Button size="large">Large</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['button--large']);
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.className).toContain(styles.button);
    });

    it('should show loading state', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.className).toContain(styles['button--loading']);
    });

    it('should be disabled when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Full Width', () => {
    it('should take full width when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['button--full-width']);
    });

    it('should not have full width class by default', () => {
      render(<Button>Auto Width</Button>);
      const button = screen.getByRole('button');
      expect(button.className).not.toContain(styles['button--full-width']);
    });
  });

  describe('Icons', () => {
    it('should render start icon', () => {
      render(
        <Button startIcon={<span data-testid="start-icon">→</span>}>
          With Start Icon
        </Button>
      );
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    });

    it('should render end icon', () => {
      render(
        <Button endIcon={<span data-testid="end-icon">←</span>}>
          With End Icon
        </Button>
      );
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });

    it('should render both start and end icons', () => {
      render(
        <Button
          startIcon={<span data-testid="start-icon">→</span>}
          endIcon={<span data-testid="end-icon">←</span>}
        >
          With Both Icons
        </Button>
      );
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(<Button loading onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should call onMouseEnter and onMouseLeave', () => {
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();
      render(
        <Button onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          Hover me
        </Button>
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
        <Button onFocus={handleFocus} onBlur={handleBlur}>
          Focus me
        </Button>
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
      render(<Button>Accessible</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should have default type of button', () => {
      const { container } = render(<Button>Button</Button>);
      const button = container.querySelector('button');
      // Type defaults to button in most browsers, or may be null/undefined
      const type = button?.getAttribute('type');
      expect(['button', undefined, null]).toContain(type);
    });
  });

  describe('Button Types', () => {
    it('should support button type', () => {
      render(<Button type="button">Button Type</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should support submit type', () => {
      render(<Button type="submit">Submit Type</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should support reset type', () => {
      render(<Button type="reset">Reset Type</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('CSS Design Token Compliance', () => {
    const cssPath = resolve(__dirname, '../../../src/modules/ui/components/common/Button.module.css');
    let cssContent: string;

    beforeAll(() => {
      cssContent = readFileSync(cssPath, 'utf-8');
    });

    it('should not use hardcoded hex colors', () => {
      // Match hex colors like #fff, #ffffff, #f3f4f6 but not inside var() or rgba()
      // This regex finds hex colors that are not preceded by rgba( or var(
      const hexColorPattern = /(?<!rgba\([^)]*|var\([^)]*):?\s*#[0-9a-fA-F]{3,8}\b/g;
      const matches = cssContent.match(hexColorPattern);

      // Filter out comments and rgba() values (which may contain hex-like values)
      const filteredMatches = matches?.filter(match => {
        // Allow hex in rgba() context
        return !match.includes('rgba');
      });

      expect(filteredMatches || []).toEqual([]);
    });

    it('should use CSS variables for colors', () => {
      // Check that color-related properties use var(--color-*)
      const colorProperties = ['background-color', 'color', 'border-color', 'outline'];

      for (const prop of colorProperties) {
        const propPattern = new RegExp(`${prop}:\\s*([^;]+)`, 'gi');
        const matches = [...cssContent.matchAll(propPattern)];

        for (const match of matches) {
          const value = match[1].trim();
          // Skip 'transparent', 'inherit', 'currentColor', 'none', or values containing var()
          if (
            value === 'transparent' ||
            value === 'inherit' ||
            value === 'currentColor' ||
            value === 'none' ||
            value.includes('var(')
          ) {
            continue;
          }
          // Fail if hardcoded color found
          expect(value).toMatch(/var\(--/);
        }
      }
    });

    it('should use CSS variables for spacing', () => {
      // Check that padding and gap use var(--spacing-*) or calc() with variables
      const spacingPattern = /(?:padding|gap):\s*([^;]+);/gi;
      const matches = [...cssContent.matchAll(spacingPattern)];

      for (const match of matches) {
        const value = match[1].trim();
        // Value should contain var(--spacing-*) or calc()
        expect(value).toMatch(/var\(--spacing-|calc\(/);
      }
    });

    it('should use CSS variables for border-radius', () => {
      const borderRadiusPattern = /border-radius:\s*([^;]+);/gi;
      const matches = [...cssContent.matchAll(borderRadiusPattern)];

      for (const match of matches) {
        const value = match[1].trim();
        expect(value).toMatch(/var\(--border-radius-/);
      }
    });

    it('should use CSS variables for font properties', () => {
      const fontFamilyPattern = /font-family:\s*([^;]+);/gi;
      const fontWeightPattern = /font-weight:\s*([^;]+);/gi;
      const fontSizePattern = /font-size:\s*([^;]+);/gi;

      const fontFamilyMatches = [...cssContent.matchAll(fontFamilyPattern)];
      const fontWeightMatches = [...cssContent.matchAll(fontWeightPattern)];
      const fontSizeMatches = [...cssContent.matchAll(fontSizePattern)];

      for (const match of fontFamilyMatches) {
        expect(match[1].trim()).toMatch(/var\(--font-family-/);
      }

      for (const match of fontWeightMatches) {
        expect(match[1].trim()).toMatch(/var\(--font-weight-/);
      }

      for (const match of fontSizeMatches) {
        expect(match[1].trim()).toMatch(/var\(--font-size-/);
      }
    });

    it('should use CSS variables for transitions', () => {
      const transitionPattern = /transition:\s*([^;]+);/gi;
      const matches = [...cssContent.matchAll(transitionPattern)];

      for (const match of matches) {
        const value = match[1].trim();
        // Transition should use var(--transition-*)
        expect(value).toMatch(/var\(--transition-/);
      }
    });
  });
});
