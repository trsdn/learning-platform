# Common UI Components

Reusable UI components built with design tokens for consistency across the application.

## Button

A versatile button component with multiple variants, sizes, and states.

### Import

```typescript
import { Button } from '@ui/components/common';
```

### Basic Usage

```tsx
<Button onClick={() => console.log('clicked')}>
  Click me
</Button>
```

### Variants

```tsx
{/* Primary - Main actions */}
<Button variant="primary">Primary Button</Button>

{/* Secondary - Secondary actions */}
<Button variant="secondary">Secondary Button</Button>

{/* Ghost - Subtle actions */}
<Button variant="ghost">Ghost Button</Button>

{/* Danger - Destructive actions */}
<Button variant="danger">Delete</Button>
```

### Sizes

```tsx
<Button size="small">Small</Button>
<Button size="medium">Medium (default)</Button>
<Button size="large">Large</Button>
```

### States

```tsx
{/* Disabled */}
<Button disabled>Disabled</Button>

{/* Loading */}
<Button loading>Loading...</Button>

{/* Full width */}
<Button fullWidth>Full Width</Button>
```

### With Icons

```tsx
import { TrashIcon, ArrowRightIcon } from 'your-icon-library';

{/* Start icon */}
<Button startIcon={<TrashIcon />}>
  Delete
</Button>

{/* End icon */}
<Button endIcon={<ArrowRightIcon />}>
  Next
</Button>

{/* Both icons */}
<Button
  startIcon={<SaveIcon />}
  endIcon={<CheckIcon />}
>
  Save & Continue
</Button>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `loading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable the button |
| `fullWidth` | `boolean` | `false` | Take up full width of container |
| `startIcon` | `React.ReactNode` | - | Icon before text |
| `endIcon` | `React.ReactNode` | - | Icon after text |
| `onClick` | `() => void` | - | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | - | HTML button type |
| `className` | `string` | - | Additional CSS classes |
| `style` | `React.CSSProperties` | - | Custom inline styles |

---

## IconButton

A button component specifically for icon-only or icon+label actions.

### Import

```typescript
import { IconButton } from '@ui/components/common';
```

### Basic Usage

```tsx
<IconButton
  icon={<CloseIcon />}
  label="Close"
  onClick={handleClose}
/>
```

### Variants

```tsx
{/* Ghost - Default, subtle */}
<IconButton icon={<SettingsIcon />} label="Settings" />

{/* Primary */}
<IconButton
  icon={<AddIcon />}
  label="Add"
  variant="primary"
/>

{/* Secondary */}
<IconButton
  icon={<EditIcon />}
  label="Edit"
  variant="secondary"
/>

{/* Danger */}
<IconButton
  icon={<DeleteIcon />}
  label="Delete"
  variant="danger"
/>
```

### Sizes

```tsx
<IconButton
  icon={<ArrowIcon />}
  label="Move"
  size="small"
/>

<IconButton
  icon={<ArrowIcon />}
  label="Move"
  size="medium"
/>

<IconButton
  icon={<ArrowIcon />}
  label="Move"
  size="large"
/>
```

### With Label Visible

```tsx
<IconButton
  icon={<DownloadIcon />}
  label="Download"
  showLabel
/>
```

### Arrow Buttons (Common Use Case)

```tsx
{/* Up/Down arrows for ordering */}
<IconButton
  icon={<>↑</>}
  label="Move up"
  variant="secondary"
  size="small"
  onClick={handleMoveUp}
/>

<IconButton
  icon={<>↓</>}
  label="Move down"
  variant="secondary"
  size="small"
  onClick={handleMoveDown}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ReactNode` | **Required** | Icon to display |
| `label` | `string` | - | Accessibility label (tooltip) |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'ghost'` | Visual style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `showLabel` | `boolean` | `false` | Show label text next to icon |
| `disabled` | `boolean` | `false` | Disable the button |
| `onClick` | `() => void` | - | Click handler |
| `className` | `string` | - | Additional CSS classes |
| `style` | `React.CSSProperties` | - | Custom inline styles |

---

## Accessibility

Both components follow accessibility best practices:

- **Keyboard Navigation**: Fully keyboard accessible with focus states
- **ARIA Labels**: IconButton uses `aria-label` for screen readers
- **Focus Indicators**: Clear focus outlines (2px solid blue, 2px offset)
- **Disabled States**: Properly communicated to assistive technologies
- **Semantic HTML**: Uses native `<button>` elements

## Design Tokens

All components use design tokens for consistency:

- Colors from `colors` palette
- Spacing from `spacing` scale
- Typography from `typography` tokens
- Transitions from `transitions` presets
- Component-specific tokens from `components.button`

## Examples

### Form Submit Button

```tsx
<form onSubmit={handleSubmit}>
  <Button
    type="submit"
    variant="primary"
    loading={isSubmitting}
    fullWidth
  >
    Submit Form
  </Button>
</form>
```

### Modal Actions

```tsx
<div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
  <Button variant="ghost" onClick={handleCancel}>
    Cancel
  </Button>
  <Button variant="primary" onClick={handleSave}>
    Save Changes
  </Button>
</div>
```

### Close Button

```tsx
<IconButton
  icon={<>×</>}
  label="Close dialog"
  onClick={handleClose}
  style={{ position: 'absolute', top: '1rem', right: '1rem' }}
/>
```

### Ordering Controls

```tsx
<div style={{ display: 'flex', gap: '0.25rem' }}>
  <IconButton
    icon={<>↑</>}
    label="Move up"
    size="small"
    onClick={handleMoveUp}
    disabled={isFirst}
  />
  <IconButton
    icon={<>↓</>}
    label="Move down"
    size="small"
    onClick={handleMoveDown}
    disabled={isLast}
  />
</div>
```

## Migration from Inline Styles

### Before (Inline Styles)

```tsx
<button
  onClick={handleClick}
  style={{
    padding: '0.5rem 1rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  }}
>
  Click me
</button>
```

### After (Button Component)

```tsx
<Button onClick={handleClick}>
  Click me
</Button>
```

### Benefits

- ✅ Consistent styling across the app
- ✅ Built-in hover/focus/disabled states
- ✅ Accessibility features included
- ✅ Type-safe props
- ✅ Loading states
- ✅ Icon support
- ✅ Less code to write
