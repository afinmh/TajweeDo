// types moved off Drizzle
import { cn } from "@/lib/utils";
import { Card } from "./card";

type Props = {
    options: Array<{ id: number; text: string | null; imageSrc: string | null; audioSrc: string | null; correct: boolean }>;
    onSelect: (id: number) => void;
    status: "correct" | "wrong" | "none";
    selectedOption?: number;
    selectedIds?: number[]; // for SELECT_ALL multi-select
    disabled?: boolean;
    type: "SELECT" | "ASSIST" | "SELECT_ALL";
    bubbleLayout?: boolean; // when true, stack options 1-per-row and render as bubbles
};

export const Challenge = ({
    options,
    onSelect,
    status,
    selectedOption,
    disabled,
    type,
    selectedIds,
    bubbleLayout = false,
}: Props) => {
    return (
        <div className={cn(
            "grid gap-2",
            (type === "ASSIST" || bubbleLayout) && "grid-cols-1",
            !bubbleLayout && (type === "SELECT" || type === "SELECT_ALL") && "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
        )}>
            {options.map((option, i) => (
                <Card
                    key={option.id}
                    id={option.id}
                    text={option.text ?? ""}
                    imageSrc={option.imageSrc}
                    shortcut={`${i + 1}`}
                    selected={type === "SELECT_ALL" ? !!selectedIds?.includes(option.id) : selectedOption === option.id}
                    onClick={() => onSelect(option.id)}
                    status={status}
                    audioSrc={option.audioSrc}
                    disabled={disabled}
                    type={type === "SELECT_ALL" ? "SELECT" : type}
                    // In bubble layout we use chat-bubble style and no large Arabic tile.
                    // Otherwise keep previous behavior: SELECT/SELECT_ALL large, ASSIST normal.
                    showShortcut={type === "ASSIST"}
                    large={!bubbleLayout && type !== "ASSIST"}
                    bubble={bubbleLayout}
                />
            ))}
        </div>
    )
}