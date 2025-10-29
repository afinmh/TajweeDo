import { getLesson, getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";
import { Quiz } from "./quiz";

const LessonPage = async () => {
    const userProgress = await getUserProgress();
    const lesson = await getLesson(undefined, { userId: userProgress?.userId as any, activeCourseId: userProgress?.activeCourseId as any });

    if (!lesson || !userProgress) {
        redirect("/learn");
    }
    // Compute initial completion client-friendly: if all challenges are completed mark 100, else 0
    const allDone = (lesson.challenges || []).length > 0 && (lesson.challenges || []).every((c: any) => !!c.completed);
    const initialPercentage = allDone ? 100 : 0;

    return (
        <Quiz
            initialLessonId={lesson.id}
            initialLessonChallenges={lesson.challenges}
            initialHearts={userProgress.hearts}
            initialPercentage={initialPercentage}
            userSubscription={false}
        />
    );
}

export default LessonPage;