import type { RefObject } from "react";
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
    learnImages: string[];
    activeLessonRef?: RefObject<HTMLDivElement | null>;
};

export const Unit = ({
    order,
    title,
    description,
    lessons,
    activeLesson,
    activeLessonPercentage,
    learnImages,
    activeLessonRef,
}: Props) => {
    // Choose image from pre-loaded array
    const chosenImage = learnImages.length
        ? learnImages[(order - 1) % learnImages.length]
        : undefined;
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
                        <div
                            key={lesson.id}
                            className="relative flex items-center z-10"
                            ref={isCurrent ? activeLessonRef : undefined}
                        >

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
                {chosenImage && (
                    <img
                        src={chosenImage}
                        alt="unit decoration"
                        width={100}
                        height={100}
                        className={`absolute top-40 ${positionClass} pointer-events-none select-none opacity-90`}
                    />
                )}
            </div>
        </>
    );
};
