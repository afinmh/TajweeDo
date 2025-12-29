import { unitRepository, lessonRepository } from '../repositories/unit-lesson.repository';
import { challengeRepository, challengeProgressRepository, lessonProgressRepository } from '../repositories/challenge.repository';
import { userProgressRepository } from '../repositories/user-progress.repository';
import { authService } from './auth.service';
import type { Unit, Lesson, CourseProgress, ServiceResponse } from '../types';

/**
 * Course Service
 * Handles business logic for course, unit, and lesson operations
 */
export class CourseService {
  /**
   * Get units with lessons and completion status for a course
   */
  async getUnitsWithProgress(courseId: number, userId?: string): Promise<Unit[]> {
    const currentUserId = userId || authService.getUserId();
    if (!currentUserId) return [];

    // Get units with lessons
    const units = await unitRepository.findByCourseId(courseId);
    if (!units.length) return [];

    // Get all lesson IDs
    const allLessonIds = units.flatMap(u => u.lessons.map(l => l.id));
    if (!allLessonIds.length) return units;

    // Get completion status - try lesson_progress first
    let completedMap = await lessonProgressRepository.findCompletedByUser(currentUserId, allLessonIds);

    // If no lesson progress, fallback to challenge progress aggregation
    if (completedMap.size === 0) {
      completedMap = await this.getCompletionFromChallenges(currentUserId, allLessonIds);
    }

    // Map completion status to lessons
    return units.map(unit => ({
      ...unit,
      lessons: unit.lessons.map(lesson => ({
        ...lesson,
        completed: completedMap.get(lesson.id) || false,
      })),
    }));
  }

  /**
   * Get completion status from challenge progress (fallback method)
   */
  private async getCompletionFromChallenges(userId: string, lessonIds: number[]): Promise<Map<number, boolean>> {
    const challengesByLesson = await challengeRepository.findIdsByLessonIds(lessonIds);
    const allChallengeIds = Array.from(challengesByLesson.values()).flat();

    if (!allChallengeIds.length) return new Map();

    const completedChallenges = await challengeProgressRepository.findCompletedByUser(userId, allChallengeIds);

    const completionMap = new Map<number, boolean>();
    lessonIds.forEach(lessonId => {
      const challengeIds = challengesByLesson.get(lessonId) || [];
      const allCompleted = challengeIds.length > 0 && challengeIds.every(cid => completedChallenges.has(cid));
      completionMap.set(lessonId, allCompleted);
    });

    return completionMap;
  }

  /**
   * Get course progress (active lesson)
   */
  async getCourseProgress(courseId: number, userId?: string): Promise<CourseProgress | null> {
    const currentUserId = userId || authService.getUserId();
    if (!currentUserId) return null;

    // Get all lessons for the course in order
    const lessons = await lessonRepository.findAllByCourseId(courseId);
    if (!lessons.length) return null;

    const lessonIds = lessons.map(l => l.id);

    // Get completion status
    let completedMap = await lessonProgressRepository.findCompletedByUser(currentUserId, lessonIds);

    // Fallback to challenge progress if needed
    if (completedMap.size === 0) {
      completedMap = await this.getCompletionFromChallenges(currentUserId, lessonIds);
    }

    // Find first uncompleted lesson, or return first lesson
    const activeLesson = lessons.find(l => !completedMap.get(l.id)) || lessons[0];

    return {
      activeLesson: activeLesson || null,
    };
  }

  /**
   * Get lesson with challenges
   */
  async getLesson(lessonId: number): Promise<Lesson | null> {
    const userId = authService.getUserId();
    if (!userId) return null;

    const lesson = await lessonRepository.findById(lessonId);
    if (!lesson) return null;

    // Get challenges for this lesson
    const challenges = await challengeRepository.findByLessonId(lessonId);

    // Get completion status for challenges
    const challengeIds = challenges.map(c => c.id);
    const completedChallenges = await challengeProgressRepository.findCompletedByUser(userId, challengeIds);

    return {
      ...lesson,
      challenges: challenges.map(c => ({
        ...c,
        completed: completedChallenges.has(c.id),
      })),
    };
  }

  /**
   * Get first lesson of a course
   */
  async getFirstLesson(courseId: number): Promise<Lesson | null> {
    const firstUnit = await unitRepository.findFirstByCourseId(courseId);
    if (!firstUnit) return null;

    return await lessonRepository.findFirstByUnitId(firstUnit.id);
  }

  /**
   * Get lesson percentage complete
   */
  async getLessonPercentage(lessonId?: number): Promise<number> {
    const userId = authService.getUserId();
    if (!userId) return 0;

    if (!lessonId) {
      // Get active course lesson
      const userProgress = await userProgressRepository.findByUserId(userId);
      if (!userProgress?.activeCourseId) return 0;

      const courseProgress = await this.getCourseProgress(userProgress.activeCourseId, userId);
      lessonId = courseProgress?.activeLesson?.id;
    }

    if (!lessonId) return 0;

    // Get all challenges for the lesson
    const challenges = await challengeRepository.findByLessonId(lessonId);
    if (!challenges.length) return 0;

    // Get completed challenges
    const challengeIds = challenges.map(c => c.id);
    const completedChallenges = await challengeProgressRepository.findCompletedByUser(userId, challengeIds);

    return Math.round((completedChallenges.size / challenges.length) * 100);
  }

  /**
   * Complete a lesson
   */
  async completeLesson(lessonId: number): Promise<ServiceResponse<{ completed: boolean }>> {
    try {
      const userId = authService.requireAuth();

      const success = await lessonProgressRepository.markCompleted(userId, lessonId);
      if (!success) {
        return { success: false, error: 'Failed to mark lesson as completed' };
      }

      return { success: true, data: { completed: true } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }
}

// Export singleton instance
export const courseService = new CourseService();
