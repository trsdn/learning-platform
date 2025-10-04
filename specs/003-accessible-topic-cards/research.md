# Phase 0: Research - Accessible Topic Cards

## Problem Analysis

### Current Implementation Issues
1. **Non-Semantic HTML**: Topic cards use `<div>` elements with click handlers
   - No inherent meaning to assistive technologies
   - Not focusable by default
   - No keyboard activation support

2. **WCAG 2.1 Violations**:
   - **4.1.2 Name, Role, Value (Level A)**: Divs don't convey interactive role
   - **2.1.1 Keyboard (Level A)**: Not keyboard accessible without extra attributes

3. **User Impact**:
   - Keyboard users: Cannot Tab to cards
   - Screen reader users: Cards not announced as interactive
   - Motor impairment users: May struggle without proper focus indicators

## Solution Research

### Semantic HTML Options

#### Option 1: `<button>` Element (RECOMMENDED)
**When to use**: For actions that trigger client-side behavior (SPA navigation)

**Pros**:
- Native keyboard support (Enter/Space)
- Automatic focus management
- Correct ARIA role by default
- Screen reader friendly
- No href needed (cleaner for JS-based navigation)

**Cons**:
- Requires CSS reset to preserve card styling
- `type="button"` needed to prevent form submission

**Code Pattern**:
```tsx
<button
  type="button"
  className="topic-card"
  onClick={() => navigate('/topic/math')}
  aria-label="Thema Mathematik öffnen - Lernen Sie die Grundlagen"
>
  <span className="topic-card__icon" aria-hidden="true">🔢</span>
  <h3 className="topic-card__title">Mathematik</h3>
  <p className="topic-card__description">Lernen Sie die Grundlagen</p>
</button>
```

**CSS Button Reset**:
```css
.topic-card {
  /* Reset button defaults */
  all: unset;
  box-sizing: border-box;

  /* OR specific resets */
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  display: block;
  width: 100%;
  text-align: left;
}
```

#### Option 2: `<a>` Element with React Router `<Link>`
**When to use**: For navigation to new routes/pages

**Pros**:
- Semantic for navigation
- Works without JavaScript
- Right-click context menu (open in new tab)
- Better SEO (crawlable links)

**Cons**:
- Requires href attribute
- May need preventDefault for SPA routing
- Less appropriate for purely client-side actions

**Code Pattern**:
```tsx
<Link
  to="/topic/math"
  className="topic-card"
  aria-label="Thema Mathematik - Lernen Sie die Grundlagen"
>
  {/* Same content */}
</Link>
```

### Decision: Use `<button>` Element

**Rationale**:
1. This is a **single-page application** (PWA) with client-side routing
2. Topic selection triggers **application state change** (not page navigation)
3. Cards represent **actions** (start learning) not destinations
4. Simpler implementation - no href management needed
5. WCAG best practice: buttons for actions, links for navigation

## Accessibility Requirements

### ARIA Attributes
```tsx
// Descriptive label in German
aria-label="Thema [Name] öffnen - [Description]"

// Example
aria-label="Thema Mathematik öffnen - Lernen Sie die Grundlagen der Mathematik"

// For decorative icons
aria-hidden="true"  // on icon elements
```

### Keyboard Support
| Key | Behavior |
|-----|----------|
| Tab | Move focus to next card |
| Shift+Tab | Move focus to previous card |
| Enter | Activate card (select topic) |
| Space | Activate card (select topic) |

**Implementation**: `<button>` provides this automatically. No extra JavaScript needed.

### Focus Indicators
```css
/* Visible focus (WCAG 2.4.7 Level AA) */
.topic-card:focus-visible {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: 2px;
}

/* Remove focus ring for mouse users */
.topic-card:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .topic-card:focus-visible {
    outline-width: 3px;
  }
}
```

### Screen Reader Announcements
Expected announcement for Mathematik card:
```
"Button, Thema Mathematik öffnen - Lernen Sie die Grundlagen der Mathematik"
```

Components:
1. **Role**: "Button" (automatic from `<button>`)
2. **Name**: From `aria-label` attribute
3. **State**: Focused/not focused (automatic)

## Technical Patterns

### Component Interface
```typescript
interface TopicCardProps {
  topic: {
    id: string;
    name: string;
    description: string;
    icon?: string;
  };
  onSelect: (topicId: string) => void;
  className?: string;
  disabled?: boolean;
}
```

### CSS Strategy
1. **Button Reset**: Use `all: unset` OR specific property resets
2. **Preserve Styling**: Reapply card styles after reset
3. **Focus Indicators**: Use `:focus-visible` for keyboard-only
4. **Hover States**: Maintain existing hover effects
5. **Responsive**: Ensure touch targets ≥44x44px (WCAG 2.5.5)

### Testing Strategy
```typescript
// Unit Tests
- Renders as <button> element
- Has type="button" attribute
- Has correct aria-label
- Calls onSelect on click
- Calls onSelect on Enter key
- Calls onSelect on Space key

// Accessibility Tests (jest-axe)
- No WCAG violations
- Passes axe accessibility audit
- Proper ARIA attributes

// E2E Tests (Playwright)
- Can Tab to all cards in sequence
- Enter key activates card
- Space key activates card
- Focus indicator visible
- Screen reader announces correctly
```

## Implementation Checklist

### Phase 1: Component Changes
- [ ] Replace `<div>` with `<button type="button">`
- [ ] Add `aria-label` with German description
- [ ] Add `aria-hidden="true"` to decorative icons
- [ ] Update TypeScript types if needed

### Phase 2: CSS Updates
- [ ] Create button reset styles
- [ ] Add `:focus-visible` styles
- [ ] Ensure hover states work
- [ ] Verify touch target sizes (≥44x44px)
- [ ] Test high contrast mode

### Phase 3: Testing
- [ ] Write unit tests for button behavior
- [ ] Add jest-axe accessibility tests
- [ ] Create E2E keyboard navigation tests
- [ ] Manual screen reader testing (NVDA/JAWS/VoiceOver)

### Phase 4: Verification
- [ ] Run automated accessibility audit (Lighthouse/axe)
- [ ] Verify WCAG 2.1.1 compliance (keyboard)
- [ ] Verify WCAG 4.1.2 compliance (name/role/value)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

## References

### WCAG Guidelines
- [WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- [WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html)
- [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)

### Technical Documentation
- [MDN: `<button>` Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button)
- [MDN: ARIA Labels](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label)
- [WAI-ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

### Tools
- [axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing engine
- [jest-axe](https://github.com/nickcolley/jest-axe) - Jest integration for axe
- [Playwright](https://playwright.dev/docs/accessibility-testing) - E2E testing

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| CSS button reset breaks styling | Medium | Test thoroughly, use specific resets instead of `all: unset` if needed |
| Focus indicators too prominent | Low | Use `:focus-visible` to show only for keyboard users |
| Screen reader announcement unclear | Medium | User test with actual screen reader users |
| Performance impact from CSS changes | Low | Keep CSS minimal, use CSS containment if needed |

## Success Criteria

- ✅ All topic cards use semantic `<button>` elements
- ✅ WCAG 2.1.1 violation fixed (keyboard accessible)
- ✅ WCAG 4.1.2 violation fixed (proper role/name)
- ✅ Zero visual regression (cards look identical)
- ✅ All automated accessibility tests pass
- ✅ Manual screen reader testing successful
- ✅ Cross-browser compatibility verified

## Next Phase
Proceed to Phase 1: Design component interface and create contracts.
