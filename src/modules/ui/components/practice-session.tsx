import React, { useState, useEffect } from 'react';
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

  // Audio hooks
  const { playbackState, loadAudio, togglePlayPause, replay, stop, preloadNext } = useAudioPlayback();
  const { settings: audioSettings } = useAudioSettings();

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

    // Auto-play audio if eligible (with error boundary)
    if (isEligibleForAutoPlay(task, audioSettings)) {
      loadAudio(task, audioSettings, true).catch((error) => {
        console.warn('Auto-play failed, continuing without audio:', error);
        // Don't crash the session - audio is optional
      });
    }

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

  async function handleAnswerSubmit() {
    if (!currentTask || !session) return;

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
      if (flashcardKnown === null) return;
      correct = flashcardKnown;
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
  }

  function handleSkipTask() {
    if (!session) return;

    setShowFeedback(false);
    setSelectedAnswer(null);

    if (currentTaskIndex < session.execution.taskIds.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  }

  function handleNextTask() {
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (session && currentTaskIndex < session.execution.taskIds.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      handleComplete();
    }
  }

  async function handleComplete() {
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
  }

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

  // Helper function to check if answer is ready to submit
  function canSubmit(): boolean {
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
  }

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

    return (
      <div className={styles['practice-session__mc-options']}>
        {shuffledOptions.map((option, index) => {
          const optionClasses = [
            styles['practice-session__mc-option'],
            showFeedback && index === correctAnswerIndex && styles['practice-session__mc-option--correct'],
            showFeedback && index === selectedAnswer && !isCorrect && styles['practice-session__mc-option--incorrect'],
            !showFeedback && selectedAnswer === index && styles['practice-session__mc-option--selected'],
            showFeedback && styles['practice-session__mc-option--disabled']
          ].filter(Boolean).join(' ');

          return (
            <button
              key={index}
              onClick={() => !showFeedback && setSelectedAnswer(index)}
              disabled={showFeedback}
              className={optionClasses}
            >
              <span>{option}</span>
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
    const content = currentTask.content as OrderingContent;

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

            return (
              <div key={index} className={itemClasses}>
                <div className={styles['practice-session__ordering-item-number']}>
                  {index + 1}.
                </div>
                <div className={styles['practice-session__ordering-item-text']}>
                  {item}
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
            {content.correctOrder.map((originalIndex, position) => (
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
    const content = currentTask.content as MatchingContent;

    return (
      <div className={styles['practice-session__matching-container']}>
        <div className={styles['practice-session__matching-instruction']}>
          Ordne die passenden Paare zu
        </div>
        <div className={styles['practice-session__matching-grid']}>
          {content.pairs.map((pair, leftIndex) => {
            const isCorrect = showFeedback && matchingAnswers[leftIndex] === leftIndex;
            const hasAnswer = matchingAnswers[leftIndex] !== undefined && matchingAnswers[leftIndex] !== null;

            return (
              <React.Fragment key={leftIndex}>
                <div className={styles['practice-session__matching-left-item']}>
                  <span>{pair.left}</span>
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
            {content.pairs.map((pair, i) => (
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

    const toggleOption = (index: number) => {
      if (showFeedback) return;
      const newSelected = new Set(selectedOptions);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      setSelectedOptions(newSelected);
    };

    return (
      <div className={styles['practice-session__ms-container']}>
        <div className={styles['practice-session__ms-instruction']}>
          Wähle alle zutreffenden Antworten
        </div>
        <div className={styles['practice-session__ms-options']}>
          {content.options.map((option, index) => {
            const isSelected = selectedOptions.has(index);
            const isCorrectAnswer = content.correctAnswers.includes(index);
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
              showFeedback && isCorrectAnswer && styles['practice-session__ms-option--correct'],
              showFeedback && isSelected && !isCorrectAnswer && styles['practice-session__ms-option--incorrect'],
              !showFeedback && isSelected && styles['practice-session__ms-option--selected']
            ].filter(Boolean).join(' ');

            const iconClass = isCorrectAnswer
              ? styles['practice-session__ms-status-icon--correct']
              : styles['practice-session__ms-status-icon--incorrect'];

            return (
              <div key={index} className={optionClasses}>
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleOption(index)}
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
            {currentTask.audioUrl && <AudioButton text={content.front} audioUrl={currentTask.audioUrl} size="large" />}
          </div>

          {/* Back side or reveal button */}
          {!flashcardRevealed ? (
            <button
              onClick={() => setFlashcardRevealed(true)}
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
                {currentTask.audioUrl && <AudioButton text={content.back} audioUrl={currentTask.audioUrl} size="large" />}
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
                handleAnswerSubmit();
              }}
              className={`${styles['practice-session__flashcard-btn']} ${styles['practice-session__flashcard-btn--unknown']}`}
            >
              <span className={styles['practice-session__flashcard-icon']}>✗</span>
              <span>Nicht gewusst</span>
            </button>

            <button
              onClick={() => {
                setFlashcardKnown(true);
                handleAnswerSubmit();
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
    const content = currentTask.content as TextInputContent;

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
              {currentTask.audioUrl && <AudioButton text={content.correctAnswer} audioUrl={currentTask.audioUrl} size="small" />}
            </div>
          )}
        </div>

        {content.hint && !showFeedback && (
          <div className={styles['practice-session__text-input-hint']}>
            💡 <strong>Tipp:</strong> {content.hint}
          </div>
        )}
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

  return (
    <div className={styles['practice-session']}>
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
              <button
                onClick={handleAnswerSubmit}
                disabled={!canSubmit()}
                className={canSubmit()
                  ? `${styles['practice-session__btn-submit']} ${styles['practice-session__btn-submit--enabled']}`
                  : `${styles['practice-session__btn-submit']} ${styles['practice-session__btn-submit--disabled']}`}
              >
                Antwort überprüfen
              </button>
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
            <button
              onClick={handleNextTask}
              className={styles['practice-session__btn-next']}
            >
              {currentTaskIndex < session.execution.taskIds.length - 1
                ? 'Nächste Aufgabe →'
                : 'Sitzung beenden'}
            </button>
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
    </div>
  );
}