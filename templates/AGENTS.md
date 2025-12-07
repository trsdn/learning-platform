# AI Agent Guide – Templates (`templates/`)

## Scope

- Describes how **code templates and scaffolding** are organized under `templates/`.
- Focuses on templates for React components and related boilerplate.
- Does **not** define task content templates (see `data/AGENTS.md` for that).

## Responsibilities

- Provide a canonical starting point for new UI components and related files.
- Ensure new components follow CSS Modules, testing, and accessibility conventions.
- Help agents generate consistent, well‑structured boilerplate.

## Entry Points

- `component/` – Base template for React components (`Component.tsx`, `.module.css`, tests, `index.ts`).

## Conventions

- Every new UI component created from these templates must live under `src/modules/ui/components/`.
- Template code must follow the same TypeScript, CSS Modules, and accessibility patterns documented in `src/AGENTS.md` and `docs/css-modules.md`.
- Tests and (optionally) a11y tests should be included when generating new components.

## Agent & Command Usage

### Recommended agents

- `component-library-architect` – For evolving or refactoring the base templates.
- `ui-ux-designer` – When adjusting component templates to match design system changes.
- `unit-tester` / `ui-visual-validator` – When adding test or visual‑regression patterns into templates.

### Helpful commands

- `/validate-implementation <issue-number>` – To verify that new components generated from templates integrate cleanly (build, lint, tests).

## Do & Don’t

### Do

- Keep templates small, opinionated, and aligned with current best practices.
- Update templates when cross‑cutting conventions change (e.g., design tokens, accessibility patterns).
- Use design tokens and CSS Modules in all template styles.

### Don’t

- Don’t add business logic or app‑specific behavior into templates.
- Don’t diverge templates from real component patterns – templates should mirror “how we actually build things now”.

## Testing

- When templates change, create a **dummy component** from the updated template and run:
  - `npm test` (component tests and a11y tests, if present).
  - `npm run type-check` and `npm run build` to ensure generated code compiles.

## Related Guides

- [Root AI Agent Guide](../AGENTS.md)
- [Source Code Agent Guide](../src/AGENTS.md)
- [Testing Agent Guidelines](../tests/AGENTS.md)
- [CSS Modules Guide](../docs/architecture/css-modules.md)

---

## 📁 Directory Structure

```
templates/
└── component/         # React component templates
    ├── Component.tsx
    ├── Component.module.css
    ├── Component.test.tsx
    └── index.ts
```

---

## 🏗️ Component Template Usage

### When to Use Templates

**✅ DO use templates for**:
- Creating new React components
- Ensuring consistent structure
- Including test files from start
- Following CSS Modules pattern

**❌ DON'T use templates for**:
- One-off utility functions
- Simple modifications
- Quick prototypes

### Template Structure

Each component template includes:
1. **Component.tsx** - Main component file
2. **Component.module.css** - CSS Modules stylesheet
3. **Component.test.tsx** - Unit tests
4. **index.ts** - Barrel export

---

## 📝 Creating New Components from Template

### Step-by-Step Process

```bash
# 1. Copy template
cp -r templates/component src/modules/ui/components/NewComponent

# 2. Rename files
cd src/modules/ui/components/NewComponent
mv Component.tsx NewComponent.tsx
mv Component.module.css NewComponent.module.css
mv Component.test.tsx NewComponent.test.tsx

# 3. Update imports and references
# Replace "Component" with "NewComponent" in all files
```

### Automated Creation (Recommended)

```bash
# Using a script (to be created)
npm run generate:component NewComponent

# This would:
# 1. Copy template
# 2. Rename files
# 3. Replace placeholders
# 4. Create in correct location
```

---

## 🎨 Component Template Standards

### TypeScript Interface

```typescript
// NewComponent.tsx
import styles from './NewComponent.module.css'

export interface NewComponentProps {
  /**
   * Component title
   */
  title: string

  /**
   * Optional description
   */
  description?: string

  /**
   * Click handler
   */
  onClick?: () => void

  /**
   * Additional CSS classes
   */
  className?: string
}

export function NewComponent({
  title,
  description,
  onClick,
  className
}: NewComponentProps) {
  return (
    <div className={clsx(styles.container, className)}>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {onClick && (
        <button className={styles.button} onClick={onClick}>
          Action
        </button>
      )}
    </div>
  )
}
```

### CSS Modules Template

```css
/* NewComponent.module.css */
.container {
  /* Use design tokens */
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.description {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.button {
  /* Use button design tokens */
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: background-color 0.2s;
}

.button:hover {
  background-color: var(--color-primary-hover);
}

.button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

### Test Template

```typescript
// NewComponent.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NewComponent } from './NewComponent'

describe('NewComponent', () => {
  describe('when rendered', () => {
    it('should display title', () => {
      render(<NewComponent title="Test Title" />)
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should display description when provided', () => {
      render(<NewComponent title="Title" description="Description" />)
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should not display description when not provided', () => {
      render(<NewComponent title="Title" />)
      expect(screen.queryByText('Description')).not.toBeInTheDocument()
    })
  })

  describe('when button is clicked', () => {
    it('should call onClick handler', async () => {
      const onClick = vi.fn()
      render(<NewComponent title="Title" onClick={onClick} />)

      await userEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledOnce()
    })
  })
})
```

### Accessibility Test Template

```typescript
// NewComponent.a11y.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { NewComponent } from './NewComponent'

expect.extend(toHaveNoViolations)

describe('NewComponent Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<NewComponent title="Test" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should be keyboard navigable', async () => {
    render(<NewComponent title="Test" onClick={vi.fn()} />)
    const button = screen.getByRole('button')

    // Tab to button
    await userEvent.tab()
    expect(button).toHaveFocus()

    // Enter to activate
    await userEvent.keyboard('{Enter}')
    // Assert onClick called
  })
})
```

---

## 🔧 Template Customization

### Modifying Templates

When updating templates:

1. **Update all template files** in `templates/component/`
2. **Document changes** in this guide
3. **Test template** by creating a component
4. **Update examples** in this file

### Template Variants

Consider creating additional templates for:
- **Page components**: Full-page layouts
- **Form components**: Form fields with validation
- **Modal components**: Dialog/overlay patterns
- **List components**: Data display patterns

---

## 📋 Template Checklist

When using templates, ensure:

- [ ] Proper TypeScript types
- [ ] CSS Modules imported correctly
- [ ] Design tokens used (not hardcoded values)
- [ ] Accessibility attributes (ARIA, semantic HTML)
- [ ] Unit tests included
- [ ] a11y tests included
- [ ] Props documented with JSDoc
- [ ] Barrel export in `index.ts`
- [ ] Responsive design considerations
- [ ] Focus management for interactive elements

---

## 🚨 Common Mistakes

### ❌ DON'T

```typescript
// Inline styles
<div style={{ padding: '16px' }}>

// Hardcoded colors
<div style={{ color: '#333' }}>

// Non-semantic HTML
<div onClick={handleClick}>Click me</div>

// Missing types
export function Component(props) {
```

### ✅ DO

```typescript
// CSS Modules
<div className={styles.container}>

// Design tokens
.container { color: var(--color-text-primary); }

// Semantic HTML
<button onClick={handleClick}>Click me</button>

// Proper types
export function Component({ title }: ComponentProps) {
```

---

## 📚 Related Documentation

- **Parent Guide**: [../AGENTS.md](../AGENTS.md)
- **CSS Modules**: [../docs/css-modules.md](../docs/css-modules.md)
- **Testing**: [../tests/AGENTS.md](../tests/AGENTS.md)
- **Design Tokens**: `../src/modules/ui/styles/variables.css`

---

## 🎯 Agent Commands

```bash
# Create component from template (manual)
cp -r templates/component src/modules/ui/components/NewComponent

# Test component
npm test -- NewComponent.test

# Check a11y
npm test -- NewComponent.a11y.test

# Type check
npm run type-check

# Build to verify
npm run build
```

---

**Maintained By**: component-library-architect
**Questions?**: See [../AGENTS.md](../AGENTS.md) or open GitHub issue with `templates` label
