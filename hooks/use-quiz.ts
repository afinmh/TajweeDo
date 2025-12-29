'use client';

import { useState, useCallback } from 'react';

/**
 * Custom hook for managing quiz state and answers
 */
export const useQuiz = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const selectOption = useCallback((optionId: number) => {
    if (showAnswer) return; // Can't change after revealing answer
    setSelectedOption(optionId);
  }, [showAnswer]);

  const checkAnswer = useCallback((correctOptionId: number) => {
    if (selectedOption === null) return false;
    
    const correct = selectedOption === correctOptionId;
    setIsCorrect(correct);
    setShowAnswer(true);
    
    return correct;
  }, [selectedOption]);

  const continueToNext = useCallback(() => {
    // Reset state for next question
    setSelectedOption(null);
    setShowAnswer(false);
    setIsCorrect(null);
  }, []);

  const reset = useCallback(() => {
    setSelectedOption(null);
    setShowAnswer(false);
    setIsCorrect(null);
  }, []);

  return {
    selectedOption,
    showAnswer,
    isCorrect,
    selectOption,
    checkAnswer,
    continueToNext,
    reset,
  };
};
