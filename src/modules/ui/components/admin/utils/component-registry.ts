import React from 'react';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { FeedbackCard } from '../../common/FeedbackCard';
import { IconButton } from '../../common/IconButton';
import { MasteryBar } from '../../common/MasteryBar';
import { StatCard } from '../../common/StatCard';
import { Checkbox } from '../../forms/Checkbox';
import { Input } from '../../forms/Input';
import { Select } from '../../forms/Select';
import { Slider } from '../../forms/Slider';
import { TopicCard } from '../../TopicCard';
import { AudioButton } from '../../audio-button';

/**
 * Component category for grouping in the showcase
 */
export type ComponentCategory =
  | 'common'
  | 'forms'
  | 'cards'
  | 'feedback'
  | 'interactive';

/**
 * Component variant demo configuration
 */
export interface ComponentVariant {
  /** Variant name */
  name: string;
  /** Variant description */
  description: string;
  /** Props to pass to the component */
  props: Record<string, unknown>;
  /** Whether to show this variant by default */
  defaultVisible?: boolean;
}

/**
 * Component metadata for the registry
 */
export interface ComponentMeta {
  /** Unique component ID */
  id: string;
  /** Display name */
  name: string;
  /** Component description */
  description: string;
  /** Component category */
  category: ComponentCategory;
  /** React component - accepts heterogeneous props for registry flexibility */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  /** Predefined variants to showcase */
  variants: ComponentVariant[];
  /** Import path for code examples */
  importPath: string;
}

// ============================================================================
// COMPONENT DEFINITIONS
// ============================================================================

/**
 * Complete component registry
 * Maps component IDs to their metadata and demo configurations
 */
export const componentRegistry: Record<string, ComponentMeta> = {
  button: {
    id: 'button',
    name: 'Button',
    description: 'Primary action button with multiple variants, sizes, and states',
    category: 'common',
    component: Button,
    importPath: '@ui/components/common/Button',
    variants: [
      {
        name: 'Primary',
        description: 'Default button variant for primary actions',
        props: { variant: 'primary', children: 'Primary Button' },
        defaultVisible: true,
      },
      {
        name: 'Secondary',
        description: 'Secondary actions with lower emphasis',
        props: { variant: 'secondary', children: 'Secondary Button' },
        defaultVisible: true,
      },
      {
        name: 'Ghost',
        description: 'Minimal button for tertiary actions',
        props: { variant: 'ghost', children: 'Ghost Button' },
        defaultVisible: true,
      },
      {
        name: 'Danger',
        description: 'Destructive actions like delete',
        props: { variant: 'danger', children: 'Delete' },
        defaultVisible: true,
      },
      {
        name: 'Small Size',
        description: 'Compact button for tight spaces',
        props: { size: 'small', children: 'Small Button' },
      },
      {
        name: 'Large Size',
        description: 'Prominent button for emphasis',
        props: { size: 'large', children: 'Large Button' },
      },
      {
        name: 'Loading State',
        description: 'Button with loading spinner',
        props: { loading: true, children: 'Loading...' },
        defaultVisible: true,
      },
      {
        name: 'Disabled',
        description: 'Disabled button state',
        props: { disabled: true, children: 'Disabled' },
      },
      {
        name: 'Full Width',
        description: 'Button that spans container width',
        props: { fullWidth: true, children: 'Full Width Button' },
      },
    ],
  },

  card: {
    id: 'card',
    name: 'Card',
    description: 'Versatile container component with consistent styling',
    category: 'cards',
    component: Card,
    importPath: '@ui/components/common/Card',
    variants: [
      {
        name: 'Default',
        description: 'Standard card with shadow and border',
        props: {
          children: React.createElement('div', {}, 'Card content goes here'),
        },
        defaultVisible: true,
      },
      {
        name: 'No Shadow',
        description: 'Card without shadow',
        props: {
          shadow: false,
          children: React.createElement('div', {}, 'No shadow card'),
        },
      },
      {
        name: 'No Border',
        description: 'Card without border',
        props: {
          border: false,
          children: React.createElement('div', {}, 'No border card'),
        },
      },
      {
        name: 'Small Padding',
        description: 'Compact card with minimal padding',
        props: {
          padding: 'small',
          children: React.createElement('div', {}, 'Small padding'),
        },
      },
      {
        name: 'Large Padding',
        description: 'Spacious card with generous padding',
        props: {
          padding: 'large',
          children: React.createElement('div', {}, 'Large padding'),
        },
        defaultVisible: true,
      },
    ],
  },

  feedbackCard: {
    id: 'feedbackCard',
    name: 'FeedbackCard',
    description: 'Displays feedback messages with success/error states',
    category: 'feedback',
    component: FeedbackCard,
    importPath: '@ui/components/common/FeedbackCard',
    variants: [
      {
        name: 'Success',
        description: 'Green card for correct feedback',
        props: {
          variant: 'success',
          title: 'Richtig!',
          message: 'Gut gemacht.',
        },
        defaultVisible: true,
      },
      {
        name: 'Error',
        description: 'Red card for incorrect feedback',
        props: {
          variant: 'error',
          title: 'Falsch',
          message: 'Nicht ganz richtig. Versuche es noch einmal!',
        },
        defaultVisible: true,
      },
      {
        name: 'Warning',
        description: 'Warning feedback message',
        props: {
          variant: 'warning',
          title: 'Achtung',
          message: 'Bitte überprüfe deine Eingabe sorgfältig.',
        },
      },
      {
        name: 'Info',
        description: 'Informational message',
        props: {
          variant: 'info',
          title: 'Hinweis',
          message: 'Die Photosynthese wandelt Lichtenergie in chemische Energie um.',
        },
      },
    ],
  },

  iconButton: {
    id: 'iconButton',
    name: 'IconButton',
    description: 'Circular button for icon-only actions',
    category: 'common',
    component: IconButton,
    importPath: '@ui/components/common/IconButton',
    variants: [
      {
        name: 'Default',
        description: 'Standard icon button',
        props: {
          'aria-label': 'Close',
          children: '✕',
        },
        defaultVisible: true,
      },
      {
        name: 'With Tooltip',
        description: 'Icon button with title attribute',
        props: {
          'aria-label': 'Settings',
          title: 'Open settings',
          children: '⚙️',
        },
      },
    ],
  },

  masteryBar: {
    id: 'masteryBar',
    name: 'MasteryBar',
    description: 'Visual progress bar showing mastery level',
    category: 'feedback',
    component: MasteryBar,
    importPath: '@ui/components/common/MasteryBar',
    variants: [
      {
        name: 'Low Mastery (25%)',
        description: 'Beginning stage',
        props: { mastery: 0.25 },
        defaultVisible: true,
      },
      {
        name: 'Medium Mastery (50%)',
        description: 'Progressing',
        props: { mastery: 0.5 },
        defaultVisible: true,
      },
      {
        name: 'High Mastery (75%)',
        description: 'Advanced',
        props: { mastery: 0.75 },
        defaultVisible: true,
      },
      {
        name: 'Complete Mastery (100%)',
        description: 'Fully mastered',
        props: { mastery: 1.0 },
        defaultVisible: true,
      },
      {
        name: 'Zero Progress',
        description: 'Not started',
        props: { mastery: 0 },
      },
    ],
  },

  statCard: {
    id: 'statCard',
    name: 'StatCard',
    description: 'Displays a statistic with title and value',
    category: 'cards',
    component: StatCard,
    importPath: '@ui/components/common/StatCard',
    variants: [
      {
        name: 'Tasks Completed',
        description: 'Example task completion stat',
        props: {
          title: 'Aufgaben abgeschlossen',
          value: 127,
        },
        defaultVisible: true,
      },
      {
        name: 'Success Rate',
        description: 'Percentage statistic',
        props: {
          title: 'Erfolgsquote',
          value: '87%',
        },
        defaultVisible: true,
      },
      {
        name: 'Study Streak',
        description: 'Days counter',
        props: {
          title: 'Lernstreak',
          value: '12 Tage',
        },
      },
    ],
  },

  checkbox: {
    id: 'checkbox',
    name: 'Checkbox',
    description: 'Interactive checkbox for selections',
    category: 'forms',
    component: Checkbox,
    importPath: '@ui/components/forms/Checkbox',
    variants: [
      {
        name: 'Unchecked',
        description: 'Default unchecked state',
        props: {
          id: 'demo-checkbox-1',
          checked: false,
          onChange: () => {},
          label: 'Agree to terms',
        },
        defaultVisible: true,
      },
      {
        name: 'Checked',
        description: 'Checked state',
        props: {
          id: 'demo-checkbox-2',
          checked: true,
          onChange: () => {},
          label: 'Agree to terms',
        },
        defaultVisible: true,
      },
      {
        name: 'Disabled',
        description: 'Disabled checkbox',
        props: {
          id: 'demo-checkbox-3',
          checked: false,
          disabled: true,
          onChange: () => {},
          label: 'Cannot change',
        },
      },
    ],
  },

  input: {
    id: 'input',
    name: 'Input',
    description: 'Text input field with validation states',
    category: 'forms',
    component: Input,
    importPath: '@ui/components/forms/Input',
    variants: [
      {
        name: 'Default',
        description: 'Standard text input',
        props: {
          value: '',
          onChange: () => {},
          placeholder: 'Enter text...',
        },
        defaultVisible: true,
      },
      {
        name: 'With Value',
        description: 'Input with text',
        props: {
          value: 'Sample text',
          onChange: () => {},
        },
        defaultVisible: true,
      },
      {
        name: 'Error State',
        description: 'Input showing validation error',
        props: {
          value: 'Wrong answer',
          onChange: () => {},
          error: true,
          helperText: 'This answer is incorrect',
        },
        defaultVisible: true,
      },
      {
        name: 'Success State',
        description: 'Input showing validation success',
        props: {
          value: 'Correct answer',
          onChange: () => {},
          success: true,
          helperText: 'Perfect!',
        },
        defaultVisible: true,
      },
      {
        name: 'Full Width',
        description: 'Input spanning container width',
        props: {
          value: '',
          onChange: () => {},
          placeholder: 'Full width input',
          fullWidth: true,
        },
      },
      {
        name: 'Disabled',
        description: 'Disabled input field',
        props: {
          value: 'Cannot edit',
          onChange: () => {},
          disabled: true,
        },
      },
    ],
  },

  select: {
    id: 'select',
    name: 'Select',
    description: 'Dropdown selection component',
    category: 'forms',
    component: Select,
    importPath: '@ui/components/forms/Select',
    variants: [
      {
        name: 'Default',
        description: 'Standard dropdown',
        props: {
          id: 'demo-select-1',
          value: '',
          onChange: () => {},
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        },
        defaultVisible: true,
      },
      {
        name: 'With Selection',
        description: 'Dropdown with selected value',
        props: {
          id: 'demo-select-2',
          value: 'option2',
          onChange: () => {},
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        },
        defaultVisible: true,
      },
      {
        name: 'Disabled',
        description: 'Disabled dropdown',
        props: {
          id: 'demo-select-3',
          value: 'option1',
          disabled: true,
          onChange: () => {},
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        },
      },
    ],
  },

  slider: {
    id: 'slider',
    name: 'Slider',
    description: 'Range slider for numeric input',
    category: 'forms',
    component: Slider,
    importPath: '@ui/components/forms/Slider',
    variants: [
      {
        name: 'Default (50%)',
        description: 'Standard slider at middle position',
        props: {
          id: 'demo-slider-1',
          value: 50,
          onChange: () => {},
          min: 0,
          max: 100,
        },
        defaultVisible: true,
      },
      {
        name: 'Low Value (25%)',
        description: 'Slider at lower position',
        props: {
          id: 'demo-slider-2',
          value: 25,
          onChange: () => {},
          min: 0,
          max: 100,
        },
        defaultVisible: true,
      },
      {
        name: 'High Value (75%)',
        description: 'Slider at higher position',
        props: {
          id: 'demo-slider-3',
          value: 75,
          onChange: () => {},
          min: 0,
          max: 100,
        },
        defaultVisible: true,
      },
      {
        name: 'With Labels',
        description: 'Slider with min/max labels',
        props: {
          id: 'demo-slider-4',
          value: 50,
          onChange: () => {},
          min: 0,
          max: 100,
          label: 'Volume',
        },
      },
      {
        name: 'Disabled',
        description: 'Disabled slider',
        props: {
          id: 'demo-slider-5',
          value: 60,
          onChange: () => {},
          min: 0,
          max: 100,
          disabled: true,
        },
      },
    ],
  },

  topicCard: {
    id: 'topicCard',
    name: 'TopicCard',
    description: 'Card displaying a learning topic with icon and metadata',
    category: 'cards',
    component: TopicCard,
    importPath: '@ui/components/TopicCard',
    variants: [
      {
        name: 'Math Topic',
        description: 'Example mathematics topic',
        props: {
          topic: {
            id: 'demo-math',
            name: 'Mathematik',
            description: 'Grundlegende mathematische Konzepte und Aufgaben',
            icon: '🔢',
          },
          onSelect: () => {},
        },
        defaultVisible: true,
      },
      {
        name: 'Biology Topic',
        description: 'Example biology topic',
        props: {
          topic: {
            id: 'demo-biology',
            name: 'Biologie',
            description: 'Lerne über Zellen, Genetik und Ökosysteme',
            icon: '🧬',
          },
          onSelect: () => {},
        },
        defaultVisible: true,
      },
      {
        name: 'Spanish Topic',
        description: 'Example language topic',
        props: {
          topic: {
            id: 'demo-spanish',
            name: 'Spanisch',
            description: 'Verbessere deine Spanischkenntnisse',
            icon: '🇪🇸',
          },
          onSelect: () => {},
        },
      },
    ],
  },

  audioButton: {
    id: 'audioButton',
    name: 'AudioButton',
    description: 'Button that plays audio pronunciation',
    category: 'interactive',
    component: AudioButton,
    importPath: '@ui/components/audio-button',
    variants: [
      {
        name: 'With Audio',
        description: 'Audio button with audioUrl',
        props: {
          text: 'Hola',
          audioUrl: 'https://example.com/audio/hola.mp3',
        },
        defaultVisible: true,
      },
      {
        name: 'Without Audio',
        description: 'Audio button without audioUrl (disabled state)',
        props: {
          text: 'Buenos días',
        },
        defaultVisible: true,
      },
      {
        name: 'Disabled',
        description: 'Explicitly disabled audio button',
        props: {
          text: 'Adiós',
          audioUrl: 'https://example.com/audio/adios.mp3',
          disabled: true,
        },
      },
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all components in a specific category
 */
/**
 * Get all components as an array
 */
export function getAllComponents(): ComponentMeta[] {
  return Object.values(componentRegistry);
}

export function getComponentsByCategory(category: ComponentCategory): ComponentMeta[] {
  return Object.values(componentRegistry).filter((comp) => comp.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): ComponentCategory[] {
  const categories = new Set(Object.values(componentRegistry).map((comp) => comp.category));
  return Array.from(categories).sort();
}

/**
 * Get component by ID
 */
export function getComponent(id: string): ComponentMeta | undefined {
  return componentRegistry[id];
}

/**
 * Search components by name or description
 */
export function searchComponents(query: string): ComponentMeta[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(componentRegistry).filter(
    (comp) =>
      comp.name.toLowerCase().includes(lowerQuery) ||
      comp.description.toLowerCase().includes(lowerQuery)
  );
}
