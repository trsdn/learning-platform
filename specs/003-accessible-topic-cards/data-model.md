# Data Model: Accessible Topic Cards

**Feature**: Accessible Topic Cards with Semantic Buttons
**Branch**: `003-accessible-topic-cards`
**Phase**: 1 - Design

## Component Interface

### TopicCard Component

```typescript
interface TopicCardProps {
  /**
   * Topic data to display
   */
  topic: Topic;

  /**
   * Callback when card is selected/activated
   * @param topicId - ID of the selected topic
   */
  onSelect: (topicId: string) => void;

  /**
   * Optional CSS class name for styling customization
   */
  className?: string;

  /**
   * Whether the card is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Optional test ID for E2E testing
   */
  'data-testid'?: string;
}
```

### Topic Entity

```typescript
interface Topic {
  /**
   * Unique identifier for the topic
   */
  id: string;

  /**
   * Display name of the topic (German)
   * @example "Mathematik"
   */
  name: string;

  /**
   * Short description of the topic (German)
   * @example "Lernen Sie die Grundlagen der Mathematik"
   */
  description: string;

  /**
   * Optional emoji or icon identifier
   * @example "🔢"
   */
  icon?: string;

  /**
   * Optional background color
   * @example "#3b82f6"
   */
  color?: string;
}
```

## Component Behavior

### Accessibility Contract

```typescript
/**
 * Accessibility requirements for TopicCard
 */
interface AccessibilityContract {
  /**
   * Component MUST use semantic <button> element
   */
  element: 'button';

  /**
   * Button type MUST be "button" to prevent form submission
   */
  type: 'button';

  /**
   * ARIA label MUST follow German pattern
   * Pattern: "Thema {name} öffnen - {description}"
   * @example "Thema Mathematik öffnen - Lernen Sie die Grundlagen der Mathematik"
   */
  ariaLabel: string;

  /**
   * Decorative icons MUST have aria-hidden="true"
   */
  iconAriaHidden: true;

  /**
   * Keyboard support requirements
   */
  keyboard: {
    /** Tab key moves focus to card */
    tab: 'focus';
    /** Shift+Tab moves focus to previous card */
    shiftTab: 'focus-previous';
    /** Enter key activates card */
    enter: 'activate';
    /** Space key activates card */
    space: 'activate';
  };

  /**
   * Focus indicator MUST be visible for keyboard users
   * Uses :focus-visible pseudo-class
   */
  focusIndicator: {
    outline: '2px solid var(--focus-color, #0066cc)';
    outlineOffset: '2px';
  };
}
```

### Event Handling

```typescript
/**
 * Event handling contract for TopicCard
 */
interface EventContract {
  /**
   * onClick handler MUST call onSelect with topic.id
   */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * onKeyDown handler provided by <button> automatically
   * - Enter key triggers onClick
   * - Space key triggers onClick
   */
  onKeyDown: 'native-button-behavior';
}
```

## CSS Architecture

### Button Reset Pattern

```typescript
/**
 * CSS reset requirements for button element
 */
interface CSSResetContract {
  /**
   * Strategy: Specific property resets (preferred over 'all: unset')
   */
  strategy: 'specific-resets';

  /**
   * Required reset properties
   */
  resets: {
    background: 'none';
    border: 'none';
    padding: '0';
    font: 'inherit';
    cursor: 'pointer';
    display: 'block';
    width: '100%';
    textAlign: 'left';
  };
}
```

### Styling Contract

```typescript
/**
 * Styling requirements for TopicCard
 */
interface StylingContract {
  /**
   * Base card styles (preserve existing design)
   */
  base: {
    /** Min touch target size for WCAG 2.5.5 */
    minWidth: '44px';
    minHeight: '44px';
  };

  /**
   * Interactive states
   */
  states: {
    /** Hover effect (preserve existing) */
    hover: 'transform: translateY(-2px); box-shadow: enhanced';

    /** Focus visible (keyboard only) */
    focusVisible: 'outline: 2px solid var(--focus-color); outline-offset: 2px';

    /** Focus not visible (mouse users) */
    focusNotVisible: 'outline: none';

    /** Active/pressed state */
    active: 'transform: translateY(0)';

    /** Disabled state */
    disabled: 'opacity: 0.5; cursor: not-allowed';
  };

  /**
   * Responsive design
   */
  responsive: {
    /** Mobile: Full width cards */
    mobile: 'width: 100%';

    /** Tablet: Grid layout */
    tablet: 'grid-template-columns: repeat(2, 1fr)';

    /** Desktop: Grid layout */
    desktop: 'grid-template-columns: repeat(4, 1fr)';
  };
}
```

## Testing Contract

### Unit Test Requirements

```typescript
/**
 * Unit test coverage requirements
 */
interface UnitTestContract {
  /**
   * Component rendering tests
   */
  rendering: {
    'renders as button element': true;
    'has type="button" attribute': true;
    'displays topic name': true;
    'displays topic description': true;
    'displays icon if provided': true;
    'applies custom className': true;
  };

  /**
   * Accessibility tests
   */
  accessibility: {
    'has correct aria-label': true;
    'icon has aria-hidden="true"': true;
    'is keyboard accessible': true;
    'has visible focus indicator': true;
  };

  /**
   * Interaction tests
   */
  interaction: {
    'calls onSelect on click': true;
    'calls onSelect on Enter key': true;
    'calls onSelect on Space key': true;
    'does not call onSelect when disabled': true;
  };

  /**
   * Edge cases
   */
  edgeCases: {
    'handles missing icon': true;
    'handles missing description': true;
    'handles long topic names': true;
  };
}
```

### Accessibility Test Requirements

```typescript
/**
 * Accessibility test requirements (jest-axe)
 */
interface A11yTestContract {
  /**
   * Automated accessibility checks
   */
  automated: {
    'no WCAG violations': true;
    'passes axe audit': true;
    'proper ARIA attributes': true;
  };

  /**
   * WCAG compliance checks
   */
  wcag: {
    '2.1.1 Keyboard (Level A)': 'compliant';
    '4.1.2 Name, Role, Value (Level A)': 'compliant';
    '2.4.7 Focus Visible (Level AA)': 'compliant';
    '2.5.5 Target Size (Level AAA)': 'compliant';
  };
}
```

### E2E Test Requirements

```typescript
/**
 * E2E test requirements (Playwright)
 */
interface E2ETestContract {
  /**
   * Keyboard navigation tests
   */
  keyboard: {
    'can Tab to all cards in sequence': true;
    'Enter key activates card': true;
    'Space key activates card': true;
    'focus indicator visible': true;
  };

  /**
   * Screen reader tests
   */
  screenReader: {
    'announces as button': true;
    'reads aria-label correctly': true;
    'announces focus state': true;
  };

  /**
   * Cross-browser tests
   */
  crossBrowser: {
    'Chrome': 'pass';
    'Firefox': 'pass';
    'Safari': 'pass';
    'Edge': 'pass';
  };
}
```

## State Management

### Component State

```typescript
/**
 * Internal component state (if needed)
 */
interface TopicCardState {
  /**
   * No internal state needed - fully controlled component
   */
  none: true;
}
```

### Parent Component Integration

```typescript
/**
 * Integration with TopicSelection parent component
 */
interface ParentIntegration {
  /**
   * Parent provides topics array
   */
  topics: Topic[];

  /**
   * Parent handles selection
   */
  onTopicSelect: (topicId: string) => void;

  /**
   * Example usage
   */
  usage: `
    <div className="topic-grid">
      {topics.map(topic => (
        <TopicCard
          key={topic.id}
          topic={topic}
          onSelect={handleTopicSelect}
        />
      ))}
    </div>
  `;
}
```

## Performance Considerations

```typescript
/**
 * Performance contract
 */
interface PerformanceContract {
  /**
   * Rendering performance
   */
  rendering: {
    /** Component should be memoized if in large lists */
    memoization: 'React.memo recommended';

    /** Click handler should be stable reference */
    stableCallback: 'useCallback recommended';
  };

  /**
   * Interaction performance
   */
  interaction: {
    /** Click response time */
    clickResponse: '<100ms';

    /** Focus indicator render time */
    focusResponse: '<16ms (1 frame)';
  };
}
```

## Migration Path

### From Existing Implementation

```typescript
/**
 * Migration from div to button
 */
interface MigrationContract {
  /**
   * Before (current)
   */
  before: `
    <div
      className="topic-card"
      onClick={() => onSelect(topic.id)}
    >
      {/* content */}
    </div>
  `;

  /**
   * After (new)
   */
  after: `
    <button
      type="button"
      className="topic-card"
      onClick={() => onSelect(topic.id)}
      aria-label={\`Thema \${topic.name} öffnen - \${topic.description}\`}
    >
      <span className="topic-card__icon" aria-hidden="true">
        {topic.icon}
      </span>
      <h3 className="topic-card__title">{topic.name}</h3>
      <p className="topic-card__description">{topic.description}</p>
    </button>
  `;

  /**
   * CSS changes required
   */
  cssChanges: {
    add: 'button reset styles, :focus-visible styles';
    preserve: 'all existing card styles';
    remove: 'none';
  };

  /**
   * Breaking changes
   */
  breaking: 'none - backward compatible';
}
```

## Success Criteria

```typescript
/**
 * Definition of Done
 */
interface SuccessCriteria {
  /**
   * Functional requirements
   */
  functional: {
    'Uses semantic <button> element': true;
    'Keyboard accessible': true;
    'Screen reader friendly': true;
    'Visual design unchanged': true;
  };

  /**
   * Quality requirements
   */
  quality: {
    'Zero WCAG violations': true;
    '100% test coverage': true;
    'All tests passing': true;
    'Cross-browser verified': true;
  };

  /**
   * Performance requirements
   */
  performance: {
    'No visual regression': true;
    '<100ms interaction response': true;
    'No layout shift': true;
  };
}
```

## References

- WCAG 2.1.1: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
- WCAG 4.1.2: https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html
- WAI-ARIA Button Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- React Button Accessibility: https://react.dev/reference/react-dom/components/button
