import React from 'react';
import clsx from 'clsx';
import styles from './Slider.module.css';

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
  className,
  style,
  id,
  'aria-label': ariaLabel,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div style={style} className={clsx(styles['slider-container'], className)}>
      <div className={styles['slider-track']}>
        <div
          className={clsx(
            styles['slider-fill'],
            disabled && styles['slider-fill--disabled']
          )}
          style={{ width: `${percentage}%` }}
        />
        <div
          className={clsx(
            styles['slider-thumb'],
            disabled && styles['slider-thumb--disabled']
          )}
          style={{ left: `calc(${percentage}% - 12px)` }}
        />
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={styles['slider-input']}
          aria-label={ariaLabel}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={`${value}${unit}`}
        />
      </div>

      {showValue && (
        <div className={styles['slider-value-display']}>
          <span>
            {min}
            {unit}
          </span>
          <span className={styles['slider-value-display__current']}>
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
