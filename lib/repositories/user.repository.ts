import { supabaseAdmin } from '../supabase';
import type { User } from '../types';

/**
 * Repository pattern for User data access
 * Handles all database operations related to users
 */
export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, email, name, image_src')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        imageSrc: data.image_src || undefined,
      };
    } catch (error) {
      console.error('UserRepository.findById error:', error);
      return null;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, email, name, image_src')
        .eq('email', email)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        imageSrc: data.image_src || undefined,
      };
    } catch (error) {
      console.error('UserRepository.findByEmail error:', error);
      return null;
    }
  }

  /**
   * Create new user
   */
  async create(user: Omit<User, 'id'>): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          email: user.email,
          name: user.name || null,
          image_src: user.imageSrc || null,
        })
        .select('id, email, name, image_src')
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        imageSrc: data.image_src || undefined,
      };
    } catch (error) {
      console.error('UserRepository.create error:', error);
      return null;
    }
  }

  /**
   * Update user
   */
  async update(userId: string, updates: Partial<Omit<User, 'id' | 'email'>>): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          name: updates.name || null,
          image_src: updates.imageSrc || null,
        })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('UserRepository.update error:', error);
      return false;
    }
  }

  /**
   * Delete user
   */
  async delete(userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('UserRepository.delete error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
