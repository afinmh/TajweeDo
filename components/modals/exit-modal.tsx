"use client";

import Image from "next/image";;
import { useRouter } from "next/navigation";
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
import { useExitModal } from "@/store/use-exit-modal";

export const ExitModal = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const { isOpen, close } = useExitModal();

    useEffect(() => setIsClient(true), []);

    if (!isClient) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="w-[min(92vw,480px)] max-w-[480px] p-4 sm:p-6 rounded-lg max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <div className="flex items-center w-full justify-center mb-3">
                        <Image
                            src="/back.png"
                            alt="mascot"
                            height={120}
                            width={120}
                            className="w-24 h-24 sm:w-32 sm:h-32"
                        />
                    </div>
                    <DialogTitle className="text-center font-bold text-lg sm:text-2xl">
                        Eh, bentar dulu!
                    </DialogTitle>
                    <DialogDescription className="text-center text-xs sm:text-sm text-muted-foreground">
                        Serius ini mau di tinggalin?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mb-4">
                    <div className="flex flex-col gap-y-4 w-full">
                        <Button
                            variant="primary"
                            className="w-full text-sm sm:text-base py-2 sm:py-3"
                            onClick={close}
                        >
                            Gajadi
                        </Button>
                        <Button
                            variant="dangerOutline"
                            className="w-full text-sm sm:text-base py-2 sm:py-3"
                            onClick={() => {
                                close();
                                router.push("/learn");
                            }}
                        >
                            Tinggalin Aja
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};