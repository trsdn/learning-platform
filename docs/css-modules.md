# CSS Modules Styling Guide

**Last Updated**: 2025-10-05

## Quick Rules

### File Structure
```
src/modules/ui/components/
├── Button.tsx
├── Button.module.css  ← REQUIRED
└── Button.test.tsx
```

### Import & Usage
```tsx
import styles from './Button.module.css';
import clsx from 'clsx';

<button className={clsx(
  styles.button,
  variant === 'primary' && styles['button--primary'],
  disabled && styles['button--disabled']
)}>
```

---

## Mandatory Rules

### ✅ DO

**1. Use design tokens** from `src/modules/ui/styles/variables.css`:
```css
.button {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-primary);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
}
```

**2. BEM-inspired class naming** (kebab-case):
```css
.card { }                /* Element */
.card--highlighted { }   /* Modifier */
.card__header { }        /* Child */
```

**3. Accept `className` prop** for composability:
```tsx
interface ButtonProps {
  className?: string;
  // ...
}

<button className={clsx(styles.button, className)}>
```

**4. Use `clsx` for conditionals**:
```tsx
<button className={clsx(
  styles.button,
  isPrimary && styles['button--primary'],
  isDisabled && styles['button--disabled']
)}>
```

**5. Dynamic values via CSS custom properties**:
```tsx
<div
  className={styles.progressBar}
  style={{
    '--progress-percentage': `${percentage}%`,
    '--progress-color': color,
  } as React.CSSProperties}
/>
```

```css
.progressBar {
  width: var(--progress-percentage, 0%);
  background-color: var(--progress-color, var(--color-primary));
}
```

---

### ❌ DON'T

**1. No inline styles** (except CSS custom properties):
```tsx
// ❌ WRONG
<div style={{ padding: '1rem', color: '#333' }} />

// ✅ CORRECT
<div className={styles.container} />
```

**2. No hardcoded values**:
```css
/* ❌ WRONG */
.button {
  padding: 16px 24px;
  background-color: #667eea;
}

/* ✅ CORRECT */
.button {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-primary);
}
```

**3. No generic utility names**:
```css
/* ❌ WRONG */
.flex { }
.p-4 { }
.text-center { }

/* ✅ CORRECT */
.card__header { }
.button--primary { }
```

---

## Design Tokens Reference

**Common tokens** in `src/modules/ui/styles/variables.css`:

### Colors
```css
var(--color-primary)        /* #667eea */
var(--color-text-primary)   /* Dark gray */
var(--color-bg-primary)     /* White */
var(--color-success)        /* Green */
var(--color-error)          /* Red */
```

### Spacing
```css
var(--spacing-xs)   /* 4px */
var(--spacing-sm)   /* 8px */
var(--spacing-md)   /* 16px */
var(--spacing-lg)   /* 24px */
var(--spacing-xl)   /* 32px */
```

### Typography
```css
var(--font-size-sm)         /* 14px */
var(--font-size-md)         /* 16px */
var(--font-size-lg)         /* 18px */
var(--font-weight-normal)   /* 400 */
var(--font-weight-semibold) /* 600 */
var(--font-weight-bold)     /* 700 */
```

### Border & Radius
```css
var(--border-radius-sm)  /* 4px */
var(--border-radius-md)  /* 8px */
var(--border-radius-lg)  /* 12px */
```

### Transitions
```css
var(--transition-fast)    /* 100ms */
var(--transition-normal)  /* 200ms */
var(--transition-slow)    /* 300ms */
```

---

## Full Example

```tsx
// Button.tsx
import { type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  children,
  onClick,
}: ButtonProps) => (
  <button
    className={clsx(
      styles.button,
      styles[`button--${variant}`],
      styles[`button--${size}`],
      disabled && styles['button--disabled'],
      className
    )}
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
);
```

```css
/* Button.module.css */

/* Base */
.button {
  padding: var(--spacing-md) var(--spacing-lg);
  font-weight: var(--font-weight-semibold);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

/* Variants */
.button--primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.button--secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

/* Sizes */
.button--sm {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.button--lg {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-lg);
}

/* States */
.button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button:hover:not(.button--disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Responsive */
@media (min-width: 48rem) {
  .button {
    padding: var(--spacing-lg) var(--spacing-xl);
  }
}
```

---

## Accessibility Requirements

**MUST include**:
- Semantic HTML elements (`<button>` not `<div>`)
- Focus indicators (`:focus-visible`)
- High contrast colors (4.5:1 ratio for text)

```css
/* ✅ CORRECT */
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ❌ WRONG */
.button:focus {
  outline: none;  /* Removes accessibility */
}
```

**Test with jest-axe**:
```tsx
import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { Button } from './Button';

it('has no WCAG violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Common Patterns

### Conditional Styling
```tsx
<div className={clsx(
  styles.card,
  isActive && styles['card--active'],
  isLoading && styles['card--loading']
)}>
```

### Composition
```css
/* BaseCard.module.css */
.card {
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
}

/* HighlightCard.module.css */
.highlightCard {
  composes: card from './BaseCard.module.css';
  border: 2px solid var(--color-primary);
}
```

### Responsive Design (Mobile-First)
```css
.grid {
  display: grid;
  grid-template-columns: 1fr;  /* Mobile: 1 column */
  gap: var(--spacing-md);
}

@media (min-width: 48rem) {  /* Tablet */
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 64rem) {  /* Desktop */
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Reference Implementation

See `src/modules/ui/components/TopicCard.tsx` + `TopicCard.module.css` for complete example.

---

## TypeScript Setup

Add to `vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

---

## Migration Checklist

When converting a component to CSS Modules:

- [ ] Create `ComponentName.module.css`
- [ ] Import: `import styles from './ComponentName.module.css';`
- [ ] Replace all inline styles with CSS classes
- [ ] Replace hardcoded values with design tokens
- [ ] Apply classes: `className={styles.className}`
- [ ] Use `clsx` for conditional classes
- [ ] Add `className?: string` prop
- [ ] Remove all `style={{}}` (except CSS custom properties)
- [ ] Test with `npm run build` (TypeScript check)
- [ ] Test accessibility with `jest-axe`
