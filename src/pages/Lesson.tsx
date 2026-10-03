import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Quiz } from "./lesson/quiz";


export default function Lesson() {
    const { lessonId } = useParams();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState<any>(null);
    const [userProgress, setUserProgress] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch user progress
                const progressRes = await fetch("/api/user/progress");
                if (!progressRes.ok) {
                    throw new Error("Failed to load progress");
                }
                const progressData = await progressRes.json();
                setUserProgress(progressData);

                // Fetch lesson
                const lessonUrl = lessonId ? `/api/lessons?id=${lessonId}` : "/api/lessons/active";
                const lessonRes = await fetch(lessonUrl);
                if (!lessonRes.ok) {
                    throw new Error("Failed to load lesson");
                }
                const lessonData = await lessonRes.json();
                setLesson(lessonData);
            } catch (err) {
                console.error(err);
                navigate("/learn");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [lessonId, navigate]);

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center text-slate-500">
                Memuat...
            </div>
        );
    }

    if (!lesson || !userProgress) {
        return null;
    }

    const allDone = (lesson.challenges || []).length > 0 &&
        (lesson.challenges || []).every((c: any) => !!c.completed);
    const initialPercentage = allDone ? 100 : 0;

    return (
        <Quiz
            initialLessonId={lesson.id}
            initialLessonChallenges={lesson.challenges || []}
            initialHearts={userProgress.hearts}
            initialPercentage={initialPercentage}
            userSubscription={false}
        />
    );
}
