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
import { audioService } from '@core/services/audio-service';
import { AudioButton } from './audio-button';
import { FeedbackCard } from './common/FeedbackCard';
import { Button } from './common/Button';
import { Input, Checkbox, Select, Slider } from './forms';
import { spacing } from '@ui/design-tokens';

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

  // Audio service state
  const [audioReady, setAudioReady] = useState(false);

  // Initialize session and audio service
  useEffect(() => {
    initializeSession();
    audioService.initialize().then(() => {
      setAudioReady(true);
    });
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

  // Helper function to check if text has Spanish audio available
  function isSpanishText(text: string): boolean {
    if (!text || !audioReady) return false;
    // Only return true if we actually have audio for this text
    return audioService.hasAudio(text);
  }

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minHeight: 0 }}>
        {shuffledOptions.map((option, index) => {
          let backgroundColor = '#ffffff';
          let borderColor = '#d1d5db';

          if (showFeedback) {
            if (index === correctAnswerIndex) {
              backgroundColor = '#dcfce7';
              borderColor = '#86efac';
            } else if (index === selectedAnswer && !isCorrect) {
              backgroundColor = '#fee2e2';
              borderColor = '#fca5a5';
            }
          } else if (selectedAnswer === index) {
            backgroundColor = '#dbeafe';
            borderColor = '#3b82f6';
          }

          const hasAudio = isSpanishText(option);
          const isCorrectOption = index === correctAnswerIndex;
          const showAudio = showFeedback && isCorrectOption && hasAudio;

          return (
            <button
              key={index}
              onClick={() => !showFeedback && setSelectedAnswer(index)}
              disabled={showFeedback}
              style={{
                padding: '0.875rem',
                background: backgroundColor,
                border: `2px solid ${borderColor}`,
                borderRadius: '6px',
                cursor: showFeedback ? 'default' : 'pointer',
                textAlign: 'left',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                opacity: 1,
              }}
            >
              <span>{option}</span>
              {showAudio && <AudioButton text={option} size="small" />}
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
      <div style={{ flex: 1, minHeight: 0 }}>
        <div style={{ fontSize: '1rem', lineHeight: '1.8' }}>
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
                    style={{
                      fontSize: '0.95rem',
                      minWidth: '100px',
                      display: 'inline-block',
                    }}
                  />
                );
              })()}
            </span>
          ))}
        </div>
        {showFeedback && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
              Richtige Antworten:
            </div>
            {content.blanks.map((blank, i) => {
              const userAnswer = blankAnswers[i]?.trim().toLowerCase() || '';
              const isCorrect = userAnswer === blank.correctAnswer.toLowerCase() ||
                blank.alternatives?.map(a => a.toLowerCase()).includes(userAnswer);
              return (
                <div key={i} style={{
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                  color: isCorrect ? '#10b981' : '#374151'
                }}>
                  Lücke {i + 1}: <strong style={{ color: '#10b981' }}>{blank.correctAnswer}</strong>
                  {blank.alternatives && blank.alternatives.length > 0 && (
                    <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
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
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '1rem', lineHeight: '1.6', flex: 1 }}>
          {content.statement}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[true, false].map((value) => {
            let backgroundColor = '#ffffff';
            let borderColor = '#d1d5db';

            if (showFeedback) {
              if (value === content.correctAnswer) {
                backgroundColor = '#dcfce7';
                borderColor = '#86efac';
              } else if (value === trueFalseAnswer && !isCorrect) {
                backgroundColor = '#fee2e2';
                borderColor = '#fca5a5';
              }
            } else if (trueFalseAnswer === value) {
              backgroundColor = '#dbeafe';
              borderColor = '#3b82f6';
            }

            return (
              <button
                key={value.toString()}
                onClick={() => !showFeedback && setTrueFalseAnswer(value)}
                disabled={showFeedback}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: backgroundColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: '6px',
                  cursor: showFeedback ? 'default' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
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
      <div style={{ flex: 1, minHeight: 0 }}>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Ordne die Elemente in die richtige Reihenfolge
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {orderedItems.map((item, index) => {
            const originalIndex = content.items.indexOf(item);
            const isInCorrectPosition = showFeedback && content.correctOrder[index] === originalIndex;
            const shouldBeAtPosition = showFeedback ? content.correctOrder.indexOf(originalIndex) : -1;

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: showFeedback
                    ? isInCorrectPosition
                      ? '#dcfce7'
                      : '#ffffff'
                    : '#ffffff',
                  border: showFeedback
                    ? isInCorrectPosition
                      ? '2px solid #86efac'
                      : '2px solid #d1d5db'
                    : '2px solid #d1d5db',
                  borderRadius: '6px',
                }}
              >
                <div style={{ fontWeight: '500', color: '#6b7280', minWidth: '24px' }}>
                  {index + 1}.
                </div>
                <div style={{ flex: 1 }}>
                  {item}
                  {showFeedback && !isInCorrectPosition && (
                    <span style={{ fontSize: '0.8rem', color: '#ef4444', marginLeft: '0.5rem' }}>
                      → Position {shouldBeAtPosition + 1}
                    </span>
                  )}
                </div>
                {!showFeedback && (
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {index > 0 && (
                      <button
                        onClick={() => {
                          const newItems = [...orderedItems];
                          [newItems[index]!, newItems[index - 1]!] = [newItems[index - 1]!, newItems[index]!];
                          setOrderedItems(newItems);
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
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
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
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
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
              Richtige Reihenfolge:
            </div>
            {content.correctOrder.map((originalIndex, position) => (
              <div key={position} style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: '#10b981' }}>
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
      <div style={{ flex: 1, minHeight: 0 }}>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Ordne die passenden Paare zu
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {content.pairs.map((pair, leftIndex) => {
            const isCorrect = showFeedback && matchingAnswers[leftIndex] === leftIndex;
            const hasAnswer = matchingAnswers[leftIndex] !== undefined && matchingAnswers[leftIndex] !== null;

            return (
              <React.Fragment key={leftIndex}>
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#f9fafb',
                    border: '2px solid #d1d5db',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <span>{pair.left}</span>
                  {isSpanishText(pair.left) && <AudioButton text={pair.left} size="small" />}
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
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
              Richtige Zuordnungen:
            </div>
            {content.pairs.map((pair, i) => (
              <div key={i} style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: '#10b981' }}>
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
      <div style={{ flex: 1, minHeight: 0 }}>
        <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Wähle alle zutreffenden Antworten
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {content.options.map((option, index) => {
            const isSelected = selectedOptions.has(index);
            const isCorrectAnswer = content.correctAnswers.includes(index);
            let backgroundColor = '#ffffff';
            let borderColor = '#d1d5db';
            let statusIcon = '';

            if (showFeedback) {
              // Show green for all correct answers (whether selected or not)
              if (isCorrectAnswer) {
                backgroundColor = '#dcfce7';
                borderColor = '#86efac';
                statusIcon = isSelected ? '✓' : '○'; // Check if selected, circle if missed
              }
              // Show red for wrong selections
              else if (isSelected && !isCorrectAnswer) {
                backgroundColor = '#fee2e2';
                borderColor = '#fca5a5';
                statusIcon = '✗';
              }
            } else if (isSelected) {
              backgroundColor = '#dbeafe';
              borderColor = '#3b82f6';
            }

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.875rem',
                  background: backgroundColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleOption(index)}
                  disabled={showFeedback}
                  label={<span style={{ fontSize: '0.95rem', flex: 1 }}>{option}</span>}
                  error={showFeedback && isSelected && !isCorrectAnswer}
                  success={showFeedback && isCorrectAnswer && isSelected}
                  style={{ flex: 1 }}
                />
                {showFeedback && statusIcon && (
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginLeft: '0.5rem',
                    color: isCorrectAnswer ? '#10b981' : '#ef4444'
                  }}>
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

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: showFeedback
              ? Math.abs(sliderValue - content.correctValue) <= tolerance
                ? '#10b981'
                : '#ef4444'
              : '#3b82f6'
          }}>
            {sliderValue}{content.unit || ''}
          </div>
        </div>

        <div style={{ padding: '0 1rem' }}>
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
          <div style={{
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              Richtige Antwort: <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>
                {content.correctValue}{content.unit || ''}
              </strong>
              {tolerance > 0 && (
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
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

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{
          padding: '1.5rem',
          background: '#f9fafb',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Buchstabensalat:
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            letterSpacing: '0.5rem',
            color: '#3b82f6',
            fontFamily: 'monospace'
          }}>
            {content.scrambledWord}
          </div>
          {content.showLength && (
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              ({content.correctWord.length} Buchstaben)
            </div>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            Deine Lösung:
          </label>
          <input
            type="text"
            value={scrambleAnswer}
            onChange={(e) => setScrambleAnswer(e.target.value)}
            disabled={showFeedback}
            placeholder="Entschlüssle das Wort..."
            style={{
              width: '100%',
              padding: '0.875rem',
              fontSize: '1.1rem',
              border: showFeedback
                ? scrambleAnswer.trim().toLowerCase() === content.correctWord.toLowerCase()
                  ? '2px solid #86efac'
                  : scrambleAnswer.trim()
                  ? '2px solid #fca5a5'
                  : '2px solid #d1d5db'
                : '2px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: showFeedback
                ? scrambleAnswer.trim().toLowerCase() === content.correctWord.toLowerCase()
                  ? '#dcfce7'
                  : scrambleAnswer.trim()
                  ? '#fee2e2'
                  : '#ffffff'
                : '#ffffff',
              textAlign: 'center',
              fontWeight: '500'
            }}
          />
        </div>

        {showFeedback && !isCorrect && (
          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
              Richtige Lösung:
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
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
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2rem', padding: '2rem' }}>
        {/* Flashcard */}
        <div style={{
          width: '100%',
          maxWidth: '500px',
          minHeight: '300px',
          background: 'white',
          border: '3px solid #e5e7eb',
          borderRadius: '16px',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease',
        }}>
          {/* Language indicator */}
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {content.frontLanguage === 'de' ? 'Deutsch' : content.frontLanguage === 'es' ? 'Español' : 'English'}
          </div>

          {/* Front side */}
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
            minHeight: '80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}>
            <div>{content.front}</div>
            {isSpanishText(content.front) && <AudioButton text={content.front} size="large" />}
          </div>

          {/* Back side or reveal button */}
          {!flashcardRevealed ? (
            <button
              onClick={() => setFlashcardRevealed(true)}
              disabled={showFeedback}
              style={{
                padding: '1rem 2.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.125rem',
                fontWeight: '500',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2563eb';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Ergebnis anzeigen
            </button>
          ) : (
            <>
              <div style={{
                width: '100%',
                height: '2px',
                background: '#e5e7eb',
                margin: '0.5rem 0'
              }} />

              {/* Language indicator for back */}
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {content.backLanguage === 'de' ? 'Deutsch' : content.backLanguage === 'es' ? 'Español' : 'English'}
              </div>

              {/* Answer */}
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#10b981',
                textAlign: 'center',
                minHeight: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
              }}>
                <div>{content.back}</div>
                {isSpanishText(content.back) && <AudioButton text={content.back} size="large" />}
              </div>
            </>
          )}
        </div>

        {/* Self-assessment buttons - only shown after reveal */}
        {flashcardRevealed && !showFeedback && (
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '500px',
          }}>
            <button
              onClick={() => {
                setFlashcardKnown(false);
                handleAnswerSubmit();
              }}
              style={{
                flex: 1,
                padding: '1.25rem',
                background: '#fee2e2',
                color: '#dc2626',
                border: '2px solid #fca5a5',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1.125rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fecaca';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span style={{ fontSize: '1.75rem' }}>✗</span>
              <span>Nicht gewusst</span>
            </button>

            <button
              onClick={() => {
                setFlashcardKnown(true);
                handleAnswerSubmit();
              }}
              style={{
                flex: 1,
                padding: '1.25rem',
                background: '#dcfce7',
                color: '#16a34a',
                border: '2px solid #86efac',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1.125rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#bbf7d0';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#dcfce7';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span style={{ fontSize: '1.75rem' }}>✓</span>
              <span>Gewusst</span>
            </button>
          </div>
        )}

        {/* Explanation after answer */}
        {showFeedback && content.explanation && (
          <div style={{
            width: '100%',
            maxWidth: '500px',
            padding: '1rem',
            background: '#f3f4f6',
            borderRadius: '8px',
            fontSize: '0.95rem',
            color: '#4b5563',
            lineHeight: '1.6',
          }}>
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
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{
          padding: '2rem',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <Input
            value={textInputAnswer}
            onChange={(e) => setTextInputAnswer(e.target.value)}
            disabled={showFeedback}
            placeholder="Deine Antwort..."
            error={showFeedback && !isCorrect}
            success={showFeedback && isCorrect}
            fullWidth
            style={{
              fontSize: '1.125rem',
              padding: '1rem',
            }}
          />

          {showFeedback && !isCorrect && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: '#f3f4f6',
              borderRadius: '6px',
              fontSize: '0.95rem',
              color: '#4b5563',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <div>
                <strong>Richtige Antwort:</strong> {content.correctAnswer}
              </div>
              {isSpanishText(content.correctAnswer) && <AudioButton text={content.correctAnswer} size="small" />}
            </div>
          )}
        </div>

        {content.hint && !showFeedback && (
          <div style={{
            padding: '0.75rem 1rem',
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '6px',
            fontSize: '0.9rem',
            color: '#92400e',
          }}>
            💡 <strong>Tipp:</strong> {content.hint}
          </div>
        )}
      </div>
    );
  }

  if (!session || !currentTask) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Wird geladen...</p>
      </div>
    );
  }

  const progress = ((currentTaskIndex + 1) / session.execution.taskIds.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Header - compact */}
      <div style={{ marginBottom: '1rem', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Übungssitzung</h2>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {currentTaskIndex + 1}/{session.execution.taskIds.length}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
              ID: {currentTask.id}
            </span>
          </div>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              background: '#e5e7eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Abbrechen
          </button>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            background: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: '#3b82f6',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Question - main content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          minHeight: 0,
        }}
      >
        {(currentTask.type === 'multiple-choice' ||
          currentTask.type === 'ordering' ||
          currentTask.type === 'matching' ||
          currentTask.type === 'multiple-select' ||
          currentTask.type === 'slider' ||
          currentTask.type === 'word-scramble' ||
          currentTask.type === 'text-input') && (
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.4', flex: 1 }}>
              {(currentTask.content as any).question}
            </h3>
            {isSpanishText((currentTask.content as any).question) && (
              <AudioButton text={(currentTask.content as any).question} size="medium" />
            )}
          </div>
        )}

        {renderTaskContent()}
      </div>

      {/* Feedback - compact */}
      {showFeedback && (
        <div style={{ marginBottom: '1rem', flexShrink: 0 }}>
          <FeedbackCard
            variant={isCorrect ? 'success' : 'error'}
            title={isCorrect ? 'Richtig!' : 'Nicht ganz richtig'}
          >
            {currentTask.content.explanation && (
              <p style={{ margin: 0 }}>{currentTask.content.explanation}</p>
            )}
          </FeedbackCard>
        </div>
      )}

      {/* Actions and Statistics - combined footer */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: spacing[4] }}>
          {!showFeedback ? (
            <>
              <Button
                onClick={handleAnswerSubmit}
                disabled={!canSubmit()}
                variant="primary"
              >
                Antwort überprüfen
              </Button>
              <Button
                onClick={
                  currentTaskIndex < session.execution.taskIds.length - 1
                    ? handleSkipTask
                    : handleComplete
                }
                variant="secondary"
              >
                {currentTaskIndex < session.execution.taskIds.length - 1
                  ? 'Überspringen →'
                  : 'Sitzung beenden'}
              </Button>
            </>
          ) : (
            <Button onClick={handleNextTask} variant="primary">
              {currentTaskIndex < session.execution.taskIds.length - 1
                ? 'Nächste Aufgabe →'
                : 'Sitzung beenden'}
            </Button>
          )}
        </div>

        {/* Compact statistics */}
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#f9fafb',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-around',
            gap: '1rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {session.execution.completedCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              beantwortet
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
              {session.execution.correctCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              richtig
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {session.execution.completedCount > 0
                ? Math.round((session.execution.correctCount / session.execution.completedCount) * 100)
                : 0}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              genau
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}