import React from 'react';
import {
  semanticColors,
  spacing,
  typography,
  borderRadius,
  colors,
} from '@ui/design-tokens';

export interface SliderProps {
  /**
   * Current slider value
   */
  value: number;

  /**
   * Change handler
   */
  onChange: (value: number) => void;

  /**
   * Minimum value
   */
  min: number;

  /**
   * Maximum value
   */
  max: number;

  /**
   * Step increment
   * @default 1
   */
  step?: number;

  /**
   * Whether the slider is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Unit to display with value (e.g., "°C", "%")
   */
  unit?: string;

  /**
   * Whether to show the current value
   * @default true
   */
  showValue?: boolean;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Custom styles
   */
  style?: React.CSSProperties;

  /**
   * ID for the slider element
   */
  id?: string;

  /**
   * Aria label for accessibility
   */
  'aria-label'?: string;
}

/**
 * Slider Component
 *
 * A reusable range slider component with value display and unit support.
 * Used in slider tasks for numeric input.
 *
 * @example
 * ```tsx
 * <Slider
 *   value={temperature}
 *   onChange={setTemperature}
 *   min={0}
 *   max={100}
 *   unit="°C"
 *   showValue
 * />
 * ```
 */
export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  unit = '',
  showValue = true,
  className = '',
  style = {},
  id,
  'aria-label': ariaLabel,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    width: '100%',
    ...style,
  };

  const sliderTrackStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '8px',
    backgroundColor: semanticColors.background.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'visible',
  };

  const sliderFillStyles: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: disabled ? semanticColors.border.dark : colors.primary[500],
    borderRadius: borderRadius.full,
    transition: 'width 0.1s ease',
  };

  const sliderInputStyles: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    margin: 0,
    zIndex: 2,
  };

  const thumbStyles: React.CSSProperties = {
    position: 'absolute',
    left: `calc(${percentage}% - 12px)`,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    backgroundColor: disabled ? semanticColors.border.dark : colors.primary[600],
    borderRadius: borderRadius.full,
    border: `3px solid ${semanticColors.background.primary}`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    pointerEvents: 'none',
    transition: 'left 0.1s ease',
    zIndex: 1,
  };

  const valueDisplayStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: typography.fontSize.sm,
    color: semanticColors.text.secondary,
  };

  return (
    <div style={containerStyles} className={className}>
      <div style={sliderTrackStyles}>
        <div style={sliderFillStyles} />
        <div style={thumbStyles} />
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          style={sliderInputStyles}
          aria-label={ariaLabel}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={`${value}${unit}`}
        />
      </div>

      {showValue && (
        <div style={valueDisplayStyles}>
          <span>
            {min}
            {unit}
          </span>
          <span
            style={{
              fontWeight: typography.fontWeight.semibold,
              color: semanticColors.text.primary,
              fontSize: typography.fontSize.base,
            }}
          >
            {value}
            {unit}
          </span>
          <span>
            {max}
            {unit}
          </span>
        </div>
      )}
    </div>
  );
}

export default Slider;
