# TopicCard Component Contract

**Component**: `TopicCard`
**Type**: Presentational Component
**Semantic Element**: `<button>`
**WCAG Level**: A (2.1.1, 4.1.2)

## Contract Overview

This contract defines the behavior, accessibility, and testing requirements for the TopicCard component.

## Interface Contract

### Props

```typescript
interface TopicCardProps {
  topic: Topic;           // REQUIRED: Topic data to display
  onSelect: (id: string) => void;  // REQUIRED: Selection callback
  className?: string;     // OPTIONAL: Additional CSS classes
  disabled?: boolean;     // OPTIONAL: Disable interaction (default: false)
  'data-testid'?: string; // OPTIONAL: Test identifier
}
```

### Topic Type

```typescript
interface Topic {
  id: string;           // REQUIRED: Unique identifier
  name: string;         // REQUIRED: Display name (German)
  description: string;  // REQUIRED: Description (German)
  icon?: string;        // OPTIONAL: Emoji or icon
  color?: string;       // OPTIONAL: Background color
}
```

## Behavior Contract

### MUST Requirements

1. **Semantic HTML**
   - ✅ MUST use `<button>` element as root
   - ✅ MUST have `type="button"` attribute
   - ✅ MUST NOT use `<div>`, `<span>`, or other non-semantic elements

2. **Accessibility**
   - ✅ MUST have `aria-label` following pattern: `"Thema {name} öffnen - {description}"`
   - ✅ Icon element MUST have `aria-hidden="true"`
   - ✅ MUST be keyboard accessible (Tab, Enter, Space)
   - ✅ MUST show visible focus indicator for keyboard users
   - ✅ MUST pass axe accessibility audit with zero violations

3. **Interaction**
   - ✅ MUST call `onSelect(topic.id)` when clicked
   - ✅ MUST call `onSelect(topic.id)` when Enter key pressed
   - ✅ MUST call `onSelect(topic.id)` when Space key pressed
   - ✅ MUST NOT call `onSelect` when `disabled={true}`

4. **Styling**
   - ✅ MUST reset button default styles
   - ✅ MUST preserve existing card visual design
   - ✅ MUST have minimum touch target 44x44px (WCAG 2.5.5)
   - ✅ Focus indicator MUST use `:focus-visible` pseudo-class
   - ✅ Focus indicator MUST be 2px solid outline with 2px offset

### SHOULD Requirements

1. **Performance**
   - ⚡ Component SHOULD be memoized if used in lists
   - ⚡ `onSelect` callback SHOULD be stable reference (useCallback)

2. **Error Handling**
   - 🛡️ SHOULD handle missing optional props gracefully
   - 🛡️ SHOULD have fallback for missing icon
   - 🛡️ SHOULD truncate or wrap long text content

### MUST NOT Requirements

1. **Anti-patterns**
   - ❌ MUST NOT use `<a>` without proper href
   - ❌ MUST NOT add `role="button"` (redundant with `<button>`)
   - ❌ MUST NOT use `tabindex` (button is focusable by default)
   - ❌ MUST NOT use `onClick` on non-semantic elements
   - ❌ MUST NOT suppress focus indicators globally

## Accessibility Contract

### ARIA Pattern

```tsx
// REQUIRED pattern
<button
  type="button"
  aria-label={`Thema ${topic.name} öffnen - ${topic.description}`}
>
  <span aria-hidden="true">{topic.icon}</span>
  {/* other content */}
</button>
```

### Keyboard Support

| Key | Action | Required |
|-----|--------|----------|
| Tab | Focus next card | ✅ MUST |
| Shift+Tab | Focus previous card | ✅ MUST |
| Enter | Activate card (call onSelect) | ✅ MUST |
| Space | Activate card (call onSelect) | ✅ MUST |

*Note: Keyboard support is automatic with `<button>` element*

### Screen Reader Announcements

**Required announcement format:**
```
"Button, Thema {name} öffnen - {description}"
```

**Example:**
```
"Button, Thema Mathematik öffnen - Lernen Sie die Grundlagen der Mathematik"
```

### Focus Indicators

```css
/* REQUIRED: Visible focus for keyboard users */
.topic-card:focus-visible {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: 2px;
}

/* REQUIRED: No focus ring for mouse users */
.topic-card:focus:not(:focus-visible) {
  outline: none;
}

/* RECOMMENDED: High contrast mode support */
@media (prefers-contrast: high) {
  .topic-card:focus-visible {
    outline-width: 3px;
  }
}
```

## Testing Contract

### Unit Tests (Vitest + @testing-library/react)

**Required tests:**

```typescript
describe('TopicCard', () => {
  // Rendering
  ✅ it('renders as button element')
  ✅ it('has type="button" attribute')
  ✅ it('displays topic name')
  ✅ it('displays topic description')
  ✅ it('displays icon when provided')
  ✅ it('applies custom className')

  // Accessibility
  ✅ it('has correct aria-label')
  ✅ it('icon has aria-hidden="true"')
  ✅ it('passes axe accessibility audit')

  // Interaction
  ✅ it('calls onSelect with topic.id on click')
  ✅ it('calls onSelect on Enter key press')
  ✅ it('calls onSelect on Space key press')
  ✅ it('does not call onSelect when disabled')

  // Edge cases
  ✅ it('handles missing icon gracefully')
  ✅ it('handles missing color gracefully')
  ✅ it('handles long topic names without breaking layout')
})
```

### Accessibility Tests (jest-axe)

**Required checks:**

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('TopicCard Accessibility', () => {
  ✅ it('has no WCAG violations', async () => {
    const { container } = render(<TopicCard {...props} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  ✅ it('meets WCAG 2.1.1 (Keyboard)', () => {
    // Verify Tab, Enter, Space work
  })

  ✅ it('meets WCAG 4.1.2 (Name, Role, Value)', () => {
    // Verify button role and aria-label
  })
})
```

### E2E Tests (Playwright)

**Required scenarios:**

```typescript
test.describe('TopicCard Keyboard Navigation', () => {
  ✅ test('can Tab to all cards in sequence')
  ✅ test('Enter key activates card')
  ✅ test('Space key activates card')
  ✅ test('focus indicator is visible')
  ✅ test('screen reader announces correctly')
})

test.describe('TopicCard Cross-Browser', () => {
  ✅ test('works in Chrome')
  ✅ test('works in Firefox')
  ✅ test('works in Safari')
  ✅ test('works in Edge')
})
```

## CSS Contract

### Button Reset

**Required styles:**

```css
.topic-card {
  /* Button reset - REQUIRED */
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  display: block;
  width: 100%;
  text-align: left;

  /* Box sizing - REQUIRED */
  box-sizing: border-box;

  /* Touch target - REQUIRED (WCAG 2.5.5) */
  min-width: 44px;
  min-height: 44px;
}

/* Disabled state - REQUIRED */
.topic-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Focus States

**Required focus handling:**

```css
/* Keyboard focus - REQUIRED */
.topic-card:focus-visible {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: 2px;
}

/* Mouse focus - REQUIRED */
.topic-card:focus:not(:focus-visible) {
  outline: none;
}
```

## Performance Contract

### Metrics

- ✅ Initial render: <16ms (1 frame @ 60fps)
- ✅ Click response: <100ms
- ✅ Focus indicator render: <16ms (1 frame)
- ✅ No layout shift (CLS = 0)

### Optimization

```tsx
// RECOMMENDED: Memoize component
export const TopicCard = React.memo<TopicCardProps>(({ topic, onSelect, ...props }) => {
  // Component implementation
})

// RECOMMENDED: Stable callback
const handleSelect = useCallback(() => {
  onSelect(topic.id)
}, [topic.id, onSelect])
```

## Integration Contract

### Parent Component Usage

```tsx
// REQUIRED usage pattern
<div className="topic-grid">
  {topics.map(topic => (
    <TopicCard
      key={topic.id}
      topic={topic}
      onSelect={handleTopicSelect}
    />
  ))}
</div>
```

### Event Flow

1. User clicks or presses Enter/Space on button
2. Button's native behavior triggers onClick handler
3. onClick calls `onSelect(topic.id)`
4. Parent component receives topic ID
5. Parent component navigates to topic or updates state

## Acceptance Criteria

### Definition of Done

- [x] Component uses `<button>` element ✅
- [x] Has `type="button"` attribute ✅
- [x] Has proper `aria-label` ✅
- [x] Icon has `aria-hidden="true"` ✅
- [x] Keyboard accessible (Tab, Enter, Space) ✅
- [x] Visible focus indicator ✅
- [x] Zero WCAG violations ✅
- [x] All unit tests pass ✅
- [x] All E2E tests pass ✅
- [x] Cross-browser verified ✅
- [x] Zero visual regression ✅
- [x] Documentation complete ✅

### Verification Steps

1. ✅ Run `npm test` - all tests pass
2. ✅ Run `npm run test:a11y` - zero violations
3. ✅ Run `npm run test:e2e` - all scenarios pass
4. ✅ Manual keyboard test - Tab, Enter, Space work
5. ✅ Screen reader test - announces correctly
6. ✅ Visual regression test - no changes to design
7. ✅ Cross-browser test - Chrome, Firefox, Safari, Edge

## Version History

- **v1.0.0** (2025-10-04): Initial contract for semantic button implementation
