import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Header } from "./header";
import { UserProgress } from "@/components/user-progress";
import { userProgressService, courseService } from "@/lib/services";
import { redirect } from "next/navigation";
import NeedCourse from "@/components/need-course";
import { Unit } from "./unit";
import { Quests } from "@/components/quests";
import { AutoScroll } from "./auto-scroll";
import fs from "fs";
import path from "path";

// Helper to read images from public/<subdir>. Safe no-op on missing dir.
const getImagesFrom = (subdir: string): string[] => {
    try {
        const dir = path.join(process.cwd(), "public", subdir);
        const files = fs
            .readdirSync(dir)
            .filter((f) => /\.(png|jpe?g|gif|webp|svg)$/i.test(f));
        return files.map((f) => `/${subdir}/${f}`);
    } catch {
        return [];
    }
};

const LearnPage = async () => {
    // ✅ Use service layer for cleaner code
    const userProgress = await userProgressService.getCurrentUserProgress();

    if (!userProgress || !userProgress.activeCourse) {
        return <NeedCourse />;
    }

    // ✅ Parallel data fetching with services for optimal performance
    const [units, courseProgress, lessonPercentage] = await Promise.all([
        courseService.getUnitsWithProgress(userProgress.activeCourseId!, userProgress.userId),
        courseService.getCourseProgress(userProgress.activeCourseId!, userProgress.userId),
        courseService.getLessonPercentage(),
    ]);

    if (!courseProgress) { 
        return <NeedCourse />; 
    }

    // Pre-load images once in server component
    const learnImages = getImagesFrom("learn");

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                    activeCourse={userProgress.activeCourse}
                    hearts={userProgress.hearts}
                    points={userProgress.points}
                    hasActiveSubscription={false}
                />

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
                            learnImages={learnImages}
                        />
                    </div>
                ))}
            </FeedWrapper>
        </div>
    );
}

export default LearnPage;