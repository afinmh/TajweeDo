// types moved off Drizzle; using structural types
import Image from "next/image";
import fs from "fs";
import path from "path";
import { UnitBanner } from "./unit-banner";
import { LessonButton } from "./lesson-button";

type Props = {
    id: number;
    order: number;
    title: string;
    description: string;
    lessons: (any & {
        completed: boolean;
    })[];
    activeLesson: any | undefined;
    activeLessonPercentage: number;
};

export const Unit = ({
    id,
    order,
    title,
    description,
    lessons,
    activeLesson,
    activeLessonPercentage,
}: Props)=>{
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

    // Single image pool from public/learn
    const learnImages = getImagesFrom("learn");
    const chosenImage = learnImages.length
        ? learnImages[(order - 1) % learnImages.length]
        : undefined;
    // Position class: odd (ganjil) -> right, even (genap) -> left
    const positionClass = order % 2 === 1
        ? "right-10 md:right-8"
        : "left-10 md:left-8";

    return(
        <>
            <UnitBanner title={title} description={description} lessonId={activeLesson?.id}/>
            <div className="flex items-center flex-col relative">
                {lessons.map((lesson,index)=>{
                    const isCurrent = lesson.id === activeLesson?.id; 
                    const isLocked = !lesson.completed && !isCurrent;
                    const bend = (order % 2 === 0 ? "right" : "left") as "left" | "right";

                    return (
                        <div key={lesson.id} className="relative flex items-center z-10">

                            <LessonButton
                                id={lesson.id}
                                index={index}
                                totalCount={lessons.length -1}
                                current={isCurrent}
                                locked={isLocked}
                                percentage={activeLessonPercentage}
                                bend={bend}
                                anchorId="active-lesson"
                            />
                        </div>
                    )
                })}
                {/* Decorative image from learn folder; parity controls side */}
                {chosenImage && (
                    <Image
                        src={chosenImage}
                        alt="unit decoration"
                        width={100}
                        height={100}
                        className={`absolute top-40 ${positionClass} pointer-events-none select-none opacity-90`}
                        priority={false}
                    />
                )}
            </div>
        </>
    );
};