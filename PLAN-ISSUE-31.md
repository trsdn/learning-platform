# Implementation Plan: Admin Test Pages (Issue #31)

## 📋 Issue Summary
Build two test/sample pages in the admin section:
1. **UI Component Library Page** - Display all UI components with examples
2. **Task Types Showcase Page** - Display all available task types with samples

**Goal**: Provide visual documentation, enable testing/validation, showcase implementations, support design system consistency, aid development and debugging.

## 🏗️ Architecture Decision

### Routing Strategy: State Management (Option A)
**Rationale:**
- ✅ Consistent with existing architecture (no routing library)
- ✅ Follows Settings/Dashboard pattern
- ✅ Zero new dependencies
- ✅ Tab-based navigation within admin panel
- ✅ Can use hash fragments (#components, #tasks) for bookmarking

**Implementation:**
```tsx
// State in main.tsx
const [showAdmin, setShowAdmin] = useState(false);
const [adminTab, setAdminTab] = useState<'components' | 'tasks'>('components');

// Conditional rendering
{showAdmin && (
  <AdminPage
    activeTab={adminTab}
    onTabChange={setAdminTab}
    onClose={() => setShowAdmin(false)}
  />
)}
```

## 📁 File Structure

```
src/modules/ui/components/admin/
├── AdminPage.tsx                    # Main container with tabs
├── AdminPage.module.css
├── ComponentLibrary.tsx             # Components showcase
├── ComponentLibrary.module.css
├── TaskTypesShowcase.tsx            # Task types showcase
├── TaskTypesShowcase.module.css
├── ComponentDemo.tsx                # Reusable component demo card
├── ComponentDemo.module.css
├── TaskDemo.tsx                     # Reusable task demo card
├── TaskDemo.module.css
└── utils/
    ├── component-registry.ts        # Registry of all components with metadata
    ├── task-sample-generator.ts     # Generate sample tasks from templates
    └── code-example-generator.ts    # Generate code examples

tests/unit/admin/
├── AdminPage.test.tsx
├── ComponentLibrary.test.tsx
└── TaskTypesShowcase.test.tsx

tests/e2e/
└── admin.spec.ts                    # E2E tests for admin pages
```

## 🎯 Detailed Implementation Plan

### Phase 1: Admin Infrastructure (2 hours)

#### 1.1 Create AdminPage Component
**File**: `src/modules/ui/components/admin/AdminPage.tsx`

```tsx
interface AdminPageProps {
  activeTab: 'components' | 'tasks';
  onTabChange: (tab: 'components' | 'tasks') => void;
  onClose: () => void;
}

export function AdminPage({ activeTab, onTabChange, onClose }: AdminPageProps) {
  // Full-screen overlay with tabs
  // Close button (X)
  // Tab navigation: Components | Task Types
  // Content area renders ComponentLibrary or TaskTypesShowcase
}
```

**Features:**
- Full-screen overlay (fixed position, z-index: 1000)
- Header with title "Admin Test Pages" and close button
- Tab navigation with active state
- Keyboard shortcut hint (ESC to close)
- Responsive layout

#### 1.2 Add Admin Access to main.tsx
**File**: `src/modules/ui/components/admin/AdminPage.tsx`

**Changes:**
```tsx
// Add state
const [showAdmin, setShowAdmin] = useState(false);
const [adminTab, setAdminTab] = useState<'components' | 'tasks'>('components');

// Add keyboard shortcut
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    // Ctrl+Shift+A or Cmd+Shift+A
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      setShowAdmin(prev => !prev);
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);

// Add admin button to header (only in dev or always - will decide based on user pref)
// Render admin panel conditionally
{showAdmin && (
  <AdminPage
    activeTab={adminTab}
    onTabChange={setAdminTab}
    onClose={() => setShowAdmin(false)}
  />
)}
```

**Access Methods:**
1. Keyboard shortcut: `Ctrl+Shift+A` / `Cmd+Shift+A`
2. Button in header: "Admin" button (small, ghost variant)
3. Hash fragment: Listen for `#admin`, `#admin/components`, `#admin/tasks`

### Phase 2: Component Library (4 hours)

#### 2.1 Component Registry
**File**: `src/modules/ui/components/admin/utils/component-registry.ts`

```typescript
export interface ComponentInfo {
  name: string;
  category: 'forms' | 'feedback' | 'layout' | 'media' | 'navigation';
  description: string;
  path: string;
  variants: ComponentVariant[];
  props: ComponentProp[];
}

export interface ComponentVariant {
  name: string;
  props: Record<string, any>;
  label: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  default?: any;
  description: string;
}

export const componentRegistry: ComponentInfo[] = [
  {
    name: 'Button',
    category: 'forms',
    description: 'A reusable button component with multiple variants',
    path: '@/modules/ui/components/common/Button',
    variants: [
      { name: 'primary', props: { variant: 'primary' }, label: 'Primary' },
      { name: 'secondary', props: { variant: 'secondary' }, label: 'Secondary' },
      { name: 'ghost', props: { variant: 'ghost' }, label: 'Ghost' },
      { name: 'danger', props: { variant: 'danger' }, label: 'Danger' },
    ],
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", default: 'primary', description: 'Visual style variant' },
      { name: 'size', type: "'small' | 'medium' | 'large'", default: 'medium', description: 'Button size' },
      { name: 'loading', type: 'boolean', default: false, description: 'Loading state' },
      { name: 'fullWidth', type: 'boolean', default: false, description: 'Full width' },
    ]
  },
  // ... all other components
];
```

**Registry includes:**
- Button (4 variants, 3 sizes, loading, disabled, fullWidth)
- Input (text, email, password, number, error states)
- Checkbox (checked, indeterminate, disabled)
- Select (options, disabled, error)
- Slider (range, step, disabled)
- Card (padding variants, shadow, border)
- FeedbackCard (success, error, warning, info)
- StatCard (with/without trend)
- MasteryBar (different levels)
- IconButton (variants, sizes)
- AudioButton (playing, paused, disabled)
- TopicCard (different states)

#### 2.2 ComponentDemo Wrapper
**File**: `src/modules/ui/components/admin/ComponentDemo.tsx`

```tsx
interface ComponentDemoProps {
  info: ComponentInfo;
}

export function ComponentDemo({ info }: ComponentDemoProps) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [customProps, setCustomProps] = useState({});
  const [showCode, setShowCode] = useState(false);

  return (
    <Card className={styles.demo}>
      <div className={styles.demo__header}>
        <h3>{info.name}</h3>
        <p>{info.description}</p>
      </div>

      <div className={styles.demo__controls}>
        {/* Variant selector */}
        {/* Prop toggles (size, disabled, loading, etc.) */}
      </div>

      <div className={styles.demo__preview}>
        {/* Live component render with current props */}
      </div>

      <div className={styles.demo__code}>
        <button onClick={() => setShowCode(!showCode)}>
          {showCode ? 'Hide' : 'Show'} Code
        </button>
        {showCode && (
          <pre><code>{generateCodeExample(info, customProps)}</code></pre>
        )}
      </div>

      <div className={styles.demo__props}>
        <h4>Props</h4>
        <table>
          {/* Props table */}
        </table>
      </div>
    </Card>
  );
}
```

#### 2.3 ComponentLibrary Page
**File**: `src/modules/ui/components/admin/ComponentLibrary.tsx`

```tsx
export function ComponentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['forms', 'feedback', 'layout', 'media', 'navigation'];

  const filteredComponents = componentRegistry
    .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(c => !selectedCategory || c.category === selectedCategory);

  return (
    <div className={styles.library}>
      <div className={styles.library__filters}>
        <Input
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className={styles.library__categories}>
          {categories.map(cat => (
            <button
              key={cat}
              className={selectedCategory === cat ? styles.active : ''}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.library__grid}>
        {filteredComponents.map(component => (
          <ComponentDemo key={component.name} info={component} />
        ))}
      </div>
    </div>
  );
}
```

**Features:**
- Search by component name
- Filter by category
- Grid layout (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
- Each component in ComponentDemo card
- Live interactive demos

### Phase 3: Task Types Showcase (4 hours)

#### 3.1 Task Sample Generator
**File**: `src/modules/ui/components/admin/utils/task-sample-generator.ts`

```typescript
export interface TaskSample {
  type: TaskType;
  name: string;
  description: string;
  template: string;
  sampleTask: Task;
}

export async function generateTaskSamples(): Promise<TaskSample[]> {
  const db = await getDatabase();

  // Get one sample task for each task type
  const taskTypes: TaskType[] = [
    'multiple-choice',
    'cloze-deletion',
    'true-false',
    'ordering',
    'matching',
    'multiple-select',
    'slider',
    'word-scramble',
    'flashcard',
    'text-input'
  ];

  const samples: TaskSample[] = [];

  for (const type of taskTypes) {
    const tasks = await db.tasks.where('type').equals(type).limit(3).toArray();

    if (tasks.length > 0) {
      samples.push({
        type,
        name: formatTaskTypeName(type),
        description: getTaskTypeDescription(type),
        template: tasks[0].templateId,
        sampleTask: tasks[0]
      });
    }
  }

  return samples;
}

function formatTaskTypeName(type: TaskType): string {
  return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getTaskTypeDescription(type: TaskType): string {
  const descriptions = {
    'multiple-choice': 'Select one correct answer from multiple options',
    'cloze-deletion': 'Fill in the blanks in a sentence',
    'true-false': 'Determine if a statement is true or false',
    'ordering': 'Arrange items in the correct order',
    'matching': 'Match pairs of related items',
    'multiple-select': 'Select all correct answers from options',
    'slider': 'Select a value on a continuous scale',
    'word-scramble': 'Unscramble letters to form a word',
    'flashcard': 'Flip card to reveal answer and self-assess',
    'text-input': 'Type the correct answer'
  };
  return descriptions[type] || '';
}
```

#### 3.2 TaskDemo Component
**File**: `src/modules/ui/components/admin/TaskDemo.tsx`

```tsx
interface TaskDemoProps {
  sample: TaskSample;
}

export function TaskDemo({ sample }: TaskDemoProps) {
  const [isAnswering, setIsAnswering] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const handleReset = () => {
    setIsAnswering(false);
    setShowSolution(false);
  };

  return (
    <Card className={styles.taskDemo}>
      <div className={styles.taskDemo__header}>
        <h3>{sample.name}</h3>
        <span className={styles.taskDemo__type}>{sample.type}</span>
      </div>

      <p className={styles.taskDemo__description}>
        {sample.description}
      </p>

      <div className={styles.taskDemo__metadata}>
        <span>Difficulty: {sample.sampleTask.metadata.difficulty}</span>
        <span>Template: {sample.template}</span>
        <span>Points: {sample.sampleTask.metadata.points}</span>
      </div>

      <div className={styles.taskDemo__interactive}>
        {isAnswering ? (
          <>
            {/* Render actual task component (mini practice session) */}
            <div className={styles.taskDemo__task}>
              {renderTaskByType(sample.sampleTask, {
                onAnswer: () => setShowSolution(true)
              })}
            </div>

            {showSolution && (
              <div className={styles.taskDemo__solution}>
                <h4>Solution</h4>
                {/* Show correct answer and explanation */}
              </div>
            )}
          </>
        ) : (
          <Button onClick={() => setIsAnswering(true)}>
            Try This Task
          </Button>
        )}
      </div>

      <div className={styles.taskDemo__actions}>
        <Button variant="ghost" size="small" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </Card>
  );
}

// Helper to render task by type
function renderTaskByType(task: Task, handlers: { onAnswer: () => void }) {
  switch (task.type) {
    case 'multiple-choice':
      return <MultipleChoiceTask task={task} {...handlers} />;
    case 'cloze-deletion':
      return <ClozeDeletionTask task={task} {...handlers} />;
    // ... other types
  }
}
```

#### 3.3 TaskTypesShowcase Page
**File**: `src/modules/ui/components/admin/TaskTypesShowcase.tsx`

```tsx
export function TaskTypesShowcase() {
  const [samples, setSamples] = useState<TaskSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);

  useEffect(() => {
    loadSamples();
  }, []);

  async function loadSamples() {
    setLoading(true);
    const taskSamples = await generateTaskSamples();
    setSamples(taskSamples);
    setLoading(false);
  }

  const filteredSamples = samples
    .filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(s => !difficultyFilter || s.sampleTask.metadata.difficulty === difficultyFilter);

  if (loading) {
    return <div>Loading task samples...</div>;
  }

  return (
    <div className={styles.showcase}>
      <div className={styles.showcase__filters}>
        <Input
          placeholder="Search task types..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          value={difficultyFilter || ''}
          onChange={(e) => setDifficultyFilter(e.target.value || null)}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
      </div>

      <div className={styles.showcase__stats}>
        <StatCard
          label="Task Types"
          value={samples.length.toString()}
        />
        <StatCard
          label="Total Tasks"
          value="..."
        />
      </div>

      <div className={styles.showcase__grid}>
        {filteredSamples.map(sample => (
          <TaskDemo key={sample.type} sample={sample} />
        ))}
      </div>
    </div>
  );
}
```

**Features:**
- Load one sample task for each of 10 task types
- Search by task type name
- Filter by difficulty
- Interactive task demos (fully functional)
- Reset functionality
- Show solutions/explanations
- Display metadata

### Phase 4: Styling (integrated)

All components use CSS Modules following existing patterns:

**AdminPage.module.css:**
- Full-screen overlay (fixed, inset: 0, z-index: 1000)
- Dark semi-transparent backdrop
- White panel with tabs
- Responsive padding
- Smooth animations (fade in/out)

**ComponentLibrary.module.css:**
- Grid layout (CSS Grid)
- Responsive columns (1/2/3 based on viewport)
- Card hover effects
- Filter bar styling

**TaskTypesShowcase.module.css:**
- Similar grid layout
- Task demo cards with clear sections
- Interactive state styling (answering, showing solution)

### Phase 5: Testing (3 hours)

#### 5.1 Unit Tests
**tests/unit/admin/AdminPage.test.tsx:**
```tsx
describe('AdminPage', () => {
  it('renders with tabs', () => {
    render(<AdminPage activeTab="components" onTabChange={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Task Types')).toBeInTheDocument();
  });

  it('calls onTabChange when tab clicked', () => {
    const onTabChange = vi.fn();
    render(<AdminPage activeTab="components" onTabChange={onTabChange} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Task Types'));
    expect(onTabChange).toHaveBeenCalledWith('tasks');
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<AdminPage activeTab="components" onTabChange={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
```

**tests/unit/admin/ComponentLibrary.test.tsx:**
```tsx
describe('ComponentLibrary', () => {
  it('renders all components from registry', () => {
    render(<ComponentLibrary />);
    expect(screen.getByText('Button')).toBeInTheDocument();
    expect(screen.getByText('Input')).toBeInTheDocument();
    // ... all components
  });

  it('filters components by search query', () => {
    render(<ComponentLibrary />);
    fireEvent.change(screen.getByPlaceholderText('Search components...'), {
      target: { value: 'Button' }
    });
    expect(screen.getByText('Button')).toBeInTheDocument();
    expect(screen.queryByText('Input')).not.toBeInTheDocument();
  });

  it('filters components by category', () => {
    render(<ComponentLibrary />);
    fireEvent.click(screen.getByText('forms'));
    expect(screen.getByText('Button')).toBeInTheDocument();
    expect(screen.queryByText('Card')).not.toBeInTheDocument();
  });
});
```

**tests/unit/admin/TaskTypesShowcase.test.tsx:**
```tsx
describe('TaskTypesShowcase', () => {
  it('loads and displays task samples', async () => {
    render(<TaskTypesShowcase />);
    await waitFor(() => {
      expect(screen.getByText('Multiple Choice')).toBeInTheDocument();
    });
  });

  it('filters tasks by difficulty', async () => {
    render(<TaskTypesShowcase />);
    await waitFor(() => {
      expect(screen.getByText('Multiple Choice')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'easy' }
    });

    // Assert filtered results
  });
});
```

#### 5.2 E2E Tests
**tests/e2e/admin.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Pages', () => {
  test('opens admin panel with keyboard shortcut', async ({ page }) => {
    await page.goto('/');

    // Press Ctrl+Shift+A
    await page.keyboard.press('Control+Shift+A');

    await expect(page.getByRole('heading', { name: 'Admin Test Pages' })).toBeVisible();
  });

  test('navigates between tabs', async ({ page }) => {
    await page.goto('/#admin');

    await expect(page.getByText('Component Library')).toBeVisible();

    await page.getByRole('tab', { name: 'Task Types' }).click();

    await expect(page.getByText('Task Types Showcase')).toBeVisible();
  });

  test('searches components', async ({ page }) => {
    await page.goto('/#admin/components');

    await page.getByPlaceholderText('Search components...').fill('Button');

    await expect(page.getByText('Button')).toBeVisible();
  });

  test('interacts with task demo', async ({ page }) => {
    await page.goto('/#admin/tasks');

    await page.getByRole('button', { name: 'Try This Task' }).first().click();

    // Answer the task
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Solution')).toBeVisible();
  });

  test('closes admin panel with close button', async ({ page }) => {
    await page.goto('/#admin');

    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.getByRole('heading', { name: 'Admin Test Pages' })).not.toBeVisible();
  });
});
```

#### 5.3 Manual Browser Testing (Playwright MCP)
1. Navigate to admin panel via keyboard shortcut
2. Test all component variants in Component Library
3. Search and filter components
4. Try all task types in Task Showcase
5. Answer tasks and view solutions
6. Test responsive layout (mobile, tablet, desktop)
7. Test keyboard navigation
8. Test accessibility with screen reader

## 📝 Acceptance Criteria Mapping

| Criteria | Implementation |
|----------|----------------|
| Display all reusable UI components | ✅ ComponentLibrary with componentRegistry |
| Show different states for each component | ✅ ComponentDemo with variant selector |
| Include code examples | ✅ Code example generator with collapsible view |
| Organize by category | ✅ Category filter (forms, feedback, layout, media, navigation) |
| Interactive controls to toggle props | ✅ Prop toggles in ComponentDemo |
| Responsive design | ✅ CSS Grid with responsive columns |
| Display sample of each task type | ✅ TaskTypesShowcase with 10 task types |
| Show task in question and answer states | ✅ TaskDemo with interactive mode |
| Include metadata | ✅ Display difficulty, template, points |
| Demonstrate validation and feedback | ✅ Full task interaction with solution display |
| Provide ability to interact | ✅ "Try This Task" interactive mode |
| Show spaced repetition effects | ✅ Metadata includes SR info |
| Accessible only in admin section | ✅ Conditional rendering, keyboard shortcut |
| Route to /admin/components and /admin/tasks | ✅ Hash fragments + tab state |
| Use existing component architecture | ✅ Reuses Button, Card, Input, etc. |
| No external dependencies | ✅ Zero new dependencies |
| Load quickly (<1s) | ✅ Lazy load, client-side only |
| Work offline as part of PWA | ✅ All data from IndexedDB |

## 🔄 Code Review Integration

After implementation, run `code-reviewer` agent twice:

**Round 1:**
- Check TypeScript types
- Verify CSS Modules usage
- Check accessibility
- Performance review
- Code quality

**Round 2:**
- Verify all round 1 issues fixed
- Final quality check
- Ensure no regressions

## ⏱️ Timeline Estimate

| Phase | Duration |
|-------|----------|
| Phase 1: Admin Infrastructure | 2 hours |
| Phase 2: Component Library | 4 hours |
| Phase 3: Task Types Showcase | 4 hours |
| Phase 4: Styling (integrated) | - |
| Phase 5: Testing | 3 hours |
| Code Review + Fixes | 2 hours |
| **Total** | **~15 hours** |

## 🚀 Success Criteria

- ✅ All 17+ UI components displayed with variants
- ✅ All 10 task types displayed and interactive
- ✅ Search and filter functionality
- ✅ Responsive on mobile/tablet/desktop
- ✅ Works offline
- ✅ Keyboard navigation (Tab, Enter, ESC)
- ✅ Loads in <1s
- ✅ All unit tests pass
- ✅ All E2E tests pass
- ✅ Code reviewer satisfied (2 rounds)
- ✅ No lint warnings
- ✅ No TypeScript errors
- ✅ CI passes
