import { useState } from 'react';
import { audioService } from '@core/services/audio-service';

interface AudioButtonProps {
  text: string;
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
    small: 'w-7 h-7',
    medium: 'w-9 h-9',
    large: 'w-11 h-11'
  };

  const iconSizes = {
    small: '16px',
    medium: '20px',
    large: '24px'
  };

  // Determine button state
  const isDisabled = disabled || !hasAudio;
  const buttonClasses = `
    ${sizeClasses[size]}
    inline-flex items-center justify-center
    rounded-lg
    transition-all duration-200
    shadow-sm hover:shadow-md
    ${isDisabled
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
      : isPlaying
        ? 'bg-blue-600 text-white scale-95'
        : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 active:scale-95 cursor-pointer'
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
          ? 'Audio nicht verfügbar'
          : isPlaying
            ? 'Spielt ab...'
            : `Aussprache abspielen: ${text}`
      }
      aria-label={`Spanische Aussprache für ${text} abspielen`}
      type="button"
    >
      {isPlaying ? (
        <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          <VolumeIcon size={iconSizes[size]} />
        </div>
      ) : !hasAudio || error ? (
        <VolumeOffIcon size={iconSizes[size]} />
      ) : (
        <VolumeIcon size={iconSizes[size]} />
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
