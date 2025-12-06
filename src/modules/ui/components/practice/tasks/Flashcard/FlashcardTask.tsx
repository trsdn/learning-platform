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
  onSubmitAnswer?: (correct: boolean) => Promise<void>;
}

export function FlashcardTask({
  task,
  showFeedback,
  isCorrect: _isCorrect,
  audioConfig,
  onAnswerChange,
  onAutoAdvance,
  onSubmitAnswer,
}: FlashcardTaskProps) {
  const { revealed, known: _known, setRevealed, setKnown, canSubmit } = useFlashcard(
    task,
    showFeedback
  );

  // Notify parent when answer state changes
  React.useEffect(() => {
    onAnswerChange?.(canSubmit());
  }, [canSubmit, onAnswerChange]);

  // Auto-play audio on load (only for foreign→German direction)
  // When front is foreign language and back is German, play front audio on load
  // Otherwise, audio plays on reveal (German→foreign cards)
  React.useEffect(() => {
    if (task.type !== 'flashcard') return;

    const content = task.content as FlashcardContent;

    // Only auto-play on load for foreign→German cards
    const isForeignToGerman = content.frontLanguage !== 'de' && content.backLanguage === 'de';

    const playOnLoadAudio = async () => {
      if (audioConfig?.autoPlay?.onLoad && !revealed && isForeignToGerman) {
        const fieldsToPlay = audioConfig.autoPlay.onLoad;
        for (const field of fieldsToPlay) {
          const audioFile = (content as unknown as Record<string, unknown>)[
            field
          ];
          if (audioFile) {
            try {
              const audio = new Audio(
                `${import.meta.env.BASE_URL}audio/${audioFile}`
              );
              await audio.play();
              break; // Only play first available audio
            } catch (err) {
              console.warn(`Failed to auto-play ${field} on load:`, err);
            }
          }
        }
      }
    };
    playOnLoadAudio();
  }, [task.id, task.type, task.content, audioConfig, revealed]);

  if (task.type !== 'flashcard') return null;

  const content = task.content as FlashcardContent;

  const handleReveal = async () => {
    setRevealed(true);

    // Auto-play audio when revealing (if configured)
    if (audioConfig?.autoPlay?.onReveal) {
      const fieldsToPlay = audioConfig.autoPlay.onReveal;
      for (const field of fieldsToPlay) {
        const audioFile = (content as unknown as Record<string, unknown>)[field];
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

  const handleKnownResponse = async (knownValue: boolean) => {
    setKnown(knownValue);

    // Submit the answer to record stats (known = correct)
    if (onSubmitAnswer) {
      await onSubmitAnswer(knownValue);
    }

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
          {audioConfig?.buttons?.front?.show && (() => {
            const audioFile = (content as unknown as Record<string, unknown>)[audioConfig.buttons.front.field];
            return audioFile ? (
              <AudioButton
                text={content.front}
                audioUrl={`${import.meta.env.BASE_URL}audio/${String(audioFile)}`}
                size="large"
              />
            ) : null;
          })()}
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
              {audioConfig?.buttons?.back?.show && (() => {
                const audioFile = (content as unknown as Record<string, unknown>)[audioConfig.buttons.back.field];
                return audioFile ? (
                  <AudioButton
                    text={content.back}
                    audioUrl={`${import.meta.env.BASE_URL}audio/${String(audioFile)}`}
                    size="large"
                  />
                ) : null;
              })()}
            </div>
          </>
        )}
      </div>

      {/* Self-assessment buttons - only shown after reveal and before answering */}
      {revealed && !showFeedback && _known === null && (
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
// eslint-disable-next-line react-refresh/only-export-components
export { useFlashcard } from './use-flashcard';
