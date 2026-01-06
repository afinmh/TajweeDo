import { courseRepository } from "@/lib/repositories";
import { userProgressService } from "@/lib/services";
import { redirect } from "next/navigation";
import { List } from "./list";

const CoursesPage = async () => {
    // ✅ Use services and repositories for cleaner data access
    const [courses, userProgress] = await Promise.all([
        courseRepository.findAll(),
        userProgressService.getCurrentUserProgress(),
    ]);

    // ✅ Allow users without progress to access courses page to select their first course
    // User progress will be created when they select a course

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