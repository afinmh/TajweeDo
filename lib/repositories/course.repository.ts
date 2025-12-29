import { supabaseAdmin } from '../supabase';
import type { Course } from '../types';

/**
 * Repository for Course data access
 */
export class CourseRepository {
  /**
   * Get all courses
   */
  async findAll(): Promise<Course[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('courses')
        .select('id, title, image_src')
        .order('id', { ascending: true });

      if (error || !data) return [];

      return data.map(item => ({
        id: item.id,
        title: item.title,
        image_src: item.image_src,
      }));
    } catch (error) {
      console.error('CourseRepository.findAll error:', error);
      return [];
    }
  }

  /**
   * Find course by ID
   */
  async findById(courseId: number): Promise<Course | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('courses')
        .select('id, title, image_src, units(id, order, lessons(id, order))')
        .eq('id', courseId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        title: data.title,
        image_src: data.image_src,
        units: (data.units || []).map((unit: any) => ({
          id: unit.id,
          order: unit.order,
          title: '',
          description: '',
          courseId: data.id,
          lessons: (unit.lessons || []).map((lesson: any) => ({
            id: lesson.id,
            order: lesson.order,
            title: '',
            unitId: unit.id,
          })),
        })),
      };
    } catch (error) {
      console.error('CourseRepository.findById error:', error);
      return null;
    }
  }

  /**
   * Create new course
   */
  async create(title: string, imageSrc: string): Promise<Course | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('courses')
        .insert({ title, image_src: imageSrc })
        .select('id, title, image_src')
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        title: data.title,
        image_src: data.image_src,
      };
    } catch (error) {
      console.error('CourseRepository.create error:', error);
      return null;
    }
  }

  /**
   * Update course
   */
  async update(courseId: number, updates: Partial<Omit<Course, 'id'>>): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('courses')
        .update({
          title: updates.title,
          image_src: updates.image_src,
        })
        .eq('id', courseId);

      return !error;
    } catch (error) {
      console.error('CourseRepository.update error:', error);
      return false;
    }
  }

  /**
   * Delete course
   */
  async delete(courseId: number): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('courses')
        .delete()
        .eq('id', courseId);

      return !error;
    } catch (error) {
      console.error('CourseRepository.delete error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const courseRepository = new CourseRepository();
