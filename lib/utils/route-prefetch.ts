/**
 * Utility for aggressive route prefetching to eliminate navigation delays
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Prefetch all common routes on app load for instant navigation
 * Use this in root layout or main pages
 */
export function usePrefetchRoutes() {
  const router = useRouter();

  useEffect(() => {
    // List of all common routes that users frequently navigate to
    const routes = [
      '/learn',
      '/leaderboard',
      '/quests',
      '/shop',
      '/courses',
      '/account',
    ];

    // Prefetch all routes asynchronously
    const prefetchPromises = routes.map(route => {
      try {
        return router.prefetch(route);
      } catch (error) {
        console.warn(`Failed to prefetch ${route}:`, error);
        return Promise.resolve();
      }
    });

    // Don't wait for completion, just fire and forget
    Promise.all(prefetchPromises).catch(() => {});
  }, [router]);
}

/**
 * Prefetch a single route
 */
export function prefetchRoute(router: ReturnType<typeof useRouter>, route: string) {
  try {
    router.prefetch(route);
  } catch (error) {
    console.warn(`Failed to prefetch ${route}:`, error);
  }
}

/**
 * Prefetch lesson routes based on current progress
 * Call this when rendering lesson list
 */
export function prefetchLessonRoutes(
  router: ReturnType<typeof useRouter>,
  lessonIds: number[],
  currentLessonId?: number
) {
  // Prefetch current lesson and next 2 lessons
  const targetIds = currentLessonId 
    ? lessonIds.slice(
        lessonIds.indexOf(currentLessonId),
        lessonIds.indexOf(currentLessonId) + 3
      )
    : lessonIds.slice(0, 3);

  targetIds.forEach(id => {
    try {
      router.prefetch(`/lesson/${id}`);
    } catch (error) {
      // Ignore prefetch errors
    }
  });
}
