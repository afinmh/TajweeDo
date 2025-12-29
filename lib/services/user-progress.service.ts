import { userProgressRepository } from '../repositories/user-progress.repository';
import { courseRepository } from '../repositories/course.repository';
import { authService } from './auth.service';
import type { UserProgress, ServiceResponse } from '../types';
import { POINTS_TO_REFILL } from '@/constants';

/**
 * User Progress Service
 * Handles business logic for user progress operations
 */
export class UserProgressService {
  /**
   * Get current user's progress
   */
  async getCurrentUserProgress(): Promise<UserProgress | null> {
    const userId = authService.getUserId();
    if (!userId) return null;

    return await userProgressRepository.findByUserId(userId);
  }

  /**
   * Get user progress by user ID
   */
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    return await userProgressRepository.findByUserId(userId);
  }

  /**
   * Update or create user progress with new course
   */
  async upsertUserProgress(courseId: number): Promise<ServiceResponse<UserProgress>> {
    try {
      const userId = authService.requireAuth();

      // Validate course exists
      const course = await courseRepository.findById(courseId);
      if (!course) {
        return { success: false, error: 'Course not found' };
      }

      // Check if course has content
      if (!course.units?.length || !course.units[0].lessons?.length) {
        return { success: false, error: 'Course is empty' };
      }

      // Check if user progress exists
      const exists = await userProgressRepository.exists(userId);

      if (exists) {
        // Update existing
        const success = await userProgressRepository.updateActiveCourse(userId, courseId);
        if (!success) {
          return { success: false, error: 'Failed to update user progress' };
        }
      } else {
        // Create new
        const success = await userProgressRepository.create(userId, courseId);
        if (!success) {
          return { success: false, error: 'Failed to create user progress' };
        }
      }

      const userProgress = await userProgressRepository.findByUserId(userId);
      if (!userProgress) {
        return { success: false, error: 'Failed to load user progress' };
      }

      return { success: true, data: userProgress };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Reduce hearts (when user makes a mistake)
   */
  async reduceHearts(challengeId: number): Promise<ServiceResponse<{ hearts: number }>> {
    try {
      const userId = authService.requireAuth();

      const userProgress = await userProgressRepository.findByUserId(userId);
      if (!userProgress) {
        return { success: false, error: 'User progress not found' };
      }

      // Can't reduce below 0
      if (userProgress.hearts === 0) {
        return { success: false, error: 'No hearts remaining' };
      }

      const newHearts = Math.max(0, userProgress.hearts - 1);
      const success = await userProgressRepository.updateHearts(userId, newHearts);

      if (!success) {
        return { success: false, error: 'Failed to update hearts' };
      }

      return { success: true, data: { hearts: newHearts } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Refill hearts using points
   */
  async refillHearts(): Promise<ServiceResponse<{ hearts: number; points: number }>> {
    try {
      const userId = authService.requireAuth();

      const userProgress = await userProgressRepository.findByUserId(userId);
      if (!userProgress) {
        return { success: false, error: 'User progress not found' };
      }

      // Check if already at max hearts
      if (userProgress.hearts === 5) {
        return { success: false, error: 'Hearts are already full' };
      }

      // Check if user has enough points
      if (userProgress.points < POINTS_TO_REFILL) {
        return { success: false, error: 'Not enough points' };
      }

      // Deduct points and refill hearts
      const heartsSuccess = await userProgressRepository.updateHearts(userId, 5);
      const pointsSuccess = await userProgressRepository.deductPoints(userId, POINTS_TO_REFILL);

      if (!heartsSuccess || !pointsSuccess) {
        return { success: false, error: 'Failed to refill hearts' };
      }

      const newPoints = userProgress.points - POINTS_TO_REFILL;

      return {
        success: true,
        data: { hearts: 5, points: newPoints },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Add points to user
   */
  async addPoints(points: number): Promise<ServiceResponse<{ points: number }>> {
    try {
      const userId = authService.requireAuth();

      const success = await userProgressRepository.addPoints(userId, points);
      if (!success) {
        return { success: false, error: 'Failed to add points' };
      }

      const userProgress = await userProgressRepository.findByUserId(userId);
      return {
        success: true,
        data: { points: userProgress?.points || 0 },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Add XP to user
   */
  async addXP(xp: number): Promise<ServiceResponse<{ xp: number }>> {
    try {
      const userId = authService.requireAuth();

      const userProgress = await userProgressRepository.findByUserId(userId);
      if (!userProgress) {
        return { success: false, error: 'User progress not found' };
      }

      const newXP = userProgress.xp + xp;
      const success = await userProgressRepository.updateXP(userId, newXP);

      if (!success) {
        return { success: false, error: 'Failed to update XP' };
      }

      return { success: true, data: { xp: newXP } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<UserProgress[]> {
    return await userProgressRepository.getTopUsers(limit);
  }
}

// Export singleton instance
export const userProgressService = new UserProgressService();
