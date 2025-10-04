# Data Model: CSS Module Patterns & Component Structure

**Branch**: `004-issue-11-on` | **Date**: 2025-10-04 | **Phase**: 1 (Design)

## Overview

This document defines the structural patterns, naming conventions, and architectural decisions for CSS Modules implementation across all UI components. While this is a styling feature (not a data feature), we define the "data model" as the structure of CSS classes, file organization, and style composition patterns.

## File Structure Pattern

### Standard Component Structure
```
src/modules/ui/components/
├── ComponentName.tsx          # Component logic
├── ComponentName.module.css   # Component styles
└── ComponentName.test.tsx     # Component tests
```

### Complex Component Structure
```
src/modules/ui/components/
├── component-name/
│   ├── index.ts                    # Public exports
│   ├── ComponentName.tsx           # Main component
│   ├── ComponentName.module.css    # Main styles
│   ├── SubComponent.tsx            # Internal sub-component
│   ├── SubComponent.module.css     # Sub-component styles
│   └── ComponentName.test.tsx      # Tests
```

### Shared Styles Location
```
src/modules/ui/styles/
├── variables.css      # CSS custom properties (design tokens)
├── utilities.css      # Utility classes (optional, minimal)
├── global.css         # Global resets and base styles
└── types.d.ts         # TypeScript declarations for CSS Modules
```

## CSS Class Naming Conventions

### BEM-Inspired Pattern (Simplified for CSS Modules)

Since CSS Modules automatically scope classes, we don't need full BEM syntax. Use semantic, component-relative names.

**Pattern**: `element`, `element--modifier`, `element__child`

```css
/* ✅ GOOD: Simple, semantic names */
.card { }
.card--disabled { }
.card__title { }
.card__description { }

/* ❌ BAD: Overly generic (even with scoping, avoid confusion) */
.container { }
.wrapper { }
.box { }

/* ❌ BAD: Tailwind-style utility names in CSS Modules */
.flex { }
.p-4 { }
.text-center { }
```

### Class Name Categories

1. **Element Classes** (structural components)
   - `.button`, `.card`, `.input`, `.icon`

2. **State Modifiers** (component states)
   - `.button--disabled`, `.input--error`, `.card--selected`

3. **Variant Modifiers** (visual variants)
   - `.button--primary`, `.button--secondary`, `.card--highlighted`

4. **Child Elements** (nested structural parts)
   - `.card__header`, `.card__body`, `.card__footer`

## Design Token System

### CSS Custom Properties (variables.css)

```css
:root {
  /* Colors */
  --color-primary: #667eea;
  --color-primary-dark: #764ba2;
  --color-secondary: #f093fb;
  --color-success: #4ade80;
  --color-error: #f87171;
  --color-warning: #fbbf24;
  --color-info: #60a5fa;

  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --color-text-inverse: #ffffff;

  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f3f4f6;
  --color-bg-tertiary: #e5e7eb;

  /* Spacing (based on 0.25rem = 4px) */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-md: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  --font-size-3xl: 2rem;     /* 32px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Border */
  --border-radius-sm: 0.375rem;  /* 6px */
  --border-radius-md: 0.5rem;    /* 8px */
  --border-radius-lg: 1rem;      /* 16px */
  --border-radius-xl: 1.5rem;    /* 24px */
  --border-radius-full: 9999px;

  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --border-width-thick: 4px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

  /* Transitions */
  --transition-fast: 150ms;
  --transition-normal: 200ms;
  --transition-slow: 300ms;

  --transition-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --transition-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --transition-ease-in: cubic-bezier(0.4, 0, 1, 1);

  /* Z-index layers */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

### Using Design Tokens

```css
/* ComponentName.module.css */
.button {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal) var(--transition-ease-in-out);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}
```

## Component Pattern Library

### 1. Button Component

**Structure**:
```tsx
// Button.tsx
import styles from './Button.module.css';
import clsx from 'clsx';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  children,
  onClick,
}) => {
  return (
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
};
```

**Styles**:
```css
/* Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-normal) var(--transition-ease-in-out);
  text-decoration: none;
}

.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Variants */
.button--primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.button--primary:hover:not(.button--disabled) {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.button--secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.button--outline {
  background-color: transparent;
  border: var(--border-width-medium) solid var(--color-primary);
  color: var(--color-primary);
}

/* Sizes */
.button--sm {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.button--md {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-md);
}

.button--lg {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-lg);
}

/* States */
.button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

### 2. Card Component

**Structure**:
```tsx
// Card.tsx
import styles from './Card.module.css';
import clsx from 'clsx';

interface CardProps {
  variant?: 'default' | 'highlighted' | 'gradient';
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  interactive = false,
  className,
  children,
  onClick,
}) => {
  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      className={clsx(
        styles.card,
        styles[`card--${variant}`],
        interactive && styles['card--interactive'],
        className
      )}
      onClick={onClick}
      {...(interactive && { type: 'button' })}
    >
      {children}
    </Component>
  );
};
```

**Styles**:
```css
/* Card.module.css */
.card {
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  background-color: var(--color-bg-primary);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal) var(--transition-ease-in-out);
}

.card--default {
  border: var(--border-width-thin) solid var(--color-bg-tertiary);
}

.card--highlighted {
  border: var(--border-width-medium) solid var(--color-primary);
}

.card--gradient {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-text-inverse);
}

.card--interactive {
  cursor: pointer;
  border: none;
  text-align: left;
  width: 100%;
}

.card--interactive:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card--interactive:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 3. Input Component

**Structure**:
```tsx
// Input.tsx
import styles from './Input.module.css';
import clsx from 'clsx';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  error = false,
  disabled = false,
  className,
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={clsx(
        styles.input,
        error && styles['input--error'],
        disabled && styles['input--disabled'],
        className
      )}
    />
  );
};
```

**Styles**:
```css
/* Input.module.css */
.input {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--font-size-md);
  font-family: var(--font-family-base);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: var(--border-width-medium) solid var(--color-bg-tertiary);
  border-radius: var(--border-radius-md);
  transition: border-color var(--transition-fast) var(--transition-ease-in-out);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.input::placeholder {
  color: var(--color-text-secondary);
}

.input--error {
  border-color: var(--color-error);
}

.input--error:focus {
  border-color: var(--color-error);
}

.input--disabled {
  background-color: var(--color-bg-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}
```

## Handling Dynamic Styles

### Approach 1: CSS Custom Properties (Recommended)

Use CSS variables for dynamic values passed from props.

```tsx
// ProgressBar.tsx
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  percentage: number;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = 'var(--color-primary)',
}) => {
  return (
    <div className={styles.container}>
      <div
        className={styles.bar}
        style={{
          '--progress-percentage': `${percentage}%`,
          '--progress-color': color,
        } as React.CSSProperties}
      />
    </div>
  );
};
```

```css
/* ProgressBar.module.css */
.container {
  width: 100%;
  height: 0.5rem;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--border-radius-full);
  overflow: hidden;
}

.bar {
  height: 100%;
  width: var(--progress-percentage, 0%);
  background-color: var(--progress-color, var(--color-primary));
  transition: width var(--transition-normal) var(--transition-ease-out);
}
```

### Approach 2: Conditional Classes with `clsx`

For discrete state variations, use conditional class application.

```tsx
// Alert.tsx
import styles from './Alert.module.css';
import clsx from 'clsx';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  dismissible?: boolean;
}

export const Alert: React.FC<AlertProps> = ({ type, message, dismissible }) => {
  return (
    <div
      className={clsx(
        styles.alert,
        styles[`alert--${type}`],
        dismissible && styles['alert--dismissible']
      )}
    >
      {message}
    </div>
  );
};
```

```css
/* Alert.module.css */
.alert {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  border-left: var(--border-width-thick) solid;
}

.alert--success {
  background-color: rgba(74, 222, 128, 0.1);
  border-left-color: var(--color-success);
  color: #16a34a;
}

.alert--error {
  background-color: rgba(248, 113, 113, 0.1);
  border-left-color: var(--color-error);
  color: #dc2626;
}

.alert--warning {
  background-color: rgba(251, 191, 36, 0.1);
  border-left-color: var(--color-warning);
  color: #d97706;
}

.alert--info {
  background-color: rgba(96, 165, 250, 0.1);
  border-left-color: var(--color-info);
  color: #2563eb;
}

.alert--dismissible {
  padding-right: var(--spacing-2xl);
  position: relative;
}
```

## Composition Patterns

### Pattern 1: Importing Multiple Modules

```tsx
// ComplexComponent.tsx
import styles from './ComplexComponent.module.css';
import buttonStyles from '../common/Button.module.css';
import clsx from 'clsx';

export const ComplexComponent = () => {
  return (
    <div className={styles.container}>
      <button className={clsx(buttonStyles.button, styles.customButton)}>
        Click Me
      </button>
    </div>
  );
};
```

### Pattern 2: CSS Composition with `composes`

```css
/* Button.module.css (base) */
.button {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
}

/* PrimaryButton.module.css (extended) */
.primaryButton {
  composes: button from './Button.module.css';
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}
```

## TypeScript Integration

### Global Type Declaration

```typescript
// src/modules/ui/styles/types.d.ts
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

### Vite Environment Type Extension

```typescript
// vite-env.d.ts (add to existing file)
/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

## Animation Patterns

### Keyframe Animations

```css
/* Spinner.module.css */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: var(--border-width-thick) solid var(--color-bg-tertiary);
  border-top-color: var(--color-primary);
  border-radius: var(--border-radius-full);
  animation: spin var(--transition-slow) linear infinite;
}
```

### Transition Effects

```css
/* Modal.module.css */
.modalBackdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity var(--transition-normal) var(--transition-ease-in-out);
  z-index: var(--z-modal-backdrop);
}

.modalBackdrop--visible {
  opacity: 1;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  opacity: 0;
  transition: all var(--transition-normal) var(--transition-ease-out);
  z-index: var(--z-modal);
}

.modal--visible {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}
```

## Responsive Design Patterns

### Mobile-First Approach

```css
/* Card.module.css */
.card {
  padding: var(--spacing-md);
  width: 100%;
}

/* Tablet (768px+) */
@media (min-width: 48rem) {
  .card {
    padding: var(--spacing-lg);
    width: 50%;
  }
}

/* Desktop (1024px+) */
@media (min-width: 64rem) {
  .card {
    padding: var(--spacing-xl);
    width: 33.333%;
  }
}
```

### Container Queries (Future Enhancement)

```css
/* Component.module.css */
.container {
  container-type: inline-size;
  container-name: card-container;
}

.component {
  padding: var(--spacing-sm);
}

@container card-container (min-width: 400px) {
  .component {
    padding: var(--spacing-lg);
  }
}
```

## Migration from Inline Styles

### Before (Inline Styles)

```tsx
// Old approach
<button
  style={{
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    backgroundColor: '#667eea',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = '#764ba2';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = '#667eea';
  }}
>
  Click Me
</button>
```

### After (CSS Modules)

```tsx
// New approach - Button.tsx
import styles from './Button.module.css';

<button className={styles.button}>
  Click Me
</button>
```

```css
/* Button.module.css */
.button {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.button:hover {
  background-color: var(--color-primary-dark);
}
```

## Testing Considerations

### Class Name Assertions

```tsx
// Button.test.tsx
import { render } from '@testing-library/react';
import { Button } from './Button';
import styles from './Button.module.css';

it('applies correct class names', () => {
  const { container } = render(<Button variant="primary">Click</Button>);
  const button = container.querySelector('button');

  expect(button?.className).toContain(styles.button);
  expect(button?.className).toContain(styles['button--primary']);
});
```

### Custom className Prop

All components should accept `className` prop for composability:

```tsx
interface ComponentProps {
  className?: string;
  // ... other props
}

export const Component: React.FC<ComponentProps> = ({ className, ... }) => {
  return <div className={clsx(styles.component, className)} />;
};
```

## Summary

This data model establishes:
- ✅ Consistent file structure (component + module.css)
- ✅ Semantic naming conventions (BEM-inspired, simplified)
- ✅ Comprehensive design token system (CSS custom properties)
- ✅ Reusable component patterns (Button, Card, Input)
- ✅ Dynamic style handling (CSS variables + clsx)
- ✅ TypeScript integration (module declarations)
- ✅ Migration path from inline styles

Next: Create `contracts/css-modules.md` to document the rules and conventions.
