import { getLesson, getUserProgress, isLessonCompleted } from "@/db/queries";
import { redirect } from "next/navigation";
import { Quiz } from "./quiz";

const LessonPage = async () => {
    const lessonData = getLesson();
    const userProgressData = getUserProgress();

    const [
        lesson,
        userProgress
    ] = await Promise.all([
        lessonData,
        userProgressData
    ]);

    if (!lesson || !userProgress) {
        redirect("/learn");
    }

    const initialPercentage = (await isLessonCompleted(lesson.id)) ? 100 : 0;

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