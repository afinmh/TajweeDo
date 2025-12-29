import { challengeProgressRepository } from '../repositories/challenge.repository';
import { authService } from './auth.service';
import type { ServiceResponse } from '../types';

/**
 * Challenge Service
 * Handles business logic for challenge operations
 */
export class ChallengeService {
  /**
   * Complete a challenge
   */
  async completeChallenge(challengeId: number): Promise<ServiceResponse<{ completed: boolean }>> {
    try {
      const userId = authService.requireAuth();

      const success = await challengeProgressRepository.markCompleted(userId, challengeId);
      if (!success) {
        return { success: false, error: 'Failed to mark challenge as completed' };
      }

      return { success: true, data: { completed: true } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Calculate XP for completing a challenge
   */
  calculateChallengeXP(challengeType: string): number {
    // Base XP per challenge type
    const xpMap: Record<string, number> = {
      SELECT: 10,
      ASSIST: 15,
      SOUND: 20,
    };

    return xpMap[challengeType] || 10;
  }

  /**
   * Calculate points for completing a challenge
   */
  calculateChallengePoints(challengeType: string, isCorrect: boolean): number {
    if (!isCorrect) return 0;

    const pointsMap: Record<string, number> = {
      SELECT: 10,
      ASSIST: 15,
      SOUND: 20,
    };

    return pointsMap[challengeType] || 10;
  }
}

// Export singleton instance
export const challengeService = new ChallengeService();
