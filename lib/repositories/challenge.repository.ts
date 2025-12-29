import { supabaseAdmin } from '../supabase';
import type { Challenge, ChallengeOption } from '../types';

/**
 * Repository for Challenge data access
 */
export class ChallengeRepository {
  /**
   * Find challenges by lesson ID
   */
  async findByLessonId(lessonId: number): Promise<Challenge[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('challenges')
        .select('id, lesson_id, type, question, order, challengeOptions:challenge_options(*)')
        .eq('lesson_id', lessonId)
        .order('order', { ascending: true });

      if (error || !data) return [];

      return data.map(challenge => ({
        id: challenge.id,
        lessonId: challenge.lesson_id,
        type: challenge.type as any,
        question: challenge.question,
        order: challenge.order,
        challengeOptions: (challenge.challengeOptions || []).map((opt: any) => ({
          id: opt.id,
          challengeId: opt.challenge_id,
          text: opt.text,
          correct: opt.correct,
          imageSrc: opt.image_src || undefined,
          audioSrc: opt.audio_src || undefined,
        })),
      }));
    } catch (error) {
      console.error('ChallengeRepository.findByLessonId error:', error);
      return [];
    }
  }

  /**
   * Find challenge by ID
   */
  async findById(challengeId: number): Promise<Challenge | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('challenges')
        .select('id, lesson_id, type, question, order')
        .eq('id', challengeId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        lessonId: data.lesson_id,
        type: data.type as any,
        question: data.question,
        order: data.order,
      };
    } catch (error) {
      console.error('ChallengeRepository.findById error:', error);
      return null;
    }
  }

  /**
   * Get challenge IDs by lesson IDs
   */
  async findIdsByLessonIds(lessonIds: number[]): Promise<Map<number, number[]>> {
    try {
      if (lessonIds.length === 0) return new Map();

      const { data, error } = await supabaseAdmin
        .from('challenges')
        .select('id, lesson_id')
        .in('lesson_id', lessonIds);

      if (error || !data) return new Map();

      const map = new Map<number, number[]>();
      data.forEach((challenge: any) => {
        const existing = map.get(challenge.lesson_id) || [];
        map.set(challenge.lesson_id, [...existing, challenge.id]);
      });

      return map;
    } catch (error) {
      console.error('ChallengeRepository.findIdsByLessonIds error:', error);
      return new Map();
    }
  }
}

/**
 * Repository for ChallengeProgress data access
 */
export class ChallengeProgressRepository {
  /**
   * Find completed challenges for a user
   */
  async findCompletedByUser(userId: string, challengeIds: number[]): Promise<Set<number>> {
    try {
      if (challengeIds.length === 0) return new Set();

      const { data, error } = await supabaseAdmin
        .from('challenge_progress')
        .select('challenge_id, completed')
        .eq('user_id', userId)
        .in('challenge_id', challengeIds);

      if (error || !data) return new Set();

      return new Set(
        data
          .filter((item: any) => item.completed)
          .map((item: any) => item.challenge_id)
      );
    } catch (error) {
      console.error('ChallengeProgressRepository.findCompletedByUser error:', error);
      return new Set();
    }
  }

  /**
   * Mark challenge as completed
   */
  async markCompleted(userId: string, challengeId: number): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('challenge_progress')
        .upsert({
          user_id: userId,
          challenge_id: challengeId,
          completed: true,
        });

      return !error;
    } catch (error) {
      console.error('ChallengeProgressRepository.markCompleted error:', error);
      return false;
    }
  }
}

/**
 * Repository for LessonProgress data access
 */
export class LessonProgressRepository {
  /**
   * Find completed lessons for a user
   */
  async findCompletedByUser(userId: string, lessonIds: number[]): Promise<Map<number, boolean>> {
    try {
      if (lessonIds.length === 0) return new Map();

      const { data, error } = await supabaseAdmin
        .from('lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds);

      if (error || !data) return new Map();

      const map = new Map<number, boolean>();
      data.forEach((item: any) => {
        map.set(item.lesson_id, !!item.completed);
      });

      return map;
    } catch (error) {
      console.error('LessonProgressRepository.findCompletedByUser error:', error);
      return new Map();
    }
  }

  /**
   * Mark lesson as completed
   */
  async markCompleted(userId: string, lessonId: number): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
        });

      return !error;
    } catch (error) {
      console.error('LessonProgressRepository.markCompleted error:', error);
      return false;
    }
  }

  /**
   * Check if lesson is completed
   */
  async isCompleted(userId: string, lessonId: number): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('lesson_progress')
        .select('completed')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      return !error && !!data?.completed;
    } catch (error) {
      console.error('LessonProgressRepository.isCompleted error:', error);
      return false;
    }
  }
}

// Export singleton instances
export const challengeRepository = new ChallengeRepository();
export const challengeProgressRepository = new ChallengeProgressRepository();
export const lessonProgressRepository = new LessonProgressRepository();
