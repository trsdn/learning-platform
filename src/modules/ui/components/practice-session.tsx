import React, { useState, useEffect, useCallback } from 'react';
import type { Task, PracticeSession, ClozeDeletionContent, TrueFalseContent, OrderingContent, MatchingContent, MultipleSelectContent, SliderContent, WordScrambleContent, FlashcardContent, TextInputContent } from '@core/types/services';
import { db } from '@storage/database';
import { PracticeSessionService } from '@core/services/practice-session-service';
import { SpacedRepetitionService } from '@core/services/spaced-repetition-service';
import {
  getPracticeSessionRepository,
  getTaskRepository,
  getSpacedRepetitionRepository,
} from '@storage/factory';
import { useAudioPlayback } from '../hooks/use-audio-playback';
import { useAudioSettings } from '../hooks/use-audio-settings';
import { isEligibleForAutoPlay } from '@core/utils/audio-helpers';
import { getAudioConfig, type AudioConfig } from '@storage/template-loader';
import { AudioButton } from './audio-button';
import { FeedbackCard } from './common/FeedbackCard';
import { Input, Checkbox, Select, Slider } from './forms';
import styles from './practice-session.module.css';

interface Props {
  topicId: string;
  learningPathIds: string[];
  targetCount?: number;
  includeReview?: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

export function PracticeSession({ topicId, learningPathIds, targetCount = 10, includeReview = true, onComplete, onCancel }: Props) {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Multiple choice state
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);

  // Cloze deletion state
  const [blankAnswers, setBlankAnswers] = useState<string[]>([]);

  // True/False state
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);

  // Ordering state
  const [orderedItems, setOrderedItems] = useState<string[]>([]);

  // Matching state
  const [matchingAnswers, setMatchingAnswers] = useState<Record<number, number>>({});
  const [shuffledRightColumn, setShuffledRightColumn] = useState<number[]>([]);

  // Multiple Select state
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());

  // Slider state
  const [sliderValue, setSliderValue] = useState<number>(0);

  // Word Scramble state
  const [scrambleAnswer, setScrambleAnswer] = useState<string>('');

  // Flashcard state
  const [flashcardRevealed, setFlashcardRevealed] = useState<boolean>(false);
  const [flashcardKnown, setFlashcardKnown] = useState<boolean | null>(null);

  // Text Input state
  const [textInputAnswer, setTextInputAnswer] = useState<string>('');

  // Keyboard & accessibility state
  const [optionCursor, setOptionCursor] = useState<number>(0);
  const [showShortcutHelp, setShowShortcutHelp] = useState<boolean>(false);
  const [hintVisible, setHintVisible] = useState<boolean>(false);

  // Template audio configuration
  const [audioConfig, setAudioConfig] = useState<AudioConfig | null>(null);

  // Audio hooks
  const { playbackState, loadAudio, togglePlayPause, replay, stop, preloadNext, unlockAutoPlay } = useAudioPlayback();
  const { settings: audioSettings } = useAudioSettings();

  const toggleMultipleSelectOption = useCallback((index: number) => {
    if (showFeedback || currentTask?.type !== 'multiple-select') return;
    setSelectedOptions((prev) => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      return updated;
    });
  }, [showFeedback, currentTask]);

  const repeatQuestionAudio = useCallback(() => {
    if (!currentTask) return;
    const content: any = currentTask.content;
    const questionField = audioConfig?.buttons?.question?.field;
    const hasAudio = Boolean(currentTask.audioUrl || (questionField && content?.[questionField]));
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
  }, [currentTask, audioSettings, loadAudio, replay, unlockAutoPlay, audioConfig]);

  // Helper function to check if answer is ready to submit
  const canSubmit = useCallback((): boolean => {
    if (showFeedback) return false;

    if (currentTask?.type === 'multiple-choice') return selectedAnswer !== null;
    if (currentTask?.type === 'cloze-deletion') return blankAnswers.every(a => a.trim().length > 0);
    if (currentTask?.type === 'true-false') return trueFalseAnswer !== null;
    if (currentTask?.type === 'ordering') return orderedItems.length > 0;
    if (currentTask?.type === 'matching') {
      const content = currentTask.content as MatchingContent;
      return Object.keys(matchingAnswers).length === content.pairs.length;
    }
    if (currentTask?.type === 'multiple-select') return selectedOptions.size > 0;
    if (currentTask?.type === 'slider') return true; // Slider always has a value
    if (currentTask?.type === 'word-scramble') return scrambleAnswer.trim().length > 0;
    if (currentTask?.type === 'flashcard') return flashcardKnown !== null;
    if (currentTask?.type === 'text-input') return textInputAnswer.trim().length > 0;
    return false;
  }, [showFeedback, currentTask, selectedAnswer, blankAnswers, trueFalseAnswer, orderedItems, matchingAnswers, selectedOptions, scrambleAnswer, flashcardKnown, textInputAnswer]);

  const handleAnswerSubmit = useCallback(async (flashcardResult?: boolean) => {
    if (!currentTask || !session) return;

    // Unlock auto-play on first user interaction (browser requirement)
    if (!playbackState.autoPlayUnlocked) {
      unlockAutoPlay().catch(err => console.warn('Failed to unlock auto-play:', err));
    }

    let correct = false;

    // Check answer based on task type
    if (currentTask.type === 'multiple-choice') {
      if (selectedAnswer === null) return;
      correct = selectedAnswer === correctAnswerIndex;
    } else if (currentTask.type === 'cloze-deletion') {
      const content = currentTask.content as ClozeDeletionContent;
      correct = content.blanks.every((blank, i) => {
        const userAnswer = blankAnswers[i]?.trim().toLowerCase() || '';
        const correctAnswer = blank.correctAnswer.toLowerCase();
        const alternatives = blank.alternatives?.map(a => a.toLowerCase()) || [];
        return userAnswer === correctAnswer || alternatives.includes(userAnswer);
      });
    } else if (currentTask.type === 'true-false') {
      if (trueFalseAnswer === null) return;
      const content = currentTask.content as TrueFalseContent;
      correct = trueFalseAnswer === content.correctAnswer;
    } else if (currentTask.type === 'ordering') {
      const content = currentTask.content as OrderingContent;
      correct = orderedItems.every((item, i) => {
        const originalIndex = content.items.indexOf(item);
        return content.correctOrder[i]! === originalIndex;
      });
    } else if (currentTask.type === 'matching') {
      const content = currentTask.content as MatchingContent;
      correct = content.pairs.every((_pair, i) => matchingAnswers[i] === i);
    } else if (currentTask.type === 'multiple-select') {
      const content = currentTask.content as MultipleSelectContent;
      if (selectedOptions.size === 0) return;
      // Check if all correct answers are selected and no wrong ones
      correct = content.correctAnswers.length === selectedOptions.size &&
        content.correctAnswers.every(ans => selectedOptions.has(ans));
    } else if (currentTask.type === 'slider') {
      const content = currentTask.content as SliderContent;
      const tolerance = content.tolerance || 0;
      correct = Math.abs(sliderValue - content.correctValue) <= tolerance;
    } else if (currentTask.type === 'word-scramble') {
      if (!scrambleAnswer.trim()) return;
      const content = currentTask.content as WordScrambleContent;
      correct = scrambleAnswer.trim().toLowerCase() === content.correctWord.toLowerCase();
    } else if (currentTask.type === 'flashcard') {
      const result = flashcardResult ?? flashcardKnown;
      if (result === null || result === undefined) return;
      correct = result;
      // Ensure state reflects the recorded result when triggered via override
      setFlashcardKnown(result);
    } else if (currentTask.type === 'text-input') {
      if (!textInputAnswer.trim()) return;
      const content = currentTask.content as TextInputContent;
      const caseSensitive = content.caseSensitive || false;
      const userAnswer = caseSensitive ? textInputAnswer.trim() : textInputAnswer.trim().toLowerCase();
      const correctAnswer = caseSensitive ? content.correctAnswer : content.correctAnswer.toLowerCase();
      const alternatives = (content.alternatives || []).map(a => caseSensitive ? a : a.toLowerCase());
      correct = userAnswer === correctAnswer || alternatives.includes(userAnswer);
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    // Calculate time spent
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    // Record answer in session
    const sessionService = new PracticeSessionService(
      getPracticeSessionRepository(),
      getTaskRepository(),
      getSpacedRepetitionRepository()
    );

    await sessionService.recordSessionAnswer(session.id, correct, timeSpent);

    // Update spaced repetition
    const spacedRepService = new SpacedRepetitionService(
      getSpacedRepetitionRepository(),
      getTaskRepository()
    );

    // Convert boolean to grade (0-5 scale)
    const grade = correct ? 4 : 2;
    await spacedRepService.recordAnswer(currentTask.id, correct, grade);

    // Update session state
    const updatedSession = await db.practiceSessions.get(session.id);
    if (updatedSession) {
      setSession(updatedSession);
    }
  }, [currentTask, session, playbackState.autoPlayUnlocked, unlockAutoPlay, selectedAnswer, correctAnswerIndex, blankAnswers, trueFalseAnswer, orderedItems, matchingAnswers, selectedOptions, sliderValue, scrambleAnswer, flashcardKnown, textInputAnswer, startTime]);

  const handleComplete = useCallback(async () => {
    if (!session) return;

    const sessionService = new PracticeSessionService(
      getPracticeSessionRepository(),
      getTaskRepository(),
      getSpacedRepetitionRepository()
    );

    await sessionService.completeSession(session.id);

    // Wait a bit to ensure the session is saved to the database
    await new Promise(resolve => setTimeout(resolve, 100));

    onComplete();
  }, [session, onComplete]);

  const handleNextTask = useCallback(() => {
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (session && currentTaskIndex < session.execution.taskIds.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      handleComplete();
    }
  }, [session, currentTaskIndex, handleComplete]);

  // Initialize session
  useEffect(() => {
    initializeSession();
  }, []);

  // Load current task when session is first loaded
  useEffect(() => {
    if (session && session.execution.taskIds.length > 0 && currentTaskIndex === 0) {
      loadCurrentTask();
    }
  }, [session]);

  // Load current task when index changes
  useEffect(() => {
    if (session && session.execution.taskIds.length > 0 && currentTaskIndex > 0) {
      loadCurrentTask();
    }
  }, [currentTaskIndex]);

  useEffect(() => {
    if (!currentTask) {
      setOptionCursor(0);
      return;
    }

    if (currentTask.type === 'multiple-choice') {
      const total = shuffledOptions.length;
      setOptionCursor((prev) => {
        if (total === 0) return 0;
        return Math.min(prev, total - 1);
      });
    } else if (currentTask.type === 'multiple-select') {
      const total = (currentTask.content as MultipleSelectContent).options.length;
      setOptionCursor((prev) => {
        if (total === 0) return 0;
        return Math.min(prev, total - 1);
      });
    } else {
      setOptionCursor(0);
    }
  }, [currentTask, shuffledOptions]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentTask) return;
      const active = document.activeElement as HTMLElement | null;
      const tagName = active?.tagName?.toLowerCase();
      const isTyping = Boolean(active && (tagName === 'input' || tagName === 'textarea' || active.isContentEditable));
      const key = event.key;

      const taskType = currentTask.type as string;

      const toggleHintIfAvailable = () => {
        const hint = (currentTask.content as any)?.hint;
        if (hint) {
          setHintVisible((prev) => !prev);
        }
      };

      const moveCursor = (delta: number) => {
        if (taskType === 'multiple-choice') {
          const total = shuffledOptions.length;
          if (total === 0) return;
          setOptionCursor((prev) => {
            const next = (prev + delta + total) % total;
            setSelectedAnswer(next);
            return next;
          });
        } else if (taskType === 'multiple-select') {
          const options = (currentTask.content as MultipleSelectContent).options;
          if (options.length === 0) return;
          setOptionCursor((prev) => {
            const next = (prev + delta + options.length) % options.length;
            return next;
          });
        }
      };

      const submitCurrent = () => {
        if (taskType === 'flashcard') {
          if (!flashcardRevealed) {
            setFlashcardRevealed(true);
          } else if (flashcardKnown !== null) {
            handleNextTask();
          }
          return;
        }

        if (!showFeedback) {
          if (canSubmit()) {
            void handleAnswerSubmit();
          }
        } else if (taskType !== 'flashcard') {
          handleNextTask();
        }
      };

      if ((key === '?' || (key === '/' && event.shiftKey)) && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setShowShortcutHelp((prev) => !prev);
        return;
      }

      if (showShortcutHelp) {
        if (key === 'Escape' || key === '?' || (key === '/' && event.shiftKey)) {
          event.preventDefault();
          setShowShortcutHelp(false);
        }
        return;
      }

      if (/^[1-9]$/.test(key) && !isTyping) {
        const index = Number(key) - 1;
        if (taskType === 'multiple-choice' && index < shuffledOptions.length) {
          event.preventDefault();
          setOptionCursor(index);
          setSelectedAnswer(index);
        } else if (taskType === 'multiple-select') {
          const options = (currentTask.content as MultipleSelectContent).options;
          if (index < options.length) {
            event.preventDefault();
            setOptionCursor(index);
            toggleMultipleSelectOption(index);
          }
        } else if (taskType === 'true-false') {
          if (key === '1') {
            event.preventDefault();
            setTrueFalseAnswer(true);
          } else if (key === '2') {
            event.preventDefault();
            setTrueFalseAnswer(false);
          }
        } else if (taskType === 'flashcard' && flashcardRevealed && !showFeedback) {
          if (key === '1') {
            event.preventDefault();
            setFlashcardKnown(false);
            handleAnswerSubmit(false);
            setTimeout(() => handleNextTask(), 300);
          } else if (key === '2') {
            event.preventDefault();
            setFlashcardKnown(true);
            handleAnswerSubmit(true);
            setTimeout(() => handleNextTask(), 300);
          }
        }
        return;
      }

      switch (key) {
        case 'Escape':
          event.preventDefault();
          if (showShortcutHelp) {
            setShowShortcutHelp(false);
          } else if (hintVisible) {
            setHintVisible(false);
          } else {
            onCancel();
          }
          break;
        case 'Enter':
          if (isTyping) return; // Don't submit if user is typing
          event.preventDefault();
          submitCurrent();
          break;
        case ' ': {
          if (isTyping) return;
          if (taskType === 'multiple-choice') {
            event.preventDefault();
            setSelectedAnswer(optionCursor);
          } else if (taskType === 'multiple-select') {
            event.preventDefault();
            toggleMultipleSelectOption(optionCursor);
          }
          break;
        }
        case 'ArrowUp':
        case 'ArrowLeft':
          if (isTyping) return;
          if (taskType === 'multiple-choice' || taskType === 'multiple-select') {
            event.preventDefault();
            moveCursor(-1);
          }
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          if (isTyping) return;
          if (taskType === 'multiple-choice' || taskType === 'multiple-select') {
            event.preventDefault();
            moveCursor(1);
          }
          break;
        case 'r':
        case 'R':
          if (isTyping) return;
          event.preventDefault();
          repeatQuestionAudio();
          break;
        case 'h':
        case 'H':
          if (isTyping) return;
          event.preventDefault();
          toggleHintIfAvailable();
          break;
        case '?':
          // Already handled above
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentTask,
    shuffledOptions,
    optionCursor,
    showFeedback,
    flashcardRevealed,
    flashcardKnown,
    hintVisible,
    showShortcutHelp,
    canSubmit,
    handleAnswerSubmit,
    handleNextTask,
    selectedAnswer,
    trueFalseAnswer,
    textInputAnswer,
  ]);

  // Keyboard shortcuts for audio controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't trigger if no audio is loaded
      if (!playbackState.audioUrl) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ': // Space - Toggle play/pause
          e.preventDefault();
          togglePlayPause().catch(console.error);
          break;
        case 'r': // R - Replay
          e.preventDefault();
          replay().catch(console.error);
          break;
        case 's': // S - Stop
          e.preventDefault();
          stop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playbackState.audioUrl, togglePlayPause, replay, stop]);

  // Auto-play audio when feedback is shown (after user answers)
  useEffect(() => {
    if (showFeedback && currentTask && isEligibleForAutoPlay(currentTask, audioSettings)) {
      console.log('🔊 Auto-play in feedback:', currentTask.audioUrl);
      loadAudio(currentTask, audioSettings, true).catch((error) => {
        console.warn('Auto-play in feedback failed:', error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFeedback, currentTask?.id, audioSettings.autoPlayEnabled, audioSettings.languageFilter]);

  // Auto-play audio on load (based on template config)
  useEffect(() => {
    if (!currentTask || !audioConfig || showFeedback) return;

    const fieldsToPlay = audioConfig.autoPlay?.onLoad || [];
    const content = currentTask.content as any;

    // Try to auto-play immediately
    const tryAutoPlay = async () => {
      for (const field of fieldsToPlay) {
        const fieldValue = content[field];

        if (!fieldValue) continue;

        // Handle array fields (like optionsAudio) - play first item
        const audioFile = Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;

        if (audioFile) {
          try {
            const audio = new Audio(`${import.meta.env.BASE_URL}audio/${audioFile}`);
            await audio.play();
            console.log(`✅ Auto-played ${field}: ${audioFile}`);
            break; // Only play first available audio
          } catch (err) {
            console.warn(`⚠️ Auto-play blocked for ${field}. User interaction required first.`, err);
            // Try to unlock auto-play for next time
            if (!playbackState.autoPlayUnlocked) {
              unlockAutoPlay().catch(e => console.warn('Failed to unlock auto-play:', e));
            }
          }
        }
      }
    };

    tryAutoPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTask?.id, audioConfig]);

  // Reset hint visibility when feedback is shown
  useEffect(() => {
    if (showFeedback) {
      setHintVisible(false);
    }
  }, [showFeedback]);

  // Auto-play audio on reveal/feedback (based on template config)
  useEffect(() => {
    if (!currentTask || !audioConfig || !showFeedback) return;

    const fieldsToPlay = audioConfig.autoPlay?.onReveal || [];
    const content = currentTask.content as any;

    // Try to auto-play immediately
    const tryAutoPlayOnReveal = async () => {
      for (const field of fieldsToPlay) {
        const audioFiles: string[] = [];

        // Special handling for different task types
        if (field === 'correctAnswerAudio' && currentTask.type === 'multiple-choice') {
          // Multiple choice: play correct option audio
          if (content.optionsAudio?.[content.correctAnswer]) {
            audioFiles.push(content.optionsAudio[content.correctAnswer]);
          }
        } else if (field === 'correctAnswerAudio' && currentTask.type === 'text-input') {
          // Text input: play correct answer audio
          if (content.correctAnswerAudio) {
            audioFiles.push(content.correctAnswerAudio);
          }
        } else if (field === 'itemsAudioInOrder' && currentTask.type === 'ordering') {
          // Ordering: play all items in correct order
          const itemsAudio = content.itemsAudio;
          const correctOrder = content.correctOrder;
          if (itemsAudio && correctOrder) {
            for (const originalIndex of correctOrder) {
              if (itemsAudio[originalIndex]) {
                audioFiles.push(itemsAudio[originalIndex]);
              }
            }
          }
        } else if (field === 'blanksAudioInOrder' && currentTask.type === 'cloze-deletion') {
          // Cloze deletion: play all blanks in order
          const blanks = content.blanks;
          if (blanks) {
            for (const blank of blanks) {
              if (blank.correctAnswerAudio) {
                audioFiles.push(blank.correctAnswerAudio);
              }
            }
          }
        } else if (field === 'correctOptionsAudio' && currentTask.type === 'multiple-select') {
          // Multiple select: play all correct options
          const optionsAudio = content.optionsAudio;
          const correctAnswers = content.correctAnswers;
          if (optionsAudio && correctAnswers) {
            for (const correctIndex of correctAnswers) {
              if (optionsAudio[correctIndex]) {
                audioFiles.push(optionsAudio[correctIndex]);
              }
            }
          }
        } else if (field === 'correctValueAudio' && currentTask.type === 'slider') {
          // Slider: play correct value audio
          if (content.correctValueAudio) {
            audioFiles.push(content.correctValueAudio);
          }
        } else if (field === 'correctWordAudio' && currentTask.type === 'word-scramble') {
          // Word scramble: play correct word audio
          if (content.correctWordAudio) {
            audioFiles.push(content.correctWordAudio);
          }
        } else {
          // Generic: try to get field value
          const fieldValue = content[field];
          if (fieldValue) {
            const audioFile = Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;
            if (audioFile) audioFiles.push(audioFile);
          }
        }

        // Play all audio files sequentially
        if (audioFiles.length > 0) {
          for (const audioFile of audioFiles) {
            try {
              const audio = new Audio(`${import.meta.env.BASE_URL}audio/${audioFile}`);
              await audio.play();
              // Wait for audio to finish before playing next one
              await new Promise(resolve => {
                audio.onended = resolve;
                // Fallback timeout in case onended doesn't fire
                setTimeout(resolve, 5000);
              });
              console.log(`✅ Auto-played on reveal ${field}: ${audioFile}`);
            } catch (err) {
              console.warn(`⚠️ Auto-play on reveal blocked for ${audioFile}.`, err);
              break; // Stop if one fails
            }
          }
          break; // Only process first field with audio
        }
      }
    };

    // Small delay to ensure feedback is visible before playing
    const timer = setTimeout(() => {
      tryAutoPlayOnReveal();
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFeedback, currentTask?.id, audioConfig]);

  // Helper function to check if answer is ready to submit

  // Render task-specific content
  function renderTaskContent() {
    if (!currentTask) return null;

    if (currentTask.type === 'multiple-choice') {
      return renderMultipleChoice();
    } else if (currentTask.type === 'cloze-deletion') {
      return renderClozeDeletion();
    } else if (currentTask.type === 'true-false') {
      return renderTrueFalse();
    } else if (currentTask.type === 'ordering') {
      return renderOrdering();
    } else if (currentTask.type === 'matching') {
      return renderMatching();
    } else if (currentTask.type === 'multiple-select') {
      return renderMultipleSelect();
    } else if (currentTask.type === 'slider') {
      return renderSlider();
    } else if (currentTask.type === 'word-scramble') {
      return renderWordScramble();
    } else if (currentTask.type === 'flashcard') {
      return renderFlashcard();
    } else if (currentTask.type === 'text-input') {
      return renderTextInput();
    }
    return null;
  }

  function renderMultipleChoice() {
    if (!currentTask || currentTask.type !== 'multiple-choice') return null;
    const content = currentTask.content as any;

    return (
      <div className={styles['practice-session__mc-options']}>
        {shuffledOptions.map((option, index) => {
          const isFocused = !showFeedback && optionCursor === index;
          const optionClasses = [
            styles['practice-session__mc-option'],
            showFeedback && index === correctAnswerIndex && styles['practice-session__mc-option--correct'],
            showFeedback && index === selectedAnswer && !isCorrect && styles['practice-session__mc-option--incorrect'],
            !showFeedback && selectedAnswer === index && styles['practice-session__mc-option--selected'],
            isFocused && styles['practice-session__mc-option--focused'],
            showFeedback && styles['practice-session__mc-option--disabled']
          ].filter(Boolean).join(' ');

          // Get the audio URL for this option if available
          // Use the original index from shuffledIndices to get the correct audio
          const originalIndex = shuffledIndices[index];
          const optionAudioUrl = content.optionsAudio && originalIndex !== undefined && content.optionsAudio[originalIndex]
            ? `${import.meta.env.BASE_URL}audio/${content.optionsAudio[originalIndex]}`
            : null;

          return (
            <button
              key={index}
              onClick={() => {
                if (showFeedback) return;
                setOptionCursor(index);
                setSelectedAnswer(index);
              }}
              disabled={showFeedback}
              className={optionClasses}
              onMouseEnter={() => setOptionCursor(index)}
            >
              <span>{option}</span>
              {optionAudioUrl && (
                <AudioButton
                  text={option}
                  audioUrl={optionAudioUrl}
                  size="small"
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  function renderClozeDeletion() {
    if (!currentTask || currentTask.type !== 'cloze-deletion') return null;
    const content = currentTask.content as ClozeDeletionContent;

    // Split text by {{blank}} markers
    const parts = content.text.split(/\{\{blank\}\}/g);

    return (
      <div className={styles['practice-session__cloze-container']}>
        <div className={styles['practice-session__cloze-text']}>
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < content.blanks.length && (() => {
                const userAnswer = blankAnswers[i]?.trim().toLowerCase() || '';
                const isCorrect = userAnswer === content.blanks[i]!.correctAnswer.toLowerCase() ||
                  content.blanks[i]!.alternatives?.map(a => a.toLowerCase()).includes(userAnswer);
                const hasAnswer = blankAnswers[i]?.trim() !== '';

                return (
                  <Input
                    value={blankAnswers[i] || ''}
                    onChange={(e) => {
                      const newAnswers = [...blankAnswers];
                      newAnswers[i] = e.target.value;
                      setBlankAnswers(newAnswers);
                    }}
                    disabled={showFeedback}
                    error={showFeedback && hasAnswer && !isCorrect ? true : false}
                    success={showFeedback && isCorrect ? true : false}
                    className={styles['practice-session__cloze-input']}
                  />
                );
              })()}
            </span>
          ))}
        </div>
        {showFeedback && (
          <div className={styles['practice-session__cloze-feedback']}>
            <div className={styles['practice-session__cloze-feedback-title']}>
              Richtige Antworten:
            </div>
            {content.blanks.map((blank, i) => {
              const userAnswer = blankAnswers[i]?.trim().toLowerCase() || '';
              const isCorrect = userAnswer === blank.correctAnswer.toLowerCase() ||
                blank.alternatives?.map(a => a.toLowerCase()).includes(userAnswer);
              const answerClass = isCorrect
                ? styles['practice-session__cloze-answer--correct']
                : styles['practice-session__cloze-answer--neutral'];
              return (
                <div key={i} className={`${styles['practice-session__cloze-answer']} ${answerClass}`}>
                  Lücke {i + 1}: <strong className={styles['practice-session__cloze-answer-correct']}>{blank.correctAnswer}</strong>
                  {blank.alternatives && blank.alternatives.length > 0 && (
                    <span className={styles['practice-session__cloze-alternatives']}>
                      {' '}(auch richtig: {blank.alternatives.join(', ')})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function renderTrueFalse() {
    if (!currentTask || currentTask.type !== 'true-false') return null;
    const content = currentTask.content as TrueFalseContent;

    return (
      <div className={styles['practice-session__tf-container']}>
        <div className={styles['practice-session__tf-statement']}>
          {content.statement}
        </div>
        <div className={styles['practice-session__tf-buttons']}>
          {[true, false].map((value) => {
            const btnClasses = [
              styles['practice-session__tf-button'],
              showFeedback && value === content.correctAnswer && styles['practice-session__tf-button--correct'],
              showFeedback && value === trueFalseAnswer && !isCorrect && styles['practice-session__tf-button--incorrect'],
              !showFeedback && trueFalseAnswer === value && styles['practice-session__tf-button--selected'],
              showFeedback && styles['practice-session__tf-button--disabled']
            ].filter(Boolean).join(' ');

            return (
              <button
                key={value.toString()}
                onClick={() => !showFeedback && setTrueFalseAnswer(value)}
                disabled={showFeedback}
                className={btnClasses}
              >
                {value ? 'Richtig' : 'Falsch'}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderOrdering() {
    if (!currentTask || currentTask.type !== 'ordering') return null;
    const content = currentTask.content as any;

    return (
      <div className={styles['practice-session__ordering-container']}>
        <div className={styles['practice-session__ordering-instruction']}>
          Ordne die Elemente in die richtige Reihenfolge
        </div>
        <div className={styles['practice-session__ordering-items']}>
          {orderedItems.map((item, index) => {
            const originalIndex = content.items.indexOf(item);
            const isInCorrectPosition = showFeedback && content.correctOrder[index] === originalIndex;
            const shouldBeAtPosition = showFeedback ? content.correctOrder.indexOf(originalIndex) : -1;

            const itemClasses = [
              styles['practice-session__ordering-item'],
              showFeedback && isInCorrectPosition && styles['practice-session__ordering-item--correct']
            ].filter(Boolean).join(' ');

            // Get audio URL for this item
            const itemAudioUrl = content.itemsAudio && content.itemsAudio[originalIndex]
              ? `${import.meta.env.BASE_URL}audio/${content.itemsAudio[originalIndex]}`
              : null;

            return (
              <div key={index} className={itemClasses}>
                <div className={styles['practice-session__ordering-item-number']}>
                  {index + 1}.
                </div>
                <div className={styles['practice-session__ordering-item-text']}>
                  <span className={styles['practice-session__ordering-word']}>{item}</span>
                  {itemAudioUrl && (
                    <AudioButton
                      text={item}
                      audioUrl={itemAudioUrl}
                      size="small"
                    />
                  )}
                  {showFeedback && !isInCorrectPosition && (
                    <span className={styles['practice-session__ordering-hint']}>
                      → Position {shouldBeAtPosition + 1}
                    </span>
                  )}
                </div>
                {!showFeedback && (
                  <div className={styles['practice-session__ordering-controls']}>
                    {index > 0 && (
                      <button
                        onClick={() => {
                          const newItems = [...orderedItems];
                          [newItems[index]!, newItems[index - 1]!] = [newItems[index - 1]!, newItems[index]!];
                          setOrderedItems(newItems);
                        }}
                        className={styles['practice-session__ordering-btn']}
                      >
                        ↑
                      </button>
                    )}
                    {index < orderedItems.length - 1 && (
                      <button
                        onClick={() => {
                          const newItems = [...orderedItems];
                          [newItems[index]!, newItems[index + 1]!] = [newItems[index + 1]!, newItems[index]!];
                          setOrderedItems(newItems);
                        }}
                        className={styles['practice-session__ordering-btn']}
                      >
                        ↓
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {showFeedback && !isCorrect && (
          <div className={styles['practice-session__ordering-feedback']}>
            <div className={styles['practice-session__ordering-feedback-title']}>
              Richtige Reihenfolge:
            </div>
            {content.correctOrder.map((originalIndex: number, position: number) => (
              <div key={position} className={styles['practice-session__ordering-feedback-item']}>
                {position + 1}. <strong>{content.items[originalIndex]}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderMatching() {
    if (!currentTask || currentTask.type !== 'matching') return null;
    const content = currentTask.content as any;

    return (
      <div className={styles['practice-session__matching-container']}>
        <div className={styles['practice-session__matching-instruction']}>
          Ordne die passenden Paare zu
        </div>
        <div className={styles['practice-session__matching-grid']}>
          {content.pairs.map((pair: any, leftIndex: number) => {
            const isCorrect = showFeedback && matchingAnswers[leftIndex] === leftIndex;
            const hasAnswer = matchingAnswers[leftIndex] !== undefined && matchingAnswers[leftIndex] !== null;

            // Get audio URL for left item
            const leftAudioUrl = content.leftAudio && content.leftAudio[leftIndex]
              ? `${import.meta.env.BASE_URL}audio/${content.leftAudio[leftIndex]}`
              : null;

            return (
              <React.Fragment key={leftIndex}>
                <div className={styles['practice-session__matching-left-item']}>
                  <span>{pair.left}</span>
                  {leftAudioUrl && (
                    <AudioButton
                      text={pair.left}
                      audioUrl={leftAudioUrl}
                      size="small"
                    />
                  )}
                </div>
                <Select
                  value={matchingAnswers[leftIndex]?.toString() ?? ''}
                  onChange={(value) => {
                    const numValue = parseInt(value);
                    setMatchingAnswers({ ...matchingAnswers, [leftIndex]: numValue });
                  }}
                  options={shuffledRightColumn.map((rightIndex) => ({
                    value: rightIndex.toString(),
                    label: content.pairs[rightIndex]!.right,
                  }))}
                  disabled={showFeedback}
                  placeholder="Wähle..."
                  error={showFeedback && hasAnswer && !isCorrect}
                  success={showFeedback && isCorrect}
                  fullWidth
                />
              </React.Fragment>
            );
          })}
        </div>
        {showFeedback && !isCorrect && (
          <div className={styles['practice-session__matching-feedback']}>
            <div className={styles['practice-session__matching-feedback-title']}>
              Richtige Zuordnungen:
            </div>
            {content.pairs.map((pair: any, i: number) => (
              <div key={i} className={styles['practice-session__matching-feedback-item']}>
                <strong>{pair.left}</strong> → <strong>{pair.right}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderMultipleSelect() {
    if (!currentTask || currentTask.type !== 'multiple-select') return null;
    const content = currentTask.content as MultipleSelectContent;

    return (
      <div className={styles['practice-session__ms-container']}>
        <div className={styles['practice-session__ms-instruction']}>
          Wähle alle zutreffenden Antworten
        </div>
        <div className={styles['practice-session__ms-options']}>
          {content.options.map((option, index) => {
            const isSelected = selectedOptions.has(index);
            const isCorrectAnswer = content.correctAnswers.includes(index);
            const isFocused = !showFeedback && optionCursor === index;
            let statusIcon = '';

            if (showFeedback) {
              if (isCorrectAnswer) {
                statusIcon = isSelected ? '✓' : '○';
              } else if (isSelected && !isCorrectAnswer) {
                statusIcon = '✗';
              }
            }

            const optionClasses = [
              styles['practice-session__ms-option'],
              isFocused && styles['practice-session__ms-option--focused'],
              showFeedback && isCorrectAnswer && styles['practice-session__ms-option--correct'],
              showFeedback && isSelected && !isCorrectAnswer && styles['practice-session__ms-option--incorrect'],
              !showFeedback && isSelected && styles['practice-session__ms-option--selected']
            ].filter(Boolean).join(' ');

            const iconClass = isCorrectAnswer
              ? styles['practice-session__ms-status-icon--correct']
              : styles['practice-session__ms-status-icon--incorrect'];

            return (
              <div
                key={index}
                className={optionClasses}
                onMouseEnter={() => setOptionCursor(index)}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => {
                    toggleMultipleSelectOption(index);
                    setOptionCursor(index);
                  }}
                  disabled={showFeedback}
                  label={<span className={styles['practice-session__ms-option-label']}>{option}</span>}
                  error={showFeedback && isSelected && !isCorrectAnswer}
                  success={showFeedback && isCorrectAnswer && isSelected}
                  style={{ flex: 1 }}
                />
                {showFeedback && statusIcon && (
                  <span className={`${styles['practice-session__ms-status-icon']} ${iconClass}`}>
                    {statusIcon}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderSlider() {
    if (!currentTask || currentTask.type !== 'slider') return null;
    const content = currentTask.content as SliderContent;
    const step = content.step || 1;
    const tolerance = content.tolerance || 0;
    const isCorrectValue = Math.abs(sliderValue - content.correctValue) <= tolerance;

    const valueClass = showFeedback
      ? isCorrectValue
        ? styles['practice-session__slider-value--correct']
        : styles['practice-session__slider-value--incorrect']
      : '';

    return (
      <div className={styles['practice-session__slider-container']}>
        <div className={styles['practice-session__slider-value-display']}>
          <div className={`${styles['practice-session__slider-value']} ${valueClass}`}>
            {sliderValue}{content.unit || ''}
          </div>
        </div>

        <div className={styles['practice-session__slider-wrapper']}>
          <Slider
            value={sliderValue}
            onChange={setSliderValue}
            min={content.min}
            max={content.max}
            step={step}
            disabled={showFeedback}
            unit={content.unit || ''}
            showValue={false}
          />
        </div>

        {showFeedback && (
          <div className={styles['practice-session__slider-feedback']}>
            <div className={styles['practice-session__slider-feedback-text']}>
              Richtige Antwort: <strong className={styles['practice-session__slider-correct-value']}>
                {content.correctValue}{content.unit || ''}
              </strong>
              {tolerance > 0 && (
                <span className={styles['practice-session__slider-tolerance']}>
                  {' '}(±{tolerance})
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderWordScramble() {
    if (!currentTask || currentTask.type !== 'word-scramble') return null;
    const content = currentTask.content as WordScrambleContent;

    const isAnswerCorrect = scrambleAnswer.trim().toLowerCase() === content.correctWord.toLowerCase();
    const hasAnswer = scrambleAnswer.trim() !== '';

    const inputClass = showFeedback
      ? isAnswerCorrect
        ? styles['practice-session__scramble-input--correct']
        : hasAnswer
        ? styles['practice-session__scramble-input--incorrect']
        : ''
      : '';

    return (
      <div className={styles['practice-session__scramble-container']}>
        <div className={styles['practice-session__scramble-display']}>
          <div className={styles['practice-session__scramble-label']}>
            Buchstabensalat:
          </div>
          <div className={styles['practice-session__scramble-word']}>
            {content.scrambledWord}
          </div>
          {content.showLength && (
            <div className={styles['practice-session__scramble-length']}>
              ({content.correctWord.length} Buchstaben)
            </div>
          )}
        </div>

        <div>
          <label className={styles['practice-session__scramble-input-label']}>
            Deine Lösung:
          </label>
          <input
            type="text"
            value={scrambleAnswer}
            onChange={(e) => setScrambleAnswer(e.target.value)}
            disabled={showFeedback}
            placeholder="Entschlüssle das Wort..."
            className={`${styles['practice-session__scramble-input']} ${inputClass}`}
          />
        </div>

        {showFeedback && !isCorrect && (
          <div className={styles['practice-session__scramble-feedback']}>
            <div className={styles['practice-session__scramble-feedback-label']}>
              Richtige Lösung:
            </div>
            <div className={styles['practice-session__scramble-feedback-word']}>
              {content.correctWord}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderFlashcard() {
    if (!currentTask || currentTask.type !== 'flashcard') return null;
    const content = currentTask.content as FlashcardContent;

    return (
      <div className={styles['practice-session__flashcard-container']}>
        {/* Flashcard */}
        <div className={styles['practice-session__flashcard']}>
          {/* Language indicator */}
          <div className={styles['practice-session__flashcard-lang']}>
            {content.frontLanguage === 'de' ? 'Deutsch' : content.frontLanguage === 'es' ? 'Español' : 'English'}
          </div>

          {/* Front side */}
          <div className={styles['practice-session__flashcard-front']}>
            <div>{content.front}</div>
            {audioConfig?.buttons?.front?.show && (content as any)[audioConfig.buttons.front.field] && (
              <AudioButton
                text={content.front}
                audioUrl={`${import.meta.env.BASE_URL}audio/${(content as any)[audioConfig.buttons.front.field]}`}
                size="large"
              />
            )}
          </div>

          {/* Back side or reveal button */}
          {!flashcardRevealed ? (
            <button
              onClick={async () => {
                setFlashcardRevealed(true);
                // Auto-play audio when revealing (based on template config)
                if (audioConfig && playbackState.autoPlayUnlocked) {
                  const fieldsToPlay = audioConfig.autoPlay?.onReveal || [];
                  for (const field of fieldsToPlay) {
                    if ((content as any)[field]) {
                      try {
                        const audio = new Audio(`${import.meta.env.BASE_URL}audio/${(content as any)[field]}`);
                        await audio.play();
                        break; // Only play first available audio
                      } catch (err) {
                        console.warn(`Failed to auto-play ${field} on reveal:`, err);
                      }
                    }
                  }
                }
              }}
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
                {content.backLanguage === 'de' ? 'Deutsch' : content.backLanguage === 'es' ? 'Español' : 'English'}
              </div>

              {/* Answer */}
              <div className={styles['practice-session__flashcard-back']}>
                <div>{content.back}</div>
                {audioConfig?.buttons?.back?.show && (content as any)[audioConfig.buttons.back.field] && (
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
        {flashcardRevealed && !showFeedback && (
          <div className={styles['practice-session__flashcard-assessment']}>
            <button
              onClick={() => {
                setFlashcardKnown(false);
                handleAnswerSubmit(false);
                // Auto-advance to next task after brief delay
                setTimeout(() => {
                  handleNextTask();
                }, 300);
              }}
              className={`${styles['practice-session__flashcard-btn']} ${styles['practice-session__flashcard-btn--unknown']}`}
            >
              <span className={styles['practice-session__flashcard-icon']}>✗</span>
              <span>Nicht gewusst</span>
            </button>

            <button
              onClick={() => {
                setFlashcardKnown(true);
                handleAnswerSubmit(true);
                // Auto-advance to next task after brief delay
                setTimeout(() => {
                  handleNextTask();
                }, 300);
              }}
              className={`${styles['practice-session__flashcard-btn']} ${styles['practice-session__flashcard-btn--known']}`}
            >
              <span className={styles['practice-session__flashcard-icon']}>✓</span>
              <span>Gewusst</span>
            </button>
          </div>
        )}

        {/* Explanation after answer */}
        {showFeedback && content.explanation && (
          <div className={styles['practice-session__flashcard-explanation']}>
            <strong>Hinweis:</strong> {content.explanation}
          </div>
        )}
      </div>
    );
  }

  function renderTextInput() {
    if (!currentTask || currentTask.type !== 'text-input') return null;
    const content = currentTask.content as any;

    const correctAnswerAudioUrl = (content.correctAnswerAudio)
      ? `${import.meta.env.BASE_URL}audio/${content.correctAnswerAudio}`
      : currentTask.audioUrl;

    return (
      <div className={styles['practice-session__text-input-container']}>
        <div className={styles['practice-session__text-input-wrapper']}>
          <Input
            value={textInputAnswer}
            onChange={(e) => setTextInputAnswer(e.target.value)}
            disabled={showFeedback}
            placeholder="Deine Antwort..."
            error={showFeedback && !isCorrect}
            success={showFeedback && isCorrect}
            fullWidth
            className={styles['practice-session__text-input']}
          />

          {showFeedback && !isCorrect && (
            <div className={styles['practice-session__text-input-feedback']}>
              <div>
                <strong>Richtige Antwort:</strong> {content.correctAnswer}
              </div>
              {correctAnswerAudioUrl && <AudioButton text={content.correctAnswer} audioUrl={correctAnswerAudioUrl} size="small" />}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!session || !currentTask) {
    return (
      <div className={styles['practice-session__loading']}>
        <p>Wird geladen...</p>
      </div>
    );
  }

  const progress = ((currentTaskIndex + 1) / session.execution.taskIds.length) * 100;
  const questionHint = (currentTask.content as any)?.hint as string | undefined;

  // Helper functions - defined after all hooks to avoid hook order violations
  async function initializeSession() {
    const sessionService = new PracticeSessionService(
      getPracticeSessionRepository(),
      getTaskRepository(),
      getSpacedRepetitionRepository()
    );

    const newSession = await sessionService.createSession({
      topicId,
      learningPathIds,
      targetCount,
      includeReview,
    });

    setSession(newSession);
  }

  async function loadCurrentTask() {
    if (!session || currentTaskIndex >= session.execution.taskIds.length) return;

    const taskId = session.execution.taskIds[currentTaskIndex];
    if (!taskId) return;

    const task = await db.tasks.get(taskId);
    if (!task) return;

    setCurrentTask(task);
    setStartTime(Date.now());

    // Load audio configuration from template
    const config = await getAudioConfig(task.templateId);
    setAudioConfig(config);

    // NOTE: Auto-play is handled in feedback section after user answers
    // This prevents revealing the correct answer before the user responds

    // Preload next task audio for better UX
    const nextTaskIndex = currentTaskIndex + 1;
    if (nextTaskIndex < session.execution.taskIds.length) {
      const nextTaskId = session.execution.taskIds[nextTaskIndex];
      if (nextTaskId) {
        db.tasks.get(nextTaskId).then((nextTask) => {
          if (nextTask && nextTask.audioUrl) {
            preloadNext(nextTask);
          }
        }).catch((error) => {
          console.warn('Failed to preload next task audio:', error);
        });
      }
    }

    // Reset all state
    setSelectedAnswer(null);
    setTrueFalseAnswer(null);
    setBlankAnswers([]);
    setOrderedItems([]);
    setMatchingAnswers({});
    setShuffledRightColumn([]);
    setSelectedOptions(new Set());
    setSliderValue(0);
    setScrambleAnswer('');
    setFlashcardRevealed(false);
    setFlashcardKnown(null);
    setTextInputAnswer('');
    setOptionCursor(0);
    setShowShortcutHelp(false);
    setHintVisible(false);

    // Type-specific initialization
    if (task.type === 'multiple-choice') {
      const content = task.content as any;
      const originalOptions = [...content.options];
      const originalCorrectAnswer = content.correctAnswer;

      // Create array of indices and shuffle
      const indices = originalOptions.map((_: any, i: number) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i]!, indices[j]!] = [indices[j]!, indices[i]!];
      }

      // Apply shuffle to options and find new position of correct answer
      const shuffled = indices.map(i => originalOptions[i]!);
      // Find the position where the original correct answer ended up after shuffling
      const newCorrectIndex = indices.findIndex(originalIndex => originalIndex === originalCorrectAnswer);

      setShuffledOptions(shuffled);
      setShuffledIndices(indices);
      setCorrectAnswerIndex(newCorrectIndex);
    } else if (task.type === 'cloze-deletion') {
      const content = task.content as ClozeDeletionContent;
      setBlankAnswers(new Array(content.blanks.length).fill(''));
    } else if (task.type === 'ordering') {
      const content = task.content as OrderingContent;
      // Shuffle items for ordering task
      const shuffled = [...content.items].sort(() => Math.random() - 0.5);
      setOrderedItems(shuffled);
    } else if (task.type === 'matching') {
      const content = task.content as MatchingContent;
      // Shuffle right column for matching
      const indices = content.pairs.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i]!, indices[j]!] = [indices[j]!, indices[i]!];
      }
      setShuffledRightColumn(indices);
      setMatchingAnswers({});
    } else if (task.type === 'multiple-select') {
      setSelectedOptions(new Set());
    } else if (task.type === 'slider') {
      const content = task.content as SliderContent;
      setSliderValue(Math.floor((content.min + content.max) / 2)); // Start in middle
    } else if (task.type === 'word-scramble') {
      setScrambleAnswer('');
    }
  }

  function handleSkipTask() {
    if (!session) return;

    setShowFeedback(false);
    setSelectedAnswer(null);

    if (currentTaskIndex < session.execution.taskIds.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  }

  // Unlock auto-play on first user interaction with the practice session
  const handlePracticeSessionClick = () => {
    if (!playbackState.autoPlayUnlocked) {
      unlockAutoPlay().catch(err => console.warn('Failed to unlock auto-play on click:', err));
    }
  };

  return (
    <div className={styles['practice-session']} onClick={handlePracticeSessionClick}>
      {/* Header - compact */}
      <div className={styles['practice-session__header']}>
        <div className={styles['practice-session__header-top']}>
          <div className={styles['practice-session__header-left']}>
            <h2 className={styles['practice-session__title']}>Übungssitzung</h2>
            <span className={styles['practice-session__task-counter']}>
              {currentTaskIndex + 1}/{session.execution.taskIds.length}
            </span>
            <span className={styles['practice-session__task-id']}>
              ID: {currentTask.id}
            </span>
          </div>
          <button
            onClick={onCancel}
            className={styles['practice-session__cancel-btn']}
          >
            Abbrechen
          </button>
        </div>

        {/* Progress bar */}
        <div className={styles['practice-session__progress-bar']}>
          <div
            className={styles['practice-session__progress-fill']}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question - main content area */}
      <div className={styles['practice-session__question-area']}>
        {(currentTask.type === 'multiple-choice' ||
          currentTask.type === 'ordering' ||
          currentTask.type === 'matching' ||
          currentTask.type === 'multiple-select' ||
          currentTask.type === 'slider' ||
          currentTask.type === 'word-scramble' ||
          currentTask.type === 'text-input') && (
          <div className={styles['practice-session__question-header']}>
            <h3 className={styles['practice-session__question-text']}>
              {(currentTask.content as any).question}
            </h3>
            {audioConfig?.buttons?.question?.show && (currentTask.content as any)[audioConfig.buttons.question.field] && (
              <AudioButton
                text={(currentTask.content as any).question}
                audioUrl={`${import.meta.env.BASE_URL}audio/${(currentTask.content as any)[audioConfig.buttons.question.field]}`}
                size="small"
              />
            )}
          </div>
        )}

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

        {questionHint && hintVisible && !showFeedback && (
          <div className={styles['practice-session__hint']}>
            💡 <strong>Hinweis:</strong> {questionHint}
          </div>
        )}

        {renderTaskContent()}
      </div>

      {/* Feedback - compact */}
      {showFeedback && (
        <div className={styles['practice-session__feedback']}>
          <FeedbackCard
            variant={isCorrect ? 'success' : 'error'}
            title={isCorrect ? 'Richtig!' : 'Nicht ganz richtig'}
          >
            {currentTask.content.explanation && (
              <p style={{ margin: 0 }}>{currentTask.content.explanation}</p>
            )}
            {/* Audio button in feedback for language learning */}
            {currentTask.audioUrl && currentTask.type === 'multiple-choice' && (
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Aussprache:
                </span>
                <AudioButton
                  text={(currentTask.content as any).options[(currentTask.content as any).correctAnswer]}
                  audioUrl={currentTask.audioUrl}
                  size="small"
                />
              </div>
            )}
          </FeedbackCard>
        </div>
      )}

      {/* Actions and Statistics - combined footer */}
      <div className={styles['practice-session__footer']}>
        {/* Action buttons */}
        <div className={styles['practice-session__actions']}>
          {!showFeedback ? (
            <>
              {/* Hide "Antwort überprüfen" for flashcards - they use self-assessment */}
              {currentTask?.type !== 'flashcard' && (
                <button
                  onClick={() => handleAnswerSubmit()}
                  disabled={!canSubmit()}
                  className={canSubmit()
                    ? `${styles['practice-session__btn-submit']} ${styles['practice-session__btn-submit--enabled']}`
                    : `${styles['practice-session__btn-submit']} ${styles['practice-session__btn-submit--disabled']}`}
                >
                  Antwort überprüfen
                </button>
              )}
              <button
                onClick={currentTaskIndex < session.execution.taskIds.length - 1 ? handleSkipTask : handleComplete}
                className={styles['practice-session__btn-skip']}
              >
                {currentTaskIndex < session.execution.taskIds.length - 1
                  ? 'Überspringen →'
                  : 'Sitzung beenden'}
              </button>
            </>
          ) : (
            /* Hide "Nächste Aufgabe" for flashcards - they auto-advance */
            currentTask?.type !== 'flashcard' && (
              <button
                onClick={handleNextTask}
                className={styles['practice-session__btn-next']}
              >
              {currentTaskIndex < session.execution.taskIds.length - 1
                ? 'Nächste Aufgabe →'
                : 'Sitzung beenden'}
              </button>
            )
          )}
        </div>

        {/* Compact statistics */}
        <div className={styles['practice-session__stats']}>
          <div className={styles['practice-session__stat']}>
            <div className={`${styles['practice-session__stat-value']} ${styles['practice-session__stat-value--completed']}`}>
              {session.execution.completedCount}
            </div>
            <div className={styles['practice-session__stat-label']}>
              beantwortet
            </div>
          </div>
          <div className={styles['practice-session__stat']}>
            <div className={`${styles['practice-session__stat-value']} ${styles['practice-session__stat-value--correct']}`}>
              {session.execution.correctCount}
            </div>
            <div className={styles['practice-session__stat-label']}>
              richtig
            </div>
          </div>
          <div className={styles['practice-session__stat']}>
            <div className={`${styles['practice-session__stat-value']} ${styles['practice-session__stat-value--accuracy']}`}>
              {session.execution.completedCount > 0
                ? Math.round((session.execution.correctCount / session.execution.completedCount) * 100)
                : 0}%
            </div>
            <div className={styles['practice-session__stat-label']}>
              genau
            </div>
          </div>
      </div>
    </div>

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
                <div className={styles['practice-session__shortcuts-group-title']}>Navigation</div>
                <ul className={styles['practice-session__shortcuts-list']}>
                  <li className={styles['practice-session__shortcut-item']}>
                    <span>Escape</span>
                    <span className={styles['practice-session__shortcut-keys']}>Esc</span>
                  </li>
                  <li className={styles['practice-session__shortcut-item']}>
                    <span>Zur nächsten/vorherigen Option</span>
                    <span className={styles['practice-session__shortcut-keys']}>← ↑ → ↓</span>
                  </li>
                  <li className={styles['practice-session__shortcut-item']}>
                    <span>Option wählen / Checkbox umschalten</span>
                    <span className={styles['practice-session__shortcut-keys']}>Leertaste</span>
                  </li>
                  <li className={styles['practice-session__shortcut-item']}>
                    <span>Option direkt wählen</span>
                    <span className={styles['practice-session__shortcut-keys']}>1–9</span>
                  </li>
                </ul>
              </div>
              <div>
                <div className={styles['practice-session__shortcuts-group-title']}>Aktionen</div>
                <ul className={styles['practice-session__shortcuts-list']}>
                  <li className={styles['practice-session__shortcut-item']}>
                    <span>Antwort überprüfen / weiter</span>
                    <span className={styles['practice-session__shortcut-keys']}>Enter</span>
                  </li>
                  <li className={styles['practice-session__shortcut-item']}>
                    <span>Frage erneut abspielen</span>
                    <span className={styles['practice-session__shortcut-keys']}>R</span>
                  </li>
                  <li className={styles['practice-session__shortcut-item']}>
                    <span>Hinweis anzeigen (falls vorhanden)</span>
                    <span className={styles['practice-session__shortcut-keys']}>H</span>
                  </li>
                  <li className={styles['practice-session__shortcut-item']}>
                    <span>Hilfe umschalten</span>
                    <span className={styles['practice-session__shortcut-keys']}>?</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className={styles['practice-session__shortcuts-close']}>
              <button type="button" onClick={() => setShowShortcutHelp(false)}>
                Schließen (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
