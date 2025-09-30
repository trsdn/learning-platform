import React, { useState, useEffect } from 'react';
import type { Task, PracticeSession, ClozeDeletionContent, TrueFalseContent, OrderingContent, MatchingContent, MultipleSelectContent, SliderContent, WordScrambleContent } from '@core/types/services';
import { db } from '@storage/database';
import { PracticeSessionService } from '@core/services/practice-session-service';
import { SpacedRepetitionService } from '@core/services/spaced-repetition-service';
import {
  getPracticeSessionRepository,
  getTaskRepository,
  getSpacedRepetitionRepository,
} from '@storage/factory';

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

  // Initialize session
  useEffect(() => {
    initializeSession();
  }, []);

  // Load current task
  useEffect(() => {
    if (session && session.execution.taskIds.length > 0) {
      loadCurrentTask();
    }
  }, [session, currentTaskIndex]);

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

      // Apply shuffle to options
      const shuffled = indices.map(i => originalOptions[i]!);
      const newCorrectIndex = indices.indexOf(originalCorrectAnswer);

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
    onComplete();
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
              }}
            >
              {option}
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
              {i < content.blanks.length && (
                <input
                  type="text"
                  value={blankAnswers[i] || ''}
                  onChange={(e) => {
                    const newAnswers = [...blankAnswers];
                    newAnswers[i] = e.target.value;
                    setBlankAnswers(newAnswers);
                  }}
                  disabled={showFeedback}
                  style={{
                    padding: '0.25rem 0.5rem',
                    border: showFeedback
                      ? blankAnswers[i]?.trim().toLowerCase() === content.blanks[i]!.correctAnswer.toLowerCase() ||
                        content.blanks[i]!.alternatives?.map(a => a.toLowerCase()).includes(blankAnswers[i]?.trim().toLowerCase() || '')
                        ? '2px solid #86efac'
                        : blankAnswers[i]?.trim()
                        ? '2px solid #fca5a5'
                        : '2px solid #d1d5db'
                      : '2px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.95rem',
                    minWidth: '100px',
                    backgroundColor: showFeedback
                      ? blankAnswers[i]?.trim().toLowerCase() === content.blanks[i]!.correctAnswer.toLowerCase() ||
                        content.blanks[i]!.alternatives?.map(a => a.toLowerCase()).includes(blankAnswers[i]?.trim().toLowerCase() || '')
                        ? '#dcfce7'
                        : blankAnswers[i]?.trim()
                        ? '#fee2e2'
                        : '#ffffff'
                      : '#ffffff',
                  }}
                />
              )}
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
                  }}
                >
                  {pair.left}
                </div>
                <select
                  value={matchingAnswers[leftIndex] ?? ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setMatchingAnswers({ ...matchingAnswers, [leftIndex]: value });
                  }}
                  disabled={showFeedback}
                  style={{
                    padding: '0.75rem',
                    border: showFeedback
                      ? isCorrect
                        ? '2px solid #86efac'
                        : hasAnswer
                        ? '2px solid #fca5a5'
                        : '2px solid #d1d5db'
                      : '2px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: showFeedback
                      ? isCorrect
                        ? '#dcfce7'
                        : hasAnswer
                        ? '#fee2e2'
                        : '#ffffff'
                      : '#ffffff',
                  }}
                >
                  <option value="">Wähle...</option>
                  {shuffledRightColumn.map((rightIndex) => (
                    <option key={rightIndex} value={rightIndex}>
                      {content.pairs[rightIndex]!.right}
                    </option>
                  ))}
                </select>
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
              <label
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.875rem',
                  background: backgroundColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: '6px',
                  cursor: showFeedback ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleOption(index)}
                  disabled={showFeedback}
                  style={{
                    marginRight: '0.75rem',
                    width: '1.25rem',
                    height: '1.25rem',
                    cursor: showFeedback ? 'default' : 'pointer',
                  }}
                />
                <span style={{ fontSize: '0.95rem', flex: 1 }}>{option}</span>
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
              </label>
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
          <input
            type="range"
            min={content.min}
            max={content.max}
            step={step}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            disabled={showFeedback}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              outline: 'none',
              cursor: showFeedback ? 'default' : 'pointer',
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            <span>{content.min}{content.unit || ''}</span>
            <span>{content.max}{content.unit || ''}</span>
          </div>
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
          currentTask.type === 'word-scramble') && (
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', lineHeight: '1.4' }}>
            {(currentTask.content as any).question}
          </h3>
        )}

        {renderTaskContent()}
      </div>

      {/* Feedback - compact */}
      {showFeedback && (
        <div
          style={{
            background: isCorrect ? '#dcfce7' : '#fee2e2',
            border: `2px solid ${isCorrect ? '#86efac' : '#fca5a5'}`,
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            flexShrink: 0,
          }}
        >
          <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
            {isCorrect ? '✅ Richtig!' : '❌ Nicht ganz richtig'}
          </h4>
          {currentTask.content.explanation && (
            <p style={{ margin: 0, fontSize: '0.875rem' }}>{currentTask.content.explanation}</p>
          )}
        </div>
      )}

      {/* Actions and Statistics - combined footer */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Action button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {!showFeedback ? (
            <button
              onClick={handleAnswerSubmit}
              disabled={!canSubmit()}
              style={{
                padding: '0.875rem 2rem',
                background: canSubmit() ? '#3b82f6' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: canSubmit() ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                fontWeight: '500',
              }}
            >
              Antwort überprüfen
            </button>
          ) : (
            <button
              onClick={handleNextTask}
              style={{
                padding: '0.875rem 2rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
              }}
            >
              {currentTaskIndex < session.execution.taskIds.length - 1
                ? 'Nächste Aufgabe →'
                : 'Sitzung beenden'}
            </button>
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