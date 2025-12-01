import { describe, it, expect } from 'vitest';
import {
  colors,
  semanticColors,
  spacing,
  typography,
  shadows,
  borderRadius,
  transitions,
  breakpoints,
  zIndex,
  components,
  getColor,
  getSpacing,
  createTransition,
} from '@ui/design-tokens';

describe('Design Tokens', () => {
  describe('Colors', () => {
    it('should have primary color palette', () => {
      expect(colors.primary[500]).toBe('#3b82f6');
      expect(colors.primary[100]).toBe('#dbeafe');
      expect(colors.primary[900]).toBe('#1e3a8a');
    });

    it('should have success color palette', () => {
      expect(colors.success[500]).toBe('#10b981');
      expect(colors.success[100]).toBe('#dcfce7');
    });

    it('should have error color palette', () => {
      expect(colors.error[500]).toBe('#ef4444');
      expect(colors.error[100]).toBe('#fee2e2');
    });

    it('should have warning color palette', () => {
      expect(colors.warning[500]).toBe('#f59e0b');
    });

    it('should have neutral color palette', () => {
      expect(colors.neutral[0]).toBe('#ffffff');
      expect(colors.neutral[900]).toBe('#111827');
      expect(colors.neutral[1000]).toBe('#000000');
    });
  });

  describe('Semantic Colors', () => {
    it('should have text colors', () => {
      expect(semanticColors.text.primary).toBe(colors.neutral[900]);
      expect(semanticColors.text.inverse).toBe(colors.neutral[0]);
    });

    it('should have background colors', () => {
      expect(semanticColors.background.primary).toBe(colors.neutral[0]);
      expect(semanticColors.background.secondary).toBe(colors.neutral[50]);
    });

    it('should have feedback colors', () => {
      expect(semanticColors.feedback.success).toBe(colors.success[500]);
      expect(semanticColors.feedback.error).toBe(colors.error[500]);
    });

    it('should have interactive colors', () => {
      expect(semanticColors.interactive.primary).toBe(colors.primary[500]);
      expect(semanticColors.interactive.primaryHover).toBe(colors.primary[600]);
    });
  });

  describe('Spacing', () => {
    it('should have correct spacing values', () => {
      expect(spacing[0]).toBe('0');
      expect(spacing[1]).toBe('0.25rem');
      expect(spacing[4]).toBe('1rem');
      expect(spacing[8]).toBe('2rem');
      expect(spacing[16]).toBe('4rem');
    });
  });

  describe('Typography', () => {
    it('should have font families', () => {
      expect(typography.fontFamily.sans).toContain('system-ui');
      expect(typography.fontFamily.mono).toContain('monospace');
    });

    it('should have font sizes', () => {
      expect(typography.fontSize.xs).toBe('0.75rem');
      expect(typography.fontSize.base).toBe('1rem');
      expect(typography.fontSize['2xl']).toBe('1.5rem');
    });

    it('should have font weights', () => {
      expect(typography.fontWeight.normal).toBe('400');
      expect(typography.fontWeight.bold).toBe('700');
    });

    it('should have line heights', () => {
      expect(typography.lineHeight.none).toBe('1');
      expect(typography.lineHeight.normal).toBe('1.5');
    });
  });

  describe('Shadows', () => {
    it('should have shadow definitions', () => {
      expect(shadows.none).toBe('none');
      expect(shadows.sm).toContain('rgba');
      expect(shadows.lg).toContain('rgba');
    });
  });

  describe('Border Radius', () => {
    it('should have border radius values', () => {
      expect(borderRadius.none).toBe('0');
      expect(borderRadius.sm).toBe('0.25rem');
      expect(borderRadius.md).toBe('0.5rem');
      expect(borderRadius.full).toBe('9999px');
    });
  });

  describe('Transitions', () => {
    it('should have duration values', () => {
      expect(transitions.duration.instant).toBe('0ms');
      expect(transitions.duration.fast).toBe('150ms');
      expect(transitions.duration.base).toBe('200ms');
    });

    it('should have timing functions', () => {
      expect(transitions.timing.linear).toBe('linear');
      expect(transitions.timing.spring).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    });

    it('should have preset transitions', () => {
      expect(transitions.presets.base).toContain('200ms');
      expect(transitions.presets.fast).toContain('150ms');
    });
  });

  describe('Breakpoints', () => {
    it('should have responsive breakpoints', () => {
      expect(breakpoints.xs).toBe('0px');
      expect(breakpoints.sm).toBe('640px');
      expect(breakpoints.md).toBe('768px');
      expect(breakpoints.lg).toBe('1024px');
      expect(breakpoints.xl).toBe('1280px');
    });
  });

  describe('Z-Index', () => {
    it('should have z-index scale', () => {
      expect(zIndex.auto).toBe('auto');
      expect(zIndex.dropdown).toBe('1000');
      expect(zIndex.modal).toBe('1040');
      expect(zIndex.tooltip).toBe('1060');
    });
  });

  describe('Component Tokens', () => {
    it('should have button tokens', () => {
      expect(components.button.height.md).toBe(spacing[10]);
      expect(components.button.padding.md).toContain(spacing[2.5]);
      expect(components.button.fontSize.md).toBe(typography.fontSize.base);
    });

    it('should have input tokens', () => {
      expect(components.input.height.md).toBe(spacing[10]);
      expect(components.input.borderWidth).toBe('2px');
    });

    it('should have card tokens', () => {
      expect(components.card.padding.md).toBe(spacing[6]);
      expect(components.card.shadow).toBe(shadows.sm);
    });
  });

  describe('Utility Functions', () => {
    describe('getColor', () => {
      it('should return correct color value', () => {
        expect(getColor('primary', 500)).toBe('#3b82f6');
        expect(getColor('success', 100)).toBe('#dcfce7');
        expect(getColor('error', 500)).toBe('#ef4444');
      });

      it('should return fallback for invalid color', () => {
        expect(getColor('invalid' as 'primary', 500)).toBe(colors.neutral[500]);
      });
    });

    describe('getSpacing', () => {
      it('should return correct spacing value', () => {
        expect(getSpacing(4)).toBe('1rem');
        expect(getSpacing(8)).toBe('2rem');
        expect(getSpacing(0)).toBe('0');
      });
    });

    describe('createTransition', () => {
      it('should create transition string with default speed', () => {
        const transition = createTransition('opacity');
        expect(transition).toBe('opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)');
      });

      it('should create transition string with custom speed', () => {
        const transition = createTransition('transform', 'fast');
        expect(transition).toBe('transform 150ms cubic-bezier(0.4, 0, 0.2, 1)');
      });

      it('should create transition string with slow speed', () => {
        const transition = createTransition('background-color', 'slow');
        expect(transition).toBe('background-color 300ms cubic-bezier(0.4, 0, 0.2, 1)');
      });
    });
  });

  describe('Type Safety', () => {
    it('should have readonly types', () => {
      // This test ensures the const assertions work
      const primaryColor: '#3b82f6' = colors.primary[500];
      const space: '1rem' = spacing[4];
      expect(primaryColor).toBe('#3b82f6');
      expect(space).toBe('1rem');
    });
  });

  describe('Consistency', () => {
    it('should use primary color consistently', () => {
      expect(semanticColors.interactive.primary).toBe(colors.primary[500]);
    });

    it('should use success color consistently', () => {
      expect(semanticColors.feedback.success).toBe(colors.success[500]);
      expect(semanticColors.feedback.successLight).toBe(colors.success[100]);
    });

    it('should use error color consistently', () => {
      expect(semanticColors.feedback.error).toBe(colors.error[500]);
      expect(semanticColors.feedback.errorLight).toBe(colors.error[100]);
    });

    it('should use warning color consistently', () => {
      expect(semanticColors.feedback.warning).toBe(colors.warning[500]);
      expect(semanticColors.feedback.warningLight).toBe(colors.warning[100]);
    });
  });
});
