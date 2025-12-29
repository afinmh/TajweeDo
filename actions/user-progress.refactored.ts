"use server";

/**
 * REFACTORED: Server actions now use Service layer
 * This provides a clean separation between business logic and UI actions
 */

import { userProgressService } from "@/lib/services/user-progress.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Update or create user progress with new course
 */
export const upsertUserProgress = async (courseId: number) => {
    const result = await userProgressService.upsertUserProgress(courseId);
    
    if (!result.success) {
        throw new Error(result.error || "Failed to update user progress");
    }

    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
};

/**
 * Reduce hearts (when user makes a mistake)
 */
export const reduceHearts = async (lessonId?: number) => {
    // Pass challengeId as 0 for now (can be updated when needed)
    const result = await userProgressService.reduceHearts(0);
    
    if (!result.success) {
        if (result.error === "No hearts remaining") {
            return { error: "hearts" };
        }
        throw new Error(result.error || "Failed to reduce hearts");
    }

    revalidatePath("/shop");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    if (lessonId) revalidatePath(`/lesson/${lessonId}`);
    
    return result.data;
};

/**
 * Refill hearts using points
 */
export const refillHearts = async () => {
    const result = await userProgressService.refillHearts();
    
    if (!result.success) {
        throw new Error(result.error || "Failed to refill hearts");
    }

    revalidatePath("/shop");
    revalidatePath("/learn");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    
    return result.data;
};
