"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { usePracticeModal } from "@/store/use-practice-modal";

export const PracticeModal = () => {
    const [isClient, setIsClient] = useState(false);
    const { isOpen, close } = usePracticeModal();

    useEffect(() => setIsClient(true), []);

    if (!isClient) {
        return null;
    };

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="w-[min(92vw,480px)] max-w-[480px] p-4 sm:p-6 rounded-lg">
                <DialogHeader>
                    <div className="flex items-center w-full justify-center mb-5">
                        <Image
                            src="/heart.svg"
                            alt="Heart"
                            height={80}
                            width={80}
                            className="w-20 h-20 sm:w-24 sm:h-24"
                        />
                    </div>
                    <DialogTitle className="text-center font-bold text-lg sm:text-2xl">
                        Muroja&apos;ah
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm sm:text-base">
                        Kamu gaakan kehilangan nyawa waktu muroja&apos;ah.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mb-4">
                    <div className="flex flex-col gap-y-4 w-full">
                        <Button
                            variant="primary"
                            className="w-full text-sm sm:text-base py-2 sm:py-3"
                            onClick={close}
                        >
                            Wooke!
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};