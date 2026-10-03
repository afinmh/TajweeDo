import { useKey, useMedia } from "react-use";
import { CheckCircle, XCircle } from "lucide-react"

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
    onCheck: () => void;
    status: "correct" | "wrong" | "none" | "completed";
    disabled?: boolean;
    lessonId?: number;
    instruction?: string; // e.g. Pilih Semua / Pilih 1 jawaban
};

export const Footer = ({
    onCheck,
    status,
    disabled,
    lessonId,
    instruction,
}: Props) => {
    useKey("Enter", onCheck, {}, [onCheck]);
    const isMobile = useMedia("(max-width: 1024px)");

    return (
        <footer className={cn(
            "lg:h-[140px] h-[100px] border-t-2",
            status === "correct" && "border-transparent bg-green-100",
            status === "wrong" && "border-transparent bg-rose-100",
        )}>
            <div className="max-w-[1140px] h-full mx-auto flex items-center justify-center px-6 lg:px-10">
                {status === "none" && instruction && (
                    <div className="text-emerald-600 font-semibold text-base lg:text-2xl flex items-center">
                        {instruction}
                    </div>
                )}
                {status === "correct" && (
                    <div className="text-green-500 font-bold text-base lg:text-2xl flex items-center">
                        <CheckCircle className="h-6 w-6 lg:h-10 lg:w-10 mr-4" />
                        Nicely Done!
                    </div>
                )}
                {status === "wrong" && (
                    <div className="text-rose-500 font-bold text-base lg:text-2xl flex items-center">
                        <XCircle className="h-6 w-6 lg:h-10 lg:w-10 mr-4" />
                        Try Again.
                    </div>
                )}
                {status === "completed" && (
                    <Button
                        variant="secondary"
                        size={isMobile ? "sm" : "lg"}
                        onClick={() => window.location.href = `/lesson/${lessonId}`}
                    >
                        PRACTICE AGAIN
                    </Button>
                )}
                <Button
                    disabled={disabled}
                    className="ml-auto"
                    onClick={onCheck}
                    size={isMobile ? "sm" : "lg"}
                    variant={status === "wrong" ? "danger" : "secondary"}
                >
                    {status === "none" && "CHECK"}
                    {status === "correct" && "NEXT"}
                    {status === "wrong" && "RETRY"}
                    {status === "completed" && "CONTINUE"}
                </Button>
            </div>
        </footer>
    );
};