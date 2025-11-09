"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Check, Crown, Star } from "lucide-react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useHeartsModal } from "@/store/use-hearts-modal";

import "react-circular-progressbar/dist/styles.css";

type Props = {
    id: number;
    index: number;
    totalCount: number;
    locked?: boolean;
    current?: boolean;
    percentage: number;
    // Control overall horizontal bend direction for the zigzag path.
    // 'left' keeps the original behavior (default). 'right' mirrors the path.
    bend?: "left" | "right";
    // Optional DOM id to assign to the wrapper when this is the current/active lesson
    anchorId?: string;
};

export const LessonButton = ({
    id,
    index,
    totalCount,
    locked,
    current,
    percentage,
    bend = "left",
    anchorId,
}: Props) => {
    const router = useRouter();
    const { openBroken } = useHeartsModal();
    const cycleLength = 8;
    const cycleIndex = index % cycleLength;
    // Fine-tuned indentation pattern so item at index 2 (the 3rd dot) is less far to the left
    // Old pattern was [0,1,2,1,0,-1,-2,-1]
    // New pattern tweaks the 3rd value from 2 -> 1.6
    const indentPattern = [0, 1, 1.6, 1, 0, -1, -2, -1] as const;
    const indentationLevel = indentPattern[cycleIndex];

    // Mirror horizontally when bend is set to 'right'
    const directionMultiplier = bend === "left" ? 1 : -1;
    const rightPosition = indentationLevel * 50 * directionMultiplier;

    const isFirst = index === 0;
    const isLast = index === totalCount;
    const isCompleted = !current && !locked;

    const Icon = isCompleted ? Check : isLast ? Crown : Star;

    // Always navigate to the specific lesson page
    const href = `/lesson/${id}`;

    useEffect(() => {
        if (current) {
            try { router.prefetch?.(href); } catch {}
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, href]);

    return (
        <Link
            href={href}
            prefetch
            onMouseEnter={() => router.prefetch?.(href)}
            onTouchStart={() => router.prefetch?.(href)}
            aria-disabled={locked}
            style={{ pointerEvents: locked ? "none" : "auto" }}
            onClick={async (e) => {
                if (locked) return;
                // If lesson already completed (practice mode), skip hearts gating
                const isCompleted = !current && !locked;
                if (isCompleted) return; // allow normal navigation to practice
                // Check hearts before navigating
                try {
                    const res = await fetch('/api/user-progress', { cache: 'no-store' });
                    const data = await res.json().catch(() => ({}));
                    const hearts = Number(data?.hearts ?? 0);
                    if (Number.isFinite(hearts) && hearts <= 0) {
                        e.preventDefault();
                        openBroken();
                        return;
                    }
                    // else allow default navigation
                } catch {
                    // if check fails, allow navigation rather than blocking
                }
            }}
        >
            <div
                className="relative"
                id={current && anchorId ? anchorId : undefined}
                style={{
                    right: `${rightPosition}px`,
                    marginTop: isFirst && !isCompleted ? 60 : 24,
                }}
            >
                {current ? (
                    <div className="h-[102px] w-[102px] relative">
                        <div className="absolute -top-6 left-2.5 px-3 py-2.5 border-2 font-bold uppercase text-green-500 bg-white rounded-xl animate-bounce tracking-wide z-10">
                            Start
                            <div
                                className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-x-1/2"
                            />
                        </div>
                        <CircularProgressbarWithChildren
                            value={Number.isNaN(percentage) ? 0 : percentage}
                            styles={{
                                path: {
                                    stroke: "#4ade80",
                                },
                                trail: {
                                    stroke: "#e5e7eb"
                                }
                            }}
                        >
                            <Button
                                size="rounded"
                                variant={locked ? "locked" : "secondary"}
                                className="h-[70px] w-[70px] border-b-8"
                            >
                                <Icon 
                                    className={cn(
                                        'h-10 w-10',
                                        locked 
                                        ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                                        : "fill-primary-foreground text-primary-foreground",
                                        isCompleted && "fill-none stroke-[4]"
                                    )}
                                />
                            </Button>
                        </CircularProgressbarWithChildren>
                    </div>
                ) : (
                    <Button
                                size="rounded"
                                variant={locked ? "locked" : "secondary"}
                                className="h-[70px] w-[70px] border-b-8"
                            >
                                <Icon 
                                    className={cn(
                                        'h-10 w-10',
                                        locked 
                                        ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                                        : "fill-primary-foreground text-primary-foreground",
                                        isCompleted && "fill-none stroke-[4]"
                                    )}
                                />
                            </Button>
                )}
            </div>
        </Link>
    );
};