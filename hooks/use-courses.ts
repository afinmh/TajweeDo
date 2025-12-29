'use client';

import { useState, useEffect, useCallback } from 'react';

interface CourseData {
  id: number;
  title: string;
  imageSrc: string;
}

/**
 * Custom hook for fetching and managing courses
 */
export const useCourses = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/courses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const selectCourse = useCallback(async (courseId: number) => {
    try {
      const response = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        throw new Error('Failed to select course');
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    courses,
    isLoading,
    error,
    refetch: fetchCourses,
    selectCourse,
  };
};
