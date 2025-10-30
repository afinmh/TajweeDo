import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Header } from "./header";
import { UserProgress } from "@/components/user-progress";
import {
    getCourseProgress,
    getLessonPercentage,
    getUnits,
    getUserProgress
} from "@/db/queries";
import { redirect } from "next/navigation";
import NeedCourse from "@/components/need-course";
import { Unit } from "./unit";
// types moved off Drizzle; using structural types
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { AutoScroll } from "./auto-scroll";

const LearnPage = async () => {

    const userProgress = await getUserProgress();

    // if no check we will need ? for typeof as well as where there is userProgress.active etc.
    if (!userProgress || !userProgress.activeCourse) {
        // show a friendly warning instead of a hard redirect
        return <NeedCourse />;
    }

    // Fetch units and courseProgress using known context to avoid duplicate DB calls
    const [units, courseProgress, lessonPercentage] = await Promise.all([
        getUnits({ userId: userProgress.userId as any, activeCourseId: userProgress.activeCourseId as any }),
        getCourseProgress({ userId: userProgress.userId as any, activeCourseId: userProgress.activeCourseId as any }),
        getLessonPercentage(),
    ]);

    if (!courseProgress) { return <NeedCourse />; }

    const isPro = false;

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                    activeCourse={userProgress.activeCourse}
                    hearts={userProgress.hearts}
                    points={userProgress.points}
                    hasActiveSubscription={isPro}
                />
                
                {!isPro && (
                    <Promo />
                )}

                <Quests points={userProgress.points}/>

            </StickyWrapper>
            <FeedWrapper>
                <Header title={userProgress.activeCourse.title} />
                {/* Auto-scroll to the currently active lesson button when landing on Learn */}
                <AutoScroll targetId="active-lesson" />
                {units.map((unit) => (
                    <div key={unit.id} className="mb-10">
                        <Unit
                            id={unit.id}
                            order={unit.order}
                            description={unit.description}
                            title={unit.title}
                            lessons={unit.lessons}
                            activeLesson={courseProgress?.activeLesson as any}
                            activeLessonPercentage={lessonPercentage}
                        />
                    </div>
                ))}
            </FeedWrapper>
        </div>
    );
}

export default LearnPage;