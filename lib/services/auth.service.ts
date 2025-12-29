import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

/**
 * Authentication Service
 * Handles JWT token operations and user authentication
 */
export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET as string;

  /**
   * Get current user ID from JWT token in cookies
   */
  getUserId(): string | null {
    try {
      const token = cookies().get('token')?.value;
      if (!token) return null;

      const payload: any = jwt.verify(token, this.JWT_SECRET);
      return (payload?.userId as string) || null;
    } catch (error) {
      console.error('AuthService.getUserId error:', error);
      return null;
    }
  }

  /**
   * Verify token and get payload
   */
  verifyToken(token: string): any | null {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      console.error('AuthService.verifyToken error:', error);
      return null;
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(userId: string, expiresIn: string = '7d'): string {
    return jwt.sign({ userId }, this.JWT_SECRET, { expiresIn });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getUserId() !== null;
  }

  /**
   * Require authentication - throws if not authenticated
   */
  requireAuth(): string {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('Unauthorized');
    }
    return userId;
  }
}

// Export singleton instance
export const authService = new AuthService();
