'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface LessonState {
  isLoading: boolean;
  error: string | null;
  currentChallengeIndex: number;
  hearts: number;
  percentage: number;
}

/**
 * Custom hook for lesson progression logic
 */
export const useLesson = (lessonId: number, initialHearts: number = 5) => {
  const router = useRouter();
  const [state, setState] = useState<LessonState>({
    isLoading: false,
    error: null,
    currentChallengeIndex: 0,
    hearts: initialHearts,
    percentage: 0,
  });

  const nextChallenge = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentChallengeIndex: prev.currentChallengeIndex + 1,
    }));
  }, []);

  const previousChallenge = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentChallengeIndex: Math.max(0, prev.currentChallengeIndex - 1),
    }));
  }, []);

  const reduceHeart = useCallback(() => {
    setState(prev => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1),
    }));
  }, []);

  const updatePercentage = useCallback((completed: number, total: number) => {
    const newPercentage = Math.round((completed / total) * 100);
    setState(prev => ({
      ...prev,
      percentage: newPercentage,
    }));
  }, []);

  const completeChallenge = useCallback(async (challengeId: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, action: 'complete' }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete challenge');
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Unknown error',
      }));
      return { success: false, error: err.message };
    }
  }, []);

  const completeLesson = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, action: 'complete' }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete lesson');
      }

      setState(prev => ({ ...prev, isLoading: false }));
      
      // Redirect to learn page
      router.push('/learn');
      
      return { success: true };
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Unknown error',
      }));
      return { success: false, error: err.message };
    }
  }, [lessonId, router]);

  const resetLesson = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      currentChallengeIndex: 0,
      hearts: initialHearts,
      percentage: 0,
    });
  }, [initialHearts]);

  return {
    ...state,
    nextChallenge,
    previousChallenge,
    reduceHeart,
    updatePercentage,
    completeChallenge,
    completeLesson,
    resetLesson,
  };
};
