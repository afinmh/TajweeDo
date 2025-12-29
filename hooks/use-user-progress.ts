'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for user progress data on client side
 */
export const useUserProgress = () => {
  const [hearts, setHearts] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user-progress');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user progress');
        }

        const data = await response.json();
        setHearts(data.hearts || 0);
        setPoints(data.points || 0);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProgress();
  }, []);

  const refillHearts = async () => {
    try {
      const response = await fetch('/api/user-progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refill' }),
      });

      if (!response.ok) {
        throw new Error('Failed to refill hearts');
      }

      const data = await response.json();
      setHearts(data.hearts);
      setPoints(data.points);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const reduceHearts = async (challengeId: number) => {
    try {
      const response = await fetch('/api/user-progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reduce', challengeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reduce hearts');
      }

      const data = await response.json();
      setHearts(data.hearts);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    hearts,
    points,
    isLoading,
    error,
    refillHearts,
    reduceHearts,
    setHearts,
    setPoints,
  };
};
