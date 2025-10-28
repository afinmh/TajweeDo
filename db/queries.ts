import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const getUserId = (): string | null => {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return null;
    const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);
    return (payload?.userId as string) || null;
  } catch {
    return null;
  }
};

export const getUserProgress = async () => {
  const userId = getUserId();
  if (!userId) return null;

  const { data, error } = await supabaseAdmin
    .from('user_progress')
    .select('user_id, user_name, user_image_src, active_course_id, hearts, points, active_course:courses(*)')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return null;
  if (!data) return null;
  return {
    userId: data.user_id,
    userName: data.user_name,
    userImageSrc: data.user_image_src,
    activeCourseId: data.active_course_id,
    hearts: data.hearts,
    points: data.points,
    activeCourse: data.active_course || null,
  } as any;
};

export const getUnits = async () => {
  const userId = getUserId();
  const progress = await getUserProgress();
  if (!userId || !progress?.activeCourseId) return [] as any[];

  const { data, error } = await supabaseAdmin
    .from('units')
    .select('id, title, description, order, lessons(id, title, order)')
    .eq('course_id', progress.activeCourseId)
    .order('order', { ascending: true });
  if (error || !data) return [];
  // Prefer lesson_progress; fallback to challenge_progress if not available
  const allLessons = data.flatMap((u: any) => u.lessons || []);
  const lessonIds: number[] = allLessons.map((l: any) => l.id);

  let completedMap = new Map<number, boolean>();
  if (lessonIds.length) {
    // Try lesson_progress table first
    const { data: lprog, error: lpErr } = await supabaseAdmin
      .from('lesson_progress' as any)
      .select('lesson_id, completed')
      .eq('user_id', userId)
      .in('lesson_id', lessonIds);
    if (!lpErr && lprog) {
      (lprog || []).forEach((p: any) => completedMap.set(p.lesson_id, !!p.completed));
    }

    if (completedMap.size === 0) {
      // Fallback to challenge_progress aggregation
      const { data: chals } = await supabaseAdmin
        .from('challenges')
        .select('id, lesson_id')
        .in('lesson_id', lessonIds);
      const byLesson = new Map<number, number[]>();
      (chals || []).forEach((c: any) => {
        byLesson.set(c.lesson_id, [...(byLesson.get(c.lesson_id) || []), c.id]);
      });
      const allChallengeIds = (chals || []).map((c: any) => c.id);
      const { data: prog } = allChallengeIds.length
        ? await supabaseAdmin
            .from('challenge_progress')
            .select('challenge_id, completed')
            .eq('user_id', userId)
            .in('challenge_id', allChallengeIds)
        : { data: [] as any[] } as any;
      const completedSet = new Set<number>((prog || []).filter((p: any) => !!p.completed).map((p: any) => p.challenge_id));
      lessonIds.forEach((lid) => {
        const cids = byLesson.get(lid) || [];
        const done = cids.length > 0 && cids.every((cid) => completedSet.has(cid));
        completedMap.set(lid, done);
      });
    }
  }

  return data.map((u: any) => ({
    ...u,
    lessons: (u.lessons || []).map((l: any) => ({ ...l, completed: completedMap.get(l.id) || false })),
  }));
};

export const getCourses = async () => {
  const { data } = await supabaseAdmin.from('courses').select('id, title, image_src');
  return (data || []).map((c: any) => ({ id: c.id, title: c.title, imageSrc: c.image_src }));
};

export const getCourseById = async (courseId: number) => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('id, title, image_src, units(id, order, lessons(id, order))')
    .eq('id', courseId)
    .maybeSingle();
  if (error) return null;
  return data as any;
};

export const getCourseProgress = async () => {
  const userId = getUserId();
  const progress = await getUserProgress();
  if (!userId || !progress?.activeCourseId) return null as any;
  // Load units and lessons
  const { data: units } = await supabaseAdmin
    .from('units')
    .select('id, order, lessons(id, order)')
    .eq('course_id', progress.activeCourseId)
    .order('order', { ascending: true });
  const lessons = (units || [])
    .flatMap((u: any) => (u.lessons || []))
    .sort((a: any, b: any) => a.order - b.order);

  // Determine which lessons are completed, prefer lesson_progress
  const lessonIds: number[] = lessons.map((l: any) => l.id);
  let completedMap = new Map<number, boolean>();
  if (lessonIds.length) {
    const { data: lprog, error: lpErr } = await supabaseAdmin
      .from('lesson_progress' as any)
      .select('lesson_id, completed')
      .eq('user_id', userId)
      .in('lesson_id', lessonIds);
    if (!lpErr && lprog) {
      (lprog || []).forEach((p: any) => completedMap.set(p.lesson_id, !!p.completed));
    }
    if (completedMap.size === 0) {
      const { data: chals } = await supabaseAdmin
        .from('challenges')
        .select('id, lesson_id')
        .in('lesson_id', lessonIds);
      const byLesson = new Map<number, number[]>();
      (chals || []).forEach((c: any) => {
        byLesson.set(c.lesson_id, [...(byLesson.get(c.lesson_id) || []), c.id]);
      });
      const allChallengeIds = (chals || []).map((c: any) => c.id);
      const { data: prog } = allChallengeIds.length
        ? await supabaseAdmin
            .from('challenge_progress')
            .select('challenge_id, completed')
            .eq('user_id', userId)
            .in('challenge_id', allChallengeIds)
        : { data: [] as any[] } as any;
      const completedSet = new Set<number>((prog || []).filter((p: any) => !!p.completed).map((p: any) => p.challenge_id));
      lessonIds.forEach((lid) => {
        const cids = byLesson.get(lid) || [];
        const done = cids.length > 0 && cids.every((cid) => completedSet.has(cid));
        completedMap.set(lid, done);
      });
    }
  }

  // Active lesson is the first not completed; if all completed, keep first
  const active = lessons.find((l: any) => !completedMap.get(l.id)) || lessons[0] || null;
  return {
    activeLesson: active,
  } as any;
};

export const getLesson = async (id?: number) => {
  const userId = getUserId();
  const progress = await getUserProgress();
  if (!userId) return null as any;

  let lessonId = id;
  if (!lessonId) {
    if (!progress?.activeCourseId) return null as any;
    const { data: first } = await supabaseAdmin
      .from('lessons')
      .select('id, order')
      .eq('unit_id',
        (
          (await supabaseAdmin
            .from('units')
            .select('id')
            .eq('course_id', progress.activeCourseId)
            .order('order', { ascending: true })
            .limit(1)).data?.[0]?.id || -1
        )
      )
      .order('order', { ascending: true })
      .limit(1);
    lessonId = first?.[0]?.id;
  }
  if (!lessonId) return null as any;

  // Load lesson core
  const { data: lesson, error: lErr } = await supabaseAdmin
    .from('lessons')
    .select('id, title, unit_id, order')
    .eq('id', lessonId)
    .maybeSingle();
  if (lErr || !lesson) return null as any;

  // Load challenges and options; for Idzhar lessons (1..5) we compose from a shared pool
  // to guarantee per-path variations and avoid practice mode carry-over.
  let challenges: any[] | null = null;
  let composedFromPool = false;
  {
    const res = await supabaseAdmin
      .from('challenges')
      .select('id, type, question, order, challenge_options(id, text, correct, image_src, audio_src)')
      .eq('lesson_id', lesson.id)
      .order('order', { ascending: true });
    challenges = res.data || [];
  }

  // Enforce curated 6-question mapping per path for Idzhar lessons (1..5) to avoid
  // duplicating challenge rows while keeping deterministic order. If a lesson has its
  // own challenges and matches expected count, we still use this curated set to ensure
  // consistency as requested.
  const curatedMap: Record<number, number[]> = {
    1: [1001, 1002, 1003, 1004, 1005, 1006],
    2: [1001, 1002, 1005, 1006, 1007, 1008],
    3: [1001, 1002, 1007, 1008, 1009, 1010],
    4: [1001, 1008, 1009, 1010, 1011, 1012],
    5: [1002, 1010, 1011, 1012, 1013, 1014],
  };
  if ([1, 2, 3, 4, 5].includes(lesson.id)) {
    const ids = curatedMap[lesson.id] || [];
    const { data: base } = await supabaseAdmin
      .from('challenges')
      .select('id, type, question, order, challenge_options(id, text, correct, image_src, audio_src)')
      .in('id', ids);
    challenges = (base || []).sort((a: any, b: any) => ids.indexOf(a.id) - ids.indexOf(b.id));
    composedFromPool = true;
  } else if (!challenges || challenges.length === 0) {
    // Non-Idzhar or missing data fallback: load whatever exists by lesson_id
    challenges = [];
  }

  const ids = (challenges || []).map((c: any) => c.id);
  let completedMap = new Map<number, boolean>();
  if (ids.length) {
    const { data: lprog, error: lpErr } = await supabaseAdmin
      .from('lesson_progress' as any)
      .select('lesson_id, completed')
      .eq('user_id', userId)
      .eq('lesson_id', lesson.id);
    if (!lpErr && lprog && lprog.length) {
      // If lesson is completed, challenges completed flags aren't needed by UI anymore
      // but keep them false to avoid partial save semantics.
    } else {
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
      // If this lesson is composed from a shared pool (i.e., challenges aren't owned
      // by this lesson), treat them as not completed to avoid incorrectly entering
      // practice mode when some of these challenges were completed in other lessons.
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

export const isLessonCompleted = async (lessonId: number) => {
  const userId = getUserId();
  if (!userId) return false;
  const { data: lprog, error } = await supabaseAdmin
    .from('lesson_progress' as any)
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  if (!error && lprog) return !!lprog.completed;
  // Fallback: consider completed if all challenges completed
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
  const allDone = (prog || []).filter((p: any) => !!p.completed).length === ids.length;
  return allDone;
};

export const getLessonPercentage = async () => 0;

export const getTopTenUsers = async () => {
  // Without auth, return top by points globally (limit 10)
  const { data, error } = await supabaseAdmin
    .from('user_progress')
    .select('user_id, user_name, user_image_src, points')
    .order('points', { ascending: false })
    .limit(10);
  if (error || !data) return [];
  return data.map((r: any) => ({
    userId: r.user_id,
    userName: r.user_name,
    userImageSrc: r.user_image_src,
    points: r.points,
  }));
};