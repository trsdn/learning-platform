/**
 * Design System Tokens
 *
 * Centralized design tokens for the learning platform.
 * These tokens ensure consistency across all UI components.
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary colors (Blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Success colors (Green)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#10b981', // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Error colors (Red)
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Warning colors (Amber/Orange)
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Info colors (Purple)
  info: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#8b5cf6', // Main info
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Neutral/Gray colors
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    1000: '#000000',
  },
} as const;

// Semantic color aliases for easier usage
export const semanticColors = {
  // Text colors
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
    disabled: colors.neutral[400],
    inverse: colors.neutral[0],
  },

  // Background colors
  background: {
    primary: colors.neutral[0],
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
    inverse: colors.neutral[900],
  },

  // Border colors
  border: {
    light: colors.neutral[200],
    base: colors.neutral[300],
    dark: colors.neutral[400],
  },

  // Interactive states
  interactive: {
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    primaryActive: colors.primary[700],
    primaryDisabled: colors.neutral[400],
  },

  // Feedback colors
  feedback: {
    success: colors.success[500],
    successLight: colors.success[100],
    successBorder: colors.success[300],
    error: colors.error[500],
    errorLight: colors.error[100],
    errorBorder: colors.error[300],
    warning: colors.warning[500],
    warningLight: colors.warning[100],
    warningBorder: colors.warning[400],
    info: colors.info[500],
    infoLight: colors.info[100],
    infoBorder: colors.info[300],
  },
} as const;

// ============================================================================
// SPACING SCALE
// ============================================================================

export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },

  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  xs: '0.125rem',   // 2px
  sm: '0.25rem',    // 4px
  base: '0.375rem', // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  full: '9999px',
} as const;

// ============================================================================
// TRANSITIONS & ANIMATIONS
// ============================================================================

export const transitions = {
  // Durations
  duration: {
    instant: '0ms',
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Timing functions
  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Common transition presets
  presets: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms cubic-bezier(0.4, 0, 0.2, 1), color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// BREAKPOINTS (for responsive design)
// ============================================================================

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
} as const;

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  button: {
    // Heights
    height: {
      sm: spacing[8],
      md: spacing[10],
      lg: spacing[12],
    },
    // Padding
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,
      md: `${spacing[2.5]} ${spacing[4]}`,
      lg: `${spacing[3]} ${spacing[6]}`,
    },
    // Font sizes
    fontSize: {
      sm: typography.fontSize.sm,
      md: typography.fontSize.base,
      lg: typography.fontSize.lg,
    },
    // Border radius
    borderRadius: borderRadius.md,
  },

  input: {
    // Heights
    height: {
      sm: spacing[8],
      md: spacing[10],
      lg: spacing[12],
    },
    // Padding
    padding: {
      sm: `${spacing[1.5]} ${spacing[3]}`,
      md: `${spacing[2]} ${spacing[3.5]}`,
      lg: `${spacing[2.5]} ${spacing[4]}`,
    },
    // Border
    borderWidth: '2px',
    borderRadius: borderRadius.md,
  },

  card: {
    // Padding
    padding: {
      sm: spacing[4],
      md: spacing[6],
      lg: spacing[8],
    },
    // Border radius
    borderRadius: borderRadius.lg,
    // Shadows
    shadow: shadows.sm,
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a color value from the palette
 * @example getColor('primary', 500) // returns '#3b82f6'
 */
export function getColor(colorName: keyof typeof colors, shade: keyof typeof colors.primary): string {
  const colorGroup = colors[colorName];
  if (!colorGroup || typeof colorGroup === 'string') {
    return colors.neutral[500];
  }
  return (colorGroup as any)[shade] || colors.neutral[500];
}

/**
 * Get a spacing value
 * @example getSpacing(4) // returns '1rem'
 */
export function getSpacing(size: keyof typeof spacing): string {
  return spacing[size];
}

/**
 * Create a transition string
 * @example createTransition('opacity', 'base') // returns 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)'
 */
export function createTransition(
  property: string,
  speed: keyof typeof transitions.duration = 'base'
): string {
  return `${property} ${transitions.duration[speed]} ${transitions.timing.spring}`;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ColorName = keyof typeof colors;
export type ColorShade = keyof typeof colors.primary;
export type SpacingSize = keyof typeof spacing;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type Shadow = keyof typeof shadows;
export type BorderRadius = keyof typeof borderRadius;
export type Breakpoint = keyof typeof breakpoints;
export type ZIndex = keyof typeof zIndex;
