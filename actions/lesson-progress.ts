"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";

export const completeLesson = async (lessonId: number) => {
  const token = cookies().get("token")?.value;
  let userId: string | null = null;
  if (token) {
    try {
      const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);
      userId = payload.userId as string;
    } catch {
      userId = null;
    }
  }
  if (!userId) throw new Error("Unauthorized");

  // Upsert lesson_progress
  const { data: existing } = await supabaseAdmin
    .from("lesson_progress" as any)
    .select("id, completed")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  let wasCompleted = false;
  if (existing) {
    wasCompleted = !!(existing as any).completed;
    await supabaseAdmin
      .from("lesson_progress" as any)
      .update({ completed: true, updated_at: new Date().toISOString() })
      .eq("id", (existing as any).id);
  } else {
    await supabaseAdmin
      .from("lesson_progress" as any)
      .insert({ user_id: userId, lesson_id: lessonId, completed: true });
  }

  // Award points only the first time a lesson is completed
  if (!wasCompleted) {
    // Determine number of challenges in this lesson
    const { count } = await supabaseAdmin
      .from("challenges")
      .select("id", { count: "exact", head: true })
      .eq("lesson_id", lessonId);

    const challengeCount = typeof count === "number" ? count : 0;
    const addPoints = challengeCount * 25; // 25 points per challenge
    const addXp = challengeCount * 100;    // 100 XP per challenge

    const { data: up } = await supabaseAdmin
      .from("user_progress")
      .select("points, xp")
      .eq("user_id", userId)
      .maybeSingle();

    const newPoints = (up?.points ?? 0) + addPoints;
    const newXp = (up?.xp ?? 0) + addXp;

    await supabaseAdmin
      .from("user_progress")
      .update({ points: newPoints, xp: newXp })
      .eq("user_id", userId);
  }

  revalidatePath("/learn");
  revalidatePath(`/lesson/${lessonId}`);
  revalidatePath("/leaderboard");
  revalidatePath("/quests");
  return { ok: true };
};
