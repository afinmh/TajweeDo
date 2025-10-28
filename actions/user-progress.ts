"use server";

import { POINTS_TO_REFILL } from "@/constants";
import { getCourseById } from "@/db/queries";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const upsertUserProgress = async (courseId: number) => {
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

    const course = await getCourseById(courseId);

    if (!course) {
        throw new Error("Course not found");
    }

    if(!course.units.length || !course.units[0].lessons.length){
        throw new Error("Course is empty");
    }

    // Get existing progress
    const { data: existing, error: exErr } = await supabaseAdmin
        .from('user_progress')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
    if (exErr) {
        throw new Error("Failed to load user progress");
    }

    // Fetch user profile for defaults
    const { data: prof } = await supabaseAdmin
        .from('users')
        .select('username, profile_image_src')
        .eq('id', userId)
        .maybeSingle();

    const userName = prof?.username || 'User';
    const userImageSrc = prof?.profile_image_src || '/standar.png';

    if (existing) {
        await supabaseAdmin
            .from('user_progress')
            .update({
                active_course_id: courseId,
                user_name: userName,
                user_image_src: userImageSrc,
            })
            .eq('user_id', userId);

        revalidatePath("/courses");
        revalidatePath("/learn");
        redirect("/learn");
    }

    await supabaseAdmin
        .from('user_progress')
        .insert({
            user_id: userId,
            active_course_id: courseId,
            user_name: userName,
            user_image_src: userImageSrc,
        });

    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
};

export const reduceHearts = async (lessonId?: number) => {
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

    // Load current user progress
    const { data: up, error: upErr } = await supabaseAdmin
        .from('user_progress')
        .select('hearts, points, user_id')
        .eq('user_id', userId)
        .maybeSingle();
    if (upErr) {
        throw new Error("Failed to load user progress");
    }
    if (!up) {
        throw new Error("User progress not found");
    }

    // We no longer gate hearts by challenge practice; hearts always reduce unless already zero.

    // No subscription feature; proceed with hearts logic only.

    if ((up.hearts ?? 0) === 0) {
        return { error: "hearts" };
    }

    await supabaseAdmin
        .from('user_progress')
        .update({ hearts: Math.max((up.hearts ?? 0) - 1, 0) })
        .eq('user_id', userId);

    revalidatePath("/shop");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    if (lessonId) revalidatePath(`/lesson/${lessonId}`);
};

export const refillHearts = async () => {
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

    const { data: up, error: upErr } = await supabaseAdmin
        .from('user_progress')
        .select('hearts, points')
        .eq('user_id', userId)
        .maybeSingle();
    if (upErr || !up) {
        throw new Error("User Progress not found");
    }

    if ((up.hearts ?? 0) === 5) {
        throw new Error("Hearts are already full");
    };

    if ((up.points ?? 0) < POINTS_TO_REFILL) {
        throw new Error("Not enough points");
    };

    await supabaseAdmin
        .from('user_progress')
        .update({
            hearts: 5,
            points: (up.points ?? 0) - POINTS_TO_REFILL,
        })
        .eq('user_id', userId);

    revalidatePath("/shop");
    revalidatePath("/learn");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
};