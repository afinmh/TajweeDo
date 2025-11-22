import { getCourses, getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";

import { List } from "./list";

const CoursesPage = async () => {

    const coursesData = getCourses();
    const userProgressData = getUserProgress();

    // Promise helps with waterfall (best practice)
    const [
        courses,
        userProgress,
    ] = await Promise.all([
        coursesData,
        userProgressData,
    ]);

    if (!userProgress) {
        redirect('/');
    }
    return (
    <div className="h-full max-w-[912px] px-4 sm:px-6 mx-auto pt-[10px] lg:pt-0 lg:pb-0 no-scrollbar">
            <h1 className="text-2xl font-bold text-neutral-700">
                Materi Pembelajaran
            </h1>
            <List
                courses={courses}
                activeCourseId={userProgress?.activeCourseId}
            />
        </div>
    );
}

export default CoursesPage;