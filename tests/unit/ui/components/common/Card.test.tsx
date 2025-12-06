/**
 * Tests for Card Component
 *
 * Tests the card component functionality including:
 * - Rendering with required and optional props
 * - Padding variants
 * - Shadow and border states
 * - Custom styling (colors, className)
 * - Children rendering
 * - Accessibility
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import '../../../../setup/a11y-matchers';
import { Card } from '@/modules/ui/components/common/Card';

describe('Card', () => {
  beforeEach(() => {
    // Clear any potential state between tests
  });

  // Rendering tests
  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<Card>Test Content</Card>);

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <Card>
          <h3>Card Title</h3>
          <p>Card content</p>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders with default props', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card).toBeInTheDocument();
      expect(card.tagName).toBe('DIV');
    });
  });

  // Padding variant tests
  describe('Padding Variants', () => {
    it('renders with small padding', () => {
      const { container } = render(<Card padding="small">Small Padding</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card.className).toContain('card--padding-small');
    });

    it('renders with medium padding (default)', () => {
      const { container } = render(<Card padding="medium">Medium Padding</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card.className).toContain('card--padding-medium');
    });

    it('renders with large padding', () => {
      const { container } = render(<Card padding="large">Large Padding</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card.className).toContain('card--padding-large');
    });

    it('defaults to medium padding when not specified', () => {
      const { container } = render(<Card>Default</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card.className).toContain('card--padding-medium');
    });
  });

  // Shadow tests
  describe('Shadow', () => {
    it('renders with shadow by default', () => {
      const { container } = render(<Card>With Shadow</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card.className).toContain('card--shadow');
    });

    it('renders with shadow when shadow=true', () => {
      const { container } = render(<Card shadow={true}>With Shadow</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card.className).toContain('card--shadow');
    });

    it('renders without shadow when shadow=false', () => {
      const { container } = render(<Card shadow={false}>No Shadow</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card.className).toContain('card--no-shadow');
      expect(card.className).not.toContain('card--shadow');
    });
  });

  // Border tests
  describe('Border', () => {
    it('renders with border by default', () => {
      const { container } = render(<Card>With Border</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card.className).toContain('card--border');
    });

    it('renders with border when border=true', () => {
      const { container } = render(<Card border={true}>With Border</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card.className).toContain('card--border');
    });

    it('renders without border when border=false', () => {
      const { container } = render(<Card border={false}>No Border</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card.className).toContain('card--no-border');
      expect(card.className).not.toContain('card--border');
    });
  });

  // Custom styling tests
  describe('Custom Styling', () => {
    it('applies custom backgroundColor', () => {
      const { container } = render(
        <Card backgroundColor="rgb(255, 0, 0)">Custom Background</Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('applies custom borderColor', () => {
      const { container } = render(
        <Card borderColor="rgb(0, 255, 0)">Custom Border</Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card.style.borderColor).toBe('rgb(0, 255, 0)');
    });

    it('applies both custom colors', () => {
      const { container } = render(
        <Card
          backgroundColor="rgb(255, 0, 0)"
          borderColor="rgb(0, 255, 0)"
        >
          Custom Colors
        </Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card.style.backgroundColor).toBe('rgb(255, 0, 0)');
      expect(card.style.borderColor).toBe('rgb(0, 255, 0)');
    });

    it('applies custom className', () => {
      const { container } = render(
        <Card className="custom-class">Custom Class</Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card.className).toContain('custom-class');
      expect(card.className).toContain('card'); // Should still have base class
    });

    it('merges custom style with component styles', () => {
      const { container } = render(
        // eslint-disable-next-line no-restricted-syntax
        <Card style={{ margin: '10px' }} backgroundColor="rgb(255, 255, 255)">
          Merged Styles
        </Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card.style.margin).toBe('10px');
      expect(card.style.backgroundColor).toBe('rgb(255, 255, 255)');
    });
  });

  // HTML attributes tests
  describe('HTML Attributes', () => {
    it('forwards additional HTML attributes', () => {
      const { container } = render(
        <Card data-testid="custom-card" id="card-id">
          Content
        </Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveAttribute('data-testid', 'custom-card');
      expect(card).toHaveAttribute('id', 'card-id');
    });

    it('supports ARIA attributes', () => {
      const { container } = render(
        <Card role="article" aria-label="Featured content">
          Content
        </Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveAttribute('role', 'article');
      expect(card).toHaveAttribute('aria-label', 'Featured content');
    });
  });

  // Combination tests
  describe('Combination of Props', () => {
    it('renders with all custom props combined', () => {
      const { container } = render(
        <Card
          padding="large"
          shadow={false}
          border={false}
          backgroundColor="#f0f0f0"
          borderColor="#cccccc"
          className="custom-card"
        >
          All Props
        </Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card.className).toContain('card--padding-large');
      expect(card.className).toContain('card--no-shadow');
      expect(card.className).toContain('card--no-border');
      expect(card.className).toContain('custom-card');
      expect(card.style.backgroundColor).toBe('#f0f0f0');
      expect(card.style.borderColor).toBe('#cccccc');
    });

    it('renders with mixed shadow and border states', () => {
      const { container } = render(
        <Card shadow={true} border={false}>Shadow Only</Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card.className).toContain('card--shadow');
      expect(card.className).toContain('card--no-border');
    });

    it('renders with all padding variants and different shadow/border combinations', () => {
      const variants = [
        { padding: 'small' as const, shadow: true, border: true },
        { padding: 'medium' as const, shadow: false, border: true },
        { padding: 'large' as const, shadow: true, border: false },
      ];

      variants.forEach((props, index) => {
        const { container } = render(<Card {...props}>Variant {index}</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card.className).toContain(`card--padding-${props.padding}`);
      });
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('has no WCAG violations with default props', async () => {
      const { container } = render(<Card>Accessible Card</Card>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with custom props', async () => {
      const { container } = render(
        <Card
          padding="large"
          shadow={false}
          backgroundColor="#ffffff"
          role="region"
          aria-label="Card region"
        >
          <h3>Title</h3>
          <p>Content</p>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no WCAG violations with all variants', async () => {
      const { container } = render(
        <div>
          <Card padding="small">Small</Card>
          <Card padding="medium">Medium</Card>
          <Card padding="large">Large</Card>
          <Card shadow={false}>No Shadow</Card>
          <Card border={false}>No Border</Card>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports semantic HTML inside', async () => {
      const { container } = render(
        <Card>
          <article>
            <h2>Article Title</h2>
            <p>Article content</p>
            <footer>Footer content</footer>
          </article>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // Integration tests
  describe('Integration', () => {
    it('renders multiple cards correctly', () => {
      render(
        <div>
          <Card>Card 1</Card>
          <Card>Card 2</Card>
          <Card>Card 3</Card>
        </div>
      );

      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
      expect(screen.getByText('Card 3')).toBeInTheDocument();
    });

    it('can be nested inside other elements', () => {
      render(
        <div data-testid="wrapper">
          <Card>
            <div data-testid="inner">
              <Card>Nested Card</Card>
            </div>
          </Card>
        </div>
      );

      expect(screen.getByTestId('wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('inner')).toBeInTheDocument();
      expect(screen.getByText('Nested Card')).toBeInTheDocument();
    });

    it('handles complex children structures', () => {
      render(
        <Card>
          <div>
            <h1>Title</h1>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
            <button>Action</button>
          </div>
        </Card>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<Card>{null}</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card).toBeInTheDocument();
      expect(card.textContent).toBe('');
    });

    it('handles undefined style properties', () => {
      const { container } = render(
        <Card backgroundColor={undefined} borderColor={undefined}>
          Content
        </Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card).toBeInTheDocument();
      expect(card.style.backgroundColor).toBe('');
      expect(card.style.borderColor).toBe('');
    });

    it('handles very long content', () => {
      const longContent = 'A'.repeat(1000);
      render(<Card>{longContent}</Card>);

      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('handles special characters in children', () => {
      const specialChars = `<>&"'`;
      render(<Card>{specialChars}</Card>);

      expect(screen.getByText(specialChars)).toBeInTheDocument();
    });
  });
});
