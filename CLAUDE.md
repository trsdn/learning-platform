# Learning Platform Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-04

## Target Audience & Scale

**Primary Users**: Students at Gymnasium (German secondary school, grades 5-13, ages 10-19)
**User Base**: Small, focused group (<100 concurrent users)
**Design Philosophy**: Optimized for educational effectiveness, NOT mass-market scaling

**Key Implications**:
- UI/UX tailored for teenage learners (ages 10-19)
- German language interface required
- Performance targets: hundreds of questions, not millions
- Simplicity over enterprise scalability features

## Active Technologies
- **Language**: TypeScript 5.x / JavaScript ES2022
- **Build Tool**: Vite (zero-config bundler)
- **Framework**: React 18.3
- **Styling**: CSS Modules (component-scoped stylesheets)
- **Storage**: IndexedDB with Dexie.js wrapper, LocalStorage for settings
- **Testing**: Vitest for unit tests, Playwright for E2E tests, jest-axe for accessibility
- **PWA**: Workbox (service worker), Web App Manifest
- **Offline**: Service workers with multiple caching strategies
- TypeScript 5.x / JavaScript ES2022 + React (UI framework), Vite (build tool), HTML5 Audio API (005-issue-23)
- LocalStorage for audio settings (user preferences), IndexedDB with Dexie.js for audio metadata caching (005-issue-23)

## Project Structure
```
public/               # Static assets, PWA manifest
src/
├── modules/
│   ├── core/         # Domain logic (entities, services)
│   ├── storage/      # Storage adapters (IndexedDB, LocalStorage)
│   ├── ui/           # Presentation layer (components, pages, hooks)
│   │   ├── components/      # UI components (*.tsx + *.module.css)
│   │   ├── styles/          # Shared styles (variables, utilities, global)
│   │   └── hooks/           # React hooks
│   └── templates/    # Task template system
tests/
├── unit/             # Module unit tests
├── integration/      # Cross-module tests
├── e2e/             # End-to-end tests
└── setup/           # Test configuration (a11y-matchers, etc.)
data/templates/       # Task template files (JSON)
```

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run deploy` - Deploy to GitHub Pages

## Code Style
- TypeScript strict mode or comprehensive JSDoc
- ESLint + Prettier with pre-commit hooks
- Component naming: PascalCase
- File naming: kebab-case
- Test-Driven Development approach

## Styling Guidelines (CSS Modules)

### Overview
All UI components use **CSS Modules** as the standardized styling approach. No inline styles, Tailwind CSS, or CSS-in-JS libraries are permitted.

### Quick Reference

**File Structure**:
```
src/modules/ui/components/
├── Button.tsx
├── Button.module.css
└── Button.test.tsx
```

**Import & Usage**:
```tsx
import styles from './Button.module.css';
import clsx from 'clsx';

<button className={clsx(
  styles.button,
  variant === 'primary' && styles['button--primary'],
  disabled && styles['button--disabled']
)}>
```

### Design Tokens

All components MUST use CSS custom properties from `src/modules/ui/styles/variables.css`:

**Common Tokens**:
```css
/* Colors */
var(--color-primary)           /* #667eea */
var(--color-text-primary)      /* Dark gray */
var(--color-bg-primary)        /* White */

/* Spacing */
var(--spacing-sm)   /* 8px */
var(--spacing-md)   /* 16px */
var(--spacing-lg)   /* 24px */

/* Typography */
var(--font-size-md)            /* 16px */
var(--font-weight-semibold)    /* 600 */

/* Border */
var(--border-radius-md)        /* 8px */

/* Transitions */
var(--transition-normal)       /* 200ms */
```

**Never hardcode** colors, spacing, or typography values in component CSS.

### Class Naming Convention

Use BEM-inspired pattern (simplified for CSS Modules):

```css
.button { }                 /* Element */
.button--primary { }        /* Modifier (variant) */
.button--disabled { }       /* State modifier */
.button__icon { }           /* Child element */
```

**Rules**:
- Lowercase with hyphens (`kebab-case`)
- Semantic, component-relative names
- No generic utility names (`.flex`, `.p-4`)

### Mandatory Patterns

1. **Every presentational component has a `.module.css` file**
2. **Import as `styles`**: `import styles from './Component.module.css';`
3. **No inline styles** except for dynamic CSS custom properties
4. **Always accept `className` prop** for composability
5. **Use `clsx` helper** for conditional classes

### Example Component

```tsx
// Button.tsx
import styles from './Button.module.css';
import clsx from 'clsx';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  disabled = false,
  className,
  children,
}) => (
  <button
    className={clsx(
      styles.button,
      styles[`button--${variant}`],
      disabled && styles['button--disabled'],
      className
    )}
    disabled={disabled}
    type="button"
  >
    {children}
  </button>
);
```

```css
/* Button.module.css */
.button {
  padding: var(--spacing-md) var(--spacing-lg);
  font-weight: var(--font-weight-semibold);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-normal) var(--transition-ease-in-out);
}

.button--primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.button--secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

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
```

### Dynamic Styles

Pass dynamic values via CSS custom properties:

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
  transition: width var(--transition-normal);
}
```

### Further Documentation

- **Quick Start**: `/specs/004-issue-11-on/quickstart.md`
- **Full Contract**: `/specs/004-issue-11-on/contracts/css-modules.md`
- **Component Patterns**: `/specs/004-issue-11-on/data-model.md`
- **Reference Implementation**: `src/modules/ui/components/TopicCard.tsx` + `TopicCard.module.css`

## Architecture Patterns
- **Layered Architecture**: UI → Application → Domain → Infrastructure
- **Modular Design**: Independent modules with clear boundaries
- **Offline-First**: Works completely offline after initial load
- **Spaced Repetition**: SM-2 algorithm for adaptive learning

## Key Features
- German language learning platform
- Multiple topics (Mathematik, Biologie, etc.)
- Spaced repetition algorithm for optimal retention
- PWA with offline functionality
- Progress tracking and analytics dashboard
- Extensible task template system
- Zero-cost static hosting (GitHub Pages)

## Development Focus
- Type safety with comprehensive TypeScript coverage
- 100% test coverage for business logic
- Performance: <3s initial load, <100ms interactions
- Accessibility: WCAG 2.1 AA compliance (verify with jest-axe)
- German language interface with proper localization

## Accessibility Standards

All components MUST meet WCAG 2.1 AA requirements:

- Semantic HTML elements (use `<button>` for buttons, not `<div>`)
- Keyboard navigation support (all interactive elements focusable)
- Focus indicators (`:focus-visible` with high contrast)
- ARIA labels where needed (`aria-label`, `aria-describedby`)
- Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Screen reader compatibility

**Testing**: Use `jest-axe` for automated accessibility tests:

```tsx
import { axe } from 'jest-axe';
import { render } from '@testing-library/react';

it('has no WCAG violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Reference**: See `tests/unit/ui/components/TopicCard.a11y.test.tsx` for examples.

## Recent Changes
- 005-issue-23: Added TypeScript 5.x / JavaScript ES2022 + React (UI framework), Vite (build tool), HTML5 Audio API
1. [2025-09-29] Added German Learning Platform with Spaced Repetition
   - Implemented SM-2 algorithm for learning optimization
   - Added modular architecture with clear separation of concerns
   - Integrated PWA features for offline-first experience

2. [2025-10-04] Standardized CSS Modules Styling Approach
   - All components use CSS Modules (component-scoped stylesheets)
   - Design token system with CSS custom properties (`variables.css`)
   - BEM-inspired class naming convention
   - No inline styles, Tailwind, or CSS-in-JS permitted

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
