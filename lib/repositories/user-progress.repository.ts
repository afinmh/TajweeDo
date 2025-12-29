import { supabaseAdmin } from '../supabase';
import type { UserProgress, Course } from '../types';

/**
 * Repository for UserProgress data access
 */
export class UserProgressRepository {
  /**
   * Find user progress by user ID
   */
  async findByUserId(userId: string): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_progress')
        .select('user_id, user_name, user_image_src, active_course_id, hearts, points, xp, active_course:courses(*)')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        userId: data.user_id,
        userName: data.user_name,
        userImageSrc: data.user_image_src,
        activeCourseId: data.active_course_id,
        hearts: data.hearts,
        points: data.points,
        xp: (data as any).xp ?? 0,
        activeCourse: data.active_course ? {
          id: (data.active_course as any).id,
          title: (data.active_course as any).title,
          image_src: (data.active_course as any).image_src,
        } : null,
      };
    } catch (error) {
      console.error('UserProgressRepository.findByUserId error:', error);
      return null;
    }
  }

  /**
   * Check if user progress exists
   */
  async exists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_progress')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      return !error && !!data;
    } catch (error) {
      console.error('UserProgressRepository.exists error:', error);
      return false;
    }
  }

  /**
   * Create user progress
   */
  async create(userId: string, courseId: number, userName?: string, userImageSrc?: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('user_progress')
        .insert({
          user_id: userId,
          active_course_id: courseId,
          user_name: userName || null,
          user_image_src: userImageSrc || null,
          hearts: 5,
          points: 0,
          xp: 0,
        });

      return !error;
    } catch (error) {
      console.error('UserProgressRepository.create error:', error);
      return false;
    }
  }

  /**
   * Update active course
   */
  async updateActiveCourse(userId: string, courseId: number): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('user_progress')
        .update({ active_course_id: courseId })
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('UserProgressRepository.updateActiveCourse error:', error);
      return false;
    }
  }

  /**
   * Update hearts
   */
  async updateHearts(userId: string, hearts: number): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('user_progress')
        .update({ hearts })
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('UserProgressRepository.updateHearts error:', error);
      return false;
    }
  }

  /**
   * Update points
   */
  async updatePoints(userId: string, points: number): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('user_progress')
        .update({ points })
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('UserProgressRepository.updatePoints error:', error);
      return false;
    }
  }

  /**
   * Update XP
   */
  async updateXP(userId: string, xp: number): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('user_progress')
        .update({ xp })
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('UserProgressRepository.updateXP error:', error);
      return false;
    }
  }

  /**
   * Add points to user
   */
  async addPoints(userId: string, pointsToAdd: number): Promise<boolean> {
    try {
      const current = await this.findByUserId(userId);
      if (!current) return false;

      return await this.updatePoints(userId, current.points + pointsToAdd);
    } catch (error) {
      console.error('UserProgressRepository.addPoints error:', error);
      return false;
    }
  }

  /**
   * Deduct points from user
   */
  async deductPoints(userId: string, pointsToDeduct: number): Promise<boolean> {
    try {
      const current = await this.findByUserId(userId);
      if (!current) return false;

      const newPoints = Math.max(0, current.points - pointsToDeduct);
      return await this.updatePoints(userId, newPoints);
    } catch (error) {
      console.error('UserProgressRepository.deductPoints error:', error);
      return false;
    }
  }

  /**
   * Get top users by XP (leaderboard)
   */
  async getTopUsers(limit: number = 10): Promise<UserProgress[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_progress')
        .select('user_id, user_name, user_image_src, active_course_id, hearts, points, xp')
        .order('xp', { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      return data.map(item => ({
        userId: item.user_id,
        userName: item.user_name,
        userImageSrc: item.user_image_src,
        activeCourseId: item.active_course_id,
        hearts: item.hearts,
        points: item.points,
        xp: item.xp ?? 0,
        activeCourse: null,
      }));
    } catch (error) {
      console.error('UserProgressRepository.getTopUsers error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const userProgressRepository = new UserProgressRepository();
