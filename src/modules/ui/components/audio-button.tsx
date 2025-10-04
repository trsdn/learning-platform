import { useState, memo } from 'react';
import clsx from 'clsx';
import { useAudioPlayback } from '../hooks/use-audio-playback';
import { useAudioSettings } from '../hooks/use-audio-settings';
import styles from './audio-button.module.css';
import type { Task } from '@core/types/services';

interface AudioButtonProps {
  text: string;
  audioUrl?: string | null;
  className?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// SVG Icons
const VolumeIcon = ({ size }: { size: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ width: size, height: size }}
  >
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const VolumeOffIcon = ({ size }: { size: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ width: size, height: size }}
  >
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

/**
 * Audio Button Component
 * Plays pronunciation when clicked
 * Memoized to prevent unnecessary re-renders
 */
const AudioButtonComponent = ({ text, audioUrl, className, disabled = false, size = 'medium' }: AudioButtonProps) => {
  const { playbackState, loadAudio, play } = useAudioPlayback();
  const { settings } = useAudioSettings();
  const [error, setError] = useState<string | null>(null);

  // Check if audio is available
  const hasAudio = !!audioUrl;

  // Check if this button's audio is currently playing
  const isPlaying = playbackState.status === 'playing' && playbackState.audioUrl === audioUrl;

  const handleClick = async () => {
    if (disabled || !hasAudio || !audioUrl) return;

    setError(null);

    try {
      // If this audio is already loaded, just play it
      if (playbackState.audioUrl === audioUrl) {
        await play();
      } else {
        // Load and play this audio (without auto-play delay)
        const task: Task = {
          id: 'audio-button-temp',
          learningPathId: 'temp',
          templateId: 'temp',
          type: 'flashcard',
          content: {
            front: text,
            back: '',
            frontLanguage: 'es',
            backLanguage: 'de',
          },
          metadata: {
            difficulty: 'medium' as const,
            tags: [],
            estimatedTime: 0,
            points: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          hasAudio: true,
          audioUrl: audioUrl,
        };
        await loadAudio(task, settings, false); // false = no auto-play delay
        await play();
      }
    } catch (err) {
      console.error('Failed to play audio:', err);
      setError('Audio playback failed');
    }
  };

  const iconSizes = {
    small: '16px',
    medium: '20px',
    large: '24px'
  };

  // Determine button state
  const isDisabled = disabled || !hasAudio;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={clsx(
        styles['audio-button'],
        styles[`audio-button--${size}`],
        isDisabled && styles['audio-button--disabled'],
        isPlaying && styles['audio-button--playing'],
        !isDisabled && !isPlaying && styles['audio-button--active'],
        className
      )}
      title={
        !hasAudio
          ? 'Audio nicht verfügbar'
          : isPlaying
            ? 'Spielt ab...'
            : `Aussprache abspielen: ${text}`
      }
      aria-label={`Spanische Aussprache für ${text} abspielen`}
      type="button"
    >
      {isPlaying ? (
        <div className={clsx(styles['audio-button__icon'], styles['audio-button__icon--playing'])}>
          <VolumeIcon size={iconSizes[size]} />
        </div>
      ) : !hasAudio || error ? (
        <div className={styles['audio-button__icon']}>
          <VolumeOffIcon size={iconSizes[size]} />
        </div>
      ) : (
        <div className={styles['audio-button__icon']}>
          <VolumeIcon size={iconSizes[size]} />
        </div>
      )}
    </button>
  );
};

// Export memoized version
export const AudioButton = memo(AudioButtonComponent);

interface AudioButtonInlineProps {
  text: string;
  className?: string;
}

/**
 * Inline Audio Button with Text
 * Shows the Spanish text with a small audio button next to it
 */
export function AudioButtonInline({ text, className }: AudioButtonInlineProps) {
  return (
    <span className={clsx(styles['audio-button-inline'], className)}>
      <span>{text}</span>
      <AudioButton text={text} size="small" />
    </span>
  );
}
