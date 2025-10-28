import { cn } from "@/lib/utils";
// types moved off Drizzle
import Image from "next/image";
import { useCallback } from "react";
import { useAudio, useKey } from "react-use";

type Props = {
    id: number;
    imageSrc: string | null;
    audioSrc: string | null;
    text: string;
    shortcut: string;
    selected?: boolean;
    onClick: () => void;
    disabled?: boolean;
    status?: "correct" | "wrong" | "none";
    type: "SELECT" | "ASSIST";
    showShortcut?: boolean; // hide number circle (e.g., for SELECT_ALL)
    large?: boolean; // larger box & text (e.g., for SELECT_ALL)
    bubble?: boolean; // render as chat bubble style with tail
}

export const Card = ({
    id,
    imageSrc,
    audioSrc,
    text,
    shortcut,
    selected,
    onClick,
    disabled,
    status,
    type,
    showShortcut = true,
    large = false,
    bubble = false,
}: Props) => {
    // don't need second argument (HTML Media state)
    const [audio, _, controls] = useAudio({ src: audioSrc || "" });

    const handleClick = useCallback(() => {
        if (disabled) return;

        controls.play();
        onClick();
    }, [disabled, onClick, controls]);

    useKey(shortcut, handleClick, {}, [handleClick]);

    return (
        <div
            onClick={handleClick}
            className={cn(
                "h-full border-2 border-b-4 hover:bg-black/5 cursor-pointer active:border-b-2 relative",
                bubble ? "rounded-2xl" : "rounded-xl",
                large ? "p-5 lg:p-7 min-h-[90px]" : "p-4 lg:p-6",
                selected && "border-sky-300 bg-sky-100 hover:bg-sky-100",
                selected && status === "correct" && "border-green-300 bg-green-100 hover:bg-green-100",
                selected && status === "wrong" && "border-rose-300 bg-rose-100 hover:bg-rose-100",
                disabled && "pointer-events-none hover:bg-white",
                type === "ASSIST" && "lg:p-3 w-full"
            )}
        >
            {audio}
            {bubble && (
                <div className="absolute -left-3 top-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-y-1/2 rotate-90" />
            )}
            {imageSrc && !large && (
                <div
                    className="relative aspect-square mb-4 max-h-[80px] lg:max-h-[150px] w-full"
                >
                    <Image
                        src={imageSrc}
                        fill
                        alt={text}
                    />
                </div>
            )}
            <div className={cn(
                "flex items-center",
                large ? "justify-center" : "justify-between",
                type === "ASSIST" && !large && "flex-row-reverse",
            )}>
                {type === "ASSIST" && <div />}
                <p className={cn(
                    "text-neutral-600",
                    large ? "text-2xl lg:text-3xl leading-relaxed text-center" : "text-sm lg:text-base",
                    selected && "text-sky-500",
                    selected && status === "correct" && "text-green-500",
                    selected && status === "wrong" && "text-rose-500",
                )}>
                    {text}
                </p>
                {showShortcut && (
                <div className={cn(
                    "lg:w-[30px] lg:h-[30px] w-[20px] h-[20px] border-2 flex items-center justify-center rounded-lg text-neutral-400 lg:text-[15px] text-xs font-semibold",
                    selected && "border-sky-300 text-sky-500",
                    selected && status === "correct" && "border-green-500 text-green-500",
                    selected && status === "wrong" && "border-rose-500 text-rose-500",
                )}>
                    {shortcut}
                </div>
                )}
            </div>
        </div>
    );
};