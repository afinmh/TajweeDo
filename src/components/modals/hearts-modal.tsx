import { useNavigate } from "react-router-dom";
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
import { useHeartsModal } from "@/store/use-hearts-modal";


export const HeartsModal = () => {
    const navigate = useNavigate();
    const [isClient, setIsClient] = useState(false);
    const { isOpen, close, broken } = useHeartsModal();
    const [pending, startTransition] = useTransition();
    
    // In lesson page, we don't have outlet context, so we might need to fetch or rely on props
    // Or we can just do a fetch directly when opening modal, but for now we'll fetch
    const [hearts, setHearts] = useState<number>(0);
    const [points, setPoints] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            fetch('/api/user/progress')
                .then(res => res.json())
                .then(data => {
                    setHearts(data.hearts);
                    setPoints(data.points);
                })
                .finally(() => setIsLoading(false));
        }
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
        if (pending || isLoading || hearts === 5 || points < POINTS_TO_REFILL) return;
        
        startTransition(() => {
            (async () => {
                try {
                    const res = await fetch('/api/user/refill-hearts', { method: 'POST' });
                    if (res.ok) {
                        window.dispatchEvent(new CustomEvent('hearts-refilled'));
                        await playMoney();
                        close();
                    }
                } catch (error) {
                    console.error('Failed to refill hearts:', error);
                }
            })();
        });
    };

    const onGoLearn = () => {
        close();
        navigate('/learn');
    };

    if (!isClient) return null;

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
                        <img
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
                            disabled={pending || isLoading || hearts === 5 || points < POINTS_TO_REFILL}
                            onClick={onBuyFullHearts}
                        >
                            {isLoading ? 'Memuat...' : hearts === 5 ? 'Nyawa Penuh' : points < POINTS_TO_REFILL ? 'Poin Kurang' : (
                                <span className="flex items-center gap-2 justify-center">
                                    <img src="/heart.svg" alt="heart" width={28} height={28} />
                                    <img src="/points.svg" alt="points" width={20} height={20} />
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
    );
};
