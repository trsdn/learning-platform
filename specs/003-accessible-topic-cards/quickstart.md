# Quick Start: Accessible Topic Cards

**Feature**: Replace clickable divs with semantic buttons
**Time to implement**: ~2 hours
**Difficulty**: Low

## TL;DR

Replace `<div onClick>` with `<button type="button">` in topic cards, add proper ARIA labels, and reset button styles.

## 5-Minute Implementation

### 1. Update Component (2 min)

**Before**:
```tsx
<div className="topic-card" onClick={() => onSelect(topic.id)}>
  <span className="topic-card__icon">{topic.icon}</span>
  <h3 className="topic-card__title">{topic.name}</h3>
  <p className="topic-card__description">{topic.description}</p>
</div>
```

**After**:
```tsx
<button
  type="button"
  className="topic-card"
  onClick={() => onSelect(topic.id)}
  aria-label={`Thema ${topic.name} öffnen - ${topic.description}`}
>
  <span className="topic-card__icon" aria-hidden="true">
    {topic.icon}
  </span>
  <h3 className="topic-card__title">{topic.name}</h3>
  <p className="topic-card__description">{topic.description}</p>
</button>
```

### 2. Reset Button Styles (1 min)

Add to your CSS file:

```css
.topic-card {
  /* Button reset */
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  display: block;
  width: 100%;
  text-align: left;

  /* Preserve existing card styles... */
}
```

### 3. Add Focus Indicator (1 min)

```css
/* Keyboard focus only */
.topic-card:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* No focus ring for mouse clicks */
.topic-card:focus:not(:focus-visible) {
  outline: none;
}
```

### 4. Test (1 min)

- Press Tab → Cards should be focusable
- Press Enter on card → Should navigate
- Visual check → Cards look unchanged

Done! ✅

## File Locations

### Component
```
src/modules/ui/components/
├── TopicCard.tsx          # Main component file
└── TopicCard.module.css   # Component styles
```

### Tests
```
tests/
├── unit/ui/
│   └── TopicCard.test.tsx           # Unit + accessibility tests
└── e2e/
    └── keyboard-navigation.spec.ts   # E2E keyboard tests
```

## Code Patterns

### Component Template

```tsx
import React from 'react';
import styles from './TopicCard.module.css';

interface TopicCardProps {
  topic: {
    id: string;
    name: string;
    description: string;
    icon?: string;
  };
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onSelect,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onSelect(topic.id)}
      aria-label={`Thema ${topic.name} öffnen - ${topic.description}`}
      disabled={disabled}
    >
      {topic.icon && (
        <span className={styles.icon} aria-hidden="true">
          {topic.icon}
        </span>
      )}
      <h3 className={styles.title}>{topic.name}</h3>
      <p className={styles.description}>{topic.description}</p>
    </button>
  );
};
```

### CSS Module Template

```css
/* topic-card.module.css */

.card {
  /* === Button Reset === */
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  display: block;
  width: 100%;
  text-align: left;
  box-sizing: border-box;

  /* === Card Styles (preserve existing) === */
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  /* === Accessibility === */
  min-width: 44px;
  min-height: 44px;
}

/* Hover state */
.card:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Keyboard focus */
.card:focus-visible {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: 2px;
}

/* Mouse focus (no outline) */
.card:focus:not(:focus-visible) {
  outline: none;
}

/* Active/pressed */
.card:active:not(:disabled) {
  transform: translateY(0);
}

/* Disabled state */
.card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Icon */
.icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

/* Title */
.title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

/* Description */
.description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}
```

## Testing Checklist

### Manual Testing (5 min)

```bash
# Start dev server
npm run dev

# Test keyboard navigation:
# 1. Press Tab → Focus first card
# 2. Press Tab → Focus next card
# 3. Press Enter → Activates card
# 4. Press Space → Activates card
# 5. Visual: Focus ring visible?
```

### Automated Testing

```bash
# Unit tests + accessibility
npm test TopicCard

# E2E tests
npm run test:e2e keyboard-navigation

# Full test suite
npm test
```

## Common Issues & Fixes

### Issue 1: Focus Indicator Not Visible

**Problem**: No focus ring when pressing Tab

**Solution**: Check `:focus-visible` support
```css
/* Add fallback for older browsers */
.card:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

.card:focus:not(:focus-visible) {
  outline: none;
}

/* This gives visible focus in all browsers,
   but removes it for mouse users in modern browsers */
```

### Issue 2: Button Styles Look Wrong

**Problem**: Button has default browser styles

**Solution**: Add comprehensive reset
```css
.card {
  all: unset;  /* Nuclear option - resets everything */
  box-sizing: border-box;
  cursor: pointer;

  /* Then re-add all your styles */
}
```

### Issue 3: Layout Breaks on Mobile

**Problem**: Button width behavior differs from div

**Solution**: Ensure display and width are set
```css
.card {
  display: block;  /* or flex/grid */
  width: 100%;
}
```

### Issue 4: Screen Reader Reads Icon Emoji

**Problem**: VoiceOver announces "Math symbol" before label

**Solution**: Add `aria-hidden="true"` to icon
```tsx
<span aria-hidden="true">{topic.icon}</span>
```

## ARIA Label Examples

```tsx
// Mathematik
aria-label="Thema Mathematik öffnen - Lernen Sie die Grundlagen der Mathematik"

// Biologie
aria-label="Thema Biologie öffnen - Entdecken Sie die Welt der Lebewesen"

// Geschichte
aria-label="Thema Geschichte öffnen - Erkunden Sie vergangene Epochen"

// Geographie
aria-label="Thema Geographie öffnen - Lernen Sie über Länder und Kontinente"
```

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| `<button>` | ✅ | ✅ | ✅ | ✅ |
| `aria-label` | ✅ | ✅ | ✅ | ✅ |
| `:focus-visible` | ✅ 86+ | ✅ 85+ | ✅ 15.4+ | ✅ 86+ |

**Fallback for older browsers**:
```css
/* Modern browsers with :focus-visible support */
.card:focus-visible {
  outline: 2px solid #0066cc;
}

.card:focus:not(:focus-visible) {
  outline: none;
}

/* Fallback for browsers without :focus-visible */
@supports not selector(:focus-visible) {
  .card:focus {
    outline: 2px solid #0066cc;
  }
}
```

## Performance Tips

1. **Memoize component** if used in lists:
```tsx
export const TopicCard = React.memo<TopicCardProps>(({ topic, onSelect }) => {
  // ...
})
```

2. **Stable callback reference**:
```tsx
const handleSelect = useCallback(() => {
  onSelect(topic.id)
}, [topic.id, onSelect])
```

3. **CSS containment**:
```css
.card {
  contain: layout style paint;
}
```

## Verification

### Accessibility Audit

```bash
# Run Lighthouse audit
npm run lighthouse

# Should show:
# Accessibility: 100 ✅
# - All elements are keyboard accessible
# - Elements have accessible names
```

### WCAG Compliance

- ✅ 2.1.1 Keyboard (Level A) - Tab, Enter, Space work
- ✅ 4.1.2 Name, Role, Value (Level A) - Button role, aria-label
- ✅ 2.4.7 Focus Visible (Level AA) - Focus indicator present

## Next Steps

1. Implement component changes
2. Add CSS button reset
3. Run tests: `npm test`
4. Manual keyboard test
5. Create PR
6. Merge to main

## Resources

- [WAI-ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [MDN: `<button>` Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button)
- [MDN: `:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

## Full Implementation Checklist

- [ ] Replace `<div>` with `<button type="button">`
- [ ] Add `aria-label` with German pattern
- [ ] Add `aria-hidden="true"` to icon
- [ ] Add button reset CSS
- [ ] Add `:focus-visible` styles
- [ ] Preserve existing hover/active styles
- [ ] Ensure 44x44px minimum size
- [ ] Write unit tests
- [ ] Write accessibility tests (jest-axe)
- [ ] Write E2E tests (Playwright)
- [ ] Manual keyboard test
- [ ] Manual screen reader test
- [ ] Cross-browser test
- [ ] Zero visual regression
- [ ] Update documentation

**Estimated time**: 2 hours
**Complexity**: Low (Fibonacci 2)
**Risk**: Low
