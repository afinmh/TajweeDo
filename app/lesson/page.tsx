import { getLesson } from "@/db/queries";
import { userProgressService } from "@/lib/services";
import { redirect } from "next/navigation";
import { Quiz } from "./quiz";

const LessonPage = async () => {
    // ✅ Use service for user progress
    const userProgress = await userProgressService.getCurrentUserProgress();
    
    if (!userProgress) {
        redirect("/learn");
    }

    // Note: getLesson has custom curated challenge mapping logic, keep for now
    const lesson = await getLesson(undefined, { 
        userId: userProgress.userId, 
        activeCourseId: userProgress.activeCourseId as any 
    });

    if (!lesson) {
        redirect("/learn");
    }

    // ✅ Calculate completion percentage
    const allDone = (lesson.challenges || []).length > 0 && 
                    (lesson.challenges || []).every((c: any) => !!c.completed);
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