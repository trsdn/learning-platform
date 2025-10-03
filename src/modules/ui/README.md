# UI Module - Design System Documentation

This module contains the design system foundation for the learning platform, including design tokens, reusable components, and styling utilities.

## 📐 Design Tokens

Design tokens are the single source of truth for all design values in the application. They ensure consistency and make it easy to update the design system.

### Importing Design Tokens

```typescript
import {
  colors,
  semanticColors,
  spacing,
  typography,
  shadows,
  borderRadius,
  transitions,
  breakpoints,
  zIndex,
  components,
} from '@ui/design-tokens';
```

### Color System

#### Using Color Palette

```typescript
// Direct color usage
const primaryColor = colors.primary[500];    // '#3b82f6'
const successColor = colors.success[500];    // '#10b981'
const errorColor = colors.error[500];        // '#ef4444'

// Using semantic colors (recommended)
const textPrimary = semanticColors.text.primary;           // '#111827'
const bgPrimary = semanticColors.background.primary;       // '#ffffff'
const borderColor = semanticColors.border.base;            // '#d1d5db'
```

#### Color Categories

- **Primary** (Blue): Main brand color, primary actions
- **Success** (Green): Success states, correct answers
- **Error** (Red): Error states, wrong answers
- **Warning** (Amber): Warning states, caution messages
- **Info** (Purple): Informational messages
- **Neutral** (Gray): Text, backgrounds, borders

### Spacing Scale

```typescript
// Using spacing tokens
const padding = spacing[4];      // '1rem' (16px)
const margin = spacing[8];       // '2rem' (32px)
const gap = spacing[2];          // '0.5rem' (8px)

// Common spacing values
spacing[0]   // 0
spacing[1]   // 0.25rem (4px)
spacing[2]   // 0.5rem (8px)
spacing[4]   // 1rem (16px)
spacing[6]   // 1.5rem (24px)
spacing[8]   // 2rem (32px)
spacing[12]  // 3rem (48px)
```

### Typography

```typescript
// Font sizes
const textSize = typography.fontSize.base;    // '1rem'
const heading = typography.fontSize['2xl'];   // '1.5rem'

// Font weights
const weight = typography.fontWeight.medium;  // '500'

// Line heights
const lineHeight = typography.lineHeight.normal; // '1.5'

// Font families
const sans = typography.fontFamily.sans;      // System font stack
const mono = typography.fontFamily.mono;      // Monospace font stack
```

### Shadows

```typescript
const cardShadow = shadows.sm;    // Small shadow for cards
const modalShadow = shadows.lg;   // Large shadow for modals
const buttonShadow = shadows.md;  // Medium shadow for buttons
```

### Border Radius

```typescript
const buttonRadius = borderRadius.md;    // '0.5rem' (8px)
const cardRadius = borderRadius.lg;      // '0.75rem' (12px)
const pillRadius = borderRadius.full;    // '9999px'
```

### Transitions

```typescript
// Using transition presets
const transition = transitions.presets.base;   // 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'
const colorTransition = transitions.presets.colors;

// Custom transitions
const duration = transitions.duration.fast;    // '150ms'
const timing = transitions.timing.spring;      // 'cubic-bezier(0.4, 0, 0.2, 1)'
```

### Component-Specific Tokens

```typescript
// Button tokens
const btnHeight = components.button.height.md;        // '2.5rem'
const btnPadding = components.button.padding.md;      // '0.625rem 1rem'
const btnFontSize = components.button.fontSize.md;    // '1rem'

// Input tokens
const inputHeight = components.input.height.md;       // '2.5rem'
const inputPadding = components.input.padding.md;     // '0.5rem 0.875rem'

// Card tokens
const cardPadding = components.card.padding.md;       // '1.5rem'
const cardRadius = components.card.borderRadius;      // '0.75rem'
const cardShadow = components.card.shadow;            // Box shadow
```

### Z-Index Scale

```typescript
const dropdownZ = zIndex.dropdown;    // '1000'
const modalZ = zIndex.modal;          // '1040'
const tooltipZ = zIndex.tooltip;      // '1060'
```

## 🛠️ Utility Functions

### getColor()

Get a color value from the palette:

```typescript
import { getColor } from '@ui/design-tokens';

const color = getColor('primary', 500);    // '#3b82f6'
const success = getColor('success', 100);  // '#dcfce7'
```

### getSpacing()

Get a spacing value:

```typescript
import { getSpacing } from '@ui/design-tokens';

const spacing = getSpacing(4);    // '1rem'
const gap = getSpacing(2);        // '0.5rem'
```

### createTransition()

Create a transition string:

```typescript
import { createTransition } from '@ui/design-tokens';

const transition = createTransition('opacity', 'base');
// Returns: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)'

const bgTransition = createTransition('background-color', 'fast');
// Returns: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)'
```

## 🎨 Usage Examples

### Example 1: Inline Styles with Tokens

```typescript
import { colors, spacing, borderRadius, shadows } from '@ui/design-tokens';

function MyButton() {
  return (
    <button
      style={{
        backgroundColor: colors.primary[500],
        color: colors.neutral[0],
        padding: `${spacing[2]} ${spacing[4]}`,
        borderRadius: borderRadius.md,
        boxShadow: shadows.sm,
      }}
    >
      Click me
    </button>
  );
}
```

### Example 2: CSS-in-JS with Tokens

```typescript
import { semanticColors, components, transitions } from '@ui/design-tokens';

const styles = {
  button: {
    backgroundColor: semanticColors.interactive.primary,
    color: semanticColors.text.inverse,
    height: components.button.height.md,
    padding: components.button.padding.md,
    fontSize: components.button.fontSize.md,
    borderRadius: components.button.borderRadius,
    transition: transitions.presets.colors,

    '&:hover': {
      backgroundColor: semanticColors.interactive.primaryHover,
    },
  },
};
```

### Example 3: Component with Design Tokens

```typescript
import {
  semanticColors,
  spacing,
  borderRadius,
  shadows,
  typography
} from '@ui/design-tokens';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div
      style={{
        backgroundColor: semanticColors.background.primary,
        border: `1px solid ${semanticColors.border.light}`,
        borderRadius: borderRadius.lg,
        padding: spacing[6],
        boxShadow: shadows.sm,
      }}
    >
      <h3
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: semanticColors.text.primary,
          marginBottom: spacing[4],
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
```

### Example 4: Responsive Design

```typescript
import { breakpoints } from '@ui/design-tokens';

const styles = `
  .container {
    padding: 1rem;
  }

  @media (min-width: ${breakpoints.md}) {
    .container {
      padding: 2rem;
    }
  }

  @media (min-width: ${breakpoints.lg}) {
    .container {
      padding: 3rem;
    }
  }
`;
```

## 📝 Best Practices

### ✅ Do's

- **Always use design tokens** instead of hard-coded values
- **Use semantic color names** when possible (`semanticColors.text.primary` instead of `colors.neutral[900]`)
- **Use component tokens** for component-specific styling
- **Import only what you need** to keep bundle size small
- **Use TypeScript types** provided by the design tokens for type safety

### ❌ Don'ts

- **Don't hard-code colors**: ❌ `color: '#3b82f6'` → ✅ `color: colors.primary[500]`
- **Don't hard-code spacing**: ❌ `padding: '16px'` → ✅ `padding: spacing[4]`
- **Don't hard-code shadows**: ❌ `boxShadow: '0 1px 3px rgba(0,0,0,0.1)'` → ✅ `boxShadow: shadows.sm`
- **Don't create custom transitions**: ❌ `transition: 'all 0.2s ease'` → ✅ `transition: transitions.presets.base`

## 🔧 Customization

To update the design system, edit the values in `design-tokens.ts`. All components using the tokens will automatically reflect the changes.

### Example: Changing the Primary Color

```typescript
// In design-tokens.ts
export const colors = {
  primary: {
    // Change these values to update the primary color across the entire app
    500: '#3b82f6', // Change to your brand color
    // ... other shades
  },
  // ...
};
```

## 📚 Related Documentation

- [Component Library](../components/README.md) - Reusable UI components built with design tokens
- [Form Components](../components/forms/README.md) - Form-specific components
- [Layout Components](../components/layout/README.md) - Layout utilities and containers

## 🤝 Contributing

When adding new design tokens:

1. Add the token to the appropriate section in `design-tokens.ts`
2. Export any new types
3. Document the token in this README
4. Update affected components to use the new token
5. Ensure backward compatibility when possible
