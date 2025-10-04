## Issue Description
Topic cards on the homepage are implemented as clickable `<div>` elements instead of semantic `<button>` or `<a>` elements, which creates accessibility and usability issues.

## Current Behavior
- Topic cards use `<div>` with click handlers
- Not keyboard accessible by default
- Screen readers don't announce as interactive elements
- Missing role and ARIA attributes

## Expected Behavior
- Interactive cards should use semantic HTML elements
- Should be keyboard accessible (focusable and activatable with Enter/Space)
- Screen readers should announce as clickable/interactive
- Should follow button or link semantics

## Accessibility Impact
- **Keyboard users**: Cannot navigate to cards via Tab key
- **Screen reader users**: Cards not announced as interactive
- **WCAG 2.1 violations**: 
  - 4.1.2 Name, Role, Value (Level A)
  - 2.1.1 Keyboard (Level A)

## Affected Components
- Topic selection cards (Mathematik, Biologie, Geschichte, Geographie)

## Suggested Fix
Replace clickable divs with semantic elements:

### Option 1: Button (for SPA navigation)
\`\`\`jsx
<button 
  className="topic-card"
  onClick={handleClick}
  aria-label="Thema Mathematik öffnen"
>
  {/* card content */}
</button>
\`\`\`

### Option 2: Link (for route navigation)
\`\`\`jsx
<a 
  href="/topic/mathematik"
  className="topic-card"
>
  {/* card content */}
</a>
\`\`\`

## Additional CSS needed
\`\`\`css
.topic-card {
  all: unset; /* for button */
  cursor: pointer;
  display: block;
  /* existing card styles */
}
\`\`\`

## Priority
**CRITICAL** - Violates WCAG Level A accessibility requirements

## Labels
accessibility, WCAG, critical, a11y, semantic-html
