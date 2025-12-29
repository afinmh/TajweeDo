/**
 * REFACTORED: Database queries now use Service layer
 * This file maintains backward compatibility while delegating to the new architecture
 */

import { authService } from '@/lib/services/auth.service';
import { userProgressService } from '@/lib/services/user-progress.service';
import { courseService } from '@/lib/services/course.service';
import { courseRepository } from '@/lib/repositories/course.repository';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Get current user's progress
 * @deprecated Use userProgressService.getCurrentUserProgress() instead
 */
export const getUserProgress = async () => {
  return await userProgressService.getCurrentUserProgress();
};

/**
 * Get units with lessons for a course
 * @deprecated Use courseService.getUnitsWithProgress() instead
 */
export const getUnits = async (ctx?: { userId: string; activeCourseId: number }) => {
  if (!ctx) {
    const userId = authService.getUserId();
    const userProgress = await userProgressService.getCurrentUserProgress();
    if (!userId || !userProgress?.activeCourseId) return [];
    
    return await courseService.getUnitsWithProgress(
      userProgress.activeCourseId,
      userId
    );
  }
  
  return await courseService.getUnitsWithProgress(ctx.activeCourseId, ctx.userId);
};

/**
 * Get all available courses
 * @deprecated Use courseRepository.findAll() instead
 */
export const getCourses = async () => {
  return await courseRepository.findAll();
};

/**
 * Get course by ID
 * @deprecated Use courseRepository.findById() instead
 */
export const getCourseById = async (courseId: number) => {
  return await courseRepository.findById(courseId);
};

/**
 * Get course progress (active lesson)
 * @deprecated Use courseService.getCourseProgress() instead
 */
export const getCourseProgress = async (ctx?: { userId: string; activeCourseId: number }) => {
  if (!ctx) {
    const userId = authService.getUserId();
    const userProgress = await userProgressService.getCurrentUserProgress();
    if (!userId || !userProgress?.activeCourseId) return null;
    
    return await courseService.getCourseProgress(
      userProgress.activeCourseId,
      userId
    );
  }
  
  return await courseService.getCourseProgress(ctx.activeCourseId, ctx.userId);
};

/**
 * Get lesson with challenges
 * For lessons 1-23, uses curated challenge mapping
 */
export const getLesson = async (id?: number, ctx?: Partial<{ userId: string; activeCourseId: number }>) => {
  const userId = ctx?.userId ?? authService.getUserId();
  const activeCourseId = ctx?.activeCourseId ?? (await getUserProgress())?.activeCourseId;
  if (!userId) return null as any;

  let lessonId = id;
  if (!lessonId) {
    if (!activeCourseId) return null as any;
    const firstLesson = await courseService.getFirstLesson(activeCourseId);
    lessonId = firstLesson?.id;
  }
  if (!lessonId) return null as any;

  // Load lesson core
  const { data: lesson, error: lErr } = await supabaseAdmin
    .from('lessons')
    .select('id, title, unit_id, order')
    .eq('id', lessonId)
    .maybeSingle();
  if (lErr || !lesson) return null as any;

  // Curated challenge mapping for specific lessons
  let challenges: any[] | null = null;
  let composedFromPool = false;

  const curatedMap: Record<number, number[]> = {
    1: [1001, 1002, 1003, 1004, 1005, 1006],
    2: [1001, 1002, 1005, 1006, 1007, 1008],
    3: [1001, 1002, 1007, 1008, 1009, 1010],
    4: [1001, 1008, 1009, 1010, 1011, 1012],
    5: [1002, 1011, 1012, 1013, 1014, 1015],
    6: [1101, 1102, 1103, 1104, 1105, 1106],
    7: [1101, 1102, 1105, 1106, 1107, 1108],
    8: [1101, 1102, 1107, 1108, 1109, 1110],
    9: [1101, 1108, 1109, 1110, 1111, 1112],
    10: [1102, 1111, 1112, 1113, 1114, 1115],
    11: [1201, 1202, 1203, 1204, 1205, 1206],
    12: [1201, 1202, 1205, 1206, 1207, 1208],
    13: [1201, 1202, 1207, 1208, 1209, 1210],
    14: [1201, 1208, 1209, 1210, 1211, 1212],
    15: [1301, 1302, 1303, 1304, 1305, 1306],
    16: [1301, 1302, 1305, 1306, 1307, 1308],
    17: [1301, 1302, 1307, 1308, 1309, 1310],
    18: [1301, 1308, 1309, 1310, 1311, 1312],
    19: [1401, 1402, 1403, 1404, 1405, 1406],
    20: [1401, 1402, 1405, 1406, 1407, 1408],
    21: [1401, 1402, 1407, 1408, 1409, 1410],
    22: [1401, 1408, 1409, 1410, 1411, 1412],
    23: [1402, 1411, 1412, 1413, 1414, 1415],
  };

  if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].includes(lesson.id)) {
    const ids = curatedMap[lesson.id] || [];
    const { data: base } = await supabaseAdmin
      .from('challenges')
      .select('id, type, question, order, challenge_options(id, text, correct, image_src, audio_src)')
      .in('id', ids);
    challenges = (base || []).sort((a: any, b: any) => ids.indexOf(a.id) - ids.indexOf(b.id));
    composedFromPool = true;
  } else {
    const res = await supabaseAdmin
      .from('challenges')
      .select('id, type, question, order, challenge_options(id, text, correct, image_src, audio_src)')
      .eq('lesson_id', lesson.id)
      .order('order', { ascending: true });
    challenges = res.data || [];
  }

  const ids = (challenges || []).map((c: any) => c.id);
  let completedMap = new Map<number, boolean>();
  if (ids.length) {
    const { data: lprog } = await supabaseAdmin
      .from('lesson_progress' as any)
      .select('lesson_id, completed')
      .eq('user_id', userId)
      .eq('lesson_id', lesson.id);
    if (!(lprog && lprog.length)) {
      const { data: prog } = await supabaseAdmin
        .from('challenge_progress')
        .select('challenge_id, completed')
        .eq('user_id', userId)
        .in('challenge_id', ids);
      (prog || []).forEach((p: any) => completedMap.set(p.challenge_id, !!p.completed));
    }
  }

  return {
    id: lesson.id,
    title: lesson.title,
    challenges: (challenges || []).map((c: any) => ({
      id: c.id,
      type: c.type,
      question: c.question,
      order: c.order,
      completed: composedFromPool ? false : (completedMap.get(c.id) || false),
      challengeOptions: (c.challenge_options || []).map((o: any) => ({
        id: o.id,
        text: o.text,
        correct: o.correct,
        imageSrc: o.image_src ?? null,
        audioSrc: o.audio_src ?? null,
      })),
    })),
  } as any;
};

/**
 * Check if lesson is completed
 */
export const isLessonCompleted = async (lessonId: number) => {
  const userId = authService.getUserId();
  if (!userId) return false;
  
  const { data: lprog, error } = await supabaseAdmin
    .from('lesson_progress' as any)
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  
  if (!error && lprog) return !!lprog.completed;
  
  // Fallback to challenge progress
  const { data: chals } = await supabaseAdmin
    .from('challenges')
    .select('id')
    .eq('lesson_id', lessonId);
  const ids = (chals || []).map((c: any) => c.id);
  if (!ids.length) return false;
  
  const { data: prog } = await supabaseAdmin
    .from('challenge_progress')
    .select('challenge_id, completed')
    .in('challenge_id', ids);
  
  return (prog || []).filter((p: any) => !!p.completed).length === ids.length;
};

/**
 * Get lesson completion percentage
 * @deprecated Use courseService.getLessonPercentage() instead
 */
export const getLessonPercentage = async () => {
  return await courseService.getLessonPercentage();
};

/**
 * Get top 10 users by XP
 * @deprecated Use userProgressService.getLeaderboard() instead
 */
export const getTopTenUsers = async () => {
  const users = await userProgressService.getLeaderboard(10);
  return users.map(user => ({
    userId: user.userId,
    userName: user.userName,
    userImageSrc: user.userImageSrc,
    xp: user.xp,
  }));
};
