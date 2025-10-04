# Component Template - CSS Modules

This template demonstrates the standardized approach for creating new components using CSS Modules.

## Usage

1. **Copy the template files** to your component location:
   ```bash
   cp templates/component/Component.tsx src/modules/ui/components/MyComponent.tsx
   cp templates/component/Component.module.css src/modules/ui/components/MyComponent.module.css
   ```

2. **Rename** the component:
   - Replace `Component` with your component name in both files
   - Update import paths

3. **Customize** the component:
   - Add your component-specific props
   - Modify variants and sizes as needed
   - Add component-specific styles to the CSS module

## Key Patterns

### 1. CSS Modules Import
```typescript
import styles from './Component.module.css';
```

### 2. Conditional Class Names with clsx
```typescript
className={clsx(
  styles.component,                           // Base class
  styles[`component--${variant}`],           // Variant modifier
  styles[`component--${size}`],              // Size modifier
  disabled && styles['component--disabled'], // State modifier
  className                                   // External classes
)}
```

### 3. BEM-like Naming Convention
- Base: `.component`
- Variant: `.component--primary`, `.component--secondary`
- State: `.component--disabled`, `.component--loading`
- Child: `.component__icon`, `.component__text`

### 4. CSS Custom Properties (Design Tokens)
Always use CSS custom properties from `variables.css`:
```css
.component {
  padding: var(--spacing-md);           /* Spacing */
  font-size: var(--font-size-base);     /* Typography */
  color: var(--color-text-primary);     /* Colors */
  border-radius: var(--border-radius-md); /* Borders */
  transition: var(--transition-base);   /* Transitions */
}
```

### 5. Inline Styles - Use Sparingly
Only use inline styles for **truly dynamic values**:
- Colors based on runtime state/props
- Percentage widths/heights from calculations
- Dynamic positioning

```typescript
// ❌ Bad - Static style
<div style={{ padding: '16px' }}>

// ✅ Good - Use CSS Module
<div className={styles.container}>

// ✅ Good - Dynamic color
<div style={{ backgroundColor: getColorForStatus(status) }}>

// ✅ Good - Dynamic percentage
<div style={{ width: `${progress}%` }}>
```

## File Structure

```
Component.tsx              # TypeScript component
Component.module.css       # CSS Module styles
Component.test.tsx         # Unit tests (optional)
Component.stories.tsx      # Storybook stories (optional)
```

## ESLint Rule

The project has an ESLint rule that warns about inline styles:

```javascript
'no-restricted-syntax': [
  'warn',
  {
    selector: 'JSXAttribute[name.name="style"] > JSXExpressionContainer > ObjectExpression',
    message: 'Avoid inline styles. Use CSS Modules instead. Only use inline styles for truly dynamic values.',
  },
]
```

## Benefits of CSS Modules

✅ **Type Safety** - TypeScript declarations for CSS imports
✅ **Scoped Styles** - No global namespace pollution
✅ **Code Splitting** - CSS bundled with components
✅ **Design Tokens** - Centralized theming via CSS custom properties
✅ **Better DX** - No runtime style overhead
✅ **Maintainability** - Clear separation of concerns

## Migration from Inline Styles

If migrating an existing component:

1. Extract all static styles to CSS Module
2. Keep only dynamic styles as inline
3. Use design tokens instead of hardcoded values
4. Update tests to check className instead of inline styles
5. Run visual regression tests to verify zero pixel differences

## Examples

See existing components for reference:
- `src/modules/ui/components/common/Button.tsx` - Full-featured button with variants
- `src/modules/ui/components/common/Card.tsx` - Simple container component
- `src/modules/ui/components/dashboard.tsx` - Complex component with justified inline styles
