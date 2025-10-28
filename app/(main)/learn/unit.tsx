// types moved off Drizzle; using structural types
import Image from "next/image";
import { cn } from "@/lib/utils";
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
    return(
        <>
            <UnitBanner title={title} description={description} lessonId={activeLesson?.id}/>
            <div className="flex items-center flex-col relative">
                {lessons.map((lesson,index)=>{
                    const isCurrent = lesson.id === activeLesson?.id; 
                    const isLocked = !lesson.completed && !isCurrent;

                    return (
                        <div key={lesson.id} className={cn("relative flex items-center", index === 2 && "translate-x-8")}>

                            {/* tree image placed to the left of the 5th lesson (index 4) */}
                            {index === 4 && (
                                <div>
                                    <Image
                                        src="/tree.png"
                                        alt="tree"
                                        width={64}
                                        height={64}
                                        className="w-20 h-auto pointer-events-none select-none translate-y-3 -translate-x-12"
                                    />
                                </div>
                            )}

                            <LessonButton
                                id={lesson.id}
                                index={index}
                                totalCount={lessons.length -1}
                                current={isCurrent}
                                locked={isLocked}
                                percentage={activeLessonPercentage}
                            />

                            {/* park image placed next to the 3rd lesson (index 2) */}
                            {index === 2 && (
                                <div className="ml-0 -mt-4">
                                    <Image
                                        src="/park.png"
                                        alt="park"
                                        width={64}
                                        height={64}
                                        className="w-24 h-auto pointer-events-none select-none translate-y-3"
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </>
    );
};