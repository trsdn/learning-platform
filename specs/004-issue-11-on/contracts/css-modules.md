# Contract: CSS Modules Styling Standard

**Branch**: `004-issue-11-on` | **Date**: 2025-10-04 | **Phase**: 1 (Design)

## Purpose

This contract defines the mandatory rules, conventions, and best practices for using CSS Modules across all UI components in the learning platform. All developers MUST adhere to these standards to ensure consistency, maintainability, and constitutional compliance.

## Core Principles

1. **Single Source of Truth**: CSS Modules are the ONLY approved styling approach
2. **Component Scoping**: Every component has its own `.module.css` file
3. **Design Token Usage**: All values derived from CSS custom properties in `variables.css`
4. **Type Safety**: TypeScript declarations for all CSS Module imports
5. **Zero Inline Styles**: No `style={{}}` usage except for dynamic CSS variables

## Mandatory Rules

### Rule 1: File Naming

**MUST**:
- Component file: `ComponentName.tsx`
- Style file: `ComponentName.module.css` (exact match, case-sensitive)
- Located in same directory as component

**MUST NOT**:
- Use generic names like `styles.css`, `component.css`
- Mix extensions (`.css` vs `.module.css`)

```
✅ CORRECT:
src/modules/ui/components/
├── Button.tsx
└── Button.module.css

❌ INCORRECT:
src/modules/ui/components/
├── Button.tsx
└── button.css  (wrong name)
└── Button.style.css  (wrong extension)
```

### Rule 2: Import Statement

**MUST**:
- Import as `styles` (consistent naming)
- Use default import

```tsx
✅ CORRECT:
import styles from './ComponentName.module.css';

❌ INCORRECT:
import './ComponentName.module.css';  // Side-effect import
import * as styles from './ComponentName.module.css';  // Namespace import
import css from './ComponentName.module.css';  // Inconsistent name
```

### Rule 3: Class Application

**MUST**:
- Use `className` prop (not `class`)
- Use `styles.className` syntax
- Use `clsx()` for conditional classes
- Always accept `className` prop for composability

```tsx
✅ CORRECT:
import clsx from 'clsx';
import styles from './Button.module.css';

<button className={clsx(
  styles.button,
  variant === 'primary' && styles['button--primary'],
  disabled && styles['button--disabled'],
  className
)}>

❌ INCORRECT:
<button className="button">  // Hardcoded string
<button className={styles.button + ' ' + className}>  // String concatenation
<button className={`${styles.button} custom`}>  // Template literal (less safe)
```

### Rule 4: No Inline Styles

**MUST NOT**:
- Use `style={{}}` for static styles
- Use inline styles for values that can be CSS custom properties

**EXCEPTION ALLOWED**:
- Dynamic CSS custom properties passed to component

```tsx
✅ CORRECT:
<div
  className={styles.progressBar}
  style={{
    '--progress-percentage': `${percentage}%`,
    '--progress-color': color,
  } as React.CSSProperties}
/>

❌ INCORRECT:
<div
  className={styles.container}
  style={{ padding: '1rem', backgroundColor: '#fff' }}  // Static styles
/>
```

### Rule 5: Design Token Usage

**MUST**:
- Use CSS custom properties from `variables.css` for all design values
- Never hardcode colors, spacing, or typography values

**MUST NOT**:
- Use magic numbers or arbitrary values

```css
✅ CORRECT:
.button {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-primary);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal) var(--transition-ease-in-out);
}

❌ INCORRECT:
.button {
  padding: 16px 24px;  /* Magic numbers */
  background-color: #667eea;  /* Hardcoded color */
  border-radius: 8px;  /* Magic number */
  transition: all 0.2s ease-in-out;  /* Hardcoded timing */
}
```

### Rule 6: Class Naming Conventions

**MUST**:
- Use lowercase with hyphens (kebab-case)
- Use semantic, component-relative names
- Follow BEM-inspired pattern: `element`, `element--modifier`, `element__child`

**MUST NOT**:
- Use camelCase or PascalCase
- Use generic utility names (e.g., `.flex`, `.p-4`)

```css
✅ CORRECT:
.card { }
.card--highlighted { }
.card--disabled { }
.card__header { }
.card__body { }

❌ INCORRECT:
.Card { }  /* PascalCase */
.cardHighlighted { }  /* camelCase */
.flex { }  /* Generic utility */
.p-4 { }  /* Tailwind-style */
```

### Rule 7: TypeScript Declarations

**MUST**:
- Include CSS Module type declarations in `vite-env.d.ts`
- Treat `styles` object as strongly-typed

```typescript
✅ CORRECT (vite-env.d.ts):
/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

✅ CORRECT (usage):
import styles from './Button.module.css';
<button className={styles.button} />  // Type-safe

❌ INCORRECT:
// @ts-ignore
import styles from './Button.module.css';
```

### Rule 8: Component Structure

**MUST**:
- Every presentational component has a corresponding `.module.css` file
- Even if component has minimal styles (1-2 classes)

**EXCEPTION ALLOWED**:
- Pure logic components (hooks, contexts, utilities) - no styles needed
- Components that only compose other styled components

```
✅ CORRECT:
src/modules/ui/components/
├── Button.tsx
├── Button.module.css  ← Even if only 1 class
├── Card.tsx
└── Card.module.css

❌ INCORRECT:
src/modules/ui/components/
├── Button.tsx  ← No corresponding .module.css
```

### Rule 9: Accessibility

**MUST**:
- Styles MUST NOT interfere with accessibility
- Use semantic HTML elements
- Preserve focus outlines (or provide custom high-contrast ones)
- Ensure sufficient color contrast (WCAG AA: 4.5:1 for text)

```css
✅ CORRECT:
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

❌ INCORRECT:
.button:focus {
  outline: none;  /* Removes focus indicator */
}
```

### Rule 10: Responsive Design

**MUST**:
- Use mobile-first approach (base styles = mobile, then scale up)
- Use relative units (rem, em, %) over fixed units (px)
- Use CSS custom properties for breakpoints (if needed)

```css
✅ CORRECT:
.card {
  padding: var(--spacing-md);  /* Mobile */
  width: 100%;
}

@media (min-width: 48rem) {  /* Tablet */
  .card {
    padding: var(--spacing-lg);
    width: 50%;
  }
}

❌ INCORRECT:
.card {
  padding: 32px;  /* Desktop-first */
}

@media (max-width: 768px) {  /* Max-width approach */
  .card {
    padding: 16px;
  }
}
```

## Best Practices

### BP1: Class Organization

Organize classes in logical order within `.module.css`:

1. Base element styles
2. Child element styles (using `__`)
3. Modifier styles (using `--`)
4. State styles (`:hover`, `:focus`, `:disabled`)
5. Media queries

```css
/* ✅ GOOD ORGANIZATION */
/* 1. Base */
.card {
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
}

/* 2. Children */
.card__header { }
.card__body { }
.card__footer { }

/* 3. Modifiers */
.card--highlighted { }
.card--disabled { }

/* 4. States */
.card:hover { }
.card:focus-visible { }

/* 5. Media queries */
@media (min-width: 48rem) {
  .card { }
}
```

### BP2: Conditional Classes with `clsx`

Use `clsx` for clean conditional class application:

```tsx
// ✅ BEST PRACTICE
import clsx from 'clsx';

<button
  className={clsx(
    styles.button,
    variant === 'primary' && styles['button--primary'],
    variant === 'secondary' && styles['button--secondary'],
    size === 'lg' && styles['button--lg'],
    disabled && styles['button--disabled'],
    className
  )}
>
```

### BP3: Composition Over Duplication

Use CSS `composes` for shared styles:

```css
/* BaseButton.module.css */
.button {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
}

/* PrimaryButton.module.css */
.primaryButton {
  composes: button from './BaseButton.module.css';
  background-color: var(--color-primary);
}
```

### BP4: Custom Properties for Dynamic Values

Pass dynamic values via CSS custom properties:

```tsx
// ✅ BEST PRACTICE
<div
  className={styles.avatar}
  style={{
    '--avatar-size': size,
    '--avatar-url': `url(${imageUrl})`,
  } as React.CSSProperties}
/>
```

```css
.avatar {
  width: var(--avatar-size, 3rem);
  height: var(--avatar-size, 3rem);
  background-image: var(--avatar-url);
  background-size: cover;
}
```

### BP5: Transitions for Interactive Elements

All interactive elements should have smooth transitions:

```css
/* ✅ BEST PRACTICE */
.button {
  transition: all var(--transition-normal) var(--transition-ease-in-out);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### BP6: Comments for Complex Styles

Add comments for non-obvious CSS:

```css
/* ✅ BEST PRACTICE */
.modal {
  /* Center modal in viewport using fixed positioning */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  /* Ensure modal appears above backdrop (z-modal = 1050, backdrop = 1040) */
  z-index: var(--z-modal);
}
```

## Testing Contract

### TC1: Class Name Tests

**MUST** verify correct class names are applied:

```tsx
// Component.test.tsx
import { render } from '@testing-library/react';
import { Component } from './Component';
import styles from './Component.module.css';

it('applies correct class names', () => {
  const { container } = render(<Component variant="primary" />);
  const element = container.firstChild as HTMLElement;

  expect(element.className).toContain(styles.component);
  expect(element.className).toContain(styles['component--primary']);
});
```

### TC2: Custom className Prop Test

**MUST** verify `className` prop is applied:

```tsx
it('accepts custom className', () => {
  const { container } = render(<Component className="custom-class" />);
  const element = container.firstChild as HTMLElement;

  expect(element.className).toContain('custom-class');
});
```

### TC3: Visual Regression Tests

**SHOULD** include screenshot tests for critical components:

```tsx
// Playwright E2E test
test('button matches snapshot', async ({ page }) => {
  await page.goto('/components/button');
  await expect(page.locator('[data-testid="button"]')).toHaveScreenshot();
});
```

## Linting and Enforcement

### ESLint Rules (Recommended)

Add to `.eslintrc.js`:

```javascript
module.exports = {
  rules: {
    // Warn on inline style usage (allow for CSS custom properties)
    'react/forbid-dom-props': ['warn', {
      forbid: [{
        propName: 'style',
        message: 'Use CSS Modules instead of inline styles. Exception: CSS custom properties.',
      }],
    }],
  },
};
```

### Stylelint Rules (Optional)

Create `.stylelintrc.json`:

```json
{
  "extends": "stylelint-config-standard",
  "rules": {
    "selector-class-pattern": "^[a-z]+([a-z0-9-]+)?(__([a-z0-9]+-?)+)?(--([a-z0-9]+-?)+)?$",
    "custom-property-pattern": "^[a-z]+(-[a-z0-9]+)*$",
    "color-no-hex": true,
    "length-zero-no-unit": true
  }
}
```

## Migration Checklist

When migrating a component from inline styles to CSS Modules:

- [ ] Create `ComponentName.module.css` in same directory
- [ ] Import styles: `import styles from './ComponentName.module.css';`
- [ ] Extract all inline styles to CSS classes
- [ ] Replace hardcoded values with CSS custom properties
- [ ] Apply classes with `className={styles.className}`
- [ ] Use `clsx` for conditional classes
- [ ] Add `className?: string` prop to component interface
- [ ] Update tests to verify class names
- [ ] Run visual regression tests (screenshot comparison)
- [ ] Run accessibility tests (no WCAG violations)
- [ ] Verify no console warnings/errors
- [ ] Remove all `style={{}}` usage (except CSS custom properties)
- [ ] Update component documentation if needed

## Constitutional Compliance

This contract ensures compliance with project constitution:

- ✅ **Zero-Cost Static**: CSS extracted at build time, no runtime overhead
- ✅ **Modular Architecture**: Component-scoped styles maintain separation
- ✅ **Complete Automation**: Vite handles CSS Modules automatically
- ✅ **Type-Safe & Testable**: TypeScript declarations + test patterns
- ✅ **Offline-First PWA**: Static CSS bundled with app
- ✅ **Maintainability First**: Consistent patterns, design tokens, clear structure

## Approval & Exceptions

### Approval Required For:
- New CSS custom properties in `variables.css` (must align with design system)
- New shared utility classes in `utilities.css` (must be justified)
- Deviations from naming conventions (requires architectural review)

### No Exceptions Allowed For:
- Using inline styles for static values
- Using hardcoded colors/spacing instead of design tokens
- Skipping `.module.css` file for presentational components
- Using alternative styling approaches (Tailwind, CSS-in-JS, etc.)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-04 | Initial contract for CSS Modules standardization |

---

**Signed Off**: This contract is binding for all contributors to the learning platform codebase.
