"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { POINTS_TO_REFILL } from "@/constants";
import { refillHearts } from "@/actions/user-progress";
import { useHeartsModal } from "@/store/use-hearts-modal";

export const HeartsModal = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const { isOpen, close, broken } = useHeartsModal();
    const [pending, startTransition] = useTransition();
    const [hearts, setHearts] = useState<number>(0);
    const [points, setPoints] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => setIsClient(true), []);

    // Load user progress (hearts & points) when modal opens
    useEffect(() => {
        if (!isOpen) return;
        (async () => {
            try {
                const res = await fetch('/api/user-progress', { cache: 'no-store' });
                const data = await res.json().catch(() => ({}));
                setHearts(data.hearts ?? 0);
                setPoints(data.points ?? 0);
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        })();
    }, [isOpen]);

    const playMoney = async () => {
        try {
            const a = new Audio('/audio/money.mp3');
            await a.play().catch(() => {});
            await new Promise<void>((resolve) => {
                const done = () => resolve();
                a.addEventListener('ended', done, { once: true });
                setTimeout(done, 5000);
            });
        } catch {}
    };

    const onBuyFullHearts = () => {
        if (pending) return;
        if (hearts === 5) return;
        if (points < POINTS_TO_REFILL) return;
        startTransition(() => {
            (async () => {
                try {
                    await refillHearts();
                    // Update local hearts immediately
                    setHearts(5);
                    // Notify lesson quiz to update hearts
                    window.dispatchEvent(new CustomEvent('hearts-refilled'));
                    // Play cash sound before closing
                    await playMoney();
                    close(); // Stay on lesson (do not redirect)
                } catch {
                    // swallow
                }
            })();
        });
    };

    const onGoLearn = () => {
        close();
        router.push('/learn');
    };

    if (!isClient) {
        return null;
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent
            hideClose
            onEscapeKeyDown={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            className="w-[min(92vw,480px)] max-w-[480px] p-4 sm:p-6 rounded-lg"
        >
                <DialogHeader>
                    <div className="flex items-center w-full justify-center mb-5">
                        <Image
                            src={broken ? "/broken.png" : "/heart.svg"}
                            alt="heart broken"
                            height={96}
                            width={96}
                            className="w-20 h-20 sm:w-24 sm:h-24"
                        />
                    </div>
                    <DialogTitle className="text-center font-bold text-lg sm:text-2xl">
                        {broken ? "Nyawa kamu habis!" : "Isi Ulang Nyawa"}
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm sm:text-base">
                        Isi ulang penuh dengan {POINTS_TO_REFILL} poin untuk lanjutkan materi, atau kembali ke halaman belajar.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mb-4">
                    <div className="flex flex-col gap-y-4 w-full">
                        <Button
                            variant="primary"
                            className="w-full text-sm sm:text-base py-2 sm:py-3"
                            disabled={pending || loading || hearts === 5 || points < POINTS_TO_REFILL}
                            onClick={onBuyFullHearts}
                        >
                            {loading ? 'Memuat...' : hearts === 5 ? 'Nyawa Penuh' : points < POINTS_TO_REFILL ? 'Poin Kurang' : (
                                <span className="flex items-center gap-2 justify-center">
                                    <Image src="/heart.svg" alt="heart" width={28} height={28} />
                                    <Image src="/points.svg" alt="points" width={20} height={20} />
                                    <span>{POINTS_TO_REFILL}</span>
                                    <span className="font-semibold">Isi Ulang Penuh</span>
                                </span>
                            )}
                        </Button>
                        <Button
                            variant="primaryOutline"
                            className="w-full text-sm sm:text-base py-2 sm:py-3"
                            onClick={onGoLearn}
                        >
                            Kembali ke Learn
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};