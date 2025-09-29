/**
 * UI Component Interfaces for Learning Platform
 * These contracts define the presentation layer boundaries
 */

import type { ReactNode } from 'react';
import type {
  Topic,
  LearningPath,
  Task,
  UserProgress,
  PracticeSession,
  ProgressSummary,
  WeeklyStats
} from '@core/types/services';

// Base Component Props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}

// Layout Components
export interface AppLayoutProps extends BaseComponentProps {
  navigation: NavigationItem[];
  currentPath: string;
  user?: UserProfile;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: number;
  disabled?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  defaultSessionLength: number;
}

// Topic Components
export interface TopicListProps extends BaseComponentProps {
  topics: Topic[];
  progress: Record<string, UserProgress>;
  onTopicSelect: (topic: Topic) => void;
  isLoading?: boolean;
  error?: string;
}

export interface TopicCardProps extends BaseComponentProps {
  topic: Topic;
  progress?: UserProgress;
  onClick: () => void;
  variant?: 'default' | 'compact' | 'detailed';
}

export interface TopicProgressProps extends BaseComponentProps {
  progress: UserProgress;
  showDetails?: boolean;
  animated?: boolean;
}

// Learning Path Components
export interface LearningPathListProps extends BaseComponentProps {
  paths: LearningPath[];
  progress: Record<string, UserProgress>;
  onPathSelect: (path: LearningPath) => void;
  isLoading?: boolean;
  error?: string;
}

export interface LearningPathCardProps extends BaseComponentProps {
  path: LearningPath;
  progress?: UserProgress;
  onClick: () => void;
  showDifficulty?: boolean;
  showEstimatedTime?: boolean;
}

// Practice Session Components
export interface PracticeSessionSetupProps extends BaseComponentProps {
  topic: Topic;
  learningPaths: LearningPath[];
  defaultConfig: SessionConfiguration;
  onStartSession: (config: SessionConfiguration) => void;
  onCancel: () => void;
}

export interface SessionConfiguration {
  topicId: string;
  learningPathIds: string[];
  targetCount: number;
  includeReview: boolean;
  difficultyFilter?: 'easy' | 'medium' | 'hard';
}

export interface PracticeSessionProps extends BaseComponentProps {
  session: PracticeSession;
  currentTask: Task | null;
  onAnswer: (answer: string | string[]) => void;
  onHint: () => void;
  onSkip: () => void;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  isLoading?: boolean;
}

export interface TaskDisplayProps extends BaseComponentProps {
  task: Task;
  onAnswer: (answer: string | string[]) => void;
  onHint?: () => void;
  showFeedback?: boolean;
  feedback?: TaskFeedback;
  disabled?: boolean;
}

export interface TaskFeedback {
  isCorrect: boolean;
  explanation?: string;
  correctAnswer?: string;
  timeSpent: number;
}

// Task Type Components
export interface MultipleChoiceTaskProps extends BaseComponentProps {
  question: string;
  options: string[];
  selectedAnswer?: number;
  correctAnswer?: number;
  onSelect: (index: number) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  hint?: string;
  explanation?: string;
}

// Dashboard Components
export interface DashboardProps extends BaseComponentProps {
  summary: ProgressSummary;
  weeklyStats: WeeklyStats[];
  recentSessions: PracticeSession[];
  upcomingReviews: ReviewScheduleItem[];
  onStartQuickSession: () => void;
  onViewTopic: (topicId: string) => void;
}

export interface ReviewScheduleItem {
  date: Date;
  taskCount: number;
  estimatedTime: number;
  topics: string[];
}

export interface ProgressSummaryCardProps extends BaseComponentProps {
  summary: ProgressSummary;
  variant?: 'default' | 'compact';
  showActions?: boolean;
  onAction?: (action: string) => void;
}

export interface StatisticsChartProps extends BaseComponentProps {
  data: WeeklyStats[];
  metric: 'accuracy' | 'timeSpent' | 'tasksCompleted';
  timeRange: 'week' | 'month' | 'quarter';
  height?: number;
  animated?: boolean;
}

export interface StreakDisplayProps extends BaseComponentProps {
  currentStreak: number;
  longestStreak: number;
  showAnimation?: boolean;
}

// Session Review Components
export interface SessionReviewProps extends BaseComponentProps {
  session: PracticeSession;
  answers: AnswerReview[];
  onReviewTask: (taskId: string) => void;
  onStartNewSession: () => void;
  onReturnToDashboard: () => void;
}

export interface AnswerReview {
  taskId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  feedback?: string;
}

export interface SessionStatsProps extends BaseComponentProps {
  session: PracticeSession;
  showComparison?: boolean;
  previousSession?: PracticeSession;
}

// Common UI Components
export interface ProgressBarProps extends BaseComponentProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
}

export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  variant?: 'default' | 'overlay';
}

export interface ErrorMessageProps extends BaseComponentProps {
  message: string;
  retry?: () => void;
  dismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: string;
}

export interface InputFieldProps extends BaseComponentProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  type?: 'text' | 'number' | 'email' | 'password';
}

export interface SelectFieldProps extends BaseComponentProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  searchable?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

// Search and Filter Components
export interface SearchBarProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  isLoading?: boolean;
}

export interface FilterPanelProps extends BaseComponentProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
  onReset: () => void;
  onApply?: () => void;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'toggle';
  options?: SelectOption[];
  min?: number;
  max?: number;
  defaultValue?: any;
}

// Accessibility and Responsive Design
export interface AccessibilityProps {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
}

export interface ResponsiveProps {
  hideOn?: ('mobile' | 'tablet' | 'desktop')[];
  showOn?: ('mobile' | 'tablet' | 'desktop')[];
  mobileOrder?: number;
}

// Theme and Styling
export interface ThemeProps {
  theme?: 'light' | 'dark';
  colorScheme?: 'default' | 'colorful' | 'monochrome';
  spacing?: 'compact' | 'comfortable' | 'spacious';
  fontScale?: 'small' | 'medium' | 'large';
}

// Animation and Interaction
export interface AnimationProps {
  animated?: boolean;
  animationDuration?: number;
  animationDelay?: number;
  animationType?: 'fade' | 'slide' | 'scale' | 'bounce';
}

export interface InteractionProps {
  onClick?: () => void;
  onDoubleClick?: () => void;
  onHover?: (isHovered: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
}

// Component State Management
export interface ComponentState {
  isLoading: boolean;
  error: string | null;
  data: any;
  lastUpdated: Date;
}

export interface StateProps {
  state: ComponentState;
  onRetry?: () => void;
  onRefresh?: () => void;
}

// Component Events
export interface ComponentEvents {
  onMount?: () => void;
  onUnmount?: () => void;
  onUpdate?: (prevProps: any) => void;
  onError?: (error: Error) => void;
}

// HOC and Hook Interfaces
export interface WithLoadingProps {
  isLoading: boolean;
  loadingComponent?: ReactNode;
}

export interface WithErrorProps {
  error: Error | null;
  errorComponent?: ReactNode;
  onRetry?: () => void;
}

export interface WithPermissionsProps {
  permissions: string[];
  fallbackComponent?: ReactNode;
}

// Component Composition
export interface CompositeComponentProps extends BaseComponentProps {
  components: ComponentConfig[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  spacing?: number;
  responsive?: boolean;
}

export interface ComponentConfig {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentConfig[];
  conditions?: ComponentCondition[];
}

export interface ComponentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}