# TopicCard Component

Accessible topic card component using semantic `<button>` element with full keyboard navigation and ARIA support.

## Features

- ✅ Semantic HTML (`<button>` element)
- ✅ WCAG 2.1 Level A compliant (2.1.1 Keyboard, 4.1.2 Name/Role/Value)
- ✅ Full keyboard navigation (Tab, Enter, Space)
- ✅ Visible focus indicators
- ✅ Screen reader support with German ARIA labels
- ✅ Touch-friendly (44x44px minimum)
- ✅ Disabled state support

## Usage

```tsx
import { TopicCard } from '@/modules/ui/components/TopicCard';

const topic = {
  id: 'mathematik',
  name: 'Mathematik',
  description: 'Lernen Sie die Grundlagen der Mathematik',
  icon: '🔢',
  color: '#dbeafe',
};

<TopicCard
  topic={topic}
  onSelect={(topicId) => console.log(`Selected: ${topicId}`)}
/>
```

## Props

### `topic` (required)

Object containing topic display information:

```typescript
interface TopicCardTopic {
  id: string;                 // Unique identifier
  name: string;              // Display name (German)
  description: string;       // Short description (German)
  icon?: string;             // Optional emoji icon
  color?: string;            // Optional background color
}
```

### `onSelect` (required)

Callback function called when card is activated (clicked or keyboard activated):

```typescript
onSelect: (topicId: string) => void
```

### `className` (optional)

Additional CSS class names to apply:

```typescript
className?: string
```

### `disabled` (optional)

Disable the card interaction:

```typescript
disabled?: boolean  // default: false
```

### `data-testid` (optional)

Test identifier for E2E testing:

```typescript
'data-testid'?: string
```

## Accessibility

### ARIA Labels

Cards use German-language ARIA labels following the pattern:

```
"Thema {name} öffnen - {description}"
```

**Examples:**
- `"Thema Mathematik öffnen - Lernen Sie die Grundlagen der Mathematik"`
- `"Thema Biologie öffnen - Entdecken Sie die Welt der Lebewesen"`

### Keyboard Support

| Key | Action |
|-----|--------|
| Tab | Focus next card |
| Shift+Tab | Focus previous card |
| Enter | Activate card |
| Space | Activate card |

### Screen Reader Support

- **Role**: "Button" (implicit from `<button>` element)
- **Name**: ARIA label with topic name and description
- **State**: Focused/not focused, enabled/disabled
- **Icon**: Hidden with `aria-hidden="true"`

## Styling

The component uses inline styles for dynamic colors and hover states. Custom styling can be added via the `className` prop.

### Focus Indicator

- Keyboard focus: 2px solid blue outline with 2px offset
- Mouse focus: No visible outline (`:focus:not(:focus-visible)`)
- High contrast mode: 3px outline width

### States

- **Hover**: Lift effect (translateY(-4px)) with shadow
- **Active**: Reset to normal position
- **Disabled**: 50% opacity, not-allowed cursor
- **Focus**: Blue outline (keyboard only)

## Examples

### Basic Card

```tsx
<TopicCard
  topic={{
    id: 'math',
    name: 'Mathematik',
    description: 'Grundlagen der Mathematik',
    icon: '🔢'
  }}
  onSelect={(id) => console.log(id)}
/>
```

### Disabled Card

```tsx
<TopicCard
  topic={topic}
  onSelect={handleSelect}
  disabled={true}
/>
```

### With Custom Styling

```tsx
<TopicCard
  topic={topic}
  onSelect={handleSelect}
  className="my-custom-class"
/>
```

### With Test ID

```tsx
<TopicCard
  topic={topic}
  onSelect={handleSelect}
  data-testid="topic-card-math"
/>
```

## WCAG Compliance

### WCAG 2.1.1 - Keyboard (Level A)

✅ **Compliant**: All functionality available via keyboard
- Tab key focuses the card
- Enter and Space keys activate the card
- No keyboard traps

### WCAG 4.1.2 - Name, Role, Value (Level A)

✅ **Compliant**: Proper semantic HTML and ARIA
- Uses `<button>` element (role implicit)
- Has descriptive aria-label
- State properly conveyed to assistive tech

### WCAG 2.4.7 - Focus Visible (Level AA)

✅ **Compliant**: Visible focus indicators
- Focus ring visible when navigating with keyboard
- Focus ring hidden when clicking with mouse
- High contrast mode support

### WCAG 2.5.5 - Target Size (Level AAA)

✅ **Compliant**: Touch targets ≥44x44px
- Minimum dimensions enforced in CSS
- Adequate padding for touch interaction

## Testing

### Unit Tests

```bash
npm test TopicCard
```

Tests cover:
- Button element rendering
- ARIA attributes
- Keyboard interaction
- Disabled state
- Click handlers

### Accessibility Tests

```bash
npm test TopicCard.a11y
```

Tests cover:
- Zero WCAG violations (jest-axe)
- WCAG 2.1.1 compliance
- WCAG 4.1.2 compliance

### E2E Tests

```bash
npm run test:e2e keyboard-navigation
npm run test:e2e screen-reader
```

Tests cover:
- Keyboard navigation flow
- Focus indicators
- Screen reader announcements

## Related

- [Specification](../../../specs/003-accessible-topic-cards/spec.md)
- [Implementation Plan](../../../specs/003-accessible-topic-cards/plan.md)
- [Component Contract](../../../specs/003-accessible-topic-cards/contracts/TopicCard.contract.md)
- [Accessibility Contract](../../../specs/003-accessible-topic-cards/contracts/accessibility.contract.md)

## References

- [WAI-ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN: `<button>` Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button)
