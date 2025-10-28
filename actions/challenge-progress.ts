"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";

export const upsertChallengeProgress = async (challengeId: number) => {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    let userId: string | null = null;
    if (token) {
        try {
            const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);
            userId = payload.userId as string;
        } catch (e) {
            userId = null;
        }
    }

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Fetch current user progress
    const { data: up, error: upErr } = await supabaseAdmin
        .from('user_progress')
        .select('user_id, hearts, points')
        .eq('user_id', userId)
        .maybeSingle();
    if (upErr) {
        throw new Error("Failed to load user progress");
    }
    if (!up) {
        throw new Error("User Progress not found");
    }

    // Fetch challenge
    const { data: ch, error: chErr } = await supabaseAdmin
        .from('challenges')
        .select('id, lesson_id')
        .eq('id', challengeId)
        .maybeSingle();
    if (chErr) {
        throw new Error("Failed to load challenge");
    }
    if (!ch) {
        throw new Error("Challenge not found");
    }

    const lessonId = ch.lesson_id;

    // Check existing challenge_progress
    const { data: existing, error: existingErr } = await supabaseAdmin
        .from('challenge_progress')
        .select('id, completed')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .maybeSingle();
    if (existingErr) {
        throw new Error("Failed to load challenge progress");
    }

    // boolean
    const isPractice = !!existing;

    if (up.hearts === 0 && !isPractice) {
        return { error: "hearts" };
    };

    if (isPractice) {
        await supabaseAdmin
            .from('challenge_progress')
            .update({ completed: true })
            .eq('id', existing!.id);

        await supabaseAdmin
            .from('user_progress')
            .update({
                hearts: Math.min((up.hearts ?? 0) + 1, 5),
                points: (up.points ?? 0) + 10,
            })
            .eq('user_id', userId);

        revalidatePath("/learn");
        revalidatePath("/lesson");
        revalidatePath("/quests");
        revalidatePath("/leaderboard");
        revalidatePath(`/lesson/${lessonId}`);
        return;
    }

    await supabaseAdmin
        .from('challenge_progress')
        .insert({
            challenge_id: challengeId,
            user_id: userId,
            completed: true,
        });

    await supabaseAdmin
        .from('user_progress')
        .update({ points: (up.points ?? 0) + 10 })
        .eq('user_id', userId);

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
};