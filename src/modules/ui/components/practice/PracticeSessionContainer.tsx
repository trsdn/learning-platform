/**
 * PracticeSessionContainer Component
 *
 * Main container that orchestrates the practice session using all extracted components.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAudioConfig, type AudioConfig } from '@storage/template-loader';
import { useAudioPlayback } from '../../hooks/use-audio-playback';
import { useAudioSettings } from '../../hooks/use-audio-settings';
import { useVibration } from '../../hooks/use-vibration';
import { useWakeLock } from '../../hooks/use-wake-lock';
import { isEligibleForAutoPlay } from '@core/utils/audio-helpers';
import { AudioButton } from '../audio-button';
import { useSessionManagement } from './session';
import { SessionHeader } from './session/SessionHeader';
import { NavigationControls } from './session/NavigationControls';
import { FeedbackDisplay } from './session/FeedbackDisplay';
import { SessionStats } from './session/SessionStats';
import { TaskRenderer } from './TaskRenderer';
import {
  useMultipleChoice,
  useTrueFalse,
  useTextInput,
  useSlider,
  useMultipleSelect,
  useWordScramble,
  useFlashcard,
  useClozeDeletion,
  useOrdering,
  useMatching,
} from './tasks';
import styles from '../practice-session.module.css';

interface PracticeSessionContainerProps {
  /** The session ID to load */
  sessionId: string;
  /** Callback when session is completed */
  onComplete: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
}

/**
 * Main practice session container
 */
export function PracticeSessionContainer({
  sessionId,
  onComplete,
  onCancel,
}: PracticeSessionContainerProps) {
  // Session management
  const {
    session,
    currentTask,
    currentTaskIndex,
    isLoading,
    showFeedback,
    isCorrect,
    progress,
    submitAnswer,
    nextTask,
    completeSession,
  } = useSessionManagement({
    sessionId,
    onComplete,
  });

  // Audio state
  const [audioConfig, setAudioConfig] = useState<AudioConfig | null>(null);
  const { playbackState, loadAudio, replay, unlockAutoPlay } = useAudioPlayback();
  const { settings: audioSettings } = useAudioSettings();

  // Haptic feedback
  const { vibrateCorrect, vibrateIncorrect, vibrateSessionComplete } = useVibration();

  // Screen wake lock (keep screen on during session)
  const { acquire: acquireWakeLock, release: releaseWakeLock } = useWakeLock();

  // Acquire wake lock when component mounts, release when it unmounts
  // Using refs to avoid unnecessary effect re-runs when callbacks change
  const acquireRef = useRef(acquireWakeLock);
  const releaseRef = useRef(releaseWakeLock);
  acquireRef.current = acquireWakeLock;
  releaseRef.current = releaseWakeLock;

  useEffect(() => {
    acquireRef.current();
    return () => {
      releaseRef.current();
    };
  }, []);

  // UI state
  const [hintVisible, setHintVisible] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [canSubmitAnswer, setCanSubmitAnswer] = useState(false);

  // Task-specific hooks
  const multipleChoiceHook = useMultipleChoice(currentTask, showFeedback);
  const trueFalseHook = useTrueFalse(currentTask, showFeedback);
  const textInputHook = useTextInput(currentTask, showFeedback);
  const sliderHook = useSlider(currentTask, showFeedback);
  const multipleSelectHook = useMultipleSelect(currentTask, showFeedback);
  const wordScrambleHook = useWordScramble(currentTask, showFeedback);
  const flashcardHook = useFlashcard(currentTask, showFeedback);
  const clozeDeletionHook = useClozeDeletion(currentTask, showFeedback);
  const orderingHook = useOrdering(currentTask, showFeedback);
  const matchingHook = useMatching(currentTask, showFeedback);

  // Load audio configuration when current task changes
  useEffect(() => {
    if (!currentTask) {
      setAudioConfig(null);
      return;
    }

    getAudioConfig(currentTask.templateId).then((config) => {
      setAudioConfig(config);
    });

    // Load audio for the task
    loadAudio(currentTask, audioSettings, false).catch((error) => {
      console.warn('Failed to load audio:', error);
    });
  }, [currentTask, audioSettings, loadAudio]);

  // Get current task hook based on type
  const getCurrentTaskHook = useCallback(() => {
    if (!currentTask) return null;

    switch (currentTask.type) {
      case 'multiple-choice':
        return multipleChoiceHook;
      case 'true-false':
        return trueFalseHook;
      case 'text-input':
        return textInputHook;
      case 'slider':
        return sliderHook;
      case 'multiple-select':
        return multipleSelectHook;
      case 'word-scramble':
        return wordScrambleHook;
      case 'flashcard':
        return flashcardHook;
      case 'cloze-deletion':
        return clozeDeletionHook;
      case 'ordering':
        return orderingHook;
      case 'matching':
        return matchingHook;
      default:
        return null;
    }
  }, [
    currentTask,
    multipleChoiceHook,
    trueFalseHook,
    textInputHook,
    sliderHook,
    multipleSelectHook,
    wordScrambleHook,
    flashcardHook,
    clozeDeletionHook,
    orderingHook,
    matchingHook,
  ]);

  // Handle answer submission
  const handleSubmit = useCallback(async () => {
    if (!currentTask || showFeedback) return;

    const taskHook = getCurrentTaskHook();
    if (!taskHook) return;

    // Unlock auto-play on first user interaction
    if (!playbackState.autoPlayUnlocked) {
      unlockAutoPlay().catch((err) =>
        console.warn('Failed to unlock auto-play:', err)
      );
    }

    const correct = taskHook.checkAnswer();
    await submitAnswer(correct);

    // Haptic feedback (non-blocking, service handles errors internally)
    if (correct) {
      vibrateCorrect();
    } else {
      vibrateIncorrect();
    }
  }, [
    currentTask,
    showFeedback,
    getCurrentTaskHook,
    submitAnswer,
    playbackState.autoPlayUnlocked,
    unlockAutoPlay,
    vibrateCorrect,
    vibrateIncorrect,
  ]);

  // Handle task skip
  const handleSkip = useCallback(() => {
    nextTask();
  }, [nextTask]);

  // Handle next task
  const handleNext = useCallback(() => {
    nextTask();
  }, [nextTask]);

  // Handle session completion with haptic feedback
  const handleCompleteSession = useCallback(() => {
    // Haptic feedback (non-blocking, service handles errors internally)
    vibrateSessionComplete();
    completeSession();
  }, [completeSession, vibrateSessionComplete]);

  // Repeat question audio
  const repeatQuestionAudio = useCallback(() => {
    if (!currentTask) return;
    const content = currentTask.content as unknown as Record<string, unknown>;
    const questionField = audioConfig?.buttons?.question?.field;
    const hasAudio = Boolean(
      currentTask.audioUrl || (questionField && content?.[questionField])
    );
    if (!hasAudio) return;
    try {
      unlockAutoPlay();
      replay();
    } catch (error) {
      console.warn('Audio replay failed', error);
    }
    loadAudio(currentTask, audioSettings, true).catch((error) => {
      console.warn('Audio reload failed', error);
    });
  }, [
    currentTask,
    audioSettings,
    loadAudio,
    replay,
    unlockAutoPlay,
    audioConfig,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!currentTask) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const tagName = active?.tagName?.toLowerCase();
      const isTyping = Boolean(
        active &&
          (tagName === 'input' ||
            tagName === 'textarea' ||
            active.isContentEditable)
      );
      const key = event.key;

      // Toggle shortcut help
      if (
        (key === '?' || (key === '/' && event.shiftKey)) &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        event.preventDefault();
        setShowShortcutHelp((prev) => !prev);
        return;
      }

      // Close shortcut help
      if (showShortcutHelp) {
        if (
          key === 'Escape' ||
          key === '?' ||
          (key === '/' && event.shiftKey)
        ) {
          event.preventDefault();
          setShowShortcutHelp(false);
        }
        return;
      }

      // Handle Escape
      if (key === 'Escape') {
        event.preventDefault();
        if (hintVisible) {
          setHintVisible(false);
        } else {
          onCancel();
        }
        return;
      }

      // Handle Enter - submit/next
      if (key === 'Enter' && !isTyping) {
        event.preventDefault();
        if (!showFeedback && canSubmitAnswer) {
          handleSubmit();
        } else if (showFeedback && currentTask?.type !== 'flashcard') {
          handleNext();
        }
        return;
      }

      // Handle 'r' - repeat audio
      if ((key === 'r' || key === 'R') && !isTyping) {
        event.preventDefault();
        repeatQuestionAudio();
        return;
      }

      // Handle 'h' - toggle hint
      if ((key === 'h' || key === 'H') && !isTyping) {
        event.preventDefault();
        const hint = (currentTask.content as unknown as Record<string, unknown>)?.hint;
        if (hint) {
          setHintVisible((prev) => !prev);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentTask,
    showFeedback,
    canSubmitAnswer,
    hintVisible,
    showShortcutHelp,
    handleSubmit,
    handleNext,
    repeatQuestionAudio,
    onCancel,
  ]);

  // Auto-play audio when feedback is shown
  useEffect(() => {
    if (
      showFeedback &&
      currentTask &&
      isEligibleForAutoPlay(currentTask, audioSettings)
    ) {
      loadAudio(currentTask, audioSettings, true).catch((error) => {
        console.warn('Auto-play in feedback failed:', error);
      });
    }
  }, [showFeedback, currentTask, audioSettings, loadAudio]);

  // Reset canSubmitAnswer when task changes (but not on showFeedback change)
  // The actual canSubmitAnswer state is managed by task components via onAnswerChange
  useEffect(() => {
    setCanSubmitAnswer(false);
  }, [currentTask]);

  if (isLoading || !session || !currentTask) {
    return <div className={styles['practice-session']}>Laden...</div>;
  }

  const questionHint = (currentTask.content as unknown as Record<string, unknown>)?.hint as string | undefined;

  return (
    <div className={styles['practice-session']}>
      {/* Header */}
      <SessionHeader
        currentTaskIndex={currentTaskIndex}
        totalTasks={session.execution.taskIds?.length || 0}
        currentTask={currentTask}
        progress={progress}
        onCancel={onCancel}
      />

      {/* Question Area */}
      <div className={styles['practice-session__question-area']}>
        {/* Question Header (for task types that have a question field) */}
        {(currentTask.type === 'multiple-choice' ||
          currentTask.type === 'ordering' ||
          currentTask.type === 'matching' ||
          currentTask.type === 'multiple-select' ||
          currentTask.type === 'slider' ||
          currentTask.type === 'word-scramble' ||
          currentTask.type === 'text-input') && (
          <div className={styles['practice-session__question-header']}>
            <h3 className={styles['practice-session__question-text']}>
              {(currentTask.content as unknown as Record<string, unknown>).question as string}
            </h3>
            {audioConfig?.buttons?.question?.show &&
              (currentTask.content as unknown as Record<string, unknown>)[
                audioConfig.buttons.question.field
              ] as string && (
                <AudioButton
                  text={(currentTask.content as unknown as Record<string, unknown>).question as string}
                  audioUrl={`${import.meta.env.BASE_URL}audio/${
                    (currentTask.content as unknown as Record<string, unknown>)[
                      audioConfig.buttons.question.field
                    ] as string
                  }`}
                  size="small"
                />
              )}
          </div>
        )}

        {/* Hint Controls */}
        {questionHint && !showFeedback && (
          <div className={styles['practice-session__hint-controls']}>
            <button
              type="button"
              className={styles['practice-session__hint-button']}
              onClick={() => setHintVisible((prev) => !prev)}
            >
              {hintVisible ? 'Hinweis verbergen' : 'Hinweis anzeigen'} (H)
            </button>
          </div>
        )}

        {/* Hint Display */}
        {questionHint && hintVisible && !showFeedback && (
          <div className={styles['practice-session__hint']}>
            💡 <strong>Hinweis:</strong> {questionHint}
          </div>
        )}

        {/* Task Content */}
        <TaskRenderer
          task={currentTask}
          showFeedback={showFeedback}
          isCorrect={isCorrect}
          audioConfig={audioConfig}
          onAnswerChange={setCanSubmitAnswer}
          onAutoAdvance={handleNext}
          onSubmitAnswer={submitAnswer}
        />
      </div>

      {/* Feedback - skip for flashcard tasks (self-assessment doesn't need feedback splash) */}
      {showFeedback && currentTask.type !== 'flashcard' && (
        <FeedbackDisplay isCorrect={isCorrect} currentTask={currentTask} />
      )}

      {/* Footer with Actions and Stats */}
      <div className={styles['practice-session__footer']}>
        <NavigationControls
          session={session}
          currentTask={currentTask}
          currentTaskIndex={currentTaskIndex}
          showFeedback={showFeedback}
          canSubmit={canSubmitAnswer}
          onSubmit={handleSubmit}
          onSkip={handleSkip}
          onNext={handleNext}
          onComplete={handleCompleteSession}
        />

        <SessionStats session={session} />
      </div>

      {/* Keyboard Shortcuts Overlay */}
      {showShortcutHelp && (
        <div
          className={styles['practice-session__shortcuts-overlay']}
          role="dialog"
          aria-modal="true"
          aria-labelledby="practice-shortcuts-title"
        >
          <div className={styles['practice-session__shortcuts-content']}>
            <h2 id="practice-shortcuts-title">Tastaturkürzel</h2>
            <div className={styles['practice-session__shortcuts-groups']}>
              <div>
                <div
                  className={
                    styles['practice-session__shortcuts-group-title']
                  }
                >
                  Navigation
                </div>
                <ul className={styles['practice-session__shortcuts-list']}>
                  <li className={styles['practice-session__shortcut-item']}>
                    <span>Sitzung abbrechen</span>
                    <span
                      className={styles['practice-session__shortcut-keys']}
                    >
                      Esc
                    </span>
                  </li>
                  <li className={styles['practice-session__shortcut-item']}>
                    <span>Antwort überprüfen / Weiter</span>
                    <span
                      className={styles['practice-session__shortcut-keys']}
                    >
                      Enter
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <div
                  className={
                    styles['practice-session__shortcuts-group-title']
                  }
                >
                  Hilfsfunktionen
                </div>
                <ul className={styles['practice-session__shortcuts-list']}>
                  <li className={styles['practice-session__shortcut-item']}>
                    <span>Hinweis anzeigen/verbergen</span>
                    <span
                      className={styles['practice-session__shortcut-keys']}
                    >
                      H
                    </span>
                  </li>
                  <li className={styles['practice-session__shortcut-item']}>
                    <span>Frage wiederholen</span>
                    <span
                      className={styles['practice-session__shortcut-keys']}
                    >
                      R
                    </span>
                  </li>
                  <li className={styles['practice-session__shortcut-item']}>
                    <span>Tastaturkürzel anzeigen</span>
                    <span
                      className={styles['practice-session__shortcut-keys']}
                    >
                      ?
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowShortcutHelp(false)}
              className={styles['practice-session__shortcuts-close']}
            >
              Schließen (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
