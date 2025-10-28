import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";

type Props = {
    title: string;
    id: number;
    imageSrc: string;
    onClick: (id: number) => void;
    disabled?: boolean;
    active?: boolean;
};

export const Card = ({
    title,
    id,
    imageSrc,
    onClick,
    disabled,
    active,
}: Props) => {
    return (
        <div
            onClick={() => onClick(id)}
            className={cn(
                "w-full max-w-[220px] sm:max-w-[260px] border-2 rounded-xl hover:bg-black/5 cursor-pointer active:border-b-2 flex flex-col items-center justify-between p-3 pb-6",
                disabled && "pointer-events-none opacity-50",
                // active state styles: subtle green background and border
                active && "bg-green-50 border-green-200"
            )}
        >
            <div className="w-full flex items-center justify-end">
                {/* no checkmark anymore — selected state is shown via green card background */}
            </div>

            <div className="mt-2 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden drop-shadow-md bg-transparent">
                <Image
                    src={imageSrc}
                    alt={title}
                    height={112}
                    width={112}
                    className="object-contain"
                />
            </div>

            <p className={cn("text-center font-bold mt-3 text-sm sm:text-base", active ? "text-green-700" : "text-neutral-700")}>
                {title}
            </p>
        </div>
    );
};