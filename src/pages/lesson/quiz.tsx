"use client";


import { useState, useEffect } from "react";
import Confetti from "react-confetti"
import { useNavigate } from "react-router-dom";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { useAudio, useMount } from "react-use";
import { ResultCard } from "./result-card";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { ExitModal } from "@/components/modals/exit-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
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
    const { open: openPracticeModal } = usePracticeModal();

    useMount(() => {
        if (initialPercentage === 100) {
            openPracticeModal();
        }
    });

    const router = useNavigate();

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

    const [lessonId] = useState(initialLessonId);

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

    const { open: openHeartsModal } = useHeartsModal();

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
            setStatus("correct");
            correctControls.play();
            setPercentage((prev) => prev + 100 / challenges.length);
            // Complete challenge
            fetch('/api/challenge/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challengeId: challenge.id })
            }).catch(() => { });
            return;
        }

        if (!selectedOption) return;

        const correctOption = options.find((option) => option.correct);

        if (!correctOption) {
            return;
        }

        if (correctOption && correctOption.id === selectedOption) {
            // Immediate feedback
            setStatus("correct");
            correctControls.play();
            setPercentage((prev) => prev + 100 / challenges.length);

            fetch('/api/challenge/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challengeId: challenge.id })
            }).catch(() => { });

            if (initialPercentage === 100) {
                setHearts((prev) => Math.min(prev + 1, 5));
            }
        } else {
            // Immediate negative feedback; adjust hearts in background
            setStatus("wrong");
            incorrectControls.play();

            const nextHearts = Math.max(hearts - 1, 0);
            setHearts(nextHearts);

            fetch('/api/user/reduce-hearts', { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    if (data.error === "hearts") {
                        openHeartsModal(true);
                    } else if (data.hearts !== undefined) {
                        setHearts(data.hearts);
                        if (data.hearts === 0) {
                            openHeartsModal(true);
                        }
                    }
                })
                .catch(() => { });

            if (nextHearts === 0) {
                openHeartsModal(true);
            }
        }
    };

    // Listen for hearts refilled event from HeartsModal purchase
    useEffect(() => {
        const handler = () => setHearts(5);
        window.addEventListener('hearts-refilled', handler);
        return () => window.removeEventListener('hearts-refilled', handler);
    }, []);

    if (!challenge) {
        return (
            <div className="flex flex-col h-[100dvh] overflow-hidden">
                {finishAudio}
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={500}
                    tweenDuration={10000}
                    style={{ position: "fixed", top: 0, left: 0, zIndex: 999 }}
                />
                <div className="flex-1 flex flex-col items-center justify-center gap-y-4 lg:gap-y-6 px-6 py-8 text-center max-w-lg mx-auto w-full">
                    <img
                        src="/star.png"
                        alt="finish"
                        height={80}
                        width={80}
                    />
                    <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
                        Great Job! <br />
                        You have completed the lesson.
                    </h1>
                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm lg:max-w-md mx-auto">
                        <ResultCard
                            variant="points"
                            value={challenges.length * 25}
                        />
                        <ResultCard
                            variant="hearts"
                            value={hearts}
                            userSubscription={!!userSubscription}
                        />
                        <div className="col-span-2 w-full">
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
                    onCheck={() => router("/learn")}
                />
            </div>
        )
    };

    const title = challenge.type === "ASSIST" ? "Select the correct meaning" : challenge.question;

    const correctIdsForAll = challenge.type === "SELECT_ALL" ? options.filter(o => o.correct).map(o => o.id) : [];
    const showQuestionBubble = challenge.type === "ASSIST" || options.every((o) => !o.audioSrc);
    const canCheck = challenge.type === "SELECT_ALL" ? (
        selectedIds.length === correctIdsForAll.length && correctIdsForAll.every(id => selectedIds.includes(id))
    ) : !!selectedOption;

    return (
        <div className="flex flex-col h-[100dvh]">
            {incorrectAudio}
            {correctAudio}
            <HeartsModal />
            <ExitModal />
            <PracticeModal />
            <Header
                hearts={hearts}
                percentage={percentage}
                hasActiveSubscription={!!userSubscription}
            />
            <div className="flex-1 overflow-y-auto">
                <div className="min-h-full flex items-center justify-center py-6 px-4">
                    <div className="w-full max-w-[900px] flex flex-col gap-y-8">
                        <h1 className="text-lg lg:text-3xl text-center font-bold text-neutral-700">
                            {title}
                        </h1>
                        <div>
                            {showQuestionBubble ? (
                                <div className="flex flex-col gap-4">
                                    <QuestionBubble question={challenge.question} />
                                    <Challenge
                                        options={options}
                                        onSelect={onSelect}
                                        status={status}
                                        selectedOption={selectedOption}
                                        selectedIds={selectedIds}
                                        disabled={false}
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
                                    disabled={false}
                                    type={challenge.type}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer
                disabled={!canCheck}
                status={status}
                onCheck={onContinue}
                instruction={status === "none" ? (challenge.type === "SELECT_ALL" ? "Pilih Semua" : "Pilih 1 jawaban") : undefined}
            />
        </div>
    );
};