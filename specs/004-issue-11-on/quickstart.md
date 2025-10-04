# CSS Modules Quick Start Guide

**For developers working on the learning platform**

## TL;DR

1. Create `ComponentName.module.css` next to `ComponentName.tsx`
2. Import: `import styles from './ComponentName.module.css';`
3. Use design tokens: `var(--color-primary)`, `var(--spacing-md)`, etc.
4. Apply classes: `className={styles.className}`
5. Conditional classes: Use `clsx()` helper

## 30-Second Example

```tsx
// Button.tsx
import styles from './Button.module.css';
import clsx from 'clsx';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  disabled = false,
  children,
}) => (
  <button
    className={clsx(
      styles.button,
      styles[`button--${variant}`],
      disabled && styles['button--disabled']
    )}
    disabled={disabled}
  >
    {children}
  </button>
);
```

```css
/* Button.module.css */
.button {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.button--primary {
  background-color: var(--color-primary);
}

.button--secondary {
  background-color: var(--color-secondary);
}

.button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Common Design Tokens

Copy-paste these into your CSS:

### Colors
```css
/* Primary colors */
var(--color-primary)       /* #667eea */
var(--color-primary-dark)  /* #764ba2 */
var(--color-secondary)     /* #f093fb */

/* Semantic colors */
var(--color-success)       /* Green */
var(--color-error)         /* Red */
var(--color-warning)       /* Yellow */
var(--color-info)          /* Blue */

/* Text colors */
var(--color-text-primary)    /* Dark gray */
var(--color-text-secondary)  /* Light gray */
var(--color-text-inverse)    /* White */

/* Background colors */
var(--color-bg-primary)      /* White */
var(--color-bg-secondary)    /* Light gray */
var(--color-bg-tertiary)     /* Medium gray */
```

### Spacing
```css
var(--spacing-xs)   /* 4px */
var(--spacing-sm)   /* 8px */
var(--spacing-md)   /* 16px */
var(--spacing-lg)   /* 24px */
var(--spacing-xl)   /* 32px */
var(--spacing-2xl)  /* 48px */
```

### Typography
```css
/* Font sizes */
var(--font-size-xs)   /* 12px */
var(--font-size-sm)   /* 14px */
var(--font-size-md)   /* 16px */
var(--font-size-lg)   /* 18px */
var(--font-size-xl)   /* 20px */
var(--font-size-2xl)  /* 24px */

/* Font weights */
var(--font-weight-normal)    /* 400 */
var(--font-weight-medium)    /* 500 */
var(--font-weight-semibold)  /* 600 */
var(--font-weight-bold)      /* 700 */
```

### Border & Shadows
```css
/* Border radius */
var(--border-radius-sm)    /* 6px */
var(--border-radius-md)    /* 8px */
var(--border-radius-lg)    /* 16px */
var(--border-radius-xl)    /* 24px */
var(--border-radius-full)  /* 9999px - for circles */

/* Shadows */
var(--shadow-sm)   /* Subtle */
var(--shadow-md)   /* Medium */
var(--shadow-lg)   /* Large */
var(--shadow-xl)   /* Extra large */
```

### Transitions
```css
/* Durations */
var(--transition-fast)    /* 150ms */
var(--transition-normal)  /* 200ms */
var(--transition-slow)    /* 300ms */

/* Easing functions */
var(--transition-ease-in-out)
var(--transition-ease-out)
var(--transition-ease-in)

/* Common pattern */
transition: all var(--transition-normal) var(--transition-ease-in-out);
```

## Common Patterns

### Pattern 1: Hover Effects

```css
.button {
  transition: all var(--transition-normal);
}

.button:hover:not(.button--disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### Pattern 2: Focus States (Accessibility)

```css
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Pattern 3: Conditional Classes

```tsx
// Component
import clsx from 'clsx';

<div className={clsx(
  styles.card,
  isActive && styles['card--active'],
  isDisabled && styles['card--disabled']
)} />
```

### Pattern 4: Dynamic Values with CSS Variables

```tsx
// Component
<div
  className={styles.progressBar}
  style={{
    '--progress-percentage': `${percentage}%`,
  } as React.CSSProperties}
/>
```

```css
/* CSS */
.progressBar {
  width: var(--progress-percentage, 0%);
  transition: width var(--transition-normal);
}
```

### Pattern 5: Custom className Prop

```tsx
interface ComponentProps {
  className?: string;
  // ... other props
}

export const Component: React.FC<ComponentProps> = ({ className, ... }) => (
  <div className={clsx(styles.component, className)}>
    {/* ... */}
  </div>
);
```

## Class Naming Cheat Sheet

```css
/* Element */
.button { }
.card { }
.input { }

/* Modifier (variant) */
.button--primary { }
.button--secondary { }
.card--highlighted { }

/* State modifier */
.button--disabled { }
.input--error { }
.card--selected { }

/* Child element */
.card__header { }
.card__body { }
.card__footer { }
```

**Rules**:
- Lowercase with hyphens (`kebab-case`)
- Element: `.element`
- Modifier: `.element--modifier`
- Child: `.element__child`

## Migration Checklist

Converting from inline styles? Follow these steps:

```tsx
// ❌ BEFORE (inline styles)
<button
  style={{
    padding: '16px 24px',
    backgroundColor: '#667eea',
    color: '#fff',
    borderRadius: '8px',
  }}
>
  Click Me
</button>
```

**Step 1**: Create `Button.module.css`
```css
.button {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--border-radius-md);
}
```

**Step 2**: Import and apply
```tsx
// ✅ AFTER (CSS Modules)
import styles from './Button.module.css';

<button className={styles.button}>
  Click Me
</button>
```

## TypeScript Setup

Add to `vite-env.d.ts` (one-time setup):

```typescript
/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

## Testing Your Component

```tsx
import { render } from '@testing-library/react';
import { Component } from './Component';
import styles from './Component.module.css';

it('applies correct classes', () => {
  const { container } = render(<Component variant="primary" />);
  const element = container.firstChild as HTMLElement;

  expect(element.className).toContain(styles.component);
  expect(element.className).toContain(styles['component--primary']);
});
```

## Common Mistakes to Avoid

### ❌ Hardcoded Values
```css
/* BAD */
.button {
  padding: 16px 24px;           /* Use var(--spacing-md) var(--spacing-lg) */
  background-color: #667eea;    /* Use var(--color-primary) */
  border-radius: 8px;           /* Use var(--border-radius-md) */
}
```

### ❌ Inline Styles for Static Values
```tsx
/* BAD */
<button
  className={styles.button}
  style={{ padding: '1rem', color: '#fff' }}  // Put in CSS file!
>
```

### ❌ String Concatenation
```tsx
/* BAD */
<button className={styles.button + ' ' + className}>  // Use clsx()

/* GOOD */
<button className={clsx(styles.button, className)}>
```

### ❌ Missing className Prop
```tsx
/* BAD - Component can't be styled from parent */
interface ButtonProps {
  variant: string;
  // Missing: className?: string;
}

/* GOOD */
interface ButtonProps {
  variant: string;
  className?: string;  // ✅ Always include this
}
```

## File Structure at a Glance

```
src/modules/ui/components/
├── Button.tsx                  ← Component
├── Button.module.css           ← Styles
├── Button.test.tsx             ← Tests
├── Card.tsx
├── Card.module.css
└── common/
    ├── IconButton.tsx
    └── IconButton.module.css

src/modules/ui/styles/
├── variables.css               ← Design tokens (import these)
├── utilities.css               ← Shared utilities (rare)
└── global.css                  ← Global resets
```

## Getting Help

- **Full details**: See `contracts/css-modules.md`
- **Component examples**: Check `TopicCard.tsx` + `TopicCard.module.css`
- **Design tokens**: Browse `src/modules/ui/styles/variables.css`
- **Questions**: Ask in code review or create a discussion

## Before Committing

- [ ] Created `.module.css` file with same name as `.tsx`
- [ ] Used design tokens (no hardcoded colors/spacing)
- [ ] Applied classes with `styles.className`
- [ ] Added `className?: string` prop
- [ ] Used `clsx()` for conditional classes
- [ ] No `style={{}}` except for CSS custom properties
- [ ] Tests verify class names
- [ ] Component renders correctly in browser

---

**Remember**: CSS Modules are the ONLY approved styling approach. No inline styles, no Tailwind, no CSS-in-JS.
