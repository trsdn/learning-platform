import { useState } from 'react';
import { audioService } from '@core/services/audio-service';

interface AudioButtonProps {
  text: string;
  className?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Audio Button Component
 * Plays Spanish pronunciation when clicked
 */
export function AudioButton({ text, className = '', disabled = false, size = 'medium' }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if audio is available for this text
  const hasAudio = audioService.hasAudio(text);

  const handleClick = async () => {
    if (isPlaying || disabled || !hasAudio) return;

    setIsPlaying(true);
    setError(null);

    try {
      await audioService.playSpanish(text);
    } catch (err) {
      console.error('Failed to play audio:', err);
      setError('Audio playback failed');
    } finally {
      setIsPlaying(false);
    }
  };

  // Size styles
  const sizeClasses = {
    small: 'w-6 h-6 text-sm',
    medium: 'w-8 h-8 text-base',
    large: 'w-10 h-10 text-lg'
  };

  // Determine button state
  const isDisabled = disabled || !hasAudio;
  const buttonClasses = `
    ${sizeClasses[size]}
    inline-flex items-center justify-center
    rounded-full
    transition-all duration-200
    ${isDisabled
      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
      : isPlaying
        ? 'bg-blue-600 text-white animate-pulse'
        : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 cursor-pointer'
    }
    ${className}
  `;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={buttonClasses}
      title={
        !hasAudio
          ? 'Audio not available'
          : isPlaying
            ? 'Playing...'
            : `Play pronunciation: ${text}`
      }
      aria-label={`Play Spanish pronunciation for ${text}`}
      type="button"
    >
      {isPlaying ? (
        // Playing icon (animated speaker)
        <span className="animate-pulse">🔊</span>
      ) : !hasAudio ? (
        // No audio icon
        <span>🔇</span>
      ) : error ? (
        // Error icon
        <span>⚠️</span>
      ) : (
        // Default speaker icon
        <span>🔊</span>
      )}
    </button>
  );
}

interface AudioButtonInlineProps {
  text: string;
  className?: string;
}

/**
 * Inline Audio Button with Text
 * Shows the Spanish text with a small audio button next to it
 */
export function AudioButtonInline({ text, className = '' }: AudioButtonInlineProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span>{text}</span>
      <AudioButton text={text} size="small" />
    </span>
  );
}
