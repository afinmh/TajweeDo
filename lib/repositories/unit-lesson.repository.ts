import { supabaseAdmin } from '../supabase';
import type { Unit, Lesson } from '../types';

/**
 * Repository for Unit and Lesson data access
 */
export class UnitRepository {
  /**
   * Get units by course ID with lessons
   */
  async findByCourseId(courseId: number): Promise<Unit[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('units')
        .select('id, title, description, order, course_id, lessons(id, title, order, unit_id)')
        .eq('course_id', courseId)
        .order('order', { ascending: true });

      if (error || !data) return [];

      return data.map(unit => ({
        id: unit.id,
        title: unit.title,
        description: unit.description,
        order: unit.order,
        courseId: unit.course_id,
        lessons: (unit.lessons || []).map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          order: lesson.order,
          unitId: lesson.unit_id,
        })).sort((a, b) => a.order - b.order),
      }));
    } catch (error) {
      console.error('UnitRepository.findByCourseId error:', error);
      return [];
    }
  }

  /**
   * Get first unit of a course
   */
  async findFirstByCourseId(courseId: number): Promise<Unit | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('units')
        .select('id, title, description, order, course_id')
        .eq('course_id', courseId)
        .order('order', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        order: data.order,
        courseId: data.course_id,
        lessons: [],
      };
    } catch (error) {
      console.error('UnitRepository.findFirstByCourseId error:', error);
      return null;
    }
  }
}

export class LessonRepository {
  /**
   * Find lesson by ID
   */
  async findById(lessonId: number): Promise<Lesson | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('lessons')
        .select('id, title, order, unit_id')
        .eq('id', lessonId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        title: data.title,
        order: data.order,
        unitId: data.unit_id,
      };
    } catch (error) {
      console.error('LessonRepository.findById error:', error);
      return null;
    }
  }

  /**
   * Get lessons by unit ID
   */
  async findByUnitId(unitId: number): Promise<Lesson[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('lessons')
        .select('id, title, order, unit_id')
        .eq('unit_id', unitId)
        .order('order', { ascending: true });

      if (error || !data) return [];

      return data.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        unitId: lesson.unit_id,
      }));
    } catch (error) {
      console.error('LessonRepository.findByUnitId error:', error);
      return [];
    }
  }

  /**
   * Get first lesson of a unit
   */
  async findFirstByUnitId(unitId: number): Promise<Lesson | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('lessons')
        .select('id, title, order, unit_id')
        .eq('unit_id', unitId)
        .order('order', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        title: data.title,
        order: data.order,
        unitId: data.unit_id,
      };
    } catch (error) {
      console.error('LessonRepository.findFirstByUnitId error:', error);
      return null;
    }
  }

  /**
   * Get all lessons for a course (ordered by unit and lesson order)
   */
  async findAllByCourseId(courseId: number): Promise<Lesson[]> {
    try {
      const { data: units } = await supabaseAdmin
        .from('units')
        .select('id, order, lessons(id, title, order, unit_id)')
        .eq('course_id', courseId)
        .order('order', { ascending: true });

      if (!units) return [];

      const lessons: Lesson[] = [];
      units.forEach((unit: any) => {
        const sortedLessons = (unit.lessons || [])
          .sort((a: any, b: any) => a.order - b.order)
          .map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.order,
            unitId: lesson.unit_id,
          }));
        lessons.push(...sortedLessons);
      });

      return lessons;
    } catch (error) {
      console.error('LessonRepository.findAllByCourseId error:', error);
      return [];
    }
  }
}

// Export singleton instances
export const unitRepository = new UnitRepository();
export const lessonRepository = new LessonRepository();
