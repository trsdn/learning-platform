import React from 'react';
/**
 * Flashcard Task Component
 *
 * Displays a flashcard with front/back sides and self-assessment.
 */

import type { Task, FlashcardContent } from '@core/types/services';
import type { AudioConfig } from '@storage/template-loader';
import { AudioButton } from '../../../audio-button';
import { useFlashcard } from './use-flashcard';
import styles from '../../../practice-session.module.css';

interface FlashcardTaskProps {
  task: Task;
  showFeedback: boolean;
  isCorrect: boolean;
  audioConfig: AudioConfig | null;
  onAnswerChange?: (canSubmit: boolean) => void;
  onAutoAdvance?: () => void;
}

export function FlashcardTask({
  task,
  showFeedback,
  isCorrect: _isCorrect,
  audioConfig,
  onAnswerChange,
  onAutoAdvance,
}: FlashcardTaskProps) {
  const { revealed, known: _known, setRevealed, setKnown, canSubmit } = useFlashcard(
    task,
    showFeedback
  );

  // Notify parent when answer state changes
  React.useEffect(() => {
    onAnswerChange?.(canSubmit());
  }, [canSubmit, onAnswerChange]);

  if (task.type !== 'flashcard') return null;

  const content = task.content as FlashcardContent;

  const handleReveal = async () => {
    setRevealed(true);

    // Auto-play audio when revealing (if configured)
    if (audioConfig?.autoPlay?.onReveal) {
      const fieldsToPlay = audioConfig.autoPlay.onReveal;
      for (const field of fieldsToPlay) {
        const audioFile = (content as any)[field];
        if (audioFile) {
          try {
            const audio = new Audio(
              `${import.meta.env.BASE_URL}audio/${audioFile}`
            );
            await audio.play();
            break; // Only play first available audio
          } catch (err) {
            console.warn(`Failed to auto-play ${field} on reveal:`, err);
          }
        }
      }
    }
  };

  const handleKnownResponse = (knownValue: boolean) => {
    setKnown(knownValue);
    // Auto-advance after brief delay
    if (onAutoAdvance) {
      setTimeout(() => {
        onAutoAdvance();
      }, 300);
    }
  };

  const getLanguageLabel = (lang: string): string => {
    switch (lang) {
      case 'de':
        return 'Deutsch';
      case 'es':
        return 'Español';
      case 'en':
        return 'English';
      default:
        return lang;
    }
  };

  return (
    <div className={styles['practice-session__flashcard-container']}>
      <div className={styles['practice-session__flashcard']}>
        {/* Language indicator for front */}
        <div className={styles['practice-session__flashcard-lang']}>
          {getLanguageLabel(content.frontLanguage)}
        </div>

        {/* Front side */}
        <div className={styles['practice-session__flashcard-front']}>
          <div>{content.front}</div>
          {audioConfig?.buttons?.front?.show &&
            (content as any)[audioConfig.buttons.front.field] && (
              <AudioButton
                text={content.front}
                audioUrl={`${import.meta.env.BASE_URL}audio/${(content as any)[audioConfig.buttons.front.field]}`}
                size="large"
              />
            )}
        </div>

        {/* Back side or reveal button */}
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={showFeedback}
            className={styles['practice-session__flashcard-reveal-btn']}
          >
            Ergebnis anzeigen
          </button>
        ) : (
          <>
            <div className={styles['practice-session__flashcard-divider']} />

            {/* Language indicator for back */}
            <div className={styles['practice-session__flashcard-lang']}>
              {getLanguageLabel(content.backLanguage)}
            </div>

            {/* Answer */}
            <div className={styles['practice-session__flashcard-back']}>
              <div>{content.back}</div>
              {audioConfig?.buttons?.back?.show &&
                (content as any)[audioConfig.buttons.back.field] && (
                  <AudioButton
                    text={content.back}
                    audioUrl={`${import.meta.env.BASE_URL}audio/${(content as any)[audioConfig.buttons.back.field]}`}
                    size="large"
                  />
                )}
            </div>
          </>
        )}
      </div>

      {/* Self-assessment buttons - only shown after reveal */}
      {revealed && !showFeedback && (
        <div className={styles['practice-session__flashcard-assessment']}>
          <button
            onClick={() => handleKnownResponse(false)}
            className={`${styles['practice-session__flashcard-btn']} ${styles['practice-session__flashcard-btn--unknown']}`}
          >
            <span className={styles['practice-session__flashcard-icon']}>
              ✗
            </span>
            <span>Nicht gewusst</span>
          </button>

          <button
            onClick={() => handleKnownResponse(true)}
            className={`${styles['practice-session__flashcard-btn']} ${styles['practice-session__flashcard-btn--known']}`}
          >
            <span className={styles['practice-session__flashcard-icon']}>
              ✓
            </span>
            <span>Gewusst</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Re-export hook for convenience
export { useFlashcard } from './use-flashcard';
