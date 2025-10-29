"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";
import Confetti from "react-confetti"
import { reduceHearts } from "@/actions/user-progress";
import { completeLesson } from "@/actions/lesson-progress";

import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Challenge } from "./challenge";
// Card imported previously for side-by-side bubble; no longer needed here
import { Footer } from "./footer";
import { useAudio, useWindowSize, useMount } from "react-use";
import Image from "next/image";
import { ResultCard } from "./result-card";
import { useRouter } from "next/navigation";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { usePracticeModal } from "@/store/use-practice-modal";

type Props = {
    initialPercentage: number;
    initialHearts: number;
    initialLessonId: number;
    initialLessonChallenges: ({
        id: number;
        type: "SELECT" | "ASSIST" | "SELECT_ALL";
        question: string;
        order: number;
        completed: boolean;
        challengeOptions: Array<{
            id: number;
            text: string;
            correct: boolean;
            imageSrc: string | null;
            audioSrc: string | null;
        }>;
    })[];
    userSubscription: boolean | null;
};


export const Quiz = ({
    initialPercentage,
    initialHearts,
    initialLessonId,
    initialLessonChallenges,
    userSubscription,
}: Props) => {
    const { open: openHeartsModal } = useHeartsModal();
    const { open: openPracticeModal } = usePracticeModal();

    useMount(() => {
        if (initialPercentage === 100) {
            openPracticeModal();
        }
    });

    const { width, height } = useWindowSize();

    const router = useRouter();

    const [finishAudio] = useAudio({ src: "/audio/finish.mp3", autoPlay: true });
    const [
        correctAudio,
        _c,
        correctControls,
    ] = useAudio({ src: "/audio/correct.wav" });

    const [
        incorrectAudio,
        _i,
        incorrectControls,
    ] = useAudio({ src: "/audio/incorrect.wav" });

    const [pending, startTransition] = useTransition();

    const [lessonId, setLessonId] = useState(initialLessonId);

    const [hearts, setHearts] = useState(initialHearts);
    const [percentage, setPercentage] = useState(() => {
        return initialPercentage === 100 ? 0 : initialPercentage
    });
    const [challenges] = useState(initialLessonChallenges);
    const [activeIndex, setActiveIndex] = useState(() => {
        const uncompletedIndex = challenges.findIndex((challenge) => !challenge.completed)
        // load first else the uncompleted
        return uncompletedIndex === -1 ? 0 : uncompletedIndex;
    });

    const [selectedOption, setSelectedOption] = useState<number>();
    const [selectedIds, setSelectedIds] = useState<number[]>([]); // for SELECT_ALL
    const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");

    // from state
    const challenge = challenges[activeIndex];
    const options = challenge?.challengeOptions ?? [];

    const onNext = () => {
        setActiveIndex((current) => current + 1);
    };

    const onSelect = (id: number) => {
        if (status !== "none") return;
        if (challenge.type === "SELECT_ALL") {
            setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
            return;
        }
        setSelectedOption(id);
    };

    const onContinue = () => {
        // unified next/reset behavior first
        if (status === "wrong") {
            setStatus("none");
            setSelectedOption(undefined);
            setSelectedIds([]);
            return;
        }

        if (status === "correct") {
            onNext();
            setStatus("none");
            setSelectedOption(undefined);
            setSelectedIds([]);
            return;
        }

        // SELECT_ALL path: once all correct selected, it is correct
        if (challenge.type === "SELECT_ALL") {
            const correctIds = options.filter(o => o.correct).map(o => o.id).sort();
            const chosen = [...selectedIds].sort();
            const isAll = correctIds.length === chosen.length && correctIds.every((v, i) => v === chosen[i]);
            if (!isAll) return;
            // Immediate feedback: update UI now, side effects in background
            const isLast = activeIndex >= challenges.length - 1;
            setStatus("correct");
            correctControls.play();
            setPercentage((prev) => prev + 100 / challenges.length);
            if (isLast) {
                // fire and forget
                void completeLesson(lessonId).catch(() => {});
            }
            return;
        }

        if (!selectedOption) return;

    const correctOption = options.find((option) => option.correct);

        if (!correctOption) {
            return;
        }

        if (correctOption && correctOption.id === selectedOption) {
            // Immediate feedback
            const isLast = activeIndex >= challenges.length - 1;
            setStatus("correct");
            correctControls.play();
            setPercentage((prev) => prev + 100 / challenges.length);
            if (isLast) {
                void completeLesson(lessonId).catch(() => {});
            }
            if (initialPercentage === 100) {
                setHearts((prev) => Math.min(prev + 1, 5));
            }
        } else {
            // Immediate negative feedback; adjust hearts in background
            setStatus("wrong");
            incorrectControls.play();
            reduceHearts(lessonId)
                .then((response) => {
                    if (response?.error === "hearts") {
                        openHeartsModal();
                        return;
                    }
                    if (!response?.error) {
                        setHearts((prev) => Math.max(prev - 1, 0));
                    }
                })
                .catch(() => toast.error("Something went wrong. Please try again."));
        }
    };

    if (!challenge) {
        return (
            <>
                {finishAudio}
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={500}
                    tweenDuration={10000}
                />
                <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
                    <Image
                        src="/star.png"
                        alt="finish"
                        className="hidden lg:block"
                        height={100}
                        width={100}
                    />
                    <Image
                        src="/star.png"
                        alt="finish"
                        className="block lg:hidden"
                        height={100}
                        width={100}
                    />
                    <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
                        Great Job! <br />
                        You have completed the lesson.
                    </h1>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <ResultCard
                            variant="points"
                            value={challenges.length * 25}
                        />
                        <ResultCard
                            variant="hearts"
                            value={hearts}
                            userSubscription={!!userSubscription}
                        />
                        <div className="col-span-2 justify-self-center w-full max-w-[280px]">
                            <ResultCard
                                variant="xp"
                                value={challenges.length * 100}
                            />
                        </div>
                    </div>
                </div>
                <Footer
                    lessonId={lessonId}
                    status="completed"
                    onCheck={() => router.push("/learn")}
                />
            </>
        )
    };

    const title = challenge.type === "ASSIST" ? "Select the correct meaning" : challenge.question;

    const correctIdsForAll = challenge.type === "SELECT_ALL" ? options.filter(o => o.correct).map(o => o.id) : [];
    const showQuestionBubble = challenge.type === "ASSIST" || options.every((o) => !o.audioSrc);
    const canCheck = challenge.type === "SELECT_ALL" ? (
        selectedIds.length === correctIdsForAll.length && correctIdsForAll.every(id => selectedIds.includes(id))
    ) : !!selectedOption;

    return (

        <>
            {incorrectAudio}
            {correctAudio}
            <Header
                hearts={hearts}
                percentage={percentage}
                hasActiveSubscription={!!userSubscription}
            />
            <div className="flex-1">
                <div className="h-full flex items-center justify-center">
                    <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
                        <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
                            {title}
                        </h1>
                        <div className="max-h-[52vh] overflow-y-auto no-scrollbar pb-4 pr-1">
                            {showQuestionBubble ? (
                                <div className="flex flex-col gap-4">
                                    <QuestionBubble question={challenge.question} />
                                    <Challenge
                                        options={options}
                                        onSelect={onSelect}
                                        status={status}
                                        selectedOption={selectedOption}
                                        selectedIds={selectedIds}
                                        disabled={pending}
                                        type={challenge.type}
                                        bubbleLayout
                                    />
                                </div>
                            ) : (
                                <Challenge
                                    options={options}
                                    onSelect={onSelect}
                                    status={status}
                                    selectedOption={selectedOption}
                                    selectedIds={selectedIds}
                                    disabled={pending}
                                    type={challenge.type}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer
                disabled={pending || !canCheck}
                status={status}
                onCheck={onContinue}
            />
        </>
    );
};