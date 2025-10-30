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

    // Rotate unique images across odd units (1,3,5,...) from public/ganjil
    const ganjilImages = getImagesFrom("ganjil");
    const oddIndex = Math.floor((order - 1) / 2); // 0 for unit 1, 1 for unit 3, etc.
    const chosenOddImage = order % 2 === 1 && ganjilImages.length
        ? ganjilImages[oddIndex % ganjilImages.length]
        : undefined;

    // Rotate unique images across even units (2,4,6,...) from public/genap
    const genapImages = getImagesFrom("genap");
    const evenIndex = Math.floor(order / 2) - 1; // 0 for unit 2, 1 for unit 4, etc.
    const chosenEvenImage = order % 2 === 0 && genapImages.length
        ? genapImages[evenIndex % genapImages.length]
        : undefined;

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
                {/* Decorative image per unit parity (does not interfere with buttons) */}
                {chosenOddImage && (
                    <Image
                        src={chosenOddImage}
                        alt="ganjil decoration"
                        width={100}
                        height={100}
                        className="absolute top-40 right-10 md:right-8 pointer-events-none select-none opacity-90"
                        priority={false}
                    />
                )}
                {chosenEvenImage && (
                    <Image
                        src={chosenEvenImage}
                        alt="genap decoration"
                        width={100}
                        height={100}
                        className="absolute top-40 right-40 md:right-8 pointer-events-none select-none opacity-90"
                        priority={false}
                    />
                )}
            </div>
        </>
    );
};